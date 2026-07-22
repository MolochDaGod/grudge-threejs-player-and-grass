# Fleet gap audit — player-and-grass vs Open / Railway / voxel

**Date:** 2026-07-22  
**Scope:** Gaps from skill chat + account DB + maps + terrain/harvest + loco states

Legend: **DONE** · **HALF** (exists, not wired / incomplete) · **MISSING**

---

## A. Player-and-grass app gaps

| Item | Status | Evidence |
|------|--------|----------|
| Design gate → lobby | **DONE** | `character-design-gate.js`, live `/play` |
| Equip default (no invisible kit) | **DONE** | script.js loadout fallback + gate loadouts |
| Texture / scale 4.2 fit | **DONE** | PLAYER_SCALE, autoFit, resolveCharacter |
| Grass L0 height + L2 blades (bundled) | **DONE** | `script.js` getTerrainHeight + createGrassTerrain |
| Clean modules `grass-terrain.mjs` / `terrain-layers.mjs` | **HALF** | Exist + `window.GrudgeGrass`; **World still uses inlined script.js copy** — not single import |
| `/space` bone helpers, colliders, body regions, colors | **DONE** (author) | `src/space/*` live |
| `grudge_space_variant` applied in `/play` | **MISSING** | Written in Space `sendToPlay`; **no reader** in script.js / sdk-bootstrap |
| Dual scale SI↔4.2 conversion at handoff | **HALF** | Space SI 1.8; Play 1.8×4.2 stamped; **no runtime conversion helper** for colliders/regions |
| Auth save/load build | **HALF** | `GrudgeAccountSDK` + `sdk-bootstrap` **present**; needs JWT; sessionStorage gate does not require login |
| D1 gear_presets in gate | **MISSING** | Local LOADOUT_PRESETS only |

---

## B. Shared account / voxel user database

| Item | Status | Evidence / SSOT |
|------|--------|-----------------|
| **Player characters Postgres (Railway)** | **DONE** (fleet) | `grudge-api-production` · `/api/characters` · skill `grudge-production-wiring` |
| **Grudge ID JWT** | **DONE** (fleet) | `id.grudge-studio.com` · token keys `grudge_auth_token` etc. |
| **Account bag / inventory shared** | **DONE** (fleet) | Railway `/api/account/*` · crafting Puter uses same DB |
| **Home island seeds** | **DONE** (fleet) | Railway `home_islands` |
| **player-and-grass using Railway correctly** | **HALF** | SDK vendored; **gate/lobby prefer sessionStorage**; no voxel-specific account fields |
| **Voxel builder ↔ Grudge user link** | **MISSING / RED** | `grudge-voxel-builder` is local Magica/Three editor (Babylon deps in tree); **not** wired to Railway characters |
| **Open voxel mode account** | **HALF** | Open has voxel editor + gallery maps; inventory has boat/mount slots; **not unified “voxel account profile” table** beyond characters JSONB |
| **Puter KV as SSOT** | **FORBIDDEN** | Cache only — never sole store for bag/XP |

**Correct setup (already fleet law):**

```
Grudge ID (login)
  → JWT
  → Railway Postgres (characters + account bag + islands)
  → Game clients (Open, Warlords, player-and-grass SDK, crafting)
ObjectStore / D1 / R2 = assets only, not player progress
```

**Voxel account “needs setup”** = wire voxel editor saves to **character UUID + Railway equipment/island JSON**, not a second DB.

---

## C. Maps & pre-made modes

| Item | Status | Where |
|------|--------|-------|
| Production archetypes | **DONE** (rules) | `home\|mountain\|volcanic\|tropical\|plains\|boss\|event` + hellmaw `s` |
| Open modes danger / play / voxel | **DONE** | App.tsx mounts Studio / VoxelEditor |
| Voxel map catalog + scale rules | **DONE** | `lib/voxel-canonical` · `mapAssetScale.ts` (map vs prop) |
| Island-life deployments JSON | **HALF** | `content/worlds/island-life-deployments.json` + docs — QA on prod required |
| Dragon head cave map entry | **DONE** (catalog) | mapAssetScale + harvestCatalog |
| player-and-grass multi-map modes | **MISSING** | Single procedural grass world only |
| Map bake pipeline (meshopt shell &lt;6MB) | **HALF** | Rules in productionWorldRules; bake via grudge-asset-convert |
| Premade mode review (rts/rpg/fps packs in voxel-builder/vox) | **HALF** | Many `.txt`/zip prototypes in `grudge-voxel-builder/vox/` — **not production SSOT** |

**Review rule:** Prefer Open + CDN sector shells; treat voxel-builder zips as **authoring only**.

---

