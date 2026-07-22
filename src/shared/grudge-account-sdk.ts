/**
 * GrudgeAccountSDK (vendored copy)
 *
 * Direct port of `GrudgeBuilder/client/src/lib/GrudgeAccountSDK.ts` so this
 * repo can read/write characters via the existing
 *   https://api.grudge-studio.com/api/characters/*
 * Postgres-backed REST API without dragging the GrudgeBuilder client into
 * this build.
 *
 * Two operating modes:
 *   STANDALONE — call .init() at boot. Reads JWT from localStorage
 *               ("grudge_auth_token") and pulls the user + characters.
 *   EMBEDDED   — call .initEmbedded() inside an iframe (e.g. mainpanel
 *               loaded as the equipment driver inside the landing page).
 *               Listens for `GRUDGE_AUTH` postMessage from the parent and
 *               fires `GRUDGE_READY` back.
 *
 * Equipment in the Postgres `characters.equipment` JSONB column is shaped
 * like:
 *   { raceId, classId, skinVariant, animationPack,
 *     equipped: { body:"B", arms:"A", sword:"A", ... },
 *     hiddenMeshes: [] }
 * — see types below.
 */
import { GRUDGE_API_URL } from "./config";

// ── Constants ──────────────────────────────────────────────────────────────────
const TOKEN_KEY = "grudge_auth_token";
const CHAR_ACTIVE = "gruda_active_character";
const GRUDGE_ID_KEY = "grudge_id";
const USERNAME_KEY = "grudge_username";
const ACCOUNT_ID_KEY = "grudge_account_id";
const POLL_MS = 60_000;

// ── Equipment payload (lives inside character.equipment JSONB) ─────────────────

/** Equipment slots the EquipmentManager understands today. Keep in sync with
 *  `src/play/equipment-manager.js` SLOT_DEFS and the per-race child-mesh
 *  prefixes documented in `src/play/player-config.js`. */
export type EquipSlot =
  | "body" | "arms" | "legs" | "head" | "shoulders"
  | "axe" | "hammer" | "sword" | "pick" | "spear"
  | "bow" | "staff" | "shield"
  | "bag" | "wood" | "quiver";

export interface CharacterBuild {
  schemaVersion: 1;
  raceId: string;          // "human" | "barbarian" | "elf" | "dwarf" | "orc" | "undead"
  classId: string;         // "warrior" | "mage" | "ranger" | "worge"
  skinVariant: string;     // "default" | "brown" | "blue" | ...
  animationPack: string;   // "1h-shield" | "2h-melee" | "longbow" | "magic" | "rifle"
  /** slot → variant letter ("A"|"B"|...|"_default") or null when unequipped. */
  equipped: Partial<Record<EquipSlot, string | null>>;
  /** Mesh names the user explicitly hid (KayKit `_parts` etc.). */
  hiddenMeshes: string[];
  /** Railway character UUID when build came from Postgres. */
  characterId?: string;
  /** Display name */
  name?: string;
  /** Where this build was stamped: railway | session | gate | space | guest */
  source?: string;
  textureUrl?: string;
  gearPresetId?: string;
  lobby?: string;
  worldScale?: number;
  targetHeight?: number;
}

export const DEFAULT_BUILD: CharacterBuild = {
  schemaVersion: 1,
  raceId: "human",
  classId: "warrior",
  skinVariant: "default",
  animationPack: "sword_shield",
  equipped: {
    body: "A",
    arms: "A",
    legs: "A",
    head: "A",
    shoulders: "A",
    sword: "A",
  },
  hiddenMeshes: [],
  source: "guest",
  worldScale: 4.2,
  targetHeight: 1.8 * 4.2,
};

// ── Character row shape returned by api.grudge-studio.com ──────────────────────

