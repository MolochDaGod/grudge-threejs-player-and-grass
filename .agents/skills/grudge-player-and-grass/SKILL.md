---
name: grudge-player-and-grass
description: >
  Canonical skill for the threejs-player-and-grass satellite app — /play design-gate
  → pirate open-world grass lobby, three-layer terrain (L0–L3), grudge6 scale/texture/equip,
  and /space Grudge GLTF Space (open GLB/FBX, bone IK helpers, colliders, body regions,
  color variants). USE WHEN: threejs-player-and-grass, player-and-grass, /play route,
  /space GLTF Space, grass hills, pirate lobby, character design gate, PLAYER_SCALE 4.2,
  grass-terrain.mjs, terrain-layers, grudge_active_build, Send to Play, instanced grass,
  blade trails. Load AFTER grudge-studio; ALWAYS pair with grudge-character-correctness
  + grudge6-modular-characters for hero mesh; grudge-world-scale for SI; threejs-skills
  for rendering. Never Babylon.
---

# grudge-player-and-grass

**Repo:** `MolochDaGod/grudge-threejs-player-and-grass`  
**Live:** https://threejs-player-and-grass.vercel.app  
**Vercel:** `grudgenexus/threejs-player-and-grass`  
**Local:** `F:\GitHub\grudge-threejs-player-and-grass`

This skill is the **product SSOT** for that app. Docs in-repo:
`docs/GRASS_TERRAIN_SKILL.md`, `docs/GRUDGE_GLTF_SPACE.md`.

---

## When to load this skill

| User / task | Load |
|-------------|------|
| Edit `/play`, lobby, design gate | **this** + character-correctness + modular-characters |
| Grass hills / terrain chunks / trails | **this** + threejs-shaders + three-instanced-lod |
| `/space` asset studio / IK / colliders / body bulk | **this** + world-scale + modular-characters |
| Deploy / Vercel / rewrites | **this** + grudge-stack / fleet |
| Race kit equip wrong / invisible pirate | modular-characters + character-correctness + **this** (equip defaults) |
| 100× scale / wrong height in play vs space | world-scale + character-correctness + **this** (dual-scale rule) |

---

## Product map (routes)

| Route | File | Role |
|-------|------|------|
| `/` | `src/landing/` | React character creator → Play |
| `/play` | `src/play/` | Design gate **or** pirate grass lobby |
| `/play?char=&lobby=1` | same | Skip gate → open-world lobby |
| `/space` | `src/space/` | Grudge GLTF Space (SI asset studio) |
| `/mainpanel` | `src/mainpanel/` | Inventory / equip panel |

Vite multi-page + `vercel.json` rewrites. Dynamic boot loads `/src/play/script.js` (copied by `grudgeCopyScriptJs` plugin).

### /play flow (hard)

```
Bare /play
  → character-design-gate.js (race, skin, loadout, pack, name)
  → Play → sessionStorage grudge_active_build
  → /play?char=<race>&lobby=1

Landing Play or ?char= present
  → treated as lobby entry (no design gate)

Lobby boot
  → World (script.js) + PLAYER_SCALE 4.2
  → autoFit 1.8 * 4.2
  → equip loadout (never leave catalog all-hidden)
  → texture from build.textureUrl / skinVariant
  → pirate atmosphere (fog/sky)
  → grass chunks (bundled) + window.GrudgeGrass modules
```

### /space flow

```
Open GLB/FBX or race button
  → fit 1.8 m SI (not 4.2 world)
  → bone helpers (root/hands/feet/weapon)
  → colliders (capsule/box metres)
  → body regions 0.75–1.35
  → color variants
  → Export JSON and/or Send → Play (stamps build + grudge_space_variant)
```

**gltfspace.com is free but not open source** — do not vend HyperLoot bundles. Use `src/space/` only.

---

## Dual scale (do not confuse)

| Surface | Unit system | Character height |
|---------|-------------|------------------|
| `/space` | **SI: 1 unit = 1 m** | Fit **1.8 m** |
| `/play` lobby | **World units** `PLAYER_SCALE = 4.2` | Fit **1.8 × 4.2** |
| Export handoff | Space JSON is metres; Play multiplies for world | `targetHeight: 1.8 * 4.2` in build |

Never fit weapons/props to human height (`grudge-world-scale` / character-correctness kill list).

