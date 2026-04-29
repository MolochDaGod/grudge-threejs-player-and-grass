export type WeaponType =
  | "axe" | "sword" | "hammer" | "mace"
  | "staff" | "bow" | "spear" | "dagger"
  | "shield" | "pick" | "other";

export type WeaponHand  = "right" | "left" | "both" | "off";
export type WeaponHands = 1 | 2 | "off";

export interface WeaponDef {
  id:       string;
  label:    string;
  type:     WeaponType;
  hands:    WeaponHands;
  hand:     WeaponHand;
  /** Standalone FBX path — present on "drop-in" weapons */
  file?:    string;
  /** Mesh name already embedded in the character FBX */
  meshId?:  string;
  /** Races this weapon belongs to; undefined = cross-race / universal */
  races?:   string[];
  /** Three.js-space offset from hand bone origin [x, y, z] — primary (right) hand */
  posOffset?: [number, number, number];
  /** Euler rotation offset from hand bone [x, y, z] in degrees — primary (right) hand */
  rotOffset?: [number, number, number];
  /** Three.js-space offset from left hand bone origin [x, y, z] — 2H secondary grip */
  lhPosOffset?: [number, number, number];
  /** Euler rotation offset from left hand bone [x, y, z] in degrees — 2H secondary grip */
  lhRotOffset?: [number, number, number];
}

export const WEAPON_TYPE_LABELS: Record<WeaponType, string> = {
  axe:    "Axes",
  sword:  "Swords",
  hammer: "Hammers",
  mace:   "Maces",
  staff:  "Staves",
  bow:    "Bows",
  spear:  "Spears",
  dagger: "Daggers",
  shield: "Shields",
  pick:   "Picks",
  other:  "Other",
};

export const WEAPON_TYPE_COLORS: Record<WeaponType, string> = {
  axe:    "#ef4444",
  sword:  "#f97316",
  hammer: "#eab308",
  mace:   "#a16207",
  staff:  "#8b5cf6",
  bow:    "#10b981",
  spear:  "#06b6d4",
  dagger: "#f43f5e",
  shield: "#3b82f6",
  pick:   "#6b7280",
  other:  "#9ca3af",
};

// ─── Hand socket bone names (Bip001 skeleton) ─────────────────────────────────

export const HAND_BONE: Record<WeaponHand, string | string[]> = {
  right:  "Bip001 R Hand",
  left:   "Bip001 L Hand",
  both:   ["Bip001 R Hand", "Bip001 L Hand"],
  off:    "Bip001 L Hand",
};

// ─── Drop-in weapon registry ───────────────────────────────────────────────────
// Add a new entry here when you drop a weapon FBX into an equipment/ folder.
// Fields: id (unique), label, type, hands (1/2/"off"), hand (right/left/both/off),
//         file (path relative to /public), races (optional filter), posOffset, rotOffset.

