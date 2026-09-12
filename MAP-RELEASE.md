# 3D forest map — 2026-09-12

## Texture and grassy-knoll update

Reused the checksum-verified Poly Haven CC0 texture set already held in Dark Forest Gauntlet. Forest Leaves 02 is byte-identical to the Grove Pear Hub's forest surface. Added forest-floor color, normal and roughness detail, bark and rock materials, a textured path, and 16 rounded grass-covered knolls with flat guardian platforms and grass tufts. Raised guardian placement and click targets together. The source games were read only. Receipt: assets/environment/textures/receipt.json. The user approved direct checksum-verified copying because game-dev is unavailable; this is not canonical package admission. No paid generation or purchases.

This update replaces the initial 2.5D battlefield described in RELEASE-3D.md with a real Three.js scene. The original 2D game and its repository are not modified.

Reuses terrain and 32 trees from the user's downloaded **Nightmare Before Christmas Forest**, by pocketmikey, licensed CC BY 4.0: https://sketchfab.com/3d-models/nightmare-before-christmas-forest-933323d2b9cc4dc88aa772a09f5e85f5 . License: https://creativecommons.org/licenses/by/4.0/ . Adaptations include rescaling terrain, clearing themed objects, selecting and shortening trees, new materials, foliage, rocks, mushrooms, road and tower pads. Source hash and attribution are in assets/environment/provenance.json. No purchase or generation credits used.

The route is 1705.36 simulation units, up from 1484.56 (+14.87%), with wider bends and 16 repositioned clearings. Road, enemy movement and placement use the same route definition. A sampled heightfield grounds units to the reused mesh. Normal and Ashen stages change foliage and lighting. Drag to orbit, scroll to zoom, Reset view restores the default camera. WebGL is required; mutant enemies retain original billboard artwork.

Validation: six automated tests in tools/map.test.cjs cover route length and continuity, pad clearance, first-wave combat, stage transition and heightfield integrity. Browser checks cover loaded terrain, placed guardians, a moving wave and normal/Ashen test scenes. The test fixture is not a benchmark guarantee or proof of complete 30-wave balance. A slightly longer route gives guardians more attack time; combat statistics are unchanged.

The runtime terrain mesh is about 251 KB plus a 103 KB heightfield. Existing character models are unchanged. Rendering uses a 1x pixel ratio, pooled shot lines and 8 Hz skeletal pose updates to retain the accepted stop-motion style.
