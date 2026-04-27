// vite.config.ts
//
// Multi-page Vite build for grudge-threejs-player-and-grass.
//
//   /             → src/landing/index.html (character creator)
//   /play         → src/play/index.html    (grass scene + HUD)
//   /mainpanel    → src/mainpanel/index.html (character / inventory / equip)
//
// All three pages share `src/shared/` (GrudgeAccountSDK, equipment bridge, R2
// asset URL helpers) and read/write character builds via the existing
// `https://api.grudge-studio.com/api/characters/*` Postgres backend.
//
// `character/`, `favicon.svg`, etc. live at the repo root and are served by
// Vite's `publicDir`. The race GLBs + skin PNGs are also mirrored on R2 at
// `https://assets.grudge-studio.com/characters/...` for prod.
import { defineConfig, type Plugin } from "vite";
import { resolve, join } from "node:path";
import { createReadStream, statSync, existsSync } from "node:fs";

/** Serve `/character/*` (race GLBs + animation packs + textures) directly
 *  from the repo root during dev so the existing relative paths in
 *  `src/play/player-config.js` keep working without copying the 3 MB of
 *  GLBs into `public/`. Production reads from R2 via
 *  `https://assets.grudge-studio.com/characters/...`. */
function grudgeCharacterAssets(): Plugin {
  const root = resolve(__dirname);
  return {
    name: "grudge-character-assets",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (!req.url) return next();
        const url = new URL(req.url, "http://x");
        if (!url.pathname.startsWith("/character/") &&
            !url.pathname.startsWith("/Character-Animator-Mapper/")) return next();
        const local = join(root, decodeURIComponent(url.pathname));
        if (!existsSync(local) || !statSync(local).isFile()) return next();
        const ext = local.split(".").pop()?.toLowerCase();
        const type =
          ext === "glb" ? "model/gltf-binary" :
          ext === "gltf" ? "model/gltf+json" :
          ext === "png" ? "image/png" :
          ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
          ext === "json" ? "application/json" :
          "application/octet-stream";
        _res.setHeader("Content-Type", type);
        _res.setHeader("Access-Control-Allow-Origin", "*");
        _res.setHeader("Cache-Control", "no-cache");
        createReadStream(local).pipe(_res);
      });
    },
  };
}

export default defineConfig({
  // Project root stays at the repo root so `character/`, `dist/`, etc. resolve
  // the same way as the legacy single-page build.
  root: __dirname,
  // Anything under `public/` is copied verbatim. We instead serve `character/`
  // and the favicons directly from the repo root via `publicDir = '.'`. Vite
  // refuses publicDir === root, so we use a tiny `public/` proxy folder
  // (created in scripts/setup-public.mjs) to avoid colliding with src/.
  publicDir: "public",
  resolve: {
    alias: {
      "@shared": resolve(__dirname, "src/shared"),
      "@play": resolve(__dirname, "src/play"),
      "@landing": resolve(__dirname, "src/landing"),
      "@mainpanel": resolve(__dirname, "src/mainpanel"),
      "@hud": resolve(__dirname, "src/hud"),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    fs: {
      // Allow serving files from the entire repo (character/, etc.) during dev.
      allow: [resolve(__dirname)],
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        landing: resolve(__dirname, "src/landing/index.html"),
        play: resolve(__dirname, "src/play/index.html"),
        mainpanel: resolve(__dirname, "src/mainpanel/index.html"),
      },
    },
  },
  // Surface the public CDN URL + API base + Grudge ID URL to the client bundle
  // via Vite's `import.meta.env.VITE_*` mechanism. The .env file in the repo
  // root is the source of truth for development; production deploys override
  // these via Vercel project env vars.
  envPrefix: ["VITE_"],
  plugins: [grudgeCharacterAssets()],
});
