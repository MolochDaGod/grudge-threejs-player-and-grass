// src/shared/catalog.ts
//
// Single source of truth for the canonical static data shared across all
// three pages (landing creator, /play grass scene, /mainpanel equipment).
// Keep this file dependency-free (no runtime imports beyond `./grudge-
// account-sdk` types) so Vite can tree-shake aggressively.
//
// When the Phase 5 Unity port lands, the heavy data tables (skill defs,
// item DB, balance constants) move into `src/grudge/data/*.json` generated
// by `scripts/import-grudge-data.mjs`. THIS file stays as the small,
// hand-curated meta layer the UI needs at build time.
import type { EquipSlot } from "./grudge-account-sdk";

// ── Races ───────────────────────────────────────────────────────────────────

export interface RaceDef {
  id: string;             // "human" | "barbarian" | ...
  label: string;          // human-readable
  prefix: string;         // EquipmentManager mesh-prefix ("WK_", "BRB_", ...)
  color: string;          // accent for race tile + faction badge
  emoji: string;          // single-glyph thumbnail
  faction: string;        // "crusade" | "fabled" | "legion"
  trait: string;          // short flavor word
  description: string;
  passive: string;        // "+3 STR, +2 AGI, +1 VIT, ..."
  /** Render scale (the FBX→GLB sources are at very different unit scales). */
  scale: number;
}

export const RACES: RaceDef[] = [
  {
    id: "human", label: "Human", prefix: "WK_", color: "#94a3b8", emoji: "🧑",
    faction: "crusade", trait: "Adaptable",
    description: "Versatile and adaptable — masters of none, capable of all.",
    passive: "+1 to all attributes", scale: 0.04,
  },
  {
    id: "barbarian", label: "Barbarian", prefix: "BRB_", color: "#f43f5e", emoji: "🪓",
    faction: "crusade", trait: "Berserker Rage",
    description: "Untamed fury given form — raw power and relentless aggression.",
    passive: "+3 STR, +2 AGI, +1 VIT, +1 END, +1 TAC", scale: 0.04,
  },
  {
    id: "elf", label: "Elf", prefix: "ELF_", color: "#22d3ee", emoji: "🧝",
    faction: "fabled", trait: "Arcane Affinity",
    description: "Ancient and graceful — wielders of arcane arts and deadly precision.",
    passive: "+3 INT, +2 DEX, +2 AGI, +1 WIS", scale: 0.04,
  },
  {
    id: "dwarf", label: "Dwarf", prefix: "DWF_", color: "#f59e0b", emoji: "⛏",
    faction: "fabled", trait: "Stoneborn",
    description: "Stout mountain folk — unyielding defense and masterful craftsmanship.",
    passive: "+3 END, +2 VIT, +1 STR, +1 DEX, +1 WIS", scale: 0.035,
  },
  {
    id: "orc", label: "Orc", prefix: "ORC_", color: "#65a30d", emoji: "👹",
    faction: "legion", trait: "Bloodrage",
    description: "Savage brutes bred for war — crushing power and iron will.",
    passive: "+4 STR, +2 VIT, +2 END", scale: 0.045,
  },
  {
    id: "undead", label: "Undead", prefix: "UD_", color: "#a78bfa", emoji: "💀",
    faction: "legion", trait: "Undying Will",
    description: "Death-touched revenants fueled by dark energy and grudges unresolved.",
    passive: "+3 VIT, +2 END, +2 WIS, +1 STR", scale: 0.04,
  },
];

export const RACE_BY_ID: Record<string, RaceDef> = Object.fromEntries(
  RACES.map((r) => [r.id, r]),
);

// ── Classes ─────────────────────────────────────────────────────────────────

export interface ClassDef {
  id: string;
  label: string;
  /** Allowed weapon slots per game-design rule
   *  (warriors: shield/sword/2h, mages: staff/tome/mace/relic/wand,
   *   rangers: bow/crossbow/gun/dagger/2h-sword/spear,
   *   worge: staff/spear/dagger/bow/hammer/mace/relic). */
  weapons: EquipSlot[];
  /** Default animation pack to fall back on when no weapon is equipped. */
  defaultAnim: string;
}

