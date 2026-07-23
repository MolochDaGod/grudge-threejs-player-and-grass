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

  // ── LOCAL CHARACTER GLBs ─────────────────────────────────────────────
  // The race GLBs live on disk in character/races/ and are served locally
  // by Vite's grudgeCharacterAssets plugin (dev) and copied to dist/ at
  // build time by grudgeCopyCharacter. This matches config.ts raceModelUrl()
  // which explicitly uses local paths — R2 is no longer the source of truth
  // for these files.
  const LOCAL_CHAR_DIR = "/characters/kaykit/";

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
    action: UNITY_DIR + "action/",
    sword: UNITY_DIR + "sword_shield/",
    longbow: UNITY_DIR + "longbow/",
    magic: UNITY_DIR + "magic/",
    pistol: UNITY_DIR + "pistol/",
    rifle: UNITY_DIR + "rifle/",
    unarmed: UNITY_DIR + "unarmed/",
  };

  // Helper to wrap a Mixamo-rigged FBX URL so the Player loader knows to
  // retarget it onto the Bip001 race skeleton.
  function mixamo(url) {
    return { url: url, rig: "mixamo" };
  }
  // Wrap an already-Bip001 FBX/GLB url. (No retarget needed.)
  function bip001(url) {
    return { url: url, rig: "bip001" };
  }

  // ── RACE TEXTURES ─────────────────────────────────────────────────────
  // Skins are loaded from Grudge Studio object storage at runtime.
  // Path: ASSETS_URL + "/characters/races/{raceId}/skins/{variant}.png"
  // TEXTURE_DIR kept as a local fallback for offline dev.
  const TEXTURE_DIR = "/character/races/textures/";

  // ── 6 PLAYABLE RACES (Toon_RTS / grudge6) ──────────────────────────────
  // All races: Bip001 skeleton, Mixamo anim packs retargeted at runtime.
  // SI world: scale starts at 1; Player autoFit → 1.8 m human height.
  //   - file: local Bip001 GLB (Toon_RTS race kit under /character/races/)
  //   - prefix: equipment mesh prefix (WK_, BRB_, ELF_, DWF_, ORC_, UD_)
  //   - rigType: "bip001"
  const CHARACTERS = [
    {
      id: "human",
      label: "Human (WK)",
      file: "WK_Characters.glb",
      prefix: "WK_",
      scale: 1,
      yOffset: 0.0,
      targetHeight: 1.8,
      rigType: "bip001",
      texture: TEXTURE_DIR + "human/default.png",
      meta: {
        color: "#94a3b8",
        faction: "crusade",
        trait: "Adaptable",
        emoji: "\u{1F9D1}",
        description:
          "Versatile and adaptable — masters of none, capable of all.",
        passive: "+1 to all attributes",
      },
    },
    {
      id: "barbarian",
      label: "Barbarian (BRB)",
      file: "BRB_Characters.glb",
      prefix: "BRB_",
      scale: 1,
      targetHeight: 1.8,
      yOffset: 0.0,
      rigType: "bip001",
      texture: TEXTURE_DIR + "barbarian/default.png",
      meta: {
        color: "#f43f5e",
        faction: "crusade",
        trait: "Berserker Rage",
        emoji: "\u{1FA93}",
        description:
          "Untamed fury given form — raw power and relentless aggression.",
        passive: "+3 STR, +2 AGI, +1 VIT, +1 END, +1 TAC",
      },
    },
    {
      id: "elf",
      label: "Elf (ELF)",
      file: "ELF_Characters.glb",
      prefix: "ELF_",
      scale: 1,
      targetHeight: 1.8,
      yOffset: 0.0,
      rigType: "bip001",
      texture: TEXTURE_DIR + "elf/highelves.png",
      meta: {
        color: "#22d3ee",
        faction: "fabled",
        trait: "Arcane Affinity",
        emoji: "\u{1F9DD}",
        description:
          "Ancient and graceful — wielders of arcane arts and deadly precision.",
        passive: "+3 INT, +2 DEX, +2 AGI, +1 WIS",
      },
    },
    {
      id: "dwarf",
      label: "Dwarf (DWF)",
      file: "DWF_Characters.glb",
      prefix: "DWF_",
      scale: 1,
      targetHeight: 1.8,
      yOffset: 0.0,
      rigType: "bip001",
      texture: TEXTURE_DIR + "dwarf/default.png",
      meta: {
        color: "#f59e0b",
        faction: "fabled",
        trait: "Stoneborn",
        emoji: "\u26CF",
        description:
          "Stout mountain folk — unyielding defense and masterful craftsmanship.",
        passive: "+3 END, +2 VIT, +1 STR, +1 DEX, +1 WIS",
      },
    },
    {
      id: "orc",
      label: "Orc (ORC)",
      file: "ORC_Characters.glb",
      prefix: "ORC_",
      scale: 1,
      targetHeight: 1.8,
      yOffset: 0.0,
      rigType: "bip001",
      texture: TEXTURE_DIR + "orc/default.png",
      meta: {
        color: "#65a30d",
        faction: "legion",
        trait: "Bloodrage",
        emoji: "\u{1F479}",
        description:
          "Savage brutes bred for war — crushing power and iron will.",
        passive: "+4 STR, +2 VIT, +2 END",
      },
    },
    {
      id: "undead",
      label: "Undead (UD)",
      file: "UD_Characters.glb",
      prefix: "UD_",
      scale: 1,
      targetHeight: 1.8,
      yOffset: 0.0,
      rigType: "bip001",
      texture: TEXTURE_DIR + "undead/default.png",
      meta: {
        color: "#a78bfa",
        faction: "legion",
        trait: "Undying Will",
        emoji: "\u{1F480}",
        description:
          "Death-touched revenants fueled by dark energy and grudges unresolved.",
        passive: "+3 VIT, +2 END, +2 WIS, +1 STR",
      },
    },
  ].map(function (c) {
    // Local path matches config.ts raceModelUrl() — /character/races/{PREFIX}_Characters.glb.
    return Object.assign({}, c, { url: RACE_DIR + c.file });
  });

  const DEFAULT_CHARACTER_ID = "human";

  // Resolve active character for Player load.
  // Priority (Railway-first when sdk-bootstrap stamped session):
  //   1. URL ?char= (explicit race)
  //   2. window.GrudgeBuild (Railway / boot stamp — preferred over stale session)
  //   3. sessionStorage grudge_active_build
  //   4. default human
  // All races use the unified Bip001 skeleton; no model variants.
  function resolveCharacter() {
    let requested = null;
    let activeBuild = null;

    // Railway / sdk-bootstrap stamps window.GrudgeBuild before script.js.
    var winBuild = null;
    var sessionBuild = null;
    try {
      if (window.GrudgeBuild && window.GrudgeBuild.raceId) {
        winBuild = window.GrudgeBuild;
      }
    } catch (e) {
      /* no-op */
    }
    try {
      const raw = sessionStorage.getItem("grudge_active_build");
      if (raw) sessionBuild = JSON.parse(raw);
    } catch (e) {
      /* no-op */
    }
    // Prefer railway-stamped build over guest session.
    if (winBuild && winBuild.source === "railway") {
      activeBuild = winBuild;
    } else if (sessionBuild && sessionBuild.source === "railway") {
      activeBuild = sessionBuild;
    } else if (winBuild) {
      activeBuild = winBuild;
    } else if (sessionBuild) {
      activeBuild = sessionBuild;
    }
    try {
      const params = new URLSearchParams(window.location.search);
      requested = params.get("char");
    } catch (e) {
      /* no-op */
    }

    // Build race when no URL race (Railway character raceId).
    if (!requested && activeBuild && activeBuild.raceId) {
      requested = activeBuild.raceId;
    }

    if (requested) {
      const found = CHARACTERS.find(function (c) {
        return c.id === requested;
      });
      if (found) {
        // Override skin texture from design-gate / Railway / creator build.
        var texture = found.texture;
        if (activeBuild) {
          if (activeBuild.textureUrl) {
            texture = activeBuild.textureUrl;
          } else if (activeBuild.skinVariant) {
            texture =
              TEXTURE_DIR + found.id + "/" + activeBuild.skinVariant + ".png";
          }
        }
        var merged = Object.assign({}, found, {
          texture: texture,
          build: activeBuild,
        });
        if (activeBuild && typeof activeBuild.worldScale === "number") {
          merged.scale = activeBuild.worldScale;
        }
        if (activeBuild && typeof activeBuild.targetHeight === "number") {
          merged.targetHeight = activeBuild.targetHeight;
        }
        return merged;
      }
    }
    const fallback =
      CHARACTERS.find(function (c) {
        return c.id === DEFAULT_CHARACTER_ID;
      }) || CHARACTERS[0];
    return fallback;
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

  // ── ANIMATION SOURCES (unified Mixamo -> Bip001) ────────────────────────
  // All 6 races share ONE animation pack: Mixamo FBX files from the
  // Character-Animator-Mapper extracted folders, retargeted to Bip001 at
  // runtime via SkeletonUtils.retargetClip + MIXAMO_TO_BIP001_BONE_MAP.
  // Drop custom race-specific FBXs into ../character/races/anims/ to override
  // per state, e.g.
  //   ../character/races/anims/human.idle.fbx        (race-specific override)
  //   ../character/races/anims/idle.fbx              (shared fallback)
  // The Player class probes local overrides first, then falls back to
  // the unified Mixamo sources. Each entry is { url, rig: "mixamo" }
  // to enable retargeting.
  const ANIM_DIR = "/character/races/anims/";
  const MOBILE_ANIMS = {
    idle: bip001(ANIM_DIR + "idle.glb"),
    walk: bip001(ANIM_DIR + "walk.glb"),
    run: bip001(ANIM_DIR + "run.glb"),
    attack: bip001(ANIM_DIR + "attack.glb"),
    attackSpear: bip001(ANIM_DIR + "attack-spear.glb"),
    cast: bip001(ANIM_DIR + "cast.glb"),
    death: bip001(ANIM_DIR + "death.glb"),
  };
  const WEAPON_SKILL_OVERRIDES = {
    unarmed: {
      Attack: [MOBILE_ANIMS.attack],
      Skill1: [MOBILE_ANIMS.attack],
      Skill2: [MOBILE_ANIMS.attack],
    },
    sword_shield: {
      Idle: [MOBILE_ANIMS.idle],
      Walk: [MOBILE_ANIMS.walk],
      Run: [MOBILE_ANIMS.run],
      Attack: [MOBILE_ANIMS.attack],
      Skill1: [MOBILE_ANIMS.attack],
      Skill2: [MOBILE_ANIMS.attack],
      Death: [MOBILE_ANIMS.death],
    },
    spear_melee: {
      Idle: [MOBILE_ANIMS.idle],
      Walk: [MOBILE_ANIMS.walk],
      Run: [MOBILE_ANIMS.run],
      Attack: [MOBILE_ANIMS.attackSpear],
      Skill1: [MOBILE_ANIMS.attackSpear],
      Skill2: [MOBILE_ANIMS.attackSpear],
      Death: [MOBILE_ANIMS.death],
    },
    magic: {
      Idle: [MOBILE_ANIMS.idle],
      Cast: [MOBILE_ANIMS.cast],
      Skill3: [MOBILE_ANIMS.cast],
      Skill4: [MOBILE_ANIMS.cast],
      Skill9: [MOBILE_ANIMS.cast],
      Death: [MOBILE_ANIMS.death],
    },
    longbow: {
      Idle: [MOBILE_ANIMS.idle],
      Walk: [MOBILE_ANIMS.walk],
      Run: [MOBILE_ANIMS.run],
      Attack: [MOBILE_ANIMS.attack],
      Skill7: [MOBILE_ANIMS.attack],
      Death: [MOBILE_ANIMS.death],
    },
    rifle: {
      Attack: [MOBILE_ANIMS.attack],
      Skill8: [MOBILE_ANIMS.attack],
    },
    pistol: {
      Attack: [MOBILE_ANIMS.attack],
      Skill8: [MOBILE_ANIMS.attack],
    },
  };
  const SHARED_ANIMS = {
    // ── Locomotion ────────────────────────────────────────────────────
    Idle: [mixamo(UNITY.locomotion + "idle.fbx")],
    Walk: [mixamo(UNITY.locomotion + "walking.fbx")],
    Run: [mixamo(UNITY.locomotion + "running.fbx")],
    Jump: [mixamo(UNITY.locomotion + "jump.fbx")],
    Fall: [mixamo(UNITY.action + "falling idle.fbx")],
    StrafeL: [mixamo(UNITY.locomotion + "left strafe walking.fbx")],
    StrafeR: [mixamo(UNITY.locomotion + "right strafe walking.fbx")],
    TurnL: [mixamo(UNITY.locomotion + "left turn 90.fbx")],
    TurnR: [mixamo(UNITY.locomotion + "right turn 90.fbx")],
    // ── Sword & Shield combat ─────────────────────────────────────────
    Attack: [mixamo(UNITY.sword + "sword and shield attack.fbx")],
    Attack2: [mixamo(UNITY.sword + "sword and shield attack (2).fbx")],
    Attack3: [mixamo(UNITY.sword + "sword and shield attack (3).fbx")],
    Attack4: [mixamo(UNITY.sword + "sword and shield attack (4).fbx")],
    Block: [mixamo(UNITY.sword + "sword and shield block.fbx")],
    DrawSword: [mixamo(UNITY.sword + "draw sword 1.fbx")],
    SheathSword: [mixamo(UNITY.sword + "sheath sword 1.fbx")],
    // ── Roll / Dodge / Dash ───────────────────────────────────────────
    Roll: [mixamo(UNITY.action + "falling to roll.fbx")],
    RollLeft: [mixamo(UNITY.locomotion + "left strafe.fbx")],
    RollRight: [mixamo(UNITY.locomotion + "right strafe.fbx")],
    Dodge: [mixamo(UNITY.action + "falling to roll.fbx")],
    Dash: [mixamo(UNITY.locomotion + "running.fbx")],
    // ── Climbing / Sneaking ───────────────────────────────────────────
    Climb: [mixamo(UNITY.action + "stand to cover.fbx")],
    Sneak: [mixamo(UNITY.action + "crouched sneaking left.fbx")],
    SneakL: [mixamo(UNITY.action + "left cover sneak.fbx")],
    SneakR: [mixamo(UNITY.action + "right cover sneak.fbx")],
    // ── Swim ───────────────────────────────────────────────────────────
    Swim: [mixamo(UNITY.locomotion + "walking.fbx")],
    // ── Unarmed strikes ────────────────────────────────────────────────
    Kick: [mixamo(UNITY.unarmed + "lead_jab.fbx")],
    Punch: [mixamo(UNITY.unarmed + "lead_jab.fbx")],
    // ── Magic / Cast / Teleport / Spell VFX triggers ──────────────────
    Cast: [mixamo(UNITY.magic + "Standing 1H Magic Attack 01.fbx")],
    Cast2H: [mixamo(UNITY.magic + "Standing 2H Magic Area Attack 02.fbx")],
    Teleport: [mixamo(UNITY.magic + "Standing 2H Magic Area Attack 02.fbx")],
    Channel: [mixamo(UNITY.magic + "standing idle.fbx")],
    // ── Death / hit reacts ────────────────────────────────────────────
    Death: [mixamo(UNITY.magic + "Standing React Death Backward.fbx")],
    HitLarge: [mixamo(UNITY.magic + "Standing React Large From Front.fbx")],
    HitSmall: [mixamo(UNITY.magic + "Standing React Small From Front.fbx")],
    // ── Bow / Longbow ─────────────────────────────────────────────────
    BowIdle: [mixamo(UNITY.longbow + "standing idle 01.fbx")],
    BowRunF: [mixamo(UNITY.longbow + "standing run forward.fbx")],
    BowRunB: [mixamo(UNITY.longbow + "standing run back.fbx")],
    BowRunL: [mixamo(UNITY.longbow + "standing run left.fbx")],
    BowRunR: [mixamo(UNITY.longbow + "standing run right.fbx")],
    // ── Pistol / Rifle (gun skill animations) ─────────────────────────
    PistolIdle: [mixamo(UNITY.pistol + "pistol idle.fbx")],
    PistolRun: [mixamo(UNITY.pistol + "pistol run.fbx")],
    PistolJump: [mixamo(UNITY.pistol + "pistol jump.fbx")],
    RifleIdle: [mixamo(UNITY.rifle + "idle aiming.fbx")],
    RifleRun: [mixamo(UNITY.rifle + "run forward.fbx")],
    // ── Hotbar skills 1-9 ─────────────────────────────────────────────
    // Map each numeric slot to a thematic combat / utility move so a fresh
    // character has every hotkey doing something different.
    Skill1: [mixamo(UNITY.sword + "sword and shield attack.fbx")],
    Skill2: [mixamo(UNITY.sword + "sword and shield attack (2).fbx")],
    Skill3: [mixamo(UNITY.magic + "Standing 1H Magic Attack 01.fbx")],
    Skill4: [mixamo(UNITY.magic + "Standing 2H Magic Area Attack 02.fbx")], // teleport / aoe
    Skill5: [mixamo(UNITY.action + "falling to roll.fbx")], // roll
    Skill6: [mixamo(UNITY.unarmed + "lead_jab.fbx")], // kick / punch
    Skill7: [mixamo(UNITY.longbow + "standing run forward.fbx")], // bow shot stand-in
    Skill8: [mixamo(UNITY.rifle + "idle aiming.fbx")], // ranged aim
    Skill9: [mixamo(UNITY.magic + "Standing 2H Magic Area Attack 02.fbx")], // ult / spell vfx trigger
  };

  function normalizeAnimationPack(packId) {
    const p = (packId || "").toLowerCase();
    if (!p) return "";
    if (p === "sword_shield" || p === "1h-shield") return "sword_shield";
    if (p === "2h-melee") return "spear_melee";
    if (p === "longbow") return "longbow";
    if (p === "magic") return "magic";
    if (p === "rifle") return "rifle";
    if (p === "pistol") return "pistol";
    if (p === "unarmed") return "unarmed";
    return "";
  }

  function activeWeaponFromBuild(build) {
    const eq = build && build.equipped ? build.equipped : null;
    if (!eq) return "";
    const weaponSlots = [
      "staff",
      "bow",
      "spear",
      "sword",
      "axe",
      "hammer",
      "pick",
    ];
    for (let i = 0; i < weaponSlots.length; i++) {
      const slot = weaponSlots[i];
      if (eq[slot]) return slot;
    }
    return "";
  }

  function resolveWeaponSkillProfile(character) {
    const build = character && character.build ? character.build : null;
    const byPack = normalizeAnimationPack(build && build.animationPack);
    if (byPack) return byPack;
    const slot = activeWeaponFromBuild(build);
    if (slot === "staff") return "magic";
    if (slot === "bow") return "longbow";
    if (slot === "spear") return "spear_melee";
    if (slot) return "sword_shield";
    return "unarmed";
  }

  // ── ANIMATION → SPELL VFX MAP ─────────────────────────────────────────
  // The Player class fires `grudge:vfx` CustomEvents alongside one-shot
  // animations so the world layer can spawn projectiles, ground rings,
  // teleport flashes, etc. The HUD listens for these to update cooldown
  // overlays. Set `vfx: null` to keep an animation silent.
  const SPELL_VFX = {
    Cast: {
      kind: "spell-bolt",
      color: "#9ab8ff",
      duration: 0.6,
      sound: "cast",
    },
    Cast2H: {
      kind: "spell-aoe",
      color: "#a78bfa",
      duration: 1.2,
      sound: "cast-aoe",
    },
    Teleport: {
      kind: "teleport",
      color: "#22d3ee",
      duration: 0.45,
      sound: "teleport",
    },
    Channel: {
      kind: "channel-aura",
      color: "#7dd3fc",
      duration: 1.5,
      sound: "channel",
    },
    Roll: {
      kind: "dust-puff",
      color: "#d4a373",
      duration: 0.35,
      sound: "roll",
    },
    Dash: {
      kind: "dash-trail",
      color: "#f5e2c1",
      duration: 0.3,
      sound: "dash",
    },
    Skill3: {
      kind: "spell-bolt",
      color: "#9ab8ff",
      duration: 0.6,
      sound: "cast",
    },
    Skill4: {
      kind: "spell-aoe",
      color: "#a78bfa",
      duration: 1.2,
      sound: "cast-aoe",
    },
    Skill9: {
      kind: "spell-aoe",
      color: "#f43f5e",
      duration: 1.5,
      sound: "ult",
    },
  };

  // Build animation source map for a character. Supports per-race overrides
  // that exist at ANIM_DIR (e.g. character.id.idle.fbx) as well as state-
  // specific overrides (e.g. idle.fbx). All sources are Mixamo-rigged and
  // will be retargeted to Bip001 at runtime.
  function animationSourcesFor(character) {
    const weaponProfile = resolveWeaponSkillProfile(character);
    const profileOverrides = WEAPON_SKILL_OVERRIDES[weaponProfile] || {};
    const sources = {};
    const allStates = ANIMATION_STATES.concat(
      ANIMATION_STATES_BIP001.filter(function (s) {
        return ANIMATION_STATES.indexOf(s) === -1;
      }),
    );
    allStates.forEach(function (state) {
      const lower = state
        .toLowerCase()
        .replace("rollleft", "roll-left")
        .replace("rollright", "roll-right");
      const shared = SHARED_ANIMS[state] || [];
      // Per-race overrides first, then shared Mixamo sources
      const racePrefixed = {
        url: ANIM_DIR + character.id + "." + lower + ".fbx",
        rig: "bip001",
      };
      const raceGeneric = {
        url: ANIM_DIR + lower + ".fbx",
        rig: "bip001",
      };
      const weaponMapped = profileOverrides[state] || [];
      sources[state] = [racePrefixed, raceGeneric].concat(weaponMapped, shared);
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
