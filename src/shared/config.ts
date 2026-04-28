// src/shared/config.ts
//
// Single source of truth for the public service URLs used by all three pages.
// Reads from Vite's `import.meta.env.VITE_*` at build time, falls back to the
// canonical Grudge Studio domains so the build works without a local .env.
//
// EXISTING infrastructure — DO NOT change these unless the underlying service
// moves. Documented in the repo .env.example and in the GrudgeBuilder docs at
//   https://github.com/molochdagod/GrudgeBuilder/blob/main/docs/API.md
export const GRUDGE_API_URL =
  import.meta.env.VITE_GRUDGE_API_URL ?? "https://api.grudge-studio.com";

export const GRUDGE_ID_URL =
  import.meta.env.VITE_GRUDGE_ID_URL ?? "https://id.grudge-studio.com";

// Use direct R2 URL only on grudgewarlords.com (which is whitelisted in R2's
// CORS policy).  Every other origin (Vercel preview, localhost) goes through
// the /assets-cdn proxy defined in vercel.json / vite.config.ts so CORS is
// never an issue.
export const ASSETS_URL: string = (() => {
  if (import.meta.env.VITE_ASSETS_URL) return import.meta.env.VITE_ASSETS_URL as string;
  if (typeof window !== "undefined" && window.location.hostname === "grudgewarlords.com") {
    return "https://assets.grudge-studio.com";
  }
  return "/assets-cdn";
})();

export const OBJECTSTORE_URL =
  import.meta.env.VITE_OBJECTSTORE_URL ?? "https://objectstore.grudge-studio.com";

/** Build a full URL to a binary asset on the Cloudflare R2 / CDN origin. */
export function assetUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${ASSETS_URL}${clean}`;
}

/** Per-race asset paths. We serve these directly from the deploy root
 *  (Vite’s `grudgeCharacterAssets` plugin in dev, `grudgeCopyCharacter`
 *  plugin at build time copies `character/` → `dist/character/`). The R2
 *  CDN mirror at `https://assets.grudge-studio.com/characters/...` is no
 *  longer the source of truth for these files — it lives on disk in
 *  `character/races/`. */

/** Maps `human` → `WK_`, `barbarian` → `BRB_`, etc. so we can build the
 *  on-disk filename `<PREFIX>_Characters.glb`. Kept inline (instead of
 *  importing from `./catalog`) to keep this module dependency-free. */
const RACE_PREFIX_FOR_FILE: Record<string, string> = {
  human: "WK",
  barbarian: "BRB",
  elf: "ELF",
  dwarf: "DWF",
  orc: "ORC",
  undead: "UD",
};

export function raceModelUrl(raceId: string): string {
  const prefix = RACE_PREFIX_FOR_FILE[raceId] ?? raceId.toUpperCase();
  return `/character/races/${prefix}_Characters.glb`;
}

export function raceSkinUrl(raceId: string, variant: string): string {
  return `/character/races/textures/${raceId}/${variant}.png`;
}

export function animationPackUrl(packId: string): string {
  // Bip001 race anims live under /character/races/anims/<file>.glb. The
  // landing page only uses this URL as a sessionStorage hint for /play, so
  // a missing pack just falls through to the SHARED_ANIMS chain in player-
  // config.js — not fatal.
  return `/character/races/anims/${packId}.glb`;
}