---

## Three-layer terrain (grass)

| Layer | Name | Module |
|-------|------|--------|
| **L0** | Height field SSOT | `getTerrainHeight` in `grass-terrain.mjs` |
| **L1** | Surface mesh | `createTerrainChunk` → `layer_surface` |
| **L2** | Instanced grass | `createGrassTerrain` / `layer_vegetation` |
| **L3** | Detail scatter | rocks in `terrain-layers.mjs` |

**Hard rules**

1. **One height function** for grass roots **and** player snap (`world._getTerrainHeightAtWorld`).
2. Shared chunk keys for L1+L2+L3 streaming.
3. LOD = fewer blades far away — **not** different height math.
4. No physics per blade; no **Babylon**.
5. Expose API: `window.GrudgeGrass` / `window.GrudgeTerrainLayers` via `play-bridge.mjs`.

Production grass still runs inside bundled `src/play/script.js`; clean modules are the **extract + island reuse** SSOT.

---

## Character mesh / texture / equip (play)

| Step | Correct process |
|------|-----------------|
| Resolve | `GrudgePlayerConfig.resolveCharacter()` + `grudge_active_build` |
| Load | Race GLB `/character/races/{PREFIX}_Characters.glb` |
| Scale | `PLAYER_SCALE` 4.2 + autoFit to `targetHeight` |
| Texture | `textureUrl` or skins path; `flipY=false`, sRGB |
| Equip | EquipmentManager catalog → **applyLoadout** (default knight A-kit if empty) |
| Ground | Feet to terrainY from **same** height field |
| Facing | grudge6 art-forward rules (`grudge-character-correctness`) |

**Invisible pirate bug:** catalog hides all meshes; empty `equipped: {}` → nothing visible. Design gate and landing Play **must** write a full loadout; script.js falls back to knight if empty.

---

## /space helpers contract

| Feature | Module |
|---------|--------|
| Bone roles | `helpers/boneHelpers.ts` — Bip001 + Mixamo candidates |
| Colliders (m) | `helpers/colliderHelpers.ts` — body, head, weapon blade, feet |
| Body regions | `helpers/bodyRegions.ts` — chest, arms, belly, thighs, legs, overall |
| Colors | `grudge6/races.ts` `RACE_COLOR_VARIANTS` |
| Materials | `materials.ts` tint + atlas |

Export JSON shape: `unit: metre`, bones world positions, colliders, regions → session `grudge_space_variant`.

---

## Key files

| Path | Role |
|------|------|
| `src/play/script.js` | Bundled World + grass + Player (do not rebundle lightly) |
| `src/play/character-design-gate.js` | Design entry UI |
| `src/play/player-config.js` | Races, anims, resolveCharacter |
| `src/play/equipment-manager.js` | Mesh visibility equip |
| `src/play/grass-terrain.mjs` | Height + grass material |
| `src/play/terrain-layers.mjs` | L1–L3 chunks |
| `src/play/play-bridge.mjs` | window.GrudgeGrass |
| `src/space/GrudgeGltfSpace.ts` | Asset studio core |
| `vite.config.ts` | MPA + copy script.js + character/ |
| `vercel.json` | `/`, `/play`, `/space`, `/mainpanel` rewrites |

---

## Where this skill must be used (surfaces)

| Surface / task | Apply skill rules |
|----------------|-------------------|
| **This Vercel app** | All play/space/landing work |
| **Island / home-island grass** | Port L0–L2 from grass modules; keep one height SSOT |
| **Pirate / open-world lobby clones** | Design → Play → lobby + atmosphere pattern |
| **Foundry / client play handoff** | Same `grudge_active_build` shape when sending heroes to grass lobbies |
| **Combat collider authoring** | Use `/space` export; consume metres in combat runtime |
| **Variant kits (colors / bulk)** | Space color variants + body regions → export → equip pipeline |
| **Fleet audit reds on this app** | character-fleet-audit + this skill’s dual-scale note |

---

## Sibling skills (required vs optional)

### Always load with this skill when editing heroes / lobby

| Skill | Why |
|-------|-----|
| **`grudge-studio`** | Umbrella first |
| **`grudge6-modular-characters`** | Kit equip, prefixes, mesh_ids, containers |
| **`grudge-character-correctness`** | Ground, face, atlas, no hip-float, anim pack truth |
| **`grudge-world-scale`** | 1.8 m yardstick; dual-scale awareness |
| **`threejs-skills`** | Then loaders / materials / shaders as needed |

