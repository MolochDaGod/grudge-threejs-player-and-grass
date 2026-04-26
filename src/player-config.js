// src/player-config.js
//
// Player config for the 6 Toon_RTS race characters used by the Grudge
// uMMORPG Unity prefabs (Human/Barbarian/Elf/Dwarf/Orc/Undead). Source
// FBXs were copied from
//   F:\Documents\Toon_RTS\Toon_RTS\<Faction>\models\<PREFIX>_Characters_customizable.FBX
// into ../character/races/ so the dist build can serve them locally.
//
// Each FBX is a 3ds Max Biped (Bip001) skinned mesh with the equipment
// slot architecture described in the grudge-character-tester skill:
//
//   Bone containers (held items):
//     R_hand_container, L_hand_container, L_shield_container,
//     Bone_bag, Bone_wood, Quiver_container
//
//   Equipment child meshes (prefix per race):
//     {PREFIX}Units_Body_A..E, _Arms_A..D, _Legs_A..C, _head_A..I,
//     _shoulderpads_A/B, _sword_A/B, _axe_A/B, _hammer_A/B, _pick,
//     _spear, _Bow, _staff_A/B/C, _shield_A..D, Xtra_bag/wood/quiver
//
// All 6 share the same Bip001 skeleton, so a single animation pack
// retargets onto every race.
(function (global) {
  const RACE_DIR = "../character/races/";

  // ── GRUDGE OBJECT STORE (CDN) ─────────────────────────────────────────
  // Remote DRACO-compressed KayKit-style GLBs hosted at
  //   https://molochdagod.github.io/ObjectStore/
  // Boot module configures a DRACOLoader on the shared THREE_GLTFLoader so
  // any swap to an `objectStore.url` decompresses correctly. The shared
  // animation rigs ride alongside the character meshes — each pack is a
  // 30-node Bip001-ish skeleton with 11–15 baked clips.
  const STORE = "https://molochdagod.github.io/ObjectStore";
  const STORE_CHAR_DIR = STORE + "/models/_optimized/characters/";
  const ANIMATION_RIG_URL = STORE_CHAR_DIR + "Rig_Medium_General.glb";
  const ANIMATION_RIG_MOVE_URL =
    STORE_CHAR_DIR + "Rig_Medium_MovementBasic.glb";

  // ── 6 PLAYABLE RACES ───────────────────────────────────────────────────
  // `prefix` is the equipment-slot child-mesh prefix used by EquipmentManager
  // logic in script.js. `rigType: "bip001"` opts the loader into the
  // Mixamo->Bip001 retargeting path (see MIXAMO_TO_BIP001_BONE_MAP below).
  // `meta` carries display data sourced from ObjectStore /api/v1/races.json
  // for the centered "Main Panel" race-select grid. `objectStore.url` is the
  // CDN GLB the user can swap to from that grid.
  const CHARACTERS = [
    {
      id: "human",
      label: "Human (WK)",
      file: "Human.fbx",
      prefix: "WK_",
      scale: 1.0,
      yOffset: 0.0,
      rigType: "bip001",
      meta: {
        color: "#94a3b8",
        faction: "crusade",
        trait: "Adaptable",
        emoji: "\u{1F9D1}",
        description:
          "Versatile and adaptable — masters of none, capable of all.",
        passive: "+1 to all attributes",
      },
      objectStore: { url: STORE_CHAR_DIR + "soldier.glb", scale: 1.0 },
    },
    {
      id: "barbarian",
      label: "Barbarian (BRB)",
      file: "Barbarian.fbx",
      prefix: "BRB_",
      scale: 1.0,
      yOffset: 0.0,
      rigType: "bip001",
      meta: {
        color: "#f43f5e",
        faction: "crusade",
        trait: "Berserker Rage",
        emoji: "\u{1FA93}",
        description:
          "Untamed fury given form — raw power and relentless aggression.",
        passive: "+3 STR, +2 AGI, +1 VIT, +1 END, +1 TAC",
      },
      objectStore: { url: STORE_CHAR_DIR + "Barbarian.glb", scale: 1.0 },
    },
    {
      id: "elf",
      label: "Elf (ELF)",
      file: "Elf.fbx",
      prefix: "ELF_",
      scale: 1.0,
      yOffset: 0.0,
      rigType: "bip001",
      meta: {
        color: "#22d3ee",
        faction: "fabled",
        trait: "Arcane Affinity",
        emoji: "\u{1F9DD}",
        description:
          "Ancient and graceful — wielders of arcane arts and deadly precision.",
        passive: "+3 INT, +2 DEX, +2 AGI, +1 WIS",
      },
      objectStore: { url: STORE_CHAR_DIR + "Ranger.glb", scale: 1.0 },
    },
    {
      id: "dwarf",
      label: "Dwarf (DWF)",
      file: "Dwarf.fbx",
      prefix: "DWF_",
      scale: 0.9,
      yOffset: 0.0,
      rigType: "bip001",
      meta: {
        color: "#f59e0b",
        faction: "fabled",
        trait: "Stoneborn",
        emoji: "\u26CF",
        description:
          "Stout mountain folk — unyielding defense and masterful craftsmanship.",
        passive: "+3 END, +2 VIT, +1 STR, +1 DEX, +1 WIS",
      },
      objectStore: { url: STORE_CHAR_DIR + "Knight.glb", scale: 1.0 },
    },
    {
      id: "orc",
      label: "Orc (ORC)",
      file: "Orc.fbx",
      prefix: "ORC_",
      scale: 1.05,
      yOffset: 0.0,
      rigType: "bip001",
      meta: {
        color: "#65a30d",
        faction: "legion",
        trait: "Bloodrage",
        emoji: "\u{1F479}",
        description:
          "Savage brutes bred for war — crushing power and iron will.",
        passive: "+4 STR, +2 VIT, +2 END",
      },
      objectStore: { url: STORE_CHAR_DIR + "Mage.glb", scale: 1.0 },
    },
    {
      id: "undead",
      label: "Undead (UD)",
      file: "Undead.fbx",
      prefix: "UD_",
      scale: 1.0,
      yOffset: 0.0,
      rigType: "bip001",
      meta: {
        color: "#a78bfa",
        faction: "legion",
        trait: "Undying Will",
        emoji: "\u{1F480}",
        description:
          "Death-touched revenants fueled by dark energy and grudges unresolved.",
        passive: "+3 VIT, +2 END, +2 WIS, +1 STR",
      },
      objectStore: { url: STORE_CHAR_DIR + "Rogue_Hooded.glb", scale: 1.0 },
    },
  ].map(function (c) {
    return Object.assign({}, c, { url: RACE_DIR + c.file });
  });

  const DEFAULT_CHARACTER_ID = "human";

  // ?store=1 (default) returns the ObjectStore (DRACO GLB) variant of the
  // requested race; ?store=0 falls back to the local Toon_RTS FBX. The
  // boot module puts DRACOLoader on window.THREE_DRACOLoader and hands it
  // to a window.THREE_GLTFLoader so script.js can decompress KayKit GLBs.
  function _withStoreVariant(c, useStore) {
    if (!c) return c;
    if (useStore && c.objectStore && c.objectStore.url) {
      return Object.assign({}, c, {
        url: c.objectStore.url,
        scale: c.objectStore.scale || c.scale || 1,
        useStore: true,
      });
    }
    return c;
  }

  function resolveCharacter() {
    let useStore = true;
    let requested = null;
    try {
      const params = new URLSearchParams(window.location.search);
      requested = params.get("char");
      const storeFlag = params.get("store");
      if (storeFlag != null)
        useStore = storeFlag !== "0" && storeFlag !== "false";
    } catch (e) {
      /* no-op */
    }
    if (requested) {
      const found = CHARACTERS.find(function (c) {
        return c.id === requested;
      });
      if (found) return _withStoreVariant(found, useStore);
    }
    const fallback =
      CHARACTERS.find(function (c) {
        return c.id === DEFAULT_CHARACTER_ID;
      }) || CHARACTERS[0];
    return _withStoreVariant(fallback, useStore);
  }

  // ── ANIMATION STATES ───────────────────────────────────────────────────
  // Locomotion + new uMMORPG-style controller verbs.
  const ANIMATION_STATES = [
    "Idle",
    "Walk",
    "Run",
    "Jump",
    "Fall",
    "Block",
    "RollLeft",
    "RollRight",
  ];

  // ── ANIMATION SOURCES (Toon_RTS Bip001 pack) ──────────────────────────
  // Drop FBXs into ../character/races/anims/ to override per state per
  // race, e.g.
  //   ../character/races/anims/human.idle.fbx        (race-specific)
  //   ../character/races/anims/idle.fbx              (shared)
  //   ../character/races/anims/roll-left.fbx
  // The Player class probes each candidate in order; the first that has
  // a clip wins.
  //
  // The shared `*.fbx` files were copied out of
  //   F:\Documents\Toon_RTS\Toon_RTS\<Race>\animation\...
  // — the same FBXs the Orc.prefab / Human.prefab Animator references via
  // its TEST.controller, on the Bip001 skeleton, so they apply directly
  // with no retargeting.
  const ANIM_DIR = "../character/races/anims/";
  const SHARED_ANIMS = {
    Idle:      [ANIM_DIR + "idle.fbx"],
    Walk:      [ANIM_DIR + "walk.fbx"],
    Run:       [ANIM_DIR + "run.fbx"],
    Jump:      [], // no Toon_RTS Bip001 jump pack yet — falls through to Soldier.glb retarget
    Fall:      [], // ditto
    Block:     [], // no block clip in Toon_RTS pack — falls through to Soldier.glb retarget
    RollLeft:  [],
    RollRight: [],
    // Extended Bip001 verbs that ride on the same Bip001 skeleton.
    Attack:    [ANIM_DIR + "attack.fbx", ANIM_DIR + "attack-spear.fbx"],
    Roll:      [ANIM_DIR + "run-diagonal.fbx"],     // closest match in pack until real roll arrives
    Dodge:     [ANIM_DIR + "run-back.fbx"],          // ditto
    Death:     [ANIM_DIR + "death.fbx"],
    Cast:      [ANIM_DIR + "cast.fbx"],
    Skill1:    [ANIM_DIR + "attack.fbx"],
    Skill2:    [ANIM_DIR + "attack-spear.fbx"],
    Skill3:    [ANIM_DIR + "cast.fbx"],
    Skill4:    [ANIM_DIR + "working.fbx"],
    Skill5:    [ANIM_DIR + "run-diagonal.fbx"],
  };

  function animationSourcesFor(character) {
    const sources = {};
    // Cover both the legacy state list and the extended Bip001 list so
    // races and non-races both get hits.
    const allStates = ANIMATION_STATES.concat(
      ANIMATION_STATES_BIP001.filter(function (s) { return ANIMATION_STATES.indexOf(s) === -1; })
    );
    allStates.forEach(function (state) {
      const lower = state
        .toLowerCase()
        .replace("rollleft", "roll-left")
        .replace("rollright", "roll-right");
      const shared = SHARED_ANIMS[state] || [];
      sources[state] = [
        // Per-race override wins.
        ANIM_DIR + character.id + "." + lower + ".fbx",
        ANIM_DIR + character.id + "." + lower + ".glb",
        // Then a generic name.
        ANIM_DIR + lower + ".fbx",
        ANIM_DIR + lower + ".glb",
      ].concat(shared);
    });
    return sources;
  }

  // ── MIXAMO -> 3DS MAX BIPED (Bip001) BONE MAP ─────────────────────────
  // Retarget Mixamo-rigged source clips (e.g. the threejs Soldier.glb
  // bundle) onto the Toon_RTS Bip001 skeleton at runtime via
  // SkeletonUtils.retargetClip. Keys are Mixamo bone names, values are
  // the matching Bip001 bone names exactly as they appear in the FBX
  // (note the literal spaces — these are NOT typos).
  const MIXAMO_TO_BIP001_BONE_MAP = {
    "mixamorig:Hips": "Bip001 Pelvis",
    "mixamorig:Spine": "Bip001 Spine",
    "mixamorig:Spine1": "Bip001 Spine",
    "mixamorig:Spine2": "Bip001 Spine",
    "mixamorig:Neck": "Bip001 Neck",
    "mixamorig:Head": "Bip001 Head",
    "mixamorig:LeftShoulder": "Bip001 L Clavicle",
    "mixamorig:LeftArm": "Bip001 L UpperArm",
    "mixamorig:LeftForeArm": "Bip001 L Forearm",
    "mixamorig:LeftHand": "Bip001 L Hand",
    "mixamorig:RightShoulder": "Bip001 R Clavicle",
    "mixamorig:RightArm": "Bip001 R UpperArm",
    "mixamorig:RightForeArm": "Bip001 R Forearm",
    "mixamorig:RightHand": "Bip001 R Hand",
    "mixamorig:LeftUpLeg": "Bip001 L Thigh",
    "mixamorig:LeftLeg": "Bip001 L Calf",
    "mixamorig:LeftFoot": "Bip001 L Foot",
    "mixamorig:LeftToeBase": "Bip001 L Toe0",
    "mixamorig:RightUpLeg": "Bip001 R Thigh",
    "mixamorig:RightLeg": "Bip001 R Calf",
    "mixamorig:RightFoot": "Bip001 R Foot",
    "mixamorig:RightToeBase": "Bip001 R Toe0",
  };

  // ── FALLBACK ANIMATION BUNDLE ──────────────────────────────────────────
  // The Toon_RTS animation packs (1hweaponandshield/, meleemoves/ etc.)
  // referenced by FactionRegistry.js are NOT yet present on disk. Until
  // those packs are added (or hosted on object storage) we fall back to
  // the threejs.org Mixamo Soldier model and retarget Mixamo->Bip001 via
  // the bone map above. This gives Idle/Walk/Run on every race for free.
  // Drop pack FBXs into ../character/races/anims/ to override per state.
  const FALLBACK_BUNDLE = {
    urls: ["https://threejs.org/examples/models/gltf/Soldier.glb"],
    rigType: "mixamo",
    clips: {
      Idle: [/idle/i],
      Walk: [/walk/i],
      Run: [/run/i],
      Jump: [/jump/i, /walk/i],
      Fall: [/fall/i, /idle/i],
      // No Mixamo block / roll in Soldier.glb — these stay empty until
      // the user drops Bip001 anim packs into character/races/anims/.
      Block: [/block/i, /idle/i],
      RollLeft: [/roll.*left|left.*roll|dodge.*left/i, /run/i],
      RollRight: [/roll.*right|right.*roll|dodge.*right/i, /run/i],
    },
  };

  // ── CONTROLLER BINDINGS (uMMORPG-style) ────────────────────────────────
  // The Player/World classes read CONTROLLER_BINDINGS to know which keys
  // map to which animation state and to fire `grudge:input` CustomEvents
  // the HUD listens for (slot flash, hotbar press feedback, block ring).
  const CONTROLLER_BINDINGS = {
    move: { forward: "KeyW", back: "KeyS", left: "KeyA", right: "KeyD" },
    sprint: "ShiftLeft",
    jump: "Space",
    block: "ShiftRight", // hold to block (shield raise)
    rollLeft: "KeyQ",
    rollRight: "KeyE",
    interact: "KeyF",
    hotbar: {
      1: "Digit1",
      2: "Digit2",
      3: "Digit3",
      4: "Digit4",
      5: "Digit5",
      6: "Digit6",
      7: "Digit7",
      8: "Digit8",
    },
  };

  // ── LEGACY ALIAS (compat) ─────────────────────────────────────────────
  // Older Player code looks for cfg.CC_BONE_MAP. Provide an empty stub so
  // `_buildBoneNameMap(model, cfg.CC_BONE_MAP)` is a no-op for race FBXs
  // (we use the Mixamo->Bip001 map below instead).
  const CC_BONE_MAP = {};

  // ── ANIMATION STATES (extended uMMORPG / Bip001 verbs) ────────────────
  // Mirrors PLAYER_ANIMATION_STATES_BIP001 inside the bundled script.js.
  // Exported so the sandbox spawn UI / equipment panel can decide which
  // hotbar slots are bindable per character. Death + Cast added so the
  // Toon_RTS death/cast clips have a slot to land in.
  const ANIMATION_STATES_BIP001 = [
    "Idle",
    "Walk",
    "Run",
    "Jump",
    "Fall",
    "Attack",
    "Block",
    "Roll",
    "Dodge",
    "Death",
    "Cast",
    "Skill1",
    "Skill2",
    "Skill3",
    "Skill4",
    "Skill5",
    "Skill6",
    "Skill7",
    "Skill8",
    "Skill9",
  ];

  // ── LOADOUT PRESETS ───────────────────────────────────────────────────
  // Garry's Mod-style "spawn with this gear" presets. Each preset is a
  // map of slot -> variant letter (or "_default" for noVariant slots).
  // Slots match the keys produced by GrudgeEquipmentManager.SLOT_DEFS:
  //   armor:    body, arms, legs, head, shoulders
  //   weapon_r: axe, hammer, sword, pick, spear
  //   weapon_l: bow, staff
  //   shield:   shield
  //   utility:  bag, wood, quiver
  // The equipment manager applies the preset via applyLoadout(loadout).
  // Variants that don't exist on a given race silently fall through.
  const LOADOUT_PRESETS = [
    {
      id: "knight",
      label: "Knight",
      description: "Heavy plate, sword & shield.",
      icon: "\u2694",
      loadout: {
        body: "C",
        arms: "C",
        legs: "C",
        head: "D",
        shoulders: "B",
        sword: "A",
        shield: "A",
      },
    },
    {
      id: "berserker",
      label: "Berserker",
      description: "Light armor, dual axes.",
      icon: "\u26CF",
      loadout: { body: "B", arms: "B", legs: "B", head: "B", axe: "A" },
    },
    {
      id: "archer",
      label: "Archer",
      description: "Cloth + leather, bow & quiver.",
      icon: "\u{1F3F9}",
      loadout: {
        body: "A",
        arms: "A",
        legs: "A",
        head: "A",
        bow: "_default",
        quiver: "_default",
      },
    },
    {
      id: "mage",
      label: "Mage",
      description: "Robes and a staff.",
      icon: "\u{1F52E}",
      loadout: { body: "D", arms: "D", legs: "C", head: "E", staff: "A" },
    },
    {
      id: "tank",
      label: "Tank",
      description: "Maximum plate, hammer & tower shield.",
      icon: "\u{1F6E1}",
      loadout: {
        body: "E",
        arms: "D",
        legs: "C",
        head: "F",
        shoulders: "B",
        hammer: "A",
        shield: "B",
      },
    },
    {
      id: "spearman",
      label: "Spearman",
      description: "Mid armor, spear & shield.",
      icon: "\u{1F3AF}",
      loadout: {
        body: "B",
        arms: "B",
        legs: "B",
        head: "C",
        spear: "_default",
        shield: "A",
      },
    },
    {
      id: "miner",
      label: "Miner",
      description: "Civilian outfit, pick & bag.",
      icon: "\u26CF",
      loadout: {
        body: "A",
        arms: "A",
        legs: "A",
        head: "A",
        pick: "_default",
        bag: "_default",
      },
    },
    {
      id: "lumberjack",
      label: "Lumberjack",
      description: "Civilian outfit, hand-axe & log.",
      icon: "\u{1FAB5}",
      loadout: {
        body: "A",
        arms: "A",
        legs: "A",
        head: "B",
        axe: "B",
        wood: "_default",
      },
    },
  ];

  function getLoadoutPreset(id) {
    return (
      LOADOUT_PRESETS.find(function (p) {
        return p.id === id;
      }) || null
    );
  }

  // ── PROP / SPAWNABLE CATALOG ──────────────────────────────────────────
  // Extra entries the sandbox UI offers as "spawn" targets. For now these
  // are race characters with optional default loadouts so users can drop
  // multiple AI dummies into the grass scene. Future entries can point at
  // standalone GLB props (rocks/trees/fences) — sandbox-spawner skips the
  // equipment / animation pipeline when `prop: true`.
  const SPAWN_CATALOG = CHARACTERS.map(function (c) {
    return {
      id: "spawn_" + c.id,
      kind: "character",
      label: c.label,
      characterId: c.id,
      defaultPreset: null, // overrideable via UI
    };
  });

  // ── RACES (main-panel grid) ───────────────────────────────────────────
  // Same entries as CHARACTERS, but with `meta` flattened to the top level
  // for ergonomic access in the centered race-select UI. The UI renders one
  // tile per entry (color swatch, emoji, trait, faction badge, passive line)
  // and a click swaps the active player to that race via the local FBX, an
  // optional Equipment button on the tile opens the slot/variant overlay.
  const RACES = CHARACTERS.map(function (c) {
    return {
      id: c.id,
      label: c.label,
      url: c.url,
      objectStore: c.objectStore,
      prefix: c.prefix,
      scale: c.scale,
      rigType: c.rigType,
      color: (c.meta && c.meta.color) || "#c9950a",
      faction: (c.meta && c.meta.faction) || "neutral",
      trait: (c.meta && c.meta.trait) || "",
      emoji: (c.meta && c.meta.emoji) || "",
      description: (c.meta && c.meta.description) || "",
      passive: (c.meta && c.meta.passive) || "",
    };
  });

  global.GrudgePlayerConfig = {
    CHARACTERS: CHARACTERS,
    RACES: RACES,
    DEFAULT_CHARACTER_ID: DEFAULT_CHARACTER_ID,
    ANIMATION_STATES: ANIMATION_STATES,
    ANIMATION_STATES_BIP001: ANIMATION_STATES_BIP001,
    CC_BONE_MAP: CC_BONE_MAP,
    BIP001_BONE_MAP: MIXAMO_TO_BIP001_BONE_MAP,
    FALLBACK_BUNDLE: FALLBACK_BUNDLE,
    CONTROLLER_BINDINGS: CONTROLLER_BINDINGS,
    LOADOUT_PRESETS: LOADOUT_PRESETS,
    SPAWN_CATALOG: SPAWN_CATALOG,
    STORE: STORE,
    STORE_CHAR_DIR: STORE_CHAR_DIR,
    ANIMATION_RIG_URL: ANIMATION_RIG_URL,
    ANIMATION_RIG_MOVE_URL: ANIMATION_RIG_MOVE_URL,
    resolveCharacter: resolveCharacter,
    animationSourcesFor: animationSourcesFor,
    getLoadoutPreset: getLoadoutPreset,
    getCharacter: function (id) {
      return (
        CHARACTERS.find(function (c) {
          return c.id === id;
        }) || null
      );
    },
    getRaceById: function (id) {
      return (
        RACES.find(function (r) {
          return r.id === id;
        }) || null
      );
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
