import { useState } from "react";
import { useCharacterStore } from "../../hooks/useCharacterStore";
import { WEAPON_REGISTRY, WEAPON_TYPE_LABELS, WEAPON_TYPE_COLORS } from "../../types/weapons";
import type { WeaponType } from "../../types/weapons";

const ALL_TYPES = Object.keys(WEAPON_TYPE_LABELS) as WeaponType[];

const HAND_BADGE: Record<string, string> = {
  right: "1H",
  left:  "1H",
  both:  "2H",
  off:   "Off",
};

const HAND_BADGE_COLOR: Record<string, string> = {
  right: "bg-amber-600",
  left:  "bg-amber-600",
  both:  "bg-indigo-600",
  off:   "bg-sky-600",
};

function getAttachmentLabel(weaponId: string | null): string | null {
  if (!weaponId) return null;
  const def = WEAPON_REGISTRY.find((w) => w.id === weaponId);
  if (!def) return null;
  if (def.hands === 2) return "Attached to: Bip001 R Hand + Bip001 L Hand";
  if (def.hand === "off") return "Attached to: Bip001 L Hand";
  return "Attached to: Bip001 R Hand";
}

export function WeaponPanel() {
  const { selectedRace, activeStandaloneWeapon, setStandaloneWeapon } = useCharacterStore();
  const [filter, setFilter] = useState<WeaponType | "all">("all");

  const raceWeapons = WEAPON_REGISTRY.filter(
    (w) => !w.races || w.races.includes(selectedRace.id),
  );

  const byType = ALL_TYPES.filter((t) =>
    raceWeapons.some((w) => w.type === t),
  );

  const displayed = filter === "all"
    ? raceWeapons
    : raceWeapons.filter((w) => w.type === filter);

  const grouped = byType.reduce<Record<WeaponType, typeof raceWeapons>>((acc, t) => {
    acc[t] = displayed.filter((w) => w.type === t);
    return acc;
  }, {} as Record<WeaponType, typeof raceWeapons>);

  const attachmentLabel = getAttachmentLabel(activeStandaloneWeapon);

  return (
    <div className="flex flex-col gap-2 h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">
          Drop-in Weapons
        </div>
        {activeStandaloneWeapon && (
          <button
            onClick={() => setStandaloneWeapon(null)}
            className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 hover:bg-red-900 hover:text-red-200 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Type filter bar */}
      <div className="flex flex-wrap gap-1 flex-shrink-0">
        <button
          onClick={() => setFilter("all")}
          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
            filter === "all"
              ? "bg-slate-500 text-white"
              : "bg-slate-700 text-slate-400 hover:text-white"
          }`}
        >
          All
        </button>
        {byType.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className="px-2 py-0.5 rounded text-[10px] font-semibold transition-colors"
            style={
              filter === t
                ? { backgroundColor: WEAPON_TYPE_COLORS[t], color: "#fff" }
                : { backgroundColor: "#334155", color: "#94a3b8" }
            }
          >
            {WEAPON_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Weapon list */}
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-3 pr-1">
        {byType.map((type) => {
          const weapons = grouped[type];
          if (!weapons || weapons.length === 0) return null;
          return (
            <div key={type}>
              <div
                className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                style={{ color: WEAPON_TYPE_COLORS[type] }}
              >
                {WEAPON_TYPE_LABELS[type]}
              </div>
              <div className="flex flex-col gap-1">
                {weapons.map((w) => {
                  const isActive = activeStandaloneWeapon === w.id;
                  return (
                    <button
                      key={w.id}
                      onClick={() => setStandaloneWeapon(isActive ? null : w.id)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded text-left transition-all ${
                        isActive
                          ? "bg-amber-500/20 border border-amber-500/60 shadow-inner"
                          : "bg-slate-700/60 hover:bg-slate-600/60 border border-transparent"
                      }`}
                    >
                      {/* Type dot */}
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: WEAPON_TYPE_COLORS[w.type] }}
                      />
                      {/* Label */}
                      <span
                        className={`flex-1 text-xs font-medium truncate ${
                          isActive ? "text-amber-300" : "text-slate-300"
                        }`}
                      >
                        {w.label}
                      </span>
                      {/* Hands badge */}
                      <span
                        className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                          HAND_BADGE_COLOR[w.hand] ?? "bg-slate-600"
                        } text-white flex-shrink-0`}
                      >
                        {HAND_BADGE[w.hand] ?? String(w.hands)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {raceWeapons.length === 0 && (
          <div className="text-slate-500 text-xs italic text-center pt-4">
            No standalone weapons found for {selectedRace.name}.<br />
            Drop FBX files into the equipment/ folder and register them in weapons.ts.
          </div>
        )}
      </div>

      {/* Active weapon info */}
      {activeStandaloneWeapon && (() => {
        const w = WEAPON_REGISTRY.find((x) => x.id === activeStandaloneWeapon);
        if (!w) return null;
        return (
          <div className="flex-shrink-0 p-2 rounded bg-amber-900/20 border border-amber-700/30 text-[10px] text-amber-200">
            <div className="font-semibold">{w.label}</div>
            <div className="text-amber-400/70 mt-0.5">
              Socket: {w.hand} hand · {w.hands === "off" ? "Off-hand" : `${w.hands}-handed`}
            </div>
            {attachmentLabel && (
              <div className="text-amber-300/80 mt-1 font-medium">
                {attachmentLabel}
              </div>
            )}
            {w.file && (
              <div className="text-amber-400/50 truncate mt-0.5">{w.file.split("/").pop()}</div>
            )}
          </div>
        );
      })()}

      {/* Drop-in guide */}
      <div className="flex-shrink-0 border-t border-slate-700/50 pt-2 mt-1">
        <div className="text-[10px] text-slate-500 leading-relaxed">
          To add weapons: drop FBX into{" "}
          <code className="text-slate-400 bg-slate-800 px-0.5 rounded">
            public/assets/&lt;race&gt;/models/equipment/
          </code>{" "}
          then add an entry to{" "}
          <code className="text-slate-400 bg-slate-800 px-0.5 rounded">
            src/types/weapons.ts
          </code>
          .
        </div>
      </div>
    </div>
  );
}
