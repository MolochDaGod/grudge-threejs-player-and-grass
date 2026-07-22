/**
 * Grudge GLTF Space — in-repo multi-asset GLTF/GLB/FBX workspace.
 *
 * Inspired by free browser tooling (gltfspace.com) but **not** a copy of
 * HyperLoot proprietary code (that site is free-to-use, not open-source).
 * Built with Three.js r182 + OrbitControls + GLTFLoader/FBXLoader.
 *
 * Grudge extras:
 *  - SI unit grid + 1.8 m human yardstick
 *  - Bone helpers: root, hands, feet, weapon / shield
 *  - Capsule/box colliders for body + weapon IK
 *  - Body region scales: chest, arms, belly, thighs, legs
 *  - grudge6 race kits + high-contrast color variants
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  RACES,
  getRace,
  getVariants,
  HUMAN_HEIGHT_M,
  type RaceId,
  type ColorVariant,
} from "./grudge6/races";
import {
  createBoneHelperGroup,
  sampleBoneWorldPositions,
  findAllRoleBones,
} from "./helpers/boneHelpers";
import {
  createColliderHelpers,
  defaultCharacterColliders,
  collidersToJSON,
  type ColliderDef,
} from "./helpers/colliderHelpers";
import {
  applyBodyRegions,
  defaultRegions,
  fitToHumanHeight,
  measureHeightM,
  regionsToJSON,
  type RegionMap,
  type BodyRegion,
} from "./helpers/bodyRegions";
import { applyColorVariant, applyTextureMap, resetColorVariant } from "./materials";
import { catalogAndDefaultEquip } from "./equip";

export interface AssetEntry {
  id: string;
  name: string;
  root: THREE.Group;
  model: THREE.Object3D;
  mixer: THREE.AnimationMixer | null;
  clips: THREE.AnimationClip[];
  actions: Map<string, THREE.AnimationAction>;
  raceId?: RaceId;
  prefix?: string;
  boneHelper?: THREE.Group;
  colliderDispose?: () => void;
  colliderDefs: ColliderDef[];
  regions: RegionMap;
  colorVariantId?: string;
  fitted: boolean;
}

export class GrudgeGltfSpace {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  clock = new THREE.Clock();
  assets: AssetEntry[] = [];
  activeId: string | null = null;
  gltfLoader: GLTFLoader;
  fbxLoader: FBXLoader;
  texLoader = new THREE.TextureLoader();
  grid: THREE.GridHelper;
  humanRef: THREE.Group;
  showBones = true;
  showColliders = true;
  private _animFrame = 0;
  private _onChange: (() => void) | null = null;

  constructor(canvasHost: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvasHost.clientWidth, canvasHost.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    canvasHost.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b1220);
    this.scene.fog = new THREE.Fog(0x0b1220, 20, 80);

    this.camera = new THREE.PerspectiveCamera(
      50,
      canvasHost.clientWidth / Math.max(canvasHost.clientHeight, 1),
      0.05,
      200,
    );
    this.camera.position.set(2.2, 1.6, 3.4);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0.9, 0);
    this.controls.enableDamping = true;
    this.controls.maxPolarAngle = Math.PI * 0.49;

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(
      new RoomEnvironment(),
      0.04,
    ).texture;

    const hemi = new THREE.HemisphereLight(0xc8d8ff, 0x2a2018, 0.55);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff2dd, 1.15);
    sun.position.set(4, 8, 3);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    this.scene.add(sun);

    // 1 m grid, 10 m extent — SI yardstick
    this.grid = new THREE.GridHelper(10, 10, 0x3a4a6a, 0x1a2438);
    this.grid.position.y = 0.001;
    this.scene.add(this.grid);

    this.humanRef = this._makeHumanYardstick();
    this.scene.add(this.humanRef);

    const draco = new DRACOLoader();
    draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(draco);
    this.fbxLoader = new FBXLoader();

    window.addEventListener("resize", () => this.resize(canvasHost));
    this._loop();
  }

  onChange(cb: () => void) {
    this._onChange = cb;
  }

  private _notify() {
    this._onChange?.();
  }

  private _makeHumanYardstick(): THREE.Group {
    const g = new THREE.Group();
    g.name = "human_1.8m_yardstick";
    const mat = new THREE.MeshBasicMaterial({
      color: 0x4a90d9,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });
    // Capsule approx 1.8 m tall, 0.45 m wide
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.22, 1.2, 4, 8),
      mat,
    );
    body.position.y = 0.9;
    g.add(body);
    const label = this._sprite("1.8 m HUMAN", 0x4a90d9);
    label.position.set(0.55, 1.8, 0);
    g.add(label);
    g.position.x = -1.4;
    return g;
  }

  private _sprite(text: string, color: number): THREE.Sprite {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 64;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, 256, 64);
    ctx.font = "bold 22px monospace";
    ctx.fillStyle = "#" + color.toString(16).padStart(6, "0");
    ctx.textAlign = "center";
    ctx.fillText(text, 128, 38);
    const tex = new THREE.CanvasTexture(c);
    const sp = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, depthTest: false }),
    );
    sp.scale.set(0.9, 0.22, 1);
    return sp;
  }

  resize(host: HTMLElement) {
    const w = host.clientWidth;
    const h = Math.max(host.clientHeight, 1);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  get active(): AssetEntry | null {
    return this.assets.find((a) => a.id === this.activeId) || null;
  }

  setActive(id: string) {
    this.activeId = id;
    const a = this.active;
    if (a) {
      const box = new THREE.Box3().setFromObject(a.root);
      const c = box.getCenter(new THREE.Vector3());
      this.controls.target.lerp(c, 0.5);
    }
    this._notify();
  }

  async openFile(file: File): Promise<AssetEntry> {
    const url = URL.createObjectURL(file);
    try {
      return await this.openUrl(url, file.name);
    } finally {
      // keep blob alive while scene holds textures — revoke later on remove
      (this as unknown as { _blobs: string[] })._blobs =
        (this as unknown as { _blobs?: string[] })._blobs || [];
      (this as unknown as { _blobs: string[] })._blobs.push(url);
    }
  }

  async openUrl(url: string, name?: string): Promise<AssetEntry> {
    const lower = (name || url).toLowerCase();
    let model: THREE.Object3D;
    let clips: THREE.AnimationClip[] = [];

    if (lower.endsWith(".fbx")) {
      const fbx = await this.fbxLoader.loadAsync(url);
      model = fbx;
      clips = fbx.animations || [];
    } else {
      const gltf = await this.gltfLoader.loadAsync(url);
      model = gltf.scene;
      clips = gltf.animations || [];
    }

    return this._registerAsset(model, clips, name || url.split("/").pop() || "asset");
  }

  async openRace(raceId: RaceId): Promise<AssetEntry> {
    const race = getRace(raceId);
    if (!race) throw new Error("Unknown race " + raceId);
    const entry = await this.openUrl(race.url, race.label);
    entry.raceId = raceId;
    entry.prefix = race.prefix;

    // Texture atlas
    try {
      const tex = await this.texLoader.loadAsync(race.texture);
      applyTextureMap(entry.model, tex);
    } catch {
      /* offline / missing skin */
    }

    catalogAndDefaultEquip(entry.model, race.prefix);
    this.fitActiveToHuman();
    this.refreshHelpers();
    this._notify();
    return entry;
  }

  private _registerAsset(
    model: THREE.Object3D,
    clips: THREE.AnimationClip[],
    name: string,
  ): AssetEntry {
    const root = new THREE.Group();
    root.name = "asset_" + name;
    root.add(model);
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });

    // Stagger multiple models along X
    root.position.x = this.assets.length * 1.6;
    this.scene.add(root);

    const mixer = clips.length ? new THREE.AnimationMixer(model) : null;
    const actions = new Map<string, THREE.AnimationAction>();
    if (mixer) {
      for (const clip of clips) {
        actions.set(clip.name, mixer.clipAction(clip));
      }
    }

    const entry: AssetEntry = {
      id: "a_" + Date.now() + "_" + Math.floor(Math.random() * 1e5),
      name,
      root,
      model,
      mixer,
      clips,
      actions,
      colliderDefs: defaultCharacterColliders(),
      regions: defaultRegions(),
      fitted: false,
    };
    this.assets.push(entry);
    this.activeId = entry.id;
    this.refreshHelpers();
    this._frameCameraOn(entry);
    this._notify();
    return entry;
  }

  private _frameCameraOn(entry: AssetEntry) {
    const box = new THREE.Box3().setFromObject(entry.root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.5);
    this.controls.target.copy(center);
    this.camera.position.set(
      center.x + maxDim * 1.4,
      center.y + maxDim * 0.6,
      center.z + maxDim * 1.6,
    );
    this.controls.update();
  }

  fitActiveToHuman(target = HUMAN_HEIGHT_M) {
    const a = this.active;
    if (!a) return 1;
    const f = fitToHumanHeight(a.model, target);
    a.fitted = true;
    a.regions = defaultRegions();
    this.refreshHelpers();
    this._notify();
    return f;
  }

  setRegion(region: BodyRegion, scale: number) {
    const a = this.active;
    if (!a) return;
    a.regions[region].scale = scale;
    applyBodyRegions(a.model, a.regions);
    this._notify();
  }

  setRegions(regions: Partial<RegionMap>) {
    const a = this.active;
    if (!a) return;
    for (const k of Object.keys(regions) as BodyRegion[]) {
      if (regions[k]) a.regions[k] = regions[k]!;
    }
    applyBodyRegions(a.model, a.regions);
    this._notify();
  }

  applyVariant(variant: ColorVariant) {
    const a = this.active;
    if (!a) return;
    applyColorVariant(a.model, variant);
    a.colorVariantId = variant.id;
    this._notify();
  }

  resetVariant() {
    const a = this.active;
    if (!a) return;
    resetColorVariant(a.model);
    a.colorVariantId = undefined;
    this._notify();
  }

  playClip(name: string, loop = true) {
    const a = this.active;
    if (!a?.mixer) return;
    a.actions.forEach((act) => act.stop());
    const act = a.actions.get(name);
    if (!act) return;
    act.reset();
    act.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    act.clampWhenFinished = !loop;
    act.play();
  }

  stopAnims() {
    const a = this.active;
    if (!a) return;
    a.actions.forEach((act) => act.stop());
  }

  setShowBones(v: boolean) {
    this.showBones = v;
    this.refreshHelpers();
  }

  setShowColliders(v: boolean) {
    this.showColliders = v;
    this.refreshHelpers();
  }

  updateCollider(id: string, patch: Partial<ColliderDef>) {
    const a = this.active;
    if (!a) return;
    const d = a.colliderDefs.find((c) => c.id === id);
    if (!d) return;
    Object.assign(d, patch);
    this.refreshHelpers();
    this._notify();
  }

  refreshHelpers() {
    for (const a of this.assets) {
      if (a.boneHelper?.userData.dispose) a.boneHelper.userData.dispose();
      a.boneHelper = undefined;
      if (a.colliderDispose) a.colliderDispose();
      a.colliderDispose = undefined;

      if (this.showBones) {
        a.boneHelper = createBoneHelperGroup(a.model, { scale: 0.07 });
      }
      if (this.showColliders) {
        const { dispose } = createColliderHelpers(a.model, a.colliderDefs);
        a.colliderDispose = dispose;
      }
    }
    this._notify();
  }

  removeActive() {
    const a = this.active;
    if (!a) return;
    if (a.boneHelper?.userData.dispose) a.boneHelper.userData.dispose();
    if (a.colliderDispose) a.colliderDispose();
    this.scene.remove(a.root);
    this.assets = this.assets.filter((x) => x.id !== a.id);
    this.activeId = this.assets[0]?.id ?? null;
    this._notify();
  }

  /** Full variant payload for download / sessionStorage / /play handoff. */
  exportVariantJSON() {
    const a = this.active;
    if (!a) return null;
    const height = measureHeightM(a.model);
    const bones = sampleBoneWorldPositions(a.model);
    const roles = findAllRoleBones(a.model).map((b) => ({
      kind: b.kind,
      bone: b.name,
    }));
    return {
      schemaVersion: 1,
      tool: "grudge-gltf-space",
      unit: "metre",
      humanHeightM: HUMAN_HEIGHT_M,
      asset: a.name,
      raceId: a.raceId || null,
      colorVariantId: a.colorVariantId || null,
      fitted: a.fitted,
      measuredHeightM: height,
      bodyRegions: regionsToJSON(a.regions, height),
      colliders: collidersToJSON(a.colliderDefs),
      bones,
      boneRoles: roles,
      rootTransform: {
        position: a.root.position.toArray(),
        rotation: [
          a.root.rotation.x,
          a.root.rotation.y,
          a.root.rotation.z,
        ],
        scale: a.root.scale.toArray(),
      },
    };
  }

  /** Stamp sessionStorage for /play lobby. */
  sendToPlay() {
    const a = this.active;
    if (!a?.raceId) {
      alert("Load a grudge6 race kit first (Race strip), then Send to Play.");
      return;
    }
    const variant = a.colorVariantId
      ? getVariants(a.raceId).find((v) => v.id === a.colorVariantId)
      : null;
    const build = {
      schemaVersion: 1,
      raceId: a.raceId,
      classId: "custom_space",
      skinVariant: "default",
      colorVariantId: a.colorVariantId || null,
      colorTint: variant?.tint || null,
      animationPack: "sword_shield",
      gearPresetId: "knight",
      equipped: {
        body: "A",
        arms: "A",
        legs: "A",
        head: "A",
        sword: "A",
        shield: "A",
      },
      bodyRegions: a.regions,
      colliders: a.colliderDefs,
      lobby: "pirate_open_world",
      worldScale: 4.2,
      targetHeight: 1.8 * 4.2,
      source: "space",
      spaceExport: this.exportVariantJSON(),
    };
    try {
      sessionStorage.setItem("grudge_active_build", JSON.stringify(build));
      sessionStorage.setItem(
        "grudge_space_variant",
        JSON.stringify(this.exportVariantJSON()),
      );
    } catch {
      /* */
    }
    window.location.href = `/play?char=${encodeURIComponent(a.raceId)}&lobby=1`;
  }

  private _loop = () => {
    this._animFrame = requestAnimationFrame(this._loop);
    const dt = Math.min(this.clock.getDelta(), 0.1);
    for (const a of this.assets) {
      if (a.mixer) a.mixer.update(dt);
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    cancelAnimationFrame(this._animFrame);
    this.renderer.dispose();
  }
}

export { RACES, getVariants, HUMAN_HEIGHT_M };
export type { RaceId, ColorVariant, BodyRegion, RegionMap, ColliderDef };
