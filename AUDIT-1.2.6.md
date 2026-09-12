# 1.2.6 stability audit — September 12, 2026

## Scope and evidence

Reviewed production startup, gameplay/campaign transitions, rendering, environment materials, unit cleanup, combat effects, audio, celebration UI and release wiring. Syntax-checked production root JavaScript; validated HTML script/style targets and runtime model manifest files. Existing model, motion, placement, map, combat and campaign tests plus new stability checks: **58 passed**.

Local browser checks: start screen displayed; 3D loaded; guardian placement and wave launch worked. Compatibility view also loaded, placed a guardian and launched a wave. No errors were reported in these checks. These were Chromium-based in-app browser checks, **not Firefox reproduction**. Automated 53-wave simulation coverage is not a manual 53-wave GPU soak test.

## Repairs

- No automatic WebGL creation before the player chooses Enter 3D forest.
- Removed the startup portrait renderer/import and duplicate portrait GLB loading. Existing character artwork remains in the roster; battlefield models are unchanged.
- Stopped loading unused walk sprite sheets during 3D startup.
- Added a separate no-WebGL compatibility renderer using the same simulation and rules. It intentionally uses simpler 2D art/symbols, not full 3D visuals. Use `?mode=safe`.
- Added readable startup/runtime errors, graphics-context-loss handling and a compatibility link. Failed 3D startup disposes its renderer.
- Disabled early gameplay controls and keyboard shortcuts until startup completes.
- Paused frame rendering while the document is hidden.
- Disabled multisample antialiasing at the existing pixel ratio of one to reduce graphics pressure.
- Shared identical environment texture sets between ground, road and knoll materials.
- Disposed instance skeleton GPU resources when units leave the scene, while preserving shared model geometry/materials.

## Boundaries / remaining risks

The user's completely blank Firefox page is not reproduced here; browser/driver, extension or startup causes are still unconfirmed. JavaScript recovery cannot repair a browser-process/driver crash or a document that never loads. Heavy models still require WebGL2 and adequate GPU memory. Compatibility mode reloads a fresh run; it does not migrate an active game between renderers. Network requests can still stall, but the visible compatibility link remains available during 3D loading.

No balance, model identity, paid assets, account settings or 2D project changes. Pending leaderboard/backend work and unrelated untracked assets are excluded from this release.
