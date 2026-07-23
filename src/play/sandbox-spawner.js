// src/sandbox-spawner.js
//
// Garry's Mod-style multi-character spawner for the Grudge grass scene.
// The bundled script.js owns the world / player / renderer; this module
// piggy-backs on `window.world.scene` and `window.world._getTerrainHeightAtWorld`
// so additional Bip001 race characters can be dropped into the same scene
// without touching the bundle.
//
// Models are loaded via the importmap-three FBX/GLB loaders (the same
// instances the boot module hands to script.js as window.THREE_FBXLoader /
// window.THREE_GLTFLoader). Each spawn gets its own AnimationMixer playing
// the Idle clip from FALLBACK_BUNDLE (Mixamo Soldier.glb), retargeted onto
// Bip001 via SkeletonUtils.retargetClip when available.
export function createGrudgeSandbox(THREE, loaders, opts) {
  const cfg = typeof window !== "undefined" ? window.GrudgePlayerConfig : null;
  const FBXLoaderCtor = loaders.FBX;
  const GLTFLoaderCtor = loaders.GLTF;
  const SkeletonUtils = loaders.SkeletonUtils;
  // Optional shared DRACOLoader instance — required for ObjectStore GLBs
  // (Barbarian.glb, Knight.glb, Ranger.glb, Rogue_Hooded.glb, soldier.glb,
  // Mage.glb) which all use KHR_draco_mesh_compression.
  const dracoLoader = loaders.DRACO || null;
  const getScene = opts.getScene;
  const getTerrainY = opts.getTerrainY || (() => 0);
  const getPlayerPos = opts.getPlayerPos || (() => new THREE.Vector3());
  const playerScale =
    typeof opts.playerScale === "number" ? opts.playerScale : 1;

  function _newGltfLoader() {
    const l = new GLTFLoaderCtor();
    if (dracoLoader && typeof l.setDRACOLoader === "function") {
      l.setDRACOLoader(dracoLoader);
    }
    return l;
  }

  const spawned = []; // { id, group, mixer, character, equipment, idleAction }
  let _idleClip = null; // raw Mixamo idle clip (cached)
  let _idleClipPromise = null;

  function _loadIdleClipOnce() {
    if (_idleClip) return Promise.resolve(_idleClip);
    if (_idleClipPromise) return _idleClipPromise;
    if (!cfg || !cfg.FALLBACK_BUNDLE || !cfg.FALLBACK_BUNDLE.urls[0]) {
      return Promise.resolve(null);
    }
    const loader = _newGltfLoader();
    _idleClipPromise = new Promise((resolve) => {
      loader.load(
        cfg.FALLBACK_BUNDLE.urls[0],
        (gltf) => {
          const clip =
            (gltf.animations || []).find((c) => /idle/i.test(c.name)) || null;
          _idleClip = clip;
          resolve(clip);
        },
        undefined,
        () => resolve(null),
      );
    });
    return _idleClipPromise;
  }

  function _loadModel(url) {
    const isFBX = /\.fbx(\?|$)/i.test(url);
    if (isFBX) {
      const loader = new FBXLoaderCtor();
      return new Promise((resolve, reject) => {
        loader.load(
          url,
          (root) => resolve({ scene: root, animations: root.animations || [] }),
          undefined,
          reject,
        );
      });
    }
    const loader = _newGltfLoader();
    return new Promise((resolve, reject) => {
      loader.load(url, (gltf) => resolve(gltf), undefined, reject);
    });
  }

  function _bipSkinned(root) {
    let found = null;
    root.traverse((o) => {
      if (!found && o.isSkinnedMesh) found = o;
    });
    return found;
  }

  function _retargetIdle(clip, target) {
    if (!SkeletonUtils || !SkeletonUtils.retargetClip || !clip) return clip;
    const targetSkinned = _bipSkinned(target);
    if (!targetSkinned) return clip;
    try {
      return SkeletonUtils.retargetClip(targetSkinned, targetSkinned, clip, {
        hip: "Bip001 Pelvis",
        names: cfg && cfg.BIP001_BONE_MAP ? cfg.BIP001_BONE_MAP : {},
        useFirstFramePosition: true,
      });
    } catch (e) {
      return clip;
    }
  }

  function spawnCharacter(characterId, options) {
    options = options || {};
    const character =
      cfg && cfg.getCharacter ? cfg.getCharacter(characterId) : null;
    if (!character)
      return Promise.reject(new Error("Unknown character: " + characterId));
    const scene = getScene();
    if (!scene) return Promise.reject(new Error("Scene not ready"));
    // ObjectStore swap: when `useStore` is set and the character has a
    // CDN entry, load the DRACO-compressed KayKit GLB instead of the
    // local Toon_RTS FBX.
    const useStore = !!options.useStore && character.objectStore;
    const url = useStore ? character.objectStore.url : character.url;
    const charScale =
      useStore && character.objectStore.scale
        ? character.objectStore.scale
        : character.scale || 1;
    return _loadModel(url).then(async (gltf) => {
      const model = gltf.scene;
      const group = new THREE.Group();
      // Use the character-defined scale directly, same as the main Player.
      group.scale.setScalar(charScale);
      // Place near the player by default, with a small ring offset.
      const pp = getPlayerPos();
      const angle =
        options.angle != null ? options.angle : Math.random() * Math.PI * 2;
      const radius = options.radius != null ? options.radius : 3 * playerScale;
      const px = pp.x + Math.cos(angle) * radius;
      const pz = pp.z + Math.sin(angle) * radius;
      const py = getTerrainY(px, pz) + (character.yOffset || 0);
      group.position.set(px, py, pz);
      group.add(model);
      scene.add(group);

      // Catalog equipment via the shared classic-script manager so the
      // sandbox UI can mutate spawned NPCs the same way it mutates the
      // primary player.
      let equipment = null;
      if (character.rigType === "bip001" && window.GrudgeEquipmentManager) {
        try {
          equipment = new window.GrudgeEquipmentManager(character.prefix || "");
          equipment.catalog(model);
        } catch (e) {
          equipment = null;
        }
      }
      if (equipment && options.preset) {
        const preset =
          cfg && cfg.getLoadoutPreset
            ? cfg.getLoadoutPreset(options.preset)
            : null;
        if (preset) equipment.applyLoadout(preset.loadout);
      }

      // Idle animation via Mixamo->Bip001 retarget.
      const mixer = new THREE.AnimationMixer(model);
      let idleAction = null;
      const raw = await _loadIdleClipOnce();
      if (raw) {
        const retargeted = _retargetIdle(raw, model);
        if (retargeted) {
          idleAction = mixer.clipAction(retargeted);
          idleAction.play();
        }
      }

      const entry = {
        id: "spawn_" + Date.now() + "_" + Math.floor(Math.random() * 1e6),
        group,
        mixer,
        character,
        equipment,
        idleAction,
      };
      spawned.push(entry);
      return entry;
    });
  }

  function removeAll() {
    const scene = getScene();
    while (spawned.length) {
      const e = spawned.pop();
      if (scene && e.group.parent === scene) scene.remove(e.group);
      if (e.mixer) e.mixer.stopAllAction();
    }
  }

  function update(dt) {
    for (let i = 0; i < spawned.length; i++) {
      const e = spawned[i];
      if (e.mixer) e.mixer.update(dt);
    }
  }

  return {
    spawnCharacter,
    removeAll,
    update,
    get spawned() {
      return spawned.slice();
    },
  };
}
