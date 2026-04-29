import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Environment } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js";
import { useCharacterStore } from "@/hooks/useCharacterStore";
import { AnimationLoader } from "./AnimationLoader";
import type { RaceConfig } from "@/types/races";
import type { BoneNode } from "@/types/boneTree";
import { RACE_GEAR_PRESETS, type GearPreset } from "@/types/meshCatalog";
import { LOCOMOTION_ANIMS } from "@/types/animations";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface CharacterInnerProps {
  race: RaceConfig;
  textureUrl: string;
}

function CharacterInner({ race, textureUrl }: CharacterInnerProps) {
  const {
    currentAnim,
    hiddenMeshes,
    speed,
    showWireframe,
    showSkeleton,
    setMeshNames,
    setIsLoading,
    setLoadError,
    pendingExport,
    clearExport,
    setBoneTree,
    applyGearPreset,
    setCurrentAnim,
    animOverdrive,
    animArmSpace,
    animTrimStart,
    animTrimEnd,
    animMirror,
    animPaused,
    setAnimProgress,
    animScrubTo,
    setAnimScrubTo,
  } = useCharacterStore();

  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const skeletonRef = useRef<THREE.Skeleton | null>(null);
  const [modelObj, setModelObj] = useState<THREE.Group | null>(null);

  const armLRef = useRef<THREE.Bone | null>(null);
  const armRRef = useRef<THREE.Bone | null>(null);
  const _qArm = useRef(new THREE.Quaternion());
  const _vAxis = useRef(new THREE.Vector3(0, 0, 1));
  const mirrorPairsRef = useRef<[THREE.Bone, THREE.Bone][]>([]);
  const _qTmp = useRef(new THREE.Quaternion());
  const _frameIdx = useRef(0);

  // Load model when race changes
  useEffect(() => {
    if (!race?.modelUrl) return;

    setIsLoading(true);
    setModelObj(null);
    setBoneTree(null);
    mixerRef.current = null;
    skeletonRef.current = null;
    currentActionRef.current = null;

    let cancelled = false;
    const loader = new GLTFLoader();

    loader.load(
      race.modelUrl,
      (gltf) => {
        if (cancelled) return;

        const model = gltf.scene;
        const meshNames: string[] = [];
        let foundSkeleton: THREE.Skeleton | null = null;

        model.traverse((child) => {
          if (child instanceof THREE.SkinnedMesh || child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.name) meshNames.push(child.name);
            if (child instanceof THREE.SkinnedMesh && !foundSkeleton && child.skeleton) {
              foundSkeleton = child.skeleton;
            }
          }
        });

        // Face character toward camera
        model.rotation.y = Math.PI / 2;

        // Auto-fit to ~2-unit bounding box
        model.updateWorldMatrix(true, true);
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) model.scale.setScalar(2 / maxDim);

        // Sit model on y=0
        model.updateWorldMatrix(true, true);
        const box2 = new THREE.Box3().setFromObject(model);
        model.position.set(-center.x * model.scale.x, -box2.min.y, -center.z * model.scale.z);

        // Build bone hierarchy tree for the inspector
        const buildBoneNode = (node: THREE.Object3D): BoneNode => ({
          name: node.name,
          children: node.children
            .filter((c) => c instanceof THREE.Bone)
            .map((c) => buildBoneNode(c)),
        });
        const rootBones: THREE.Object3D[] = [];
        model.traverse((node) => {
          if (node instanceof THREE.Bone && !(node.parent instanceof THREE.Bone)) {
            rootBones.push(node);
          }
        });
        if (rootBones.length > 0) {
          const syntheticRoot: BoneNode = rootBones.length === 1 && rootBones[0]
            ? buildBoneNode(rootBones[0])
            : { name: "(skeleton)", children: rootBones.map(buildBoneNode) };
          setBoneTree(syntheticRoot);
        }

        const mixer = new THREE.AnimationMixer(model);
        mixer.addEventListener("finished", () => {
          useCharacterStore.getState().setAnimPaused(true);
          useCharacterStore.getState().setAnimProgress(100);
        });
        mixerRef.current = mixer;
        skeletonRef.current = foundSkeleton;
        setMeshNames(meshNames);
        setModelObj(model);
        setIsLoading(false);

        // Auto-apply unarmed gear preset on fresh model load
        const racePresets: GearPreset[] = RACE_GEAR_PRESETS[race.id] ?? [];
        const unarmedPreset = racePresets.find((p: GearPreset) => p.id === "unarmed");
        const firstLocomotion = LOCOMOTION_ANIMS[0];
        if (unarmedPreset) {
          applyGearPreset(unarmedPreset, meshNames);
          if (firstLocomotion) setCurrentAnim(firstLocomotion);
        }
      },
      undefined,
      (err) => {
        if (cancelled) return;
        setLoadError(`Failed to load model: ${err instanceof Error ? err.message : String(err)}`);
        setIsLoading(false);
      }
    );

    return () => { cancelled = true; };
  }, [race.modelUrl, race.id, setMeshNames, setIsLoading, setLoadError, setBoneTree, applyGearPreset, setCurrentAnim]);

  // Mesh visibility + wireframe
  useEffect(() => {
    if (!modelObj) return;
    modelObj.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.SkinnedMesh) {
        child.visible = !hiddenMeshes.has(child.name);
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m) => {
          (m as THREE.MeshStandardMaterial).wireframe = showWireframe;
        });
      }
    });
  }, [modelObj, hiddenMeshes, showWireframe]);

  // Locate arm-space and mirror bone pairs once the model is loaded
  useEffect(() => {
    armLRef.current = null;
    armRRef.current = null;
    mirrorPairsRef.current = [];
    if (!modelObj) return;

    const MIRROR_PAIRS: ReadonlyArray<readonly [string, string]> = [
      ["Bip001 L Clavicle",  "Bip001 R Clavicle"],
      ["Bip001 L UpperArm",  "Bip001 R UpperArm"],
      ["Bip001 L Forearm",   "Bip001 R Forearm"],
      ["Bip001 L Hand",      "Bip001 R Hand"],
      ["Bip001 L Thigh",     "Bip001 R Thigh"],
      ["Bip001 L Calf",      "Bip001 R Calf"],
      ["Bip001 L Foot",      "Bip001 R Foot"],
      ["Bip001 L Toe0",      "Bip001 R Toe0"],
    ];

    const boneMap = new Map<string, THREE.Bone>();
    modelObj.traverse((node) => {
      if (node instanceof THREE.Bone) boneMap.set(node.name, node as THREE.Bone);
    });

    armLRef.current = boneMap.get("Bip001 L UpperArm") ?? null;
    armRRef.current = boneMap.get("Bip001 R UpperArm") ?? null;

    mirrorPairsRef.current = MIRROR_PAIRS.flatMap(([l, r]) => {
      const bL = boneMap.get(l), bR = boneMap.get(r);
      return bL && bR ? [[bL, bR] as [THREE.Bone, THREE.Bone]] : [];
    });
  }, [modelObj]);

  // Overdrive: map 0-100 → 0.0-2.0× timeScale
  useEffect(() => {
    if (currentActionRef.current) {
      currentActionRef.current.timeScale = speed * (animOverdrive / 50);
    }
  }, [speed, animOverdrive]);

  // Pause / resume
  useEffect(() => {
    const action = currentActionRef.current;
    if (!action) return;
    if (animPaused) {
      action.paused = true;
    } else {
      const clip = action.getClip();
      const { animTrimStart: ts } = useCharacterStore.getState();
      const tStart = (ts / 100) * clip.duration;
      const atEnd = Math.abs(action.time - clip.duration) < 0.05;
      if (atEnd || action.time >= clip.duration * 0.99) {
        action.time = tStart;
        action.paused = false;
      } else {
        action.paused = false;
      }
    }
  }, [animPaused]);

  // Export
  useEffect(() => {
    if (!pendingExport || !modelObj) return;
    const baseName = `grudge_${race.id}`;

    if (pendingExport === "glb") {
      const exporter = new GLTFExporter();
      exporter.parse(
        modelObj,
        (result) => {
          const blob = new Blob([result as ArrayBuffer], { type: "model/gltf-binary" });
          downloadBlob(blob, `${baseName}.glb`);
          clearExport();
        },
        (err) => console.error("[Export] GLB export error:", err),
        { binary: true }
      );
    } else if (pendingExport === "obj") {
      const exporter = new OBJExporter();
      const obj = exporter.parse(modelObj);
      downloadBlob(new Blob([obj], { type: "text/plain" }), `${baseName}.obj`);
      clearExport();
    }
  }, [pendingExport, modelObj, race.id, clearExport]);

  useFrame((_, delta) => {
    if (mixerRef.current) mixerRef.current.update(delta);

    const action = currentActionRef.current;
    if (action) {
      const clip = action.getClip();
      const dur = clip.duration;

      // Scrub
      const scrubTarget = useCharacterStore.getState().animScrubTo;
      if (scrubTarget !== null && dur > 0) {
        action.time = Math.max(0, Math.min(dur, (scrubTarget / 100) * dur));
        mixerRef.current!.update(0);
        setAnimScrubTo(null);
      }

      // Trim
      if (dur > 0) {
        const tStart = (animTrimStart / 100) * dur;
        const tEnd   = (animTrimEnd   / 100) * dur;
        if (tEnd > tStart) {
          if (action.time < tStart) action.time = tStart;
          if (action.time >= tEnd && !action.paused) {
            action.time = tEnd;
            action.paused = true;
            useCharacterStore.getState().setAnimPaused(true);
            useCharacterStore.getState().setAnimProgress(100);
          }
        }
      }

      // Progress readback (~10 fps)
      _frameIdx.current++;
      if (_frameIdx.current % 6 === 0 && dur > 0) {
        setAnimProgress(Math.round((action.time / dur) * 100));
      }
    }

    // Mirror: swap L/R bone quaternions
    if (animMirror) {
      for (const [bL, bR] of mirrorPairsRef.current) {
        _qTmp.current.copy(bL.quaternion);
        bL.quaternion.set(-bR.quaternion.x, bR.quaternion.y, bR.quaternion.z, bR.quaternion.w);
        bR.quaternion.set(-_qTmp.current.x, _qTmp.current.y, _qTmp.current.z, _qTmp.current.w);
      }
    }

    // Arm-Space: additive Z offset on upper arms
    if (animArmSpace !== 50) {
      const offsetRad = THREE.MathUtils.degToRad((animArmSpace - 50) / 50 * 25);
      if (armLRef.current) {
        _qArm.current.setFromAxisAngle(_vAxis.current,  offsetRad);
        armLRef.current.quaternion.multiply(_qArm.current);
      }
      if (armRRef.current) {
        _qArm.current.setFromAxisAngle(_vAxis.current, -offsetRad);
        armRRef.current.quaternion.multiply(_qArm.current);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {modelObj && <primitive object={modelObj} />}
      {modelObj && showSkeleton && <skeletonHelper args={[modelObj]} />}
      {mixerRef.current && skeletonRef.current && (
        <AnimationLoader
          mixer={mixerRef.current}
          skeleton={skeletonRef.current}
          anim={currentAnim}
          speed={speed}
          currentActionRef={currentActionRef}
        />
      )}
    </group>
  );
}

export function Scene({ race, textureUrl }: { race: RaceConfig; textureUrl: string }) {
  const [webglFailed, setWebglFailed] = useState(false);

  if (webglFailed) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900 text-slate-400 flex-col gap-3 p-8">
        <div className="text-5xl">🖥️</div>
        <div className="text-lg font-semibold text-slate-300">WebGL not available</div>
        <p className="text-sm text-center max-w-sm">
          Your browser's WebGL context could not be created. Try opening in a new tab.
        </p>
      </div>
    );
  }

  return (
    <Canvas
      shadows="soft"
      camera={{ position: [0, 1.5, 4], fov: 50 }}
      style={{ background: "#1a1a2e" }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, failIfMajorPerformanceCaveat: false }}
      onCreated={({ gl }) => {
        if (!gl) setWebglFailed(true);
      }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          position={[5, 8, 5]}
          intensity={1.5}
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[-5, 3, -5]} intensity={0.5} color="#a0b4ff" />
        <pointLight position={[0, 3, 0]} intensity={0.3} color="#ff9060" />

        <CharacterInner race={race} textureUrl={textureUrl} />

        <Grid
          args={[20, 20]}
          position={[0, -0.01, 0]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#3a3a5c"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#6060aa"
          fadeDistance={15}
          fadeStrength={1}
        />

        <OrbitControls
          target={[0, 1, 0]}
          minDistance={1}
          maxDistance={10}
          enablePan={true}
        />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}
