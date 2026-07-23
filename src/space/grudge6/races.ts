/**
 * grudge6 race kit paths + visual variant palettes.
 * SI: human yardstick 1.8 m; /play world PLAYER_SCALE = 1 (1 unit = 1 m).
 */

export const HUMAN_HEIGHT_M = 1.8;

export type RaceId =
  | "human"
  | "barbarian"
  | "elf"
  | "dwarf"
  | "orc"
  | "undead";

export interface RaceDef {
  id: RaceId;
  label: string;
  prefix: string;
  /** Local kit GLB (preferred for this app). */
  url: string;
  texture: string;
  emoji: string;
  /** Default brand color (UI + tint seed). */
  brand: string;
  faction: string;
}

export const RACES: RaceDef[] = [
  {
    id: "human",
    label: "Human (WK)",
    prefix: "WK_",
    url: "/character/races/WK_Characters.glb",
    texture: "/character/races/textures/human/default.png",
    emoji: "🧑",
    brand: "#94a3b8",
    faction: "crusade",
  },
  {
    id: "barbarian",
    label: "Barbarian (BRB)",
    prefix: "BRB_",
    url: "/character/races/BRB_Characters.glb",
    texture: "/character/races/textures/barbarian/default.png",
    emoji: "🪓",
    brand: "#f43f5e",
    faction: "crusade",
  },
  {
    id: "elf",
    label: "Elf (ELF)",
    prefix: "ELF_",
    url: "/character/races/ELF_Characters.glb",
    texture: "/character/races/textures/elf/highelves.png",
    emoji: "🧝",
    brand: "#22d3ee",
    faction: "fabled",
  },
  {
    id: "dwarf",
    label: "Dwarf (DWF)",
    prefix: "DWF_",
    url: "/character/races/DWF_Characters.glb",
    texture: "/character/races/textures/dwarf/default.png",
    emoji: "⛏",
    brand: "#f59e0b",
    faction: "fabled",
  },
  {
    id: "orc",
    label: "Orc (ORC)",
    prefix: "ORC_",
    url: "/character/races/ORC_Characters.glb",
    texture: "/character/races/textures/orc/default.png",
    emoji: "👹",
    brand: "#65a30d",
    faction: "legion",
  },
  {
    id: "undead",
    label: "Undead (UD)",
    prefix: "UD_",
    url: "/character/races/UD_Characters.glb",
    texture: "/character/races/textures/undead/default.png",
    emoji: "💀",
    brand: "#a78bfa",
    faction: "legion",
  },
];

/** Named color variants so alternate kits are instantly visually distinct. */
export interface ColorVariant {
  id: string;
  label: string;
  /** Multiply tint on materials (hex). */
  tint: string;
  /** Optional emissive for undead / magic feel. */
  emissive?: string;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  note?: string;
}

/** Per-race variant packs — high contrast for art-pass A/B. */
export const RACE_COLOR_VARIANTS: Record<RaceId, ColorVariant[]> = {
  human: [
    { id: "steel", label: "Steel Crusader", tint: "#c8d0dc", roughness: 0.75 },
    { id: "gold", label: "Royal Gold", tint: "#e8c547", metalness: 0.35, roughness: 0.55 },
    { id: "crimson", label: "Crimson Guard", tint: "#c43c3c", roughness: 0.7 },
    { id: "azure", label: "Azure Knight", tint: "#4a7fd4", roughness: 0.65 },
    { id: "forest", label: "Forest Scout", tint: "#3d7a4a", roughness: 0.85 },
  ],
  barbarian: [
    { id: "blood", label: "Blood Rage", tint: "#e03545", roughness: 0.8 },
    { id: "ash", label: "Ash Clan", tint: "#6b6560", roughness: 0.9 },
    { id: "amber", label: "Amber Warband", tint: "#d4882a", roughness: 0.75 },
    { id: "frost", label: "Frost Raider", tint: "#8ec8e8", roughness: 0.7 },
    { id: "bone", label: "Bone Totem", tint: "#e8dcc8", roughness: 0.85 },
  ],
  elf: [
    { id: "moon", label: "Moon Court", tint: "#b8e8ff", roughness: 0.55, emissive: "#204060", emissiveIntensity: 0.15 },
    { id: "sun", label: "Sunspire", tint: "#ffe08a", roughness: 0.5 },
    { id: "verdant", label: "Verdant", tint: "#3ecf7a", roughness: 0.6 },
    { id: "void", label: "Void Silk", tint: "#6a4ccf", roughness: 0.5, emissive: "#2a1060", emissiveIntensity: 0.2 },
    { id: "silver", label: "Silverleaf", tint: "#d0d8e8", metalness: 0.4, roughness: 0.45 },
  ],
  dwarf: [
    { id: "iron", label: "Ironhold", tint: "#8a9098", metalness: 0.45, roughness: 0.55 },
    { id: "copper", label: "Copperbeard", tint: "#c86738", metalness: 0.5, roughness: 0.5 },
    { id: "ruby", label: "Ruby Deep", tint: "#b82840", roughness: 0.65 },
    { id: "emerald", label: "Emerald Delve", tint: "#2a9a58", roughness: 0.7 },
    { id: "obsidian", label: "Obsidian", tint: "#2a2a32", metalness: 0.3, roughness: 0.4 },
  ],
  orc: [
    { id: "war", label: "War Green", tint: "#4a8a28", roughness: 0.85 },
    { id: "swamp", label: "Swamp Rot", tint: "#3a5a28", roughness: 0.9 },
    { id: "slag", label: "Slag Red", tint: "#a83828", roughness: 0.8 },
    { id: "night", label: "Night Horde", tint: "#2a3a28", roughness: 0.88 },
    { id: "bonepaint", label: "Bone Paint", tint: "#c8b898", roughness: 0.82 },
  ],
  undead: [
    { id: "grave", label: "Grave Pale", tint: "#c8d0c0", roughness: 0.8, emissive: "#203018", emissiveIntensity: 0.12 },
    { id: "plague", label: "Plague Glow", tint: "#6ab84a", emissive: "#204010", emissiveIntensity: 0.35, roughness: 0.7 },
    { id: "lich", label: "Lich Blue", tint: "#6a90c8", emissive: "#102040", emissiveIntensity: 0.4, roughness: 0.55 },
    { id: "blood", label: "Blood Risen", tint: "#8a3038", emissive: "#300810", emissiveIntensity: 0.25, roughness: 0.75 },
    { id: "shadow", label: "Shadow Wight", tint: "#3a3850", emissive: "#1a1030", emissiveIntensity: 0.3, roughness: 0.65 },
  ],
};

export function getRace(id: string): RaceDef | undefined {
  return RACES.find((r) => r.id === id);
}

export function getVariants(raceId: RaceId): ColorVariant[] {
  return RACE_COLOR_VARIANTS[raceId] || [];
}
