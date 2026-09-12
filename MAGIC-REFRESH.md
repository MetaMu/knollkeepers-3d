# Light magic refresh — September 12, 2026

Ported the named spell recipes from the user's original 2D game (`vfx.js` and `campaign-vfx.js`) into world-space 3D effects. Source files were read only. No new paid assets, packages, or generation credits.

- KnowME: ice-shard projectiles, frosty nova and crystals around slowed enemies.
- Host: branching, flickering lightning with bright core and colored corona.
- Maahaa: layered golden solar beam with rotating impact sparks.
- Old Sailor: arcing cannonball, muzzle flash, smoke, embers and shockwave.
- Fordenand: green projectile trails and scattered thorn leaves.
- Lady: flowing mint healing trails and violet conversion rings.
- Phil: rising cyan shadow-model afterimages and uppercut streaks.
- Reno: growing roots and thorns following the full trail, with the original named ability caption.

Corrected canvas screen-up offsets at the rendering boundary so spells connect to the characters instead of shifted map positions. The gameplay core, damage, cooldowns, prices, levels and character files are unchanged.

The new particles use seven bounded instanced drawing batches; incidental effects are capped at 64, frozen-enemy decorations at 24, conversion channels at eight. No full-screen flashes or postprocessing pipeline. This is a lightweight interpretation of the 2D choreography, not a photoreal effects overhaul.

Validation: 64 gameplay, asset and spell-recipe checks pass. Browser review covers named spells, Reno roots and shader compilation. Test view: `tools/magic-review.html`.
