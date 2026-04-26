/**
 * convert-anims.mjs
 *
 * Walks every *.fbx in character/races/anims/ and converts it to *.glb
 * via the fbx2gltf binary already installed in the variant-pipeline
 * project. The Player class only loads .glb files (it uses GLTFLoader),
 * so this is the bridge that makes idle/walk/run/attack actually animate
 * the Bip001 race characters at runtime.
 *
 * The resulting GLBs share the Bip001 skeleton bone names with the race
 * character models, so the animation tracks bind directly with no
 * retargeting needed.
 */

import { promises as fs } from "node:fs";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const ANIM_DIR = path.join(PROJECT_ROOT, "character", "races", "anims");

const FBX2GLTF_REQUIRE_FROM =
  process.env.FBX2GLTF_REQUIRE_FROM ||
  "D:/Games/Models/grudgeracecharacters/variant-pipeline/package.json";

function resolveFbx2Gltf() {
  if (!existsSync(FBX2GLTF_REQUIRE_FROM)) {
    throw new Error(
      `Could not find fbx2gltf install path: ${FBX2GLTF_REQUIRE_FROM}\n` +
        `Set FBX2GLTF_REQUIRE_FROM to the package.json of any project that has fbx2gltf installed.`
    );
  }
  const require = createRequire(FBX2GLTF_REQUIRE_FROM);
  return require("fbx2gltf");
}

async function listFbxAnims(dir) {
  if (!existsSync(dir)) return [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && /\.fbx$/i.test(e.name))
    .map((e) => path.join(dir, e.name));
}

async function convertOne(convert, src, { force }) {
  const dst = src.replace(/\.fbx$/i, ".glb");
  if (!force && existsSync(dst)) {
    console.log(`[convert-anims] OK   ${path.basename(src)}: already converted`);
    return true;
  }
  console.log(`[convert-anims] CONV ${path.basename(src)} -> ${path.basename(dst)}`);
  // --skin-ranges is left default. We keep --embed off for animation files
  // because the typical anim FBX has no real materials and embedding pads
  // the GLB with junk. --compute-normals=missing is harmless.
  const opts = ["--khr-materials-unlit", "--compute-normals", "missing"];
  await convert(src, dst, opts);
  return true;
}

(async () => {
  const force = process.argv.includes("--force");
  const fbxs = await listFbxAnims(ANIM_DIR);
  if (!fbxs.length) {
    console.log(`[convert-anims] No .fbx files found in ${ANIM_DIR}`);
    return;
  }
  const convert = resolveFbx2Gltf();
  let ok = 0;
  let failed = 0;
  for (const src of fbxs) {
    try {
      const success = await convertOne(convert, src, { force });
      if (success) ok++;
    } catch (err) {
      failed++;
      console.error(`[convert-anims] FAIL ${path.basename(src)}:`, err?.message || err);
      process.exitCode = 1;
    }
  }
  console.log(`[convert-anims] done: ${ok} ok, ${failed} failed`);
})();
