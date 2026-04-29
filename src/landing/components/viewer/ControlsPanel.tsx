import { useState } from "react";
import { useCharacterStore } from "../../hooks/useCharacterStore";
import { SkeletonTree } from "./SkeletonTree";

type ViewSection = "viewport" | "bones";

export function ControlsPanel() {
  const {
    speed, setSpeed,
    showSkeleton, toggleSkeleton,
    showWireframe, toggleWireframe,
    selectedRace,
    selectedSkinTint, setSkinTint,
  } = useCharacterStore();

  const [section, setSection] = useState<ViewSection>("viewport");
  const palette = selectedRace.skinPalette ?? [];

  return (
    <div className="flex flex-col gap-3">
      {/* Sub-tab switcher */}
      <div className="flex gap-1 border-b border-slate-700/50 pb-2">
        {(["viewport", "bones"] as ViewSection[]).map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wide transition-colors ${
              section === s
                ? "bg-slate-700 text-amber-400"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {s === "viewport" ? "Viewport" : "Bones"}
          </button>
        ))}
      </div>

      {section === "viewport" && (
        <>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Viewport</div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 flex justify-between">
              <span>Speed</span>
              <span className="text-amber-400 font-mono">{speed.toFixed(2)}x</span>
            </label>
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.05}
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleSkeleton}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                showSkeleton
                  ? "bg-purple-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              Skeleton
            </button>
            <button
              onClick={toggleWireframe}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
                showWireframe
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              Wireframe
            </button>
          </div>

          {/* ── Skin colour picker ──────────────────────────────────── */}
          {palette.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t border-slate-700/60 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Skin
                </span>
                {selectedSkinTint && (
                  <button
                    onClick={() => setSkinTint(null)}
                    className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {palette.map((entry) => {
                  const isActive = selectedSkinTint === entry.hex;
                  return (
                    <button
                      key={entry.hex}
                      title={entry.label}
                      onClick={() => setSkinTint(isActive ? null : entry.hex)}
                      className={`relative rounded aspect-square transition-all ${
                        isActive
                          ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 scale-110"
                          : "hover:scale-105 hover:ring-1 hover:ring-slate-500 hover:ring-offset-1 hover:ring-offset-slate-900"
                      }`}
                      style={{ backgroundColor: entry.hex }}
                    >
                      {isActive && (
                        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold drop-shadow">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedSkinTint && (
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full border border-slate-600 flex-shrink-0"
                    style={{ backgroundColor: selectedSkinTint }}
                  />
                  <span className="text-[10px] text-slate-400">
                    {palette.find((e) => e.hex === selectedSkinTint)?.label ?? selectedSkinTint}
                  </span>
                </div>
              )}

              <div className="text-[10px] text-slate-600 leading-tight">
                Remaps skin-tone pixels on head &amp; arms only.
              </div>
            </div>
          )}

          <div className="text-xs text-slate-600 border-t border-slate-700 pt-2">
            <div className="font-semibold text-slate-500 mb-1">Camera Controls</div>
            <div className="space-y-0.5">
              <div>Left drag — orbit</div>
              <div>Right drag — pan</div>
              <div>Scroll — zoom</div>
            </div>
          </div>
        </>
      )}

      {section === "bones" && (
        <>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Bone Hierarchy
          </div>
          <SkeletonTree />
        </>
      )}
    </div>
  );
}
