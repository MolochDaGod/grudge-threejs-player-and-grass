import { useState } from "react";
import { Scene } from "../components/viewer/Scene";
import { AnimationPanel } from "../components/viewer/AnimationPanel";
import { MeshPanel } from "../components/viewer/MeshPanel";
import { ControlsPanel } from "../components/viewer/ControlsPanel";
import { ExportPanel } from "../components/viewer/ExportPanel";
import { WeaponPanel } from "../components/viewer/WeaponPanel";
import { StatusBar } from "../components/viewer/StatusBar";
import { useCharacterStore } from "@/hooks/useCharacterStore";
import { RACES } from "@/types/races";

type SideTab = "animations" | "meshes" | "controls" | "weapons" | "export";

const TAB_LABELS: Record<SideTab, string> = {
  animations: "Anims",
  meshes:     "Meshes",
  controls:   "View",
  weapons:    "Wpns",
  export:     "Export",
};

export function ViewerPage() {
  const [activeTab, setActiveTab] = useState<SideTab>("animations");
  const {
    isLoading,
    selectedRace,
    setSelectedRace,
    selectedTextureUrl,
    setSelectedTextureUrl,
    hiddenMeshes,
  } = useCharacterStore();

  const variants = selectedRace.textureVariants ?? [];

  function handlePlayClick() {
    const build = {
      schemaVersion: 1,
      raceId: selectedRace.id,
      classId: "warrior",
      skinVariant: "default",
      animationPack: "sword_shield",
      equipped: {},
      hiddenMeshes: [...hiddenMeshes],
    };
    sessionStorage.setItem("grudge_active_build", JSON.stringify(build));
    window.location.href = "/play";
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-900 text-slate-100 overflow-hidden">
      <header className="flex items-center gap-3 px-4 py-2 bg-slate-900 border-b border-slate-700/50 flex-shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs"
            style={{ background: selectedRace.color }}
          >
            {selectedRace.abbr}
          </div>
          <span className="font-bold text-slate-100 tracking-wide text-sm whitespace-nowrap">
            Grudge Studio · Character Creator
          </span>
        </div>

        <div className="h-4 w-px bg-slate-700 flex-shrink-0" />

        {/* Race selector */}
        <div className="flex items-center gap-1">
          {RACES.map((race) => (
            <button
              key={race.id}
              onClick={() => setSelectedRace(race)}
              title={race.name}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all border ${
                selectedRace.id === race.id
                  ? "text-white border-transparent"
                  : "bg-slate-800/60 border-slate-700/40 text-slate-400 hover:text-slate-200 hover:border-slate-500"
              }`}
              style={
                selectedRace.id === race.id
                  ? { background: race.color, borderColor: race.color }
                  : {}
              }
            >
              {race.name}
            </button>
          ))}
        </div>

        {/* Texture variant selector */}
        {variants.length > 1 && (
          <>
            <div className="h-4 w-px bg-slate-700 flex-shrink-0" />
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs text-slate-500">Skin:</span>
              <select
                value={selectedTextureUrl}
                onChange={(e) => setSelectedTextureUrl(e.target.value)}
                className="text-xs bg-slate-800 border border-slate-600 text-slate-200 rounded px-2 py-1
                           focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {variants.map((v) => (
                  <option key={v.url} value={v.url}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {isLoading && (
          <span className="text-xs text-amber-400 flex items-center gap-1.5 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block" />
            Loading...
          </span>
        )}

        {/* Play button */}
        <button
          onClick={handlePlayClick}
          className="ml-auto px-4 py-1.5 bg-amber-500 text-black font-bold text-sm rounded hover:bg-amber-400 transition-colors flex-shrink-0"
        >
          Play →
        </button>
      </header>

      <div className="flex flex-1 min-h-0">
        <main className="flex-1 min-w-0 relative">
          <Scene race={selectedRace} textureUrl={selectedTextureUrl} />
        </main>

        <aside className="w-64 flex-shrink-0 bg-slate-900 border-l border-slate-700/50 flex flex-col min-h-0">
          <div className="flex border-b border-slate-700/50 flex-shrink-0">
            {(["animations", "meshes", "controls", "weapons", "export"] as SideTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                  activeTab === tab
                    ? "bg-slate-800 text-amber-400 border-b-2 border-amber-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {activeTab === "animations" && <AnimationPanel />}
            {activeTab === "meshes"     && <MeshPanel />}
            {activeTab === "controls"   && <ControlsPanel />}
            {activeTab === "weapons"    && <WeaponPanel />}
            {activeTab === "export"     && <ExportPanel />}
          </div>
        </aside>
      </div>

      <StatusBar />
    </div>
  );
}
