import { useState, useMemo } from "react";
import { useCharacterStore } from "../../hooks/useCharacterStore";
import type { BoneNode } from "../../types/boneTree";
import { HAND_SOCKET_BONES } from "../../types/boneTree";
import { WEAPON_REGISTRY } from "../../types/weapons";

interface BoneRowProps {
  node: BoneNode;
  depth: number;
  search: string;
  attachedBones: Set<string>;
}

function matchesSearch(node: BoneNode, search: string): boolean {
  if (!search) return true;
  if (node.name.toLowerCase().includes(search.toLowerCase())) return true;
  return node.children.some((c) => matchesSearch(c, search));
}

function BoneRow({ node, depth, search, attachedBones }: BoneRowProps) {
  const [open, setOpen] = useState(depth < 2);

  const isVisible = useMemo(() => matchesSearch(node, search), [node, search]);
  if (!isVisible) return null;

  const hasChildren = node.children.length > 0;
  const isHandSocket = HAND_SOCKET_BONES.has(node.name);
  const isAttached = attachedBones.has(node.name);
  const nameMatchesSearch = !!(search && node.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-0.5 rounded px-1 select-none ${
          isAttached ? "bg-amber-500/20" : isHandSocket ? "bg-purple-500/10" : ""
        }`}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
      >
        {/* Expand toggle */}
        <button
          className={`w-3.5 h-3.5 flex items-center justify-center text-[9px] flex-shrink-0 rounded ${
            hasChildren ? "text-slate-400 hover:text-white" : "text-transparent cursor-default"
          }`}
          onClick={() => hasChildren && setOpen((v) => !v)}
        >
          {hasChildren ? (open ? "▾" : "▸") : "·"}
        </button>

        {/* Hand socket dot */}
        {isHandSocket && (
          <span
            title="Hand socket"
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              isAttached ? "bg-amber-400" : "bg-purple-400"
            }`}
          />
        )}

        {/* Bone name */}
        <span
          className={`text-[10px] font-mono truncate leading-tight ${
            isAttached
              ? "text-amber-300 font-semibold"
              : isHandSocket
              ? "text-purple-300 font-medium"
              : nameMatchesSearch
              ? "text-amber-200"
              : "text-slate-400"
          }`}
          title={node.name}
        >
          {node.name}
        </span>

        {/* Badges */}
        <div className="flex gap-0.5 ml-auto flex-shrink-0">
          {isHandSocket && (
            <span className="text-[8px] px-1 rounded bg-purple-700/60 text-purple-200">
              socket
            </span>
          )}
          {isAttached && (
            <span className="text-[8px] px-1 rounded bg-amber-700/60 text-amber-200">
              ⚔
            </span>
          )}
        </div>
      </div>

      {open && hasChildren && node.children.map((child) => (
        <BoneRow
          key={child.name}
          node={child}
          depth={depth + 1}
          search={search}
          attachedBones={attachedBones}
        />
      ))}
    </div>
  );
}

function getAttachedBones(weaponId: string | null): Set<string> {
  if (!weaponId) return new Set();
  const def = WEAPON_REGISTRY.find((w) => w.id === weaponId);
  if (!def) return new Set();
  const bones = new Set<string>();
  if (def.hands === 2) {
    bones.add("Bip001 R Hand");
    bones.add("Bip001 L Hand");
  } else if (def.hand === "off") {
    bones.add("Bip001 L Hand");
  } else {
    bones.add("Bip001 R Hand");
  }
  return bones;
}

export function SkeletonTree() {
  const { boneTree, activeStandaloneWeapon } = useCharacterStore();
  const [search, setSearch] = useState("");

  const attachedBones = useMemo(
    () => getAttachedBones(activeStandaloneWeapon),
    [activeStandaloneWeapon],
  );

  if (!boneTree) {
    return (
      <div className="text-slate-500 text-xs italic text-center py-3">
        No skeleton loaded yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 min-h-0">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search bones…"
        className="w-full text-[10px] bg-slate-800 border border-slate-600 rounded px-2 py-1
          text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400"
      />

      {/* Legend */}
      <div className="flex gap-3">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
          <span className="text-[9px] text-slate-500">Hand socket</span>
        </div>
        {activeStandaloneWeapon && (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
            <span className="text-[9px] text-slate-500">Weapon attached</span>
          </div>
        )}
      </div>

      {/* Tree */}
      <div className="overflow-y-auto max-h-64 border border-slate-700/40 rounded bg-slate-800/30">
        <BoneRow
          node={boneTree}
          depth={0}
          search={search}
          attachedBones={attachedBones}
        />
      </div>
    </div>
  );
}
