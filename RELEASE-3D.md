# Knoll Keepers 3D — separate game release — 2026-09-12

Five guardian GLBs and four normal enemy GLBs now provide animated WebGL-rendered poses for the existing canvas battlefield. Guardians use idle/cast clips and enemies use the stepped walk with head bob. The game retains the original mutant artwork and uses original art if WebGL or a model is unavailable. Guardian cards and portraits use the same rendered models.

This is a 2.5D presentation of the models on the existing map, not a replacement of the map or combat engine with a fully 3D world. Initial loading downloads approximately 16 MB of model data. Pose caching releases the GPU assets after loading and uses approximately 28 MB of canvas pixel storage.

Validation: nine models imported and produced visible animated frames in the browser; package hashes and all geometry/skin/animation buffers match the original rigs; nine combat tests pass including all 30 waves; local live-wave test recorded attacks and takedowns with no browser errors.

Usage basis: Hyper3D Terms section 5(b) covers Rodin outputs, reviewed at https://hyper3d.ai/legal/terms on 2026-09-12. Models derive from user-supplied character references. Three.js is distributed with its MIT license in vendor/three/LICENSE. Asset-vendoring provenance guidance was applied with local verification because the game-dev CLI is unavailable; this is not a Game Development Studio canonical package.

The 2D game remains live at https://metamu.github.io/lost-realm-game/ . This edition publishes to its own repository and URL.

2D baseline commit 8e3aaa37955f8f9c4cc16efa89bf59526cd2738e. The original deployment is not updated by this release. No new paid generation or subscription is required for this release.
