// vite.config.ts
//
// Multi-page Vite build for grudge-threejs-player-and-grass.
//
//   /             → src/landing/index.html (character creator — React)
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
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { resolve, join, dirname, relative } from "node:path";
import {
  createReadStream,
  statSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  readdirSync,
} from "node:fs";

/** Serve `/character/*` (race GLBs + animation packs + textures) directly
 *  from the repo root during dev so the existing relative paths in
 *  `src/play/player-config.js` keep working without copying the 3 MB of
 *  GLBs into `public/`. Production reads from R2 via
 *  `https://assets.grudge-studio.com/characters/...`. */
/** Copy src/play/script.js (the bundled three.js scene + Player class — it's
 *  loaded via runtime `loadScript("/src/play/script.js")` from the boot
 *  module, NOT via a static <script> tag, so Vite's HTML transformer never
 *  sees it and it would otherwise be missing from the production build).
 *  Without this, Vercel's /play deploy 404s because the boot can't find
 *  script.js at runtime. */
function grudgeCopyScriptJs(): Plugin {
  const root = resolve(__dirname);
  const sources = [
    "src/play/script.js",
    // sandbox-spawner is also dynamically imported via boot's `import('./sandbox-spawner.js')`
    // and Vite catches that one through the import graph, so we don't need
    // to copy it. Same for player-config / equipment-manager / sdk-bootstrap
    // which are referenced via static <script type="module" src="..."> tags.
  ];
  return {
    name: "grudge-copy-script-js",
    apply: "build",
    closeBundle() {
      const outDir = resolve(root, "dist");
      for (const rel of sources) {
        const from = resolve(root, rel);
        const to = resolve(outDir, rel);
        if (!existsSync(from)) continue;
        mkdirSync(dirname(to), { recursive: true });
        copyFileSync(from, to);
        // eslint-disable-next-line no-console
        console.log(`[grudge-copy-script-js] ${rel} → dist/${rel}`);
      }
    },
  };
}

/** Copy `character/` (race GLBs, anim packs, baked diffuse textures) into
 *  dist/character/ at build time so the deployed site can serve them at
 *  /character/... — Vite only serves files under `outDir` in production,
 *  and we don't want to move 300+ MB of textures into public/ (which Vite
 *  would re-copy on every dev start). The Vite dev server already serves
 *  /character/* live via grudgeCharacterAssets() above. */
function grudgeCopyCharacter(): Plugin {
  const root = resolve(__dirname);
  const srcDir = resolve(root, "character");
  const outDir = resolve(root, "dist", "character");
  function copyRecursive(from: string, to: string, count = { n: 0 }) {
    const stat = statSync(from);
    if (stat.isDirectory()) {
      mkdirSync(to, { recursive: true });
      for (const name of readdirSync(from)) {
        copyRecursive(join(from, name), join(to, name), count);
      }
    } else {
      mkdirSync(dirname(to), { recursive: true });
      copyFileSync(from, to);
      count.n++;
    }
    return count.n;
  }
  return {
    name: "grudge-copy-character",
    apply: "build",
    closeBundle() {
      if (!existsSync(srcDir)) return;
      const counter = { n: 0 };
      copyRecursive(srcDir, outDir, counter);
      // eslint-disable-next-line no-console
      console.log(
        `[grudge-copy-character] copied ${counter.n} files from character/ → dist/character/`
      );
    },
  };
}

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
      "@": resolve(__dirname, "src/landing"),
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
    // Proxy /assets-cdn/* → assets.grudge-studio.com (R2) so dev & Vercel
    // preview builds avoid CORS: R2 only allows grudgewarlords.com, not *.vercel.app.
    proxy: {
      "/assets-cdn": {
        target: "https://assets.grudge-studio.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/assets-cdn/, ""),
      },
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
  plugins: [react(), grudgeCharacterAssets(), grudgeCopyScriptJs(), grudgeCopyCharacter()],
});
