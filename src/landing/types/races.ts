export interface TextureVariant {
  label: string;
  url: string;
}

export interface SkinColorEntry {
  label: string;
  hex: string;
}

export interface RaceConfig {
  id: string;
  /**
   * Stable race ID consumed by `/play` (`src/play/player-config.js::CHARACTERS`)
   * and the GrudgeAccountSDK CharacterBuild. Differs from `id` because the
   * landing page uses long-form keys for its mesh / preset catalog while the
   * player + backend use the short-form race IDs (`human`, `barbarian`, ...).
   */
  playId: string;
  name: string;
  abbr: string;
  color: string;
  modelUrl: string;
  textureUrl: string;
  textureVariants?: TextureVariant[];
  skinPalette?: SkinColorEntry[];
  /** HSL skin detection: hue range [0..1], saturation, lightness */
  skinHueRange?: [number, number];
  skinSatRange?: [number, number];
  skinLitRange?: [number, number];
}

const HUMAN_SKIN_HSL = {
  skinHueRange: [0.03, 0.12] as [number, number],
  skinSatRange: [0.28, 0.92] as [number, number],
  skinLitRange: [0.38, 0.82] as [number, number],
};

export const RACES: RaceConfig[] = [
  {
    id: "barbarians",
    playId: "barbarian",
    name: "Barbarians",
    abbr: "BRB",
    color: "#c2410c",
    modelUrl: "/character/races/BRB_Characters.glb",
    textureUrl: "/character/races/textures/barbarian/default.png",
    ...HUMAN_SKIN_HSL,
    skinPalette: [
      { label: "Nordic Pale",  hex: "#f0c8a0" },
      { label: "Warrior Tan",  hex: "#c87840" },
      { label: "Darkblood",    hex: "#7a3c20" },
      { label: "Sunburnt",     hex: "#c05828" },
    ],
    textureVariants: [
      { label: "Default", url: "/character/races/textures/barbarian/default.png" },
    ],
  },
  {
    id: "dwarves",
    playId: "dwarf",
    name: "Dwarves",
    abbr: "DWF",
    color: "#b45309",
    modelUrl: "/character/races/DWF_Characters.glb",
    textureUrl: "/character/races/textures/dwarf/default.png",
    ...HUMAN_SKIN_HSL,
    skinPalette: [
      { label: "Ruddy Pale",   hex: "#e8a878" },
      { label: "Stone-Worn",   hex: "#b87848" },
      { label: "Deep Forge",   hex: "#7a4828" },
      { label: "Ironblood",    hex: "#903830" },
    ],
    textureVariants: [
      { label: "Default", url: "/character/races/textures/dwarf/default.png" },
    ],
  },
  {
    id: "high-elves",
    playId: "elf",
    name: "High Elves",
    abbr: "ELF",
    color: "#0891b2",
    modelUrl: "/character/races/ELF_Characters.glb",
    textureUrl: "/character/races/textures/elf/default.png",
    skinHueRange: [0.03, 0.14],
    skinSatRange: [0.18, 0.82],
    skinLitRange: [0.52, 0.94],
    skinPalette: [
      { label: "Porcelain",    hex: "#f5e0d0" },
      { label: "Ivory",        hex: "#e0c0a0" },
      { label: "Sun-Kissed",   hex: "#c89868" },
      { label: "Ashen",        hex: "#c0b8d4" },
      { label: "Shadow",       hex: "#786070" },
    ],
    textureVariants: [
      { label: "Default", url: "/character/races/textures/elf/default.png" },
    ],
  },
  {
    id: "orcs",
    playId: "orc",
    name: "Orcs",
    abbr: "ORC",
    color: "#15803d",
    modelUrl: "/character/races/ORC_Characters.glb",
    textureUrl: "/character/races/textures/orc/default.png",
    skinHueRange: [0.24, 0.42],
    skinSatRange: [0.22, 0.80],
    skinLitRange: [0.24, 0.64],
    skinPalette: [
      { label: "Swamp Green",  hex: "#5a8040" },
      { label: "Dark Blood",   hex: "#385028" },
      { label: "Iron Grey",    hex: "#5a6858" },
      { label: "Fel-Touched",  hex: "#488858" },
      { label: "Warchief",     hex: "#304828" },
    ],
    textureVariants: [
      { label: "Default", url: "/character/races/textures/orc/default.png" },
    ],
  },
  {
    id: "undead",
    playId: "undead",
    name: "Undead",
    abbr: "UD",
    color: "#7c3aed",
    modelUrl: "/character/races/UD_Characters.glb",
    textureUrl: "/character/races/textures/undead/default.png",
    skinHueRange: [0.0, 1.0],
    skinSatRange: [0.0, 0.20],
    skinLitRange: [0.38, 0.82],
    skinPalette: [
      { label: "Bone White",   hex: "#d0ccc0" },
      { label: "Pale Grey",    hex: "#b0aca8" },
      { label: "Ancient",      hex: "#887870" },
      { label: "Plague",       hex: "#98a870" },
      { label: "Lich",         hex: "#c4c8e0" },
    ],
    textureVariants: [
      { label: "Default", url: "/character/races/textures/undead/default.png" },
    ],
  },
  {
    id: "western-kingdoms",
    playId: "human",
    name: "W. Kingdoms",
    abbr: "WK",
    color: "#1d4ed8",
    modelUrl: "/character/races/WK_Characters.glb",
    textureUrl: "/character/races/textures/human/default.png",
    ...HUMAN_SKIN_HSL,
    skinPalette: [
      { label: "Fair",         hex: "#f0c8a0" },
      { label: "Olive",        hex: "#c09868" },
      { label: "Tanned",       hex: "#a06838" },
      { label: "Dark",         hex: "#6c3a20" },
    ],
    textureVariants: [
      { label: "Default", url: "/character/races/textures/human/default.png" },
    ],
  },
];