export const WEAPON_REGISTRY: WeaponDef[] = [
  // ── Barbarians ───────────────────────────────────────────────────────────────
  {
    id: "brb-hammer-b", label: "BRB War Hammer",
    type: "hammer", hands: 1, hand: "right",
    file: "/assets/barbarians/models/equipment/BRB_weapon_hammer_B.FBX",
    races: ["barbarians"],
  },
  {
    id: "brb-spear", label: "BRB Spear",
    type: "spear", hands: 2, hand: "right",
    file: "/assets/barbarians/models/equipment/BRB_weapon_spear.FBX",
    races: ["barbarians"],
    lhPosOffset: [0, 0.15, 0],
    lhRotOffset: [0, 0, 0],
  },
  {
    id: "brb-staff-b", label: "BRB Orb Staff",
    type: "staff", hands: 1, hand: "right",
    file: "/assets/barbarians/models/equipment/BRB_weapon_staff_B.FBX",
    races: ["barbarians"],
  },
  {
    id: "brb-sword-b", label: "BRB Long Sword",
    type: "sword", hands: 1, hand: "right",
    file: "/assets/barbarians/models/equipment/BRB_weapon_sword_B.FBX",
    races: ["barbarians"],
  },

  // ── High Elves ────────────────────────────────────────────────────────────────
  {
    id: "elf-spear", label: "ELF Spear",
    type: "spear", hands: 2, hand: "right",
    file: "/assets/elves/models/equipment/ELF_weapon_spear.FBX",
    races: ["high-elves"],
    lhPosOffset: [0, 0.15, 0],
    lhRotOffset: [0, 0, 0],
  },
  {
    id: "elf-staff-c", label: "ELF Arcane Staff (2H)",
    type: "staff", hands: 2, hand: "right",
    file: "/assets/elves/models/equipment/ELF_weapon_staff_C.FBX",
    races: ["high-elves"],
    lhPosOffset: [0, 0.12, 0],
    lhRotOffset: [0, 0, 0],
  },

  // ── Orcs ─────────────────────────────────────────────────────────────────────
  {
    id: "orc-axe-a", label: "ORC Hand Axe",
    type: "axe", hands: 1, hand: "right",
    file: "/assets/orcs/models/equipment/ORC_weapon_Axe_A.FBX",
    races: ["orcs"],
  },
  {
    id: "orc-staff-b", label: "ORC Totem Staff (2H)",
    type: "staff", hands: 2, hand: "right",
    file: "/assets/orcs/models/equipment/ORC_weapon_staff_B.FBX",
    races: ["orcs"],
    lhPosOffset: [0, 0.12, 0],
    lhRotOffset: [0, 0, 0],
  },
  {
    id: "orc-shield-d", label: "ORC War Shield",
    type: "shield", hands: "off", hand: "off",
    file: "/assets/orcs/models/equipment/ORC_Shield_D.FBX",
    races: ["orcs"],
  },

  // ── Undead ────────────────────────────────────────────────────────────────────
  {
    id: "ud-spear", label: "UD Plague Spear (2H)",
    type: "spear", hands: 2, hand: "right",
    file: "/assets/undead/models/equipment/UD_weapon_Spear.FBX",
    races: ["undead"],
    lhPosOffset: [0, 0.15, 0],
    lhRotOffset: [0, 0, 0],
  },
  {
    id: "ud-staff-b", label: "UD Plague Staff (2H)",
    type: "staff", hands: 2, hand: "right",
    file: "/assets/undead/models/equipment/UD_weapon_staff_B.FBX",
    races: ["undead"],
    lhPosOffset: [0, 0.12, 0],
    lhRotOffset: [0, 0, 0],
  },
  {
    id: "ud-sword-c", label: "UD Plague Sword",
    type: "sword", hands: 1, hand: "right",
    file: "/assets/undead/models/equipment/UD_weapon_Sword_C.FBX",
    races: ["undead"],
  },
  {
    id: "ud-shield-c", label: "UD Tower Shield",
    type: "shield", hands: "off", hand: "off",
    file: "/assets/undead/models/equipment/UD_Shield_C.FBX",
    races: ["undead"],
  },

  // ── Western Kingdoms ──────────────────────────────────────────────────────────
  {
    id: "wk-staff-b", label: "WK Orb Staff",
    type: "staff", hands: 1, hand: "right",
    file: "/assets/western-kingdoms/models/equipment/WK_weapon_staff_B.FBX",
    races: ["western-kingdoms"],
  },
  {
    id: "wk-sword-a", label: "WK Short Sword",
    type: "sword", hands: 1, hand: "right",
    file: "/assets/western-kingdoms/models/equipment/WK_weapon_sword_A.FBX",
    races: ["western-kingdoms"],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // ADD NEW DROP-IN WEAPONS HERE
  // Template:
  // {
  //   id: "unique-id",
  //   label: "Display Name",
  //   type: "sword",          // axe|sword|hammer|mace|staff|bow|spear|dagger|shield|pick|other
  //   hands: 1,               // 1 | 2 | "off"
  //   hand: "right",          // right | left | both | off
  //   file: "/assets/<race>/models/equipment/<filename>.FBX",
  //   races: ["barbarians"],  // omit for cross-race
  //   posOffset: [0, 0, 0],   // tune hand-bone offset (x,y,z in Three.js units)
  //   rotOffset: [0, 0, 0],   // tune rotation in degrees (x,y,z Euler)
  // },
];
