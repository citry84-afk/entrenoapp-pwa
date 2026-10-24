# Premium exercise library · 2026-10-24

## Outcome

The current catalogue's 304 exact exercise/name/equipment identities are covered by 160 active generated illustration assets. The reviewed registry contains 164 assets: four earlier overview assets remain versioned but have no active catalogue identity. Every registered asset has a WebP and matching JPEG compatibility copy.

Images were generated with the built-in ChatGPT image-generation tool, not an API-key script. The approved style, exact prompts, original output paths, hashes and individual visual reviews are saved in `generated-image-style.md`, `generated-exercise-plan.json` and `generated-image-records/` in this audit directory. Selected project assets are stored in `assets/exercise-media/generated/` at the repository root.

## Verified story

Selecting an exercise resolves its exact catalogue identity to a reviewed generated-media key, requests the local image from the deployment and renders static reference positions or an explicitly labelled overview. The user can switch to a schematic muscle map without changing logged work. This feature does not require an API, database or new environment secret.

| Boundary | Evidence |
| --- | --- |
| Catalogue → reviewed registry | 304 identities, no missing or duplicate assignments; 164 reviewed records, zero pending assets. |
| Variant clarity | 56 complete bilingual profile-specific descriptions; visible captions preserve the exercise cue. No fuzzy custom-exercise matching. |
| Registry → files | Compiler checks signatures, paths, file sizes and SHA-256 of WebP and JPEG copies. |
| Deployment → files | 335 public files returned HTTP 200 with expected MIME types and hashes identical to the staged snapshot; 26,423,155 verified bytes. See `premium-preview-http-verification.json`. |
| Browser → image | Actual deployed app, nominal viewport 390×844; document width and scroll width both 387px. One picture selects WebP while retaining JPEG as its fallback. Image decoded successfully. |
| Image ↔ muscle map | Both views work. Kilograms remained blank, repetitions remained 8, and completed steps remained 0/3 before and after switching. No history entry was saved. |
| Browser errors | No console errors during the tested preview flow. |

## Tests and build

- `npm run test:workouts`: passed.
- `npm run test:app`: passed, including 63 visual-renderer tests and 10 complete generated-library checks across all 304 identities in Spanish and English.
- `npm run verify`: passed again after the final cache-version update.
- `npm run build`: passed. The final HTML cache-version update was recopied to the generated `www/` output and public snapshot; all three app HTML hashes match.
- Final app HTML SHA-256: `d61e917dff75a61310be960d6e547ba4e0f10ee8ce767b2023a8bd74ca1a6cf6`.
- Cache version: `20261024-premium2`. This also avoids reusing the earlier development guide scripts cached by a service worker.
- The public staging directory excludes audits, scripts, Git metadata, dependencies and local environment files.
- The preview's actual private analytics route, `/api/analytics/report`, returns HTTP 401 without credentials and `Cache-Control: no-store`.

## Preview and unchanged production

- Preview: https://6add109012a5064cf0cd022b--entrenoapp.netlify.app/app.html?qa=1
- Deploy ID: `6add109012a5064cf0cd022b`; state `ready`; context `deploy-preview`; `published_at` is null.
- Production was not promoted or replaced. After creating the preview, its app HTML still hashes to `48cd060b9cb69238ca56d3a36258afcbfcf1c665a58e640f0febd202bbfbbab9` and its homepage to `c73eab78782383366ac5632f51c27305a0e0b9be770553645579cb5caea89d24`, matching the baseline.
- No store binary, store submission, commit or pull request was created.
- Mobile proof: `app-premium-iphone.png` in this directory, captured from the deployed preview with a fictitious local-only QA profile.

## Limits

These are static, AI-generated orientation references, not GIFs, continuous demonstrations, measured muscle-activation maps or personalised technique assessments. Visual inspection checks material, supports and obvious anatomy, but is not professional biomechanical or clinical validation. Partial ranges and subtle pose changes, including seated leg curl and leg-press calf raise, are documented in their image records. Multi-movement entries retain explicitly labelled overviews rather than pretending one pose demonstrates an entire block. Everkinetic fallback imagery remains separately attributed and licensed.
