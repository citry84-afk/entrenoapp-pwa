# Premium exercise illustrations · production release

Published to https://entrenoapp.com following the user's explicit approval.

- Site: `93bc4e7e-5605-4bef-a759-3d95ee0f7b32` (`entrenoapp`).
- Production deploy: `6add13a897998b685eadd111`.
- State: `ready`; context: `production`; published at `2026-10-24T20:23:15.097Z`.
- Cache version: `20261024-premium2`.
- Public snapshot: `/var/folders/gr/lcm7yq1n7rx_yylcyxwtc0f00000gn/T/entrenoapp-web-release-JYRbbh`, the same snapshot used for the approved preview.

## Preflight

An independent read-only check confirmed that all 335 feature files in the preview verification report retained identical SHA-256 hashes and sizes. The five exercise modules use the final cache version. The snapshot has no audit directories, scripts, environment files, Git metadata, dependencies or symbolic links. No deployment was made from the repository root.

The preview's complete application tests, pre-deployment verification, build and mobile exercise-guide flow had passed before approval. See `premium-library-verification.md` for that evidence and the static-reference limitations.

## Production verification

- All 335 feature files on the actual production domain returned HTTP 200, expected MIME types and bytes identical to the approved snapshot: 26,423,155 bytes. Full results: `premium-production-http-verification.json`.
- The registry contains 164 reviewed WebP/JPEG assets, of which 160 are active for 304 current exercise variants.
- Production app HTML SHA-256 is `d61e917dff75a61310be960d6e547ba4e0f10ee8ce767b2023a8bd74ca1a6cf6`.
- Browser inspection of the actual production app confirmed all five `premium2` exercise-module URLs and no console errors. A generated goblet-squat image was opened directly from the production domain and decoded successfully; screenshot: `premium-production-browser.png`.
- Independent verification confirmed the homepage's baseline SHA-256 remains `c73eab78782383366ac5632f51c27305a0e0b9be770553645579cb5caea89d24`. Neither the homepage nor the app returned a global `X-Robots-Tag: noindex` header.
- `/api/analytics/report` without credentials returns HTTP 401 with `Cache-Control: no-store`.
- Production profile and workout-history controls were not changed; no workout was started or saved during production verification.

## Scope and follow-up

No store build or submission, Git commit or pull request was created. Automatic publishing was not locked. Before deployment, the user was warned that a future Git continuous-deployment run can replace a manual production release; locking remains an optional separate action.
