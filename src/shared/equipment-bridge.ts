// src/shared/equipment-bridge.ts
//
// postMessage glue between mainpanel (the equipment driver) and the
// landing/play page (which owns the EquipmentManager + 3D character).
//
// Flow:
//   1. mainpanel user equips a sword in the inventory grid.
//   2. mainpanel calls `postEquipmentChange({ slot:"sword", variant:"A" })`.
//      → posts {type:"grudge:equipment-change", slot, variant} to window.parent.
//   3. landing/play registered `onEquipmentChange((slot, variant) => ...)`,
//      validates the message origin, calls EquipmentManager.equip / unequip
//      / equipWeapon as appropriate, debounces a SDK.saveBuild PATCH.
//
// All messages go through this module so the wire format stays canonical.
import type { EquipSlot } from "./grudge-account-sdk";

export const EQUIPMENT_CHANGE = "grudge:equipment-change" as const;
export const BUILD_REQUEST = "grudge:build-request" as const;
export const BUILD_PUSH = "grudge:build-push" as const;

export interface EquipmentChangeMsg {
  type: typeof EQUIPMENT_CHANGE;
  slot: EquipSlot;
  /** Variant letter ("A"|"B"|"_default") or null to unequip. */
  variant: string | null;
}

export interface BuildRequestMsg {
  type: typeof BUILD_REQUEST;
}

export interface BuildPushMsg {
  type: typeof BUILD_PUSH;
  build: import("./grudge-account-sdk").CharacterBuild;
  characterId?: string;
}

export type BridgeMsg = EquipmentChangeMsg | BuildRequestMsg | BuildPushMsg;

const ALLOWED_PROD_ORIGINS = new Set([
  "https://grudgewarlords.com",
  "https://www.grudgewarlords.com",
  "https://grudge-studio.com",
  "https://play.grudge-studio.com",
  "https://client.grudge-studio.com",
  "https://dash.grudge-studio.com",
]);

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  if (origin === window.location.origin) return true;
  if (ALLOWED_PROD_ORIGINS.has(origin)) return true;
  // Vercel preview deployments
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) return true;
  return false;
}

/** mainpanel side: notify the parent (landing or play) that the user
 *  equipped/unequipped something. */
export function postEquipmentChange(slot: EquipSlot, variant: string | null): void {
  if (typeof window === "undefined" || !window.parent || window.parent === window) return;
  const msg: EquipmentChangeMsg = { type: EQUIPMENT_CHANGE, slot, variant };
  window.parent.postMessage(msg, "*");
}

/** mainpanel side: request the parent to push the current build (used on
 *  iframe boot before any user interaction). */
export function postBuildRequest(): void {
  if (typeof window === "undefined" || !window.parent || window.parent === window) return;
  const msg: BuildRequestMsg = { type: BUILD_REQUEST };
  window.parent.postMessage(msg, "*");
}

/** Parent side: subscribe to equipment changes coming from a child iframe.
 *  Returns an unsubscribe function. */
export function onEquipmentChange(
  handler: (slot: EquipSlot, variant: string | null, origin: string) => void,
): () => void {
  const listener = (e: MessageEvent) => {
    const data = e.data as Partial<EquipmentChangeMsg>;
    if (!data || data.type !== EQUIPMENT_CHANGE) return;
    if (!isAllowedOrigin(e.origin)) return;
    if (typeof data.slot !== "string") return;
    handler(data.slot as EquipSlot, data.variant ?? null, e.origin);
  };
  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
}

/** Parent side: handle a build-request ping from a child iframe and reply
 *  with the current build. */
export function onBuildRequest(
  reply: (target: Window, origin: string) => void,
): () => void {
  const listener = (e: MessageEvent) => {
    const data = e.data as Partial<BuildRequestMsg>;
    if (!data || data.type !== BUILD_REQUEST) return;
    if (!isAllowedOrigin(e.origin)) return;
    if (e.source && "postMessage" in e.source) reply(e.source as Window, e.origin);
  };
  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
}

/** Parent side: push the current build down to a child iframe. */
export function pushBuild(
  target: Window,
  build: import("./grudge-account-sdk").CharacterBuild,
  characterId?: string,
  origin = "*",
): void {
  const msg: BuildPushMsg = { type: BUILD_PUSH, build, characterId };
  target.postMessage(msg, origin);
}

/** mainpanel side: subscribe to a build-push from the parent. */
export function onBuildPush(
  handler: (build: import("./grudge-account-sdk").CharacterBuild, characterId: string | undefined, origin: string) => void,
): () => void {
  const listener = (e: MessageEvent) => {
    const data = e.data as Partial<BuildPushMsg>;
    if (!data || data.type !== BUILD_PUSH || !data.build) return;
    if (!isAllowedOrigin(e.origin)) return;
    handler(data.build, data.characterId, e.origin);
  };
  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
}
