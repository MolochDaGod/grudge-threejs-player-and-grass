/**
 * Capsule / box collider helpers for body + weapon hit volumes.
 * Dimensions in metres (SI). Exportable JSON for combat runtime.
 *
 * Production rules:
 *  - Body capsule from visible body-mesh AABB (not a free-floating hip guess).
 *  - Weapon blade box parents to the **visible weapon mesh** and matches its
 *    local geometry bounds — never a Y-offset stick on the hand that "swings
 *    down" when the hand bone axes are not blade-aligned.
 *  - Feet / head still bone-attached with short offsets.
 */
import * as THREE from "three";
import { findBone, type HelperKind } from "./boneHelpers";

export type ColliderShape = "capsule" | "box" | "sphere";

export interface ColliderDef {
  id: string;
  role: HelperKind | "torso" | "weapon_blade";
  shape: ColliderShape;
  /** Capsule cylinder height (excluding caps) or full span (m). */
  height: number;
  /** Radius (m) for capsule/sphere; half-extent X for box when box unset. */
  radius: number;
  /** Box half-extents when shape=box (m). */
  box?: { x: number; y: number; z: number };
  /** Local offset from attach parent (m). */
  offset: { x: number; y: number; z: number };
  /** Local euler deg. */
  rotation: { x: number; y: number; z: number };
  color: number;
  bone?: string;
  /** When set, attach to this mesh name (weapon mesh-fit). */
  attachMeshName?: string;
  /** How attach was resolved for export/debug. */
  attachMode?: "mesh" | "bone" | "root";
}

const WEAPON_MESH_RE =
  /sword|axe|hammer|staff|spear|dagger|knife|blade|mace|scyth|scythe|pick|wand|club/i;
const WEAPON_EXCLUDE_RE = /shield|quiver|bag|bow_arrow|arrow/i;
const BODY_EXCLUDE_RE =
  /sword|axe|hammer|staff|spear|dagger|shield|bow|quiver|bag|weapon|knife|blade|mace|pick|wand|club|scyth/i;

