# grudge6 skill matrix — where each concern lives

## Skills (canonical `~/.agents/skills/`)

| Concern | Skill | Key files / packages |
|---------|-------|----------------------|
| Umbrella | `grudge-studio` | Load first |
| **Full stack router** | **`grudge6-full-stack`** | This tree |
| Kit · equip · atlas | `grudge6-modular-characters` | EquipmentManager, mesh_ids, gear_presets |
| Scale · face · feet | `grudge-character-correctness` | characterDeploy, fitCharacterHeight |
| SI metres | `grudge-world-scale` | HUMAN_HEIGHT_M = 1.8 |
| Anim · ranges · director | `grudge6-combat-runtime` | weapon packs, confirmation-gates |
| Parry/dodge/weapon skills | `grudge-fleet-combat` | `@workspace/epicfight` combat/fleet |
| Targeting | `grudge-combat-targeting` | LMB/RMB focus |
| Combo reference | `annihilate-3d-combat` | Action combat patterns |
| Mounts/siege | `grudge6-toon-rts-mounts-siege` | cavalry, catapult |
| Bake | `grudge-asset-convert` | fbx2gltf, collider bake |
| CDN/D1 | `grudge-d1-r2` | assets.grudge-studio.com |
| No fakes | `grudge-warlords-assets` | hard rule |
| Fleet red/yellow | `character-fleet-audit` | audit/repair loop |
| VFX hotkeys | `grudge-vfx-hotkeys` | V/B/F/G/T/C map |
| Grass lobby | `grudge-player-and-grass` | /play /space SI grass |
| Accounts | `grudge-production-wiring` | Railway characters |
| Three.js API | `threejs-skills` → materials/textures/loaders/animation | |

## Packages / code SSOT

| Area | Path |
|------|------|
| Open character deploy | `gameopen/artifacts/animator/src/three/characterDeploy.ts` |
| Open physics | `gameopen/lib/grudge-physics` (SurfaceLocomotion, KCC, probes) |
| Open combat | `gameopen/lib/epicfight/src/combat/fleet/*` |
| Pipeline deploy | `grudge-pipeline/web/js/characterDeploy.js` |
| player-and-grass equip | `src/play/equipment-manager.js` |
| player-and-grass races | `src/play/player-config.js` · `/character/races/*_Characters.glb` |
| CDN races FBX | `models/grudge6/races/{WK,BRB,ELF,DWF,ORC,UD}_Characters.fbx` |
| Gear presets JSON | ObjectStore `api/v1/grudge6-gear-presets.json` |
| Kit helper JS | CDN / ObjectStore `js/grudge6-kit.js` |

## Box3 + node checklist (every host)

1. `Box3` skinned body → fit 1.8 m  
2. Equip visibility  
3. `Box3` again → feet groundY  
4. Pelvis XZ center  
5. Hand containers for weapons  
6. Art-forward once  
7. Director + pack  

## Related docs in modular skill

- `grudge6-modular-characters/references/equip-pipeline.md`
- `…/animation-packs.md`
- `…/eval-checklist.md`
- `…/character-select-systems.md`
- `grudge6-combat-runtime/references/confirmation-gates.md`
- `gameopen/docs/CANONICAL_COMBAT.md`
