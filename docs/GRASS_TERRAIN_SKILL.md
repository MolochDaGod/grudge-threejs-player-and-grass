# Three.js Grass Terrain Skill (no Babylon)

**Source of truth:** live deploy  
`https://threejs-player-and-grass.vercel.app/play?char=barbarian`  
Implementation: `src/play/script.js` (bundled `GrassTerrain`) + clean modules  
`src/play/grass-terrain.mjs`, `src/play/terrain-layers.mjs`.

## When to use

- Island / pirate open-world vegetation  
- Grass hills and meadows as a **terrain layer**  
- Player trails that flatten blades  
- Chunk streaming grass around the player  

**Never use Babylon.** This stack is pure Three.js (`InstancedBufferGeometry` + `ShaderMaterial`).

---

## Three-layer island terrain (best practice)

| Layer | Name | Responsibility | Code |
|-------|------|----------------|------|
| **L0** | Height field | Continuous `y = f(x,z)` — SSOT for ground snap, AI, grass roots | `getTerrainHeight` |
| **L1** | Surface / bedrock | Visible ground mesh (height-sampled plane), shadows | `createTerrainChunk` → `layer_surface` |
| **L2** | Vegetation | GPU grass blades, wind, trails | `createGrassTerrain` → `layer_vegetation` |
| **L3** | Detail | Sparse rocks/props on hills | `layer_detail` |

### Hard rules

1. **One height function** — grass root Y and player feet Y must call the same `getTerrainHeight` (or `_getTerrainHeightAtWorld` wrapper). Divergence = floating feet or buried blades.
2. **Chunk keys shared** across L1+L2+L3 so streaming loads/unloads together.
3. **LOD on L2 only** — far chunks: fewer instances (e.g. 5k vs 40k); never different height math.
4. **No second physics mesh for grass** — blades are visual; walk on L0 height / L1 collider.
5. **SI / world scale** — this project uses `PLAYER_SCALE = 4.2` world units so auto-fit height is `1.8 * 4.2`. Keep character autoFit + groundY consistent with that world scale (or migrate whole world to SI 1.8 m).

---

## Height field (deploy formula)

```js
// worldX/Z in metres-of-world (or scaled units)
base   = noise(world / 220);  base = sign(base) * |base|^1.2;  // large hills
mid    = noise(world / 90);                                  // ridges
detail = noise(world / 30);                                  // bumps
y = base * 20 + mid * 1 + detail * 1 + 1;
```

---

## Grass material contracts

### Vertex

- Attributes: `offset`, `worldOffset`, `orientation`, `halfRootAngleSin/Cos`, `stretch`, `trail`, `trailDir`
- Uniforms: `time`, `bladeHeight`
- Wind: simplex noise from `time` + `worldOffset`
- Trail: push blade along `trailDir` scaled by height fraction `frc`

### Fragment

- `alphaMap` discard `< 0.15`
- Mix tip/bottom colors by `frc`
- Darken trail regions
- Soft cloud shadow via world-position noise

### Defaults (deploy)

| Param | Value |
|-------|-------|
| blade width | 0.09 |
| blade height | 1.42 |
| high instances / chunk | 40000 |
| low (LOD) instances | 5000 |
| chunk size | 120 |
| render distance | 1 chunk ring |

---

## Player integration

```js
// each frame
const terrainY = world._getTerrainHeightAtWorld(px, pz);
player.y = max(player.y + vy*dt, terrainY); // snap feet
// trails: for nearby grass instances, set trail+=decay, trailDir = move dir
```

---

## Character on grass (barbarian / grudge6)

After mesh load (see `grudge-character-correctness`):

1. Load race GLB + atlas texture (`flipY` per pipeline)  
2. `autoFit` height → `1.8 * PLAYER_SCALE` (or 1.8 m in SI worlds)  
3. Ground: `position.y -= bbox.min.y` then snap to `terrainY`  
4. Equip via mesh visibility (EquipmentManager)  
5. Face art-forward for kit type  

Entry UX: design character → **Play** → pirate open-world lobby on grass layers.

---

## Anti-patterns

| Don't | Why |
|-------|-----|
| Babylon ground/grass | Wrong engine for this fleet app |
| Separate height for grass vs controller | Floating / sinking |
| Full density grass to horizon | GPU death — use chunk LOD |
| Physics bodies per blade | Instant fail |
| Scale grass without scaling player world | Broken trail radius |

---

## Files

| File | Role |
|------|------|
| `src/play/script.js` | Production bundled World + grass (deploy) |
| `src/play/grass-terrain.mjs` | Clean extract of height + material + blades |
| `src/play/terrain-layers.mjs` | L1+L2+L3 chunk builder |
| `src/play/play-bridge.mjs` | `window.GrudgeGrass` / `window.GrudgeTerrainLayers` |
| `src/play/character-design-gate.js` | /play entry → design → pirate lobby |

## /play entry flow

1. Bare `/play` → character design gate (race, skin, loadout, combat pack, name)
2. **Play → Enter Lobby** → `sessionStorage.grudge_active_build` + `/play?char=<race>&lobby=1`
3. World boots with `PLAYER_SCALE=4.2`, autoFit `1.8*4.2`, race texture, equip loadout
4. Pirate open-world atmosphere (coastal fog/sky) + three-layer grass hills from deploy pipeline

Landing creator **Play** (`/?` ViewerPage) also navigates with `?char=` and is treated as lobby entry.
