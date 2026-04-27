// src/play/sdk-bootstrap.ts
//
// Bridges the existing bundled `script.js` Player class to the new
// build-storage flow:
//
//   1. Initialize GrudgeAccountSDK (standalone — there's no parent frame on
//      /play). When a `grudge_auth_token` is present, this fetches the
//      active character from `api.grudge-studio.com/api/characters/*` and
//      caches it.
//   2. Wait for the bundled `grudge:player-ready` event (legacy script.js
//      exposes `window.GrudgePlayer` once the GLB + EquipmentManager are
//      ready).
//   3. If the SDK delivered a build (`character.equipment` shaped like
//      `CharacterBuild`), call `equipment.applyLoadout(build.equipped)` so
//      the in-grass character matches whatever the user picked in the
//      creator.
//   4. Listen for `grudge:equipment-change` postMessages from any embedded
//      mainpanel iframe (e.g. opened by the HUD's `c` hotkey) and apply
//      them through the same EquipmentManager.
//   5. Debounce-save every change back to the SDK.
//
// This file lives next to the legacy `script.js` so it survives the
// eventual refactor of the bundled output.
import {
  GrudgeAccountSDK,
  type CharacterBuild,
  type EquipSlot,
  type GrudgeCharacter,
  DEFAULT_BUILD,
} from "@shared/grudge-account-sdk";
import { onEquipmentChange } from "@shared/equipment-bridge";
import { WEAPON_SLOTS, animPackForWeapon } from "@shared/catalog";

interface PlayerLike {
  character?: { id: string };
  equipment?: {
    equip(slot: string, variant: string): boolean;
    unequip(slot: string): void;
    equipWeapon(slot: string, variant?: string): boolean;
    applyLoadout(loadout: Record<string, string | null>): string[];
  };
}

declare global {
  interface Window {
    GrudgePlayer?: PlayerLike;
    GrudgeBuild?: CharacterBuild;
  }
}

let activeBuild: CharacterBuild = { ...DEFAULT_BUILD };
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function isCharacterBuild(value: unknown): value is CharacterBuild {
  return Boolean(value && typeof value === "object" && "schemaVersion" in (value as Record<string, unknown>));
}

function scheduleSave(): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const id = GrudgeAccountSDK.getActiveId();
    if (id) void GrudgeAccountSDK.saveBuild(id, activeBuild);
  }, 600);
}

function applyBuildToPlayer(player: PlayerLike, build: CharacterBuild): void {
  if (!player.equipment) return;
  player.equipment.applyLoadout(build.equipped as Record<string, string | null>);
}

function loadBuildFromCharacter(character: GrudgeCharacter | null): void {
  if (!character) return;
  if (isCharacterBuild(character.equipment)) {
    activeBuild = { ...activeBuild, ...character.equipment };
  } else {
    activeBuild = {
      ...DEFAULT_BUILD,
      raceId: character.raceId || activeBuild.raceId,
      classId: character.classId || activeBuild.classId,
    };
  }
  window.GrudgeBuild = activeBuild;
}

async function boot(): Promise<void> {
  await GrudgeAccountSDK.init();
  loadBuildFromCharacter(GrudgeAccountSDK.getActiveCharacter());

  // Re-apply when the SDK polls and refreshes the active character.
  window.addEventListener("grudge:character:updated", () => {
    loadBuildFromCharacter(GrudgeAccountSDK.getActiveCharacter());
    if (window.GrudgePlayer) applyBuildToPlayer(window.GrudgePlayer, activeBuild);
  });

  // The bundled script.js fires `grudge:player-ready` once the player loads.
  const onReady = () => {
    if (window.GrudgePlayer) applyBuildToPlayer(window.GrudgePlayer, activeBuild);
  };
  window.addEventListener("grudge:player-ready", onReady);
  if (window.GrudgePlayer) onReady();

  // The HUD's `c` hotkey will eventually embed `/mainpanel?build=<id>` in a
  // smart window. When that iframe posts equipment-change events, route them
  // through the same EquipmentManager + persist.
  onEquipmentChange((slot: EquipSlot, variant) => {
    const eq = window.GrudgePlayer?.equipment;
    if (!eq) return;
    if (variant == null) {
      delete activeBuild.equipped[slot];
      eq.unequip(slot);
    } else {
      activeBuild.equipped[slot] = variant;
      if (WEAPON_SLOTS.has(slot)) {
        eq.equipWeapon(slot, variant);
        activeBuild.animationPack = animPackForWeapon(slot, activeBuild.classId);
      } else {
        eq.equip(slot, variant);
      }
    }
    scheduleSave();
  });
}

void boot();
