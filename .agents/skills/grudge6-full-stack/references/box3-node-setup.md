# Box3 + Object3D node setup (grudge6 / Toon RTS / RTS_TOON)

**Load with:** `grudge6-full-stack` · `grudge-character-correctness` · `grudge-world-scale`  
**Code SSOT:** `gameopen/artifacts/animator/src/three/fitCharacterHeight.ts` · `characterDeploy.ts`  
**Visual helpers SSOT:** `player-and-grass/src/space/helpers/boneHelpers.ts`

---

## Why Box3 (mandatory)

| Measure | Correct source | Wrong source |
|---------|----------------|--------------|
| **Height** | `bodyBox(root).getSize().y` (skinned body) | Full prop AABB including bags/weapons only |
| **Feet** | `bodyBox.min.y` → shift so min.y = groundY | `Bip001 Pelvis` world Y = 0 |
| **XZ center** | Pelvis world XZ → model.position | Prop bbox center (skews with shield) |
| **After equip** | Re-`bodyBox` — visibility changes AABB | One-shot measure at T-pose only |
| **After anim** | Re-ground after mixer sample | Assume idle keeps feet |

`THREE.Box3` is the **only** approved API for height / feet / center after scale and equip.  
Pelvis bone world Y is **hips**, never feet.

---

## bodyBox rules (copy from fitCharacterHeight)

1. `root.updateMatrixWorld(true)` before measure.
2. Prefer **visible `SkinnedMesh` only** — armor pieces; ignore hidden equip variants.
3. If no skinned mesh: `box.setFromObject(root)` fallback.
4. Never measure while `scale` is mid-experiment without reset when fitting (fit path resets scale to 1 first).
5. After any `position` / `scale` / visibility change: **measure again**.

```js
import * as THREE from "three";

export function bodyBox(root) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3();
  let n = 0;
  root.traverse((node) => {
    if (node.isSkinnedMesh && node.visible) {
      try {
        box.expandByObject(node);
        n++;
      } catch {
        /* incomplete skin stubs */
      }
    }
  });
  if (n === 0) box.setFromObject(root, true);
  return box;
}
```

### Gates (must pass)

| Check | Pass |
|-------|------|
| Height after fit | **1.55–2.05 m** (`HUMAN_HEIGHT_M = 1.8`) |
| Feet | `\|box.min.y − groundY\| < 0.08` |
| Pelvis | Found (`Bip001 Pelvis` / Bip001 / mixamorig Hips) |
| Unit decade | If native ~180 → `unitFix = 0.01` (cm→m) **unclamped** |

### Re-measure triggers

- Equip loadout change (visibility → Box3 changes)
- First idle / attack mixer sample (position tracks)
- Author scale / unit snap tweak
- Mount / dismount (host offset changes)

---

## Object3D node hierarchy contract

```
playerGroup                    ← world feet XZ + surfaceY; yaw = facing (+ art-forward once)
 └── model / kit root          ← local scale fit; local y so feet @ 0; usually yaw 0
      ├── Armature / Bip001 …
      │     ├── Bip001 Pelvis  ← XZ center ref only
      │     ├── Bip001 Head
      │     ├── Bip001 R Hand / R_hand_container  ← weapon + projectile origin
      │     ├── Bip001 L Hand / L_hand_container
      │     ├── L_shield_container
      │     ├── Bip001 R Foot / L Foot            ← feet IK samples (optional)
      │     └── Bone_bag / Bone_wood / Quiver_container
      ├── Units_Body_A|B|…     (SkinnedMesh — equip visibility)
      ├── Units_Arms_* / Legs_* / head_* / shoulderpads_*
      └── weapon_* / Shield_*  (often rigid under containers)
```

| Node | Responsibility | Never |
|------|----------------|-------|
| **playerGroup** | World transform, loco, camera follow, art-forward yaw | Ground via pelvis Y |
| **model** | Fit scale, local feet @ 0, kit materials | Double-yaw with group |
| **Bip001 Pelvis** | XZ center reference | Treat as feet |
| **R_hand_container** | Weapon attach + skill spawn | Invent new hand bone names |
| **SkinnedMesh** | Atlas + equip visibility | Second body GLB swap |

**Hard:** Do not write world position onto bone nodes for grounding. Ground **model** via Box3; bones follow skinning.

### Host group contract (runtime)

```
playerGroup.position = (worldX, sampleHeight(x,z), worldZ)  // feet on terrain
playerGroup.rotation.y = facingYaw + (artForwardOnce ? π/2 : 0)
model.scale = fitScale  // from fitCharacterHeight
// model.position.y already set so bodyBox.min.y ≈ 0 in model space
```

