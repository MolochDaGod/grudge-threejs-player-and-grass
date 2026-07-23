// src/play/sdk-bootstrap.ts
//
// Railway-first /play boot + equipment bridge.
//
// Priority for the active build:
//   1. JWT + Railway Postgres (`/api/characters`) — SSOT when signed in
//   2. sessionStorage `grudge_active_build` — guest / design-gate / Space handoff
//   3. DEFAULT_BUILD human knight
//
// CRITICAL: `railwayBootPromise` must settle BEFORE script.js loads so
// `resolveCharacter()` sees the Railway-stamped sessionStorage build.
//
// After player ready:
//   - apply loadout
//   - debounce-save equipment changes back to Railway when characterId present
import {
  GrudgeAccountSDK,
  type CharacterBuild,
  type EquipSlot,
  type GrudgeCharacter,
  DEFAULT_BUILD,
} from "@shared/grudge-account-sdk";
import { onEquipmentChange } from "@shared/equipment-bridge";
import { WEAPON_SLOTS, animPackForWeapon } from "@shared/catalog";
import {
  applySpaceVariantToPlayer,
  installSpaceVariantHook,
} from "./space-variant-apply";
// Side-effect listener for late player-ready
installSpaceVariantHook();

const STORAGE_KEY = "grudge_active_build";
const BOOT_META_KEY = "grudge_boot_meta";
const GRUDGE_ID_LOGIN =
  (import.meta as unknown as { env?: { VITE_GRUDGE_ID_URL?: string } }).env
    ?.VITE_GRUDGE_ID_URL ?? "https://id.grudge-studio.com";

export type BootSource = "railway" | "session" | "guest" | "url";

export interface BootMeta {
  source: BootSource;
  characterId: string | null;
  characterName: string | null;
  raceId: string;
  signedIn: boolean;
  username: string | null;
  error?: string;
  at: number;
}

interface PlayerLike {
  character?: { id: string };
  equipment?: {
    equip(slot: string, variant: string): boolean;
    unequip(slot: string): void;
    equipWeapon(slot: string, variant?: string): boolean;
    applyLoadout(loadout: Record<string, string | null>): string[];
  };
}

declare global {
  interface Window {
    GrudgePlayer?: PlayerLike;
    GrudgeBuild?: CharacterBuild & Record<string, unknown>;
    GrudgeBoot?: BootMeta;
    GrudgeAccountSDK?: typeof GrudgeAccountSDK;
    /** Settles when Railway-first resolve is done (before or with script.js). */
    GrudgeRailwayBoot?: Promise<BootMeta>;
  }
}

let activeBuild: CharacterBuild & Record<string, unknown> = {
  ...DEFAULT_BUILD,
  equipped: {
    body: "A",
    arms: "A",
    legs: "A",
    head: "A",
    shoulders: "A",
    sword: "A",
  },
};
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let bootMeta: BootMeta = {
  source: "guest",
  characterId: null,
  characterName: null,
  raceId: "human",
  signedIn: false,
  username: null,
  at: Date.now(),
};

function isCharacterBuild(value: unknown): value is CharacterBuild {
  return Boolean(
    value &&
      typeof value === "object" &&
      "schemaVersion" in (value as Record<string, unknown>),
  );
}

function readSessionBuild(): (CharacterBuild & Record<string, unknown>) | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isCharacterBuild(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeSessionBuild(build: CharacterBuild & Record<string, unknown>): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(build));
  } catch {
    /* private mode */
  }
}

function writeBootMeta(meta: BootMeta): void {
  bootMeta = meta;
  window.GrudgeBoot = meta;
  try {
    sessionStorage.setItem(BOOT_META_KEY, JSON.stringify(meta));
  } catch {
    /* */
  }
  try {
    document.documentElement.dataset.grudgeBoot = meta.source;
    document.documentElement.dataset.grudgeSignedIn = meta.signedIn
      ? "1"
      : "0";
  } catch {
    /* */
  }
}

