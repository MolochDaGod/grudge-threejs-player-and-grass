/**
 * Visual helpers for Bip001 / Mixamo bones: root, hands, feet, weapon attach.
 * Unit-accurate markers (metres) for IK and collider authoring.
 */
import * as THREE from "three";

export type HelperKind =
  | "root"
  | "hand_r"
  | "hand_l"
  | "foot_r"
  | "foot_l"
  | "weapon"
  | "shield"
  | "head"
  | "hips";

/** Candidate bone names per role (Bip001 first, Mixamo second). */
export const BONE_CANDIDATES: Record<HelperKind, string[]> = {
  root: ["Bip001", "Armature", "Root", "mixamorig:Hips", "Hips"],
  hips: ["Bip001 Pelvis", "Bip001", "mixamorig:Hips", "Hips", "pelvis"],
  head: ["Bip001 Head", "mixamorig:Head", "Head"],
  hand_r: [
    "R_hand_container",
    "Bip001 R Hand",
    "mixamorig:RightHand",
    "RightHand",
    "hand_r",
  ],
  hand_l: [
    "L_hand_container",
    "Bip001 L Hand",
    "mixamorig:LeftHand",
    "LeftHand",
    "hand_l",
  ],
  foot_r: [
    "Bip001 R Foot",
    "Bip001 R Toe0",
    "mixamorig:RightFoot",
    "RightFoot",
    "foot_r",
  ],
  foot_l: [
    "Bip001 L Foot",
    "Bip001 L Toe0",
    "mixamorig:LeftFoot",
    "LeftFoot",
    "foot_l",
  ],
  weapon: [
    "R_hand_container",
    "Bip001 R Hand",
    "mixamorig:RightHand",
    "weapon_r",
  ],
  shield: [
    "L_shield_container",
    "L_hand_container",
    "Bip001 L Hand",
    "mixamorig:LeftHand",
  ],
};

export const HELPER_COLORS: Record<HelperKind, number> = {
  root: 0xffcc00,
  hips: 0xffaa00,
  head: 0x66ccff,
  hand_r: 0xff4466,
  hand_l: 0x44ff88,
  foot_r: 0xff8844,
  foot_l: 0x88ff44,
  weapon: 0xff2200,
  shield: 0x4488ff,
};

export interface BoneHit {
  kind: HelperKind;
  name: string;
  object: THREE.Object3D;
}

export function findBone(
  root: THREE.Object3D,
  kind: HelperKind,
): BoneHit | null {
  const names = BONE_CANDIDATES[kind];
  for (const n of names) {
    const o = root.getObjectByName(n);
    if (o) return { kind, name: n, object: o };
  }
  // Fuzzy: traverse case-insensitive contains
  const lower = names.map((n) => n.toLowerCase());
  let found: BoneHit | null = null;
  root.traverse((o) => {
    if (found || !o.name) return;
    const ln = o.name.toLowerCase();
    for (let i = 0; i < lower.length; i++) {
      if (ln === lower[i] || ln.endsWith(lower[i].replace(/^bip001\s*/, ""))) {
        found = { kind, name: o.name, object: o };
        return;
      }
    }
  });
  return found;
}

export function findAllRoleBones(root: THREE.Object3D): BoneHit[] {
  const kinds: HelperKind[] = [
    "root",
    "hips",
    "head",
    "hand_r",
    "hand_l",
    "foot_r",
    "foot_l",
    "weapon",
    "shield",
  ];
  const out: BoneHit[] = [];
  const seen = new Set<string>();
  for (const k of kinds) {
    const hit = findBone(root, k);
    if (hit && !seen.has(hit.object.uuid)) {
      seen.add(hit.object.uuid);
      out.push(hit);
    }
  }
  return out;
}

/**
 * Build a group of axis + sphere markers parented under each role bone.
 * `scale` is marker size in metres (default 0.08 m ≈ palm).
 */
export function createBoneHelperGroup(
  root: THREE.Object3D,
  opts: { scale?: number; kinds?: HelperKind[] } = {},
): THREE.Group {
  const markerScale = opts.scale ?? 0.08;
  const kinds =
    opts.kinds ||
    ([
      "root",
      "hips",
      "hand_r",
      "hand_l",
      "foot_r",
      "foot_l",
      "weapon",
      "shield",
      "head",
    ] as HelperKind[]);

  const group = new THREE.Group();
  group.name = "grudge_bone_helpers";
  group.userData.layer = "helpers";

  for (const kind of kinds) {
    const hit = findBone(root, kind);
    if (!hit) continue;

    const marker = new THREE.Group();
    marker.name = `helper_${kind}`;
    marker.userData.helperKind = kind;
    marker.userData.boneName = hit.name;

    const color = HELPER_COLORS[kind];
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(markerScale * 0.45, 12, 12),
      new THREE.MeshBasicMaterial({
        color,
        depthTest: false,
        transparent: true,
        opacity: 0.85,
      }),
    );
    sphere.renderOrder = 999;
    marker.add(sphere);

    const axes = new THREE.AxesHelper(markerScale * 2.2);
    (axes.material as THREE.Material).depthTest = false;
    axes.renderOrder = 1000;
    marker.add(axes);

    // Label plane (simple sprite via canvas)
    const label = makeLabelSprite(kind.toUpperCase(), color, markerScale * 4);
    label.position.y = markerScale * 1.4;
    marker.add(label);

    // Attach as child so it follows animation
    hit.object.add(marker);
    group.userData[`attach_${kind}`] = { parent: hit.object, marker };
  }

  // Keep a registry on the group for dispose
  group.userData.dispose = () => {
    for (const key of Object.keys(group.userData)) {
      if (!key.startsWith("attach_")) continue;
      const { parent, marker } = group.userData[key];
      if (parent && marker) parent.remove(marker);
      marker?.traverse((o: THREE.Object3D) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        if (m.material) {
          const mat = m.material as THREE.Material | THREE.Material[];
          if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
          else mat.dispose();
        }
      });
    }
  };

  return group;
}

function makeLabelSprite(
  text: string,
  color: number,
  size: number,
): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, 256, 64);
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.roundRect(8, 8, 240, 48, 8);
  ctx.fill();
  ctx.font = "bold 28px JetBrains Mono, monospace";
  ctx.fillStyle = "#" + color.toString(16).padStart(6, "0");
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 32);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({
    map: tex,
    depthTest: false,
    transparent: true,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(size, size * 0.25, 1);
  sprite.renderOrder = 1001;
  return sprite;
}

/** World-space positions of role bones (for collider placement / export). */
export function sampleBoneWorldPositions(
  root: THREE.Object3D,
): Record<string, { x: number; y: number; z: number; bone: string }> {
  const out: Record<
    string,
    { x: number; y: number; z: number; bone: string }
  > = {};
  const kinds: HelperKind[] = [
    "root",
    "hips",
    "head",
    "hand_r",
    "hand_l",
    "foot_r",
    "foot_l",
    "weapon",
    "shield",
  ];
  const v = new THREE.Vector3();
  for (const k of kinds) {
    const hit = findBone(root, k);
    if (!hit) continue;
    hit.object.getWorldPosition(v);
    out[k] = { x: v.x, y: v.y, z: v.z, bone: hit.name };
  }
  return out;
}
