/**
 * Minimal grudge6 equip: hide all kit parts, show default A armor + sword.
 * Mirrors EquipmentManager catalog visibility rules.
 */
import * as THREE from "three";

const WEAPON_RE =
  /axe|hammer|sword|pick|spear|bow|staff|shield|bag|wood|quiver/i;
const ARMOR_RE = /body|arms|legs|head|shoulder/i;

export function catalogAndDefaultEquip(
  root: THREE.Object3D,
  prefix = "",
): { meshes: string[]; equipped: string[] } {
  const meshes: THREE.Mesh[] = [];
  root.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
  });

  const equippable: THREE.Mesh[] = [];
  for (const m of meshes) {
    const name = m.name || "";
    const stripped =
      prefix && name.startsWith(prefix) ? name.slice(prefix.length) : name;
    if (WEAPON_RE.test(stripped) || ARMOR_RE.test(stripped) || /Units_/i.test(stripped)) {
      m.visible = false;
      equippable.push(m);
    }
  }

  const equipped: string[] = [];
  const prefer = [
    /body_a/i,
    /arms_a/i,
    /legs_a/i,
    /head_a/i,
    /sword_a/i,
    /shield_a/i,
  ];
  for (const re of prefer) {
    for (const m of equippable) {
      if (re.test(m.name) && !m.visible) {
        m.visible = true;
        equipped.push(m.name);
        break;
      }
    }
  }

  // If nothing matched, show first body-like mesh
  if (!equipped.length) {
    for (const m of equippable) {
      if (/body/i.test(m.name)) {
        m.visible = true;
        equipped.push(m.name);
        break;
      }
    }
  }

  return {
    meshes: equippable.map((m) => m.name),
    equipped,
  };
}

export function setMeshVisibility(
  root: THREE.Object3D,
  name: string,
  visible: boolean,
): boolean {
  let ok = false;
  root.traverse((o) => {
    if (o.name === name && (o as THREE.Mesh).isMesh) {
      o.visible = visible;
      ok = true;
    }
  });
  return ok;
}
