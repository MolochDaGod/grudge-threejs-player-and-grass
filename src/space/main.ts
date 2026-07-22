import "./style.css";
import {
  GrudgeGltfSpace,
  RACES,
  getVariants,
  HUMAN_HEIGHT_M,
  type BodyRegion,
  type RaceId,
} from "./GrudgeGltfSpace";

const viewport = document.getElementById("viewport")!;
const dropHint = document.getElementById("drop-hint")!;
const assetList = document.getElementById("asset-list")!;
const raceGrid = document.getElementById("race-grid")!;
const variantList = document.getElementById("variant-list")!;
const clipList = document.getElementById("clip-list")!;
const regionHost = document.getElementById("regions")!;
const metaEl = document.getElementById("meta")!;
const boneList = document.getElementById("bone-list")!;
const statusEl = document.getElementById("status")!;

const space = new GrudgeGltfSpace(viewport);

// ── Race strip ──────────────────────────────────────────────────────────
raceGrid.innerHTML = "";
for (const r of RACES) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "race-btn";
  b.title = r.label;
  b.innerHTML = `<span class="em">${r.emoji}</span>${r.label.replace(/\s*\(.*\)/, "")}`;
  b.addEventListener("click", async () => {
    status("Loading " + r.label + "…");
    try {
      await space.openRace(r.id as RaceId);
      dropHint.classList.add("hidden");
      status("Loaded " + r.label + " · fitted to " + HUMAN_HEIGHT_M + " m");
    } catch (e) {
      console.error(e);
      status("Failed: " + (e as Error).message, true);
    }
  });
  raceGrid.appendChild(b);
}

// ── Body region sliders ─────────────────────────────────────────────────
const REGIONS: { id: BodyRegion; label: string }[] = [
  { id: "overall", label: "Overall" },
  { id: "chest", label: "Chest" },
  { id: "arms", label: "Arms" },
  { id: "belly", label: "Belly" },
  { id: "thighs", label: "Thighs" },
  { id: "legs", label: "Legs" },
];

function buildRegionUI() {
  regionHost.innerHTML = "";
  const a = space.active;
  for (const r of REGIONS) {
    const row = document.createElement("div");
    row.className = "row";
    const val = a?.regions[r.id].scale ?? 1;
    row.innerHTML = `
      <label>${r.label}</label>
      <input type="range" min="0.75" max="1.35" step="0.01" value="${val}" data-region="${r.id}" />
      <span class="val">${val.toFixed(2)}</span>
    `;
    const input = row.querySelector("input")!;
    const span = row.querySelector(".val")!;
    input.addEventListener("input", () => {
      const s = parseFloat(input.value);
      span.textContent = s.toFixed(2);
      space.setRegion(r.id, s);
    });
    regionHost.appendChild(row);
  }
}

// ── File open ───────────────────────────────────────────────────────────
document.getElementById("btn-open")!.addEventListener("click", () => {
  document.getElementById("file-input")!.click();
});
document.getElementById("file-input")!.addEventListener("change", async (ev) => {
  const input = ev.target as HTMLInputElement;
  const files = input.files;
  if (!files?.length) return;
  for (const f of Array.from(files)) {
    status("Opening " + f.name + "…");
    try {
      await space.openFile(f);
      dropHint.classList.add("hidden");
      status("Opened " + f.name);
    } catch (e) {
      status("Failed " + f.name + ": " + (e as Error).message, true);
    }
  }
  input.value = "";
});

// Drag-drop
viewport.addEventListener("dragover", (e) => {
  e.preventDefault();
  viewport.classList.add("dragover");
});
viewport.addEventListener("dragleave", () => viewport.classList.remove("dragover"));
viewport.addEventListener("drop", async (e) => {
  e.preventDefault();
  viewport.classList.remove("dragover");
  const files = e.dataTransfer?.files;
  if (!files?.length) return;
  for (const f of Array.from(files)) {
    if (!/\.(glb|gltf|fbx)$/i.test(f.name)) continue;
    try {
      await space.openFile(f);
      dropHint.classList.add("hidden");
      status("Opened " + f.name);
    } catch (err) {
      status("Drop failed: " + (err as Error).message, true);
    }
  }
});

// Toggles
const boneToggle = document.getElementById("toggle-bones") as HTMLInputElement;
const colToggle = document.getElementById("toggle-colliders") as HTMLInputElement;
const gridToggle = document.getElementById("toggle-grid") as HTMLInputElement;
const humanToggle = document.getElementById("toggle-human") as HTMLInputElement;

boneToggle.addEventListener("change", () => space.setShowBones(boneToggle.checked));
colToggle.addEventListener("change", () => space.setShowColliders(colToggle.checked));
gridToggle.addEventListener("change", () => {
  space.grid.visible = gridToggle.checked;
});
humanToggle.addEventListener("change", () => {
  space.humanRef.visible = humanToggle.checked;
});

