/**
 * Capsule / box collider helpers for body + weapon hit volumes.
 * Dimensions in metres (SI). Exportable JSON for combat runtime.
 */
import * as THREE from "three";
import { findBone, type HelperKind } from "./boneHelpers";

export type ColliderShape = "capsule" | "box" | "sphere";

export interface ColliderDef {
  id: string;
  role: HelperKind | "torso" | "weapon_blade";
  shape: ColliderShape;
  /** Half-height or full height for capsule (m). */
  height: number;
  /** Radius (m) for capsule/sphere; half-extent X for box. */
  radius: number;
  /** Box half-extents when shape=box (m). */
  box?: { x: number; y: number; z: number };
  /** Local offset from bone (m). */
  offset: { x: number; y: number; z: number };
  /** Local euler deg. */
  rotation: { x: number; y: number; z: number };
  color: number;
  bone?: string;
}

/** Default human-relative collider set (1.8 m adult). */
export function defaultCharacterColliders(): ColliderDef[] {
  return [
    {
      id: "body_capsule",
      role: "torso",
      shape: "capsule",
      height: 1.0,
      radius: 0.28,
      offset: { x: 0, y: 0.95, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      color: 0x44aaff,
    },
    {
      id: "head_sphere",
      role: "head",
      shape: "sphere",
      height: 0,
      radius: 0.14,
      offset: { x: 0, y: 0.12, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      color: 0x66ccff,
    },
    {
      id: "weapon_blade",
      role: "weapon_blade",
      shape: "box",
      height: 0.9,
      radius: 0.04,
      box: { x: 0.04, y: 0.45, z: 0.02 },
      offset: { x: 0, y: 0.45, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      color: 0xff3344,
    },
    {
      id: "foot_r",
      role: "foot_r",
      shape: "sphere",
      height: 0,
      radius: 0.1,
      offset: { x: 0, y: 0.05, z: 0.05 },
      rotation: { x: 0, y: 0, z: 0 },
      color: 0xff8844,
    },
    {
      id: "foot_l",
      role: "foot_l",
      shape: "sphere",
      height: 0,
      radius: 0.1,
      offset: { x: 0, y: 0.05, z: 0.05 },
      rotation: { x: 0, y: 0, z: 0 },
      color: 0x88ff44,
    },
  ];
}

export interface ColliderVisual {
  def: ColliderDef;
  mesh: THREE.Object3D;
  parent: THREE.Object3D | null;
}

function makeShapeMesh(def: ColliderDef): THREE.Object3D {
  const mat = new THREE.MeshBasicMaterial({
    color: def.color,
    wireframe: true,
    transparent: true,
    opacity: 0.85,
    depthTest: true,
  });
  let mesh: THREE.Object3D;
  if (def.shape === "sphere") {
    mesh = new THREE.Mesh(
      new THREE.SphereGeometry(def.radius, 16, 12),
      mat,
    );
  } else if (def.shape === "box") {
    const b = def.box || { x: def.radius, y: def.height * 0.5, z: def.radius };
    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(b.x * 2, b.y * 2, b.z * 2),
      mat,
    );
  } else {
    // Capsule: cylinder + two hemispheres along Y
    const h = Math.max(def.height - def.radius * 2, 0.01);
    const g = new THREE.CapsuleGeometry(def.radius, h, 6, 12);
    mesh = new THREE.Mesh(g, mat);
  }
  mesh.name = `collider_${def.id}`;
  mesh.userData.colliderId = def.id;
  return mesh;
}

/**
 * Attach collider meshes to bones (or root). Returns visuals + dispose.
 */
export function createColliderHelpers(
  root: THREE.Object3D,
  defs: ColliderDef[],
): { group: THREE.Group; visuals: ColliderVisual[]; dispose: () => void } {
  const group = new THREE.Group();
  group.name = "grudge_collider_helpers";
  const visuals: ColliderVisual[] = [];
  const deg = Math.PI / 180;

  for (const def of defs) {
    const mesh = makeShapeMesh(def);
    mesh.position.set(def.offset.x, def.offset.y, def.offset.z);
    mesh.rotation.set(
      def.rotation.x * deg,
      def.rotation.y * deg,
      def.rotation.z * deg,
    );

    let parent: THREE.Object3D | null = root;
    if (def.role === "weapon_blade" || def.role === "weapon") {
      const hit = findBone(root, "weapon");
      parent = hit?.object || root;
    } else if (def.role === "head") {
      parent = findBone(root, "head")?.object || root;
    } else if (def.role === "foot_r") {
      parent = findBone(root, "foot_r")?.object || root;
    } else if (def.role === "foot_l") {
      parent = findBone(root, "foot_l")?.object || root;
    } else if (def.role === "hand_r") {
      parent = findBone(root, "hand_r")?.object || root;
    } else if (def.role === "hand_l") {
      parent = findBone(root, "hand_l")?.object || root;
    } else if (def.role === "torso" || def.role === "hips") {
      parent = findBone(root, "hips")?.object || root;
    }

    // For torso when parent is hips, offset is local; when root, world-ish
    if (parent) {
      parent.add(mesh);
      def.bone = parent.name;
    } else {
      group.add(mesh);
    }
    visuals.push({ def, mesh, parent });
  }

  const dispose = () => {
    for (const v of visuals) {
      if (v.parent) v.parent.remove(v.mesh);
      else group.remove(v.mesh);
      v.mesh.traverse((o) => {
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

  return { group, visuals, dispose };
}

export function collidersToJSON(defs: ColliderDef[]) {
  return {
    unit: "metre",
    humanHeightM: 1.8,
    colliders: defs.map((d) => ({ ...d })),
  };
}
