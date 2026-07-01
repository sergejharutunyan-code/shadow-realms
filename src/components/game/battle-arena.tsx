'use client';

import { useGameStore } from '@/lib/game-store';
import { RARITY_CONFIG, ELEMENT_CONFIG, FACTION_CONFIG, BattleHero } from '@/lib/game-data';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Swords, Shield, Heart, Zap, Star, Play, FastForward,
  RotateCcw, Trophy, Skull, Sparkles, Flame, ChevronRight,
  Volume2, VolumeX, Clock, Users, Crown, AlertTriangle, Box, LayoutGrid
} from 'lucide-react';

// The 3D arena is WebGL and must only run in the browser/WebView, so it is
// loaded client-side (no SSR/prerender) to keep the static export happy.
const Battle3DScene = dynamic(() => import('./battle-3d-scene'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-purple-300/60 text-sm animate-pulse">
      Summoning arena…
    </div>
  ),
});

// ─── Floating Damage Type ────────────────────────────────────────
interface FloatingDamage {
  id: string;
  targetId: string;
  damage: number;
  crit: boolean;
  healed?: boolean;
}

// ─── Skill Flash Type ────────────────────────────────────────────
interface SkillFlash {
  id: string;
  heroId: string;
  skillName: string;
  isEnemy: boolean;
}

// ─── Kill Effect Type ────────────────────────────────────────────
interface KillEffect {
  id: string;
  heroId: string;
  name: string;
}