document.getElementById("btn-fit")!.addEventListener("click", () => {
  const f = space.fitActiveToHuman();
  status(`Fitted to ${HUMAN_HEIGHT_M} m (×${f.toFixed(3)})`);
  buildRegionUI();
});
document.getElementById("btn-export")!.addEventListener("click", () => {
  const data = space.exportVariantJSON();
  if (!data) {
    status("No active asset", true);
    return;
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `grudge-variant-${data.raceId || "asset"}-${Date.now()}.json`;
  a.click();
  status("Exported variant JSON");
});
document.getElementById("btn-play")!.addEventListener("click", () => space.sendToPlay());
document.getElementById("btn-remove")!.addEventListener("click", () => {
  space.removeActive();
  if (!space.assets.length) dropHint.classList.remove("hidden");
});
document.getElementById("btn-reset-color")!.addEventListener("click", () => {
  space.resetVariant();
  status("Color variant reset");
  renderVariants();
});

// ── UI refresh ──────────────────────────────────────────────────────────
function status(msg: string, err = false) {
  statusEl.textContent = msg;
  statusEl.style.color = err ? "var(--danger)" : "var(--muted)";
}

function renderAssets() {
  assetList.innerHTML = "";
  for (const a of space.assets) {
    const row = document.createElement("div");
    row.className = "asset-row" + (a.id === space.activeId ? " active" : "");
    const h = a.fitted
      ? HUMAN_HEIGHT_M.toFixed(2) + " m"
      : "raw";
    row.innerHTML = `<span class="nm">${escapeHtml(a.name)}</span><span class="h">${h}</span>`;
    row.addEventListener("click", () => space.setActive(a.id));
    assetList.appendChild(row);
  }
}

function renderClips() {
  clipList.innerHTML = "";
  const a = space.active;
  if (!a?.clips.length) {
    clipList.innerHTML = `<div style="color:var(--muted);padding:4px">No clips</div>`;
    return;
  }
  for (const c of a.clips) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "clip-btn";
    b.textContent = c.name || "(unnamed)";
    b.addEventListener("click", () => {
      space.playClip(c.name);
      status("Playing " + c.name);
    });
    clipList.appendChild(b);
  }
  const stop = document.createElement("button");
  stop.type = "button";
  stop.className = "clip-btn";
  stop.textContent = "■ Stop";
  stop.addEventListener("click", () => space.stopAnims());
  clipList.appendChild(stop);
}

function renderVariants() {
  variantList.innerHTML = "";
  const a = space.active;
  if (!a?.raceId) {
    variantList.innerHTML =
      `<div style="color:var(--muted);padding:4px;font-size:10px">Load a grudge6 race to tint variants</div>`;
    return;
  }
  const variants = getVariants(a.raceId);
  for (const v of variants) {
    const b = document.createElement("button");
    b.type = "button";
    b.className =
      "variant-btn" + (a.colorVariantId === v.id ? " active" : "");
    b.innerHTML = `<span class="swatch" style="background:${v.tint}"></span>${escapeHtml(v.label)}`;
    b.addEventListener("click", () => {
      space.applyVariant(v);
      status("Variant: " + v.label);
      renderVariants();
    });
    variantList.appendChild(b);
  }
}

function renderMeta() {
  const a = space.active;
  if (!a) {
    metaEl.innerHTML = "No asset selected.";
    boneList.innerHTML = "";
    return;
  }
  const json = space.exportVariantJSON();
  const h = json?.measuredHeightM?.toFixed(3) ?? "?";
  metaEl.innerHTML = `
    <div><b>Asset</b> ${escapeHtml(a.name)}</div>
    <div><b>Race</b> ${a.raceId || "—"}</div>
    <div><b>Height</b> ${h} m (target ${HUMAN_HEIGHT_M} m)</div>
    <div><b>Clips</b> ${a.clips.length}</div>
    <div><b>Color</b> ${a.colorVariantId || "default"}</div>
    <div><b>Bones mapped</b> ${json?.boneRoles?.length ?? 0}</div>
    <div><b>Colliders</b> ${a.colliderDefs.length}</div>
  `;
  boneList.innerHTML = (json?.boneRoles || [])
    .map(
      (b) =>
        `<div><span class="k">${escapeHtml(b.kind)}</span> ${escapeHtml(b.bone)}</div>`,
    )
    .join("");
}

function refreshAll() {
  renderAssets();
  renderClips();
  renderVariants();
  renderMeta();
  buildRegionUI();
}

space.onChange(refreshAll);
buildRegionUI();
refreshAll();

// URL ?race=barbarian quick load
try {
  const p = new URLSearchParams(location.search);
  const race = p.get("race") as RaceId | null;
  if (race && RACES.some((r) => r.id === race)) {
    space.openRace(race).then(() => {
      dropHint.classList.add("hidden");
      status("Loaded race=" + race);
    });
  }
} catch {
  /* */
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Expose for console debugging
(window as unknown as { GrudgeGltfSpace: GrudgeGltfSpace }).GrudgeGltfSpace =
  space;