### Load when task touches that domain

| Skill | When |
|-------|------|
| **`grudge6-combat-runtime`** | Attacks, skill CDs, pack swap in lobby |
| **`grudge-warlords-assets`** | No Meshy/capsule stand-ins for race kits |
| **`grudge-asset-convert`** | Re-baking race GLB/FBX/atlas for character/ |
| **`grudge-d1-r2`** | CDN paths if moving off local `/character` |
| **`grudge-production-wiring`** | Account/character API / JWT for saved heroes |
| **`grudge-foundry`** | Align create → play handoff with Foundry slots |
| **`grudge-game-onboarding`** | Env, CORS, Vercel checklist for this satellite |
| **`grudge-stack` / `grudge-fleet`** | Deploy, domain map, project linking |
| **`threejs-loaders`** | GLTF/FBX/Draco in space |
| **`threejs-materials` / `threejs-textures`** | Atlas, tint, sRGB |
| **`threejs-shaders`** | Grass wind / trail shader edits |
| **`three-instanced-lod`** | Grass instance LOD density |
| **`threejs-helpers-physics-terrain`** | Island terrain generators if merging with haven_shore patterns |
| **`threejs-production-best-practices`** | Dispose, color management, r185+ |
| **`character-fleet-audit`** | Green/yellow/red character QA after changes |
| **`gltf-asset-pipeline`** | Theory only — not instead of convert |

### Do **not** load for this app

| Skill | Why |
|-------|-----|
| Babylon / Unity Babylon ports | App is **Three.js only** |
| `grudge-fps-combat` | Wrong combat model unless adding FPS |
| Random Meshy/AI mesh skills | Violates warlords-assets |

---

## Gaps from this chat (skills that still need application for “works correctly”)

These are **not fully wired in code yet** — agents should use the listed skills when closing gaps:

| Gap | Use skill | Action |
|-----|-----------|--------|
| Play world still **4.2** vs SI **1.0** | world-scale + production-world | Long-term migrate lobby to 1 unit=1 m **or** document conversion at every handoff |
| Space body regions / colliders **not applied in play** at runtime | this + combat-runtime | On player ready, read `grudge_space_variant` and apply region scales + collider debug |
| Color variants in Space = material tint only | modular-characters + materials | Prefer real atlas variants / skin PNGs for production; tint is preview |
| Equip not full mesh_ids / D1 presets | modular-characters + d1-r2 | Wire gear_presets from ObjectStore when online |
| Anim packs Mixamo retarget quality | combat-runtime + character-correctness | Prefer baked Bip001 packs; strip position tracks |
| Landing creator `equipped: {}` was fixed once | character-correctness | Keep loadout non-empty on every Play path |
| Previous Vercel **ERROR** deploy on bare push | game-onboarding + stack | Always `npm run build` green before push; watch build logs |
| Grass modules not yet driving **script.js** chunks | this | Optionally rewire World to import modules instead of duplicate height math |
| Auth / saved characters | production-wiring | Optional Grudge ID for build persistence |

---

## Agent checklist (before “done”)

```
[ ] /play bare → design gate visible; HUD hidden
[ ] Play → /play?char=&lobby=1 → character visible, textured, feet on grass
[ ] Height ≈ 1.8 * 4.2 in play (or documented SI if migrated)
[ ] equip loadout non-empty; not T-pose pile of meshes
[ ] terrainY shared for feet + grass
[ ] /space opens race; Fit 1.8 m; bones + colliders visible
[ ] Export JSON unit=metre; Send → Play carries raceId
[ ] No Babylon imports
[ ] vercel.json has /space rewrite; build includes space entry
[ ] grudge-character-correctness gates: feet, face, atlas
```

---

## Eval URLs

| Check | URL |
|-------|-----|
| Design gate | https://threejs-player-and-grass.vercel.app/play |
| Lobby barbarian | …/play?char=barbarian&lobby=1 |
| GLTF Space | …/space |
| Space race | …/space?race=barbarian |
| Creator | …/ |

---

## Slash / auto-invoke

- `/grudge-player-and-grass`
- Triggers: player-and-grass, /play grass, /space, pirate lobby, grass hills, design gate
