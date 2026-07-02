'use client';

// ─────────────────────────────────────────────────────────────────
// HeroGlbModel — renders a real 3D champion model (.glb).
//
// Any GLB dropped into public/models/ and mapped in hero-models.ts is
// automatically normalised: centred on the pedestal and uniformly
// scaled so the figure stands TARGET_HEIGHT tall regardless of how the
// source was authored. If the file ships animations, the first clip
// (or one named idle/Idle) plays as the idle loop. Lunge / hit-shake /
// death-topple animation is applied by the scene wrapper, so this
// component only has to stand there and look good.
// ─────────────────────────────────────────────────────────────────

import { useGLTF, useAnimations } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const TARGET_HEIGHT = 1.9; // matches the procedural figures

interface HeroGlbModelProps {
  url: string;
  facing: number; // +1 player side, -1 enemy side
  isActive: boolean;
  dead: boolean;
}

export function HeroGlbModel({ url, facing, isActive, dead }: HeroGlbModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(url);
  const { actions, names } = useAnimations(animations, group);

  // Clone per instance so the same hero can appear on both sides.
  const cloned = useMemo(() => scene.clone(true), [scene]);

  // Normalise: centre X/Z, feet on y=0, uniform-scale to TARGET_HEIGHT.
  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const s = size.y > 0 ? TARGET_HEIGHT / size.y : 1;
    return {
      scale: s,
      offset: new THREE.Vector3(-center.x * s, -box.min.y * s, -center.z * s),
    };
  }, [cloned]);

  // Idle animation if the GLB ships one.
  useEffect(() => {
    if (!names.length) return;
    const idleName = names.find(n => /idle/i.test(n)) ?? names[0];
    const action = actions[idleName];
    action?.reset().fadeIn(0.3).play();
    return () => { action?.fadeOut(0.2); };
  }, [actions, names]);

  // Dim the materials when dead (scene wrapper handles the topple).
  useEffect(() => {
    cloned.traverse(obj => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        const mat = m as THREE.MeshStandardMaterial;
        if ('color' in mat) mat.color.multiplyScalar(dead ? 0.35 : 1);
      }
    });
    return () => {
      cloned.traverse(obj => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of mats) {
          const mat = m as THREE.MeshStandardMaterial;
          if ('color' in mat && dead) mat.color.multiplyScalar(1 / 0.35);
        }
      });
    };
  }, [cloned, dead]);

  // 3/4 turn toward the enemy line + camera, like the procedural figures.
  const yaw = facing > 0 ? -0.5 : Math.PI + 0.5;

  return (
    <group ref={group} rotation={[0, yaw, 0]}>
      <primitive object={cloned} scale={scale} position={offset.toArray()} />
    </group>
  );
}