function textureFor(raceId: string, skin: string): string {
  return `/character/races/textures/${raceId}/${skin || "default"}.png`;
}

function normalizeRaceId(raw: string | undefined | null): string {
  const r = (raw || "human").toLowerCase();
  const map: Record<string, string> = {
    human: "human",
    wk: "human",
    barbarian: "barbarian",
    barbarians: "barbarian",
    brb: "barbarian",
    elf: "elf",
    elves: "elf",
    "high-elves": "elf",
    dwarf: "dwarf",
    dwarves: "dwarf",
    orc: "orc",
    orcs: "orc",
    undead: "undead",
  };
  return map[r] || "human";
}

function ensureEquipped(
  eq: Partial<Record<string, string | null>> | undefined,
): Record<string, string> {
  const base: Record<string, string> = {
    body: "A",
    arms: "A",
    legs: "A",
    head: "A",
    sword: "A",
  };
  if (!eq || typeof eq !== "object") return base;
  const out = { ...base };
  for (const [k, v] of Object.entries(eq)) {
    if (v != null && v !== "") out[k] = String(v);
  }
  // Empty equip after strip → keep defaults
  if (!Object.keys(out).length) return base;
  return out;
}

/** Map Railway character row → play CharacterBuild (stamped to session). */
export function characterToBuild(
  character: GrudgeCharacter,
): CharacterBuild & Record<string, unknown> {
  const raceId = normalizeRaceId(character.raceId);
  let fromEq: Partial<CharacterBuild> = {};
  if (isCharacterBuild(character.equipment)) {
    fromEq = character.equipment;
  } else if (character.equipment && typeof character.equipment === "object") {
    const e = character.equipment as Record<string, unknown>;
    fromEq = {
      raceId: typeof e.raceId === "string" ? e.raceId : raceId,
      classId: typeof e.classId === "string" ? e.classId : character.classId,
      skinVariant:
        typeof e.skinVariant === "string" ? e.skinVariant : "default",
      animationPack:
        typeof e.animationPack === "string"
          ? e.animationPack
          : "sword_shield",
      equipped: (e.equipped as CharacterBuild["equipped"]) || {},
      hiddenMeshes: Array.isArray(e.hiddenMeshes)
        ? (e.hiddenMeshes as string[])
        : [],
    };
  }

  const skin = fromEq.skinVariant || "default";
  const equipped = ensureEquipped(
    fromEq.equipped as Record<string, string | null>,
  );

  return {
    schemaVersion: 1,
    raceId: normalizeRaceId(fromEq.raceId || raceId),
    classId: fromEq.classId || character.classId || "warrior",
    skinVariant: skin,
    textureUrl: textureFor(normalizeRaceId(fromEq.raceId || raceId), skin),
    animationPack: fromEq.animationPack || "sword_shield",
    gearPresetId: "railway",
    equipped,
    hiddenMeshes: fromEq.hiddenMeshes || [],
    name: character.name || "Captain",
    characterId: character.id,
    source: "railway",
    lobby: "pirate_open_world",
    worldScale: 1,
    targetHeight: 1.8,
  };
}

function scheduleSave(): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const id =
      (activeBuild.characterId as string | undefined) ||
      GrudgeAccountSDK.getActiveId();
    if (id && bootMeta.signedIn) {
      void GrudgeAccountSDK.saveBuild(id, activeBuild as CharacterBuild);
    }
  }, 600);
}

function applyBuildToPlayer(
  player: PlayerLike,
  build: CharacterBuild & Record<string, unknown>,
): void {
  if (!player.equipment) return;
  const equipped = ensureEquipped(
    build.equipped as Record<string, string | null>,
  );
  player.equipment.applyLoadout(equipped);
}

/**
 * Railway-first resolve. Call before script.js so resolveCharacter() is correct.
 */
