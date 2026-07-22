/**
 * Unit-accurate body region scale for grudge6 kits.
 *
 * Regions map to Bip001 bone scale (local axes) so chest/arms/belly/thighs/legs
 * can be tuned in metres-relative factors without re-authoring meshes.
 *
 * SI: scale 1.0 = authored size. Display delta ≈ metres when applied on a
 * ~1.8 m human (e.g. chest 1.1 ≈ +~3–5 cm bulk depending on bind pose).
 */
import * as THREE from "three";
import { findBone } from "./boneHelpers";

export type BodyRegion =
  | "chest"
  | "arms"
  | "belly"
  | "thighs"
  | "legs"
  | "overall";

export interface RegionState {
  /** Uniform scale factor (1 = default). Range typically 0.75–1.35. */
  scale: number;
}

export type RegionMap = Record<BodyRegion, RegionState>;

export function defaultRegions(): RegionMap {
  return {
    chest: { scale: 1 },
    arms: { scale: 1 },
    belly: { scale: 1 },
    thighs: { scale: 1 },
    legs: { scale: 1 },
    overall: { scale: 1 },
  };
}

/** Bones influenced by each region (first match wins per bone). */
const REGION_BONES: Record<Exclude<BodyRegion, "overall">, string[]> = {
  chest: [
    "Bip001 Spine1",
    "Bip001 Spine2",
    "Bip001 Spine",
    "mixamorig:Spine1",
    "mixamorig:Spine2",
    "mixamorig:Spine",
  ],
  belly: ["Bip001 Spine", "Bip001 Pelvis", "mixamorig:Spine", "mixamorig:Hips"],
  arms: [
    "Bip001 L UpperArm",
    "Bip001 R UpperArm",
    "Bip001 L Forearm",
    "Bip001 R Forearm",
    "mixamorig:LeftArm",
    "mixamorig:RightArm",
    "mixamorig:LeftForeArm",
    "mixamorig:RightForeArm",
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

function findByNames(
  root: THREE.Object3D,
  names: string[],
): THREE.Object3D[] {
  const hits: THREE.Object3D[] = [];
  const want = new Set(names.map((n) => n.toLowerCase()));
  root.traverse((o) => {
    if (o.name && want.has(o.name.toLowerCase())) hits.push(o);
  });
  // Also try getObjectByName for exact
  for (const n of names) {
    const o = root.getObjectByName(n);
    if (o && !hits.includes(o)) hits.push(o);
  }
  return hits;
}

export interface RegionApplyResult {
  applied: { region: string; bone: string; scale: number }[];
  missing: string[];
}

/**
 * Apply region scales onto bones. Stores original scale in userData once.
 * overall multiplies the whole model root.
 */
export function applyBodyRegions(
  modelRoot: THREE.Object3D,
  regions: RegionMap,
): RegionApplyResult {
  const applied: RegionApplyResult["applied"] = [];
  const missing: string[] = [];

  // Overall on model root
  if (!modelRoot.userData._regionBaseScale) {
    modelRoot.userData._regionBaseScale = modelRoot.scale.clone();
  }
  const base = modelRoot.userData._regionBaseScale as THREE.Vector3;
  const o = regions.overall.scale;
  modelRoot.scale.set(base.x * o, base.y * o, base.z * o);

  const regionKeys: Exclude<BodyRegion, "overall">[] = [
    "chest",
    "arms",
    "belly",
    "thighs",
    "legs",
  ];

  for (const region of regionKeys) {
    const s = regions[region].scale;
    const bones = findByNames(modelRoot, REGION_BONES[region]);
    if (!bones.length) {
      missing.push(region);
      continue;
    }
    for (const bone of bones) {
      if (!bone.userData._regionBaseScale) {
        bone.userData._regionBaseScale = bone.scale.clone();
      }
      const b = bone.userData._regionBaseScale as THREE.Vector3;
      // Prefer radial bulk on XZ for torso-ish, uniform for limbs
      if (region === "chest" || region === "belly") {
        bone.scale.set(b.x * s, b.y * Math.sqrt(s), b.z * s);
      } else {
        bone.scale.set(b.x * s, b.y * s, b.z * s);
      }
      applied.push({ region, bone: bone.name, scale: s });
    }
  }

  return { applied, missing };
}

/** Approximate height in metres after overall scale (from bbox). */
export function measureHeightM(root: THREE.Object3D): number {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  return size.y;
}

/**
 * Fit model so height ≈ targetHeightM (default 1.8). Returns scale factor used.
 * Call before body-region edits; stores base.
 */
export function fitToHumanHeight(
  root: THREE.Object3D,
  targetHeightM = 1.8,
): number {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  if (size.y < 1e-4) return 1;
  const factor = targetHeightM / size.y;
  root.scale.multiplyScalar(factor);
  // Ground feet
  const box2 = new THREE.Box3().setFromObject(root);
  root.position.y -= box2.min.y;
  root.userData._regionBaseScale = root.scale.clone();
  root.userData._fittedHeightM = targetHeightM;
  return factor;
}

/** Export region state + measured height for variant JSON. */
export function regionsToJSON(
  regions: RegionMap,
  measuredHeightM: number,
) {
  return {
    unit: "metre",
    humanHeightM: 1.8,
    measuredHeightM,
    regions: { ...regions },
    note: "scale 1.0 = fitted bind; adjust 0.75–1.35 for bulk variants",
  };
}

/** Ensure hips exist (sanity for IK). */
export function hasHips(root: THREE.Object3D): boolean {
  return !!findBone(root, "hips");
}
