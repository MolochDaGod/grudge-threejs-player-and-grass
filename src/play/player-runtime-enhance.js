/**
 * Runtime enhance for /play Player:
 *  - Strip hip/root .position tracks (kills pelvis float after Mixamo retarget)
 *  - Expand clip classification for attacks / skills
 *  - Feet plant + dual-foot IK on terrain height SSOT
 *  - Attack combo cycle + ensure anim slots fill from bip001 GLBs
 *
 * Loaded after script.js; listens for grudge:player-ready.
 */
(function (global) {
  "use strict";

  function stripPositionTracks(clip) {
    if (!clip || !clip.tracks || !clip.tracks.length) return clip;
    var kept = [];
    for (var i = 0; i < clip.tracks.length; i++) {
      var t = clip.tracks[i];
      var n = t.name || "";
      // Drop root/hips/pelvis/any bone .position — kit is already grounded.
      if (/\.position$/.test(n) || n.indexOf(".position") !== -1) continue;
      kept.push(t);
    }
    if (kept.length === clip.tracks.length) return clip;
    clip.tracks = kept;
    if (typeof clip.resetDuration === "function") {
      try {
        clip.resetDuration();
      } catch (e) {
        /* ignore */
      }
    }
    return clip;
  }

  function classifyClip(rawName) {
    var name = (rawName || "").toLowerCase();
    if (name.indexOf("idle") !== -1) return "Idle";
    if (name.indexOf("walk") !== -1) return "Walk";
    if (name.indexOf("run") !== -1) return "Run";
    if (name.indexOf("jump") !== -1) return "Jump";
    if (name.indexOf("fall") !== -1) return "Fall";
    if (name.indexOf("block") !== -1 || name.indexOf("shield") !== -1) return "Block";
    if (name.indexOf("roll") !== -1 || name.indexOf("dodge") !== -1) return "Roll";
    if (name.indexOf("cast") !== -1 || name.indexOf("magic") !== -1) return "Cast";
    if (name.indexOf("death") !== -1) return "Death";
    if (
      name.indexOf("attack") !== -1 ||
      name.indexOf("slash") !== -1 ||
      name.indexOf("strike") !== -1 ||
      name.indexOf("jab") !== -1 ||
      name.indexOf("punch") !== -1
    ) {
      return "Attack";
    }
    return null;
  }

  function reGroundModel(player) {
    if (!player || !player.model || typeof player._groundAndCenterXZ !== "function") return;
    var yOff = (player.character && player.character.yOffset) || 0;
    player._groundAndCenterXZ(player.model, yOff);
  }

  /**
   * Plant group.y so skinned feet sit on terrainY, then optional dual-foot IK
   * by nudging L/R Foot bones toward terrain (simple single-bone plant).
   */
  function plantFeetOnTerrain(player, terrainY, THREE) {
    if (!player || !player.model || !player.group || !THREE) return;
    var model = player.model;
    model.updateMatrixWorld(true);

    // Skinned body box in world space
    var box = new THREE.Box3();
    var any = false;
    model.traverse(function (o) {
      if (!o.isSkinnedMesh || !o.visible) return;
      if (!any) {
        box.setFromObject(o, true);
        any = true;
      } else {
        box.expandByObject(o);
      }
    });
    if (!any) box.setFromObject(model, true);

    // Group Y so feet (box.min.y) land on terrain
    var dy = terrainY - box.min.y;
    if (Math.abs(dy) > 1e-4 && Math.abs(dy) < 2.5) {
      player.group.position.y += dy;
    }

    // Dual-foot IK: soft plant ankles to terrain (visual polish)
    if (player._feetIkEnabled === false) return;
    var footNames = [
      ["Bip001 L Foot", "Bip001 R Foot"],
      ["Bip001_L_Foot", "Bip001_R_Foot"],
      ["mixamorig:LeftFoot", "mixamorig:RightFoot"],
      ["LeftFoot", "RightFoot"],
    ];
    var L = null;
    var R = null;
    for (var i = 0; i < footNames.length; i++) {
      L = model.getObjectByName(footNames[i][0]);
      R = model.getObjectByName(footNames[i][1]);
      if (L && R) break;
    }
    if (!L || !R) return;

    var wp = new THREE.Vector3();
    var maxLift = 0.12; // metres — don't over-bend
    [L, R].forEach(function (foot) {
      foot.getWorldPosition(wp);
      var err = terrainY - wp.y;
      // Only plant if foot is below or barely above ground (anim sink)
      if (err > 0 && err < 0.35) {
        var local = foot.parent
          ? foot.parent.worldToLocal(wp.clone().setY(wp.y + Math.min(err, maxLift)))
          : null;
        if (local) {
          // Blend plant — keep IK soft so knees don't explode without full solver
          foot.position.lerp(local, 0.45);
        }
      }
    });
  }

  function enhancePlayer(player) {
    if (!player || player._runtimeEnhanced) return;
    player._runtimeEnhanced = true;
    player._feetIkEnabled = true;
    player._attackCombo = 0;
    player._attackComboT = 0;

    // Patch register to always strip root motion on grounded kits
    if (typeof player._registerClip === "function") {
      var origReg = player._registerClip.bind(player);
      player._registerClip = function (slot, clip, sourceRig) {
        if (clip) stripPositionTracks(clip);
        return origReg(slot, clip, sourceRig);
      };
    }

    // Patch classify for combat verbs
    if (typeof player._classifyClip === "function") {
      player._classifyClip = classifyClip;
    }

    // Strip position tracks on already-bound actions
    if (player.actions) {
      Object.keys(player.actions).forEach(function (slot) {
        var action = player.actions[slot];
        if (!action || typeof action.getClip !== "function") return;
        var clip = action.getClip();
        if (clip) stripPositionTracks(clip);
      });
    }

    reGroundModel(player);

    // Combo attack helper
    player.playAttackCombo = function (opts) {
      var order = ["Attack", "Attack2", "Attack3", "Attack4"];
      var now = performance.now();
      if (now - (this._attackComboT || 0) > 900) this._attackCombo = 0;
      var slot = order[this._attackCombo % order.length];
      // Skip empty slots
      var tries = 0;
      while (!this.actions[slot] && tries < order.length) {
        this._attackCombo++;
        slot = order[this._attackCombo % order.length];
        tries++;
      }
      this._attackCombo++;
      this._attackComboT = now;
      return this.playOneShot(slot, opts || { speed: 1.15 });
    };

    // After one-shot ends, re-ground (position tracks may have drifted)
    var origOneShot = player.playOneShot && player.playOneShot.bind(player);
    if (origOneShot) {
      player.playOneShot = function (name, opts) {
        var ok = origOneShot(name, opts);
        if (ok) {
          var self = this;
          var action = this.actions[name];
          var dur = (action && action.getClip && action.getClip().duration) || 0.6;
          var speed = (opts && opts.speed) || 1;
          setTimeout(function () {
            reGroundModel(self);
          }, Math.max(80, (dur / Math.max(0.01, speed)) * 1000));
        }
        return ok;
      };
    }

    // Log mixer inventory for debug
    var slots = player.actions ? Object.keys(player.actions) : [];
    console.info(
      "[play-enhance] mixer slots:",
      slots.length ? slots.join(", ") : "(none)",
      "feetIk=on stripPosition=on",
    );
  }

  function bindWorldLoop() {
    var world = global.world || global.GrudgeWorld;
    if (!world || world._playEnhanceBound) return;
    world._playEnhanceBound = true;

    var THREE = global.THREE;
    if (!THREE) {
      console.warn("[play-enhance] THREE not on window");
      return;
    }

    // Patch World.update end — after player.mixer update
    var origUpdate = world.update && world.update.bind(world);
    if (!origUpdate) return;

    // Combat: LMB combo uses playAttackCombo when available
    if (typeof world._setupCombatInput === "function" && !world._comboPatched) {
      world._comboPatched = true;
      var canvas = world.renderer && world.renderer.domElement;
      if (canvas) {
        window.addEventListener(
          "mousedown",
          function (e) {
            if (!world.isPointerLocked || e.button !== 0) return;
            if (world.player && typeof world.player.playAttackCombo === "function") {
              e.stopImmediatePropagation();
              world.player.playAttackCombo({ speed: 1.15 });
            }
          },
          true,
        );
      }
    }

    world.update = function (dt) {
      origUpdate(dt);
      var player = world.player;
      if (!player || !player.group) return;
      enhancePlayer(player);

      // Decay attack combo window
      if (player._attackComboT && performance.now() - player._attackComboT > 1200) {
        player._attackCombo = 0;
      }

      var terrainY =
        typeof world._getTerrainHeightAtWorld === "function"
          ? world._getTerrainHeightAtWorld(player.group.position.x, player.group.position.z)
          : 0;

      // When grounded, snap group Y + feet IK after mixer has posed bones
      if (world.isGrounded !== false) {
        plantFeetOnTerrain(player, terrainY, THREE);
      }
    };

    console.info("[play-enhance] World.update hooked (feet plant + IK + strip root motion)");
  }

  function onReady(ev) {
    var player = ev && ev.detail && ev.detail.player;
    if (player) enhancePlayer(player);
    bindWorldLoop();
  }

  if (typeof window !== "undefined") {
    window.addEventListener("grudge:player-ready", onReady);
    // Late bind if player already exists
    if (window.GrudgePlayer) {
      enhancePlayer(window.GrudgePlayer);
      bindWorldLoop();
    } else {
      // Retry briefly — script.js World boots async
      var n = 0;
      var t = setInterval(function () {
        n++;
        if (window.GrudgePlayer || window.world) {
          if (window.GrudgePlayer) enhancePlayer(window.GrudgePlayer);
          bindWorldLoop();
          clearInterval(t);
        }
        if (n > 80) clearInterval(t);
      }, 100);
    }
    window.GrudgePlayEnhance = {
      stripPositionTracks: stripPositionTracks,
      plantFeetOnTerrain: plantFeetOnTerrain,
      reGroundModel: reGroundModel,
      enhancePlayer: enhancePlayer,
    };
  }
})(typeof window !== "undefined" ? window : globalThis);
