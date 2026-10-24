#!/usr/bin/env python3
"""Upload an ordered screenshot folder to one App Store version localization."""

from __future__ import annotations

import argparse
import base64
import json
import ssl
import time
import urllib.error
import urllib.request
from pathlib import Path

import certifi
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature


API_ROOT = "https://api.appstoreconnect.apple.com/v1"


def base64url(value: bytes) -> bytes:
    return base64.urlsafe_b64encode(value).rstrip(b"=")


def create_token(key_id: str, issuer_id: str, key_path: Path) -> str:
    now = int(time.time())
    header = base64url(
        json.dumps(
            {"alg": "ES256", "kid": key_id, "typ": "JWT"},
            separators=(",", ":"),
        ).encode()
    )
    payload = base64url(
        json.dumps(
            {
                "iss": issuer_id,
                "iat": now,
                "exp": now + 1200,
                "aud": "appstoreconnect-v1",
            },
            separators=(",", ":"),
        ).encode()
    )
    private_key = serialization.load_pem_private_key(
        key_path.read_bytes(), password=None
    )
    der_signature = private_key.sign(
        header + b"." + payload, ec.ECDSA(hashes.SHA256())
    )
    r, s = decode_dss_signature(der_signature)
    signature = base64url(r.to_bytes(32, "big") + s.to_bytes(32, "big"))
    return (header + b"." + payload + b"." + signature).decode()


class AppStoreConnect:
    def __init__(self, token: str) -> None:
        self.token = token
        self.context = ssl.create_default_context(cafile=certifi.where())

    def request(
        self,
        method: str,
        path_or_url: str,
        body: dict | None = None,
        headers: dict[str, str] | None = None,
        raw_body: bytes | None = None,
    ) -> dict:
        url = (
            path_or_url
            if path_or_url.startswith("https://")
            else API_ROOT + path_or_url
        )
        request_headers = dict(headers or {})
        if not path_or_url.startswith("https://"):
            request_headers["Authorization"] = f"Bearer {self.token}"
        data = raw_body
        if body is not None:
            data = json.dumps(body).encode()
            request_headers["Content-Type"] = "application/json"
        request = urllib.request.Request(
            url, data=data, method=method, headers=request_headers
        )
        try:
            with urllib.request.urlopen(request, context=self.context) as response:
                if response.status == 204:
                    return {}
                payload = response.read()
                return json.loads(payload) if payload else {}
        except urllib.error.HTTPError as error:
            details = error.read().decode(errors="replace")
            raise RuntimeError(f"{method} {url} failed ({error.status}): {details}") from error


def relationship(resource_type: str, resource_id: str) -> dict:
    return {"data": {"type": resource_type, "id": resource_id}}


def find_version(client: AppStoreConnect, app_id: str, version: str) -> str:
    result = client.request(
        "GET",
        f"/apps/{app_id}/appStoreVersions"
        f"?filter[platform]=IOS&filter[versionString]={version}&limit=1",
    )
    if not result.get("data"):
        raise RuntimeError(f"App Store version {version} was not found.")
    return result["data"][0]["id"]


def find_localization(
    client: AppStoreConnect, version_id: str, locale: str
) -> str:
    result = client.request(
        "GET",
        f"/appStoreVersions/{version_id}/appStoreVersionLocalizations?limit=50",
    )
    for item in result.get("data", []):
        if item["attributes"].get("locale") == locale:
            return item["id"]
    raise RuntimeError(f"Localization {locale} was not found.")