export async function railwayFirstBoot(opts?: {
  timeoutMs?: number;
}): Promise<BootMeta> {
  const timeoutMs = opts?.timeoutMs ?? 4500;
  const params = new URLSearchParams(
    typeof location !== "undefined" ? location.search : "",
  );
  const urlCharRace = params.get("char");
  const urlCharacterId =
    params.get("characterId") || params.get("cid") || null;

  // Guest / offline session path first (may be overwritten by Railway)
  const sessionBuild = readSessionBuild();

  const withTimeout = <T>(p: Promise<T>, ms: number): Promise<T | null> =>
    Promise.race([
      p,
      new Promise<null>((r) => setTimeout(() => r(null), ms)),
    ]);

  try {
    await withTimeout(GrudgeAccountSDK.init(), timeoutMs);
  } catch (e) {
    console.warn("[railway-boot] init error", e);
  }

  const token = GrudgeAccountSDK.getToken();
  const user = GrudgeAccountSDK.getUser();
  const signedIn = Boolean(token);

  // Prefer explicit character id from URL
  if (urlCharacterId && signedIn) {
    GrudgeAccountSDK.selectCharacter(urlCharacterId);
  }

  let railwayChar = signedIn ? GrudgeAccountSDK.getActiveCharacter() : null;

  // If still no list but token, try one more sync
  if (signedIn && !railwayChar) {
    try {
      await withTimeout(GrudgeAccountSDK.syncFromBackend(), timeoutMs);
      if (urlCharacterId) GrudgeAccountSDK.selectCharacter(urlCharacterId);
      railwayChar = GrudgeAccountSDK.getActiveCharacter();
    } catch {
      /* network */
    }
  }

  // ── Railway wins when signed in + character exists ─────────────────
  if (signedIn && railwayChar) {
    // URL ?char= may force race preview on same account character equipment
    const build = characterToBuild(railwayChar);
    if (urlCharRace && normalizeRaceId(urlCharRace) !== build.raceId) {
      // Explicit race override from URL still allowed for lobby testing
      build.raceId = normalizeRaceId(urlCharRace);
      build.textureUrl = textureFor(build.raceId, build.skinVariant || "default");
    }
    activeBuild = build;
    writeSessionBuild(build);
    window.GrudgeBuild = build;
    const meta: BootMeta = {
      source: "railway",
      characterId: railwayChar.id,
      characterName: railwayChar.name || null,
      raceId: build.raceId,
      signedIn: true,
      username: user?.username || user?.displayName || null,
      at: Date.now(),
    };
    writeBootMeta(meta);
    window.dispatchEvent(
      new CustomEvent("grudge:railway-boot", { detail: meta }),
    );
    console.info(
      "[railway-boot] Railway character",
      railwayChar.id,
      railwayChar.name,
      "race=",
      build.raceId,
    );
    return meta;
  }

  // ── Session / gate / Space (guest or signed-in with no characters) ─
  if (sessionBuild) {
    activeBuild = {
      ...DEFAULT_BUILD,
      ...sessionBuild,
      equipped: ensureEquipped(
        sessionBuild.equipped as Record<string, string | null>,
      ),
      source: (sessionBuild.source as string) || "session",
      worldScale: sessionBuild.worldScale ?? 1,
      targetHeight:
        sessionBuild.targetHeight && sessionBuild.targetHeight <= 2.5
          ? sessionBuild.targetHeight
          : 1.8,
    };
    if (urlCharRace) {
      activeBuild.raceId = normalizeRaceId(urlCharRace);
    }
    writeSessionBuild(activeBuild);
    window.GrudgeBuild = activeBuild;
    const meta: BootMeta = {
      source: signedIn ? "session" : "session",
      characterId: (activeBuild.characterId as string) || null,
      characterName: (activeBuild.name as string) || null,
      raceId: String(activeBuild.raceId || "human"),
      signedIn,
      username: user?.username || null,
      error: signedIn
        ? "Signed in but no Railway characters — using session build"
        : undefined,
      at: Date.now(),
    };
    writeBootMeta(meta);
    window.dispatchEvent(
      new CustomEvent("grudge:railway-boot", { detail: meta }),
    );
    console.info(
      "[railway-boot] session build",
      meta.raceId,
      signedIn ? "(signed-in empty roster)" : "(guest)",
    );
    return meta;
  }

  // ── Pure guest default ─────────────────────────────────────────────
  activeBuild = {
    ...DEFAULT_BUILD,
    equipped: ensureEquipped(DEFAULT_BUILD.equipped),
    raceId: urlCharRace ? normalizeRaceId(urlCharRace) : "human",
    source: "guest",
    worldScale: 1,
    targetHeight: 1.8,
    textureUrl: textureFor(
      urlCharRace ? normalizeRaceId(urlCharRace) : "human",
      "default",
    ),
  };
  writeSessionBuild(activeBuild);
  window.GrudgeBuild = activeBuild;
  const meta: BootMeta = {
    source: "guest",
    characterId: null,
    characterName: null,
    raceId: String(activeBuild.raceId),
    signedIn,
    username: user?.username || null,
    error: signedIn
      ? "Signed in but no characters on Railway"
      : "Guest — design gate / session only",
    at: Date.now(),
  };
  writeBootMeta(meta);
  window.dispatchEvent(
    new CustomEvent("grudge:railway-boot", { detail: meta }),
  );
  console.info("[railway-boot] guest default", meta.raceId);
  return meta;
}

