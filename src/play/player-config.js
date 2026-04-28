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
  // Absolute paths so this file works whether it's served from src/play/
  // (dev), /dist/play/ (Vercel), or directly under / (legacy).
  // The race GLBs + anim packs are mirrored on R2 at
  //   https://assets.grudge-studio.com/characters/races/<id>/model.glb
  //   https://assets.grudge-studio.com/characters/races/anims/<pack>.glb
  // but we keep local fallbacks under /character/races/ for offline dev.
  const RACE_DIR = "/character/races/";

  // ── GRUDGE STUDIO OBJECT STORAGE (Cloudflare R2) ─────────────────────
  // Same hostname check as src/shared/config.ts. On grudgewarlords.com the
  // R2 bucket CORS allows direct access; everywhere else the /assets-cdn
  // proxy defined in vercel.json / vite.config.ts forwards the request so
  // there are no cross-origin issues on Vercel previews or localhost.
  var ASSETS_URL = (function () {
    try {
      if (window.location.hostname === "grudgewarlords.com")
        return "https://assets.grudge-studio.com";
    } catch (e) { /* SSR guard */ }
    return "/assets-cdn";
  })();

  // R2 path conventions (mirrors config.ts raceModelUrl / raceSkinUrl):
  //   ASSETS_URL + "/characters/races/{raceId}/model.glb"
  //   ASSETS_URL + "/characters/races/{raceId}/skins/{variant}.png"
  //   ASSETS_URL + "/characters/races/anims/{packId}.glb"
  var R2_RACES = ASSETS_URL + "/characters/races/";

  // ── LOCAL CHARACTER GLBs ─────────────────────────────────────────────
  // KayKit GLBs served from public/characters/kaykit/ (local only, used as
  // ?store=1 alt variant when you want to swap to the KayKit rig).
  const LOCAL_CHAR_DIR = "/characters/kaykit/";
  const ANIMATION_RIG_URL = LOCAL_CHAR_DIR + "Rig_Medium_General.glb";
  const ANIMATION_RIG_MOVE_URL = LOCAL_CHAR_DIR + "Rig_Medium_MovementBasic.glb";

  // ── UNITY CONTROLLER ANIMATION FBX PACKS ──────────────────────────────
  // The Toon_RTS Player.prefab Animator uses the same Mixamo-rigged motion
  // packs that ship inside Character-Animator-Mapper.zip. The Vite dev
  // server (vite.config.ts → grudgeCharacterAssets plugin) serves the
  // extracted FBX folders directly from the repo at runtime so we don't
  // have to re-bake them into character/races/anims/.
  //
  // These FBXs are Mixamo-rigged. The Player class retargets them onto the
  // Bip001 race skeleton via SkeletonUtils.retargetClip + MIXAMO_TO_BIP001_
  // BONE_MAP below, so source clips like "sword and shield attack.fbx" land
  // correctly on the WK_/BRB_/ELF_/DWF_/ORC_/UD_ rigs.
  const UNITY_DIR =
    "/Character-Animator-Mapper/Character-Animator-Mapper/attached_assets/extracted/";
  const UNITY = {
    locomotion: UNITY_DIR + "locomotion/",
    action:     UNITY_DIR + "action/",
    sword:      UNITY_DIR + "sword_shield/",
    longbow:    UNITY_DIR + "longbow/",
    magic:      UNITY_DIR + "magic/",
    pistol:     UNITY_DIR + "pistol/",
    rifle:      UNITY_DIR + "rifle/",
    unarmed:    UNITY_DIR + "unarmed/",
  };

  // Helper to wrap a Mixamo-rigged FBX URL so the Player loader knows to
  // retarget it onto the Bip001 race skeleton.
  function mixamo(url) { return { url: url, rig: "mixamo" }; }
  // Wrap an already-Bip001 FBX/GLB url. (No retarget needed.)
  function bip001(url) { return { url: url, rig: "bip001" }; }

  // ── RACE TEXTURES ─────────────────────────────────────────────────────
  // Skins are loaded from Grudge Studio object storage at runtime.
  // Path: ASSETS_URL + "/characters/races/{raceId}/skins/{variant}.png"
  // TEXTURE_DIR kept as a local fallback for offline dev.
  const TEXTURE_DIR = "/character/races/textures/";

  // ── 6 PLAYABLE RACES ───────────────────────────────────────────────────
  // `prefix` is the equipment-slot child-mesh prefix used by EquipmentManager
  // logic in script.js. `rigType: "bip001"` opts the loader into the
  // Mixamo->Bip001 retargeting path (see MIXAMO_TO_BIP001_BONE_MAP below).
  // `meta` carries display data sourced from ObjectStore /api/v1/races.json
  // for the centered "Main Panel" race-select grid. `objectStore.url` is the
  // CDN GLB the user can swap to from that grid.
  // NOTE: scale values are 2x the original sandbox values (0.04→0.08 etc.)
  // so the race characters render at the same physical height as a tall
  // Mixamo soldier instead of looking like dolls in the grass field.
  // PLAYER_SCALE in script.js (which controls camera/movement physics) is
  // intentionally NOT touched here — only the visual character mesh grows.
  const CHARACTERS = [
    {
      id: "human",
      label: "Human (WK)",
      file: "WK_Characters.glb",
      prefix: "WK_",
      scale: 0.08,
      yOffset: 0.0,
      rigType: "bip001",
      texture: R2_RACES + "human/skins/default.png",
      meta: {
        color: "#94a3b8",
        faction: "crusade",
        trait: "Adaptable",
        emoji: "\u{1F9D1}",
        description:
          "Versatile and adaptable — masters of none, capable of all.",
        passive: "+1 to all attributes",
      },
      objectStore: { url: LOCAL_CHAR_DIR + "Ranger.glb", scale: 2.0 },
    },
    {
      id: "barbarian",
      label: "Barbarian (BRB)",
      file: "BRB_Characters.glb",
      prefix: "BRB_",
      scale: 0.08,
      yOffset: 0.0,
      rigType: "bip001",
      texture: R2_RACES + "barbarian/skins/default.png",
      meta: {
        color: "#f43f5e",
        faction: "crusade",
        trait: "Berserker Rage",
        emoji: "\u{1FA93}",
        description:
          "Untamed fury given form — raw power and relentless aggression.",
        passive: "+3 STR, +2 AGI, +1 VIT, +1 END, +1 TAC",
      },
      objectStore: { url: LOCAL_CHAR_DIR + "Barbarian.glb", scale: 2.0 },
    },
    {
      id: "elf",
      label: "Elf (ELF)",
      file: "ELF_Characters.glb",
      prefix: "ELF_",
      scale: 0.08,
      yOffset: 0.0,
      rigType: "bip001",
      texture: R2_RACES + "elf/skins/highelves.png",
      meta: {
        color: "#22d3ee",
        faction: "fabled",
        trait: "Arcane Affinity",
        emoji: "\u{1F9DD}",
        description:
          "Ancient and graceful — wielders of arcane arts and deadly precision.",
        passive: "+3 INT, +2 DEX, +2 AGI, +1 WIS",
      },
      objectStore: { url: LOCAL_CHAR_DIR + "Ranger.glb", scale: 2.0 },
    },
    {
      id: "dwarf",
      label: "Dwarf (DWF)",
      file: "DWF_Characters.glb",
      prefix: "DWF_",
      scale: 0.07,
      yOffset: 0.0,
      rigType: "bip001",
      texture: R2_RACES + "dwarf/skins/default.png",
      meta: {
        color: "#f59e0b",
        faction: "fabled",
        trait: "Stoneborn",
        emoji: "\u26CF",
        description:
          "Stout mountain folk — unyielding defense and masterful craftsmanship.",
        passive: "+3 END, +2 VIT, +1 STR, +1 DEX, +1 WIS",
      },
      objectStore: { url: LOCAL_CHAR_DIR + "Knight.glb", scale: 2.0 },
    },
    {
      id: "orc",
      label: "Orc (ORC)",
      file: "ORC_Characters.glb",
      prefix: "ORC_",
      scale: 0.09,
      yOffset: 0.0,
      rigType: "bip001",
      texture: R2_RACES + "orc/skins/default.png",
      meta: {
        color: "#65a30d",
        faction: "legion",
        trait: "Bloodrage",
        emoji: "\u{1F479}",
        description:
          "Savage brutes bred for war — crushing power and iron will.",
        passive: "+4 STR, +2 VIT, +2 END",
      },
      objectStore: { url: LOCAL_CHAR_DIR + "Mage.glb", scale: 2.0 },
    },
    {
      id: "undead",
      label: "Undead (UD)",
      file: "UD_Characters.glb",
      prefix: "UD_",
      scale: 0.08,
      yOffset: 0.0,
      rigType: "bip001",
      texture: R2_RACES + "undead/skins/default.png",
      meta: {
        color: "#a78bfa",
        faction: "legion",
        trait: "Undying Will",
        emoji: "\u{1F480}",
        description:
          "Death-touched revenants fueled by dark energy and grudges unresolved.",
        passive: "+3 VIT, +2 END, +2 WIS, +1 STR",
      },
      objectStore: {
        url: "/characters/character_orc_worge_rigged (1).glb",
        scale: 2.0,
      },
    },
  ].map(function (c) {
    // Primary model URL comes from Grudge Studio object storage (R2).
    // Local /character/races/ FBX is kept as a dev fallback only.
    return Object.assign({}, c, {
      url: R2_RACES + c.id + "/model.glb",
      localUrl: RACE_DIR + c.file,
    });
  });

  const DEFAULT_CHARACTER_ID = "human";

  // Default is now local Toon_RTS FBX (/character/races/). Pass ?store=1
  // in the URL to opt into the ObjectStore (DRACO GLB) CDN variant instead.
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
    let useStore = false;
    let requested = null;
    let activeBuild = null;
    try {
      const raw = sessionStorage.getItem("grudge_active_build");
      if (raw) activeBuild = JSON.parse(raw);
    } catch (e) {
      /* no-op */
    }
    try {
      const params = new URLSearchParams(window.location.search);
      requested = params.get("char");
      const storeFlag = params.get("store");
      if (storeFlag != null)
        useStore = storeFlag !== "0" && storeFlag !== "false";
    } catch (e) {
      /* no-op */
    }

    // sessionStorage build (set by the creator's Play button) takes priority.
    if (!requested && activeBuild && activeBuild.raceId) {
      requested = activeBuild.raceId;
    }

    if (requested) {
      const found = CHARACTERS.find(function (c) {
        return c.id === requested;
      });
      if (found) {
        const resolved = _withStoreVariant(found, useStore);
        // Override skin texture with the one the user chose in the creator.
        if (
          activeBuild &&
          activeBuild.skinVariant &&
          activeBuild.skinVariant !== "default"
        ) {
          return Object.assign({}, resolved, {
            texture:
              R2_RACES +
              resolved.id +
              "/skins/" +
              activeBuild.skinVariant +
              ".png",
            build: activeBuild,
          });
        }
        return Object.assign({}, resolved, { build: activeBuild });
      }
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

  // ── ANIMATION SOURCES (Toon_RTS Bip001 pack + Unity FBX packs) ────────
  // Drop FBXs into ../character/races/anims/ to override per state per
  // race, e.g.
  //   ../character/races/anims/human.idle.fbx        (race-specific)
  //   ../character/races/anims/idle.fbx              (shared)
  //   ../character/races/anims/roll-left.fbx
  // The Player class probes each candidate in order; the first that has
  // a clip wins. Each entry can be either:
  //   - a string URL (treated as Bip001-rigged, no retarget needed)
  //   - { url, rig: "mixamo" | "bip001" } so the loader knows whether to
  //     retarget via SkeletonUtils.retargetClip + MIXAMO_TO_BIP001_BONE_MAP
  //
  // The Bip001 .glb files in /character/races/anims/ were copied out of
  //   F:\Documents\Toon_RTS\Toon_RTS\<Race>\animation\...
  // — the same FBXs the Orc.prefab / Human.prefab Animator references via
  // its TEST.controller, on the Bip001 skeleton, so they apply directly
  // with no retargeting.
  //
  // The Mixamo FBXs under UNITY.* are the full Player.prefab Animator
  // controller pack (Locomotion / Action / SwordShield / Longbow / Magic /
  // Pistol / Rifle / Unarmed) extracted from Character-Animator-Mapper.zip.
  // The Player class retargets them onto Bip001 at runtime.
  const ANIM_DIR = "/character/races/anims/";
  const SHARED_ANIMS = {
    // ── Locomotion ────────────────────────────────────────────────────
    Idle:      [ANIM_DIR + "idle.fbx",  mixamo(UNITY.locomotion + "idle.fbx")],
    Walk:      [ANIM_DIR + "walk.fbx",  mixamo(UNITY.locomotion + "walking.fbx")],
    Run:       [ANIM_DIR + "run.fbx",   mixamo(UNITY.locomotion + "running.fbx")],
    Jump:      [mixamo(UNITY.locomotion + "jump.fbx"), mixamo(UNITY.action + "jumping up.fbx")],
    Fall:      [mixamo(UNITY.action + "falling idle.fbx"), mixamo(UNITY.action + "hard landing.fbx")],
    StrafeL:   [mixamo(UNITY.locomotion + "left strafe walking.fbx")],
    StrafeR:   [mixamo(UNITY.locomotion + "right strafe walking.fbx")],
    TurnL:     [mixamo(UNITY.locomotion + "left turn 90.fbx")],
    TurnR:     [mixamo(UNITY.locomotion + "right turn 90.fbx")],
    // ── Sword & Shield combat ─────────────────────────────────────────
    Attack:    [ANIM_DIR + "attack.fbx", mixamo(UNITY.sword + "sword and shield attack.fbx")],
    Attack2:   [mixamo(UNITY.sword + "sword and shield attack (2).fbx")],
    Attack3:   [mixamo(UNITY.sword + "sword and shield attack (3).fbx")],
    Attack4:   [mixamo(UNITY.sword + "sword and shield attack (4).fbx")],
    Block:     [mixamo(UNITY.sword + "sword and shield block.fbx"), mixamo(UNITY.sword + "sword and shield block idle.fbx")],
    DrawSword: [mixamo(UNITY.sword + "draw sword 1.fbx")],
    SheathSword:[mixamo(UNITY.sword + "sheath sword 1.fbx")],
    // ── Roll / Dodge / Dash (closest matches from action / locomotion packs) ──
    Roll:      [mixamo(UNITY.action + "falling to roll.fbx")],
    RollLeft:  [mixamo(UNITY.action + "falling to roll.fbx"), mixamo(UNITY.locomotion + "left strafe.fbx")],
    RollRight: [mixamo(UNITY.action + "falling to roll.fbx"), mixamo(UNITY.locomotion + "right strafe.fbx")],
    Dodge:     [mixamo(UNITY.action + "falling to roll.fbx"), ANIM_DIR + "run-back.fbx"],
    Dash:      [mixamo(UNITY.locomotion + "running.fbx")],
    // ── Climbing / Sneaking (cover→stand stand-ins until real climb pack) ──
    Climb:     [mixamo(UNITY.action + "stand to cover.fbx"), mixamo(UNITY.action + "cover to stand.fbx")],
    Sneak:     [mixamo(UNITY.action + "crouched sneaking left.fbx")],
    SneakL:    [mixamo(UNITY.action + "left cover sneak.fbx")],
    SneakR:    [mixamo(UNITY.action + "right cover sneak.fbx")],
    // ── Swim (no source pack — degrade gracefully to walk loop) ───────
    Swim:      [mixamo(UNITY.locomotion + "walking.fbx")],
    // ── Unarmed strikes (kick maps to lead jab as closest unarmed strike) ──
    Kick:      [mixamo(UNITY.unarmed + "lead_jab.fbx")],
    Punch:     [mixamo(UNITY.unarmed + "lead_jab.fbx")],
    // ── Magic / Cast / Teleport / Spell VFX triggers ──────────────────
    Cast:      [ANIM_DIR + "cast.fbx", mixamo(UNITY.magic + "Standing 1H Magic Attack 01.fbx")],
    Cast2H:    [mixamo(UNITY.magic + "Standing 2H Magic Area Attack 02.fbx")],
    Teleport:  [mixamo(UNITY.magic + "Standing 2H Magic Area Attack 02.fbx"), mixamo(UNITY.magic + "Standing Jump.fbx")],
    Channel:   [mixamo(UNITY.magic + "standing idle.fbx")],
    // ── Death / hit reacts ────────────────────────────────────────────
    Death:     [ANIM_DIR + "death.fbx", mixamo(UNITY.magic + "Standing React Death Backward.fbx"), mixamo(UNITY.sword + "sword and shield death.fbx")],
    HitLarge:  [mixamo(UNITY.magic + "Standing React Large From Front.fbx")],
    HitSmall:  [mixamo(UNITY.magic + "Standing React Small From Front.fbx")],
    // ── Bow / Longbow ─────────────────────────────────────────────────
    BowIdle:   [mixamo(UNITY.longbow + "standing idle 01.fbx")],
    BowRunF:   [mixamo(UNITY.longbow + "standing run forward.fbx")],
    BowRunB:   [mixamo(UNITY.longbow + "standing run back.fbx")],
    BowRunL:   [mixamo(UNITY.longbow + "standing run left.fbx")],
    BowRunR:   [mixamo(UNITY.longbow + "standing run right.fbx")],
    // ── Pistol / Rifle (gun skill animations) ─────────────────────────
    PistolIdle:[mixamo(UNITY.pistol + "pistol idle.fbx")],
    PistolRun: [mixamo(UNITY.pistol + "pistol run.fbx")],
    PistolJump:[mixamo(UNITY.pistol + "pistol jump.fbx")],
    RifleIdle: [mixamo(UNITY.rifle + "idle aiming.fbx")],
    RifleRun:  [mixamo(UNITY.rifle + "run forward.fbx")],
    // ── Hotbar skills 1-9 ─────────────────────────────────────────────
    // Map each numeric slot to a thematic combat / utility move so a fresh
    // character has every hotkey doing something different.
    Skill1:    [ANIM_DIR + "attack.fbx",        mixamo(UNITY.sword + "sword and shield attack.fbx")],
    Skill2:    [ANIM_DIR + "attack-spear.fbx",  mixamo(UNITY.sword + "sword and shield attack (2).fbx")],
    Skill3:    [ANIM_DIR + "cast.fbx",          mixamo(UNITY.magic + "Standing 1H Magic Attack 01.fbx")],
    Skill4:    [mixamo(UNITY.magic + "Standing 2H Magic Area Attack 02.fbx")], // teleport / aoe
    Skill5:    [mixamo(UNITY.action + "falling to roll.fbx")],                  // roll
    Skill6:    [mixamo(UNITY.unarmed + "lead_jab.fbx")],                        // kick / punch
    Skill7:    [mixamo(UNITY.longbow + "standing run forward.fbx")],            // bow shot stand-in
    Skill8:    [mixamo(UNITY.rifle + "idle aiming.fbx")],                       // ranged aim
    Skill9:    [mixamo(UNITY.magic + "Standing 2H Magic Area Attack 02.fbx")],  // ult / spell vfx trigger
  };

  // ── ANIMATION → SPELL VFX MAP ─────────────────────────────────────────
  // The Player class fires `grudge:vfx` CustomEvents alongside one-shot
  // animations so the world layer can spawn projectiles, ground rings,
  // teleport flashes, etc. The HUD listens for these to update cooldown
  // overlays. Set `vfx: null` to keep an animation silent.
  const SPELL_VFX = {
    Cast:     { kind: "spell-bolt",   color: "#9ab8ff", duration: 0.6, sound: "cast" },
    Cast2H:   { kind: "spell-aoe",    color: "#a78bfa", duration: 1.2, sound: "cast-aoe" },
    Teleport: { kind: "teleport",     color: "#22d3ee", duration: 0.45, sound: "teleport" },
    Channel:  { kind: "channel-aura", color: "#7dd3fc", duration: 1.5, sound: "channel" },
    Roll:     { kind: "dust-puff",    color: "#d4a373", duration: 0.35, sound: "roll" },
    Dash:     { kind: "dash-trail",   color: "#f5e2c1", duration: 0.3,  sound: "dash" },
    Skill3:   { kind: "spell-bolt",   color: "#9ab8ff", duration: 0.6, sound: "cast" },
    Skill4:   { kind: "spell-aoe",    color: "#a78bfa", duration: 1.2, sound: "cast-aoe" },
    Skill9:   { kind: "spell-aoe",    color: "#f43f5e", duration: 1.5, sound: "ult" },
  };

  // Normalize one source entry into { url, rig }. Strings default to the
  // caller's rig hint (passed in from animationSourcesFor).
  function _normalizeAnimSource(entry, defaultRig) {
    if (typeof entry === "string") return { url: entry, rig: defaultRig };
    if (entry && typeof entry === "object" && entry.url) {
      return { url: entry.url, rig: entry.rig || defaultRig };
    }
    return null;
  }

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
      // Per-race overrides + generic local Bip001 anims first, then the
      // shared list (which can mix Bip001 GLBs and Mixamo FBXs).
      const local = [
        ANIM_DIR + character.id + "." + lower + ".fbx",
        ANIM_DIR + character.id + "." + lower + ".glb",
        ANIM_DIR + lower + ".fbx",
        ANIM_DIR + lower + ".glb",
      ];
      sources[state] = local
        .map(function (s) { return _normalizeAnimSource(s, "bip001"); })
        .concat(
          shared.map(function (s) { return _normalizeAnimSource(s, "bip001"); })
        )
        .filter(Boolean);
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
    // Locomotion
    "Idle",
    "Walk",
    "Run",
    "Jump",
    "Fall",
    "StrafeL",
    "StrafeR",
    "TurnL",
    "TurnR",
    // Combat
    "Attack",
    "Attack2",
    "Attack3",
    "Attack4",
    "Block",
    "DrawSword",
    "SheathSword",
    // Movement skills
    "Roll",
    "RollLeft",
    "RollRight",
    "Dodge",
    "Dash",
    "Climb",
    "Sneak",
    "SneakL",
    "SneakR",
    "Swim",
    // Unarmed
    "Kick",
    "Punch",
    // Magic / spell vfx
    "Cast",
    "Cast2H",
    "Teleport",
    "Channel",
    // Reactions
    "Death",
    "HitLarge",
    "HitSmall",
    // Bow / longbow
    "BowIdle",
    "BowRunF",
    "BowRunB",
    "BowRunL",
    "BowRunR",
    // Pistol / rifle
    "PistolIdle",
    "PistolRun",
    "PistolJump",
    "RifleIdle",
    "RifleRun",
    // Hotbar 1-9
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
      texture: c.texture,
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
    SPELL_VFX: SPELL_VFX,
    SHARED_ANIMS: SHARED_ANIMS,
    UNITY_DIR: UNITY_DIR,
    UNITY: UNITY,
    TEXTURE_DIR: TEXTURE_DIR,
    STORE: STORE,
    STORE_CHAR_DIR: STORE_CHAR_DIR,
    ANIMATION_RIG_URL: ANIMATION_RIG_URL,
    ANIMATION_RIG_MOVE_URL: ANIMATION_RIG_MOVE_URL,
    resolveCharacter: resolveCharacter,
    animationSourcesFor: animationSourcesFor,
    getLoadoutPreset: getLoadoutPreset,
    getSpellVfx: function (state) {
      return SPELL_VFX[state] || null;
    },
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
