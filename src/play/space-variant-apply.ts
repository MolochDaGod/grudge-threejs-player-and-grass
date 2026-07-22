/**
 * Apply `/space` export (`grudge_space_variant`) onto the live /play Player.
 *
 * Reads sessionStorage written by GrudgeGltfSpace.sendToPlay / Export JSON handoff.
 * Applies:
 *   - body region bone scales (chest/arms/belly/thighs/legs/overall)
 *   - optional material tint from colorVariantId (via GrudgeBuild)
 *   - debug collider helpers when ?spaceDebug=1
 *
 * SI note: Space authors in metres (1.8 m human). Play world uses PLAYER_SCALE=4.2.
 * Region scales are unitless factors — apply as-is. Collider metres × PLAYER_SCALE.
 */
import * as THREE from "three";

const VARIANT_KEY = "grudge_space_variant";
const PLAYER_SCALE =
  (typeof window !== "undefined" &&
    (window as unknown as { PLAYER_SCALE?: number }).PLAYER_SCALE) ||
  4.2;

export interface SpaceVariantRegions {
  overall?: { scale: number };
  chest?: { scale: number };
  arms?: { scale: number };
  belly?: { scale: number };
  thighs?: { scale: number };
  legs?: { scale: number };
}

export interface SpaceVariantDoc {
  schemaVersion?: number;
  raceId?: string | null;
  colorVariantId?: string | null;
  bodyRegions?: {
    regions?: SpaceVariantRegions;
    measuredHeightM?: number;
  };
  colliders?: {
    colliders?: Array<{
      id: string;
      role: string;
      shape: string;
      height: number;
      radius: number;
      box?: { x: number; y: number; z: number };
      offset: { x: number; y: number; z: number };
      rotation: { x: number; y: number; z: number };
      color?: number;
    }>;
  };
  bones?: Record<string, { x: number; y: number; z: number; bone: string }>;
}

const REGION_BONES: Record<string, string[]> = {
  chest: [
    "Bip001 Spine1",
    "Bip001 Spine2",
    "Bip001 Spine",
    "mixamorig:Spine1",
    "mixamorig:Spine2",
  ],
  belly: ["Bip001 Spine", "Bip001 Pelvis", "mixamorig:Spine", "mixamorig:Hips"],
  arms: [
    "Bip001 L UpperArm",
    "Bip001 R UpperArm",
    "Bip001 L Forearm",
    "Bip001 R Forearm",
    "mixamorig:LeftArm",
    "mixamorig:RightArm",
  ],
  thighs: [
    "Bip001 L Thigh",
    "Bip001 R Thigh",
    "mixamorig:LeftUpLeg",
    "mixamorig:RightUpLeg",
  ],
  legs: [
    "Bip001 L Calf",
    "Bip001 R Calf",
    "Bip001 L Foot",
    "Bip001 R Foot",
    "mixamorig:LeftLeg",
    "mixamorig:RightLeg",
  ],
};

function readVariant(): SpaceVariantDoc | null {
  try {
    const raw = sessionStorage.getItem(VARIANT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SpaceVariantDoc;
  } catch {
    return null;
  }
}

function findBones(root: THREE.Object3D, names: string[]): THREE.Object3D[] {
  const want = new Set(names.map((n) => n.toLowerCase()));
  const hits: THREE.Object3D[] = [];
  root.traverse((o) => {
    if (o.name && want.has(o.name.toLowerCase())) hits.push(o);
  });
  for (const n of names) {
    const o = root.getObjectByName(n);
    if (o && !hits.includes(o)) hits.push(o);
  }
  return hits;
}

function applyRegions(
  model: THREE.Object3D,
  regions: SpaceVariantRegions,
): string[] {
  const applied: string[] = [];
  const overall = regions.overall?.scale ?? 1;
  if (!model.userData._spaceBaseScale) {
    model.userData._spaceBaseScale = model.scale.clone();
  }
  const base = model.userData._spaceBaseScale as THREE.Vector3;
  model.scale.set(base.x * overall, base.y * overall, base.z * overall);

  for (const [region, boneNames] of Object.entries(REGION_BONES)) {
    const s = (regions as Record<string, { scale?: number }>)[region]?.scale;
    if (s == null || s === 1) continue;
    const bones = findBones(model, boneNames);
    for (const bone of bones) {
      if (!bone.userData._spaceBaseScale) {
        bone.userData._spaceBaseScale = bone.scale.clone();
      }
      const b = bone.userData._spaceBaseScale as THREE.Vector3;
      if (region === "chest" || region === "belly") {
        bone.scale.set(b.x * s, b.y * Math.sqrt(s), b.z * s);
      } else {
        bone.scale.set(b.x * s, b.y * s, b.z * s);
      }
      applied.push(`${region}:${bone.name}=${s}`);
    }
  }
  return applied;
}

function applyTint(model: THREE.Object3D, hex: string): void {
  const tint = new THREE.Color(hex);
  model.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const mats = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    for (const m of mats) {
      const mat = m as THREE.MeshStandardMaterial;
      if (!mat.color) continue;
      if (!mat.userData._preSpaceColor) {
        mat.userData._preSpaceColor = mat.color.clone();
      }
      mat.color.copy(mat.userData._preSpaceColor).multiply(tint);
      mat.needsUpdate = true;
    }
  });
}

