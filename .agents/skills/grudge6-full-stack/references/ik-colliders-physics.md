# IK · colliders · physics · equipment attach (grudge6 / RTS_TOON)

**Load with:** `grudge6-full-stack` · `grudge-fleet-combat` · `grudge6-combat-runtime` · `three-mesh-bvh-pathfinding`  
**Packages:** `@workspace/grudge-physics` · `@workspace/epicfight` combat/fleet

---

## Layers (do not conflate)

| Layer | Purpose | SSOT |
|-------|---------|------|
| **Visual mesh** | Skinned kit + equip visibility | modular-characters |
| **Box3 feet** | Place soles on terrain / local y=0 | fitCharacterHeight / characterDeploy |
| **KCC capsule** | Physics body / walls / slopes | grudge-physics `PLAYER_CAPSULE` |
| **Hurtboxes** | Receive damage (bone spheres) | epicfight `buildHurtboxes` |
| **Weapon colliders** | Deal damage during skill frames | fleet-combat `FleetWeaponSkill.collider` |
| **IK / attach** | Hands hold weapons; optional feet plant | containers + bone helpers; full foot IK not required for ship |

---

## Capsule (body physics) — SI

From `gameopen/lib/grudge-physics/src/constants.ts`:

```ts
PLAYER_CAPSULE = { radius: 0.35, halfHeight: 0.55, controllerOffset: 0.08 }
// Total height ≈ 2*radius + 2*halfHeight ≈ 1.8 m
PLAYER_HEIGHT_M = 1.8
capsuleCenterOffset = radius + halfHeight  // feet → capsule centre
```

| Rule | Detail |
|------|--------|
| Align capsule to **feet**, not pelvis | Centre at `feetY + capsuleCenterOffset` |
| Same SI as mesh | After Box3 fit, capsule height band matches ~1.8 m human |
| Gravity / tick | `GRAVITY_Y = -12`, `PHYSICS_HZ = 60` |
| Never | Scale capsule with wrong unit decade (100×) |

---

## SurfaceLocomotion (feet ↔ world)

Modes: `ground | wade | swim | climb | wallRun | mount | boat | fly`

```ts
import { resolveSurfaceLocomotion } from "@workspace/grudge-physics";
// feetY from playerGroup.position.y after Box3 ground
// sampleHeight(x,z) = same function as grass / harvest / pathfinding
```

| Mode | Character / anim implication |
|------|------------------------------|
| ground | Normal gait; feet IK optional plant to sampleHeight |
| wade / swim | Water depth from `sampleWaterY`; slow gait / swim clips |
| climb / wallRun | Wall probe (~0.62 m); not free fly |
| mount / boat / fly | `setVehicle` from inventory; parent offset to host; anim pack mount/fly |

**Feet IK minimum (always):** `group.position.y = sampleHeight(x,z)` so Box3 soles sit on surface.  
**Full dual-foot IK:** optional polish; documented gap on player-and-grass until production-world + probes share heightfield. Do **not** block ship on full CCD IK.

---

## Hand IK / equipment attach (always)

| Slot | Node | Notes |
|------|------|-------|
| Main weapon | `R_hand_container` → `Bip001 R Hand` | Weapon mesh parented here; projectile origin |
| Offhand / bow | `L_hand_container` | Bow/staff exclusive group |
| Shield | `L_shield_container` | Prefer over L hand for shield |
| Utility | `Bone_bag`, `Bone_wood`, `Quiver_container` | Can co-exist |

**Equip algorithm (visibility, not IK solve):**

1. Catalog equippable meshes → `visible = false`
2. Resolve loadout `mesh_ids` / gear_preset / slots
3. Fuzzy name match → `visible = true` (one body, one weapon_r, one shield)
4. Re-run **bodyBox + groundFeet** (AABB may change)
5. Weapons already under containers follow hand animation — no second IK solve required for Toon RTS rigid props

**Never** invent bone names; use `boneHelpers.findBone(root, 'weapon')` candidates.

---

## Weapon skills · colliders · VFX

Fleet schema (`grudge-fleet-combat` / `@workspace/epicfight`):

| Field | Role |
|-------|------|
| mesh | Skill mesh id or slash mesh |
| collider | Box/capsule/sphere during active frames |
| effect / VFX id | cast + impact (`grudge-vfx-hotkeys`) |
| cooldown | Shared CD tables — do not fork per game |
| combo | Chain with annihilate patterns as reference |

```text
range gate (combat-runtime metres) → active frames → collider vs hurtbox → VFX
```

Melee sword_shield typical range **2.2–2.8 m** (see combat-runtime).  
Projectile spawn: **hand bone world position** (`sampleBoneWorldPositions` / getWorldPosition on container).

EpicFight hurtboxes: rest-pose `Box3` per body part → bone-centred spheres that **follow animation** (`buildHurtboxes`). For grudge6 Bip001, map parts to `Bip001 Head`, spine, arm, leg bones — do not assume EpicFight default `Head`/`Chest` names without rematch.

---

## Terrain / environment colliders

| Need | Tool |
|------|------|
| Ray / capsule cast on terrain mesh | `three-mesh-bvh` |
| Navmesh | `three-pathfinding` |
| Height sample SSOT | One `sampleHeight(x,z)` for loco + grass + harvest |
| Sector shell | Production-world collider bake (asset-convert) |

Character **never** uses Meshy capsule as visual hero — only as **physics** volume.

---

## /space studio workflow (authoring)

1. Load FBX/GLB kit  
2. `createBoneHelperGroup` — verify hands/feet/hips  
3. `Box3Helper` on bodyBox — height ~1.8 m  
4. Toggle equip; confirm containers move with anim  
5. Export `sampleBoneWorldPositions` for skill collider offsets  
6. Color variants / body regions without breaking node names  

Path: `src/space/helpers/boneHelpers.ts` + space-variant apply.

---

## Checklist (physics + IK + combat)

```
[ ] Capsule r≈0.35 halfH≈0.55 aligned to feet
[ ] playerGroup.y = sampleHeight (or swim/wade offset)
[ ] R_hand_container found; weapon visible under it
[ ] bodyBox height 1.55–2.05 m; feet |min.y−ground| < 0.08
[ ] SurfaceLocomotion mode matches water/wall/vehicle
[ ] Attack range gated; skill collider + VFX ids set
[ ] No mixamorig tracks on Bip001 kit
[ ] Mount: setVehicle + host; dismount restores ground mode
```

---

## Sibling skills

| Skill | When |
|-------|------|
| `grudge-character-correctness` | Hip-float / sideways kill list |
| `grudge6-modular-characters` | mesh_ids equip |
| `grudge6-combat-runtime` | Packs, ranges, director |
| `grudge-fleet-combat` | Parry/dodge + FleetWeaponSkill |
| `grudge6-toon-rts-mounts-siege` | Horse / siege hosts |
| `threejs-helpers-physics-terrain` | AxesHelper, RapierHelper, harvest |
| `grudge-production-world` | Island heightfield / water QA |