export const CLASSES: ClassDef[] = [
  { id: "warrior", label: "Warrior", weapons: ["sword", "hammer", "axe", "shield"], defaultAnim: "1h-shield" },
  { id: "mage",    label: "Mage",    weapons: ["staff"],                              defaultAnim: "magic" },
  { id: "ranger",  label: "Ranger",  weapons: ["bow", "spear"],                       defaultAnim: "longbow" },
  { id: "worge",   label: "Worge",   weapons: ["staff", "spear", "bow", "hammer"],    defaultAnim: "2h-melee" },
];

export const CLASS_BY_ID: Record<string, ClassDef> = Object.fromEntries(
  CLASSES.map((c) => [c.id, c]),
);

// ── Animation packs ─────────────────────────────────────────────────────────

export interface AnimPackDef {
  id: string;
  label: string;
  /** Filename under `https://assets.grudge-studio.com/characters/races/anims/<file>` */
  file: string;
}

export const ANIM_PACKS: AnimPackDef[] = [
  { id: "1h-shield", label: "1H + Shield", file: "attack.glb" },
  { id: "2h-melee",  label: "2H Melee",    file: "attack.glb" },
  { id: "longbow",   label: "Longbow",     file: "attack.glb" },
  { id: "magic",     label: "Magic Staff", file: "cast.glb" },
  { id: "rifle",     label: "Rifle",       file: "attack.glb" },
];

export const ANIM_PACK_BY_ID: Record<string, AnimPackDef> = Object.fromEntries(
  ANIM_PACKS.map((p) => [p.id, p]),
);

/** Map weapon slot → animation pack id. Used by `/play` to swap the
 *  AnimationMixer when the user equips a different weapon. */
export const WEAPON_TO_ANIM_PACK: Record<string, string> = {
  sword: "1h-shield",
  axe: "1h-shield",
  hammer: "1h-shield",
  pick: "1h-shield",
  spear: "2h-melee",
  bow: "longbow",
  staff: "magic",
};

export function animPackForWeapon(slot: EquipSlot | null | undefined, classId: string): string {
  if (slot && WEAPON_TO_ANIM_PACK[slot]) return WEAPON_TO_ANIM_PACK[slot];
  const cls = CLASS_BY_ID[classId];
  return cls?.defaultAnim ?? "1h-shield";
}

// ── Skin variants per race ──────────────────────────────────────────────────

export interface SkinVariantDef {
  id: string;
  label: string;
}

export const SKIN_VARIANTS: Record<string, SkinVariantDef[]> = {
  human:     [
    { id: "default", label: "Default" }, { id: "black", label: "Black" }, { id: "blue", label: "Blue" },
    { id: "brown", label: "Brown" }, { id: "green", label: "Green" }, { id: "red", label: "Red" },
    { id: "white", label: "White" },
  ],
  barbarian: [{ id: "default", label: "Default" }, { id: "brown", label: "Brown" }],
  elf: [
    { id: "darkelves", label: "Dark Elves" }, { id: "highelves", label: "High Elves" },
    { id: "woodelves", label: "Wood Elves" },
    { id: "darkelves-blue", label: "Dark · Blue" }, { id: "darkelves-green", label: "Dark · Green" },
    { id: "darkelves-red", label: "Dark · Red" }, { id: "woodelves-brown", label: "Wood · Brown" },
  ],
  dwarf: [{ id: "default", label: "Default" }, { id: "brown", label: "Brown" }],
  orc: [
    { id: "default", label: "Default" }, { id: "black", label: "Black" }, { id: "blue", label: "Blue" },
    { id: "brown", label: "Brown" }, { id: "green", label: "Green" }, { id: "red", label: "Red" },
  ],
  undead: [{ id: "default", label: "Default" }, { id: "brown", label: "Brown" }],
};

export function defaultSkinVariant(raceId: string): string {
  return SKIN_VARIANTS[raceId]?.[0]?.id ?? "default";
}

// ── Equipment slots ─────────────────────────────────────────────────────────

