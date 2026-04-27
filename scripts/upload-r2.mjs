/**
 * upload-r2.mjs
 *
 * One-shot uploader for race GLBs + animation packs + skin PNGs into the
 * EXISTING Cloudflare R2 bucket `grudge-assets` (CDN: assets.grudge-studio.com).
 *
 * Reads credentials from the repo `.env` (gitignored). The keys we need:
 *   CF_ACCOUNT_ID                — for the R2 endpoint URL
 *   OBJECT_STORAGE_KEY           — R2 access key id
 *   OBJECT_STORAGE_SECRET        — R2 secret access key
 *   OBJECT_STORAGE_BUCKET        — defaults to "grudge-assets"
 *
 * Layout we push (matches src/shared/config.ts URL helpers):
 *   characters/races/<raceId>/model.glb
 *   characters/races/<raceId>/skins/<variant>.png
 *   characters/races/anims/<pack>.glb
 *
 * Usage:
 *   npm run upload:r2                 # upload everything that's local
 *   npm run upload:r2 -- --dry-run    # list, don't upload
 *   npm run upload:r2 -- --force      # re-upload even if remote exists
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

// Load .env from repo root.
dotenv.config({ path: path.join(PROJECT_ROOT, ".env") });

const {
  CF_ACCOUNT_ID,
  OBJECT_STORAGE_KEY,
  OBJECT_STORAGE_SECRET,
  OBJECT_STORAGE_BUCKET = "grudge-assets",
  OBJECT_STORAGE_REGION = "auto",
  OBJECT_STORAGE_PUBLIC_URL = "https://assets.grudge-studio.com",
} = process.env;

if (!CF_ACCOUNT_ID || !OBJECT_STORAGE_KEY || !OBJECT_STORAGE_SECRET) {
  console.error(
    "[upload-r2] missing credentials. Set CF_ACCOUNT_ID, OBJECT_STORAGE_KEY, OBJECT_STORAGE_SECRET in .env (see .env.example).",
  );
  process.exit(1);
}

const ENDPOINT = `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const s3 = new S3Client({
  region: OBJECT_STORAGE_REGION,
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: OBJECT_STORAGE_KEY,
    secretAccessKey: OBJECT_STORAGE_SECRET,
  },
});

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const FORCE = args.has("--force");

// ── Race id → file name mapping (matches src/play/player-config.js) ─────────
const RACES = [
  { id: "human", glb: "WK_Characters.glb" },
  { id: "barbarian", glb: "BRB_Characters.glb" },
  { id: "elf", glb: "ELF_Characters.glb" },
  { id: "dwarf", glb: "DWF_Characters.glb" },
  { id: "orc", glb: "ORC_Characters.glb" },
  { id: "undead", glb: "UD_Characters.glb" },
];

const RACES_DIR = path.join(PROJECT_ROOT, "character", "races");
const ANIMS_DIR = path.join(RACES_DIR, "anims");
const SKINS_DIR = path.join(RACES_DIR, "textures");

const CONTENT_TYPES = {
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".json": "application/json",
};

function contentType(file) {
  return CONTENT_TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream";
}

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

async function md5(file) {
  const buf = await fs.readFile(file);
  return crypto.createHash("md5").update(buf).digest("hex");
}

async function alreadyUploaded(key, localFile) {
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: OBJECT_STORAGE_BUCKET, Key: key }));
    if (!head.ETag) return false;
    const remoteEtag = head.ETag.replace(/^"|"$/g, "");
    const localMd5 = await md5(localFile);
    return remoteEtag === localMd5;
  } catch (err) {
    if (err?.$metadata?.httpStatusCode === 404 || err?.name === "NotFound") return false;
    throw err;
  }
}

async function uploadFile(key, localFile) {
  if (!FORCE && (await alreadyUploaded(key, localFile))) {
    console.log(`[upload-r2] skip  ${key}  (etag matches)`);
    return false;
  }
  if (DRY_RUN) {
    console.log(`[upload-r2] dry-run ${key}  (${localFile})`);
    return false;
  }
  const Body = await fs.readFile(localFile);
  await s3.send(new PutObjectCommand({
    Bucket: OBJECT_STORAGE_BUCKET,
    Key: key,
    Body,
    ContentType: contentType(localFile),
    CacheControl: "public, max-age=31536000, immutable",
  }));
  console.log(`[upload-r2] PUT   ${key}  (${(Body.length / 1024).toFixed(1)} KB)  → ${OBJECT_STORAGE_PUBLIC_URL}/${key}`);
  return true;
}

async function main() {
  console.log(`[upload-r2] bucket=${OBJECT_STORAGE_BUCKET} endpoint=${ENDPOINT} dryRun=${DRY_RUN} force=${FORCE}`);

  let pushed = 0;
  let total = 0;

  // 1. Race GLBs.
  for (const race of RACES) {
    const local = path.join(RACES_DIR, race.glb);
    if (!(await exists(local))) {
      console.warn(`[upload-r2] missing ${race.id} GLB at ${local}, skipping`);
      continue;
    }
    total++;
    if (await uploadFile(`characters/races/${race.id}/model.glb`, local)) pushed++;
  }

  // 2. Animation packs.
  if (await exists(ANIMS_DIR)) {
    const animFiles = (await fs.readdir(ANIMS_DIR)).filter((f) => /\.glb$/i.test(f));
    for (const f of animFiles) {
      total++;
      const id = path.basename(f, path.extname(f));
      if (await uploadFile(`characters/races/anims/${id}.glb`, path.join(ANIMS_DIR, f))) pushed++;
    }
  }

  // 3. Skin PNGs (produced by scripts/convert-skins.mjs).
  if (await exists(SKINS_DIR)) {
    const races = await fs.readdir(SKINS_DIR);
    for (const raceDir of races) {
      const dir = path.join(SKINS_DIR, raceDir);
      const stat = await fs.stat(dir).catch(() => null);
      if (!stat?.isDirectory()) continue;
      for (const f of await fs.readdir(dir)) {
        if (!/\.png$/i.test(f)) continue;
        total++;
        const variant = path.basename(f, path.extname(f));
        const key = `characters/races/${raceDir}/skins/${variant}.png`;
        if (await uploadFile(key, path.join(dir, f))) pushed++;
      }
    }
  }

  console.log(`[upload-r2] done. ${pushed} pushed / ${total} considered.`);
}

main().catch((err) => {
  console.error("[upload-r2] fatal:", err);
  process.exit(1);
});
