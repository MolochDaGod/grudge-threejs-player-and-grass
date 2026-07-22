/**
 * Play bridge — exposes clean grass / terrain-layer APIs on window for the
 * pirate lobby and any sandbox tools. Pure Three.js (no Babylon).
 *
 * Loaded as a module from index.html after three is available via importmap.
 */
import * as THREE from "three";
import {
  getTerrainHeight,
  createGrassTerrain,
  createGrassMaterial,
  createNoise2D,
  GRASS_DEFAULTS,
} from "./grass-terrain.mjs";
import {
  createTerrainChunk,
  applyPirateLobbyAtmosphere,
} from "./terrain-layers.mjs";

const API = {
  THREE,
  getTerrainHeight,
  createGrassTerrain,
  createGrassMaterial,
  createNoise2D,
  createTerrainChunk,
  applyPirateLobbyAtmosphere,
  GRASS_DEFAULTS,
  /** World scale SSOT used by Player (script.js PLAYER_SCALE). */
  PLAYER_SCALE: 4.2,
  /** Auto-fit height = 1.8 m * PLAYER_SCALE. */
  TARGET_HEIGHT: 1.8 * 4.2,
  layers: {
    L0: "height_field",
    L1: "surface",
    L2: "vegetation",
    L3: "detail",
  },
  /**
   * Attach a three-layer island patch at world origin (debug / island spawn).
   * Prefer the bundled World chunk stream for production streaming.
   */
  spawnIslandChunk(scene, opts = {}) {
    if (!scene) return null;
    const chunk = createTerrainChunk({
      chunkX: opts.chunkX ?? 0,
      chunkZ: opts.chunkZ ?? 0,
      chunkSize: opts.chunkSize ?? GRASS_DEFAULTS.chunkSize,
      lowDetail: !!opts.lowDetail,
      scatter: opts.scatter !== false,
    });
    const cx = (opts.chunkX ?? 0) * (opts.chunkSize ?? GRASS_DEFAULTS.chunkSize);
    const cz = (opts.chunkZ ?? 0) * (opts.chunkSize ?? GRASS_DEFAULTS.chunkSize);
    chunk.position.set(cx, 0, cz);
    scene.add(chunk);
    return chunk;
  },
  /**
   * Tint scene for pirate open-world lobby (idempotent via userData flag).
   */
  ensurePirateLobby(scene) {
    if (!scene) return;
    if (scene.userData._pirateLobbyBridge) return;
    scene.userData._pirateLobbyBridge = true;
    applyPirateLobbyAtmosphere(scene, THREE);
  },
};

if (typeof window !== "undefined") {
  window.GrudgeGrass = API;
  window.GrudgeTerrainLayers = {
    createTerrainChunk,
    applyPirateLobbyAtmosphere,
    getTerrainHeight,
    GRASS_DEFAULTS,
  };
  // When world is ready, apply lobby atmosphere if in lobby mode
  const hook = () => {
    if (window.world && window.world.scene && document.body.classList.contains("cdg-lobby")) {
      API.ensurePirateLobby(window.world.scene);
    }
  };
  window.addEventListener("grudge:player-ready", hook);
  setTimeout(hook, 500);
  setTimeout(hook, 2000);
}

export default API;
export {
  getTerrainHeight,
  createGrassTerrain,
  createGrassMaterial,
  createTerrainChunk,
  applyPirateLobbyAtmosphere,
  GRASS_DEFAULTS,
};
