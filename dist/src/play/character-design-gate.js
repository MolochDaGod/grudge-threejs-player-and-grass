/**
 * /play character design entry gate.
 *
 * Flow:
 *   1. Bare /play  → show design overlay (race, skin, loadout, name)
 *   2. Hit Play    → stamp grudge_active_build + navigate /play?char=…&lobby=1
 *   3. Lobby mode  → hide gate, reveal HUD, pirate open-world grass scene
 *
 * Landing page Play button already lands with ?char= → treated as lobby entry.
 * Three.js only — no Babylon.
 */
(function (global) {
  const STORAGE_KEY = "grudge_active_build";
  const SKIN_VARIANTS = {
    human: ["default"],
    barbarian: ["default"],
    elf: ["highelves", "default"],
    dwarf: ["default"],
    orc: ["default"],
    undead: ["default"],
  };
  const ANIM_PACKS = [
    { id: "sword_shield", label: "Sword & Shield" },
    { id: "longbow", label: "Longbow" },
    { id: "magic", label: "Magic" },
    { id: "spear_melee", label: "Spear" },
    { id: "unarmed", label: "Unarmed" },
  ];

  function qs() {
    try {
      return new URLSearchParams(global.location.search);
    } catch (_) {
      return new URLSearchParams();
    }
  }

  function isLobbyMode() {
    const p = qs();
    if (p.get("lobby") === "1" || p.get("enter") === "1") return true;
    // Landing Play → /play?char=race is a deliberate enter
    if (p.get("char")) return true;
    return false;
  }

  function readBuild() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function writeBuild(build) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(build));
    } catch (_) {
      /* quota / private mode */
    }
  }

  function races() {
    const cfg = global.GrudgePlayerConfig;
    if (cfg && cfg.RACES && cfg.RACES.length) return cfg.RACES;
    return [
      { id: "human", label: "Human", emoji: "🧑", color: "#94a3b8", trait: "Adaptable", faction: "crusade" },
      { id: "barbarian", label: "Barbarian", emoji: "🪓", color: "#f43f5e", trait: "Berserker", faction: "crusade" },
      { id: "elf", label: "Elf", emoji: "🧝", color: "#22d3ee", trait: "Arcane", faction: "fabled" },
      { id: "dwarf", label: "Dwarf", emoji: "⛏", color: "#f59e0b", trait: "Stoneborn", faction: "fabled" },
      { id: "orc", label: "Orc", emoji: "👹", color: "#65a30d", trait: "Bloodrage", faction: "legion" },
      { id: "undead", label: "Undead", emoji: "💀", color: "#a78bfa", trait: "Undying", faction: "legion" },
    ];
  }

  function presets() {
    const cfg = global.GrudgePlayerConfig;
    return (cfg && cfg.LOADOUT_PRESETS) || [
      { id: "knight", label: "Knight", description: "Sword & shield", loadout: { body: "C", arms: "C", legs: "C", head: "D", shoulders: "B", sword: "A", shield: "A" } },
      { id: "berserker", label: "Berserker", description: "Axe", loadout: { body: "B", arms: "B", legs: "B", head: "B", axe: "A" } },
      { id: "archer", label: "Archer", description: "Bow", loadout: { body: "A", arms: "A", legs: "A", head: "A", bow: "_default", quiver: "_default" } },
      { id: "mage", label: "Mage", description: "Staff", loadout: { body: "D", arms: "D", legs: "C", head: "E", staff: "A" } },
    ];
  }

  function defaultSkin(raceId) {
    const list = SKIN_VARIANTS[raceId] || ["default"];
    return list[0];
  }

  function texturePath(raceId, skin) {
    return "/character/races/textures/" + raceId + "/" + (skin || "default") + ".png";
  }

  function ensureGateStyles() {
    if (document.getElementById("cdg-styles")) return;
    const s = document.createElement("style");
    s.id = "cdg-styles";
    s.textContent = `
#char-design-gate {
  position: fixed; inset: 0; z-index: 100;
  display: flex; align-items: center; justify-content: center;
  background:
    radial-gradient(ellipse at 50% 20%, rgba(40,70,100,.55), transparent 55%),
    linear-gradient(165deg, #0a1628 0%, #1a120c 45%, #0c1a14 100%);
  font-family: "Cinzel", serif;
  color: #f5e2c1;
  overflow: auto;
  transition: opacity .45s ease, visibility .45s ease;
}
#char-design-gate.hidden {
  opacity: 0; visibility: hidden; pointer-events: none;
}
#char-design-gate .cdg-shell {
  width: min(920px, 94vw);
  margin: 24px auto;
  background: linear-gradient(180deg, rgba(26,18,12,.96), rgba(10,7,5,.96));
  border: 2px solid #c9950a;
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,.7), inset 0 0 40px rgba(0,0,0,.35);
  padding: 22px 24px 18px;
}
#char-design-gate .cdg-brand {
  display: flex; align-items: center; gap: 12px; margin-bottom: 6px;
}
#char-design-gate .cdg-brand .mark {
  width: 42px; height: 42px; border-radius: 8px;
  background: linear-gradient(135deg, #c9950a, #7a5a08);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: #0a0705; font-weight: 900;
}
#char-design-gate h1 {
  margin: 0; font-size: 22px; letter-spacing: 2px; color: #d4a400;
  text-transform: uppercase;
}
#char-design-gate .cdg-sub {
  margin: 0 0 16px; font-family: "JetBrains Mono", monospace;
  font-size: 11px; color: #9b7d52; letter-spacing: .5px;
}
#char-design-gate .cdg-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 18px;
}
@media (max-width: 720px) {
  #char-design-gate .cdg-grid { grid-template-columns: 1fr; }
}
#char-design-gate .cdg-label {
  font-size: 10px; letter-spacing: 1.6px; text-transform: uppercase;
  color: #c9950a; margin: 0 0 8px;
}
#char-design-gate .cdg-races {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
}
#char-design-gate .cdg-race {
  background: #0a0705; border: 1.5px solid #3a2a1a; border-radius: 8px;
  padding: 10px 8px; cursor: pointer; text-align: center;
  transition: border-color .15s, transform .12s, box-shadow .15s;
}
#char-design-gate .cdg-race:hover { border-color: #c9950a; transform: translateY(-2px); }
#char-design-gate .cdg-race.active {
  border-color: var(--rc, #c9950a);
  box-shadow: 0 0 16px color-mix(in srgb, var(--rc, #c9950a) 40%, transparent);
}
#char-design-gate .cdg-race .em { font-size: 26px; line-height: 1; }
#char-design-gate .cdg-race .nm {
  font-size: 11px; letter-spacing: 1px; color: #d4a400; margin-top: 4px;
  text-transform: uppercase;
}
#char-design-gate .cdg-race .tr {
  font-family: "JetBrains Mono", monospace; font-size: 9px; color: #9b7d52; margin-top: 2px;
}
#char-design-gate .cdg-field { margin-bottom: 12px; }
#char-design-gate input[type="text"],
#char-design-gate select {
  width: 100%; box-sizing: border-box;
  background: #0a0705; color: #f5e2c1;
  border: 1px solid #3a2a1a; border-radius: 4px;
  padding: 8px 10px; font-family: "JetBrains Mono", monospace; font-size: 13px;
}
#char-design-gate input:focus, #char-design-gate select:focus {
  outline: none; border-color: #c9950a;
}
#char-design-gate .cdg-presets {
  display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
}
#char-design-gate .cdg-preset {
  background: #0a0705; border: 1px solid #3a2a1a; border-radius: 6px;
  padding: 8px; cursor: pointer; text-align: left;
  font-family: "JetBrains Mono", monospace; font-size: 11px; color: #f5e2c1;
}
#char-design-gate .cdg-preset:hover { border-color: #c9950a; }
#char-design-gate .cdg-preset.active {
  background: rgba(201,149,10,.18); border-color: #c9950a; color: #d4a400;
}
#char-design-gate .cdg-preset small {
  display: block; color: #9b7d52; font-size: 9px; margin-top: 2px;
}
#char-design-gate .cdg-summary {
  margin-top: 8px; padding: 10px 12px;
  background: rgba(0,0,0,.35); border: 1px dashed #3a2a1a; border-radius: 6px;
  font-family: "JetBrains Mono", monospace; font-size: 11px; line-height: 1.55;
  color: #9b7d52;
}
#char-design-gate .cdg-summary b { color: #d4a400; }
#char-design-gate .cdg-actions {
  display: flex; gap: 10px; margin-top: 18px; align-items: center;
}
#char-design-gate .cdg-play {
  flex: 1; padding: 14px 18px;
  background: linear-gradient(180deg, #d4a400, #c9950a);
  color: #0a0705; border: none; border-radius: 8px;
  font-family: "Cinzel", serif; font-size: 16px; font-weight: 900;
  letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
  box-shadow: 0 6px 20px rgba(201,149,10,.35);
}
#char-design-gate .cdg-play:hover {
  background: linear-gradient(180deg, #e8b820, #d4a400);
}
#char-design-gate .cdg-skip {
  background: transparent; color: #9b7d52; border: 1px solid #3a2a1a;
  border-radius: 6px; padding: 12px 14px; cursor: pointer;
  font-family: "JetBrains Mono", monospace; font-size: 11px;
}
#char-design-gate .cdg-skip:hover { color: #f5e2c1; border-color: #c9950a; }
#char-design-gate .cdg-hint {
  margin-top: 12px; text-align: center;
  font-family: "JetBrains Mono", monospace; font-size: 10px; color: #6a5540;
}
body.cdg-designing #hud,
body.cdg-designing #main-panel,
body.cdg-designing #info {
  opacity: 0 !important; pointer-events: none !important;
  visibility: hidden !important;
}
body.cdg-designing canvas {
  filter: blur(2px) brightness(0.55);
}
`;
    document.head.appendChild(s);
  }

  function mountShell() {
    let root = document.getElementById("char-design-gate");
    if (root) return root;
    root = document.createElement("div");
    root.id = "char-design-gate";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-label", "Character design");
    root.innerHTML = `
      <div class="cdg-shell">
        <div class="cdg-brand">
          <div class="mark">⚓</div>
          <div>
            <h1>Design your pirate</h1>
            <p class="cdg-sub">Grudge Warlords · Open-world lobby on three-layer grass hills</p>
          </div>
        </div>
        <div class="cdg-grid">
          <div>
            <div class="cdg-label">Race</div>
            <div class="cdg-races" id="cdg-races"></div>
          </div>
          <div>
            <div class="cdg-field">
              <div class="cdg-label">Captain name</div>
              <input type="text" id="cdg-name" maxlength="24" placeholder="e.g. Blackwake" autocomplete="off" />
            </div>
            <div class="cdg-field">
              <div class="cdg-label">Skin</div>
              <select id="cdg-skin"></select>
            </div>
            <div class="cdg-field">
              <div class="cdg-label">Combat pack</div>
              <select id="cdg-pack"></select>
            </div>
            <div class="cdg-label">Loadout</div>
            <div class="cdg-presets" id="cdg-presets"></div>
            <div class="cdg-summary" id="cdg-summary"></div>
          </div>
        </div>
        <div class="cdg-actions">
          <button type="button" class="cdg-play" id="cdg-play">Play → Enter Lobby</button>
          <button type="button" class="cdg-skip" id="cdg-skip" title="Skip with default Human knight">Skip</button>
        </div>
        <p class="cdg-hint">Mesh · texture · scale locked to grudge6 SI (1.8 × world scale 4.2) · grass L0/L1/L2 hills</p>
      </div>
    `;
    document.body.appendChild(root);
    return root;
  }

  function setLobbyChrome(active) {
    document.body.classList.toggle("cdg-designing", !active);
    document.body.classList.toggle("cdg-lobby", !!active);
    document.body.dataset.grudgeMode = active ? "lobby" : "design";
    const gate = document.getElementById("char-design-gate");
    if (gate) gate.classList.toggle("hidden", !!active);
    // Soften fog / sky for pirate lobby once world exists
    if (active && global.world && global.world.scene) {
      try {
        applyPirateLobbyIfNeeded(global.world.scene);
      } catch (_) { /* three not ready */ }
    }
  }

  function applyPirateLobbyIfNeeded(scene) {
    if (!scene || scene.userData._pirateLobby) return;
    scene.userData._pirateLobby = true;
    // Warmer coastal sky — matches terrain-layers applyPirateLobbyAtmosphere
    if (scene.background && scene.background.isColor) {
      scene.background.setHex(0x87b5d4);
    }
    if (scene.fog && scene.fog.isFog) {
      scene.fog.color.setHex(0x9ec4d8);
      scene.fog.near = 80;
      scene.fog.far = 280;
    }
  }

  function buildStateFromUI() {
    const raceId = state.raceId || "human";
    const skin = state.skin || defaultSkin(raceId);
    const preset = presets().find((p) => p.id === state.presetId) || presets()[0];
    const pack = state.pack || "sword_shield";
    const name = (document.getElementById("cdg-name")?.value || "").trim() || "Captain";
    const equipped = Object.assign({}, (preset && preset.loadout) || {
      body: "A", arms: "A", legs: "A", head: "A", sword: "A",
    });
    return {
      schemaVersion: 1,
      name,
      raceId,
      classId: (preset && preset.id) || "knight",
      skinVariant: skin,
      textureUrl: texturePath(raceId, skin),
      animationPack: pack,
      gearPresetId: (preset && preset.id) || "knight",
      equipped,
      lobby: "pirate_open_world",
      targetHeight: 1.8 * 4.2,
      worldScale: 4.2,
    };
  }

  const state = {
    raceId: "barbarian",
    skin: "default",
    pack: "sword_shield",
    presetId: "berserker",
  };

  function refreshSummary() {
    const el = document.getElementById("cdg-summary");
    if (!el) return;
    const b = buildStateFromUI();
    const race = races().find((r) => r.id === b.raceId);
    el.innerHTML =
      "<b>" + b.name + "</b> · " + (race ? race.label : b.raceId) +
      "<br>Skin <b>" + b.skinVariant + "</b> · Pack <b>" + b.animationPack + "</b>" +
      "<br>Loadout <b>" + b.gearPresetId + "</b> · Scale <b>4.2</b> (fit 1.8×)" +
      "<br>Lobby: <b>Pirate open world</b> · 3-layer grass hills";
  }

  function render() {
    ensureGateStyles();
    const root = mountShell();
    const raceHost = document.getElementById("cdg-races");
    raceHost.innerHTML = "";
    races().forEach((r) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cdg-race" + (r.id === state.raceId ? " active" : "");
      btn.style.setProperty("--rc", r.color || "#c9950a");
      btn.innerHTML =
        '<div class="em">' + (r.emoji || "⚔") + "</div>" +
        '<div class="nm">' + (r.label || r.id).replace(/\s*\(.*\)$/, "") + "</div>" +
        '<div class="tr">' + (r.trait || "") + "</div>";
      btn.addEventListener("click", () => {
        state.raceId = r.id;
        state.skin = defaultSkin(r.id);
        fillSkins();
        renderRacesActive();
        refreshSummary();
      });
      raceHost.appendChild(btn);
    });

    function renderRacesActive() {
      raceHost.querySelectorAll(".cdg-race").forEach((el, i) => {
        const r = races()[i];
        el.classList.toggle("active", r && r.id === state.raceId);
      });
    }

    const packSel = document.getElementById("cdg-pack");
    packSel.innerHTML = "";
    ANIM_PACKS.forEach((p) => {
      const o = document.createElement("option");
      o.value = p.id;
      o.textContent = p.label;
      if (p.id === state.pack) o.selected = true;
      packSel.appendChild(o);
    });
    packSel.onchange = () => {
      state.pack = packSel.value;
      refreshSummary();
    };

    function fillSkins() {
      const skinSel = document.getElementById("cdg-skin");
      const list = SKIN_VARIANTS[state.raceId] || ["default"];
      skinSel.innerHTML = "";
      list.forEach((s) => {
        const o = document.createElement("option");
        o.value = s;
        o.textContent = s;
        if (s === state.skin) o.selected = true;
        skinSel.appendChild(o);
      });
      skinSel.onchange = () => {
        state.skin = skinSel.value;
        refreshSummary();
      };
    }
    fillSkins();

    const presetHost = document.getElementById("cdg-presets");
    presetHost.innerHTML = "";
    presets().forEach((p) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cdg-preset" + (p.id === state.presetId ? " active" : "");
      btn.innerHTML = (p.icon ? p.icon + " " : "") + p.label +
        "<small>" + (p.description || "") + "</small>";
      btn.addEventListener("click", () => {
        state.presetId = p.id;
        // Map loadout → combat pack hint
        if (p.loadout) {
          if (p.loadout.bow) state.pack = "longbow";
          else if (p.loadout.staff) state.pack = "magic";
          else if (p.loadout.spear) state.pack = "spear_melee";
          else if (p.loadout.sword || p.loadout.axe || p.loadout.hammer) state.pack = "sword_shield";
          const packSel2 = document.getElementById("cdg-pack");
          if (packSel2) packSel2.value = state.pack;
        }
        presetHost.querySelectorAll(".cdg-preset").forEach((el) => el.classList.remove("active"));
        btn.classList.add("active");
        refreshSummary();
      });
      presetHost.appendChild(btn);
    });

    const existing = readBuild();
    if (existing && existing.name) {
      const nameEl = document.getElementById("cdg-name");
      if (nameEl) nameEl.value = existing.name;
      if (existing.raceId) state.raceId = existing.raceId;
      if (existing.skinVariant) state.skin = existing.skinVariant;
      if (existing.animationPack) state.pack = existing.animationPack;
      if (existing.gearPresetId) state.presetId = existing.gearPresetId;
      fillSkins();
      renderRacesActive();
      const packSel2 = document.getElementById("cdg-pack");
      if (packSel2) packSel2.value = state.pack;
    }

    document.getElementById("cdg-play").onclick = enterLobby;
    document.getElementById("cdg-skip").onclick = () => {
      state.raceId = "human";
      state.presetId = "knight";
      state.pack = "sword_shield";
      state.skin = "default";
      enterLobby();
    };

    document.getElementById("cdg-name").oninput = refreshSummary;
    refreshSummary();
    return root;
  }

  function enterLobby() {
    const build = buildStateFromUI();
    writeBuild(build);
    const url = new URL(global.location.href);
    url.searchParams.set("char", build.raceId);
    url.searchParams.set("lobby", "1");
    // Drop design-only params
    url.searchParams.delete("enter");
    global.location.href = url.pathname + "?" + url.searchParams.toString() + url.hash;
  }

  function showDesign() {
    document.body.classList.add("cdg-designing");
    render();
    setLobbyChrome(false);
  }

  function enterLobbyChromeOnly() {
    ensureGateStyles();
    const gate = document.getElementById("char-design-gate");
    if (gate) gate.classList.add("hidden");
    setLobbyChrome(true);
    // Wait for world boot to tint atmosphere
    const tryAtmos = () => {
      if (global.world && global.world.scene) {
        applyPirateLobbyIfNeeded(global.world.scene);
        return true;
      }
      return false;
    };
    if (!tryAtmos()) {
      let n = 0;
      const t = setInterval(() => {
        if (tryAtmos() || ++n > 40) clearInterval(t);
      }, 250);
    }
  }

  function boot() {
    if (isLobbyMode()) {
      // Ensure a minimal build exists so equip/texture path is defined
      const p = qs();
      const char = p.get("char");
      let build = readBuild();
      if (!build || (char && build.raceId !== char)) {
        const raceId = char || "human";
        const preset = presets().find((x) => x.id === "knight") || presets()[0];
        build = {
          schemaVersion: 1,
          name: (build && build.name) || "Captain",
          raceId,
          classId: (build && build.classId) || "knight",
          skinVariant: (build && build.skinVariant) || defaultSkin(raceId),
          textureUrl: texturePath(raceId, (build && build.skinVariant) || defaultSkin(raceId)),
          animationPack: (build && build.animationPack) || "sword_shield",
          gearPresetId: (build && build.gearPresetId) || "knight",
          equipped: (build && build.equipped && Object.keys(build.equipped).length)
            ? build.equipped
            : Object.assign({}, (preset && preset.loadout) || { body: "A", arms: "A", legs: "A", head: "A", sword: "A" }),
          lobby: "pirate_open_world",
          targetHeight: 1.8 * 4.2,
          worldScale: 4.2,
        };
        writeBuild(build);
      }
      enterLobbyChromeOnly();
    } else {
      showDesign();
    }
  }

  // Early body class so HUD doesn't flash before boot
  try {
    if (!isLobbyMode()) document.documentElement.classList.add("cdg-pending");
  } catch (_) { /* */ }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  global.GrudgeCharacterDesignGate = {
    isLobbyMode,
    showDesign,
    enterLobby,
    readBuild,
    writeBuild,
    buildStateFromUI,
    applyPirateLobbyIfNeeded,
  };
})(typeof window !== "undefined" ? window : globalThis);