// ─── Main Component ──────────────────────────────────────────────
export function BattleArena() {
  const battle = useGameStore(s => s.battle);
  const executeBattleTurn = useGameStore(s => s.executeBattleTurn);
  const toggleAutoPlay = useGameStore(s => s.toggleAutoPlay);
  const toggleBattleSpeed = useGameStore(s => s.toggleBattleSpeed);
  const endBattle = useGameStore(s => s.endBattle);
  const setScreen = useGameStore(s => s.setScreen);

  const logRef = useRef<HTMLDivElement>(null);
  const lastLogLengthRef = useRef<number>(0);
  const [floatingDamage, setFloatingDamage] = useState<FloatingDamage[]>([]);
  const [skillFlash, setSkillFlash] = useState<SkillFlash[]>([]);
  const [killEffects, setKillEffects] = useState<KillEffect[]>([]);
  const [screenShake, setScreenShake] = useState(false);
  const [view3d, setView3d] = useState(true);
  const turnCount = battle?.turnNumber ?? 0;

  // ─── Auto-scroll battle log ────────────────────────────────
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [battle?.log]);

  // ─── Track battle events from log changes ──────────────────
  useEffect(() => {
    if (!battle || battle.log.length === 0) return;

    const newEntries = battle.log.slice(lastLogLengthRef.current);
    lastLogLengthRef.current = battle.log.length;

    for (const entry of newEntries) {
      // Track damage events
      const damageMatch = entry.match(/(.+) attacks (.+) for (\d+)( CRIT!)?/);
      if (damageMatch) {
        const [, attacker, target, dmg, crit] = damageMatch;
        const allHeroes = [...battle.playerTeam, ...battle.enemyTeam];
        const targetHero = allHeroes.find(h => h.name === target.trim());
        const attackerHero = allHeroes.find(h => h.name === attacker.trim());
        const isPlayerAttack = battle.playerTeam.some(h => h.name === attacker.trim());

        if (targetHero) {
          const id = `dmg_${Date.now()}_${Math.random()}`;
          setTimeout(() => {
            setFloatingDamage(prev => [...prev, {
              id, targetId: targetHero.id,
              damage: parseInt(dmg), crit: !!crit
            }]);
            setTimeout(() => {
              setFloatingDamage(prev => prev.filter(d => d.id !== id));
            }, 1500);
          }, 0);
        }

        // Skill flash on attacker
        if (attackerHero) {
          const flashId = `flash_${Date.now()}_${Math.random()}`;
          setTimeout(() => {
            setSkillFlash(prev => [...prev, {
              id: flashId, heroId: attackerHero.id,
              skillName: attackerHero.skill1Name,
              isEnemy: !isPlayerAttack,
            }]);
            setTimeout(() => {
              setSkillFlash(prev => prev.filter(f => f.id !== flashId));
            }, 800);
          }, 0);
        }
      }

      // Track kill events
      const killMatch = entry.match(/💀 (.+) has fallen/);
      if (killMatch) {
        const heroName = killMatch[1].trim();
        const allHeroes = [...battle.playerTeam, ...battle.enemyTeam];
        const deadHero = allHeroes.find(h => h.name === heroName);
        if (deadHero) {
          const killId = `kill_${Date.now()}_${Math.random()}`;
          setTimeout(() => {
            setKillEffects(prev => [...prev, {
              id: killId, heroId: deadHero.id, name: heroName
            }]);
            setTimeout(() => {
              setKillEffects(prev => prev.filter(k => k.id !== killId));
            }, 2000);
          }, 0);

          // Screen shake on kill
          setTimeout(() => {
            setScreenShake(true);
            setTimeout(() => setScreenShake(false), 400);
          }, 100);
        }
      }

      // Track defeat - big shake
      if (entry.includes('DEFEAT')) {
        setTimeout(() => {
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 800);
        }, 0);
      }
    }
  }, [battle?.log]);

  // ─── No Battle State ──────────────────────────────────────
  if (!battle) {
    return (
      <div className="p-4 max-w-4xl mx-auto text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="inline-block mb-6"
        >
          <Swords className="w-20 h-20 text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
        </motion.div>
        <h2 className="text-2xl font-bold gold-text mb-3">No Active Battle</h2>
        <p className="text-sm text-gray-400 mb-6">Enter the campaign to begin combat!</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setScreen('campaign')}
          className="bg-gradient-to-r from-red-600 to-red-700 text-white font-bold px-8 py-3 rounded-xl hover:from-red-500 hover:to-red-600 transition-all shadow-lg shadow-red-600/30"
        >
          <Swords className="w-5 h-5 inline mr-2" />
          Go to Campaign
        </motion.button>
      </div>
    );
  }

  // ─── Determine currently acting hero ──────────────────────
  const activeHero = battle.currentTurn === 'player'
    ? battle.playerTeam[battle.turnIndex]
    : battle.enemyTeam[battle.turnIndex];

  return (
    <motion.div
      animate={screenShake ? {
        x: [0, -6, 6, -4, 4, -2, 2, 0],
        y: [0, 3, -3, 2, -2, 1, -1, 0]
      } : { x: 0, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-2 sm:p-3 max-w-4xl mx-auto"
    >
      {/* ─── Battle Result Banner ─────────────────────────── */}
      <AnimatePresence>
        {battle.result && (
          <BattleResultOverlay
            result={battle.result}
            rewards={battle.rewards}
            onContinue={endBattle}
          />
        )}
      </AnimatePresence>

      {/* ─── Turn Counter & Status Bar ────────────────────── */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <motion.div
            key={turnCount}
            initial={{ scale: 1.4, color: '#fbbf24' }}
            animate={{ scale: 1, color: '#a1a1aa' }}
            className="flex items-center gap-1.5 bg-black/50 border border-amber-500/30 rounded-lg px-3 py-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-amber-300">Turn {turnCount}</span>
          </motion.div>
        </div>

        <div className="flex items-center gap-1.5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setView3d(v => !v)}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 border transition-all ${
              view3d
                ? 'bg-purple-600/25 border-purple-500/40 text-purple-200 shadow-lg shadow-purple-600/20'
                : 'bg-gray-800/50 border-gray-700/50 text-gray-400'
            }`}
            title={view3d ? 'Switch to 2D view' : 'Switch to 3D view'}
          >
            {view3d ? <Box className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
            <span className="text-[10px] font-bold">{view3d ? '3D' : '2D'}</span>
          </motion.button>
          {battle.autoPlay && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-1 bg-green-600/20 border border-green-500/30 rounded-lg px-2 py-1"
            >
              <Play className="w-3 h-3 text-green-400 fill-green-400" />
              <span className="text-[10px] font-bold text-green-400">AUTO</span>
            </motion.div>
          )}
          <div className="flex items-center gap-1 bg-black/50 border border-purple-500/30 rounded-lg px-2 py-1">
            <FastForward className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] font-bold text-purple-300">{battle.speed}x</span>
          </div>
        </div>
      </div>

      {/* ─── Battle Arena Visual ──────────────────────────── */}
      <div className="relative bg-gradient-to-b from-[#050210] via-[#0f0525] to-[#050210] rounded-2xl border border-purple-500/30 overflow-hidden mb-3 shadow-2xl shadow-purple-900/30">
        {/* ─── Animated Background Effects ──────────────── */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Fog layers */}
          <motion.div
            animate={{ x: ['-20%', '120%'] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/4 -left-1/3 w-2/3 h-32 bg-purple-900/8 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: ['120%', '-20%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-2/3 -left-1/3 w-2/3 h-32 bg-red-900/8 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: ['-10%', '110%'] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 -left-1/4 w-1/2 h-24 bg-amber-900/5 rounded-full blur-3xl"
          />

          {/* Floating embers/particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${10 + (i * 8) % 80}%`,
                bottom: '-5%',
                background: i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#ef4444' : '#a855f7',
                boxShadow: `0 0 6px ${i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#ef4444' : '#a855f7'}`,
              }}
              animate={{
                y: [0, -300 - Math.random() * 200],
                x: [0, (Math.random() - 0.5) * 100],
                opacity: [0, 0.8, 0.6, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* Rune circle at center */}
          <motion.div
            animate={{ rotate: 360, opacity: [0.03, 0.08, 0.03] }}
            transition={{ rotate: { duration: 30, repeat: Infinity, ease: 'linear' }, opacity: { duration: 5, repeat: Infinity } }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-purple-500/10"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 sm:w-48 sm:h-48 rounded-full border border-red-500/8"
          />
        </div>

        {/* ─── 3D Battle Arena ───────────────────────────── */}
        {view3d && (
          <div className="relative z-10 h-[440px] sm:h-[540px]">
            <Battle3DScene battle={battle} />
          </div>
        )}

        {/* ─── Enemy Team Section (2D fallback) ───────────── */}
        {!view3d && (<>
        <div className="relative z-10 p-3 sm:p-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Skull className="w-4 h-4 text-red-400" />
            </motion.div>
            <div className="text-xs text-red-400 font-bold tracking-widest uppercase">Enemies</div>
            <div className="h-px flex-1 bg-gradient-to-r from-red-500/40 to-transparent" />
          </div>
          <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
            {battle.enemyTeam.map(hero => (
              <BattleHeroCard
                key={hero.id}
                hero={hero}
                isEnemy
                floatingDamage={floatingDamage}
                skillFlash={skillFlash}
                killEffects={killEffects}
                isActive={activeHero?.id === hero.id}
                isPlayerTurn={battle.currentTurn === 'enemy'}
              />
            ))}
          </div>
        </div>

        {/* ─── VS Divider ────────────────────────────────── */}
        <div className="relative z-10 py-4 text-center">
          <div className="flex items-center justify-center gap-3 px-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/30 to-red-500/50" />
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                boxShadow: [
                  '0 0 15px rgba(239,68,68,0.1), 0 0 15px rgba(168,85,247,0.1)',
                  '0 0 25px rgba(239,68,68,0.3), 0 0 25px rgba(168,85,247,0.3)',
                  '0 0 15px rgba(239,68,68,0.1), 0 0 15px rgba(168,85,247,0.1)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-red-900/40 via-purple-900/40 to-red-900/40 border border-white/10"
            >
              <motion.div
                animate={{ x: [-3, 3, -3], rotate: [-15, 15, -15] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Swords className="w-5 h-5 text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
              </motion.div>
              <span className="text-sm font-black text-white tracking-[0.3em] drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                VS
              </span>
              <motion.div
                animate={{ x: [3, -3, 3], rotate: [15, -15, 15] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Swords className="w-5 h-5 text-purple-400 scale-x-[-1] drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]" />
              </motion.div>
            </motion.div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-purple-500/30 to-purple-500/50" />
          </div>
        </div>

        {/* ─── Player Team Section ───────────────────────── */}
        <div className="relative z-10 p-3 sm:p-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-px flex-1 bg-gradient-to-l from-blue-500/40 to-transparent" />
            <div className="text-xs text-blue-400 font-bold tracking-widest uppercase">Your Team</div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Shield className="w-4 h-4 text-blue-400" />
            </motion.div>
          </div>
          <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
            {battle.playerTeam.map(hero => (
              <BattleHeroCard
                key={hero.id}
                hero={hero}
                floatingDamage={floatingDamage}
                skillFlash={skillFlash}
                killEffects={killEffects}
                isActive={activeHero?.id === hero.id}
                isPlayerTurn={battle.currentTurn === 'player'}
              />
            ))}
          </div>
        </div>
        </>)}
      </div>

      {/* ─── Battle Controls ──────────────────────────────── */}
      {!battle.result && (
        <div className="flex gap-2 mb-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={executeBattleTurn}
            className="flex-1 bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:from-red-500 hover:via-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-600/30 border border-red-500/30"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Swords className="w-5 h-5" />
            </motion.div>
            Attack!
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleAutoPlay}
            className={`px-4 py-3 rounded-xl font-medium text-sm transition-all border ${
              battle.autoPlay
                ? 'bg-green-600/20 text-green-400 border-green-500/40 shadow-lg shadow-green-600/20'
                : 'bg-gray-800/50 text-gray-400 border-gray-700/50'
            }`}
            title="Auto-play"
          >
            <FastForward className={`w-5 h-5 ${battle.autoPlay ? 'text-green-400' : ''}`} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleBattleSpeed}
            className={`px-4 py-3 rounded-xl font-bold text-sm transition-all border ${
              battle.speed === 2
                ? 'bg-yellow-600/20 text-yellow-400 border-yellow-500/40 shadow-lg shadow-yellow-600/20'
                : 'bg-gray-800/50 text-gray-400 border-gray-700/50'
            }`}
            title="Battle Speed"
          >
            {battle.speed}x
          </motion.button>
        </div>
      )}

      {/* ─── Battle Log ───────────────────────────────────── */}
      <div className="bg-black/60 border border-purple-900/30 rounded-xl overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-purple-900/30 via-red-900/20 to-purple-900/30 px-4 py-2 border-b border-purple-900/30">
          <div className="text-xs text-purple-300 font-bold flex items-center gap-2 tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Battle Log
          </div>
        </div>
        <div
          ref={logRef}
          className="p-3 max-h-40 overflow-y-auto game-scrollbar space-y-0.5"
        >
          {battle.log.length === 0 && (
            <div className="text-xs text-gray-600 italic text-center py-2">Battle begins...</div>
          )}
          {battle.log.map((entry, i) => (
            <motion.div
              key={`${i}-${entry}`}
              initial={{ opacity: 0, x: -15, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`text-xs py-1 px-2 rounded ${
                entry.includes('VICTORY') ? 'text-amber-300 font-bold bg-amber-500/10' :
                entry.includes('DEFEAT') ? 'text-red-300 font-bold bg-red-500/10' :
                entry.includes('CRIT') ? 'text-yellow-300 font-semibold bg-yellow-500/5' :
                entry.includes('fallen') ? 'text-red-300 bg-red-500/5' :
                entry.includes('Equipment Drop') ? 'text-purple-300 font-bold bg-purple-500/10' :
                entry.includes('attacks') ? 'text-gray-300' :
                'text-gray-500'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                {getLogIcon(entry)}
                {entry}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Battle Hero Card Component ──────────────────────────────────
function BattleHeroCard({
  hero,
  isEnemy,
  floatingDamage,
  skillFlash,
  killEffects,
  isActive,
  isPlayerTurn,
}: {
  hero: BattleHero;
  isEnemy?: boolean;
  floatingDamage: FloatingDamage[];
  skillFlash: SkillFlash[];
  killEffects: KillEffect[];
  isActive: boolean;
  isPlayerTurn: boolean;
}) {
  const rarity = RARITY_CONFIG[hero.rarity];
  const element = ELEMENT_CONFIG[hero.element];
  const faction = FACTION_CONFIG[hero.faction];
  const healthPercent = hero.isAlive ? (hero.currentHealth / hero.maxHealth) * 100 : 0;
  const damages = floatingDamage.filter(d => d.targetId === hero.id);
  const currentSkillFlash = skillFlash.find(f => f.heroId === hero.id);
  const killEffect = killEffects.find(k => k.heroId === hero.id);

  const healthColor = healthPercent > 60
    ? 'from-green-500 to-emerald-600'
    : healthPercent > 30
    ? 'from-yellow-500 to-amber-600'
    : 'from-red-500 to-red-700';

  const healthGlow = healthPercent > 60
    ? 'shadow-green-500/40'
    : healthPercent > 30
    ? 'shadow-yellow-500/40'
    : 'shadow-red-500/50';

  return (
    <motion.div
      layout
      animate={
        !hero.isAlive
          ? { opacity: 0.35, scale: 0.85, filter: 'grayscale(1)' }
          : isActive
          ? { opacity: 1, scale: 1.05 }
          : { opacity: 1, scale: 1 }
      }
      transition={{ duration: 0.4 }}
      className={`hero-3d-container relative w-20 sm:w-24 md:w-28 rounded-xl overflow-hidden transition-all ${
        isActive && hero.isAlive
          ? `border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4),0_0_40px_rgba(245,158,11,0.15)] ${rarity.borderColor}`
          : `border-2 ${rarity.borderColor} ${hero.rarity === 'legendary' || hero.rarity === 'mythic' ? rarity.glowColor : ''}`
      }`}
    >
      <div className={`hero-3d-card rounded-xl hero-3d-glow-${hero.rarity}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
      {/* ─── Active Turn Indicator ─────────────────────── */}
      {isActive && hero.isAlive && (
        <motion.div
          className="absolute -top-1 left-1/2 -translate-x-1/2 z-30 bg-amber-500 text-black text-[8px] font-black px-2 py-0.5 rounded-b shadow-lg shadow-amber-500/30 tracking-wider"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {isPlayerTurn ? '▶ YOUR TURN' : '◀ ENEMY'}
        </motion.div>
      )}

      {/* ─── Skill Flash Overlay ───────────────────────── */}
      <AnimatePresence>
        {currentSkillFlash && hero.isAlive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.8, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className={`absolute inset-0 z-20 rounded-xl ${
              currentSkillFlash.isEnemy
                ? 'bg-gradient-to-t from-red-600/40 to-red-400/20'
                : 'bg-gradient-to-t from-blue-600/40 to-cyan-400/20'
            }`}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.3, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 0.6 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-black text-white whitespace-nowrap drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            >
              {currentSkillFlash.skillName}!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Floating Damage Numbers ────────────────────── */}
      <AnimatePresence>
        {damages.map(d => (
          <motion.div
            key={d.id}
            initial={{ opacity: 1, y: 0, scale: 0.3, x: (Math.random() - 0.5) * 20 }}
            animate={{
              opacity: 0,
              y: -70,
              scale: d.crit ? 2.2 : 1.4,
              x: (Math.random() - 0.5) * 30,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            className={`absolute top-2 left-1/2 -translate-x-1/2 z-30 font-black pointer-events-none ${
              d.crit
                ? 'text-yellow-300 text-xl sm:text-2xl'
                : d.healed
                ? 'text-green-400 text-base'
                : 'text-red-400 text-lg'
            }`}
            style={{
              textShadow: d.crit
                ? '0 0 12px rgba(253,224,71,0.8), 0 0 24px rgba(253,224,71,0.4), 0 2px 4px black'
                : '0 0 8px currentColor, 0 2px 4px black',
            }}
          >
            {d.crit && '💥 '}
            {d.healed ? '+' : '-'}
            {d.damage.toLocaleString()}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ─── Kill Effect ────────────────────────────────── */}
      <AnimatePresence>
        {killEffect && !hero.isAlive && (
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 2.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none"
          >
            <span className="text-4xl" style={{ filter: 'drop-shadow(0 0 10px rgba(239,68,68,0.8))' }}>
              💀
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Hero Portrait Area with 3D depth ──────────── */}
      <div className={`hero-3d-portrait relative h-20 sm:h-24 md:h-28 bg-gradient-to-b ${getHeroGradient(hero.rarity)} flex items-center justify-center overflow-hidden`}>
        {/* Animated idle bob */}
        <motion.div
          animate={hero.isAlive ? { y: [0, -3, 0] } : {}}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className={`hero-3d-layer-front text-4xl sm:text-5xl select-none ${!hero.isAlive ? 'grayscale opacity-40' : ''}`}
          style={{ filter: hero.isAlive ? `drop-shadow(0 0 8px ${getElementGlow(hero.element)})` : 'none' }}
        >
          {faction.icon}
        </motion.div>

        {/* Element badge with 3D depth */}
        <div className="absolute top-1.5 right-1.5 text-sm backdrop-blur-sm bg-black/40 rounded-md px-1 py-0.5 border border-white/10 badge-3d">
          {element.icon}
        </div>

        {/* Rarity stars */}
        <div className="absolute top-1.5 left-1.5 flex gap-0.5 hero-3d-layer-front">
          {Array.from({ length: Math.min(hero.stars, 5) }, (_, i) => (
            <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_3px_rgba(250,204,21,0.6)]" />
          ))}
        </div>

        {/* Level badge with 3D depth */}
        <div className="absolute bottom-1 right-1.5 text-[8px] bg-black/50 text-gray-300 font-bold rounded px-1 border border-white/5 badge-3d">
          {hero.level}
        </div>

        {/* Holographic overlay for epic+ rarity */}
        {['epic', 'legendary', 'mythic'].includes(hero.rarity) && hero.isAlive && (
          <div className={`holographic-overlay ${
            hero.rarity === 'epic' ? 'holographic-epic' :
            hero.rarity === 'legendary' ? 'holographic-legendary' : 'holographic-mythic'
          }`} style={{ opacity: 0.4, animation: 'holographic-sweep 3s linear infinite' }} />
        )}

        {/* Death overlay */}
        <AnimatePresence>
          {!hero.isAlive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Skull className="w-8 h-8 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active hero glow pulse */}
        {isActive && hero.isAlive && (
          <motion.div
            className="absolute inset-0 border-2 border-amber-400/50 rounded-t-xl"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>

      {/* ─── Hero Info Section ──────────────────────────── */}
      <div className="p-2 bg-gradient-to-b from-[#0a0a1a] to-[#050510]">
        {/* Name */}
        <div className="text-[10px] sm:text-xs font-bold text-white truncate mb-0.5">
          {hero.name.split(' ')[0]}
        </div>

        {/* Health Bar */}
        <div className="relative w-full h-3 sm:h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700/50">
          <motion.div
            animate={{ width: `${healthPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full rounded-full bg-gradient-to-r ${healthColor} shadow-sm ${healthGlow} relative`}
          >
            {/* Health bar shimmer */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </motion.div>

          {/* Low health pulse */}
          {healthPercent <= 30 && healthPercent > 0 && (
            <motion.div
              animate={{ opacity: [0, 0.4, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="absolute inset-0 bg-red-500/30 rounded-full"
            />
          )}
        </div>

        {/* HP Numbers */}
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-0.5">
            <Heart className={`w-2.5 h-2.5 ${healthPercent > 60 ? 'text-green-400' : healthPercent > 30 ? 'text-yellow-400' : 'text-red-400'}`} />
          </div>
          <span className={`text-[8px] sm:text-[9px] font-bold ${
            !hero.isAlive ? 'text-red-500' :
            healthPercent <= 30 ? 'text-red-400 animate-pulse' :
            healthPercent <= 60 ? 'text-yellow-400' :
            'text-green-400'
          }`}>
            {hero.isAlive
              ? `${formatHP(hero.currentHealth)} / ${formatHP(hero.maxHealth)}`
              : 'KO'}
          </span>
        </div>

        {/* Turn Meter Bar */}
        {hero.isAlive && (
          <div className="mt-1 relative w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${hero.turnMeter}%` }}
              transition={{ duration: 0.3 }}
              className={`h-full rounded-full ${hero.turnMeter >= 100 ? 'bg-amber-400 shadow-sm shadow-amber-400/50' : 'bg-purple-500/60'}`}
            />
          </div>
        )}
      </div>
      </div>
    </motion.div>
  );
}

// ─── Battle Result Overlay ───────────────────────────────────────
function BattleResultOverlay({
  result,
  rewards,
  onContinue,
}: {
  result: 'victory' | 'defeat';
  rewards: { gold: number; experience: number; gems: number } | null;
  onContinue: () => void;
}) {
  const isVictory = result === 'victory';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.3, opacity: 0, rotate: isVictory ? 0 : -5 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.3, opacity: 0 }}
        transition={{ type: 'spring', damping: 12, stiffness: 200 }}
        className={`relative max-w-sm w-full mx-4 rounded-2xl p-6 text-center overflow-hidden ${
          isVictory
            ? 'bg-gradient-to-b from-amber-900/80 via-amber-950/90 to-black/95 border-2 border-amber-500/50 shadow-[0_0_60px_rgba(245,158,11,0.3)]'
            : 'bg-gradient-to-b from-red-900/80 via-red-950/90 to-black/95 border-2 border-red-500/50 shadow-[0_0_60px_rgba(239,68,68,0.3)]'
        }`}
      >
        {/* Background radial glow */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className={`absolute inset-0 rounded-full blur-3xl ${
            isVictory ? 'bg-amber-500/20' : 'bg-red-500/20'
          }`}
        />

        {/* Victory sparkles */}
        {isVictory && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-xl"
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: Math.cos((i * 45) * Math.PI / 180) * 120,
                  y: Math.sin((i * 45) * Math.PI / 180) * 120,
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.15 }}
                style={{ top: '50%', left: '50%' }}
              >
                ✨
              </motion.div>
            ))}
            {/* Rotating halo */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-amber-400/20"
            />
          </>
        )}

        {/* Defeat fire effect */}
        {!isVictory && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-lg"
                initial={{ y: 50, opacity: 0 }}
                animate={{
                  y: -80,
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                style={{ left: `${15 + i * 15}%`, bottom: '10%' }}
              >
                🔥
              </motion.div>
            ))}
          </>
        )}

        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: [0, 1.5, 1], rotate: 0 }}
            transition={{ duration: 0.6, times: [0, 0.6, 1] }}
            className="text-6xl mb-3"
          >
            {isVictory ? '🏆' : '💀'}
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-3xl font-black mb-2 ${
              isVictory
                ? 'gold-text drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                : 'text-red-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]'
            }`}
          >
            {isVictory ? 'VICTORY!' : 'DEFEAT'}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`text-sm mb-4 ${isVictory ? 'text-amber-300/80' : 'text-red-300/80'}`}
          >
            {isVictory ? 'Your enemies have been vanquished!' : 'Your forces have been overwhelmed...'}
          </motion.p>

          {/* Rewards */}
          {rewards && isVictory && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-4 mb-5"
            >
              <RewardItem icon="🪙" value={`+${rewards.gold.toLocaleString()}`} color="text-amber-300" />
              <RewardItem icon="⭐" value={`+${rewards.experience.toLocaleString()} XP`} color="text-green-300" />
              <RewardItem icon="💎" value={`+${rewards.gems}`} color="text-cyan-300" />
            </motion.div>
          )}

          {/* Continue Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onContinue}
            className={`px-10 py-3 rounded-xl font-bold text-lg transition-all shadow-lg ${
              isVictory
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 shadow-amber-600/30'
                : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 shadow-red-600/30'
            }`}
          >
            {isVictory ? 'Continue' : 'Retreat'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Reward Item Sub-component ───────────────────────────────────
function RewardItem({ icon, value, color }: { icon: string; value: string; color: string }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex flex-col items-center gap-0.5 bg-black/30 rounded-lg px-3 py-2 border border-white/5"
    >
      <span className="text-xl">{icon}</span>
      <span className={`text-xs font-bold ${color}`}>{value}</span>
    </motion.div>
  );
}

// ─── Helper: Get log icon ────────────────────────────────────────
function getLogIcon(entry: string): React.ReactNode {
  if (entry.includes('VICTORY')) return <Trophy className="w-3 h-3 text-amber-400 inline shrink-0" />;
  if (entry.includes('DEFEAT')) return <Skull className="w-3 h-3 text-red-400 inline shrink-0" />;
  if (entry.includes('CRIT')) return <Zap className="w-3 h-3 text-yellow-400 inline shrink-0" />;
  if (entry.includes('fallen')) return <Skull className="w-3 h-3 text-red-400 inline shrink-0" />;
  if (entry.includes('attacks')) return <Swords className="w-3 h-3 text-gray-500 inline shrink-0" />;
  if (entry.includes('Equipment Drop')) return <Sparkles className="w-3 h-3 text-purple-400 inline shrink-0" />;
  return <ChevronRight className="w-3 h-3 text-gray-600 inline shrink-0" />;
}

// ─── Helper: Get hero gradient by rarity ─────────────────────────
function getHeroGradient(rarity: string): string {
  const gradients: Record<string, string> = {
    common: 'from-gray-700 via-gray-800 to-gray-900',
    uncommon: 'from-green-800 via-green-900 to-green-950',
    rare: 'from-blue-800 via-blue-900 to-blue-950',
    epic: 'from-purple-800 via-purple-900 to-purple-950',
    legendary: 'from-amber-700 via-amber-800 to-amber-950',
    mythic: 'from-red-700 via-red-800 to-red-950',
  };
  return gradients[rarity] || 'from-gray-700 via-gray-800 to-gray-900';
}

// ─── Helper: Get element glow color ─────────────────────────────
function getElementGlow(element: string): string {
  const glows: Record<string, string> = {
    fire: 'rgba(239,68,68,0.6)',
    water: 'rgba(34,211,238,0.6)',
    earth: 'rgba(245,158,11,0.6)',
    dark: 'rgba(168,85,247,0.6)',
    light: 'rgba(253,224,71,0.6)',
    void: 'rgba(236,72,153,0.6)',
  };
  return glows[element] || 'rgba(168,85,247,0.4)';
}

// ─── Helper: Format HP values ────────────────────────────────────
function formatHP(hp: number): string {
  if (hp >= 10000) return `${(hp / 1000).toFixed(1)}K`;
  if (hp >= 1000) return `${(hp / 1000).toFixed(2)}K`;
  return hp.toString();
}
