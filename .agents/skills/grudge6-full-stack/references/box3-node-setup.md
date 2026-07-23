# Box3 + Object3D node setup (grudge6 / Toon RTS)

## Why Box3

`THREE.Box3` is the only approved way to measure **height**, **feet**, and **center** after scale/equip.  
Bone world Y of pelvis is **hips**, not feet.

## Node names (Bip001 / Toon RTS)

| Role | Names to try (first hit wins) |
|------|--------------------------------|
| Hips | `Bip001 Pelvis`, `Bip001`, `mixamorig:Hips`, `Hips` |
| Head | `Bip001 Head`, `mixamorig:Head` |
| Hand R | `R_hand_container`, `Bip001 R Hand`, `mixamorig:RightHand` |
| Hand L | `L_hand_container`, `Bip001 L Hand` |
| Shield | `L_shield_container` |
| Foot R/L | `Bip001 R Foot`, `Bip001 L Foot` |

## Host group contract

```
playerGroup.position = (worldX, terrainY, worldZ)  // feet on terrain
playerGroup.rotation.y = facingYaw + artForwardOffset
model.scale = fitScale
model.position.y = -bodyBox.min.y   // local feet at 0
```

Terrain Y from **one** `sampleHeight(x,z)` shared with grass roots and pathfinding.

## Re-measure after

- Equip loadout change (visibility changes Box3)
- Animation sample of idle/attack (position tracks)
- Skin / scale tweak

## Debug

```js
const box = new THREE.Box3().setFromObject(model, true);
const size = box.getSize(new THREE.Vector3());
console.log({ heightM: size.y, minY: box.min.y, maxY: box.max.y });
// Optional: scene.add(new THREE.Box3Helper(box, 0x00ff00));
```