Terrain Y from **one** `sampleHeight(x,z)` shared with grass roots, harvest, pathfinding, SurfaceLocomotion.

### Art-forward (Toon RTS FBX)

- Kit art often faces **+X**; controller walks **local +Z**.
- Apply **once**: `playerGroup.rotation.y += Math.PI / 2` (or `facePlusZ: 'auto'` in `characterDeploy`).
- Never `model.rotation.y = π/2` **and** group π/2.

---

## Bone name candidates (first hit wins)

Canonical from `boneHelpers.ts` (`BONE_CANDIDATES`):

| Role | Names |
|------|--------|
| root | `Bip001`, `Armature`, `Root`, `mixamorig:Hips`, `Hips` |
| hips | `Bip001 Pelvis`, `Bip001`, `mixamorig:Hips`, `Hips`, `pelvis` |
| head | `Bip001 Head`, `mixamorig:Head`, `Head` |
| hand_r | `R_hand_container`, `Bip001 R Hand`, `mixamorig:RightHand`, `RightHand` |
| hand_l | `L_hand_container`, `Bip001 L Hand`, `mixamorig:LeftHand`, `LeftHand` |
| weapon | same as hand_r priority |
| shield | `L_shield_container`, then hand_l |
| foot_r | `Bip001 R Foot`, `Bip001 R Toe0`, `mixamorig:RightFoot` |
| foot_l | `Bip001 L Foot`, `Bip001 L Toe0`, `mixamorig:LeftFoot` |

Fuzzy match: case-insensitive, strip prefix spaces/underscores. Prefer **containers** over raw hand bones for attach.

---

## THREE helpers (debug / /space studio)

| Helper | Use |
|--------|-----|
| **`Box3Helper(box, color)`** | Visualize skinned body AABB after fit/ground |
| **`AxesHelper(size)`** | Local axes on group / bone markers (size in **metres**, e.g. 0.18) |
| **`SkeletonHelper(skinnedMesh)`** | Bone chain QA (Bip001 tree) |
| **`createBoneHelperGroup(root)`** | Role spheres + axes + labels on hands/feet/hips (`/space`) |
| **`sampleBoneWorldPositions(root)`** | Export world positions for collider authoring |

```js
// Debug feet / height
const box = bodyBox(model);
const size = box.getSize(new THREE.Vector3());
console.log({ heightM: size.y, minY: box.min.y, maxY: box.max.y });
scene.add(new THREE.Box3Helper(box, 0x00ff00));

// /space bone markers (metres)
import { createBoneHelperGroup, sampleBoneWorldPositions } from "./helpers/boneHelpers";
const helpers = createBoneHelperGroup(kit, { scale: 0.08 });
// helpers.userData.dispose() when clearing scene
```

Marker default size **0.08 m** ≈ palm — stays SI-correct next to 1.8 m humans.

---

## Deploy order (nodes + Box3)

```
1. Load kit (FBX SSOT / approved GLB)
2. unifySkeletons if multi-skin
3. bodyBox → fitCharacterHeight(1.8)   // scale + XZ pelvis + feet local
4. Atlas rebind (sRGB, flipY=false for FBX path)
5. EquipmentManager hide → show mesh_ids
6. bodyBox again → groundFeetLocal + centerXZ if equip changed AABB
7. art-forward once (facePlusZ auto)
8. Parent under playerGroup; group.position.y = sampleHeight
9. Anim pack + stripPositionTracks; sample idle → reGroundAfterAnimSample
10. Optional: bone helpers / Box3Helper for QA
11. Capsule KCC + SurfaceLocomotion (see ik-colliders-physics.md)
```

---

## Code pointers

| Concern | Path |
|---------|------|
| bodyBox / fit / unit decade | `gameopen/.../fitCharacterHeight.ts` |
| deploy + groundFeetLocal + facePlusZ | `gameopen/.../characterDeploy.ts` |
| Equipment bones | `player-and-grass/src/play/equipment-manager.js` |
| Bone helpers | `player-and-grass/src/space/helpers/boneHelpers.ts` |
| Capsule SI | `gameopen/lib/grudge-physics/src/constants.ts` (`PLAYER_CAPSULE`, `PLAYER_HEIGHT_M`) |

---

## Anti-patterns

1. Pelvis Y = groundY as “feet”
2. Measure full scene graph including hidden Body_A–E all visible
3. Fit weapons/arrows to 1.8 m
4. Ground once, then play hip **position** tracks without re-ground
5. Double art-forward yaw
6. Attach weapons to scene root instead of `R_hand_container`
7. Helper sizes in “arbitrary units” (always metres)
