/**
 * convert-skins.mjs
 *
 * Reads the source `.tga` skin variants from the Asset-Rig-Editor Toon_RTS
 * tree and emits per-race PNGs into `character/races/textures/<raceId>/`.
 *
 * Source tree (per faction):
 *   <SOURCE_ROOT>/<Faction>/models/Materials/<*.tga>
 *
 * Output:
 *   character/races/textures/<raceId>/<variantId>.png
 *
 * Variant ids are normalised to the lowercase suffix of the file name with
 * the race prefix stripped:
 *   WK_StandardUnits_blue.tga      → human/blue.png
 *   WK_Standard_Units.tga          → human/default.png
 *   ELF_DarkElves_Texture.tga      → elf/dark.png
 *   ELF_DarkElves_Blue.tga         → elf/dark-blue.png
 *   BRB_Standard_Units_brown.tga   → barbarian/brown.png
 *   ORC_Wolf_texture_A.tga         → (skipped — mount, not character)
 *
 * The output PNGs are then ready for `npm run upload:r2`, which ships them
 * to assets.grudge-studio.com/characters/races/<raceId>/skins/<variantId>.png.
 *
 * Usage:
 *   npm run convert:skins
 *   GRUDGE_RACE_FBX_ROOT="<path>" npm run convert:skins  (override source)
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

const SOURCE_ROOT =
  process.env.GRUDGE_RACE_FBX_ROOT ||
  "C:/Users/nugye/Documents/Asset-Rig-Editor/Asset-Rig-Editor/artifacts/character-customizer/public/models/toon_rts/Toon_RTS";

const OUT_ROOT = path.join(PROJECT_ROOT, "character", "races", "textures");

// Faction folder → race id used by `src/shared/config.ts` and player-config.js.
const FACTIONS = [
  { folder: "WesternKingdoms", raceId: "human", prefix: "WK_" },
  { folder: "Barbarians",      raceId: "barbarian", prefix: "BRB_" },
  { folder: "Elves",           raceId: "elf", prefix: "ELF_" },
  { folder: "Dwarves",         raceId: "dwarf", prefix: "DWF_" },
  { folder: "Orcs",            raceId: "orc", prefix: "ORC_" },
  { folder: "Undead",          raceId: "undead", prefix: "UD_" },
];

/** Skip horse/wolf mount textures — those are not body-character skins. */
const SKIP_RE = /(_?wolf_|_?horse_|cavalry_|catapult_)/i;

// ── Pure-JS TGA decoder (uncompressed 24/32-bit + RLE) ──────────────────────
// Sharp's prebuilt binaries don't include libvips' TGA decoder, so we decode
// to raw BGR(A) here and pipe the raw buffer through sharp for PNG encoding.
function decodeTGA(buf) {
  if (buf.length < 18) throw new Error("TGA: too short");
  const idLength = buf[0];
  const colorMapType = buf[1];
  const imageType = buf[2];
  const width = buf[12] | (buf[13] << 8);
  const height = buf[14] | (buf[15] << 8);
  const pixelDepth = buf[16];
  const imageDescriptor = buf[17];
  if (colorMapType !== 0) throw new Error("TGA: color-mapped not supported");
  if (![2, 3, 10, 11].includes(imageType)) throw new Error(`TGA: image type ${imageType} not supported`);
  if (![24, 32, 8].includes(pixelDepth)) throw new Error(`TGA: pixelDepth ${pixelDepth} not supported`);
  const channels = pixelDepth / 8;
  const dataStart = 18 + idLength;
  const totalPx = width * height;
  const pixels = Buffer.alloc(totalPx * 4); // always emit RGBA
  let p = dataStart;
  let i = 0;
  const writePx = (b, g, r, a) => {
    pixels[i] = r;
    pixels[i + 1] = g;
    pixels[i + 2] = b;
    pixels[i + 3] = a;
    i += 4;
  };
  if (imageType === 2 || imageType === 3) {
    // Uncompressed RGB(A) or grayscale.
    for (let n = 0; n < totalPx; n++) {
      if (channels === 4) writePx(buf[p], buf[p + 1], buf[p + 2], buf[p + 3]);
      else if (channels === 3) writePx(buf[p], buf[p + 1], buf[p + 2], 255);
      else writePx(buf[p], buf[p], buf[p], 255);
      p += channels;
    }
  } else {
    // RLE-compressed.
    let n = 0;
    while (n < totalPx) {
      const header = buf[p++];
      const count = (header & 0x7f) + 1;
      if (header & 0x80) {
        const b = buf[p], g = buf[p + 1], r = buf[p + 2], a = channels === 4 ? buf[p + 3] : 255;
        p += channels;
        for (let k = 0; k < count; k++) writePx(b, g, r, a);
      } else {
        for (let k = 0; k < count; k++) {
          const b = buf[p], g = buf[p + 1], r = buf[p + 2], a = channels === 4 ? buf[p + 3] : 255;
          p += channels;
          writePx(b, g, r, a);
        }
      }
      n += count;
    }
  }
  // Bit 5 of imageDescriptor = origin top-left when set; otherwise bottom-left
  // and we need to flip Y so the PNG renders right-side-up.
  const flipY = (imageDescriptor & 0x20) === 0;
  if (flipY) {
    const row = width * 4;
    const flipped = Buffer.alloc(pixels.length);
    for (let y = 0; y < height; y++) {
      pixels.copy(flipped, (height - 1 - y) * row, y * row, y * row + row);
    }
    return { width, height, data: flipped };
  }
  return { width, height, data: pixels };
}

