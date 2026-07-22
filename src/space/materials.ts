/**
 * Apply grudge6 color variants / texture to a loaded kit.
 */
import * as THREE from "three";
import type { ColorVariant } from "./grudge6/races";

export function applyColorVariant(
  root: THREE.Object3D,
  variant: ColorVariant,
): void {
  const tint = new THREE.Color(variant.tint);
  const emissive = variant.emissive
    ? new THREE.Color(variant.emissive)
    : new THREE.Color(0x000000);
  const ei = variant.emissiveIntensity ?? 0;
  const metal = variant.metalness;
  const rough = variant.roughness;

  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const mats = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    for (const m of mats) {
      const mat = m as THREE.MeshStandardMaterial;
      if (!mat.color) continue;
      if (!mat.userData._baseColor) {
        mat.userData._baseColor = mat.color.clone();
      }
      const base = mat.userData._baseColor as THREE.Color;
      mat.color.copy(base).multiply(tint);
      if ("emissive" in mat) {
        mat.emissive.copy(emissive);
        mat.emissiveIntensity = ei;
      }
      if (typeof metal === "number" && "metalness" in mat) mat.metalness = metal;
      if (typeof rough === "number" && "roughness" in mat) mat.roughness = rough;
      if ("vertexColors" in mat && mat.vertexColors) mat.vertexColors = false;
      mat.needsUpdate = true;
    }
  });
}

export function applyTextureMap(
  root: THREE.Object3D,
  texture: THREE.Texture,
): void {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.anisotropy = 8;
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const mats = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    for (const m of mats) {
      const mat = m as THREE.MeshStandardMaterial;
      if (!("map" in mat)) continue;
      mat.map = texture;
      if (mat.vertexColors) mat.vertexColors = false;
      mat.needsUpdate = true;
    }
  });
}

export function resetColorVariant(root: THREE.Object3D): void {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const mats = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    for (const m of mats) {
      const mat = m as THREE.MeshStandardMaterial;
      if (mat.userData._baseColor) {
        mat.color.copy(mat.userData._baseColor);
      }
      if ("emissive" in mat) {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
      mat.needsUpdate = true;
    }
  });
}
