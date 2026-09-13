# Current 2D catch-up — local, unpublished

Compared the root 2D working files in `Lost Realm Gnome Game`, its `publish-repo` history through `b616512`, and the 3D history through `181dad2`. The root 2D directory is not a Git repository; its Queen/cleanse work is newer than the published copy. No project AGENTS.md was found in either project or the inspected parent directories. Read `AUDIT-1.2.6.md`, `CATCHUP-RELEASE.md`, and `BALANCE-REFRESH.md` before editing.

## Ported

- Host: transitive networks within 190 map units; extra Hosts add two chain targets and 25 jump range each, with 80% damage retained per hop. Ten-second reverse power once per chapter.
- KnowME: two five-second freeze charges per chapter, with no overlapping activation.
- Sailor: one Hellfire barrage per chapter, hitting the activation-time targets for 35% maximum HP. Ford: one volley, delivering 35% maximum HP over five seconds after its travel time.
- Lady: 8.4-second cooldown; half-price upgrades; demons use 1.95 times base health/damage, splash half damage within 65 units, and no longer block enemies. Each Lady owns at most one pending conversion or living demon. Two-second channel and self/neighbor healing remain.
- Phil: 470 recruitment price, with upgrades still based on 420.
- Chapter 3: crystal enemies; Hex Queen on waves 7, 13, 19; five-second tower freeze every ten active seconds and ten-second hex every twenty. Hex causes nonlethal friendly fire, floored at 5 HP. Maahaa cleanse clears ailments, grants five seconds of poison ward, and heals the five most injured guardians by 30% maximum HP, once in chapter 3. “Level 3” in the source means campaign chapter, not a level-three Maahaa upgrade.
- Enemy travel takes 15% longer, with spawn intervals also multiplied by 1.15. New bounty increases are 25% globally and a further 20% in chapter 2. The existing 3D 10% kill reward multiplier is still applied exactly once; e.g. a scout pays 13.75 / 16.50 / 13.75 gold across chapters.
- Power controls and help text; 3D falling bombs, poison arrows, reverse/poison indicators, cleanse/Queen pulses, tower ailment indicators, crystal tint/crown, and Reno stone/rune circle. Reverse movement now turns the 3D rig around. Compatibility mode displays these gameplay states with simpler markers.
- All chapter ability state resets while preserving 3D cooldown cleanup and victory-event metadata. Pending volleys are cleared at combat end.

## Deliberate differences retained

- 3D route and 14 clearings, existing models and five-pose walks, native spell effects, and camera controls.
- Existing 3D health formula (`3 × .9 × 1.28`, chapter multipliers 1 / 3.4 / 4.5) and boss half-health multiplier. The source’s alternate chapter reductions and wave-specific boss reductions were not layered onto this deliberate balance fork.
- Reno remains 1500 gold, 45 seconds, and removes half of current HP from activation-time on-screen targets once. 2D currently charges 1000.
- Dismissal still refunds 70%; 2D uses 50%, explicitly excluded by the preceding 3D catch-up notes.
- The already-ported milestone bonuses, +250 chapter transition, clean board, 53 waves, and kill multiplier were not duplicated.
- Queen presentation reuses the existing boss rig with crystal tint and a crown marker; it is not a newly commissioned model. Pixel-specific 2D textures are represented by bounded native 3D effects.

## Verification and limits

73 automated checks pass: the nine current runtime suites plus `tools/current-port.test.cjs` and `tools/cleanse-current.test.cjs`. Coverage includes new powers, Queen spells, exact reward arithmetic, nonblocking summons, resets, all chapter transitions, spell geometry, model integrity, placement, and startup mitigation checks. These are actual runtime modules, not overhaul-workbench rules.

Local Chromium in-app browser: explicit start screen, 3D load, guardian placement and wave launch; compatibility mode load, placement and wave launch. Power controls were visually inspected and moved below the arena to avoid camera-help overlap. This is not a Firefox reproduction or a manual 53-wave graphics soak.

Startup gate, boot guard, no-WebGL mode, versioned dependencies, shared textures, reduced startup work and skeleton GPU disposal remain. Modified module URLs use `1.2.6-stability-port1` as a local cache key. `release-manifest.json` remains the prior published release record, not a claim that its hashes describe these uncommitted changes.

No publishing, backend permission changes, leaderboard activation, paid services, or source 2D writes. Pre-existing untracked assets, tools, workbench and leaderboard/Supabase files were preserved.

Local preview: run `node tools/preview-current.cjs`, then open `http://127.0.0.1:8037/` (or `?mode=safe`).
