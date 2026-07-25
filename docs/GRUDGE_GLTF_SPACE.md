# Grudge GLTF Space

**Route:** `/space`  
**Code:** `src/space/`

## About gltfspace.com

[GLTF Space](https://gltfspace.com/) (HyperLoot) is a **free browser** GLTF/GLB workspace (multi-model, KTX2, animations).  
It is **not published as open-source** (no public repository / license for the app code).  
We therefore **do not vend or fork** their minified bundle.

This project ships a **Grudge-native** Three.js workspace that covers the same practical workflow and adds fleet-specific tooling.

## Features

| Area | Capability |
|------|------------|
| Open | Drag-drop / multi file GLB · GLTF · FBX |
| Races | One-click grudge6 kits (`/character/races/*_Characters.glb`) |
| SI scale | 1 m grid, **1.8 m human yardstick**, Fit to 1.8 m |
| Anims | Clip outliner + play / stop |
| Bone helpers | root, hips, head, hand_r/l, foot_r/l, weapon, shield |
| Colliders | Body capsule, head sphere, weapon blade box, feet (metres) |
| Body regions | chest, arms, belly, thighs, legs, overall (0.75–1.35) |
| Colors | High-contrast grudge6 variant packs per race |
| Export | Variant JSON (bones, colliders, regions, tint) |
| Handoff | **Send → Play** stamps `sessionStorage` + `/play?char=&lobby=1` |

## Unit accuracy

- **1 unit = 1 metre** in the space viewport (SI).
- Fit applies `targetHeightM = 1.8` then grounds feet (`bbox.min.y → 0`).
- Body region sliders scale Bip001 bones (bulk on chest/belly = XZ).
- Play handoff uses lobby **PLAYER_SCALE = 1** and `targetHeight = 1.8` (SI).

## Production helpers (required)

| Helper | Behaviour |
|--------|-----------|
| **Weapon collider** | Box fitted to **visible weapon mesh** geometry AABB; **parented to that mesh** (not a +Y stick on `R_hand_container`). |
| **Body collider** | Capsule from body-mesh AABB after Fit (excludes sword/shield/bow). |
| **SkeletonHelper** | SkinnedMesh skeleton debug (toggle). |
| **AxesHelper** | 1 m world axes + per-asset axes (toggle). |
| **Collider edit** | Right panel: r / h / offset / box half-extents. |
| **Agent chat** | Local production commands: fit, refit colliders, export, skeleton, SI help. |
| **Refit colliders → mesh** | Re-measure after equip or bulk edits. |

**Known bad pattern (fixed):** parenting a tall Y-box to the hand bone → anim looks like the hit volume “swings down.”

## Collider / IK export shape

```json
{
  "unit": "metre",
  "humanHeightM": 1.8,
  "colliders": [
    { "id": "body_capsule", "shape": "capsule", "height": 1.0, "radius": 0.28, "offset": { "x": 0, "y": 0.95, "z": 0 } },
    { "id": "weapon_blade", "shape": "box", "box": { "x": 0.04, "y": 0.45, "z": 0.02 } }
  ],
  "bones": { "hand_r": { "x": …, "y": …, "z": …, "bone": "R_hand_container" } },
  "bodyRegions": { "regions": { "chest": { "scale": 1.1 }, … } }
}
```

Combat runtimes can read `grudge_space_variant` from sessionStorage or the downloaded JSON.

## Dev

```bash
npm run dev
# open http://localhost:5173/space
# or /space?race=barbarian
```

## Files

| Path | Role |
|------|------|
| `src/space/index.html` | Shell UI |
| `src/space/main.ts` | UI wiring |
| `src/space/GrudgeGltfSpace.ts` | Three.js workspace |
| `src/space/helpers/boneHelpers.ts` | Role bone markers |
| `src/space/helpers/colliderHelpers.ts` | Capsule/box volumes |
| `src/space/helpers/bodyRegions.ts` | Region scale |
| `src/space/grudge6/races.ts` | Kits + color variants |
| `src/space/materials.ts` | Tint / texture apply |
| `src/space/equip.ts` | Default kit visibility |
