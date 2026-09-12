# Knoll Keepers 3D

A separate edition of the Lost Realm tower-defense game, using five animated guardian GLBs and four animated enemy GLBs. Models are rendered with Three.js into cached poses for the existing 2D battlefield (2.5D presentation).

The original 2D game remains at https://metamu.github.io/lost-realm-game/ . Its repository and deployment are preserved.

Select a guardian and a clearing to build. Upgrade placed guardians, then defend 30 waves across two stages. Controls: 1–5 guardians, Space sends a wave, P pauses. Progress resets on reload.

Four mutant designs retain their original artwork until their 3D models are available. Original character art also provides a fallback if WebGL is unavailable.

Serve this directory with any static HTTP server; opening index.html directly as a local file will not load modules. All runtime dependencies and models are included. See RELEASE-3D.md and assets/models/manifest.json for validation and provenance.