/** Default human-relative collider set (1.8 m adult) — placeholders until mesh-fit. */
export function defaultCharacterColliders(): ColliderDef[] {
  return [
    {
      id: "body_capsule",
      role: "torso",
      shape: "capsule",
      height: 1.0,
      radius: 0.28,
      offset: { x: 0, y: 0.9, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      color: 0x44aaff,
      attachMode: "root",
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
      attachMode: "bone",
    },
    {
      id: "weapon_blade",
      role: "weapon_blade",
      shape: "box",
      height: 0.9,
      radius: 0.04,
      box: { x: 0.03, y: 0.4, z: 0.02 },
      offset: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      color: 0xff3344,
      attachMode: "mesh",
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
      attachMode: "bone",
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
      attachMode: "bone",
    },
  ];
}

export interface ColliderVisual {
  def: ColliderDef;
  mesh: THREE.Object3D;
  parent: THREE.Object3D | null;
}

function isMesh(o: THREE.Object3D): o is THREE.Mesh {
  return (o as THREE.Mesh).isMesh === true;
}

/** Visible weapon meshes (kit pieces currently equipped). */
export function findVisibleWeaponMeshes(root: THREE.Object3D): THREE.Mesh[] {
  const out: THREE.Mesh[] = [];
  root.traverse((o) => {
    if (!isMesh(o) || !o.visible) return;
    const n = o.name || "";
    if (WEAPON_EXCLUDE_RE.test(n)) return;
    if (WEAPON_MESH_RE.test(n)) out.push(o);
  });
  // Prefer sword > axe > other
  out.sort((a, b) => {
    const score = (m: THREE.Mesh) =>
      /sword/i.test(m.name) ? 0 : /axe|hammer/i.test(m.name) ? 1 : 2;
    return score(a) - score(b);
  });
  return out;
}

/**
 * Rebuild body + weapon defs from actual mesh bounds (SI metres).
 * Preserves foot/head defs; overwrites body_capsule + weapon_blade.
 */
export function fitCollidersToMeshes(
  root: THREE.Object3D,
  existing?: ColliderDef[],
): ColliderDef[] {
  const base = existing?.length
    ? existing.map((d) => ({ ...d, box: d.box ? { ...d.box } : undefined }))
    : defaultCharacterColliders();

  // ── Body capsule from body-mesh AABB (world → root local) ──
  const bodyBox = new THREE.Box3();
  let bodyHits = 0;
  root.updateWorldMatrix(true, true);
  root.traverse((o) => {
    if (!isMesh(o) || !o.visible) return;
    if (BODY_EXCLUDE_RE.test(o.name || "")) return;
    // Skip pure helper objects
    if (o.name.startsWith("collider_") || o.name.startsWith("helper_")) return;
    bodyBox.expandByObject(o);
    bodyHits++;
  });

  if (bodyHits > 0 && !bodyBox.isEmpty()) {
    const size = bodyBox.getSize(new THREE.Vector3());
    const center = bodyBox.getCenter(new THREE.Vector3());
    root.worldToLocal(center);
    const radius = Math.max(
      0.12,
      Math.min(0.45, Math.max(size.x, size.z) * 0.28),
    );
    const height = Math.max(0.4, size.y - radius * 2);
    const body = base.find((d) => d.id === "body_capsule");
    if (body) {
      body.shape = "capsule";
      body.height = height;
      body.radius = radius;
      body.offset = { x: center.x, y: center.y, z: center.z };
      body.rotation = { x: 0, y: 0, z: 0 };
      body.attachMode = "root";
      body.attachMeshName = undefined;
      body.bone = root.name || "root";
    }
  }

  // ── Weapon blade: fit local geo bounds of visible weapon mesh ──
  const weapons = findVisibleWeaponMeshes(root);
  const weaponDef = base.find((d) => d.id === "weapon_blade");
  if (weaponDef) {
    if (weapons.length) {
      const mesh = weapons[0]!;
      const geo = mesh.geometry;
      if (geo) {
        if (!geo.boundingBox) geo.computeBoundingBox();
        const bb = geo.boundingBox;
        if (bb && !bb.isEmpty()) {
          // Geometry AABB is already in mesh-local space; parent as child so
          // mesh.scale applies once (do not pre-multiply).
          const size = bb.getSize(new THREE.Vector3());
          const center = bb.getCenter(new THREE.Vector3());
          weaponDef.shape = "box";
          weaponDef.box = {
            x: Math.max(0.008, size.x * 0.5),
            y: Math.max(0.02, size.y * 0.5),
            z: Math.max(0.008, size.z * 0.5),
          };
          weaponDef.radius = weaponDef.box.x;
          weaponDef.height = weaponDef.box.y * 2;
          weaponDef.offset = { x: center.x, y: center.y, z: center.z };
          weaponDef.rotation = { x: 0, y: 0, z: 0 };
          weaponDef.attachMeshName = mesh.name;
          weaponDef.attachMode = "mesh";
          weaponDef.bone = mesh.name;
        }
      }
    } else {
      // Fallback: hand bone, short forward blade (not long +Y stick)
      const hand = findBone(root, "weapon") || findBone(root, "hand_r");
      weaponDef.shape = "box";
      weaponDef.box = { x: 0.025, y: 0.05, z: 0.35 };
      weaponDef.offset = { x: 0, y: 0.02, z: 0.18 };
      weaponDef.rotation = { x: -15, y: 0, z: 0 };
      weaponDef.attachMeshName = undefined;
      weaponDef.attachMode = hand ? "bone" : "root";
      weaponDef.bone = hand?.name;
    }
  }

  return base;
}

function makeShapeMesh(def: ColliderDef): THREE.Object3D {
  const mat = new THREE.MeshBasicMaterial({
    color: def.color,
    wireframe: true,
    transparent: true,
    opacity: 0.9,
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
    const h = Math.max(def.height, 0.01);
    const g = new THREE.CapsuleGeometry(def.radius, h, 6, 12);
    mesh = new THREE.Mesh(g, mat);
  }
  mesh.name = `collider_${def.id}`;
  mesh.userData.colliderId = def.id;
  mesh.userData.layer = "helpers";
  return mesh;
}

function resolveParent(
  root: THREE.Object3D,
  def: ColliderDef,
): THREE.Object3D {
  if (def.attachMeshName) {
    const m = root.getObjectByName(def.attachMeshName);
    if (m) return m;
  }
  if (def.attachMode === "mesh" && def.role === "weapon_blade") {
    const w = findVisibleWeaponMeshes(root)[0];
    if (w) {
      def.attachMeshName = w.name;
      return w;
    }
  }
  if (def.role === "weapon_blade" || def.role === "weapon") {
    return (
      findBone(root, "weapon")?.object ||
      findBone(root, "hand_r")?.object ||
      root
    );
  }
  if (def.role === "head") {
    return findBone(root, "head")?.object || root;
  }
  if (def.role === "foot_r") {
    return findBone(root, "foot_r")?.object || root;
  }
  if (def.role === "foot_l") {
    return findBone(root, "foot_l")?.object || root;
  }
  if (def.role === "hand_r") {
    return findBone(root, "hand_r")?.object || root;
  }
  if (def.role === "hand_l") {
    return findBone(root, "hand_l")?.object || root;
  }
  // Body / torso: attach to model root so offset is SI world-stable after fit
  if (def.role === "torso" || def.role === "hips" || def.id === "body_capsule") {
    return root;
  }
  return root;
}

/**
 * Attach collider meshes to bones / weapon meshes. Returns visuals + dispose.
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

    const parent = resolveParent(root, def);
    parent.add(mesh);
    def.bone = parent.name;
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
    colliders: defs.map((d) => ({
      id: d.id,
      role: d.role,
      shape: d.shape,
      height: d.height,
      radius: d.radius,
      box: d.box,
      offset: d.offset,
      rotation: d.rotation,
      bone: d.bone,
      attachMeshName: d.attachMeshName,
      attachMode: d.attachMode,
    })),
  };
}
