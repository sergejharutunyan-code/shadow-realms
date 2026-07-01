'use client';

// ─────────────────────────────────────────────────────────────────
// Hero3DModel — a stylised low-poly fantasy "miniature" built from
// primitives. The body palette and weapon are driven by the hero's
// faction / class, and the hero's portrait is cropped to the head and
// mapped onto the face so each champion stays recognisable.
// Used inside battle-3d-scene as the upgraded figurine.
// ─────────────────────────────────────────────────────────────────

import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { BattleHero } from '@/lib/game-data';
import { getHeroImageUrl } from '@/lib/hero-images';

interface Palette { armor: string; trim: string; cloth: string; skin: string; }

const FACTION_BODY: Record<string, Palette> = {
  knight:    { armor: '#b9c2d0', trim: '#e8c15a', cloth: '#3b5ba5', skin: '#e2b48c' },
  undead:    { armor: '#8a8f7a', trim: '#9fb08a', cloth: '#33402f', skin: '#cfd8c0' },
  demon:     { armor: '#7a2530', trim: '#ff7a3c', cloth: '#2a1414', skin: '#b83a3a' },
  elf:       { armor: '#4f9a68', trim: '#cfe8a0', cloth: '#2f6f4f', skin: '#e6c9a8' },
  barbarian: { armor: '#9a6a44', trim: '#d0a050', cloth: '#5a3a24', skin: '#d8a878' },
  darkelf:   { armor: '#6b4a8f', trim: '#c090f0', cloth: '#2a1a3a', skin: '#c9b0d8' },
};

type Weapon = 'sword' | 'staff' | 'bow' | 'scythe' | 'claws';

function weaponFor(hero: BattleHero): Weapon {
  const s = `${hero.name} ${hero.skill1Name} ${hero.skill2Name} ${hero.skill3Name}`.toLowerCase();
  if (/archer|ranger|hunter|\bbow\b|arrow|eagle|volley|marks/.test(s)) return 'bow';
  if (/mage|sorc|necro|witch|warlock|wizard|arcane|frost|flame|spell|staff|conjur|elowen/.test(s)) return 'staff';
  if (hero.faction === 'undead') return 'scythe';
  if (hero.faction === 'demon') return 'claws';
  return 'sword';
}

// Crop the (3:4, head-at-top-centre) portrait down to the face region.
const FACE_CROP = { ox: 0.33, oy: 0.70, rw: 0.34, rh: 0.23 };

function Face({ url }: { url: string }) {
  const tex = useTexture(url);
  const cropped = useMemo(() => {
    const t = tex.clone();
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    t.repeat.set(FACE_CROP.rw, FACE_CROP.rh);
    t.offset.set(FACE_CROP.ox, FACE_CROP.oy);
    t.needsUpdate = true;
    return t;
  }, [tex]);
  return (
    <mesh position={[0, 0, 0.021]}>
      <planeGeometry args={[0.34, 0.4]} />
      <meshBasicMaterial map={cropped} toneMapped={false} transparent />
    </mesh>
  );
}

function WeaponMesh({ type, trim, element }: { type: Weapon; trim: string; element: string }) {
  switch (type) {
    case 'staff':
      return (
        <group>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.035, 1.3, 8]} />
            <meshStandardMaterial color="#5a3a1e" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.72, 0]}>
            <icosahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial color={element} emissive={element} emissiveIntensity={1.2} />
          </mesh>
        </group>
      );
    case 'bow':
      return (
        <group rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <torusGeometry args={[0.42, 0.03, 8, 20, Math.PI * 1.15]} />
            <meshStandardMaterial color="#6b3f1e" roughness={0.6} />
          </mesh>
        </group>
      );
    case 'scythe':
      return (
        <group>
          <mesh>
            <cylinderGeometry args={[0.035, 0.035, 1.35, 8]} />
            <meshStandardMaterial color="#2b2b2b" roughness={0.6} />
          </mesh>
          <mesh position={[0.28, 0.66, 0]} rotation={[0, 0, -1.0]}>
            <boxGeometry args={[0.55, 0.09, 0.04]} />
            <meshStandardMaterial color={trim} metalness={0.8} roughness={0.25} />
          </mesh>
        </group>
      );
    case 'claws':
      return (
        <group>
          {[-0.09, 0, 0.09].map((x, i) => (
            <mesh key={i} position={[x, 0.12, 0]} rotation={[0.3, 0, 0]}>
              <coneGeometry args={[0.03, 0.34, 6]} />
              <meshStandardMaterial color={trim} metalness={0.7} roughness={0.3} />
            </mesh>
          ))}
        </group>
      );
    case 'sword':
    default:
      return (
        <group>
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[0.08, 0.9, 0.02]} />
            <meshStandardMaterial color="#dfe6f0" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.32, 0.06, 0.06]} />
            <meshStandardMaterial color={trim} metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.16, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.28, 8]} />
            <meshStandardMaterial color="#5a3a1e" roughness={0.7} />
          </mesh>
        </group>
      );
  }
}

interface HeroModelProps {
  hero: BattleHero;
  isActive: boolean;
  facing: number; // +1 player (faces right), -1 enemy (faces left)
  rarityColor: string;
  elementColor: string;
}