## D. Terrain · harvest · layers · bake · colliders · height

| Item | Status | Notes |
|------|--------|-------|
| **Layer model (shell / kit / seed / runtime)** | **DONE** (docs+code rules) | `productionWorldRules.ts` · skill production-world |
| **Physics layers enum** | **DONE** | Terrain Player NPC Water Projectile… |
| **Height sample for feet** | **HALF** | Open: controllers sample height / dungeon water bands; player-and-grass: `_getTerrainHeightAtWorld` **noise only** (no mesh heightfield bake) |
| **Feet IK on terrain** | **HALF / MISSING** | Character ground uses bbox/height snap; **full IK foot planting not SSOT in player-and-grass** |
| **Harvestables on terrain Y** | **HALF** | Camp `harvest_node` placeables set Y; Open carrier mining; **not in grass lobby** |
| **Pathfinding on terrain above water** | **HALF** | Rules: navmesh Terrain only, no deep water; Carrier continuous seek; **island navmesh bake incomplete / per-world** |
| **Baked mesh + texture + collider packs** | **HALF** | convert skill + worldMeshDeploy collider kinds; many shells still need re-bake verify |
| **Grass L1 surface collider** | **MISSING** in play | Visual plane + height fn; no Rapier heightfield |
| **Water columns** | **DONE** (rules + dungeon water.ts) | swim/ground band; boats need full column |
| **player-and-grass water** | **MISSING** | Fog/sky only; no water volume / swim |

**Height contract (must stay one function):**

```
sampleHeight(x,z)  // L0 SSOT
  → feet snap
  → harvestable.y
  → pathfind agent.y
  → grass blade root.y
```

Never separate “visual terrain” vs “logic terrain” heights.

---

## E. State machines: water · climb · vehicle

| State | Status | Code / skill |
|-------|--------|--------------|
| **Ground walk/run** | **DONE** many surfaces | Controller + AnimationDirector |
| **Swim / in water** | **HALF** | dungeon `water.ts` traversalMode swim|ground; HUD `locoCam===swim`; **not unified vehicle enum** |
| **Wall climb / wall-run** | **HALF** | Controller wall-run + ledge probe in grudge-physics `probes.ts` |
| **Boat** | **HALF** | boat loaders/registry, boarding system (Meshy issues historically); inventory slot boat; **boarding captain fleet kit incomplete** |
| **Mount (horse/cavalry)** | **HALF** | skill grudge6-toon-rts-mounts-siege; inventory mount slot; **not one VehicleState in all clients** |
| **Flying dragon** | **HALF** | anim catalog “Dragon (3 motion loops)”; map dragon_head_cave; **no production fly vehicle state machine** |
| **Single SurfaceLocomotion enum** | **MISSING** | Pieces exist; need SSOT: `ground \| wade \| swim \| climb \| wallRun \| mount \| boat \| fly` |
| **player-and-grass loco states** | **MISSING** | Walk/run/jump/fall only |

---

## F. Skills to load by workstream

| Workstream | Skills |
|------------|--------|
| Account / voxel user SSOT | production-wiring → game-onboarding → player-and-grass |
| Terrain / harvest / shells | production-world → world-scale → asset-convert → d1-r2 → warlords-assets |
| Feet / height / IK | character-correctness → production-world → grudge-physics probes → player-and-grass |
| Water / climb / vehicles | production-world + live-servers + mounts-siege + combat-runtime |
| Maps scale / modes | voxel-canonical mapAssetScale + production-world |
| Grass lobby only | player-and-grass + modular + character-correctness |

---

## G. Recommended priority order

1. **Account truth** — every client (including voxel + grass) JWT → Railway characters/account only  
2. **Height SSOT** — one `sampleHeight` per world; wire harvest + path + feet  
3. **Bake shells** — mesh + texture + heightfield/trimesh collider per map  
4. **SurfaceLocomotion enum** — unify swim/climb/mount/boat/fly with anim packs  
5. **Wire space_variant into play** — regions/colliders from `/space`  
6. **Migrate grass world to SI 1.0** (drop 4.2) or document conversion forever  
7. **Premade maps review** — promote only CDN-verified shells; archive voxel-builder prototypes  

---

## H. player-and-grass vs Open (do not confuse)

| Concern | Open (`open.grudge-studio.com`) | player-and-grass |
|---------|----------------------------------|------------------|
| Production worlds | Yes — sectors, island-life, danger | No — grass demo lobby |
| Account DB | Full SSO + inventory | SDK optional |
| Terrain bake | Shell + seed + runtime | Procedural noise grass |
| Vehicles | Boat/mount inventory + systems | None |
| Correct place for “full game” | **Open + production-world skill** | Satellite creator + grass + space studio |
