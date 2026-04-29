import { useState } from "react";
import { useCharacterStore } from "../../hooks/useCharacterStore";
import { RACE_MESH_CATALOG, BRB_MESH_CATALOG } from "../../types/meshCatalog";
import type { MeshCategory } from "../../types/meshCatalog";

function CategoryRow({
  cat,
  availableMeshIds,
}: {
  cat: MeshCategory;
  availableMeshIds: Set<string>;
}) {
  const { hiddenMeshes, soloMesh, toggleMesh } = useCharacterStore();
  const [open, setOpen] = useState(true);

  const knownMeshes = cat.meshes.filter((m) => availableMeshIds.has(m.id));
  if (knownMeshes.length === 0) return null;

  const visibleCount = knownMeshes.filter((m) => !hiddenMeshes.has(m.id)).length;

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
          <span className="text-xs font-semibold text-slate-300">{cat.label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">{visibleCount}/{knownMeshes.length}</span>
          <span className="text-slate-600 text-xs">{open ? "▾" : "▸"}</span>
        </div>
      </button>

      {open && (
        <div className="ml-4 flex flex-col gap-0.5 mt-0.5">
          {knownMeshes.map((mesh) => {
            const visible = !hiddenMeshes.has(mesh.id);
            return (
              <div
                key={mesh.id}
                className="flex items-center gap-2 px-1 py-0.5 rounded hover:bg-slate-800/50 group"
              >
                <button
                  onClick={() => toggleMesh(mesh.id)}
                  title={visible ? "Hide" : "Show"}
                  className={`w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-colors ${
                    visible ? "border-transparent" : "border-slate-600 bg-transparent"
                  }`}
                  style={visible ? { background: cat.color } : {}}
                >
                  {visible && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                      <path d="M1.5 5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className={`text-xs flex-1 truncate transition-colors ${
                  visible ? "text-slate-200" : "text-slate-600 line-through"
                }`}>
                  {mesh.label}
                </span>
                {cat.radio && (
                  <button
                    onClick={() => soloMesh(mesh.id, knownMeshes.map((m) => m.id))}
                    title="Show only this"
                    className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-500 hover:text-amber-400 transition-all px-1"
                  >
                    only
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MeshPanel() {
  const { meshNames, selectedRace, hiddenMeshes } = useCharacterStore();
  const meshSet = new Set(meshNames);
  const catalog = RACE_MESH_CATALOG[selectedRace.id] ?? BRB_MESH_CATALOG;
  const catalogIds = new Set(catalog.flatMap((c) => c.meshes.map((m) => m.id)));
  const uncategorized = meshNames.filter((n) => !catalogIds.has(n));
  const visibleTotal = meshNames.filter((n) => !hiddenMeshes.has(n)).length;

  if (meshNames.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-600 text-xs italic">
        Loading model…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Meshes</span>
        <span className="text-xs text-slate-500">{visibleTotal}/{meshNames.length} visible</span>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        {catalog.map((cat) => (
          <CategoryRow key={cat.label} cat={cat} availableMeshIds={meshSet} />
        ))}
        {uncategorized.length > 0 && (
          <CategoryRow
            cat={{ label: "Other", color: "#6b7280", meshes: uncategorized.map((id) => ({ id, label: id })) }}
            availableMeshIds={meshSet}
          />
        )}
      </div>
    </div>
  );
}
