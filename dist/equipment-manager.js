// src/equipment-manager.js
// Classic-script port of the playground EquipmentManager
// (D:\Games\Models\grudgeracecharacters\playground\src\modules\EquipmentManager.js).
// Loaded before script.js so the bundled Player class can pick it up at
// window.GrudgeEquipmentManager.
(function (global) {
  // Slot categories and the regex to match mesh names (after prefix strip).
  const SLOT_DEFS = [
    // Armor slots — skinned meshes at root
    { slot: "body",      re: /^Units_Body_([A-Z])$/i,         group: "armor" },
    { slot: "arms",      re: /^Units_Arms_([A-Z])$/i,         group: "armor" },
    { slot: "legs",      re: /^Units_Legs_([A-Z])$/i,         group: "armor" },
    { slot: "head",      re: /^Units_head_([A-Z])$/i,         group: "armor" },
    { slot: "shoulders", re: /^Units_shoulderpads_([A-Z])$/i, group: "armor" },

    // Right-hand weapons
    { slot: "axe",    re: /(?:Units_|weapon_)axe_([A-Z])$/i,      group: "weapon_r" },
    { slot: "hammer", re: /(?:Units_|weapon_)hammer_([A-Z])$/i,   group: "weapon_r" },
    { slot: "sword",  re: /(?:Units_|weapon_)[Ss]word_([A-Z])$/i, group: "weapon_r" },
    { slot: "pick",   re: /(?:Units_|weapon_)pick$/i,             group: "weapon_r", noVariant: true },
    { slot: "spear",  re: /(?:Units_|weapon_)[Ss]pear$/i,         group: "weapon_r", noVariant: true },

    // Left-hand items
    { slot: "bow",   re: /(?:Units_|weapon_)[Bb]ow$/i,         group: "weapon_l", noVariant: true },
    { slot: "staff", re: /(?:Units_|weapon_)staff_([A-Z])$/i,  group: "weapon_l" },

    // Shields (left-shield container)
    { slot: "shield", re: /(?:Units_|)[Ss]hield_([A-Z])$/i, group: "shield" },

    // Utility
    { slot: "bag",    re: /(?:Xtra_|Units_)bag$/i,    group: "utility", noVariant: true },
    { slot: "wood",   re: /(?:Xtra_|Units_)wood$/i,   group: "utility", noVariant: true },
    { slot: "quiver", re: /(?:Xtra_|Units_)quiver$/i, group: "utility", noVariant: true },
  ];

  function GrudgeEquipmentManager(prefix) {
    this.prefix = prefix || "";
    this.slots = {};
    this.equipped = {};
    this._allMeshes = [];
    this.bones = {};
  }

  GrudgeEquipmentManager.prototype.catalog = function (root) {
    this.root = root;
    this.slots = {};
    this._allMeshes = [];

    this.bones.rightHand  = root.getObjectByName("R_hand_container")  || null;
    this.bones.leftHand   = root.getObjectByName("L_hand_container")  || null;
    this.bones.leftShield = root.getObjectByName("L_shield_container") || null;
    this.bones.bag        = root.getObjectByName("Bone_bag")          || null;
    this.bones.wood       = root.getObjectByName("Bone_wood")         || null;
    this.bones.quiver     = root.getObjectByName("Quiver_container")  || null;

    const self = this;
    root.traverse(function (child) {
      if (!child.isMesh && !child.isSkinnedMesh) return;
      const name = child.name || "";
      const stripped = name.indexOf(self.prefix) === 0
        ? name.slice(self.prefix.length)
        : name;
      for (let i = 0; i < SLOT_DEFS.length; i++) {
        const def = SLOT_DEFS[i];
        const match = stripped.match(def.re);
        if (!match) continue;
        const variant = def.noVariant
          ? "_default"
          : (match[1] || match[2] || "_default").toUpperCase();
        if (!self.slots[def.slot]) self.slots[def.slot] = {};
        self.slots[def.slot][variant] = child;
        child.userData.equipSlot = def.slot;
        child.userData.equipVariant = variant;
        child.userData.equipGroup = def.group;
        self._allMeshes.push(child);
        child.visible = false;
        break;
      }
    });

    this._autoEquipDefaults();
    return this.getSlotSummary();
  };

  GrudgeEquipmentManager.prototype._autoEquipDefaults = function () {
    const slots = ["body", "arms", "legs", "head"];
    for (let i = 0; i < slots.length; i++) {
      const variants = this.slots[slots[i]];
      if (!variants) continue;
      const keys = Object.keys(variants).sort();
      if (keys[0]) this.equip(slots[i], keys[0]);
    }
  };

  GrudgeEquipmentManager.prototype.equip = function (slot, variant) {
    const variants = this.slots[slot];
    if (!variants) return false;
    const entries = Object.entries(variants);
    for (let i = 0; i < entries.length; i++) {
      const v = entries[i][0];
      const mesh = entries[i][1];
      mesh.visible = (v === variant);
    }
    this.equipped[slot] = variant;
    return true;
  };

  GrudgeEquipmentManager.prototype.unequip = function (slot) {
    const variants = this.slots[slot];
    if (!variants) return;
    const meshes = Object.values(variants);
    for (let i = 0; i < meshes.length; i++) meshes[i].visible = false;
    delete this.equipped[slot];
  };

  GrudgeEquipmentManager.prototype.toggle = function (slot, variant) {
    if (this.equipped[slot] === variant) this.unequip(slot);
    else this.equip(slot, variant);
  };

  GrudgeEquipmentManager.prototype.unequipAllWeapons = function () {
    for (let i = 0; i < this._allMeshes.length; i++) {
      const m = this._allMeshes[i];
      const g = m.userData.equipGroup;
      if (g === "weapon_r" || g === "weapon_l" || g === "shield") {
        m.visible = false;
      }
    }
    const wslots = ["axe", "hammer", "sword", "pick", "spear", "bow", "staff", "shield"];
    for (let i = 0; i < wslots.length; i++) delete this.equipped[wslots[i]];
  };

  GrudgeEquipmentManager.prototype.equipWeapon = function (slot, variant) {
    if (typeof variant === "undefined") variant = "_default";
    let def = null;
    for (let i = 0; i < SLOT_DEFS.length; i++) {
      if (SLOT_DEFS[i].slot === slot) { def = SLOT_DEFS[i]; break; }
    }
    if (!def) return false;
    for (let i = 0; i < this._allMeshes.length; i++) {
      const m = this._allMeshes[i];
      if (m.userData.equipGroup === def.group) {
        m.visible = false;
        delete this.equipped[m.userData.equipSlot];
      }
    }
    return this.equip(slot, variant);
  };

  GrudgeEquipmentManager.prototype.getSlotSummary = function () {
    const summary = {};
    const entries = Object.entries(this.slots);
    for (let i = 0; i < entries.length; i++) {
      summary[entries[i][0]] = Object.keys(entries[i][1]).sort();
    }
    return summary;
  };

  GrudgeEquipmentManager.prototype.getGroupedSlots = function () {
    const groups = { armor: {}, weapons: {}, shields: {}, utility: {} };
    const entries = Object.entries(this.slots);
    for (let i = 0; i < entries.length; i++) {
      const slot = entries[i][0];
      const variants = entries[i][1];
      let def = null;
      for (let j = 0; j < SLOT_DEFS.length; j++) {
        if (SLOT_DEFS[j].slot === slot) { def = SLOT_DEFS[j]; break; }
      }
      if (!def) continue;
      const groupKey =
        def.group === "weapon_r" || def.group === "weapon_l"
          ? "weapons"
          : def.group === "shield"
          ? "shields"
          : def.group;
      groups[groupKey][slot] = {
        variants: Object.keys(variants).sort(),
        equipped: this.equipped[slot] || null,
      };
    }
    return groups;
  };

  GrudgeEquipmentManager.prototype.showAll = function () {
    for (let i = 0; i < this._allMeshes.length; i++) this._allMeshes[i].visible = true;
  };

  GrudgeEquipmentManager.prototype.hideAll = function () {
    for (let i = 0; i < this._allMeshes.length; i++) this._allMeshes[i].visible = false;
  };

  Object.defineProperty(GrudgeEquipmentManager.prototype, "meshCount", {
    get: function () { return this._allMeshes.length; },
  });

  global.GrudgeEquipmentManager = GrudgeEquipmentManager;
})(typeof window !== "undefined" ? window : globalThis);