/** Simple collider wireframes parented under model (debug only). */
function applyColliderDebug(
  model: THREE.Object3D,
  defs: NonNullable<NonNullable<SpaceVariantDoc["colliders"]>["colliders"]>,
): THREE.Group {
  const g = new THREE.Group();
  g.name = "space_collider_debug";
  const scale = PLAYER_SCALE;
  for (const d of defs) {
    let mesh: THREE.Object3D;
    const mat = new THREE.MeshBasicMaterial({
      color: d.color ?? 0x44aaff,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
      depthTest: true,
    });
    if (d.shape === "sphere") {
      mesh = new THREE.Mesh(
        new THREE.SphereGeometry(d.radius * scale, 12, 10),
        mat,
      );
    } else if (d.shape === "box" && d.box) {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(
          d.box.x * 2 * scale,
          d.box.y * 2 * scale,
          d.box.z * 2 * scale,
        ),
        mat,
      );
    } else {
      const h = Math.max(d.height - d.radius * 2, 0.01) * scale;
      mesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(d.radius * scale, h, 4, 8),
        mat,
      );
    }
    mesh.position.set(
      d.offset.x * scale,
      d.offset.y * scale,
      d.offset.z * scale,
    );
    const deg = Math.PI / 180;
    mesh.rotation.set(
      d.rotation.x * deg,
      d.rotation.y * deg,
      d.rotation.z * deg,
    );
    g.add(mesh);
  }
  model.add(g);
  return g;
}

export interface ApplyResult {
  ok: boolean;
  reason?: string;
  regionsApplied?: string[];
  colliders?: number;
  colorVariantId?: string | null;
}

/**
 * Apply stored space variant to a Player-like object with `.model` or group.
 */
export function applySpaceVariantToPlayer(player: {
  model?: THREE.Object3D;
  group?: THREE.Object3D;
  character?: { id?: string };
}): ApplyResult {
  const doc = readVariant();
  if (!doc) return { ok: false, reason: "no grudge_space_variant" };

  const model =
    player.model ||
    (player.group &&
      player.group.children.find(
        (c) => (c as THREE.Object3D).type !== "Mesh" || true,
      )) ||
    player.group;
  // Prefer skinned root: first child of group is usually the character model
  let root: THREE.Object3D | null = player.model || null;
  if (!root && player.group) {
    root = player.group;
    // If group has character model as child named from race, use deepest skinned parent
    player.group.traverse((o) => {
      if (!root || root === player.group) {
        if ((o as THREE.SkinnedMesh).isSkinnedMesh && o.parent) {
          // keep walking — use group as apply root for regions on bones
        }
      }
    });
    root = player.group;
  }
  if (!root) return { ok: false, reason: "no model root" };

  // Optional race check
  const race = player.character?.id;
  if (doc.raceId && race && doc.raceId !== race) {
    console.warn(
      "[space-variant] race mismatch variant=",
      doc.raceId,
      "player=",
      race,
      "— applying anyway",
    );
  }

  const regions =
    doc.bodyRegions?.regions ||
    (doc as unknown as { regions?: SpaceVariantRegions }).regions;
  let regionsApplied: string[] = [];
  if (regions) {
    // Prefer applying on character model child if present
    const modelChild =
      player.model ||
      (player.group?.children.find((c) => c.children?.length) as
        | THREE.Object3D
        | undefined) ||
      root;
    regionsApplied = applyRegions(modelChild, regions);
  }

  // Tint from build colorTint if present
  try {
    const build = (
      window as unknown as { GrudgeBuild?: { colorTint?: string } }
    ).GrudgeBuild;
    if (build?.colorTint) applyTint(root, build.colorTint);
  } catch {
    /* */
  }

  let colliders = 0;
  const debug =
    typeof location !== "undefined" &&
    new URLSearchParams(location.search).get("spaceDebug") === "1";
  const defs = doc.colliders?.colliders;
  if (debug && defs?.length) {
    applyColliderDebug(root, defs);
    colliders = defs.length;
  }

  (window as unknown as { GrudgeSpaceVariantApplied?: ApplyResult }).GrudgeSpaceVariantApplied =
    {
      ok: true,
      regionsApplied,
      colliders,
      colorVariantId: doc.colorVariantId,
    };

  console.info(
    "[space-variant] applied regions=",
    regionsApplied.length,
    "collidersDebug=",
    colliders,
    "color=",
    doc.colorVariantId,
  );

  return {
    ok: true,
    regionsApplied,
    colliders,
    colorVariantId: doc.colorVariantId,
  };
}

/** Hook: call after grudge:player-ready */
export function installSpaceVariantHook(): void {
  const run = (ev?: Event) => {
    const detail = (ev as CustomEvent | undefined)?.detail;
    const player =
      detail?.player ||
      (window as unknown as { GrudgePlayer?: unknown }).GrudgePlayer;
    if (!player) return;
    try {
      applySpaceVariantToPlayer(
        player as {
          model?: THREE.Object3D;
          group?: THREE.Object3D;
          character?: { id?: string };
        },
      );
    } catch (e) {
      console.warn("[space-variant] apply failed", e);
    }
  };
  window.addEventListener("grudge:player-ready", run);
  // Late install
  if ((window as unknown as { GrudgePlayer?: unknown }).GrudgePlayer) run();
}

// Auto-install when imported from boot
installSpaceVariantHook();

export default applySpaceVariantToPlayer;
