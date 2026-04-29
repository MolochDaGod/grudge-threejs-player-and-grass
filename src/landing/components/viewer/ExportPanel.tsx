import { useCharacterStore } from "../../hooks/useCharacterStore";

interface FormatBtn {
  fmt: string;
  label: string;
  ext: string;
  desc: string;
  color: string;
  icon: string;
  supported: boolean;
}

const FORMATS: FormatBtn[] = [
  {
    fmt: "glb",
    label: "GLB",
    ext: ".glb",
    desc: "Binary GLTF — skeleton, materials & texture included. Opens in Blender, Unity, Unreal.",
    color: "#f59e0b",
    icon: "⬡",
    supported: true,
  },
  {
    fmt: "gltf",
    label: "GLTF",
    ext: ".gltf",
    desc: "JSON GLTF — same as GLB but human-readable. Includes skeleton & texture.",
    color: "#3b82f6",
    icon: "{ }",
    supported: true,
  },
  {
    fmt: "obj",
    label: "OBJ",
    ext: ".obj",
    desc: "Wavefront OBJ — static geometry only (no skeleton/animation). Visible meshes only.",
    color: "#10b981",
    icon: "△",
    supported: true,
  },
  {
    fmt: "fbx",
    label: "FBX",
    ext: ".fbx",
    desc: "Not supported in the browser — export GLB then open it in Blender: File › Export › FBX.",
    color: "#6b7280",
    icon: "↗",
    supported: false,
  },
];

export function ExportPanel() {
  const { triggerExport, isExporting, isLoading, meshNames } = useCharacterStore();
  const modelReady = !isLoading && meshNames.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
        Export Model
      </div>

      {!modelReady && (
        <p className="text-xs text-slate-500 italic">Waiting for model to load…</p>
      )}

      <div className="flex flex-col gap-2">
        {FORMATS.map((f) => (
          <div key={f.fmt} className="flex flex-col gap-1">
            {f.supported ? (
              <button
                disabled={!modelReady || isExporting}
                onClick={() => triggerExport(f.fmt)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all border ${
                  modelReady && !isExporting
                    ? "hover:brightness-110 active:scale-95 cursor-pointer border-transparent"
                    : "opacity-40 cursor-not-allowed border-transparent"
                }`}
                style={{ background: f.color + "22", borderColor: f.color + "44" }}
              >
                <span
                  className="text-base font-mono w-6 text-center flex-shrink-0"
                  style={{ color: f.color }}
                >
                  {isExporting ? "…" : f.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs font-bold tracking-wide"
                    style={{ color: f.color }}
                  >
                    {f.label}{" "}
                    <span className="font-normal opacity-70">{f.ext}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">
                    {f.desc.split(" — ")[0]}
                  </div>
                </div>
                <span className="text-slate-500 text-xs">↓</span>
              </button>
            ) : (
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-700/40 opacity-50"
                title={f.desc}
              >
                <span className="text-base font-mono w-6 text-center flex-shrink-0 text-slate-500">
                  {f.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold tracking-wide text-slate-500">
                    {f.label}{" "}
                    <span className="font-normal opacity-70">{f.ext}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    Not supported — convert from GLB
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-1 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/40">
        <div className="text-[10px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
          FBX in 3 steps
        </div>
        <ol className="text-[10px] text-slate-500 space-y-1 list-decimal list-inside leading-relaxed">
          <li>Export as GLB above</li>
          <li>Open in Blender (free) — File › Import › glTF 2.0</li>
          <li>File › Export › FBX — done</li>
        </ol>
      </div>

      <div className="text-[10px] text-slate-600 leading-relaxed">
        GLB includes the full skeleton, all mesh slots, and the applied texture.
        OBJ exports only the currently visible meshes as static geometry.
      </div>
    </div>
  );
}
