// src/landing/main.ts
//
// Phase 1 skeleton for the character creator landing page. This file boots
// the GrudgeAccountSDK + a minimal three.js preview canvas, paints the four
// picker rails (race / skin / class / animation), and listens for
// `grudge:equipment-change` messages from the embedded mainpanel iframe.
//
// Phase 2.2 fleshes out the actual 3D preview (loads the race GLB, applies
// the skin PNG via MeshLambertMaterial, hooks the EquipmentManager).
import { GrudgeAccountSDK, DEFAULT_BUILD, type CharacterBuild, type EquipSlot } from "@shared/grudge-account-sdk";
import { onEquipmentChange, onBuildRequest, pushBuild } from "@shared/equipment-bridge";
import { animationPackUrl } from "@shared/config";
import { RACES, CLASSES, ANIM_PACKS, SKIN_VARIANTS, defaultSkinVariant, animPackForWeapon, WEAPON_SLOTS } from "@shared/catalog";
import { CharacterPreview } from "./preview";

// Pull in the classic EquipmentManager IIFE that lives next to src/play/.
// Vite's `?url` import gives us the resolved URL we can inject as a regular
// <script> tag. The IIFE attaches `window.GrudgeEquipmentManager`.
import equipmentManagerUrl from "../play/equipment-manager.js?url";

function loadClassicScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.dataset.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load " + src));
    document.head.appendChild(s);
  });
}

// Catalogs are now imported from @shared/catalog (single source of truth
// across landing / mainpanel / play). The legacy inline copies below are
// gone; if you need to add/remove a race or skin variant, edit
// `src/shared/catalog.ts`.

// ── State ──────────────────────────────────────────────────────────────────

let build: CharacterBuild = { ...DEFAULT_BUILD };
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let preview: CharacterPreview | null = null;
let lastLoadedRace: string | null = null;
let lastLoadedSkin: string | null = null;

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const id = GrudgeAccountSDK.getActiveId();
    if (id) void GrudgeAccountSDK.saveBuild(id, build);
  }, 600);
}

/** Re-render the picker UI, hot-sync the 3D preview, and queue a Puter save.
 *  Called from every picker click handler. */
function applyChange(): void {
  renderAll();
  void syncPreview();
  scheduleSave();
}

// ── DOM rendering (minimal Phase 1 stubs) ──────────────────────────────────

function renderRaceTiles() {
  const root = document.getElementById("race-tiles");
  if (!root) return;
  root.innerHTML = "";
  for (const r of RACES) {
    const tile = document.createElement("button");
    tile.className = "race-tile" + (r.id === build.raceId ? " active" : "");
    tile.style.setProperty("--race-color", r.color);
    tile.innerHTML = `<span class="rt-emoji">${r.emoji}</span><span class="rt-name">${r.label}</span>`;
    tile.addEventListener("click", () => {
      build.raceId = r.id;
      build.skinVariant = defaultSkinVariant(r.id);
      applyChange();
    });
    root.appendChild(tile);
  }
}

type ScalarBuildKey = "raceId" | "classId" | "skinVariant" | "animationPack";

function renderPickerRow(rootId: string, items: Array<{ id: string; label: string }>, key: ScalarBuildKey) {
  const root = document.getElementById(rootId);
  if (!root) return;
  root.innerHTML = "";
  for (const it of items) {
    const btn = document.createElement("button");
    btn.className = "picker-btn" + (build[key] === it.id ? " active" : "");
    btn.textContent = it.label;
    btn.addEventListener("click", () => {
      build[key] = it.id;
      applyChange();
    });
    root.appendChild(btn);
  }
}

function renderSkinButtons() {
  renderPickerRow("skin-buttons", SKIN_VARIANTS[build.raceId] ?? [], "skinVariant");
}
function renderClassButtons() { renderPickerRow("class-buttons", CLASSES, "classId"); }
function renderAnimButtons()  { renderPickerRow("anim-buttons",  ANIM_PACKS, "animationPack"); }

