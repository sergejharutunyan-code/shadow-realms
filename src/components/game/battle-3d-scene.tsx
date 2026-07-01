'use client';

// ─────────────────────────────────────────────────────────────────
// 3D Battle Scene
// Renders each hero as a billboarded portrait "figurine" standing on a
// rarity-coloured pedestal in a lit 3D arena. Attack lunges, hit
// reactions, death falls and elemental particle bursts are all derived
// from the existing turn-based battle state (no new game logic).
// Runs fully client-side (WebGL) so it works offline inside the
// Capacitor Android WebView.
// ─────────────────────────────────────────────────────────────────

import { Canvas, useFrame } from '@react-three/fiber';
import { Billboard, Image as DreiImage, ContactShadows, Sparkles } from '@react-three/drei';
import { Suspense, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { BattleHero, BattleState } from '@/lib/game-data';
import { getHeroImageUrl } from '@/lib/hero-images';

// Hex colours for WebGL (the game's config stores tailwind class names).
const RARITY_HEX: Record<string, string> = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
  mythic: '#ef4444',
};

const ELEMENT_HEX: Record<string, string> = {
  fire: '#ef4444',
  water: '#22d3ee',
  earth: '#f59e0b',
  dark: '#a855f7',
  light: '#fde047',
  void: '#f472b6',
};

const EASE = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic

// ─── A single hero figurine ──────────────────────────────────────
interface FigurineProps {
  hero: BattleHero;
  position: [number, number, number];
  facing: number; // +1 = faces enemies to the right, -1 = faces left
  isActive: boolean; // currently taking its turn
}

function Figurine({ hero, position, facing, isActive }: FigurineProps) {
  const group = useRef<THREE.Group>(null);
  const url = getHeroImageUrl(hero.templateId);
  const rarityColor = RARITY_HEX[hero.rarity] ?? '#9ca3af';
  const elementColor = ELEMENT_HEX[hero.element] ?? '#a855f7';

  // Animation bookkeeping kept in refs so it survives re-renders.
  const lungeStart = useRef(-10);
  const wasActive = useRef(false);
  const prevHp = useRef(hero.currentHealth);
  const hitStart = useRef(-10);
  const deathProgress = useRef(0);
  const [burst, setBurst] = useState(0); // remount key for the hit ring

  const hpPercent = hero.maxHealth > 0
    ? Math.max(0, Math.min(1, hero.currentHealth / hero.maxHealth))
    : 0;

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const now = state.clock.elapsedTime;

    // Trigger a lunge when this hero becomes the active attacker.
    if (isActive && !wasActive.current) lungeStart.current = now;
    wasActive.current = isActive;

    // Detect incoming damage → hit reaction + particle burst.
    if (hero.currentHealth < prevHp.current) {
      hitStart.current = now;
      setBurst((b) => b + 1);
    }
    prevHp.current = hero.currentHealth;

    // Death fall progression.
    const targetDeath = hero.isAlive ? 0 : 1;
    deathProgress.current += (targetDeath - deathProgress.current) * Math.min(1, delta * 4);
    const dp = deathProgress.current;

    // Lunge: quick forward jab toward the enemy line, then ease back.
    const lungeT = (now - lungeStart.current) / 0.55;
    let lunge = 0;
    if (lungeT >= 0 && lungeT <= 1) {
      lunge = Math.sin(lungeT * Math.PI) * 1.1;
    }

    // Hit shake.
    const hitT = (now - hitStart.current) / 0.35;
    const shake = hitT >= 0 && hitT <= 1 ? Math.sin(hitT * Math.PI * 6) * 0.09 * (1 - hitT) : 0;

    // Idle bob so the board feels alive.
    const bob = Math.sin(now * 1.6 + position[0]) * 0.04 * (1 - dp);

    g.position.x = position[0] + facing * lunge + shake;
    g.position.y = position[1] + bob - dp * 0.35;
    g.position.z = position[2];
    // Topple over on death.
    g.rotation.z = -facing * dp * 1.2;
  });

  const scale = 1;

  return (
    <group ref={group} position={position} scale={scale}>
      {/* Pedestal */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.85, 0.24, 40]} />
        <meshStandardMaterial
          color={rarityColor}
          emissive={rarityColor}
          emissiveIntensity={isActive ? 0.9 : 0.25}
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>
      {/* Rarity glow ring on the ground */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.9, 1.12, 48]} />
        <meshBasicMaterial
          color={rarityColor}
          transparent
          opacity={isActive ? 0.55 : 0.22}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Portrait standee (billboarded to the camera). Portraits are opaque
          3:4 images with the hero name baked in, so we frame them like a
          collectible photo-standee mounted on the pedestal. */}
      <Billboard follow lockX lockZ position={[0, 1.55, 0]}>
        {/* Rarity frame / backing */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[1.55, 2.02]} />
          <meshBasicMaterial color={rarityColor} transparent opacity={isActive ? 0.95 : 0.7} />
        </mesh>
        {url ? (
          <Suspense
            fallback={
              <mesh>
                <planeGeometry args={[1.4, 1.87]} />
                <meshBasicMaterial color={rarityColor} transparent opacity={0.5} />
              </mesh>
            }
          >
            <DreiImage
              url={url}
              scale={[1.4, 1.87]}
              // Desaturate/darken on death.
              color={hero.isAlive ? '#ffffff' : '#4b4b4b'}
            />
          </Suspense>
        ) : (
          <mesh>
            <planeGeometry args={[1.4, 1.87]} />
            <meshBasicMaterial color={rarityColor} transparent opacity={0.6} />
          </mesh>
        )}

        {/* Active-turn marker */}
        {isActive && hero.isAlive && (
          <mesh position={[0, 1.28, 0.05]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.16, 0.3, 4]} />
            <meshBasicMaterial color={elementColor} />
          </mesh>
        )}

        {/* HP bar */}
        <group position={[0, -1.12, 0.05]}>
          <mesh>
            <planeGeometry args={[1.44, 0.15]} />
            <meshBasicMaterial color="#0b0b12" transparent opacity={0.9} />
          </mesh>
          <mesh position={[-(1 - hpPercent) * 0.7, 0, 0.01]} scale={[hpPercent, 1, 1]}>
            <planeGeometry args={[1.4, 0.1]} />
            <meshBasicMaterial color={hpPercent > 0.3 ? '#22c55e' : '#ef4444'} />
          </mesh>
        </group>
      </Billboard>

      {/* Elemental hit burst */}
      {burst > 0 && (
        <HitBurst key={burst} color={elementColor} />
      )}
    </group>
  );
}

