export type WeaponType = "unarmed" | "sword_shield" | "magic" | "rifle" | "pistol" | "longbow";

export type AnimationCategory = "locomotion" | "action" | "combat" | "special";

export interface AnimationClip {
  name: string;
  file: string;
  pack: string;
  category: AnimationCategory;
  weapon?: WeaponType;
  loop?: boolean;
  sourceRace?: string;
  raceSpecific?: boolean;
}

export interface AnimationPack {
  id: string;
  label: string;
  weapon: WeaponType;
  anims: AnimationClip[];
}

export const LOCOMOTION_ANIMS: AnimationClip[] = [
  { name: "Idle",          file: "/character/races/anims/idle.glb",          pack: "locomotion", category: "locomotion", loop: true },
  { name: "Walk",          file: "/character/races/anims/walk.glb",          pack: "locomotion", category: "locomotion", loop: true },
  { name: "Run",           file: "/character/races/anims/run.glb",           pack: "locomotion", category: "locomotion", loop: true },
  { name: "Run Back",      file: "/character/races/anims/run-back.glb",      pack: "locomotion", category: "locomotion", loop: true },
  { name: "Run Diagonal",  file: "/character/races/anims/run-diagonal.glb",  pack: "locomotion", category: "locomotion", loop: true },
  { name: "Working",       file: "/character/races/anims/working.glb",       pack: "locomotion", category: "action",     loop: true },
  { name: "Death",         file: "/character/races/anims/death.glb",         pack: "locomotion", category: "action",     loop: false },
];

export const ACTION_ANIMS: AnimationClip[] = [
  { name: "Idle",          file: "/character/races/anims/idle.glb",          pack: "action", category: "locomotion", loop: true },
  { name: "Walk",          file: "/character/races/anims/walk.glb",          pack: "action", category: "locomotion", loop: true },
  { name: "Run",           file: "/character/races/anims/run.glb",           pack: "action", category: "locomotion", loop: true },
];

export const WEAPON_PACKS: AnimationPack[] = [
  {
    id: "unarmed",
    label: "Unarmed",
    weapon: "unarmed",
    anims: [
      { name: "Idle",    file: "/character/races/anims/idle.glb",   pack: "unarmed", category: "locomotion", weapon: "unarmed", loop: true },
      { name: "Attack",  file: "/character/races/anims/attack.glb", pack: "unarmed", category: "combat",     weapon: "unarmed", loop: false },
    ],
  },
  {
    id: "sword_shield",
    label: "Sword & Shield",
    weapon: "sword_shield",
    anims: [
      { name: "Idle",         file: "/character/races/anims/idle.glb",         pack: "sword_shield", category: "locomotion", weapon: "sword_shield", loop: true },
      { name: "Walk",         file: "/character/races/anims/walk.glb",         pack: "sword_shield", category: "locomotion", weapon: "sword_shield", loop: true },
      { name: "Run",          file: "/character/races/anims/run.glb",          pack: "sword_shield", category: "locomotion", weapon: "sword_shield", loop: true },
      { name: "Attack",       file: "/character/races/anims/attack.glb",       pack: "sword_shield", category: "combat",     weapon: "sword_shield", loop: false },
      { name: "Attack Spear", file: "/character/races/anims/attack-spear.glb", pack: "sword_shield", category: "combat",     weapon: "sword_shield", loop: false },
      { name: "Death",        file: "/character/races/anims/death.glb",        pack: "sword_shield", category: "combat",     weapon: "sword_shield", loop: false },
    ],
  },
  {
    id: "magic",
    label: "Magic",
    weapon: "magic",
    anims: [
      { name: "Idle",  file: "/character/races/anims/idle.glb", pack: "magic", category: "locomotion", weapon: "magic", loop: true },
      { name: "Cast",  file: "/character/races/anims/cast.glb", pack: "magic", category: "combat",     weapon: "magic", loop: false },
      { name: "Death", file: "/character/races/anims/death.glb",pack: "magic", category: "combat",     weapon: "magic", loop: false },
    ],
  },
];

export const ALL_ANIM_PACKS = WEAPON_PACKS;

/** Race-specific animations (empty for now — no per-race GLB anim overrides yet) */
export const RACE_SPECIFIC_ANIMS: AnimationClip[] = [];
