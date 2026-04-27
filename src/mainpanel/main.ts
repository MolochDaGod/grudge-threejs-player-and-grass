// src/mainpanel/main.ts
//
// Lifts the mainpanel out of "decorative mockup" mode. The legacy
// `<script>` block in `index.html` still drives the floating panels +
// tooltip engine (so the gold-on-stone UI looks the same), but THIS module
// owns the **real** equipment driver:
//
//   - SDK init (embedded mode → listens for GRUDGE_AUTH from the parent).
//   - On boot, asks the parent for the current build (`grudge:build-request`).
//   - Renders a per-slot × per-variant grid pinned to the right of the
//     mainpanel chrome. Each variant button calls `postEquipmentChange`
//     which the landing/play page wires into EquipmentManager.
//   - When the parent pushes a `grudge:build-push`, the grid re-highlights.
//
// Variant ids ("A", "B", "C", "_default") match `src/play/equipment-manager.js`
// SLOT_DEFS and the cataloged child meshes on the loaded race FBX. The
// "armor" / "weapons" / "shields" / "utility" grouping mirrors
// `EquipmentManager.getGroupedSlots()` so the UI maps 1:1 to the engine's
// slot model.
import { GrudgeAccountSDK, type CharacterBuild, type EquipSlot } from "@shared/grudge-account-sdk";
import {
  postEquipmentChange,
  postBuildRequest,
  onBuildPush,
} from "@shared/equipment-bridge";
import { SLOT_CATALOG, GROUP_TITLES, type SlotCatalogEntry } from "@shared/catalog";

// Slot definitions imported from @shared/catalog — see that module for
// per-slot variant ranges. Edit there to add/remove slots.
type SlotDef = SlotCatalogEntry;
const SLOTS: SlotDef[] = SLOT_CATALOG;

// ── State ──────────────────────────────────────────────────────────────────

let activeBuild: CharacterBuild | null = null;
const isCreator = new URLSearchParams(window.location.search).get("creator") === "1";

// ── DOM rendering ──────────────────────────────────────────────────────────

function ensureRoot(): HTMLDivElement {
  let root = document.getElementById("grudge-equipment-overlay") as HTMLDivElement | null;
  if (!root) {
    root = document.createElement("div");
    root.id = "grudge-equipment-overlay";
    document.body.appendChild(root);
    injectStyles();
  }
  return root;
}

function injectStyles(): void {
  if (document.getElementById("grudge-equipment-overlay-style")) return;
  const css = `
    #grudge-equipment-overlay {
      position: fixed;
      top: 12px;
      right: 12px;
      width: 320px;
      max-height: calc(100vh - 24px);
      overflow-y: auto;
      background: linear-gradient(180deg, rgba(26,18,12,.96), rgba(10,7,5,.96));
      border: 1.5px solid #c9950a;
      border-radius: 10px;
      padding: 12px 14px;
      font-family: "JetBrains Mono", monospace;
      font-size: 11px;
      color: #f5e2c1;
      z-index: 50;
      box-shadow: 0 12px 36px rgba(0,0,0,.7);
    }
    #grudge-equipment-overlay h2 {
      font-family: "Cinzel", serif;
      font-size: 12px;
      letter-spacing: 1.6px;
      text-transform: uppercase;
      color: #d4a400;
      border-bottom: 1px solid #3a2a1a;
      padding-bottom: 4px;
      margin: 0 0 8px;
    }
    #grudge-equipment-overlay h3 {
      font-family: "Cinzel", serif;
      font-size: 10px;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #c9950a;
      margin: 10px 0 4px;
    }
    .geo-slot-row {
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 2px 0;
    }
    .geo-slot-name {
      width: 70px;
      color: #9b7d52;
      text-transform: uppercase;
      font-size: 10px;
    }
    .geo-btn {
      background: #0a0705;
      color: #f5e2c1;
      border: 1px solid #3a2a1a;
      border-radius: 3px;
      padding: 2px 7px;
      font-family: "JetBrains Mono", monospace;
      font-size: 10px;
      cursor: pointer;
    }
    .geo-btn:hover { border-color: #c9950a; }
    .geo-btn.equipped {
      background: #c9950a;
      color: #0a0705;
      border-color: #d4a400;
      font-weight: 700;
    }
    #grudge-equipment-overlay .geo-status {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px dashed #3a2a1a;
      color: #6b5535;
      font-size: 10px;
      text-align: center;
    }
  `;
  const style = document.createElement("style");
  style.id = "grudge-equipment-overlay-style";
  style.textContent = css;
  document.head.appendChild(style);
}