def get_or_create_set(
    client: AppStoreConnect,
    localization_id: str,
    display_type: str,
    replace: bool,
) -> str:
    result = client.request(
        "GET",
        f"/appStoreVersionLocalizations/{localization_id}/appScreenshotSets?limit=50",
    )
    for item in result.get("data", []):
        if item["attributes"].get("screenshotDisplayType") == display_type:
            screenshots = client.request(
                "GET",
                f"/appScreenshotSets/{item['id']}/appScreenshots?limit=50",
            )
            if screenshots.get("data"):
                if not replace:
                    raise RuntimeError(
                        f"The {display_type} screenshot set already contains assets."
                    )
                for screenshot in screenshots["data"]:
                    client.request(
                        "DELETE", f"/appScreenshots/{screenshot['id']}"
                    )
            return item["id"]

    result = client.request(
        "POST",
        "/appScreenshotSets",
        {
            "data": {
                "type": "appScreenshotSets",
                "attributes": {"screenshotDisplayType": display_type},
                "relationships": {
                    "appStoreVersionLocalization": relationship(
                        "appStoreVersionLocalizations", localization_id
                    )
                },
            }
        },
    )
    return result["data"]["id"]


def upload_screenshot(
    client: AppStoreConnect, screenshot_set_id: str, image_path: Path
) -> str:
    size = image_path.stat().st_size
    reservation = client.request(
        "POST",
        "/appScreenshots",
        {
            "data": {
                "type": "appScreenshots",
                "attributes": {"fileName": image_path.name, "fileSize": size},
                "relationships": {
                    "appScreenshotSet": relationship(
                        "appScreenshotSets", screenshot_set_id
                    )
                },
            }
        },
    )
    screenshot = reservation["data"]
    image = image_path.read_bytes()
    for operation in screenshot["attributes"]["uploadOperations"]:
        offset = operation["offset"]
        length = operation["length"]
        upload_headers = {
            item["name"]: item["value"]
            for item in operation.get("requestHeaders", [])
        }
        client.request(
            operation["method"],
            operation["url"],
            headers=upload_headers,
            raw_body=image[offset : offset + length],
        )

    client.request(
        "PATCH",
        f"/appScreenshots/{screenshot['id']}",
        {
            "data": {
                "type": "appScreenshots",
                "id": screenshot["id"],
                "attributes": {"uploaded": True},
            }
        },
    )
    return screenshot["id"]


def wait_until_complete(client: AppStoreConnect, screenshot_id: str) -> None:
    for _ in range(60):
        result = client.request("GET", f"/appScreenshots/{screenshot_id}")
        delivery = result["data"]["attributes"].get("assetDeliveryState") or {}
        state = delivery.get("state")
        if state == "COMPLETE":
            return
        if state == "FAILED":
            raise RuntimeError(
                f"Screenshot {screenshot_id} failed: {delivery.get('errors')}"
            )
        time.sleep(2)
    raise RuntimeError(f"Screenshot {screenshot_id} did not finish processing.")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--app-id", required=True)
    parser.add_argument("--version", required=True)
    parser.add_argument("--locale", required=True)
    parser.add_argument("--display-type", default="APP_IPHONE_67")
    parser.add_argument("--replace", action="store_true")
    parser.add_argument("--folder", type=Path, required=True)
    parser.add_argument("--key-id", required=True)
    parser.add_argument("--issuer-id", required=True)
    parser.add_argument("--key-path", type=Path, required=True)
    args = parser.parse_args()

    images = sorted(
        image
        for image in args.folder.glob("*.png")
        if not image.stem.endswith(" 2")
    )
    if not images:
        raise RuntimeError(f"No PNG screenshots found in {args.folder}.")

    client = AppStoreConnect(
        create_token(args.key_id, args.issuer_id, args.key_path)
    )
    version_id = find_version(client, args.app_id, args.version)
    localization_id = find_localization(client, version_id, args.locale)
    screenshot_set_id = get_or_create_set(
        client, localization_id, args.display_type, args.replace
    )

    print(
        f"Uploading {len(images)} screenshots to {args.locale} "
        f"({args.display_type})...",
        flush=True,
    )
    for index, image_path in enumerate(images, start=1):
        screenshot_id = upload_screenshot(
            client, screenshot_set_id, image_path
        )
        wait_until_complete(client, screenshot_id)
        print(
            f"[{index}/{len(images)}] {image_path.name}: COMPLETE",
            flush=True,
        )

    print(f"Screenshot set ready: {screenshot_set_id}", flush=True)


if __name__ == "__main__":
    main()
