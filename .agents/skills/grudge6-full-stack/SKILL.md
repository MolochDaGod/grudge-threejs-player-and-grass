---
name: grudge6-full-stack
description: >
  MASTER load map for grudge6 / Toon RTS (RTS_TOON) characters so mesh, texture,
  animation, equipment, colliders, physics, IK, weapon skills, and VFX are always
  correct. Covers THREE.Box3 grounding, Object3D node hierarchy, Bip001 skeleton,
  EquipmentManager, anim packs, SurfaceLocomotion, fleet combat. USE WHEN: grudge6,
  grudge 6, RTS_TOON, Toon RTS, WK_ BRB_ ELF_ DWF_ ORC_ UD_, modular race, hero wrong
  scale/facing/texture, equip weapons, sword_shield, character always right, full
  character stack, Box3 feet hips, bone helpers IK. Load AFTER grudge-studio; then
  load every sibling listed in the mandatory chain for the task domain. Never Meshy
  capsules for these races.
---

# grudge6 Full Stack (always-right characters)

**Purpose:** One skill that **routes agents to the fullest, correct skill set** for
Toon RTS / grudge6 heroes. If any leaf is skipped, characters break (hip float,
sideways, yellow atlas, T-pose, wrong equip, infinite-range attacks).

**Aliases:** grudge6 · grudge 6 · RTS_TOON · Toon_RTS · modular race kits

---

## Mandatory agent load chain

```
P0  grudge-studio
P1  grudge6-full-stack          ← this skill (always for grudge6 tasks)
P1  grudge6-modular-characters  ← kit, mesh_ids, equip, atlas, bones
P1  grudge-character-correctness ← scale 1.8m, Box3 feet, face +π/2, kill list
P1  grudge-world-scale          ← SI 1 unit = 1 m, human 1.8 m
```

Then **add by domain** (do not skip when the task touches that domain):

| Domain | Skills (load all that apply) |
|--------|------------------------------|
| **Textures / materials** | `threejs-materials` · `threejs-textures` · modular (atlas flipY) |
| **Mesh / loaders / GLB** | `threejs-loaders` · `grudge-asset-convert` · `gltf-asset-pipeline` (theory only) |
| **Animations** | `grudge6-combat-runtime` · `grudge-animation` · `threejs-animation` |
| **Equipment / panels** | modular · `grudge-character-tester` · `grudge-foundry` (create funnel) |
| **Colliders / physics** | `grudge-fleet-combat` (weapon skill colliders) · Open `@workspace/grudge-physics` · SurfaceLocomotion · `three-mesh-bvh-pathfinding` |
| **IK / hands / feet** | character-correctness (hands, ground) · player-and-grass `/space` bone helpers · combat-runtime (hand spawn) |
| **Weapon skills / combat** | `grudge6-combat-runtime` · `grudge-fleet-combat` · `grudge-combat-targeting` · `annihilate-3d-combat` (combo ref) |
| **VFX / effects** | `grudge-vfx-hotkeys` · `grudge-vfx` · fleet combat skill mesh/effect ids |
| **Mounts / siege** | `grudge6-toon-rts-mounts-siege` |
| **CDN / D1 registry** | `grudge-d1-r2` · `grudge-warlords-assets` (no fakes) |
| **Fleet QA reds** | `character-fleet-audit` |
| **Grass / lobby satellite** | `grudge-player-and-grass` |
| **Accounts** | `grudge-production-wiring` |

### One-line rule

> **Never ship a grudge6 hero with only one leaf skill.**  
> Minimum: **modular + character-correctness + world-scale**.  
> Combat: **+ combat-runtime + fleet-combat**.  
> Bake: **+ asset-convert + d1-r2**.

---

## THREE.Box3 — required measurement API

**Use `THREE.Box3` for all character fit / ground / hip decisions.**  
Never ground with `pelvis.position.y = 0` alone (that is hip float).

```js
import * as THREE from "three";

/** Skinned-body box only (ignore hidden equip / loose weapons when possible). */
function bodyBox(root) {
  const box = new THREE.Box3();
  let any = false;
  root.updateMatrixWorld(true);
  root.traverse((o) => {
    if (!o.isSkinnedMesh || !o.visible) return;
    if (!any) { box.setFromObject(o, true); any = true; }
    else box.expandByObject(o);
  });
  if (!any) box.setFromObject(root, true);
  return box;
}

/** Fit to HUMAN_HEIGHT_M = 1.8 (SI). */
function fitToHuman(root, targetH = 1.8) {
  const size = bodyBox(root).getSize(new THREE.Vector3());
  if (size.y < 1e-4) return 1;
  const s = targetH / size.y;
  root.scale.multiplyScalar(s);
  return s;
}

/** Feet on groundY; center XZ on Bip001 Pelvis. */
function groundFeetAndCenterXZ(root, groundY = 0) {
  root.updateMatrixWorld(true);
  let box = bodyBox(root);
  root.position.y += groundY - box.min.y;

  const pelvis =
    root.getObjectByName("Bip001 Pelvis") ||
    root.getObjectByName("Bip001") ||
    root.getObjectByName("mixamorig:Hips");
  if (pelvis) {
    const wp = new THREE.Vector3();
    pelvis.getWorldPosition(wp);
    // Parent-local: shift so pelvis XZ ≈ 0 under group
    const parent = root.parent;
    if (parent) {
      const local = parent.worldToLocal(wp.clone());
      root.position.x -= local.x;
      root.position.z -= local.z;
    }
  } else {
    const c = box.getCenter(new THREE.Vector3());
    root.position.x -= c.x;
    root.position.z -= c.z;
  }
  root.updateMatrixWorld(true);
  box = bodyBox(root);
  root.position.y += groundY - box.min.y;
}
```