function loadBuildFromCharacter(character: GrudgeCharacter | null): void {
  if (!character) return;
  activeBuild = characterToBuild(character);
  writeSessionBuild(activeBuild);
  window.GrudgeBuild = activeBuild;
}

async function wirePlayerBridge(): Promise<void> {
  // Re-apply when the SDK polls and refreshes the active character.
  window.addEventListener("grudge:character:updated", () => {
    const ch = GrudgeAccountSDK.getActiveCharacter();
    if (!ch) return;
    // Only overwrite if we are in railway mode (avoid clobbering gate guest edits mid-session)
    if (bootMeta.source === "railway" || bootMeta.signedIn) {
      loadBuildFromCharacter(ch);
      if (window.GrudgePlayer) applyBuildToPlayer(window.GrudgePlayer, activeBuild);
    }
  });

  const onReady = () => {
    if (!window.GrudgePlayer) return;
    applyBuildToPlayer(window.GrudgePlayer, activeBuild);
    // Space body regions / tint / collider debug after equip settles
    applySpaceVariantToPlayer(window.GrudgePlayer);
  };
  window.addEventListener("grudge:player-ready", onReady);
  if (window.GrudgePlayer) onReady();

  onEquipmentChange((slot: EquipSlot, variant) => {
    const eq = window.GrudgePlayer?.equipment;
    if (!eq) return;
    if (variant == null) {
      delete activeBuild.equipped[slot];
      eq.unequip(slot);
    } else {
      activeBuild.equipped[slot] = variant;
      if (WEAPON_SLOTS.has(slot)) {
        eq.equipWeapon(slot, variant);
        activeBuild.animationPack = animPackForWeapon(
          slot,
          String(activeBuild.classId || "warrior"),
        );
      } else {
        eq.equip(slot, variant);
      }
    }
    writeSessionBuild(activeBuild);
    window.GrudgeBuild = activeBuild;
    scheduleSave();
  });
}

/** Login deep-link helper for UI. */
export function grudgeIdLoginUrl(returnTo?: string): string {
  const ret =
    returnTo ||
    (typeof location !== "undefined"
      ? location.href
      : "https://threejs-player-and-grass.vercel.app/play");
  return `${GRUDGE_ID_LOGIN}/?returnTo=${encodeURIComponent(ret)}`;
}

// Kick Railway-first immediately; expose promise for index.html boot gate.
const railwayBootPromise = railwayFirstBoot().then(async (meta) => {
  await wirePlayerBridge();
  return meta;
});

window.GrudgeRailwayBoot = railwayBootPromise;
window.GrudgeAccountSDK = GrudgeAccountSDK;

export { railwayBootPromise, activeBuild, bootMeta };
export default railwayBootPromise;