export function Hero3DModel({ hero, isActive, facing, rarityColor, elementColor }: HeroModelProps) {
  const pal = FACTION_BODY[hero.faction] ?? FACTION_BODY.knight;
  const url = getHeroImageUrl(hero.templateId);
  const weapon = useMemo(() => weaponFor(hero), [hero.templateId]);
  const hasCape = hero.rarity === 'epic' || hero.rarity === 'legendary' || hero.rarity === 'mythic';

  const root = useRef<THREE.Group>(null);
  const armRef = useRef<THREE.Group>(null);
  const wasActive = useRef(false);
  const swingStart = useRef(-10);

  // Turn the model to a 3/4 view: angled toward the enemy AND the camera.
  const baseRotation = facing > 0 ? -0.6 : Math.PI + 0.6;

  useFrame((state) => {
    const now = state.clock.elapsedTime;
    if (root.current) {
      // Idle breathing sway.
      root.current.rotation.y = baseRotation + Math.sin(now * 1.2 + hero.currentHealth) * 0.05;
      root.current.position.y = Math.sin(now * 1.5 + hero.maxHealth) * 0.015;
    }
    if (isActive && !wasActive.current) swingStart.current = now;
    wasActive.current = isActive;
    if (armRef.current) {
      const t = (now - swingStart.current) / 0.5;
      let swing = -0.3; // ready pose
      if (t >= 0 && t <= 1) swing = -0.3 + Math.sin(t * Math.PI) * -2.1; // overhead chop
      armRef.current.rotation.x = swing;
    }
  });

  return (
    <group ref={root} rotation={[0, baseRotation, 0]}>
      {/* Legs */}
      <mesh position={[-0.15, 0.34, 0]} castShadow>
        <boxGeometry args={[0.2, 0.68, 0.22]} />
        <meshStandardMaterial color={pal.cloth} roughness={0.7} />
      </mesh>
      <mesh position={[0.15, 0.34, 0]} castShadow>
        <boxGeometry args={[0.2, 0.68, 0.22]} />
        <meshStandardMaterial color={pal.cloth} roughness={0.7} />
      </mesh>
      {/* Boots */}
      <mesh position={[-0.15, 0.06, 0.03]}><boxGeometry args={[0.22, 0.14, 0.3]} /><meshStandardMaterial color={pal.trim} metalness={0.5} roughness={0.4} /></mesh>
      <mesh position={[0.15, 0.06, 0.03]}><boxGeometry args={[0.22, 0.14, 0.3]} /><meshStandardMaterial color={pal.trim} metalness={0.5} roughness={0.4} /></mesh>

      {/* Torso */}
      <mesh position={[0, 1.02, 0]} castShadow>
        <cylinderGeometry args={[0.27, 0.34, 0.78, 12]} />
        <meshStandardMaterial color={pal.armor} metalness={0.55} roughness={0.4} />
      </mesh>
      {/* Chest emblem (rarity) */}
      <mesh position={[0, 1.12, 0.28]}>
        <circleGeometry args={[0.12, 20]} />
        <meshStandardMaterial color={rarityColor} emissive={rarityColor} emissiveIntensity={0.5} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Belt */}
      <mesh position={[0, 0.66, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.05, 8, 20]} />
        <meshStandardMaterial color={pal.trim} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Cape for high rarity */}
      {hasCape && (
        <mesh position={[0, 1.05, -0.26]} rotation={[0.18, 0, 0]}>
          <planeGeometry args={[0.72, 1.15]} />
          <meshStandardMaterial color={elementColor} side={THREE.DoubleSide} roughness={0.6} emissive={elementColor} emissiveIntensity={0.15} />
        </mesh>
      )}

      {/* Shoulders (pauldrons) */}
      <mesh position={[-0.36, 1.4, 0]} castShadow><sphereGeometry args={[0.19, 16, 16]} /><meshStandardMaterial color={pal.trim} metalness={0.75} roughness={0.3} /></mesh>
      <mesh position={[0.36, 1.4, 0]} castShadow><sphereGeometry args={[0.19, 16, 16]} /><meshStandardMaterial color={pal.trim} metalness={0.75} roughness={0.3} /></mesh>

      {/* Left arm (static) */}
      <group position={[-0.4, 1.32, 0]} rotation={[0.2, 0, 0.15]}>
        <mesh castShadow><boxGeometry args={[0.15, 0.62, 0.15]} /><meshStandardMaterial color={pal.armor} metalness={0.5} roughness={0.4} /></mesh>
        <mesh position={[0, -0.36, 0]}><sphereGeometry args={[0.08, 12, 12]} /><meshStandardMaterial color={pal.skin} roughness={0.6} /></mesh>
      </group>

      {/* Right arm (animated) + weapon */}
      <group ref={armRef} position={[0.4, 1.34, 0]}>
        <mesh position={[0, -0.28, 0]} castShadow><boxGeometry args={[0.15, 0.6, 0.15]} /><meshStandardMaterial color={pal.armor} metalness={0.5} roughness={0.4} /></mesh>
        <mesh position={[0, -0.56, 0.02]}><sphereGeometry args={[0.08, 12, 12]} /><meshStandardMaterial color={pal.skin} roughness={0.6} /></mesh>
        <group position={[0, -0.6, 0.12]} rotation={[1.1, 0, 0]}>
          <WeaponMesh type={weapon} trim={pal.trim} element={elementColor} />
        </group>
      </group>

      {/* Neck + Head */}
      <mesh position={[0, 1.5, 0]}><cylinderGeometry args={[0.09, 0.11, 0.12, 10]} /><meshStandardMaterial color={pal.skin} roughness={0.6} /></mesh>
      <group position={[0, 1.75, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.36, 0.4, 0.34]} />
          <meshStandardMaterial color={pal.skin} roughness={0.65} />
        </mesh>
        {/* Face = cropped portrait */}
        {url ? (
          <Suspense fallback={null}>
            <group position={[0, 0.01, 0.17]}>
              <Face url={url} />
            </group>
          </Suspense>
        ) : null}
        {/* Simple helm crown for metal factions */}
        <mesh position={[0, 0.22, 0]}><boxGeometry args={[0.38, 0.08, 0.36]} /><meshStandardMaterial color={pal.trim} metalness={0.7} roughness={0.3} /></mesh>
      </group>
    </group>
  );
}
