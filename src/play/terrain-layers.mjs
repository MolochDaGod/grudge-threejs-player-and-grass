/**
 * Three-layer island terrain (Three.js only — no Babylon).
 *
 * Best practices for pirate open-world / home-island style maps:
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │ L0  HEIGHT FIELD (logic)                                    │
 * │     Continuous f(x,z) → y. Used by character ground snap,   │
 * │     camera, AI, and vegetation placement. NEVER diverge     │
 * │     grass placement height from controller height.          │
 * ├─────────────────────────────────────────────────────────────┤
 * │ L1  SURFACE / BEDROCK (visual mesh)                         │
 * │     Low-poly ground grid or heightfield mesh, dirt/sand/    │
 * │     rock materials, receives shadows. Optional collision.   │
 * ├─────────────────────────────────────────────────────────────┤
 * │ L2  VEGETATION (grass hills & meadows)                      │
 * │     Instanced GPU grass (grass-terrain.mjs). Density varies │
 * │     by biome mask (meadow vs path vs beach). Trails flatten │
 * │     blades under player feet.                               │
 * ├─────────────────────────────────────────────────────────────┤
 * │ L3  DETAIL SCATTER (optional)                               │
 * │     Rocks, driftwood, crates — few instances, not blades.   │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Island rule of thumb:
 *   - One height field SSOT for the whole island
 *   - Chunk streaming for L1+L2 (same chunk keys)
 *   - L2 LOD: drop instance count outside near ring
 *   - SI scale: 1 unit = 1 m relative to 1.8 m human (or locked world scale)
 */

import * as THREE from "three";
import {
  getTerrainHeight,
  createGrassTerrain,
  createNoise2D,
  GRASS_DEFAULTS,
} from "./grass-terrain.mjs";

export { getTerrainHeight, createGrassTerrain, GRASS_DEFAULTS };

/**
 * Build a complete three-layer terrain chunk for pirate / open-world lobby.
 *
 * @param {object} opts
 * @param {number} opts.chunkX
 * @param {number} opts.chunkZ
 * @param {number} [opts.chunkSize=120]
 * @param {boolean} [opts.lowDetail=false]
 * @param {THREE.Texture} [opts.bladeDiffuse]
 * @param {THREE.Texture} [opts.bladeAlpha]
 * @param {THREE.Texture} [opts.groundMap]
 * @returns {THREE.Group} root with layers L1 surface + L2 grass (+ L3 scatter)
 */
export function createTerrainChunk(opts = {}) {
  const chunkX = opts.chunkX ?? 0;
  const chunkZ = opts.chunkZ ?? 0;
  const chunkSize = opts.chunkSize ?? GRASS_DEFAULTS.chunkSize;
  const low = !!opts.lowDetail;
  const noise = opts.noise2D || createNoise2D(chunkX * 17 + chunkZ * 31);

  const root = new THREE.Group();
  root.name = `terrain_layers_${chunkX}_${chunkZ}`;
  root.userData.chunkX = chunkX;
  root.userData.chunkZ = chunkZ;
  root.userData.layers = {};

  // ── L1 Surface mesh (height-sampled grid) ──────────────────────────
  const segs = low ? 24 : 48;
  const surfaceGeo = new THREE.PlaneGeometry(chunkSize, chunkSize, segs, segs);
  surfaceGeo.rotateX(-Math.PI / 2);
  const pos = surfaceGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const lx = pos.getX(i);
    const lz = pos.getZ(i);
    const y = getTerrainHeight(lx, lz, chunkX, chunkZ, chunkSize, noise);
    pos.setY(i, y);
  }
  pos.needsUpdate = true;
  surfaceGeo.computeVertexNormals();

  const surfaceMat = new THREE.MeshStandardMaterial({
    color: 0x3d5c28,
    roughness: 0.92,
    metalness: 0.05,
    map: opts.groundMap || null,
    flatShading: false,
  });
  if (surfaceMat.map) {
    surfaceMat.map.wrapS = surfaceMat.map.wrapT = THREE.RepeatWrapping;
    surfaceMat.map.repeat.set(8, 8);
    surfaceMat.map.colorSpace = THREE.SRGBColorSpace;
  }
  const surface = new THREE.Mesh(surfaceGeo, surfaceMat);
  surface.name = "layer_surface";
  surface.receiveShadow = true;
  surface.userData.layer = "surface";
  root.add(surface);
  root.userData.layers.surface = surface;

  // ── L2 Vegetation (grass) ──────────────────────────────────────────
  const instances = low ? GRASS_DEFAULTS.instancesLow : GRASS_DEFAULTS.instancesHigh;
  const grass = createGrassTerrain(
    { bW: GRASS_DEFAULTS.bladeWidth, bH: GRASS_DEFAULTS.bladeHeight },
    chunkSize,
    instances,
    opts.bladeDiffuse || null,
    opts.bladeAlpha || null,
    chunkX,
    chunkZ,
    chunkSize,
    noise,
  );
  grass.name = "layer_vegetation";
  root.add(grass);
  root.userData.layers.vegetation = grass;
  root.userData.grassMaterial = grass.userData.grassMaterial;
  root.userData.trailArray = grass.userData.trailArray;
  root.userData.trailDirArray = grass.userData.trailDirArray;
  root.userData.offsetsArray = grass.userData.offsetsArray;
  root.userData.trailAttribute = grass.userData.trailAttribute;
  root.userData.trailDirAttribute = grass.userData.trailDirAttribute;

  // ── L3 Detail scatter (rocks / debris on hills) ────────────────────
  if (!low && opts.scatter !== false) {
    const scatter = new THREE.Group();
    scatter.name = "layer_detail";
    scatter.userData.layer = "detail";
    const rockGeo = new THREE.DodecahedronGeometry(0.35, 0);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x6a655c,
      roughness: 0.95,
      metalness: 0.05,
    });
    const count = 18;
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * chunkSize * 0.9;
      const z = (Math.random() - 0.5) * chunkSize * 0.9;
      const y = getTerrainHeight(x, z, chunkX, chunkZ, chunkSize, noise);
      // Prefer hills (higher y) for rocks
      if (y < 2.5 && Math.random() > 0.35) continue;
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(x, y + 0.15, z);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      const s = 0.5 + Math.random() * 1.4;
      rock.scale.setScalar(s);
      rock.castShadow = true;
      rock.receiveShadow = true;
      scatter.add(rock);
    }
    root.add(scatter);
    root.userData.layers.detail = scatter;
  }

  root.tick = (elapsed) => {
    if (grass.tick) grass.tick(elapsed);
  };

  root.userData.terrainWidth = chunkSize;
  root.userData.getHeight = (lx, lz) =>
    getTerrainHeight(lx, lz, chunkX, chunkZ, chunkSize, noise);

  return root;
}

/**
 * Pirate open-world lobby feel: slightly warmer fog + sea-level bias.
 * Call once on the scene after world boots.
 */
export function applyPirateLobbyAtmosphere(scene, THREE_NS = THREE) {
  scene.background = new THREE_NS.Color(0x87b5d4);
  scene.fog = new THREE_NS.Fog(0x9ec4d8, 80, 280);
  // Ambient ocean light
  const hemi = new THREE_NS.HemisphereLight(0xc8e8ff, 0x3a4a20, 0.55);
  hemi.name = "pirate_hemi";
  scene.add(hemi);
  return hemi;
}