### Box3 gates (must pass)

| Check | Pass |
|-------|------|
| Height after fit | **1.55–2.05 m** |
| Feet `box.min.y` after ground | **\|min.y − groundY\| &lt; 0.08** |
| Pelvis bone | **found** |
| Hands for weapons | **R_hand_container** or **Bip001 R Hand** |

---

## Object3D nodes — hierarchy contract

```
group (player root — position = feet world, yaw = facing)
 └── model (kit root — local scale fit, local y ground, rotation.y often 0)
      ├── Armature / Bip001 … bones
      ├── Units_Body_A|B|… (skinned)
      ├── Units_Arms_* / Legs_* / head_* / shoulderpads_*
      ├── weapon_* under R_hand_container / L_hand_container
      ├── Shield_* under L_shield_container
      └── Xtra_bag / wood / quiver
```

| Node | Responsibility |
|------|----------------|
| **group** | World transform, locomotion, camera follow target |
| **model** | Kit scale, art-forward local yaw (or 0 if group holds π/2) |
| **Bip001 Pelvis** | XZ center reference — not feet |
| **R_hand_container** | Weapon attach + projectile spawn origin |
| **L_shield_container** | Shield attach |
| **SkinnedMesh** | Atlas map; equip visibility |

**Hard:** Do not put world position on bone nodes for grounding. Ground **model** via Box3; bones follow skinning.

### Art-forward (Toon RTS)

- FBX kit art often faces **+X**.
- Controller walks **local +Z**.
- Apply **once**: `group.rotation.y = Math.PI / 2` (or `facePlusZ: 'auto'` in characterDeploy).
- **Never** double-yaw model + group both by π.

---

## Domain SSOT (one source each)

| Domain | SSOT skill / package | Never do |
|--------|----------------------|----------|
| Kit + equip | `grudge6-modular-characters` | Second body GLB swap |
| Scale / face / feet | `grudge-character-correctness` | Pelvis-as-feet |
| Metres | `grudge-world-scale` | Fit weapons to 1.8 m |
| Anim packs / ranges | `grudge6-combat-runtime` | Mixamo bones on Bip001 |
| Parry/dodge/weapon skills | `grudge-fleet-combat` / `@workspace/epicfight` | Copy CD tables per game |
| Locomotion surface | `@workspace/grudge-physics` SurfaceLocomotion | Ad-hoc swim flags only |
| Bake | `grudge-asset-convert` | Raw FBX as prod only without plan |
| No fakes | `grudge-warlords-assets` | Meshy / capsules |
| VFX hotkeys | `grudge-vfx-hotkeys` | Random effect ids |

---

## Full deploy pipeline (copy this order)

```
1. Load race KIT
   FBX SSOT: assets…/models/grudge6/races/{PREFIX}_Characters.fbx
   GLB deploy: /character/races/{PREFIX}_Characters.glb (must match FBX look)

2. THREE loaders (FBXLoader / GLTFLoader + optional DRACO)

3. unifySkeletons if multi-skin

4. Box3 fitCharacterHeight(1.8) on skinned body

5. Atlas rebind
   map.colorSpace = SRGBColorSpace
   map.flipY = false  // FBX/Toon RTS atlas path
   vertexColors = false

6. EquipmentManager.catalog → hide all equippable
   applyLoadout(mesh_ids | gear_preset | slots)
   exclusive: one body, one weapon_r, one shield

7. groundFeet + centerXZ pelvis (Box3 again)

8. art-forward +π/2 for grudge6 FBX

9. Anim pack from weapon
   sword_shield | longbow | magic | 2h_melee | rifle | unarmed
   stripPositionTracks on grounded kit
   AnimationDirector gait + one-shot attacks

10. Combat
    range gate before damage
    FleetWeaponSkill: mesh + collider + VFX + CD + combo
    hand bone for projectile origin

11. Physics / IK context
    capsule KCC ~ human (r≈0.35, halfH≈0.55)
    SurfaceLocomotion: ground|wade|swim|climb|wallRun|mount|boat|fly
    setVehicle from inventory when mounted

12. diagnoseCharacterLook / fleet audit green
```

