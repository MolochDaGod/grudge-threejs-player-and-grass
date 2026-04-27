// src/grudge/attributes.ts
//
// Phase 5-prep stub. The 8-attribute system is canonical across the whole
// game (UIlayer.html STAT_META, mainpanel.html `.csg-cell` grid, Unity
// `PlayerAttribute.cs` + `PlayerAttributes/{Strength,Intelligence}.cs`).
// This file freezes the type names + meta strings the HUD/mainpanel renders
// from. Real derived-stat formulas land in Phase 5 alongside `combat.ts`.
export const ATTRIBUTE_KEYS = ["STR", "INT", "VIT", "DEX", "END", "WIS", "AGI", "TAC"] as const;
export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];

export interface AttributeMeta {
  key: AttributeKey;
  name: string;        // "Strength"
  short: string;       // "STR"
  desc: string;        // tooltip text shown by GW_Tooltip
  color: string;       // tooltip accent
}

export const ATTRIBUTE_META: Readonly<Record<AttributeKey, AttributeMeta>> = Object.freeze({
  STR: { key: "STR", name: "Strength",  short: "STR", desc: "Increases physical damage, melee attack power, and carry weight.",         color: "#ef4444" },
  INT: { key: "INT", name: "Intellect", short: "INT", desc: "Increases spell damage, magic attack power, and mana pool size.",          color: "#8b5cf6" },
  VIT: { key: "VIT", name: "Vitality",  short: "VIT", desc: "Increases maximum HP and natural HP regeneration rate.",                    color: "#22c55e" },
  DEX: { key: "DEX", name: "Dexterity", short: "DEX", desc: "Increases attack speed, critical hit chance, and ranged damage.",          color: "#f59e0b" },
  END: { key: "END", name: "Endurance", short: "END", desc: "Increases stamina pool, physical resistance, and stamina regen.",          color: "#9ca3af" },
  WIS: { key: "WIS", name: "Wisdom",    short: "WIS", desc: "Increases maximum MP, mana regeneration, and spell resistance.",           color: "#3b82f6" },
  AGI: { key: "AGI", name: "Agility",   short: "AGI", desc: "Increases movement speed, dodge chance, and evasion rating.",              color: "#84cc16" },
  TAC: { key: "TAC", name: "Tactics",   short: "TAC", desc: "Increases party buff strength, command range, and debuff uptime.",        color: "#ec4899" },
});

/** Per-attribute base value all races/classes share. Race passives in
 *  `@shared/catalog.RACES.passive` are layered on top. */
export type AttributeBlock = Record<AttributeKey, number>;

export const BASE_ATTRIBUTES: Readonly<AttributeBlock> = Object.freeze({
  STR: 8, INT: 8, VIT: 8, DEX: 8, END: 8, WIS: 8, AGI: 8, TAC: 8,
});

/** Phase 5: replace this with the real `GRUDGE_CombatBalanceConfig` derived
 *  stats. For now, return the raw inputs so the HUD has *something* to render. */
export interface DerivedStats {
  hpMax: number;
  mpMax: number;
  spMax: number;
  attackPower: number;
  spellPower: number;
  defense: number;
  critChance: number;     // 0..1
  dodgeChance: number;    // 0..1
  moveSpeed: number;      // m/s
}

export function deriveStats(attrs: AttributeBlock): DerivedStats {
  // Diminishing-returns curve sketch (matches the user-rule 8-attr design):
  // hpMax = 100 + 12*VIT - 0.5*VIT^0.6
  // mpMax = 50  + 10*WIS - 0.4*WIS^0.6
  // spMax = 100 + 6*END
  // attackPower = STR + 0.3*DEX
  // spellPower  = INT + 0.5*WIS
  // defense     = END + 0.2*VIT
  const dim = (x: number, k: number): number => Math.max(0, x - k * Math.pow(x, 0.6));
  return {
    hpMax: 100 + 12 * attrs.VIT - dim(attrs.VIT, 0.5),
    mpMax: 50 + 10 * attrs.WIS - dim(attrs.WIS, 0.4),
    spMax: 100 + 6 * attrs.END,
    attackPower: attrs.STR + 0.3 * attrs.DEX,
    spellPower: attrs.INT + 0.5 * attrs.WIS,
    defense: attrs.END + 0.2 * attrs.VIT,
    critChance: Math.min(0.6, 0.05 + 0.005 * attrs.DEX),
    dodgeChance: Math.min(0.4, 0.02 + 0.004 * attrs.AGI),
    moveSpeed: 4.0 + 0.05 * attrs.AGI,
  };
}
