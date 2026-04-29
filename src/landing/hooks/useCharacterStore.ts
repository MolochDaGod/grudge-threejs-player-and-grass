import { create } from "zustand";
import type { AnimationClip } from "../types/animations";
import { LOCOMOTION_ANIMS, WEAPON_PACKS } from "../types/animations";
import { RACES, type RaceConfig } from "../types/races";
import type { GearPreset } from "../types/meshCatalog";
import type { BoneNode } from "../types/boneTree";

interface ClipMeta {
  duration: number;
}

interface CharacterStore {
  selectedRace: RaceConfig;
  setSelectedRace: (race: RaceConfig) => void;

  selectedTextureUrl: string;
  setSelectedTextureUrl: (url: string) => void;

  currentAnim: AnimationClip;
  setCurrentAnim: (anim: AnimationClip) => void;

  activeWeapon: string;
  setActiveWeapon: (weapon: string) => void;

  gearPresetId: string | null;
  applyGearPreset: (preset: GearPreset, allMeshNames: string[]) => void;

  hiddenMeshes: Set<string>;
  toggleMesh: (meshName: string) => void;
  setMeshVisible: (meshName: string, visible: boolean) => void;
  soloMesh: (meshId: string, groupIds: string[]) => void;

  speed: number;
  setSpeed: (s: number) => void;

  showSkeleton: boolean;
  toggleSkeleton: () => void;

  showWireframe: boolean;
  toggleWireframe: () => void;

  meshNames: string[];
  setMeshNames: (names: string[]) => void;

  isLoading: boolean;
  setIsLoading: (v: boolean) => void;

  loadError: string | null;
  setLoadError: (e: string | null) => void;

  pendingExport: string | null;
  isExporting: boolean;
  triggerExport: (fmt: string) => void;
  clearExport: () => void;

  selectedSkinTint: string | null;
  setSkinTint: (hex: string | null) => void;

  activeStandaloneWeapon: string | null;
  setStandaloneWeapon: (weaponId: string | null) => void;

  boneTree: BoneNode | null;
  setBoneTree: (tree: BoneNode | null) => void;

  animOverdrive: number;
  setAnimOverdrive: (v: number) => void;

  animArmSpace: number;
  setAnimArmSpace: (v: number) => void;

  animTrimStart: number;
  animTrimEnd: number;
  setAnimTrim: (start: number, end: number) => void;

  animMirror: boolean;
  setAnimMirror: (v: boolean) => void;

  animFrameCount: number;
  setAnimFrameCount: (n: number) => void;

  animPaused: boolean;
  setAnimPaused: (v: boolean) => void;

  animProgress: number;        // 0-100, read back from scene each frame
  setAnimProgress: (v: number) => void;

  animScrubTo: number | null;  // 0-100, one-shot scrub target consumed by scene
  setAnimScrubTo: (v: number | null) => void;

  clipMeta: Map<string, ClipMeta>;
  setClipMeta: (file: string, meta: ClipMeta) => void;
}

export const useCharacterStore = create<CharacterStore>((set) => ({
  selectedRace: RACES[0],
  setSelectedRace: (race) =>
    set({
      selectedRace: race,
      selectedTextureUrl: race.textureUrl,
      hiddenMeshes: new Set(),
      meshNames: [],
      isLoading: true,
      loadError: null,
      gearPresetId: null,
      selectedSkinTint: null,
      activeStandaloneWeapon: null,
      boneTree: null,
    }),

  selectedTextureUrl: RACES[0].textureUrl,
  setSelectedTextureUrl: (selectedTextureUrl) => set({ selectedTextureUrl }),

  currentAnim: LOCOMOTION_ANIMS[0],
  setCurrentAnim: (anim) => set({ currentAnim: anim, animTrimStart: 0, animTrimEnd: 100, animFrameCount: 0, animPaused: false, animProgress: 0, animScrubTo: null }),

  activeWeapon: "unarmed",
  setActiveWeapon: (weapon) => set({ activeWeapon: weapon }),

  gearPresetId: null,
  applyGearPreset: (preset, allMeshNames) => {
    const visibleSet = new Set(preset.visibleMeshes);
    const hidden = new Set(allMeshNames.filter((n) => !visibleSet.has(n)));

    const pack = WEAPON_PACKS.find((p) => p.weapon === preset.animPack);
    const firstAnim = pack ? pack.anims[0] : LOCOMOTION_ANIMS[0];

    set({
      gearPresetId: preset.id,
      hiddenMeshes: hidden,
      activeWeapon: preset.animPack,
      currentAnim: firstAnim,
    });
  },

  hiddenMeshes: new Set(),
  toggleMesh: (meshName) =>
    set((state) => {
      const next = new Set(state.hiddenMeshes);
      if (next.has(meshName)) next.delete(meshName);
      else next.add(meshName);
      return { hiddenMeshes: next, gearPresetId: null };
    }),
  setMeshVisible: (meshName, visible) =>
    set((state) => {
      const next = new Set(state.hiddenMeshes);
      if (visible) next.delete(meshName);
      else next.add(meshName);
      return { hiddenMeshes: next, gearPresetId: null };
    }),
  soloMesh: (meshId, groupIds) =>
    set((state) => {
      const next = new Set(state.hiddenMeshes);
      groupIds.forEach((id) => {
        if (id === meshId) next.delete(id);
        else next.add(id);
      });
      return { hiddenMeshes: next, gearPresetId: null };
    }),

  speed: 1,
  setSpeed: (speed) => set({ speed }),

  showSkeleton: false,
  toggleSkeleton: () => set((s) => ({ showSkeleton: !s.showSkeleton })),

  showWireframe: false,
  toggleWireframe: () => set((s) => ({ showWireframe: !s.showWireframe })),

  meshNames: [],
  setMeshNames: (meshNames) => set({ meshNames }),

  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),

  loadError: null,
  setLoadError: (loadError) => set({ loadError }),

  pendingExport: null,
  isExporting: false,
  triggerExport: (fmt) => set({ pendingExport: fmt, isExporting: true }),
  clearExport: () => set({ pendingExport: null, isExporting: false }),

  selectedSkinTint: null,
  setSkinTint: (selectedSkinTint) => set({ selectedSkinTint }),

  activeStandaloneWeapon: null,
  setStandaloneWeapon: (activeStandaloneWeapon) => set({ activeStandaloneWeapon }),

  boneTree: null,
  setBoneTree: (boneTree) => set({ boneTree }),

  animOverdrive: 50,
  setAnimOverdrive: (animOverdrive) => set({ animOverdrive }),

  animArmSpace: 50,
  setAnimArmSpace: (animArmSpace) => set({ animArmSpace }),

  animTrimStart: 0,
  animTrimEnd: 100,
  setAnimTrim: (animTrimStart, animTrimEnd) => set({ animTrimStart, animTrimEnd }),

  animMirror: false,
  setAnimMirror: (animMirror) => set({ animMirror }),

  animFrameCount: 0,
  setAnimFrameCount: (animFrameCount) => set({ animFrameCount }),

  animPaused: false,
  setAnimPaused: (animPaused) => set({ animPaused }),

  animProgress: 0,
  setAnimProgress: (animProgress) => set({ animProgress }),

  animScrubTo: null,
  setAnimScrubTo: (animScrubTo) => set({ animScrubTo }),

  clipMeta: new Map(),
  setClipMeta: (file, meta) =>
    set((state) => {
      const next = new Map(state.clipMeta);
      next.set(file, meta);
      return { clipMeta: next };
    }),
}));