function renderOverlay(): void {
  const root = ensureRoot();
  const equipped = activeBuild?.equipped ?? {};
  const grouped: Record<string, SlotDef[]> = { armor: [], weapons: [], shields: [], utility: [] };
  for (const def of SLOTS) grouped[def.group]?.push(def);

  const html: string[] = [];
  const title = isCreator ? "Equip · Creator" : "Equip · Mainpanel";
  const subtitle = activeBuild
    ? `${activeBuild.raceId} · ${activeBuild.classId} · ${activeBuild.skinVariant}`
    : "Waiting for build…";
  html.push(`<h2>${title}</h2>`);
  html.push(`<div class="geo-status">${subtitle}</div>`);

  for (const groupKey of ["armor", "weapons", "shields", "utility"] as const) {
    const slots = grouped[groupKey];
    if (!slots || slots.length === 0) continue;
    html.push(`<h3>${GROUP_TITLES[groupKey]}</h3>`);
    for (const def of slots) {
      const equippedVariant = equipped[def.slot] ?? null;
      const buttons: string[] = [];
      for (const v of def.variants) {
        const active = equippedVariant === v;
        const label = def.noVariant ? "✓" : v;
        buttons.push(`<button class="geo-btn${active ? " equipped" : ""}" data-slot="${def.slot}" data-variant="${v}">${label}</button>`);
      }
      // "off" button to unequip the slot.
      buttons.push(`<button class="geo-btn" data-slot="${def.slot}" data-variant="">×</button>`);
      html.push(`<div class="geo-slot-row"><span class="geo-slot-name">${def.slot}</span>${buttons.join("")}</div>`);
    }
  }

  root.innerHTML = html.join("");
  for (const btn of Array.from(root.querySelectorAll<HTMLButtonElement>(".geo-btn"))) {
    btn.addEventListener("click", () => {
      const slot = btn.dataset.slot as EquipSlot;
      const variant = btn.dataset.variant ?? "";
      const v = variant === "" ? null : variant;
      // Optimistic update so the active marker flips immediately even if the
      // parent hasn't echoed back the build yet.
      if (activeBuild) {
        if (v == null) delete activeBuild.equipped[slot];
        else activeBuild.equipped[slot] = v;
      }
      postEquipmentChange(slot, v);
      renderOverlay();
    });
  }
}

// ── Boot ───────────────────────────────────────────────────────────────────

function boot(): void {
  // Use the SDK's embedded mode so the parent landing/play frame can hand us
  // a JWT via postMessage. When run standalone (legacy mainpanel.html opened
  // directly) this no-ops gracefully.
  if (window.parent && window.parent !== window) {
    GrudgeAccountSDK.initEmbedded();
  } else {
    void GrudgeAccountSDK.init();
  }

  onBuildPush((build) => {
    activeBuild = build;
    renderOverlay();
  });

  // First render with no build yet (shows "Waiting for build…").
  renderOverlay();

  // Ask the parent to push the current build now that we're listening.
  postBuildRequest();
}

// Defer to next tick so the legacy inline `<script>` in index.html has a
// chance to install its tooltip engine + panel manager first.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => boot());
} else {
  boot();
}
