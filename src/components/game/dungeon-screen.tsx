'use client';

import { useGameStore } from '@/lib/game-store';
import {
  DAILY_DUNGEONS,
  DUNGEON_MATERIALS,
  ELEMENT_CONFIG,
  DailyDungeon,
  DungeonStage,
  Element,
  getDungeonById,
  getTodayDungeon,
} from '@/lib/game-data';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  Clock,
  Skull,
  Lock,
  Check,
  Gem,
  Coins,
  Swords,
  Trophy,
  Zap,
  ChevronRight,
  Sparkles,
  Calendar,
  Timer,
  Crown,
  Package,
  X,
  Star,
} from 'lucide-react';

// ============= Types =============

interface DungeonBattleResult {
  won: boolean;
  rewards: { gold: number; gems: number; material?: string; materialCount?: number };
  dungeonName: string;
  stage: number;
  element: Element;
}

// ============= Helpers =============

const MAX_ATTEMPTS = 3;
const ENERGY_COST = 15;
const RESET_MS = 24 * 60 * 60 * 1000;

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDuration(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatPower(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

// Element-themed visual palette for dungeon cards
type ElementTheme = {
  border: string;
  bg: string;
  glow: string;
  text: string;
  accentText: string;
  portalFrom: string;
  portalTo: string;
  ring: string;
  badgeBg: string;
};

function getElementTheme(element: Element): ElementTheme {
  switch (element) {
    case 'fire':
      return {
        border: 'border-red-500/60',
        bg: 'from-red-950/70 via-orange-950/40 to-black',
        glow: 'shadow-[0_0_30px_rgba(239,68,68,0.40)]',
        text: 'text-red-300',
        accentText: 'text-orange-300',
        portalFrom: 'from-orange-500',
        portalTo: 'to-red-700',
        ring: 'ring-red-500/50',
        badgeBg: 'bg-red-500/20',
      };
    case 'water':
      return {
        border: 'border-cyan-500/60',
        bg: 'from-cyan-950/70 via-blue-950/40 to-black',
        glow: 'shadow-[0_0_30px_rgba(34,211,238,0.40)]',
        text: 'text-cyan-300',
        accentText: 'text-blue-300',
        portalFrom: 'from-cyan-400',
        portalTo: 'to-blue-700',
        ring: 'ring-cyan-500/50',
        badgeBg: 'bg-cyan-500/20',
      };
    case 'earth':
      return {
        border: 'border-amber-500/60',
        bg: 'from-amber-950/70 via-yellow-950/40 to-black',
        glow: 'shadow-[0_0_30px_rgba(245,158,11,0.40)]',
        text: 'text-amber-300',
        accentText: 'text-yellow-300',
        portalFrom: 'from-amber-400',
        portalTo: 'to-yellow-700',
        ring: 'ring-amber-500/50',
        badgeBg: 'bg-amber-500/20',
      };
    case 'dark':
      return {
        border: 'border-purple-500/60',
        bg: 'from-purple-950/70 via-violet-950/40 to-black',
        glow: 'shadow-[0_0_30px_rgba(168,85,247,0.40)]',
        text: 'text-purple-300',
        accentText: 'text-violet-300',
        portalFrom: 'from-purple-500',
        portalTo: 'to-violet-800',
        ring: 'ring-purple-500/50',
        badgeBg: 'bg-purple-500/20',
      };
    case 'light':
      return {
        border: 'border-yellow-400/70',
        bg: 'from-yellow-900/60 via-amber-950/40 to-black',
        glow: 'shadow-[0_0_30px_rgba(250,204,21,0.45)]',
        text: 'text-yellow-200',
        accentText: 'text-amber-200',
        portalFrom: 'from-yellow-300',
        portalTo: 'to-amber-600',
        ring: 'ring-yellow-400/50',
        badgeBg: 'bg-yellow-400/20',
      };
    case 'void':
      return {
        border: 'border-pink-500/60',
        bg: 'from-pink-950/70 via-fuchsia-950/40 to-black',
        glow: 'shadow-[0_0_30px_rgba(236,72,153,0.40)]',
        text: 'text-pink-300',
        accentText: 'text-fuchsia-300',
        portalFrom: 'from-pink-500',
        portalTo: 'to-fuchsia-800',
        ring: 'ring-pink-500/50',
        badgeBg: 'bg-pink-500/20',
      };
  }
}

// ============= Screen Header =============

function DungeonHeader() {
  return (
    <div className="text-center mb-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center justify-center gap-2 mb-1"
      >
        <motion.div
          animate={{ scale: [1, 1.18, 1], rotate: [0, -6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Flame className="w-12 h-12 text-orange-400 drop-shadow-[0_0_12px_rgba(255,140,0,0.55)]" />
        </motion.div>
      </motion.div>
      <h2 className="text-2xl font-black gold-text tracking-wide">
        Daily Dungeons
      </h2>
      <p className="text-xs text-gray-400 mt-1">
        Elemental trials that rotate with the day — claim rare ascension materials
      </p>
    </div>
  );
}

// ============= Daily Reset Countdown =============

function DailyResetCountdown({ lastReset, now }: { lastReset: number; now: number }) {
  const resetElapsed = now - lastReset;
  const nextResetIn = Math.max(0, RESET_MS - resetElapsed);
  return (
    <div className="flex items-center gap-1.5 bg-black/40 border border-cyan-500/30 rounded-full px-2.5 py-1">
      <Timer className="w-3 h-3 text-cyan-400" />
      <span className="text-[10px] text-gray-400">Attempts reset in</span>
      <span className="text-[11px] font-bold text-cyan-300 font-mono tabular-nums">
        {formatDuration(nextResetIn)}
      </span>
    </div>
  );
}

// ============= Animated Dungeon Portal =============

function DungeonPortal({ element, icon }: { element: Element; icon: string }) {
  const theme = getElementTheme(element);
  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
      {/* Outer rotating ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        className={`absolute inset-0 rounded-full border-2 border-dashed ${theme.border} opacity-60`}
      />
      {/* Inner counter-rotating ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className={`absolute inset-2 rounded-full border ${theme.border} opacity-40`}
      />
      {/* Portal core with gradient and pulse */}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute inset-4 rounded-full bg-gradient-to-br ${theme.portalFrom} ${theme.portalTo} ${theme.glow} flex items-center justify-center`}
      >
        <span className="text-3xl sm:text-4xl drop-shadow-[0_0_8px_rgba(0,0,0,0.6)]">
          {icon}
        </span>
      </motion.div>
      {/* Sparkles orbiting */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={{ rotate: 360 }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
          style={{ transformOrigin: 'center' }}
        >
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
            className={`absolute w-1.5 h-1.5 rounded-full ${theme.portalFrom.replace('from-', 'bg-')}`}
            style={{
              top: i === 0 ? '0' : i === 2 ? 'auto' : '50%',
              bottom: i === 2 ? '0' : 'auto',
              left: i === 1 ? '0' : i === 3 ? 'auto' : '50%',
              right: i === 3 ? '0' : 'auto',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ============= Featured Dungeon Card (today) =============

function FeaturedDungeonCard({
  dungeon,
  attempts,
  lastReset,
  now,
  playerPower,
  highestStage,
  onSelectStage,
}: {
  dungeon: DailyDungeon;
  attempts: number;
  lastReset: number;
  now: number;
  playerPower: number;
  highestStage: number;
  onSelectStage: (stage: number) => void;
}) {
  const theme = getElementTheme(dungeon.element);
  const elementConfig = ELEMENT_CONFIG[dungeon.element];
  const resetElapsed = now - lastReset;
  const isReset = resetElapsed > RESET_MS;
  const usedAttempts = isReset ? 0 : attempts;
  const remainingAttempts = MAX_ATTEMPTS - usedAttempts;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.bg} border-2 ${theme.border} ${theme.glow} p-4 mb-4`}
    >
      {/* Atmospheric background swirls */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.04) 0%, transparent 50%)',
        }}
      />

      <div className="relative z-10">
        {/* Header: Today badge + reset countdown */}
        <div className="flex items-center justify-between mb-3">
          <motion.span
            animate={{ opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className={`inline-flex items-center gap-1 ${theme.badgeBg} ${theme.text} text-[10px] font-bold px-2 py-1 rounded-full border ${theme.border}`}
          >
            <Sparkles className="w-3 h-3" />
            TODAY&apos;S DUNGEON
          </motion.span>
          <DailyResetCountdown lastReset={lastReset} now={now} />
        </div>

        {/* Main: Portal + Info */}
        <div className="flex items-start gap-3 mb-3">
          <DungeonPortal element={dungeon.element} icon={dungeon.icon} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`text-xs ${theme.text} font-bold`}>
                {elementConfig.icon} {elementConfig.label}
              </span>
              <span className="text-gray-500 text-xs">·</span>
              <span className="text-xs text-gray-400">
                Difficulty <span className="text-purple-300 font-bold">x{dungeon.difficulty.toFixed(2)}</span>
              </span>
            </div>
            <h3 className="text-lg font-black gold-text leading-tight mb-1">
              {dungeon.name}
            </h3>
            <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2 mb-2">
              {dungeon.description}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-300">
              <Skull className="w-3 h-3 text-red-400" />
              <span className="font-bold text-red-300">Boss:</span>
              <span className="text-gray-200">{dungeon.bossName}</span>
            </div>
          </div>
        </div>

        {/* Quick stats grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-black/40 border border-white/5 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-wider text-gray-500 mb-0.5">
              <Swords className="w-2.5 h-2.5 text-red-400" />
              Attempts
            </div>
            <div
              className={`text-sm font-bold ${
                remainingAttempts > 0 ? 'text-amber-300' : 'text-red-400'
              }`}
            >
              {remainingAttempts}/{MAX_ATTEMPTS}
            </div>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-wider text-gray-500 mb-0.5">
              <Zap className="w-2.5 h-2.5 text-yellow-400" />
              Energy
            </div>
            <div className="text-sm font-bold text-yellow-300">
              {ENERGY_COST}/stage
            </div>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-wider text-gray-500 mb-0.5">
              <Flame className="w-2.5 h-2.5 text-orange-400" />
              Power
            </div>
            <div className="text-sm font-bold text-orange-300">
              {formatPower(playerPower)}
            </div>
          </div>
        </div>

        {/* Stage progression path */}
        <div className="bg-black/30 border border-white/5 rounded-xl p-2.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
              Stage Progression
            </span>
            <span className={`text-[10px] ${theme.text} font-bold`}>
              Best: Stage {highestStage}/5
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {dungeon.stages.map((stage, idx) => {
              const isCleared = stage.stage <= highestStage;
              const isCurrent = stage.stage === highestStage + 1;
              const isLocked = stage.stage > highestStage + 1;
              const canChallenge = remainingAttempts > 0 && !isLocked;
              return (
                <div key={stage.stage} className="flex items-center flex-1">
                  <motion.button
                    whileHover={canChallenge ? { scale: 1.08 } : {}}
                    whileTap={canChallenge ? { scale: 0.92 } : {}}
                    onClick={() => canChallenge && onSelectStage(stage.stage)}
                    disabled={!canChallenge}
                    className={`relative w-9 h-9 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all ${
                      isCleared
                        ? 'bg-green-900/40 border-green-600/50 text-green-300'
                        : isCurrent
                        ? `${theme.badgeBg} ${theme.border} ${theme.text} ${theme.glow}`
                        : 'bg-gray-900/60 border-gray-800/60 text-gray-600'
                    } ${canChallenge ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  >
                    {isCleared ? (
                      <Check className="w-4 h-4" />
                    ) : isLocked ? (
                      <Lock className="w-3 h-3" />
                    ) : (
                      stage.stage
                    )}
                    {isCurrent && (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full"
                      />
                    )}
                  </motion.button>
                  {idx < dungeon.stages.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 ${
                        isCleared ? 'bg-green-600/50' : 'bg-gray-800/60'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-[9px] text-gray-500 mt-1.5 text-center">
            Tap a stage to view details and challenge it
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ============= Stage Detail Card =============

function StageDetailCard({
  dungeon,
  stage,
  attempts,
  lastReset,
  now,
  highestStage,
  playerPower,
  onChallenge,
}: {
  dungeon: DailyDungeon;
  stage: DungeonStage;
  attempts: number;
  lastReset: number;
  now: number;
  highestStage: number;
  playerPower: number;
  onChallenge: () => void;
}) {
  const theme = getElementTheme(dungeon.element);
  const elementConfig = ELEMENT_CONFIG[dungeon.element];
  const resetElapsed = now - lastReset;
  const isReset = resetElapsed > RESET_MS;
  const usedAttempts = isReset ? 0 : attempts;
  const remainingAttempts = MAX_ATTEMPTS - usedAttempts;

  const isCleared = stage.stage <= highestStage;
  const isCurrent = stage.stage === highestStage + 1;
  const isLocked = stage.stage > highestStage + 1;

  // Power comparison
  const enemyPower = Math.floor(stage.recommendedPower * dungeon.difficulty);
  const powerRatio = playerPower / Math.max(1, enemyPower);
  let powerLabel = 'Overwhelming';
  let powerColor = 'text-green-400';
  if (powerRatio < 0.5) {
    powerLabel = 'Deadly';
    powerColor = 'text-red-400';
  } else if (powerRatio < 0.85) {
    powerLabel = 'Hard';
    powerColor = 'text-orange-400';
  } else if (powerRatio < 1.15) {
    powerLabel = 'Even';
    powerColor = 'text-yellow-400';
  } else if (powerRatio < 2) {
    powerLabel = 'Favorable';
    powerColor = 'text-cyan-400';
  }

  const disabled =
    isLocked || remainingAttempts <= 0;

  return (
    <motion.div
      key={stage.stage}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden rounded-xl border-2 p-4 mb-4 bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.glow}`}
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.text} border ${theme.border}`}
              >
                STAGE {stage.stage} / 5
              </span>
              {isCleared && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-300 bg-green-900/40 border border-green-700/40 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" />
                  CLEARED
                </span>
              )}
              {isCurrent && (
                <motion.span
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 rounded-full"
                >
                  <Sparkles className="w-3 h-3" />
                  CURRENT
                </motion.span>
              )}
              {isLocked && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-800/80 border border-gray-700/40 px-2 py-0.5 rounded-full">
                  <Lock className="w-3 h-3" />
                  LOCKED
                </span>
              )}
            </div>
            <h3 className={`text-base font-bold leading-tight ${theme.accentText}`}>
              {stage.name}
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {dungeon.name} · {elementConfig.icon} {elementConfig.label}
            </p>
          </div>
          <div className="text-2xl flex-shrink-0">{dungeon.icon}</div>
        </div>

        {/* Recommended power + difficulty assessment */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-black/40 border border-white/5 rounded-lg p-2">
            <div className="text-[9px] uppercase tracking-wider text-gray-500 mb-0.5">
              Recommended Power
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-sm font-bold text-orange-300">
                {formatPower(stage.recommendedPower)}
              </span>
            </div>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-lg p-2">
            <div className="text-[9px] uppercase tracking-wider text-gray-500 mb-0.5">
              Difficulty
            </div>
            <div className={`text-sm font-bold ${powerColor}`}>{powerLabel}</div>
          </div>
        </div>

        {/* Rewards breakdown */}
        <div className="bg-black/40 border border-white/5 rounded-lg p-2.5 mb-3">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1">
            <Coins className="w-3 h-3 text-amber-400" />
            Stage Rewards (on victory)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center">
              <Coins className="w-4 h-4 text-amber-400 mb-0.5" />
              <div className="text-[9px] text-gray-500">Gold</div>
              <div className="text-xs font-bold text-amber-300">
                {stage.rewards.gold.toLocaleString()}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <Gem className="w-4 h-4 text-cyan-400 mb-0.5" />
              <div className="text-[9px] text-gray-500">Gems</div>
              <div className="text-xs font-bold text-cyan-300">
                {stage.rewards.gems}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-base mb-0.5">
                {DUNGEON_MATERIALS[stage.rewards.material]?.icon || '💎'}
              </span>
              <div className="text-[9px] text-gray-500 truncate w-full text-center">
                {stage.rewards.material.split(' ')[0]}
              </div>
              <div className={`text-xs font-bold ${theme.text}`}>
                +{stage.rewards.materialCount}
              </div>
            </div>
          </div>
        </div>

        {/* Material hint */}
        <div className="bg-black/30 border border-white/5 rounded-lg p-2 mb-3 flex items-start gap-2">
          <span className="text-base flex-shrink-0">
            {DUNGEON_MATERIALS[stage.rewards.material]?.icon || '💎'}
          </span>
          <div className="flex-1 min-w-0">
            <div className={`text-[10px] font-bold ${theme.text}`}>
              {stage.rewards.material}
            </div>
            <p className="text-[9px] text-gray-500 leading-snug">
              {DUNGEON_MATERIALS[stage.rewards.material]?.use}
            </p>
          </div>
        </div>

        {/* Lock warning */}
        {isLocked && (
          <div className="bg-gray-900/60 border border-gray-700/50 rounded-lg p-2 mb-3 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-[10px] text-gray-400 font-medium">
              Clear Stage {highestStage + 1} first to unlock this stage.
            </span>
          </div>
        )}

        {/* No attempts warning */}
        {!isLocked && remainingAttempts <= 0 && (
          <div className="bg-red-950/40 border border-red-700/40 rounded-lg p-2 mb-3 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            <span className="text-[10px] text-red-300 font-medium">
              No attempts remaining for {dungeon.name} today. Reset in{' '}
              {formatDuration(RESET_MS - (Date.now() - lastReset))}.
            </span>
          </div>
        )}

        {/* Challenge button */}
        <motion.button
          whileHover={disabled ? {} : { scale: 1.02 }}
          whileTap={disabled ? {} : { scale: 0.98 }}
          onClick={onChallenge}
          disabled={disabled}
          className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-shadow ${
            disabled
              ? 'bg-gray-800/60 text-gray-500 border border-gray-700/40 cursor-not-allowed'
              : `bg-gradient-to-r ${theme.portalFrom} ${theme.portalTo} text-white shadow-lg`
          }`}
        >
          <Swords className="w-4 h-4" />
          {disabled
            ? isLocked
              ? `Locked — Clear Stage ${highestStage + 1}`
              : 'No Attempts Left'
            : `Challenge Stage ${stage.stage}`}
          {!disabled && (
            <span className="ml-1 bg-black/30 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5" /> {ENERGY_COST}
            </span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ============= Weekly Schedule Grid =============

function WeeklySchedule({
  todayDungeonId,
  selectedDungeonId,
  onSelect,
}: {
  todayDungeonId: string | null;
  selectedDungeonId: string;
  onSelect: (dungeonId: string) => void;
}) {
  // Sort dungeons by day of week for predictable layout
  const ordered = [...DAILY_DUNGEONS].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  const today = new Date().getDay();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mb-4"
    >
      <h3 className="text-sm font-bold text-amber-200 mb-2 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-amber-400" />
        Weekly Schedule
        <span className="text-[10px] text-gray-500 font-normal ml-1">
          Tap any dungeon to inspect
        </span>
      </h3>
      <div className="bg-black/30 border border-amber-500/15 rounded-xl p-2.5">
        <div className="grid grid-cols-7 gap-1">
          {ordered.map((dungeon) => {
            const isToday = dungeon.dayOfWeek === today;
            const isSelected = dungeon.id === selectedDungeonId;
            const theme = getElementTheme(dungeon.element);
            return (
              <motion.button
                key={dungeon.id}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelect(dungeon.id)}
                className={`relative rounded-lg border p-1.5 flex flex-col items-center gap-0.5 transition-all ${
                  isToday
                    ? `${theme.bg} ${theme.border} ${theme.glow}`
                    : isSelected
                    ? 'bg-gray-800/60 border-gray-600/60'
                    : 'bg-gray-900/40 border-gray-800/40 opacity-60 hover:opacity-100'
                }`}
              >
                {/* Today indicator */}
                {isToday && (
                  <motion.span
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                  />
                )}
                {/* Day label */}
                <span
                  className={`text-[8px] font-bold uppercase ${
                    isToday ? theme.text : 'text-gray-500'
                  }`}
                >
                  {DAY_SHORT[dungeon.dayOfWeek]}
                </span>
                {/* Icon */}
                <span className="text-lg leading-none">{dungeon.icon}</span>
                {/* Element indicator */}
                <span
                  className={`text-[7px] ${
                    isToday ? theme.accentText : 'text-gray-600'
                  }`}
                >
                  {ELEMENT_CONFIG[dungeon.element].label.slice(0, 4)}
                </span>
                {/* Difficulty */}
                <span
                  className={`text-[7px] font-bold ${
                    isToday ? 'text-purple-300' : 'text-gray-700'
                  }`}
                >
                  x{dungeon.difficulty.toFixed(1)}
                </span>
                {isToday && (
                  <span className="text-[7px] text-amber-300 font-bold mt-0.5">
                    LIVE
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-1 mt-2 text-[9px] text-gray-500">
          <Calendar className="w-2.5 h-2.5 text-amber-400" />
          <span>
            Today is <span className="text-amber-300 font-bold">{DAY_NAMES[today]}</span> — highlighted dungeon is live
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ============= Material Inventory =============

function MaterialInventory({
  materials,
}: {
  materials: { [name: string]: number };
}) {
  const owned = Object.entries(materials).filter(([, count]) => count > 0);
  const allMaterials = Object.keys(DUNGEON_MATERIALS);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mb-4"
    >
      <h3 className="text-sm font-bold text-amber-200 mb-2 flex items-center gap-2">
        <Package className="w-4 h-4 text-amber-400" />
        Material Vault
        <span className="text-[10px] text-gray-500 font-normal ml-1">
          {owned.length}/{allMaterials.length} types discovered
        </span>
      </h3>
      <div className="bg-black/30 border border-amber-500/15 rounded-xl p-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {allMaterials.map((name) => {
            const mat = DUNGEON_MATERIALS[name];
            const count = materials[name] || 0;
            const theme = getElementTheme(mat.element);
            const hasMaterial = count > 0;
            return (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative rounded-lg border p-2 ${
                  hasMaterial
                    ? `${theme.bg} ${theme.border}`
                    : 'bg-gray-900/40 border-gray-800/40 opacity-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-lg">{mat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-[10px] font-bold truncate ${
                        hasMaterial ? theme.text : 'text-gray-500'
                      }`}
                    >
                      {name}
                    </div>
                    <div className={`text-[8px] ${hasMaterial ? theme.accentText : 'text-gray-600'}`}>
                      {ELEMENT_CONFIG[mat.element].label}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] text-gray-500 leading-tight line-clamp-2 flex-1 pr-1">
                    {mat.description.split('.')[0]}.
                  </span>
                  <span
                    className={`text-sm font-black flex-shrink-0 ${
                      hasMaterial ? theme.text : 'text-gray-700'
                    }`}
                  >
                    {count}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
        {owned.length === 0 && (
          <div className="text-center py-3 text-[10px] text-gray-500">
            No materials collected yet. Conquer today&apos;s dungeon to begin your hoard!
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============= Battle Result Modal =============

function BattleResultModal({
  result,
  onClose,
}: {
  result: DungeonBattleResult;
  onClose: () => void;
}) {
  const { won, rewards, dungeonName, stage, element } = result;
  const theme = getElementTheme(element);

  // Confetti particles for victory
  const confetti = useMemo(() => {
    if (!won) return [];
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.4 + Math.random() * 1.8,
      color: ['#ffd700', '#ff6b00', '#ff4500', '#ffe066', '#ff8c00', '#ffaa00'][i % 6],
      size: 4 + Math.random() * 6,
      rotate: Math.random() * 360,
    }));
  }, [won]);

  // Ash particles for defeat
  const ash = useMemo(() => {
    if (won) return [];
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 1.8 + Math.random() * 1.8,
      size: 3 + Math.random() * 5,
    }));
  }, [won]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Background radial glow */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`absolute inset-0 pointer-events-none ${
          won
            ? 'bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.18),transparent_60%)]'
            : 'bg-[radial-gradient(circle_at_center,rgba(120,40,40,0.30),transparent_60%)]'
        }`}
      />

      {/* Confetti for victory */}
      {won &&
        confetti.map((c) => (
          <motion.div
            key={c.id}
            initial={{ y: -50, x: `${c.x}%`, opacity: 1, rotate: 0 }}
            animate={{ y: '110vh', opacity: [1, 1, 0], rotate: c.rotate }}
            transition={{
              duration: c.duration,
              delay: c.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute top-0 pointer-events-none"
            style={{
              width: c.size,
              height: c.size * 1.5,
              backgroundColor: c.color,
              borderRadius: 1,
            }}
          />
        ))}

      {/* Ash particles for defeat */}
      {!won &&
        ash.map((a) => (
          <motion.div
            key={a.id}
            initial={{ y: -50, x: `${a.x}%`, opacity: 0.8 }}
            animate={{ y: '110vh', opacity: [0.8, 0.4, 0] }}
            transition={{
              duration: a.duration,
              delay: a.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="absolute top-0 pointer-events-none rounded-full bg-gray-500"
            style={{ width: a.size, height: a.size }}
          />
        ))}

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.7, opacity: 0, y: 30 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm rounded-2xl border-2 p-6 text-center ${
          won
            ? `bg-gradient-to-b ${theme.bg} ${theme.border} shadow-[0_0_40px_rgba(255,215,0,0.40)]`
            : 'bg-gradient-to-b from-red-950/95 via-gray-950/80 to-black border-red-700/60 shadow-[0_0_40px_rgba(220,38,38,0.30)]'
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white p-1 rounded transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Stage badge */}
        <div
          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${
            won
              ? `${theme.badgeBg} ${theme.text} border ${theme.border}`
              : 'bg-red-900/40 text-red-300 border border-red-700/40'
          }`}
        >
          {dungeonName} · Stage {stage}
        </div>

        {/* Trophy / Skull emblem */}
        <motion.div
          initial={{ scale: 0, rotate: won ? -90 : 90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
          className={`mx-auto mb-3 w-20 h-20 rounded-full flex items-center justify-center border-2 ${
            won
              ? `${theme.badgeBg} ${theme.border}`
              : 'bg-red-900/30 border-red-700/50'
          }`}
        >
          {won ? (
            <Trophy className="w-12 h-12 text-amber-300" />
          ) : (
            <Skull className="w-12 h-12 text-red-400" />
          )}
        </motion.div>

        {/* Result Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className={`text-4xl font-black tracking-wider ${
            won ? 'gold-text' : 'text-red-400'
          }`}
          style={
            won
              ? { filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.5))' }
              : { filter: 'drop-shadow(0 0 8px rgba(220,38,38,0.5))' }
          }
        >
          {won ? 'VICTORY' : 'DEFEAT'}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className={`text-xs mt-1 mb-4 ${
            won ? 'text-amber-200/80' : 'text-red-300/70'
          }`}
        >
          {won
            ? `Stage ${stage} of ${dungeonName} conquered. Spoils claimed.`
            : `Your champions fell in ${dungeonName}. Regroup and try again.`}
        </motion.p>

        {/* Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-black/40 border border-white/10 rounded-xl p-3 mb-4 space-y-2"
        >
          <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
            {won ? 'Spoils of Victory' : 'Consolation'}
          </div>
          <RewardRow
            icon={<Coins className="w-4 h-4 text-amber-400" />}
            label="Gold"
            value={`+${rewards.gold.toLocaleString()}`}
            color="text-amber-300"
          />
          <RewardRow
            icon={<Gem className="w-4 h-4 text-cyan-400" />}
            label="Gems"
            value={rewards.gems > 0 ? `+${rewards.gems}` : '—'}
            color="text-cyan-300"
          />
          {won && rewards.material && (
            <RewardRow
              icon={
                <span className="text-base">
                  {DUNGEON_MATERIALS[rewards.material]?.icon || '💎'}
                </span>
              }
              label={rewards.material}
              value={`+${rewards.materialCount}`}
              color={theme.text}
            />
          )}
        </motion.div>

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onClose}
          className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide ${
            won
              ? `bg-gradient-to-r ${theme.portalFrom} ${theme.portalTo} text-white shadow-lg`
              : 'bg-gradient-to-r from-red-700 to-gray-800 text-white shadow-lg shadow-red-700/30'
          }`}
        >
          {won ? 'Continue' : 'Try Again'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function RewardRow({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        {icon}
        <span className="text-xs text-gray-400 truncate">{label}</span>
      </div>
      <span className={`text-sm font-bold ${color} flex-shrink-0`}>{value}</span>
    </div>
  );
}

// ============= Empty Team Guard =============

function EmptyTeamGuard({ onGoToHeroes }: { onGoToHeroes: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col items-center justify-center text-center bg-gradient-to-b from-red-950/30 to-black/40 border-2 border-red-700/30 rounded-2xl p-8"
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-full bg-red-900/30 border-2 border-red-700/40 flex items-center justify-center mb-4"
      >
        <Skull className="w-10 h-10 text-red-400" />
      </motion.div>
      <h3 className="text-lg font-bold gold-text mb-2">No Team Assembled</h3>
      <p className="text-sm text-gray-400 mb-1">
        You need at least one champion in your team to brave the daily dungeons.
      </p>
      <p className="text-xs text-gray-500 mb-5">
        Assemble a team of worthy champions before descending into elemental trials.
      </p>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onGoToHeroes}
        className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-2"
      >
        <Swords className="w-4 h-4" />
        Go to Heroes
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

// ============= Main Screen =============

export function DungeonScreen() {
  const team = useGameStore((s) => s.team);
  const heroes = useGameStore((s) => s.heroes);
  const player = useGameStore((s) => s.player);
  const setScreen = useGameStore((s) => s.setScreen);
  const dungeonAttempts = useGameStore((s) => s.dungeonAttempts);
  const dungeonLastReset = useGameStore((s) => s.dungeonLastReset);
  const dungeonMaterials = useGameStore((s) => s.dungeonMaterials);
  const dungeonHighestStage = useGameStore((s) => s.dungeonHighestStage);
  const startDungeonBattle = useGameStore((s) => s.startDungeonBattle);
  const resetDungeonAttempts = useGameStore((s) => s.resetDungeonAttempts);

  const todayDungeon = useMemo(() => getTodayDungeon(), []);
  const [selectedDungeonId, setSelectedDungeonId] = useState<string>(
    todayDungeon?.id || DAILY_DUNGEONS[0].id
  );
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const [lastResult, setLastResult] = useState<DungeonBattleResult | null>(null);
  const [now, setNow] = useState(Date.now());

  // Tick every second for reset countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
      resetDungeonAttempts();
    }, 1000);
    return () => clearInterval(interval);
  }, [resetDungeonAttempts]);

  // Player's team power (matches store calculation)
  const playerPower = useMemo(() => {
    return team.reduce((sum, id) => {
      const h = heroes.find((hr) => hr.id === id);
      return (
        sum +
        (h
          ? h.attack + h.defense + Math.floor(h.health / 10) + h.speed * 5
          : 0)
      );
    }, 0);
  }, [team, heroes]);

  const selectedDungeon = useMemo(
    () => getDungeonById(selectedDungeonId) || DAILY_DUNGEONS[0],
    [selectedDungeonId]
  );

  const selectedStageData = useMemo(
    () => selectedDungeon.stages[selectedStage - 1] || selectedDungeon.stages[0],
    [selectedDungeon, selectedStage]
  );

  const today = new Date().getDay();
  const isTodaySelected = selectedDungeon.dayOfWeek === today;
  const highestStageForSelected = dungeonHighestStage[selectedDungeon.id] || 0;
  const attemptsForSelected = dungeonAttempts[selectedDungeon.id] || 0;

  const handleSelectDungeon = (dungeonId: string) => {
    setSelectedDungeonId(dungeonId);
    const dungeon = getDungeonById(dungeonId);
    if (dungeon) {
      const highest = dungeonHighestStage[dungeonId] || 0;
      // Default-select the next uncleared stage (or stage 1)
      setSelectedStage(Math.min(5, highest + 1));
    }
  };

  const handleSelectStage = (stage: number) => {
    setSelectedStage(stage);
    // Scroll to stage detail
    setTimeout(() => {
      document
        .getElementById('dungeon-stage-detail')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const handleChallenge = () => {
    if (!isTodaySelected) return;
    const result = startDungeonBattle(selectedDungeon.id, selectedStage);
    if (result) {
      setLastResult({
        won: result.won,
        rewards: result.rewards,
        dungeonName: selectedDungeon.name,
        stage: selectedStage,
        element: selectedDungeon.element,
      });
    }
  };

  // ===== Empty team guard =====
  if (team.length === 0) {
    return (
      <div className="relative p-3 sm:p-4 max-w-4xl mx-auto min-h-[60vh] flex flex-col">
        {/* Dark fantasy atmospheric bg */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 20% 0%, rgba(120,40,30,0.18), transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(120,30,80,0.18), transparent 55%), linear-gradient(180deg, #0a0612 0%, #000000 100%)',
          }}
        />
        <DungeonHeader />
        <EmptyTeamGuard onGoToHeroes={() => setScreen('heroes')} />
      </div>
    );
  }

  return (
    <div className="relative p-3 sm:p-4 max-w-4xl mx-auto">
      {/* Dark fantasy atmospheric background */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(120,40,30,0.22), transparent 55%), radial-gradient(ellipse at 0% 100%, rgba(80,30,120,0.16), transparent 55%), radial-gradient(ellipse at 100% 50%, rgba(120,30,30,0.18), transparent 60%), linear-gradient(180deg, #1a0a2e 0%, #0f0f23 60%, #000000 100%)',
        }}
      />

      <DungeonHeader />

      {/* Featured today's dungeon */}
      {todayDungeon && (
        <FeaturedDungeonCard
          dungeon={todayDungeon}
          attempts={attemptsForSelected && selectedDungeon.id === todayDungeon.id ? attemptsForSelected : (dungeonAttempts[todayDungeon.id] || 0)}
          lastReset={dungeonLastReset}
          now={now}
          playerPower={playerPower}
          highestStage={dungeonHighestStage[todayDungeon.id] || 0}
          onSelectStage={(stage) => {
            setSelectedDungeonId(todayDungeon.id);
            setSelectedStage(stage);
            setTimeout(() => {
              document
                .getElementById('dungeon-stage-detail')
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 50);
          }}
        />
      )}

      {/* Weekly schedule */}
      <WeeklySchedule
        todayDungeonId={todayDungeon?.id || null}
        selectedDungeonId={selectedDungeon.id}
        onSelect={handleSelectDungeon}
      />

      {/* Stage detail card for selected dungeon */}
      <div id="dungeon-stage-detail">
        <motion.div
          key={selectedDungeon.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Selected dungeon header banner */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
              <span className="text-lg">{selectedDungeon.icon}</span>
              <span>{selectedDungeon.name}</span>
              {!isTodaySelected && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-800/80 border border-gray-700/40 px-2 py-0.5 rounded-full">
                  <Lock className="w-3 h-3" />
                  Not Today
                </span>
              )}
              {isTodaySelected && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  Available
                </span>
              )}
            </h3>
            <span className="text-[10px] text-gray-500">
              {DAY_NAMES[selectedDungeon.dayOfWeek]} ·{' '}
              <span className="text-purple-300 font-bold">
                x{selectedDungeon.difficulty.toFixed(2)}
              </span>
            </span>
          </div>

          {/* Stage tabs */}
          <div className="flex items-center gap-1 mb-3 overflow-x-auto game-scrollbar pb-1">
            {selectedDungeon.stages.map((stage) => {
              const isCleared = stage.stage <= highestStageForSelected;
              const isCurrent = stage.stage === highestStageForSelected + 1;
              const isLocked = stage.stage > highestStageForSelected + 1;
              const isSelected = stage.stage === selectedStage;
              return (
                <motion.button
                  key={stage.stage}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedStage(stage.stage)}
                  className={`relative flex-shrink-0 w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-[10px] font-bold transition-all ${
                    isSelected
                      ? isCleared
                        ? 'bg-green-900/50 border-green-500/60 text-green-200'
                        : 'bg-amber-500/20 border-amber-400/70 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                      : isCleared
                      ? 'bg-green-950/40 border-green-800/40 text-green-400'
                      : isLocked
                      ? 'bg-gray-900/40 border-gray-800/40 text-gray-600'
                      : 'bg-gray-900/60 border-gray-700/50 text-gray-300'
                  }`}
                >
                  <span className="text-[8px] uppercase text-gray-500 leading-none">
                    Stg
                  </span>
                  <span className="text-sm font-black leading-none">
                    {stage.stage}
                  </span>
                  {isCleared && (
                    <Check className="absolute -top-1 -right-1 w-3 h-3 text-green-400 bg-black rounded-full p-0.5" />
                  )}
                  {isLocked && (
                    <Lock className="absolute -top-1 -right-1 w-3 h-3 text-gray-500 bg-black rounded-full p-0.5" />
                  )}
                  {isCurrent && !isSelected && (
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          <StageDetailCard
            dungeon={selectedDungeon}
            stage={selectedStageData}
            attempts={attemptsForSelected}
            lastReset={dungeonLastReset}
            now={now}
            highestStage={highestStageForSelected}
            playerPower={playerPower}
            onChallenge={handleChallenge}
          />
        </motion.div>
      </div>

      {/* Material inventory */}
      <MaterialInventory materials={dungeonMaterials} />

      {/* Elements legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-black/30 border border-white/5 rounded-xl p-3 mb-4"
      >
        <h4 className="text-xs font-bold text-amber-200 mb-2 flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-amber-400" />
          Elemental Affinities
        </h4>
        <div className="grid grid-cols-3 gap-1.5">
          {(Object.keys(ELEMENT_CONFIG) as Element[]).map((el) => {
            const cfg = ELEMENT_CONFIG[el];
            const theme = getElementTheme(el);
            return (
              <div
                key={el}
                className="flex items-center gap-1.5 text-[10px] text-gray-400"
              >
                <span className="text-base">{cfg.icon}</span>
                <span className={theme.text}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1.5 text-[9px] text-gray-500">
          <Crown className="w-3 h-3 text-yellow-400" />
          <span>
            Each material will be used in a future Hero Awakening system to
            empower champions of matching affinity.
          </span>
        </div>
      </motion.div>

      {/* Battle result modal */}
      <AnimatePresence>
        {lastResult && (
          <BattleResultModal
            result={lastResult}
            onClose={() => setLastResult(null)}
          />
        )}
      </AnimatePresence>

      {/* Bottom spacer for nav */}
      <div className="h-2" />
    </div>
  );
}
