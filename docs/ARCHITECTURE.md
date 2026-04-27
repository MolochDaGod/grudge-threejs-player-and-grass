# Architecture
## Big picture
```
┌────────────────────────────────────────────────────────────────────────┐
│  /          → src/landing/   (character creator + mainpanel iframe)    │
│  /play      → src/play/      (grass scene + HUD overlay)               │
│  /mainpanel → src/mainpanel/ (character/inventory/equipment deep view) │
│                                                                        │
│  Existing Grudge Studio infra (NOT in this repo):                      │
│    https://api.grudge-studio.com/api/characters/*  (Postgres + JWT)    │
│    https://id.grudge-studio.com/auth/*             (Grudge ID)         │
│    https://assets.grudge-studio.com/characters/*   (Cloudflare R2 CDN) │
│    https://objectstore.grudge-studio.com/*         (game data API)     │
└────────────────────────────────────────────────────────────────────────┘
```
The three pages all import from `src/shared/` and `src/grudge/`. The grass
scene is the runtime game; landing is the editor; mainpanel is the
inventory/equipment driver. Mainpanel is **always embedded as an iframe**
inside either landing or the grass scene's HUD smart-window.
## Layers
| Layer | Folder | Owns |
|-------|--------|------|
| App pages | `src/{landing,play,mainpanel}/` | HTML entrypoints + page-specific TS |
| Shared kit | `src/shared/` | `config`, `catalog`, `equipment-bridge`, `grudge-account-sdk` |
| HUD | `src/hud/` | UIlayer.html port — panels, tooltip, hotbar, smart-window |
| Gameplay | `src/grudge/` | Unity port: attributes, combat, skills, magic, AI |
| Asset pipeline | `scripts/` | `convert-races`, `convert-skins`, `upload-r2` |
| Infra | (existing) | api.grudge-studio.com, R2 bucket grudge-assets, grudge-cdn worker |
## The Build payload
The single source-of-truth for "what does the user's character look + play
like" is the `CharacterBuild` record stored in
`characters.equipment` JSONB on the existing Postgres backend.
```ts
interface CharacterBuild {
  schemaVersion: 1;
  raceId: string;          // "human"|"barbarian"|"elf"|"dwarf"|"orc"|"undead"
  classId: string;         // "warrior"|"mage"|"ranger"|"worge"
  skinVariant: string;     // "default"|"black"|"blue"|...|"darkelves"
  animationPack: string;   // "1h-shield"|"2h-melee"|"longbow"|"magic"|"rifle"
  equipped: Partial<Record<EquipSlot, string | null>>;  // slot → variant ("A"|"B"|"_default")
  hiddenMeshes: string[];  // KayKit `_parts` overrides
}
```
* All three pages read this same shape via `GrudgeAccountSDK.getActiveCharacter().equipment`.
* All three pages write changes via `GrudgeAccountSDK.saveBuild(id, build)` →
  `PATCH /api/characters/:id` with `{ equipment: build }`.
* The mainpanel posts incremental `grudge:equipment-change` messages to its
  parent page; the parent applies them through `EquipmentManager.equip` /
  `equipWeapon` / `unequip`, then debounces a `saveBuild` PATCH.
## postMessage bridge (mainpanel ↔ parent)
Defined in `src/shared/equipment-bridge.ts`. Origin-validated:
| Direction | Type | Payload |
|-----------|------|---------|
| Child → Parent | `grudge:equipment-change` | `{ slot, variant }` |
| Child → Parent | `grudge:build-request` | `{}` |
| Parent → Child | `grudge:build-push` | `{ build, characterId? }` |
The bridge accepts messages only from `window.location.origin`, the canonical
production hosts (`grudgewarlords.com`, `play.grudge-studio.com`,
`client.grudge-studio.com`, `dash.grudge-studio.com`), or any
`*.vercel.app` preview deployment.
## Asset CDN convention
All race assets live under `https://assets.grudge-studio.com/characters/`:
```
characters/
├── races/<raceId>/
│   ├── model.glb              ← produced by scripts/convert-races.mjs
│   └── skins/<variant>.png    ← produced by scripts/convert-skins.mjs
├── races/anims/<pack>.glb     ← shared animation packs
└── data/items.json            ← (Phase 5) game data API mirror
```
Bucket = `grudge-assets`. The existing `grudge-cdn` Cloudflare Worker serves
this bucket with permissive CORS + 1-year immutable caching. Asset paths are
content-hashed inside the GLB so we can cache forever without invalidation.
## EquipmentManager contract
The legacy `src/play/equipment-manager.js` (vanilla IIFE) is the **only**
place that knows how to map slot/variant → child-mesh visibility. Every page
that wants to flip a mesh on/off goes through it:
```js
const eq = new window.GrudgeEquipmentManager(racePrefix);
eq.catalog(model);             // walks the loaded GLB
eq.equip("body", "B");         // armor: shows body B, hides A/C/...
eq.equipWeapon("sword", "A");  // weapon group: hides axe/hammer/staff/bow/shield/etc first
eq.unequip("shield");
eq.applyLoadout(build.equipped);
```
The TS facade lives at `src/landing/preview.ts` (`GrudgeEquipmentManagerInstance`).
## Code patterns
* **No React.** Vanilla three.js + plain TS modules. The grass scene has been
  vanilla three.js since day one and the editor reuses 100% of its modules.
* **Classic IIFE for shared globals.** `equipment-manager.js` and
  `player-config.js` are loaded via `<script type="module">` (Vite happy)
  but their internals are IIFEs that attach to `window.*` so multiple pages
  can share them. New code should NOT do this — use ES module exports.
* **Strict TypeScript.** `noUncheckedIndexedAccess`, `strict`, `noImplicitOverride`.
* **Path aliases** (mirrored in both `tsconfig.json` and `vite.config.ts`):
  `@shared/*`, `@play/*`, `@landing/*`, `@mainpanel/*`, `@hud/*`.
* **Frozen mocks.** `src/grudge/*` exports types + `Object.freeze`d
  placeholder data. Real Unity ports replace mocks 1:1.
* **CustomEvent dispatch on `window`** for cross-module signals (`grudge:auth:ready`,
  `grudge:character:updated`, `grudge:sync:complete`). HUD tooltips and the
  mainpanel listen for these instead of polling.
## Phase plan (where this doc lives in the journey)
| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ done | Stack + asset pipeline + R2 upload |
| 2 | ✅ done | Creator + mainpanel equipment driver |
| 3 | in progress | /play reads build, controller, HUD overlay |
| 4 | pending | Gruda Legion AI + workers + NPC creation |
| 5 | pending | Full Unity gameplay port |
| 6 | pending | Bake-on-save GLB optimization |
| 7 | pending | KTX2/Meshopt + public codex |
