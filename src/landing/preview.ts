// src/landing/preview.ts
//
// Vanilla three.js 3D character preview for the creator landing page.
// Loads a race GLB from the existing assets.grudge-studio.com CDN, applies
// the chosen skin variant as a `MeshLambertMaterial({ map, color: 0xffffff })`
// per the Character-Animator-Mapper `replit.md` spec, and exposes the
// EquipmentManager so the mainpanel postMessage bridge can flip mesh
// visibility live.
//
// The legacy `src/play/equipment-manager.js` IIFE attaches
// `window.GrudgeEquipmentManager` — we reuse it here verbatim so the in-creator
// preview stays in sync with the in-grass-scene Player class.
import {
  AmbientLight,
  AnimationMixer,
  Box3,
  Clock,
  Color,
  DirectionalLight,
  Group,
  Material,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShadowMaterial,
  SkinnedMesh,
  TextureLoader,
  Vector3,
  WebGLRenderer,
  type AnimationClip,
  type Texture,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { raceModelUrl, raceSkinUrl } from "@shared/config";

// EquipmentManager comes from `src/play/equipment-manager.js` (loaded as a
// classic IIFE on the parent landing page). We type the surface we use.
declare global {
  interface Window {
    GrudgeEquipmentManager: new (prefix: string) => GrudgeEquipmentManagerInstance;
    GrudgeCreator?: {
      preview: CharacterPreview | null;
      equipment: GrudgeEquipmentManagerInstance | null;
      model: Object3D | null;
    };
  }
}

export interface GrudgeEquipmentManagerInstance {
  catalog(root: Object3D): Record<string, string[]>;
  equip(slot: string, variant: string): boolean;
  unequip(slot: string): void;
  equipWeapon(slot: string, variant?: string): boolean;
  applyLoadout(loadout: Record<string, string | null>): string[];
  hasParts(): boolean;
  getParts(): Record<string, { visible: boolean; mesh: Mesh }>;
  togglePart(name: string, force?: boolean): boolean;
  getGroupedSlots(): Record<string, Record<string, { variants: string[]; equipped: string | null }>>;
  readonly meshCount: number;
}

// Per-race prefix used by EquipmentManager (mirrors src/play/player-config.js).
export const RACE_PREFIX: Record<string, string> = {
  human: "WK_",
  barbarian: "BRB_",
  elf: "ELF_",
  dwarf: "DWF_",
  orc: "ORC_",
  undead: "UD_",
};

// Race-specific scale to keep all characters at ~similar visual height.
const RACE_SCALE: Record<string, number> = {
  human: 0.0004,
  barbarian: 0.0004,
  elf: 0.0004,
  dwarf: 0.00035,
  orc: 0.00045,
  undead: 0.0004,
};

export interface CharacterPreviewOptions {
  canvas: HTMLCanvasElement;
  background?: string;
}

export class CharacterPreview {
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly renderer: WebGLRenderer;
  readonly controls: OrbitControls;
  readonly canvas: HTMLCanvasElement;
  readonly clock = new Clock();

  private _modelGroup = new Group();
  private _model: Object3D | null = null;
  private _equipment: GrudgeEquipmentManagerInstance | null = null;
  private _mixer: AnimationMixer | null = null;
  private _skinTexture: Texture | null = null;
  private _disposed = false;
  private _resizeObserver: ResizeObserver | null = null;

  constructor(opts: CharacterPreviewOptions) {
    this.canvas = opts.canvas;

    this.scene = new Scene();
    this.scene.background = new Color(opts.background ?? "#0a0705");

    this.camera = new PerspectiveCamera(40, 1, 0.05, 100);
    this.camera.position.set(0, 1.6, 4);

    this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target.set(0, 1, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 8;
    this.controls.maxPolarAngle = Math.PI * 0.49;

    this._setupLights();
    this._setupGround();
    this.scene.add(this._modelGroup);

    this._installResize();
    this._tick();
  }

  // ── Public API ──────────────────────────────────────────────────────────

  /** Returns the active EquipmentManager (after `loadRace`). */
  get equipment(): GrudgeEquipmentManagerInstance | null { return this._equipment; }

  get model(): Object3D | null { return this._model; }

  /** Load a race GLB + apply the chosen skin variant. Replaces the previous
   *  model. Returns once the model + texture are both ready. */
  async loadRace(raceId: string, skinVariant: string): Promise<void> {
    const prefix = RACE_PREFIX[raceId] ?? raceId.toUpperCase() + "_";
    const scale = RACE_SCALE[raceId] ?? 0.04;

    const [gltf, texture] = await Promise.all([
      this._loadGltf(raceModelUrl(raceId)),
      this._loadTexture(raceSkinUrl(raceId, skinVariant)),
    ]);

    this._disposeModel();
    const model = gltf.scene;
    model.scale.setScalar(scale);

    this._skinTexture = texture;
    this._applySkinTexture(model, texture);

    // Equipment cataloging — relies on window.GrudgeEquipmentManager from
    // src/play/equipment-manager.js (loaded as a classic IIFE on landing).
    if (typeof window !== "undefined" && window.GrudgeEquipmentManager) {
      this._equipment = new window.GrudgeEquipmentManager(prefix);
      this._equipment.catalog(model);
    } else {
      console.warn("[CharacterPreview] window.GrudgeEquipmentManager not loaded; equipment toggles disabled.");
      this._equipment = null;
    }

    // Center the model on the ground.
    const box = new Box3().setFromObject(model);
    const center = box.getCenter(new Vector3());
    model.position.x -= center.x;
    model.position.z -= center.z;
    model.position.y -= box.min.y; // sit on ground
    model.rotation.y = Math.PI; // face camera

    this._modelGroup.clear();
    this._modelGroup.add(model);
    this._model = model;

    // Set up the AnimationMixer for any clips embedded in the GLB.
    if (gltf.animations.length > 0) {
      this._mixer = new AnimationMixer(model);
      const clip = gltf.animations.find((a) => /idle/i.test(a.name)) ?? gltf.animations[0];
      if (clip) this._mixer.clipAction(clip).play();
    } else {
      this._mixer = null;
    }

    // Frame the camera on the new model.
    const size = box.getSize(new Vector3());
    const dist = Math.max(size.x, size.y, size.z) * 1.6 + 1.2;
    this.camera.position.set(dist * 0.5, size.y * 0.6, dist);
    this.controls.target.set(0, size.y * 0.5, 0);
    this.controls.update();

    if (window.GrudgeCreator) {
      window.GrudgeCreator.preview = this;
      window.GrudgeCreator.equipment = this._equipment;
      window.GrudgeCreator.model = model;
    } else {
      window.GrudgeCreator = { preview: this, equipment: this._equipment, model };
    }
  }

  /** Hot-swap the skin texture without reloading the GLB (per Character-
   *  Animator-Mapper `replit.md` "texture hot-swap" behaviour). */
  async setSkin(raceId: string, variant: string): Promise<void> {
    const tex = await this._loadTexture(raceSkinUrl(raceId, variant));
    this._skinTexture = tex;
    if (this._model) this._applySkinTexture(this._model, tex);
  }

  /** Apply a build's `equipped` map to the loaded model. */
  applyLoadout(equipped: Record<string, string | null>): void {
    if (!this._equipment) return;
    this._equipment.applyLoadout(equipped);
  }

  dispose(): void {
    this._disposed = true;
    this._resizeObserver?.disconnect();
    this._disposeModel();
    this.renderer.dispose();
    this.controls.dispose();
  }

  // ── Internals ───────────────────────────────────────────────────────────

  private _loadGltf(url: string): Promise<{ scene: Object3D; animations: AnimationClip[] }> {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      loader.load(
        url,
        (gltf) => resolve({ scene: gltf.scene, animations: gltf.animations }),
        undefined,
        reject,
      );
    });
  }

  private _loadTexture(url: string): Promise<Texture> {
    return new Promise((resolve, reject) => {
      const loader = new TextureLoader();
      loader.load(url, (tex) => {
        tex.flipY = false; // GLB convention
        resolve(tex);
      }, undefined, reject);
    });
  }

  /** Replace every mesh material with a flat-toon MeshLambertMaterial that
   *  reads from the shared skin texture. Mirrors the Character-Animator-Mapper
   *  `replit.md` material spec (`_Glossiness:0`, `_Metallic:0`, `_Color:white`). */
  private _applySkinTexture(root: Object3D, texture: Texture): void {
    root.traverse((o) => {
      if (!(o as Mesh).isMesh) return;
      const mesh = o as Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const isSkinned = (mesh as SkinnedMesh).isSkinnedMesh === true;
      const oldMat = mesh.material;
      const newMat = new MeshLambertMaterial({
        map: texture,
        color: 0xffffff,
        skinning: isSkinned,
      } as ConstructorParameters<typeof MeshLambertMaterial>[0] & { skinning?: boolean });
      mesh.material = newMat;
      // Dispose the old default material to reclaim GPU memory.
      this._disposeMaterial(oldMat);
    });
  }

  private _disposeMaterial(mat: Material | Material[]): void {
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
    else mat?.dispose?.();
  }

  private _disposeModel(): void {
    this._modelGroup.clear();
    this._mixer = null;
    this._model = null;
    this._equipment = null;
  }

  private _setupLights(): void {
    const ambient = new AmbientLight(0xffffff, 0.55);
    this.scene.add(ambient);
    const sun = new DirectionalLight(0xfff1d6, 1.1);
    sun.position.set(3, 6, 4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -3;
    sun.shadow.camera.right = 3;
    sun.shadow.camera.top = 3;
    sun.shadow.camera.bottom = -3;
    this.scene.add(sun);
  }

  private _setupGround(): void {
    const floor = new Mesh(
      new PlaneGeometry(20, 20),
      new ShadowMaterial({ opacity: 0.35 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  private _installResize(): void {
    const fit = () => {
      const rect = this.canvas.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    };
    fit();
    if (typeof ResizeObserver !== "undefined") {
      this._resizeObserver = new ResizeObserver(fit);
      this._resizeObserver.observe(this.canvas);
    } else {
      window.addEventListener("resize", fit);
    }
  }

  private _tick = (): void => {
    if (this._disposed) return;
    requestAnimationFrame(this._tick);
    const dt = this.clock.getDelta();
    this._mixer?.update(dt);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}