// ─── Expanding elemental ring shown when a hero is struck ─────────
function HitBurst({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const start = useRef(-1);
  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    if (start.current < 0) start.current = state.clock.elapsedTime;
    const t = (state.clock.elapsedTime - start.current) / 0.5;
    const k = Math.min(1, Math.max(0, t));
    const s = 0.3 + EASE(k) * 1.8;
    m.scale.set(s, s, s);
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.opacity = (1 - k) * 0.8;
  });
  return (
    <mesh ref={ref} position={[0, 1.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.5, 0.72, 40]} />
      <meshBasicMaterial color={color} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

// ─── Gentle idle camera drift ─────────────────────────────────────
function CameraRig() {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    state.camera.position.x = Math.sin(t * 0.1) * 0.3;
    state.camera.position.y = 3.2 + Math.sin(t * 0.16) * 0.12;
    state.camera.lookAt(0, 1.4, 0);
  });
  return null;
}

// ─── Team layout helper ──────────────────────────────────────────
// Fan each team out along a diagonal (both X and Z change) so the
// billboarded standees never stack on top of one another. Front hero
// sits closest to the centre line; the rest recede outward and back.
function teamPositions(count: number, side: number): [number, number, number][] {
  return Array.from({ length: count }, (_, i) => {
    const x = side * (2.7 + i * 0.7);
    const z = 2.6 - i * 1.55;
    return [x, 0, z] as [number, number, number];
  });
}

// ─── Scene contents ──────────────────────────────────────────────
function SceneContents({ battle }: { battle: BattleState }) {
  const activeHero =
    battle.currentTurn === 'player'
      ? battle.playerTeam[battle.turnIndex]
      : battle.enemyTeam[battle.turnIndex];

  const playerPos = useMemo(() => teamPositions(battle.playerTeam.length, -1), [battle.playerTeam.length]);
  const enemyPos = useMemo(() => teamPositions(battle.enemyTeam.length, 1), [battle.enemyTeam.length]);

  return (
    <>
      <CameraRig />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#8b5cf6', '#0b0618', 0.6]} />
      <directionalLight position={[0, 8, 4]} intensity={1.1} castShadow />
      <pointLight position={[-6, 3, 2]} intensity={30} color="#3b82f6" distance={20} />
      <pointLight position={[6, 3, 2]} intensity={30} color="#ef4444" distance={20} />

      {/* Arena floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[11, 64]} />
        <meshStandardMaterial color="#0b0714" metalness={0.4} roughness={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[6.4, 6.7, 80]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
      <ContactShadows position={[0, 0.02, 0]} opacity={0.5} scale={22} blur={2.4} far={6} />
      <Sparkles count={40} scale={[14, 6, 10]} size={2} speed={0.3} color="#a855f7" opacity={0.4} />

      <Suspense fallback={null}>
        {battle.playerTeam.map((hero, i) => (
          <Figurine
            key={hero.id}
            hero={hero}
            position={playerPos[i]}
            facing={1}
            isActive={activeHero?.id === hero.id}
          />
        ))}
        {battle.enemyTeam.map((hero, i) => (
          <Figurine
            key={hero.id}
            hero={hero}
            position={enemyPos[i]}
            facing={-1}
            isActive={activeHero?.id === hero.id}
          />
        ))}
      </Suspense>
    </>
  );
}

// ─── Public component ────────────────────────────────────────────
export default function Battle3DScene({ battle }: { battle: BattleState }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 3.2, 11.5], fov: 42 }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <SceneContents battle={battle} />
    </Canvas>
  );
}