function variantIdFor(prefix, file) {
  // Strip extension + race prefix.
  const base = file.replace(/\.tga$/i, "");
  let id = base.replace(new RegExp("^" + prefix.replace(/_$/, "_?"), "i"), "");
  // Drop the boilerplate "StandardUnits" / "Standard_Units" / "Units" tokens
  // and the trailing "Texture" suffix Unity adds. The remaining suffix (if
  // any) is the variant name; if nothing's left it's the base "default" skin.
  id = id
    .replace(/Standard_?Units_?/gi, "")
    .replace(/^Units_?/i, "")
    .replace(/_?Texture/gi, "")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  if (!id) id = "default";
  return id;
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function convertOne(srcTga, dstPng) {
  // Pure-JS TGA decode → sharp re-encodes the raw RGBA buffer as PNG.
  // We orient the output so it matches three.js's `flipY = false` GLB
  // texture convention (Unity exports TGAs bottom-up; decodeTGA flips so
  // origin is top-left).
  const tga = await fs.readFile(srcTga);
  const { width, height, data } = decodeTGA(tga);
  await sharp(data, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(dstPng);
}

/** Recursively collect all `*.tga` files under `dir`. */
async function findTgas(dir) {
  const out = [];
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); }
  catch { return out; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await findTgas(full));
    else if (entry.isFile() && /\.tga$/i.test(entry.name)) out.push(full);
  }
  return out;
}

async function processFaction(faction) {
  const matsDir = path.join(SOURCE_ROOT, faction.folder, "models", "Materials");
  if (!(await exists(matsDir))) {
    console.warn(`[convert-skins] missing ${faction.raceId}: ${matsDir}`);
    return { ok: 0, fail: 0 };
  }
  const outDir = path.join(OUT_ROOT, faction.raceId);
  await ensureDir(outDir);

  // Recursively scan Materials/ (Color/, etc.) so we pick up all variant TGAs
  // regardless of which subfolder the asset pack put them in.
  const all = (await findTgas(matsDir)).filter((p) => !SKIP_RE.test(path.basename(p)));
  if (!all.length) {
    console.warn(`[convert-skins] no TGAs found for ${faction.raceId} under ${matsDir}`);
    return { ok: 0, fail: 0 };
  }

  let ok = 0, fail = 0;
  for (const src of all) {
    const baseFile = path.basename(src);
    const variant = variantIdFor(faction.prefix, baseFile);
    const dst = path.join(outDir, variant + ".png");
    try {
      await convertOne(src, dst);
      console.log(`[convert-skins] ${faction.raceId}/${variant}.png  ←  ${baseFile}`);
      ok++;
    } catch (err) {
      console.error(`[convert-skins] FAIL ${faction.raceId}/${variant} (${baseFile}): ${err?.message || err}`);
      fail++;
    }
  }
  return { ok, fail };
}

async function main() {
  console.log(`[convert-skins] source = ${SOURCE_ROOT}`);
  console.log(`[convert-skins] output = ${OUT_ROOT}`);

  let total = 0, fails = 0;
  for (const faction of FACTIONS) {
    const { ok, fail } = await processFaction(faction);
    total += ok; fails += fail;
  }
  console.log(`[convert-skins] done. ${total} png(s) written, ${fails} failures.`);
  if (fails > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error("[convert-skins] fatal:", err);
  process.exit(1);
});
