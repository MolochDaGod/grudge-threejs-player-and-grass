# grudge6 skill matrix — where each concern lives

## Skills (canonical `~/.agents/skills/`)

| Concern | Skill | Key files / packages |
|---------|-------|----------------------|
| Umbrella | `grudge-studio` | Load first |
| **Full stack router** | **`grudge6-full-stack`** | This tree — **always for grudge6/RTS_TOON** |
| Kit · equip · atlas | `grudge6-modular-characters` | EquipmentManager, mesh_ids, gear_presets |
| Scale · face · feet | `grudge-character-correctness` | characterDeploy, fitCharacterHeight, kill list |
| SI metres | `grudge-world-scale` | HUMAN_HEIGHT_M = 1.8 |
| Anim · ranges · director | `grudge6-combat-runtime` | weapon packs, confirmation-gates |
| Parry/dodge/weapon skills | `grudge-fleet-combat` | `@workspace/epicfight` combat/fleet |
| Targeting | `grudge-combat-targeting` | LMB/RMB focus |
| Combo reference | `annihilate-3d-combat` | Action combat patterns |
| Mounts/siege | `grudge6-toon-rts-mounts-siege` | cavalry, catapult |
| Bake · colliders bake | `grudge-asset-convert` | fbx2gltf, collider bake |
| CDN/D1 | `grudge-d1-r2` | assets.grudge-studio.com |
| No fakes | `grudge-warlords-assets` | hard rule |
| Fleet red/yellow | `character-fleet-audit` | audit/repair loop |
| VFX hotkeys | `grudge-vfx-hotkeys` | V/B/F/G/T/C map |
| VFX runtime | `grudge-vfx` | skill-trigger overlay (Character-Animator) |
| Grass lobby · /space | `grudge-player-and-grass` | SI grass, bone helpers, equip |
| Accounts | `grudge-production-wiring` | Railway characters |
| World heightfield | `grudge-production-world` | island/sector colliders |
| Three.js API | `threejs-skills` → materials/textures/loaders/animation | |
| BVH / nav | `three-mesh-bvh-pathfinding` | terrain casts, pathfinding |
| Helpers / Rapier debug | `threejs-helpers-physics-terrain` | AxesHelper, Box3Helper, harvest |

## Packages / code SSOT

| Area | Path |
|------|------|
| Open character deploy | `gameopen/artifacts/animator/src/three/characterDeploy.ts` |
| Box3 body fit | `gameopen/artifacts/animator/src/three/fitCharacterHeight.ts` |
| Open physics | `gameopen/lib/grudge-physics` (SurfaceLocomotion, KCC, PLAYER_CAPSULE) |
| Open combat | `gameopen/lib/epicfight/src/combat/fleet/*` · colliders.ts |
| Pipeline deploy | `grudge-pipeline/web/js/characterDeploy.js` |
| player-and-grass equip | `src/play/equipment-manager.js` |
| player-and-grass races | `src/play/player-config.js` · `/character/races/*_Characters.glb` |
| Bone helpers / IK markers | `src/space/helpers/boneHelpers.ts` |
| CDN races FBX | `models/grudge6/races/{WK,BRB,ELF,DWF,ORC,UD}_Characters.fbx` |
| Gear presets JSON | ObjectStore `api/v1/grudge6-gear-presets.json` |
| Kit helper JS | CDN / ObjectStore `js/grudge6-kit.js` |

## Box3 + node checklist (every host)

1. `bodyBox` skinned body → fit **1.8 m** (unit decade unclamped)  
2. Atlas rebind (sRGB, flipY for FBX path)  
3. Equip visibility (one body / one weapon / one shield)  
4. `bodyBox` again → feet groundY + pelvis XZ  
5. Art-forward **once** (+π/2 for Toon RTS FBX)  
6. Hand containers for weapons / projectile origin  
7. Director + weapon anim pack; strip position tracks  
8. Capsule KCC + `resolveSurfaceLocomotion`  
9. Optional: `Box3Helper` / `createBoneHelperGroup` QA  

## Domain deep refs (this skill)

| File | Covers |
|------|--------|
| `box3-node-setup.md` | Box3 API, hierarchy, bone names, THREE helpers |
| `ik-colliders-physics.md` | Capsule, SurfaceLocomotion, attach, weapon colliders, VFX |

## Related docs in sibling skills

- `grudge6-modular-characters/references/equip-pipeline.md`
- `…/animation-packs.md`
- `…/eval-checklist.md`
- `…/character-select-systems.md`
- `grudge6-combat-runtime/references/confirmation-gates.md`
- `gameopen/docs/CANONICAL_COMBAT.md`
