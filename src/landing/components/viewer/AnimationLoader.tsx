import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useCharacterStore } from "@/hooks/useCharacterStore";
import type { AnimationClip as AppAnimClip } from "@/types/animations";

interface AnimationLoaderProps {
  mixer: THREE.AnimationMixer | null;
  skeleton: THREE.Skeleton | null;
  anim: AppAnimClip;
  speed: number;
  currentActionRef: React.MutableRefObject<THREE.AnimationAction | null>;
}

export function AnimationLoader({
  mixer,
  skeleton,
  anim,
  speed,
  currentActionRef,
}: AnimationLoaderProps) {
  const { setLoadError, setAnimFrameCount, setClipMeta } = useCharacterStore();
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!mixer || !skeleton) return;

    cancelledRef.current = false;
    const loader = new GLTFLoader();

    loader.load(
      anim.file,
      (gltf) => {
        if (cancelledRef.current) return;

        const sourceClip = gltf.animations[0];
        if (!sourceClip) {
          setLoadError(`No animation data in: ${anim.name}`);
          return;
        }

        setClipMeta(anim.file, { duration: sourceClip.duration });

        console.log(
          `[AnimLoader] "${anim.name}" — ${sourceClip.tracks.length} tracks, ` +
          `${sourceClip.duration.toFixed(2)}s`
        );

        // Frame-count estimate from densest keyframe track
        const maxKeys = sourceClip.tracks.reduce(
          (m, t) => Math.max(m, t.times.length),
          0
        );
        setAnimFrameCount(
          maxKeys > 1 ? maxKeys : Math.round(sourceClip.duration * 30)
        );

        const { animOverdrive } = useCharacterStore.getState();
        const action = mixer.clipAction(sourceClip);
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
        action.timeScale = speed * (animOverdrive / 50);

        if (currentActionRef.current && currentActionRef.current !== action) {
          currentActionRef.current.fadeOut(0.25);
          action.reset().fadeIn(0.25).play();
        } else {
          action.reset().play();
        }

        console.log(
          `[AnimLoader] ✓ Playing "${anim.name}" ` +
          `timeScale=${action.timeScale.toFixed(2)}`
        );
        currentActionRef.current = action;
        setLoadError(null);
      },
      undefined,
      (err) => {
        if (!cancelledRef.current) {
          setLoadError(`Failed to load: ${anim.name}`);
          console.error("[AnimLoader] Load error:", err);
        }
      }
    );

    return () => {
      cancelledRef.current = true;
    };
  }, [mixer, skeleton, anim, speed, currentActionRef, setLoadError, setAnimFrameCount, setClipMeta]);

  return null;
}