export interface GrudgeCharacter {
  id: string;
  name: string;
  raceId: string;
  classId: string;
  level: number;
  xp: number;
  hp?: number;
  energy?: number;
  avatarUrl?: string | null;
  attributes?: Record<string, number>;
  professionLevels?: Record<string, { level: number; xp: number }>;
  /** Equipment/build payload — the JSONB column we drive via the creator. */
  equipment?: CharacterBuild | Record<string, unknown> | null;
  inventory?: Array<{ itemId: string; quantity: number }>;
  createdAt?: number;
}

export interface GrudgeUser {
  grudgeId: string;
  username: string;
  displayName?: string;
  email?: string;
  gbuxBalance?: number;
  walletAddress?: string;
  isPremium?: boolean;
}

type CharacterCallback = (character: GrudgeCharacter | null) => void;

// ── SDK singleton ──────────────────────────────────────────────────────────────

class _GrudgeAccountSDK {
  private _apiBase = GRUDGE_API_URL;
  private _token: string | null = null;
  private _user: GrudgeUser | null = null;
  private _characters: GrudgeCharacter[] = [];
  private _activeId: string | null = null;
  private _callbacks: CharacterCallback[] = [];
  private _pollTimer: ReturnType<typeof setInterval> | null = null;
  private _embedded = false;
  private _ready = false;

  // ── Init ────────────────────────────────────────────────────────────────────

  async init(apiBase?: string): Promise<void> {
    if (apiBase) this._apiBase = apiBase;
    this._token = this._readToken();
    this._activeId = this._readActiveId();
    if (this._token) await this.syncFromBackend();
    this._startPoll();
    this._dispatch("grudge:auth:ready");
    this._ready = true;
  }

  initEmbedded(): void {
    this._embedded = true;

    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    const urlToken = p.get("token");
    const urlChar = p.get("characterId");
    if (urlToken) { this._token = urlToken; this._saveToken(urlToken); }
    if (urlChar) { this._activeId = urlChar; this._saveActiveId(urlChar); }

    window.addEventListener("message", (e: MessageEvent) => {
      const data = e.data as { type?: string; token?: string; characterId?: string; grudgeId?: string; username?: string };
      if (data?.type !== "GRUDGE_AUTH") return;
      if (data.token) { this._token = data.token; this._saveToken(data.token); }
      if (data.characterId) { this._activeId = data.characterId; this._saveActiveId(data.characterId); }
      if (data.grudgeId) localStorage.setItem(GRUDGE_ID_KEY, data.grudgeId);
      if (data.username) localStorage.setItem(USERNAME_KEY, data.username);
      if (this._token) void this.syncFromBackend();
      this._dispatch("grudge:auth:ready");
    });

    window.parent?.postMessage({ type: "GRUDGE_READY" }, "*");
    this._startPoll();
    this._ready = true;
  }

  // ── Token helpers ───────────────────────────────────────────────────────────

