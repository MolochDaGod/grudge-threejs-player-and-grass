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
const skelToggle = document.getElementById("toggle-skeleton") as HTMLInputElement;
const axesToggle = document.getElementById("toggle-axes") as HTMLInputElement;
const gridToggle = document.getElementById("toggle-grid") as HTMLInputElement;
const humanToggle = document.getElementById("toggle-human") as HTMLInputElement;

boneToggle.addEventListener("change", () => space.setShowBones(boneToggle.checked));
colToggle.addEventListener("change", () => space.setShowColliders(colToggle.checked));
skelToggle?.addEventListener("change", () => space.setShowSkeleton(skelToggle.checked));
axesToggle?.addEventListener("change", () => space.setShowAxes(axesToggle.checked));
gridToggle.addEventListener("change", () => {
  space.grid.visible = gridToggle.checked;
});
humanToggle.addEventListener("change", () => {
  space.humanRef.visible = humanToggle.checked;
});

document.getElementById("btn-fit")!.addEventListener("click", () => {
  const f = space.fitActiveToHuman();
  status(`Fitted to ${HUMAN_HEIGHT_M} m (×${f.toFixed(3)}) · colliders mesh-refit`);
  buildRegionUI();
  renderColliderEdit();
});
document.getElementById("btn-refit-colliders")?.addEventListener("click", () => {
  space.refitCollidersToMeshes();
  const w = space.getWeaponMeshNames();
  status(
    w.length
      ? `Colliders mesh-fit · weapon → ${w[0]}`
      : "Colliders mesh-fit · no visible weapon mesh (equip sword_A?)",
  );
  renderColliderEdit();
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
  const weapons = space.getWeaponMeshNames();
  const blade = a.colliderDefs.find((c) => c.id === "weapon_blade");
  metaEl.innerHTML = `
    <div><b>Asset</b> ${escapeHtml(a.name)}</div>
    <div><b>Race</b> ${a.raceId || "—"}</div>
    <div><b>Height</b> ${h} m (target ${HUMAN_HEIGHT_M} m)</div>
    <div><b>Clips</b> ${a.clips.length}</div>
    <div><b>Color</b> ${a.colorVariantId || "default"}</div>
    <div><b>Bones mapped</b> ${json?.boneRoles?.length ?? 0}</div>
    <div><b>Colliders</b> ${a.colliderDefs.length}</div>
    <div><b>Weapon mesh</b> ${weapons[0] ? escapeHtml(weapons[0]) : "— none visible"}</div>
    <div><b>Blade attach</b> ${escapeHtml(blade?.attachMode || "?")} ${blade?.attachMeshName ? "· " + escapeHtml(blade.attachMeshName) : ""}</div>
    <div><b>Equipped</b> ${(a.equippedMeshes || []).map(escapeHtml).join(", ") || "—"}</div>
  `;
  boneList.innerHTML = (json?.boneRoles || [])
    .map(
      (b) =>
        `<div><span class="k">${escapeHtml(b.kind)}</span> ${escapeHtml(b.bone)}</div>`,
    )
    .join("");
}

function renderColliderEdit() {
  const host = document.getElementById("collider-edit");
  if (!host) return;
  const a = space.active;
  if (!a) {
    host.innerHTML = `<div style="color:var(--muted);font-size:10px">Load a race to edit colliders.</div>`;
    return;
  }
  host.innerHTML = "";
  for (const def of a.colliderDefs) {
    const card = document.createElement("div");
    card.className = "col-card";
    const attach =
      def.attachMode === "mesh" && def.attachMeshName
        ? `mesh:${def.attachMeshName}`
        : def.attachMode === "bone"
          ? `bone:${def.bone || "?"}`
          : "root";
    card.innerHTML = `
      <div class="col-head"><span>${escapeHtml(def.id)}</span><span>${escapeHtml(def.shape)}</span></div>
      <div class="col-meta">attach ${escapeHtml(attach)}</div>
    `;
    const dims: { key: string; label: string; get: () => number; set: (n: number) => void; min: number; max: number; step: number }[] = [
      {
        key: "radius",
        label: "r",
        get: () => def.radius,
        set: (n) => space.updateCollider(def.id, { radius: n }),
        min: 0.02,
        max: 0.6,
        step: 0.01,
      },
      {
        key: "height",
        label: "h",
        get: () => def.height,
        set: (n) => space.updateCollider(def.id, { height: n }),
        min: 0.05,
        max: 2.2,
        step: 0.02,
      },
      {
        key: "oy",
        label: "oy",
        get: () => def.offset.y,
        set: (n) =>
          space.updateCollider(def.id, {
            offset: { ...def.offset, y: n },
          }),
        min: -1,
        max: 2,
        step: 0.02,
      },
    ];
    if (def.shape === "box" && def.box) {
      for (const axis of ["x", "y", "z"] as const) {
        dims.push({
          key: "box" + axis,
          label: "½" + axis,
          get: () => def.box![axis],
          set: (n) =>
            space.updateCollider(def.id, {
              box: { ...def.box!, [axis]: n },
            }),
          min: 0.005,
          max: 1.2,
          step: 0.005,
        });
      }
    }
    for (const d of dims) {
      const row = document.createElement("div");
      row.className = "row";
      const v = d.get();
      row.innerHTML = `
        <label>${d.label}</label>
        <input type="range" min="${d.min}" max="${d.max}" step="${d.step}" value="${v}" />
        <span class="val">${v.toFixed(3)}</span>
      `;
      const input = row.querySelector("input")!;
      const span = row.querySelector(".val")!;
      input.addEventListener("input", () => {
        const n = parseFloat(input.value);
        span.textContent = n.toFixed(3);
        d.set(n);
      });
      card.appendChild(row);
    }
    host.appendChild(card);
  }
}

// ── Agentic chat (local production tools + optional fleet AI) ──────────
const agentLog = document.getElementById("agent-log");
const agentForm = document.getElementById("agent-form") as HTMLFormElement | null;
const agentInput = document.getElementById("agent-input") as HTMLInputElement | null;

function agentSay(role: "user" | "bot", text: string) {
  if (!agentLog) return;
  const div = document.createElement("div");
  div.className = "msg " + role;
  div.innerHTML = role === "bot" ? text : escapeHtml(text);
  agentLog.appendChild(div);
  agentLog.scrollTop = agentLog.scrollHeight;
}

function agentReply(q: string): string {
  const s = q.trim().toLowerCase();
  const a = space.active;

  if (/^(help|\?|commands)/.test(s)) {
    return `<b>Commands</b><br/>fit · refit colliders · export · play · skeleton on/off · axes on/off<br/>ask: SI units · weapon collider · why swing · body regions`;
  }
  if (/fit|1\.8|human/.test(s) && !/refit/.test(s)) {
    if (!a) return "Load a grudge6 race first (left strip).";
    const f = space.fitActiveToHuman();
    renderColliderEdit();
    return `Fitted to <b>${HUMAN_HEIGHT_M} m</b> (scale ×${f.toFixed(3)}). Colliders re-measured from meshes.`;
  }
  if (/refit|collider/.test(s) && /mesh|weapon|body|refit|fix|rebuild/.test(s) || /^refit/.test(s)) {
    if (!a) return "No active asset.";
    space.refitCollidersToMeshes();
    renderColliderEdit();
    const w = space.getWeaponMeshNames();
    const blade = a.colliderDefs.find((c) => c.id === "weapon_blade");
    return w.length
      ? `Weapon collider parents to mesh <b>${escapeHtml(w[0]!)}</b> (mode ${blade?.attachMode}). Body capsule from body AABB.`
      : `No visible weapon mesh — equip sword_A in kit. Blade fallback uses hand bone with short forward box (not Y-stick).`;
  }
  if (/export/.test(s)) {
    const data = space.exportVariantJSON();
    if (!data) return "Nothing to export.";
    return `Variant ready: height ${data.measuredHeightM?.toFixed(3)} m · ${data.colliders?.colliders?.length ?? 0} colliders · unit metre. Use <b>Export JSON</b> to download.`;
  }
  if (/play|send/.test(s)) {
    if (!a?.raceId) return "Load a race kit, then Send → Play stamps grudge_active_build + grudge_space_variant.";
    return `Send → Play will open /play?char=${escapeHtml(a.raceId)}&lobby=1 with mesh-fit colliders in session.`;
  }
  if (/skeleton/.test(s)) {
    const on = !/off|hide/.test(s);
    space.setShowSkeleton(on);
    if (skelToggle) skelToggle.checked = on;
    return `SkeletonHelper <b>${on ? "on" : "off"}</b>.`;
  }
  if (/axes/.test(s)) {
    const on = !/off|hide/.test(s);
    space.setShowAxes(on);
    if (axesToggle) axesToggle.checked = on;
    return `AxesHelper <b>${on ? "on" : "off"}</b> (1 m world + asset).`;
  }
  if (/si|metre|meter|unit|scale/.test(s)) {
    return `SI: <b>1 unit = 1 m</b>. Human yardstick <b>1.8 m</b>. Never hero-fit weapons. Body capsule + weapon box are mesh-measured after Fit.`;
  }
  if (/swing|wrong|broken|stupid|weapon/.test(s)) {
    return `Old bug: blade was a long +Y box on <code>R_hand_container</code> — hand axes ≠ blade, so it swung down in anims. <b>Now</b> the box is the AABB of the visible weapon mesh and is parented to that mesh. Click <b>Refit colliders → mesh</b> after equip.`;
  }
  if (/region|bulk|chest|belly/.test(s)) {
    return `Body region sliders scale Bip001 bones 0.75–1.35 after Fit. Then re-run mesh-fit colliders if bulk changed hit volumes.`;
  }
  if (!a) {
    return `No asset loaded. Click a <b>race</b> on the left or drop a GLB. Then: fit · refit colliders · export.`;
  }
  return `Active <b>${escapeHtml(a.name)}</b> · race ${a.raceId || "—"} · weapons: ${space.getWeaponMeshNames().map(escapeHtml).join(", ") || "none"}. Try: <b>refit colliders</b> or <b>help</b>.`;
}

agentForm?.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const q = agentInput?.value?.trim();
  if (!q) return;
  agentSay("user", q);
  agentSay("bot", agentReply(q));
  if (agentInput) agentInput.value = "";
});

// Seed chat
agentSay(
  "bot",
  `<b>Space agent</b> online. SI metres · mesh-fit colliders · SkeletonHelper. Try <b>help</b> or load a race.`,
);

function refreshAll() {
  renderAssets();
  renderClips();
  renderVariants();
  renderMeta();
  buildRegionUI();
  renderColliderEdit();
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
