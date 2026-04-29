import { useCharacterStore } from "../../hooks/useCharacterStore";
import { LOCOMOTION_ANIMS, ACTION_ANIMS, WEAPON_PACKS, RACE_SPECIFIC_ANIMS } from "../../types/animations";
import { RACE_GEAR_PRESETS, BRB_GEAR_PRESETS } from "../../types/meshCatalog";
import type { AnimationClip, AnimationCategory } from "../../types/animations";
import { useState } from "react";

type Tab = "gear" | "loco" | "action" | "combat" | "race";

const PRESET_ICONS: Record<string, string> = {
  mage:    "🔮",
  knight:  "⚔️",
  ranger:  "🏹",
  warrior: "🪓",
  unarmed: "🥊",
};

const RACE_COLORS: Record<string, string> = {
  BRB: "bg-orange-700/80 text-orange-100",
  DWF: "bg-amber-700/80 text-amber-100",
  ORC: "bg-green-700/80 text-green-100",
  ELF: "bg-cyan-700/80 text-cyan-100",
  UD:  "bg-purple-700/80 text-purple-100",
  WK:  "bg-slate-600/80 text-slate-100",
};

function RaceBadge({ race }: { race: string }) {
  const cls = RACE_COLORS[race] ?? "bg-slate-600/80 text-slate-100";
  return (
    <span className={`inline-block px-1.5 py-0 rounded text-[10px] font-bold leading-5 ${cls}`}>
      {race}
    </span>
  );
}

const CATEGORY_LABELS: Record<AnimationCategory, string> = {
  locomotion: "Locomotion",
  action: "Action",
  combat: "Combat",
  special: "Special",
};

const CATEGORY_ORDER: AnimationCategory[] = ["locomotion", "action", "combat", "special"];

function groupByCategory(clips: AnimationClip[]): [AnimationCategory, AnimationClip[]][] {
  const map = new Map<AnimationCategory, AnimationClip[]>();
  for (const clip of clips) {
    const list = map.get(clip.category) ?? [];
    list.push(clip);
    map.set(clip.category, list);
  }
  return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => [c, map.get(c)!]);
}