function renderAll() {
  renderRaceTiles();
  renderSkinButtons();
  renderClassButtons();
  renderAnimButtons();
  const status = document.getElementById("creator-status");
  if (status) status.textContent = `${build.raceId} · ${build.skinVariant} · ${build.classId} · ${build.animationPack}`;
  // Push the latest build into the mainpanel iframe so its inventory grid
  // reflects the active race + class + equipped slots.
  const iframe = document.getElementById("mainpanel-iframe") as HTMLIFrameElement | null;
  if (iframe?.contentWindow) {
    pushBuild(iframe.contentWindow, build, GrudgeAccountSDK.getActiveId() ?? undefined);
  }
}

/** Reconcile the live three.js preview with the active `build`. Race + skin
 *  changes reload the model; equipment-only changes flip mesh visibility
 *  through the classic EquipmentManager. */
async function syncPreview(): Promise<void> {
  if (!preview) return;
  const raceChanged = build.raceId !== lastLoadedRace;
  const skinChanged = build.skinVariant !== lastLoadedSkin;
  if (raceChanged || lastLoadedRace == null) {
    try {
      await preview.loadRace(build.raceId, build.skinVariant);
      lastLoadedRace = build.raceId;
      lastLoadedSkin = build.skinVariant;
      preview.applyLoadout(build.equipped as Record<string, string | null>);
    } catch (err) {
      console.warn("[creator] failed to load race", build.raceId, err);
    }
  } else if (skinChanged) {
    try {
      await preview.setSkin(build.raceId, build.skinVariant);
      lastLoadedSkin = build.skinVariant;
    } catch (err) {
      console.warn("[creator] failed to swap skin", err);
    }
  }
}

// ── Boot ───────────────────────────────────────────────────────────────────

async function boot() {
  await GrudgeAccountSDK.init();
  const active = GrudgeAccountSDK.getActiveCharacter();
  if (active?.equipment && typeof active.equipment === "object" && "schemaVersion" in active.equipment) {
    build = active.equipment as CharacterBuild;
  } else if (active) {
    build = { ...DEFAULT_BUILD, raceId: active.raceId || "human", classId: active.classId || "warrior" };
  }
  const nameEl = document.getElementById("creator-name");
  if (nameEl) nameEl.textContent = active?.name ?? "Guest Crafter";

  // Equipment changes coming up from the mainpanel iframe.
  // Weapon-group slots (`sword`/`bow`/`shield`/etc.) call `equipWeapon` so
  // their group siblings get hidden first; armor slots use `equip`. When the
  // active weapon changes we also auto-swap the animation pack.
  onEquipmentChange((slot: EquipSlot, variant) => {
    if (variant == null) {
      delete build.equipped[slot];
      preview?.equipment?.unequip(slot);
    } else {
      build.equipped[slot] = variant;
      if (WEAPON_SLOTS.has(slot)) {
        preview?.equipment?.equipWeapon(slot, variant);
        // Weapon swap → update the build's active animation pack so
        // /play loads the right idle/attack/cast set when the user enters
        // the grass scene.
        build.animationPack = animPackForWeapon(slot, build.classId);
      } else {
        preview?.equipment?.equip(slot, variant);
      }
    }
    scheduleSave();
    renderAll(); // re-pushes build to the iframe
  });

  // mainpanel iframe boots and asks for the current build.
  onBuildRequest((target, origin) => {
    pushBuild(target, build, GrudgeAccountSDK.getActiveId() ?? undefined, origin);
  });

  // Pre-load the classic EquipmentManager IIFE, then spin up the three.js
  // preview against the canvas.
  await loadClassicScript(equipmentManagerUrl);
  const canvas = document.getElementById("creator-canvas") as HTMLCanvasElement | null;
  if (canvas) {
    preview = new CharacterPreview({ canvas });
    await syncPreview();
  }

  const status = document.getElementById("creator-status");
  if (status) status.dataset.animUrl = animationPackUrl(build.animationPack);

  renderAll();
}

void boot();