export interface SlotCatalogEntry {
  slot: EquipSlot;
  group: "armor" | "weapons" | "shields" | "utility";
  /** Variant letters that exist on at least one race. Per-race availability
   *  is inferred at runtime from `EquipmentManager.getGroupedSlots()` against
   *  the loaded model — slots with no matching child mesh just no-op. */
  variants: string[];
  /** True when the mesh has no `_X` letter suffix (single-variant items
   *  like spear / bow / pick / quiver). */
  noVariant?: boolean;
}

export const SLOT_CATALOG: SlotCatalogEntry[] = [
  { slot: "body",      group: "armor",   variants: ["A", "B", "C", "D", "E", "F", "G", "H"] },
  { slot: "arms",      group: "armor",   variants: ["A", "B", "C", "D"] },
  { slot: "legs",      group: "armor",   variants: ["A", "B", "C"] },
  { slot: "head",      group: "armor",   variants: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] },
  { slot: "shoulders", group: "armor",   variants: ["A", "B", "C"] },

  { slot: "axe",     group: "weapons", variants: ["A", "B", "C"] },
  { slot: "hammer",  group: "weapons", variants: ["A", "B"] },
  { slot: "sword",   group: "weapons", variants: ["A", "B"] },
  { slot: "spear",   group: "weapons", variants: ["_default"], noVariant: true },
  { slot: "pick",    group: "weapons", variants: ["_default"], noVariant: true },
  { slot: "bow",     group: "weapons", variants: ["_default"], noVariant: true },
  { slot: "staff",   group: "weapons", variants: ["A", "B", "C"] },

  { slot: "shield",  group: "shields", variants: ["A", "B", "C", "D"] },

  { slot: "bag",     group: "utility", variants: ["_default"], noVariant: true },
  { slot: "wood",    group: "utility", variants: ["_default"], noVariant: true },
  { slot: "quiver",  group: "utility", variants: ["_default"], noVariant: true },
];

export const SLOT_BY_ID: Record<string, SlotCatalogEntry> = Object.fromEntries(
  SLOT_CATALOG.map((s) => [s.slot, s]),
);

/** Slots whose variants are mutually exclusive within their group (only one
 *  weapon can be visible at a time, only one shield, etc.). The
 *  EquipmentManager already enforces this; this constant is for UI hints. */
export const WEAPON_SLOTS = new Set<EquipSlot>([
  "axe", "hammer", "sword", "pick", "spear", "bow", "staff", "shield",
]);

// ── Loadout presets (Garry's Mod style "spawn with this gear") ──────────────

export interface LoadoutPreset {
  id: string;
  label: string;
  description: string;
  icon: string;
  loadout: Partial<Record<EquipSlot, string>>;
}

export const LOADOUT_PRESETS: LoadoutPreset[] = [
  { id: "knight", label: "Knight", description: "Heavy plate, sword & shield.", icon: "⚔",
    loadout: { body: "C", arms: "C", legs: "C", head: "D", shoulders: "B", sword: "A", shield: "A" } },
  { id: "berserker", label: "Berserker", description: "Light armor, dual axes.", icon: "⛏",
    loadout: { body: "B", arms: "B", legs: "B", head: "B", axe: "A" } },
  { id: "archer", label: "Archer", description: "Cloth + leather, bow & quiver.", icon: "🏹",
    loadout: { body: "A", arms: "A", legs: "A", head: "A", bow: "_default", quiver: "_default" } },
  { id: "mage", label: "Mage", description: "Robes and a staff.", icon: "🔮",
    loadout: { body: "D", arms: "D", legs: "C", head: "E", staff: "A" } },
  { id: "tank", label: "Tank", description: "Maximum plate, hammer & tower shield.", icon: "🛡",
    loadout: { body: "E", arms: "D", legs: "C", head: "F", shoulders: "B", hammer: "A", shield: "B" } },
  { id: "spearman", label: "Spearman", description: "Mid armor, spear & shield.", icon: "🎯",
    loadout: { body: "B", arms: "B", legs: "B", head: "C", spear: "_default", shield: "A" } },
];

// ── Slot title for UI grouping ──────────────────────────────────────────────

export const GROUP_TITLES = {
  armor: "Armor",
  weapons: "Weapons",
  shields: "Shields",
  utility: "Utility",
} as const;