export function AnimationPanel() {
  const {
    currentAnim, setCurrentAnim,
    activeWeapon, setActiveWeapon,
    gearPresetId, applyGearPreset,
    meshNames, selectedRace,
    clipMeta,
  } = useCharacterStore();

  const [tab, setTab] = useState<Tab>("gear");
  const [showCrossRace, setShowCrossRace] = useState(false);

  const presets = RACE_GEAR_PRESETS[selectedRace.id] ?? BRB_GEAR_PRESETS;
  const combatPack = WEAPON_PACKS.find((p) => p.weapon === activeWeapon);

  const ownRaceClips = RACE_SPECIFIC_ANIMS.filter((a) => a.sourceRace === selectedRace.abbr);
  const crossRaceClips = RACE_SPECIFIC_ANIMS.filter((a) => a.sourceRace !== selectedRace.abbr);

  const renderAnimBtn = (anim: AnimationClip, showBadge = false) => {
    const isActive = currentAnim.file === anim.file;
    const loops = anim.loop !== false;
    const meta = clipMeta.get(anim.file);
    return (
      <button
        key={anim.file}
        onClick={() => setCurrentAnim(anim)}
        className={`px-2 py-1.5 rounded text-xs font-medium transition-all text-left flex items-center gap-1.5 ${
          isActive
            ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
            : "bg-slate-700/60 text-slate-300 hover:bg-slate-600 hover:text-white"
        }`}
      >
        <span
          title={loops ? "Loops" : "Plays once"}
          className="text-[11px] leading-none flex-shrink-0"
        >
          {loops ? "🔁" : "▶"}
        </span>
        <span className="flex-1">{anim.name}</span>
        {meta && (
          <span className={`text-[10px] tabular-nums flex-shrink-0 ${isActive ? "text-black/70" : "text-slate-500"}`}>
            {meta.duration.toFixed(1)} s
          </span>
        )}
        {showBadge && anim.sourceRace && <RaceBadge race={anim.sourceRace} />}
      </button>
    );
  };

  const renderRaceAnimBtn = (anim: AnimationClip, showBadge = false) => {
    const isActive = currentAnim.file === anim.file;
    const loops = anim.loop !== false;
    const meta = clipMeta.get(anim.file);
    return (
      <button
        key={anim.file}
        onClick={() => setCurrentAnim(anim)}
        className={`px-2 py-1.5 rounded text-xs font-medium transition-all text-left flex items-center gap-1.5 ${
          isActive
            ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
            : "bg-slate-700/60 text-slate-300 hover:bg-slate-600 hover:text-white"
        }`}
      >
        <span
          title={loops ? "Loops" : "Plays once"}
          className="text-[11px] leading-none flex-shrink-0"
        >
          {loops ? "🔁" : "▶"}
        </span>
        <span className="flex-1">{anim.name}</span>
        <span className={`text-[10px] tabular-nums flex-shrink-0 ${isActive ? "text-black/70" : "text-slate-500"}`}>
          {meta ? `${meta.duration.toFixed(1)} s` : "—"}
        </span>
        {showBadge && anim.sourceRace && <RaceBadge race={anim.sourceRace} />}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-2 h-full overflow-hidden">
      {/* Tab bar */}
      <div className="flex gap-1 flex-shrink-0 flex-wrap">
        {(["gear", "loco", "action", "combat", "race"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1 rounded text-[11px] font-semibold transition-colors min-w-0 ${
              tab === t
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            {t === "gear" ? "Gear" : t === "loco" ? "Loco" : t === "action" ? "Action" : t === "combat" ? "Combat" : "Race"}
          </button>
        ))}
      </div>

      {/* GEAR TAB — 4 starting presets */}
      {tab === "gear" && (
        <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
          <p className="text-[11px] text-slate-500 px-1">Starting gear presets — sets equipment and animations.</p>
          {presets.map((preset) => {
            const active = gearPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => applyGearPreset(preset, meshNames)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                  active
                    ? "border-transparent shadow-lg"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-500"
                }`}
                style={active ? { background: preset.color, borderColor: preset.color } : {}}
              >
                <span className="text-2xl leading-none">{PRESET_ICONS[preset.id] ?? "⚙️"}</span>
                <div>
                  <div className={`text-sm font-bold ${active ? "text-white" : "text-slate-200"}`}>
                    {preset.label}
                  </div>
                  <div className={`text-[11px] ${active ? "text-white/80" : "text-slate-500"}`}>
                    {preset.description}
                  </div>
                </div>
                {active && (
                  <div className="ml-auto text-white/80">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                      <path d="M2.5 8l4 4 7-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}

          <div className="border-t border-slate-700 pt-2 mt-1">
            <p className="text-[11px] text-slate-500 px-1 mb-1">Combat pack</p>
            <div className="flex flex-wrap gap-1">
              {WEAPON_PACKS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveWeapon(p.weapon)}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                    activeWeapon === p.weapon
                      ? "bg-amber-500 text-black"
                      : "bg-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LOCO TAB */}
      {tab === "loco" && (
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-1 pr-1">
          {LOCOMOTION_ANIMS.map((a) => renderAnimBtn(a))}
        </div>
      )}

      {/* ACTION TAB */}
      {tab === "action" && (
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-1 pr-1">
          {ACTION_ANIMS.map((a) => renderAnimBtn(a))}
        </div>
      )}

      {/* COMBAT TAB */}
      {tab === "combat" && (
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-1 pr-1">
          {combatPack ? (
            combatPack.anims.map((a) => renderAnimBtn(a))
          ) : (
            <p className="text-xs text-slate-500 italic px-1">
              Select a combat pack in the Gear tab first.
            </p>
          )}
        </div>
      )}

      {/* RACE TAB */}
      {tab === "race" && (
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-2 pr-1">
          {/* Own-race clips — grouped by category */}
          <div className="flex flex-col gap-1">
            <p className="text-[11px] text-slate-500 px-1 flex items-center gap-1">
              <RaceBadge race={selectedRace.abbr} />
              <span>{selectedRace.name} animations</span>
            </p>
            {ownRaceClips.length > 0 ? (
              groupByCategory(ownRaceClips).map(([cat, clips]) => (
                <div key={cat} className="flex flex-col gap-1">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide px-1 mt-1">
                    {CATEGORY_LABELS[cat]}
                  </p>
                  {clips.map((a) => renderRaceAnimBtn(a, false))}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic px-1">
                No race-specific animations found for {selectedRace.name}.
              </p>
            )}
          </div>

          {/* Cross-race divider + toggle */}
          <div className="border-t border-slate-700 pt-2 mt-1">
            <button
              onClick={() => setShowCrossRace((v) => !v)}
              className="w-full flex items-center justify-between px-1 py-1 text-[11px] text-slate-400 hover:text-white transition-colors"
            >
              <span className="font-semibold">Cross-Race Animations</span>
              <span className={`transition-transform duration-200 ${showCrossRace ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>
            {showCrossRace && (
              <div className="flex flex-col gap-1 mt-1">
                <p className="text-[10px] text-slate-500 px-1 mb-1">
                  All races share the Bip001 skeleton — clips play on the current model with no remapping.
                </p>
                {groupByCategory(crossRaceClips).map(([cat, clips]) => (
                  <div key={cat} className="flex flex-col gap-1">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide px-1 mt-1">
                      {CATEGORY_LABELS[cat]}
                    </p>
                    {clips.map((a) => renderRaceAnimBtn(a, true))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
