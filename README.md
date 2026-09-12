# Knoll Keepers 3D

A separate edition of the Lost Realm tower-defense game, with a genuine Three.js terrain map, five animated guardian GLBs and four animated enemy GLBs. The winding route is about 15% longer than the original. Drag the map to orbit, scroll to zoom, and use Reset view to return to the overview.

The original 2D game remains at https://metamu.github.io/lost-realm-game/ . Its repository and deployment are preserved.

Select a guardian and a clearing to build. Upgrade placed guardians, then defend 30 waves across two stages. Controls: 1–5 guardians, Space sends a wave, P pauses. Progress resets on reload.

Four mutant designs retain their original artwork as billboards until their 3D models are available. The battlefield requires WebGL. Character portraits use cached model poses.

Serve this directory with any static HTTP server; opening index.html directly as a local file will not load modules. All runtime dependencies and models are included. See MAP-RELEASE.md, RELEASE-3D.md and assets/models/manifest.json for validation and provenance.