  private _readToken(): string | null {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem("grudge_session_token") || null;
  }
  private _saveToken(token: string): void {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem("grudge_session_token", token);
  }
  private _readActiveId(): string | null {
    if (typeof localStorage === "undefined") return null;
    const grudgeId = localStorage.getItem(ACCOUNT_ID_KEY) || "guest";
    return localStorage.getItem(`${CHAR_ACTIVE}_${grudgeId}`) || localStorage.getItem(CHAR_ACTIVE);
  }
  private _saveActiveId(id: string): void {
    if (typeof localStorage === "undefined") return;
    const grudgeId = localStorage.getItem(ACCOUNT_ID_KEY) || "guest";
    localStorage.setItem(`${CHAR_ACTIVE}_${grudgeId}`, id);
    localStorage.setItem(CHAR_ACTIVE, id);
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  getToken(): string | null { return this._token || this._readToken(); }
  getUser(): GrudgeUser | null { return this._user; }
  getCharacters(): GrudgeCharacter[] { return this._characters; }
  getActiveId(): string | null { return this._activeId || this._readActiveId(); }
  getActiveCharacter(): GrudgeCharacter | null {
    const id = this.getActiveId();
    return id ? (this._characters.find((c) => c.id === id) ?? null) : null;
  }
  isEmbedded(): boolean { return this._embedded; }
  isReady(): boolean { return this._ready; }

  selectCharacter(id: string): void {
    this._activeId = id;
    this._saveActiveId(id);
    const char = this._characters.find((c) => c.id === id) ?? null;
    this._notifyCallbacks(char);
    this._dispatch("grudge:character:selected", { characterId: id });
    if (this._embedded && typeof window !== "undefined") {
      window.parent?.postMessage({ type: "GRUDGE_CHARACTER_CHANGE", characterId: id }, "*");
    }
  }

  onCharacterChange(cb: CharacterCallback): () => void {
    this._callbacks.push(cb);
    return () => { this._callbacks = this._callbacks.filter((f) => f !== cb); };
  }

  // ── Backend sync ────────────────────────────────────────────────────────────

  async syncFromBackend(): Promise<void> {
    const token = this.getToken();
    if (!token) return;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "X-Session-Token": token,
      "Content-Type": "application/json",
    };
    try {
      const userRes = await fetch(`${this._apiBase}/api/account`, { headers });
      if (userRes.ok) {
        const u = await userRes.json();
        this._user = {
          grudgeId: u.grudgeId || localStorage.getItem(GRUDGE_ID_KEY) || "",
          username: u.username || localStorage.getItem(USERNAME_KEY) || "",
          displayName: u.displayName,
          email: u.email,
          gbuxBalance: Number(u.gbuxBalance ?? 0),
          walletAddress: u.walletAddress,
          isPremium: u.isPremium,
        };
        if (this._user.grudgeId) localStorage.setItem(GRUDGE_ID_KEY, this._user.grudgeId);
      }
      const charRes = await fetch(`${this._apiBase}/api/characters`, { headers });
      if (charRes.ok) {
        const chars: GrudgeCharacter[] = await charRes.json();
        this._characters = chars;
        const stored = this.getActiveId();
        if (stored && chars.some((c) => c.id === stored)) this._activeId = stored;
        else if (chars.length > 0 && chars[0]) {
          this._activeId = chars[0].id;
          this._saveActiveId(chars[0].id);
        }
        const active = this.getActiveCharacter();
        this._notifyCallbacks(active);
        this._dispatch("grudge:character:updated", { character: active });
      }
      this._dispatch("grudge:sync:complete");
    } catch (err) {
      console.warn("[GrudgeAccountSDK] sync failed:", err);
    }
  }

  /** PATCH a partial character update to api.grudge-studio.com. */
  async saveCharacter(id: string, updates: Partial<GrudgeCharacter>): Promise<GrudgeCharacter | null> {
    const token = this.getToken();
    if (!token) return null;
    try {
      const res = await fetch(`${this._apiBase}/api/characters/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) return null;
      const updated: GrudgeCharacter = await res.json();
      this._characters = this._characters.map((c) => (c.id === id ? updated : c));
      if (id === this._activeId) {
        this._notifyCallbacks(updated);
        this._dispatch("grudge:character:updated", { character: updated });
      }
      return updated;
    } catch {
      return null;
    }
  }

  /** Convenience: persist just the build payload to character.equipment. */
  async saveBuild(id: string, build: CharacterBuild): Promise<GrudgeCharacter | null> {
    return this.saveCharacter(id, { equipment: build });
  }

  // ── Internal ────────────────────────────────────────────────────────────────

  private _notifyCallbacks(char: GrudgeCharacter | null): void {
    this._callbacks.forEach((cb) => { try { cb(char); } catch { /* swallow */ } });
  }
  private _dispatch(name: string, detail?: Record<string, unknown>): void {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    }
  }
  private _startPoll(): void {
    if (this._pollTimer || typeof setInterval === "undefined") return;
    this._pollTimer = setInterval(() => { if (this.getToken()) void this.syncFromBackend(); }, POLL_MS);
  }

  destroy(): void {
    if (this._pollTimer) { clearInterval(this._pollTimer); this._pollTimer = null; }
    this._callbacks = [];
  }
}

export const GrudgeAccountSDK = new _GrudgeAccountSDK();