---

## Equipment systems (must match)

| Layer | Implementation |
|-------|----------------|
| Name match | Fuzzy: strip `WK_|Units_|weapon_` then compare |
| Visibility | Catalog hide → show loadout only |
| Hand bones | `R_hand_container`, `L_hand_container`, `L_shield_container` |
| Presets | D1 `gear_presets` / ObjectStore `grudge6-gear-presets.json` |
| Player save | Railway `character.equipment` JSONB (not only sessionStorage) |

Prefixes: **WK_ · BRB_ · ELF_ · DWF_ · ORC_ · UD_**

---

## Colliders · physics · IK (minimum)

| Concern | Spec |
|---------|------|
| Body collider | `PLAYER_CAPSULE` r=**0.35**, halfH=**0.55** (~1.8 m total); centre = feet + r+halfH |
| Weapon blade | Box/capsule/sphere on **R_hand_container** during skill frames (`FleetWeaponSkill.collider`) |
| Hurtboxes | Bone spheres from rest-pose part `Box3` (epicfight `buildHurtboxes` + Bip001 rematch) |
| Feet ground | Box3 `min.y` → `playerGroup.y = sampleHeight(x,z)` (same SSOT as grass/harvest) |
| Feet IK full | Optional dual-foot plant; **not** required to ship — do not block on CCD |
| Hand attach | `R_hand_container` / `L_shield_container` — rigid props follow anim; no invent bones |
| Surface state | `resolveSurfaceLocomotion`: ground\|wade\|swim\|climb\|wallRun\|mount\|boat\|fly |
| Debug nodes | `Box3Helper` · `SkeletonHelper` · `createBoneHelperGroup` (AxesHelper + markers) |

**Deep refs:** `references/box3-node-setup.md` · `references/ik-colliders-physics.md`

---

## Weapon skills · effects (always)

| Need | Source |
|------|--------|
| Anim pack | combat-runtime weapon→pack table |
| Melee range | 2.2–2.8 m sword_shield (see combat-runtime) |
| Skill schema | fleet-combat `FleetWeaponSkill` |
| VFX ids | cast/impact from skill + vfx-hotkeys catalog |
| Confirm | combat-runtime `confirmation-gates.md` |

---

## Surfaces that must obey this stack

| Surface | Notes |
|---------|--------|
| Open / Danger / play | characterDeploy + Controller + epicfight |
| player-and-grass /play /space | SI 1.8 m, Toon GLBs, equip manager, Space helpers |
| Foundry | create → equipment → handoff |
| Browse GRUDGE6_Characters | FBX + atlas first |
| Warlords / RTS | modular equip + warlords-assets |
| Pipeline / Character-Animator | bake + director |

---

## Anti-patterns (instant reject)

1. Meshy / capsule “temp” hero for grudge6  
2. Pelvis Y = 0 as feet  
3. Double art-forward yaw  
4. Mixamo bone names on Bip001 kit  
5. Show all Body_A–E at once  
6. Fit arrows/swords to 1.8 m  
7. Attack damage without range  
8. GLB marked SSOT without FBX visual match  
9. Session-only character truth when Railway JWT exists  
10. Skip character-correctness “because time”

---

## Eval (minimum before “done”)

```
[ ] Skills loaded: modular + correctness + world-scale (+ combat if fighting)
[ ] Race kit Toon RTS prefix correct
[ ] Height 1.55–2.05 m (Box3)
[ ] Feet on ground; pelvis not at floor
[ ] Atlas not yellow; flipY correct
[ ] One body / one main weapon visible
[ ] Hand containers found
[ ] Idle plays; attack one-shot from correct pack
[ ] Melee/ranged range gated
[ ] diagnoseCharacterLook / visual QA green
```

---

## Slash / auto-invoke

- `/grudge6-full-stack`
- Triggers: grudge6, RTS_TOON, Toon RTS, modular race, character wrong, full skills

## Sibling index

| Doc | Contents |
|-----|----------|
| `references/skill-matrix.md` | Skill → package / path map |
| `references/box3-node-setup.md` | Box3 bodyBox, hierarchy, bone names, THREE helpers |
| `references/ik-colliders-physics.md` | Capsule, SurfaceLocomotion, equip attach, weapon colliders, VFX |

**Code SSOT anchors**

| Area | Path |
|------|------|
| bodyBox / fit 1.8 m | `gameopen/artifacts/animator/src/three/fitCharacterHeight.ts` |
| deploy + ground + facePlusZ | `…/characterDeploy.ts` |
| Capsule + SurfaceLocomotion | `gameopen/lib/grudge-physics` |
| Fleet weapon skills | `gameopen/lib/epicfight/src/combat/fleet/*` |
| Bone helpers (/space) | `player-and-grass/src/space/helpers/boneHelpers.ts` |
| Equip manager | `player-and-grass/src/play/equipment-manager.js` |
