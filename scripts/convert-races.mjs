/**
 * convert-races.mjs
 *
 * One-shot converter for the 6 Grudge Studio race FBX models -> GLB.
 *
 *   WK_  Western Kingdoms (Human)
 *   BRB_ Barbarian
 *   ELF_ Elf
 *   DWF_ Dwarf
 *   ORC_ Orc
 *   UD_  Undead
 *
 * Source: Asset-Rig-Editor character-customizer Toon_RTS folder.
 * Output: this project's character/races/<PREFIX>_Characters.glb
 *
 * To avoid re-downloading the ~70 MB fbx2gltf binary, we reuse the copy
 * already installed in
 *   D:\Games\Models\grudgeracecharacters\variant-pipeline\node_modules\fbx2gltf
 * via createRequire(). If that path is missing, override FBX2GLTF_REQUIRE_FROM
 * (env var) or pass --fbx2gltfFrom=<path> on the CLI.
 */

import { promises as fs } from "node:fs";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

const SOURCE_ROOT =
  process.env.GRUDGE_RACE_FBX_ROOT ||
  "C:/Users/nugye/Documents/Asset-Rig-Editor/Asset-Rig-Editor/artifacts/character-customizer/public/models/toon_rts/Toon_RTS";

const OUT_DIR = path.join(PROJECT_ROOT, "character", "races");

const FBX2GLTF_REQUIRE_FROM =
  process.env.FBX2GLTF_REQUIRE_FROM ||
  // Default: reuse the fbx2gltf install from variant-pipeline so we don't
  // re-download the binary in this project.
  "D:/Games/Models/grudgeracecharacters/variant-pipeline/package.json";

// To add a new modular asset pack (e.g. an extra weapon pack or a 7th
// race), append an entry below following this shape:
//   { prefix: "FOO_", out: "FOO_Characters.glb",
//     fbx: "<sub-folder>/models/FOO_Characters_customizable.FBX" }
// Then mirror the FBX into ../character/races/Foo.fbx (the runtime
// player-config.js loads .fbx directly, so .glb is only needed if you
// want a faster cold-start) and add a matching entry to
// `CHARACTERS` in src/player-config.js with rigType: "bip001". The
// equipment manager auto-discovers child meshes by prefix, so the new
// pack just works in the sandbox UI as long as its mesh names follow
// the {PREFIX}Units_Body_A / _sword_A etc. conventions.
const RACES = [
  {
    prefix: "WK_",
    out: "WK_Characters.glb",
    fbx: "WesternKingdoms/models/WK_Characters_customizable.FBX",
  },
  {
    prefix: "BRB_",
    out: "BRB_Characters.glb",
    fbx: "Barbarians/models/BRB_Characters_customizable.FBX",
  },
  {
    prefix: "ELF_",
    out: "ELF_Characters.glb",
    fbx: "Elves/models/ELF_Characters_customizable.FBX",
  },
  {
    prefix: "DWF_",
    out: "DWF_Characters.glb",
    fbx: "Dwarves/models/DWF_Characters_customizable.FBX",
  },
  {
    prefix: "ORC_",
    out: "ORC_Characters.glb",
    fbx: "Orcs/models/ORC_Characters_Customizable.FBX",
  },
  {
    prefix: "UD_",
    out: "UD_Characters.glb",
    fbx: "Undead/models/UD_Characters_customizable.FBX",
  },
];

function resolveFbx2Gltf() {
  if (!existsSync(FBX2GLTF_REQUIRE_FROM)) {
    throw new Error(
      `Could not find fbx2gltf install path: ${FBX2GLTF_REQUIRE_FROM}\n` +
        `Set FBX2GLTF_REQUIRE_FROM to the package.json of any project that has fbx2gltf installed,` +
        ` or run \`npm install fbx2gltf\` here.`,
    );
  }
  const require = createRequire(FBX2GLTF_REQUIRE_FROM);
  // fbx2gltf exports a function: convert(srcFile, destFile, opts) -> Promise<destFile>
  return require("fbx2gltf");
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function convertOne(convert, race, { force }) {
  const src = path.join(SOURCE_ROOT, race.fbx);
  const dst = path.join(OUT_DIR, race.out);

  if (!existsSync(src)) {
    console.warn(
      `[convert-races] SKIP ${race.prefix}: source missing -> ${src}`,
    );
    return false;
  }
  if (!force && existsSync(dst)) {
    console.log(
      `[convert-races] OK   ${race.prefix}: already converted (${path.relative(PROJECT_ROOT, dst)})`,
    );
    return true;
  }

  console.log(
    `[convert-races] CONV ${race.prefix}\n    src=${src}\n    dst=${dst}`,
  );

  // fbx2gltf writes a binary GLB when the destination ends in .glb, and embeds
  // textures by default. --khr-materials-unlit keeps the toon flat shading
  // these models were authored with. --compute-normals missing fills in any
  // gaps. --keep-attribute color keeps vertex colors if present.
  const opts = [
    "--khr-materials-unlit",
    "--embed",
    "--compute-normals",
    "missing",
  ];

  const result = await convert(src, dst, opts);
  console.log(`    ok -> ${path.relative(PROJECT_ROOT, result)}`);
  return true;
}

(async () => {
  const force = process.argv.includes("--force");
  await ensureDir(OUT_DIR);
  const convert = resolveFbx2Gltf();

  let ok = 0;
  let failed = 0;
  for (const race of RACES) {
    try {
      const success = await convertOne(convert, race, { force });
      if (success) ok++;
    } catch (err) {
      failed++;
      console.error(
        `[convert-races] FAIL ${race.prefix}:`,
        err?.message || err,
      );
      process.exitCode = 1;
    }
  }
  console.log(`[convert-races] done: ${ok} ok, ${failed} failed`);
})();
