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

export const ASSETS_URL =
  import.meta.env.VITE_ASSETS_URL ?? "https://assets.grudge-studio.com";

export const OBJECTSTORE_URL =
  import.meta.env.VITE_OBJECTSTORE_URL ?? "https://objectstore.grudge-studio.com";

/** Build a full URL to a binary asset on the Cloudflare R2 / CDN origin. */
export function assetUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${ASSETS_URL}${clean}`;
}

/** Per-race CDN paths. The 6 race GLBs + skins + animation packs all live
 *  under `characters/races/...` on the existing `grudge-assets` bucket. */
export function raceModelUrl(raceId: string): string {
  return assetUrl(`/characters/races/${raceId}/model.glb`);
}

export function raceSkinUrl(raceId: string, variant: string): string {
  return assetUrl(`/characters/races/${raceId}/skins/${variant}.png`);
}

export function animationPackUrl(packId: string): string {
  return assetUrl(`/characters/races/anims/${packId}.glb`);
}
