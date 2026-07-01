'use client';

// ─────────────────────────────────────────────────────────────────
// Hero3DModel — a premium 3D "collectible miniature" of the actual hero.
//
// The only true likeness of each champion is their portrait art, so the
// figurine showcases the full portrait on a gently curved, framed panel
// (a curved acrylic-standee look) mounted on a sculpted rarity pedestal
// with elemental ground glow and sparkles. This reads unmistakably as
// the specific hero while still being a lit, animated 3D object.
// ─────────────────────────────────────────────────────────────────

import { useFrame } from '@react-three/fiber';
import { useTexture, Sparkles } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { BattleHero } from '@/lib/game-data';
import { getHeroImageUrl } from '@/lib/hero-images';

// Curved-panel dimensions (portraits are ~3:4).
const R = 2.6;          // curve radius (large => gentle curve)
const THETA = 0.62;     // arc span (radians)
const H = 2.12;         // panel height
const Y = 1.28;         // panel centre height
const ARC_W = R * THETA;

function CurvedPortrait({ url, alive }: { url: string; alive: boolean }) {
  const tex = useTexture(url);
  const map = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }, [tex]);
  return (
    <group position={[0, Y, -R]}>
      {/* Rarity frame / backing (slightly larger, sits just behind) */}
      {/* Portrait panel */}
      <mesh>
        <cylinderGeometry args={[R, R, H, 64, 1, true, -THETA / 2, THETA]} />
        <meshStandardMaterial
          map={map}
          color={alive ? '#ffffff' : '#5a5a5a'}
          roughness={0.55}
          metalness={0.0}
          emissive={'#ffffff'}
          emissiveMap={map}
          emissiveIntensity={alive ? 0.35 : 0.1}
          side={THREE.FrontSide}
        />
      </mesh>
    </group>
  );
}

interface HeroModelProps {
  hero: BattleHero;
  isActive: boolean;
  facing: number;
  rarityColor: string;
  elementColor: string;
}

export function Hero3DModel({ hero, isActive, facing, rarityColor, elementColor }: HeroModelProps) {
  const url = getHeroImageUrl(hero.templateId);
  const inner = useRef<THREE.Group>(null);
  const wasActive = useRef(false);
  const lungeStart = useRef(-10);

  const yaw = facing > 0 ? 0.16 : -0.16; // slight turn toward centre

  useFrame((state) => {
    const now = state.clock.elapsedTime;
    if (isActive && !wasActive.current) lungeStart.current = now;
    wasActive.current = isActive;
    if (inner.current) {
      // Idle float + gentle sway.
      inner.current.position.y = Math.sin(now * 1.3 + hero.maxHealth) * 0.03;
      inner.current.rotation.z = Math.sin(now * 0.9 + hero.currentHealth) * 0.015;
      // Attack: quick forward tilt/step.
      const t = (now - lungeStart.current) / 0.5;
      inner.current.rotation.x = t >= 0 && t <= 1 ? Math.sin(t * Math.PI) * -0.28 : 0;
    }
  });

  return (
    <group rotation={[0, yaw, 0]}>
      {/* Sculpted pedestal */}
      <mesh position={[0, 0.09, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.04, 1.16, 0.18, 48]} />
        <meshStandardMaterial color="#15101f" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.24, 0]} castShadow>
        <cylinderGeometry args={[0.9, 1.0, 0.12, 48]} />
        <meshStandardMaterial color={rarityColor} emissive={rarityColor} emissiveIntensity={isActive ? 0.8 : 0.4} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.82, 0.86, 0.05, 48]} />
        <meshStandardMaterial color="#0d0a14" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Glowing rarity ring on the floor */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.28, 56]} />
        <meshBasicMaterial color={rarityColor} transparent opacity={isActive ? 0.6 : 0.28} side={THREE.DoubleSide} />
      </mesh>
      {/* Elemental ground glow */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.95, 40]} />
        <meshBasicMaterial color={elementColor} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* The hero figurine */}
      <group ref={inner}>
        {/* Rarity frame behind the portrait */}
        <mesh position={[0, Y, -R - 0.03]}>
          <cylinderGeometry args={[R, R, H + 0.16, 64, 1, true, -(THETA + 0.045) / 2, THETA + 0.045]} />
          <meshStandardMaterial
            color={rarityColor}
            emissive={rarityColor}
            emissiveIntensity={isActive ? 0.9 : 0.5}
            metalness={0.6}
            roughness={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>
        {url ? (
          <Suspense fallback={null}>
            <CurvedPortrait url={url} alive={hero.isAlive} />
          </Suspense>
        ) : (
          <mesh position={[0, Y, -R]}>
            <cylinderGeometry args={[R, R, H, 32, 1, true, -THETA / 2, THETA]} />
            <meshStandardMaterial color={rarityColor} side={THREE.FrontSide} />
          </mesh>
        )}

        {/* Elemental sparkles drifting around the figure */}
        <Sparkles count={14} scale={[ARC_W, H, 1.2]} position={[0, Y, 0.1]} size={2.2} speed={0.35} color={elementColor} opacity={0.5} />
      </group>
    </group>
  );
}
