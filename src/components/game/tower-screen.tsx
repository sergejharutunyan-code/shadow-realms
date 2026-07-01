'use client';

import { useGameStore } from '@/lib/game-store';
import {
  TOWER_FLOORS,
  TOWER_FLOOR_THEMES,
  FACTION_CONFIG,
  TowerFloor,
  Faction,
} from '@/lib/game-data';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import {
  Castle,
  Trophy,
  Clock,
  Skull,
  Lock,
  Check,
  ChevronUp,
  Flame,
  Crown,
  Gem,
  Coins,
  RotateCcw,
  Swords,
} from 'lucide-react';

// ============= Types =============

interface TowerBattleResult {
  won: boolean;
  rewards: { gold: number; gems: number; item?: string };
  floor: number;
}

// ============= Helpers =============

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

const RESET_MS = 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;

// ============= Screen Header =============

function TowerHeader() {
  return (
    <div className="text-center mb-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center justify-center gap-2 mb-1"
      >
        <motion.div
          animate={{ scale: [1, 1.12, 1], rotate: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Castle className="w-12 h-12 text-amber-400 drop-shadow-[0_0_10px_rgba(255,200,50,0.45)]" />
        </motion.div>
      </motion.div>
      <h2 className="text-2xl font-black gold-text tracking-wide">
        Tower of Eternity
      </h2>
      <p className="text-xs text-gray-400 mt-1">
        Climb 100 floors of endless challenge
      </p>
    </div>
  );
}

// ============= Player Status Panel =============

function PlayerStatusPanel({
  currentFloor,
  highestFloor,
  attempts,
  lastReset,
  playerPower,
  now,
}: {
  currentFloor: number;
  highestFloor: number;
  attempts: number;
  lastReset: number;
  playerPower: number;
  now: number;
}) {
  // Effective attempts after potential 24h reset window
  const resetElapsed = now - lastReset;
  const effectiveAttempts = resetElapsed > RESET_MS ? MAX_ATTEMPTS : attempts;
  const nextResetIn = Math.max(0, RESET_MS - resetElapsed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-950/50 via-amber-950/20 to-black border border-amber-500/30 p-4 mb-4"
    >
      {/* Decorative castle watermark */}
      <div className="absolute -top-3 -right-3 opacity-10 pointer-events-none">
        <Castle className="w-28 h-28 text-amber-400" />
      </div>

      <div className="relative z-10">
        {/* Big current floor indicator */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">
              Current Floor
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-5xl font-black gold-text leading-none">
                {currentFloor}
              </span>
              <span className="text-sm text-gray-500">/ 100</span>
            </div>
          </div>
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/40 rounded-full px-3 py-1.5"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <div className="text-right leading-tight">
              <div className="text-[9px] uppercase tracking-wider text-amber-300/80">
                Highest
              </div>
              <div className="text-base font-bold gold-text">
                {highestFloor}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Floor progress bar */}
        <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5 mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((currentFloor / 100) * 100, 100)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-purple-600 via-amber-500 to-yellow-300 rounded-full shadow-[0_0_8px_rgba(255,200,50,0.5)]"
          />
        </div>

        {/* Attempts + countdown + power */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-black/30 border border-white/5 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-wider text-gray-500 mb-0.5">
              <Swords className="w-2.5 h-2.5 text-red-400" />
              Attempts
            </div>
            <div
              className={`text-sm font-bold ${
                effectiveAttempts > 0 ? 'text-amber-300' : 'text-red-400'
              }`}
            >
              {effectiveAttempts}/{MAX_ATTEMPTS}
            </div>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-wider text-gray-500 mb-0.5">
              <Clock className="w-2.5 h-2.5 text-cyan-400" />
              Reset
            </div>
            <div className="text-sm font-bold text-cyan-300 font-mono tabular-nums">
              {formatDuration(nextResetIn)}
            </div>
          </div>
          <div className="bg-black/30 border border-white/5 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-wider text-gray-500 mb-0.5">
              <Flame className="w-2.5 h-2.5 text-orange-400" />
              Power
            </div>
            <div className="text-sm font-bold text-orange-300">
              {formatPower(playerPower)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============= Floor Segment (Tower visualization) =============

function FloorSegment({
  floor,
  status,
  index,
}: {
  floor: TowerFloor;
  status: 'cleared' | 'current' | 'next' | 'locked';
  index: number;
}) {
  const faction = FACTION_CONFIG[floor.enemyFaction as Faction];
  const isBoss = floor.bossFloor;

  // Visual theming per status
  const theme =
    status === 'current'
      ? {
          border: 'border-amber-400/70',
          bg: 'from-amber-900/40 via-amber-950/30 to-black',
          glow: 'shadow-[0_0_18px_rgba(255,200,50,0.45)]',
          ring: 'ring-1 ring-amber-400/40',
        }
      : status === 'next'
      ? {
          border: 'border-cyan-500/40',
          bg: 'from-cyan-950/30 via-slate-950/40 to-black',
          glow: 'shadow-[0_0_10px_rgba(34,211,238,0.20)]',
          ring: '',
        }
      : status === 'cleared'
      ? {
          border: 'border-green-600/30',
          bg: 'from-green-950/20 via-black/40 to-black',
          glow: '',
          ring: '',
        }
      : {
          border: 'border-gray-800/60',
          bg: 'from-gray-950/60 via-black/40 to-black',
          glow: '',
          ring: '',
        };

  // Boss override styling
  const bossTheme = isBoss
    ? {
        border: status === 'cleared' ? 'border-red-900/40' : 'border-red-600/70',
        bg:
          status === 'cleared'
            ? 'from-red-950/30 via-black/40 to-black'
            : 'from-red-900/50 via-red-950/40 to-black',
        glow:
          status === 'cleared'
            ? ''
            : 'shadow-[0_0_22px_rgba(220,38,38,0.50)]',
      }
    : null;

  const appliedBorder = bossTheme?.border ?? theme.border;
  const appliedBg = bossTheme?.bg ?? theme.bg;
  const appliedGlow = bossTheme?.glow ?? theme.glow;

  const dimmed = status === 'cleared' || status === 'locked';
  const blurred = status === 'locked';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={`relative bg-gradient-to-r ${appliedBg} border-2 ${appliedBorder} ${appliedGlow} ${
        theme.ring
      } rounded-lg ${isBoss ? 'p-3' : 'p-2.5'} overflow-hidden ${
        blurred ? 'blur-[1.5px]' : ''
      } ${dimmed ? 'opacity-55' : ''}`}
    >
      {/* Badges */}
      <div className="absolute top-1 right-1 flex flex-col gap-1 items-end">
        {isBoss && (
          <span className="bg-red-600/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm tracking-wider shadow-[0_0_8px_rgba(220,38,38,0.6)]">
            BOSS
          </span>
        )}
        {status === 'current' && (
          <motion.span
            animate={{ opacity: [1, 0.55, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.5 rounded-sm tracking-wider"
          >
            CURRENT
          </motion.span>
        )}
        {status === 'cleared' && (
          <span className="bg-green-600/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider flex items-center gap-0.5">
            <Check className="w-2.5 h-2.5" /> CLEAR
          </span>
        )}
        {status === 'locked' && (
          <span className="bg-gray-800/90 text-gray-400 text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-wider flex items-center gap-0.5">
            <Lock className="w-2.5 h-2.5" /> LOCKED
          </span>
        )}
      </div>

      {/* Floor number + faction + name */}
      <div className="flex items-center gap-2 pr-16">
        <div
          className={`flex flex-col items-center justify-center min-w-[44px] ${
            isBoss ? 'min-w-[52px]' : ''
          }`}
        >
          <div className="text-[9px] uppercase tracking-wider text-gray-500 leading-none">
            Flr
          </div>
          <div
            className={`font-black leading-none ${
              isBoss
                ? 'text-2xl text-red-400'
                : status === 'current'
                ? 'text-2xl gold-text'
                : 'text-xl text-amber-200'
            }`}
          >
            {floor.floor}
          </div>
          <div className="text-base leading-none mt-0.5">{faction.icon}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div
            className={`text-xs font-bold truncate ${
              isBoss ? 'text-red-300' : 'text-amber-100'
            }`}
          >
            {floor.name}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
            <span className={`flex items-center gap-0.5 ${faction.color}`}>
              {faction.label}
            </span>
            <span className="text-gray-600">·</span>
            <span className="flex items-center gap-0.5 text-purple-300">
              <Flame className="w-2.5 h-2.5" />
              x{floor.difficulty.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Rewards preview */}
      <div className="flex items-center gap-3 mt-1.5 text-[10px]">
        <div className="flex items-center gap-0.5">
          <Coins className="w-3 h-3 text-amber-400" />
          <span className="text-amber-300 font-bold">
            {floor.rewardGold.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <Gem className="w-3 h-3 text-cyan-400" />
          <span className="text-cyan-300 font-bold">{floor.rewardGems}</span>
        </div>
        {floor.rewardItem && (
          <div className="flex items-center gap-0.5">
            <Crown className="w-3 h-3 text-yellow-400" />
            <span className="text-yellow-200 font-bold truncate max-w-[110px]">
              {floor.rewardItem}
            </span>
          </div>
        )}
      </div>

      {/* Boss overlay flair */}
      {isBoss && status !== 'cleared' && status !== 'locked' && (
        <div className="absolute -bottom-3 -left-3 opacity-15 pointer-events-none">
          <Skull className="w-20 h-20 text-red-500" />
        </div>
      )}
    </motion.div>
  );
}

// ============= Tower Visualization =============

function TowerVisualization({
  currentFloor,
}: {
  currentFloor: number;
}) {
  // Visible floors: from max(1, current-2) to current+5 -> 8 floors
  const startFloor = Math.max(1, currentFloor - 2);
  const endFloor = Math.min(100, currentFloor + 5);
  const visibleFloors: TowerFloor[] = [];
  for (let f = startFloor; f <= endFloor; f++) {
    visibleFloors.push(TOWER_FLOORS[f - 1]);
  }

  // Render in DESCENDING order so highest floor is at top of visual stack
  const ordered = [...visibleFloors].reverse();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-4"
    >
      <h3 className="text-sm font-bold text-amber-200 mb-2 flex items-center gap-2">
        <Castle className="w-4 h-4 text-amber-400" />
        Tower Ascent
        <span className="text-[10px] text-gray-500 font-normal ml-1">
          Floors {startFloor}–{endFloor}
        </span>
      </h3>

      {/* Tower shaft with vertical spine */}
      <div className="relative bg-black/40 border border-amber-500/15 rounded-xl p-3">
        {/* Vertical glow spine behind segments */}
        <div
          className="absolute top-3 bottom-3 left-1/2 -translate-x-1/2 w-1 rounded-full bg-gradient-to-t from-amber-600/10 via-amber-500/20 to-transparent pointer-events-none"
          aria-hidden
        />

        <div className="relative flex flex-col gap-2 max-h-[420px] overflow-y-auto game-scrollbar pr-1">
          {ordered.map((floor, idx) => {
            const status =
              floor.floor < currentFloor
                ? 'cleared'
                : floor.floor === currentFloor
                ? 'current'
                : floor.floor === currentFloor + 1
                ? 'next'
                : 'locked';
            return (
              <FloorSegment
                key={floor.floor}
                floor={floor}
                status={status}
                index={idx}
              />
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-gray-500">
        <ChevronUp className="w-3 h-3 text-amber-400/70" />
        <span>Climb upward — defeat floor {currentFloor} to advance</span>
      </div>
    </motion.div>
  );
}

// ============= Floor Detail Card =============

function FloorDetailCard({
  floor,
  attempts,
  lastReset,
  now,
  onChallenge,
}: {
  floor: TowerFloor;
  attempts: number;
  lastReset: number;
  now: number;
  onChallenge: () => void;
}) {
  const faction = FACTION_CONFIG[floor.enemyFaction as Faction];
  const resetElapsed = now - lastReset;
  const effectiveAttempts = resetElapsed > RESET_MS ? MAX_ATTEMPTS : attempts;
  const disabled = effectiveAttempts <= 0; // floor is always the current floor here, so always <= currentFloor

  return (
    <motion.div
      key={floor.floor}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden rounded-xl border-2 p-4 mb-4 ${
        floor.bossFloor
          ? 'bg-gradient-to-br from-red-950/70 via-red-900/30 to-black border-red-600/60 shadow-[0_0_24px_rgba(220,38,38,0.40)]'
          : 'bg-gradient-to-br from-amber-950/50 via-purple-950/30 to-black border-amber-500/40 shadow-[0_0_18px_rgba(255,200,50,0.25)]'
      }`}
    >
      {/* Decorative boss watermark */}
      {floor.bossFloor && (
        <div className="absolute -top-4 -right-4 opacity-10 pointer-events-none">
          <Skull className="w-32 h-32 text-red-500" />
        </div>
      )}

      <div className="relative z-10">
        {/* Header: floor number + name */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  floor.bossFloor
                    ? 'bg-red-600/80 text-white'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                FLOOR {floor.floor}
              </span>
              {floor.bossFloor && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-red-300 bg-red-900/40 border border-red-600/40 px-2 py-0.5 rounded-full">
                  <Skull className="w-3 h-3" />
                  BOSS ENCOUNTER
                </span>
              )}
            </div>
            <h3
              className={`text-lg font-bold leading-tight ${
                floor.bossFloor ? 'text-red-200' : 'gold-text'
              }`}
            >
              {floor.name}
            </h3>
          </div>
          <div className="text-3xl flex-shrink-0">{faction.icon}</div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-400 mb-3 italic leading-relaxed">
          {floor.description}
        </p>

        {/* Stats grid: difficulty + faction */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-black/40 border border-white/5 rounded-lg p-2">
            <div className="text-[9px] uppercase tracking-wider text-gray-500 mb-0.5">
              Difficulty
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-base font-bold text-purple-300">
                x{floor.difficulty.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-lg p-2">
            <div className="text-[9px] uppercase tracking-wider text-gray-500 mb-0.5">
              Enemy Faction
            </div>
            <div className={`text-sm font-bold ${faction.color}`}>
              {faction.label}
            </div>
          </div>
        </div>

        {/* Rewards breakdown */}
        <div className="bg-black/40 border border-white/5 rounded-lg p-2.5 mb-3">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1">
            <Coins className="w-3 h-3 text-amber-400" />
            Reward Breakdown
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center">
              <Coins className="w-4 h-4 text-amber-400 mb-0.5" />
              <div className="text-[9px] text-gray-500">Gold</div>
              <div className="text-xs font-bold text-amber-300">
                {floor.rewardGold.toLocaleString()}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <Gem className="w-4 h-4 text-cyan-400 mb-0.5" />
              <div className="text-[9px] text-gray-500">Gems</div>
              <div className="text-xs font-bold text-cyan-300">
                {floor.rewardGems}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <Crown className="w-4 h-4 text-yellow-400 mb-0.5" />
              <div className="text-[9px] text-gray-500">Item</div>
              <div className="text-[10px] font-bold text-yellow-200 leading-tight text-center">
                {floor.rewardItem ?? '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Boss warning */}
        {floor.bossFloor && (
          <motion.div
            animate={{ opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="bg-red-950/60 border border-red-700/50 rounded-lg p-2 mb-3 flex items-center gap-2"
          >
            <Skull className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-[11px] text-red-300 font-medium">
              Warning: Boss enemies have 1.5x increased power. Prepare your
              strongest team!
            </span>
          </motion.div>
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
              : floor.bossFloor
              ? 'bg-gradient-to-r from-red-700 via-red-600 to-orange-600 text-white shadow-lg shadow-red-700/40'
              : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-black shadow-lg shadow-amber-500/30'
          }`}
        >
          <Swords className="w-4 h-4" />
          {disabled
            ? effectiveAttempts <= 0
              ? 'No Attempts Left'
              : 'Cannot Challenge'
            : `Challenge Floor ${floor.floor}`}
          {!disabled && (
            <span className="ml-1 bg-black/30 px-1.5 py-0.5 rounded text-[9px] font-bold">
              1 ⚔
            </span>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ============= Battle Result Modal =============

function BattleResultModal({
  result,
  onClose,
}: {
  result: TowerBattleResult;
  onClose: () => void;
}) {
  const { won, rewards, floor } = result;

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
            ? 'bg-gradient-to-b from-amber-950/95 via-yellow-950/80 to-black border-amber-500/60 shadow-[0_0_40px_rgba(255,215,0,0.40)]'
            : 'bg-gradient-to-b from-red-950/95 via-gray-950/80 to-black border-red-700/60 shadow-[0_0_40px_rgba(220,38,38,0.30)]'
        }`}
      >
        {/* Floor badge */}
        <div
          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${
            won
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-red-900/40 text-red-300 border border-red-700/40'
          }`}
        >
          Floor {floor}
        </div>

        {/* Trophy / Skull emblem */}
        <motion.div
          initial={{ scale: 0, rotate: won ? -90 : 90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
          className={`mx-auto mb-3 w-20 h-20 rounded-full flex items-center justify-center border-2 ${
            won
              ? 'bg-amber-500/15 border-amber-400/50'
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
            ? `Floor ${floor} cleared. The path upward opens.`
            : `Your champions fell on floor ${floor}. Regroup and try again.`}
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
          {rewards.item && (
            <RewardRow
              icon={<Crown className="w-4 h-4 text-yellow-400" />}
              label="Item"
              value={rewards.item}
              color="text-yellow-200"
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
              ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/30'
              : 'bg-gradient-to-r from-red-700 to-gray-800 text-white shadow-lg shadow-red-700/30'
          }`}
        >
          {won ? 'Continue Ascent' : 'Try Again'}
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
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  );
}

// ============= Reset Confirm Modal =============

function ResetConfirmModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl border-2 border-red-700/60 bg-gradient-to-b from-red-950/95 via-gray-950/90 to-black p-6 shadow-[0_0_36px_rgba(220,38,38,0.30)]"
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-full bg-red-900/30 border-2 border-red-700/50 flex items-center justify-center mb-3"
          >
            <RotateCcw className="w-8 h-8 text-red-400" />
          </motion.div>
          <h3 className="text-lg font-bold text-red-300 mb-1">
            Reset Tower Progress?
          </h3>
          <p className="text-xs text-gray-400 mb-1">
            Your current floor will be reset to{' '}
            <span className="text-amber-300 font-bold">Floor 1</span> and your
            highest floor record will be{' '}
            <span className="text-red-300 font-bold">wiped</span>.
          </p>
          <p className="text-xs text-green-300/80 mb-4">
            Your daily attempts will be refreshed to 5/5 immediately.
          </p>

          <div className="flex gap-2 w-full">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gray-800/80 text-gray-300 border border-gray-700/50"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg shadow-red-700/40"
            >
              Reset
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============= Main Screen =============

export function TowerScreen() {
  const team = useGameStore((s) => s.team);
  const heroes = useGameStore((s) => s.heroes);
  const player = useGameStore((s) => s.player);
  const setScreen = useGameStore((s) => s.setScreen);
  const towerHighestFloor = useGameStore((s) => s.towerHighestFloor);
  const towerCurrentFloor = useGameStore((s) => s.towerCurrentFloor);
  const towerAttempts = useGameStore((s) => s.towerAttempts);
  const towerLastReset = useGameStore((s) => s.towerLastReset);
  const startTowerBattle = useGameStore((s) => s.startTowerBattle);
  const resetTowerProgress = useGameStore((s) => s.resetTowerProgress);

  const [lastResult, setLastResult] = useState<TowerBattleResult | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Tick every second for reset countdown
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

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

  // Current floor data (clamped to valid range)
  const currentFloorData =
    TOWER_FLOORS[Math.min(Math.max(towerCurrentFloor, 1), 100) - 1];

  const handleChallenge = () => {
    const result = startTowerBattle(towerCurrentFloor);
    if (result) {
      setLastResult({
        won: result.won,
        rewards: result.rewards,
        floor: towerCurrentFloor,
      });
    }
  };

  const handleResetConfirm = () => {
    resetTowerProgress();
    setShowResetConfirm(false);
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
              'radial-gradient(ellipse at 20% 0%, rgba(80,30,120,0.18), transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(120,30,30,0.18), transparent 55%), linear-gradient(180deg, #0a0612 0%, #000000 100%)',
          }}
        />

        <TowerHeader />

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
          <h3 className="text-lg font-bold gold-text mb-2">
            No Team Assembled
          </h3>
          <p className="text-sm text-gray-400 mb-1">
            You need at least one champion in your team to enter the Tower of
            Eternity.
          </p>
          <p className="text-xs text-gray-500 mb-5">
            Assemble a team of worthy champions before braving the endless
            climb.
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setScreen('heroes')}
            className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-2"
          >
            <Swords className="w-4 h-4" />
            Go to Heroes
            <ChevronUp className="w-4 h-4 rotate-90" />
          </motion.button>
        </motion.div>
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
            'radial-gradient(ellipse at 50% 0%, rgba(80,30,120,0.22), transparent 55%), radial-gradient(ellipse at 0% 100%, rgba(120,30,30,0.16), transparent 55%), radial-gradient(ellipse at 100% 50%, rgba(50,20,80,0.18), transparent 60%), linear-gradient(180deg, #0a0612 0%, #000000 100%)',
        }}
      />

      <TowerHeader />

      {/* Player status panel */}
      <PlayerStatusPanel
        currentFloor={towerCurrentFloor}
        highestFloor={towerHighestFloor}
        attempts={towerAttempts}
        lastReset={towerLastReset}
        playerPower={playerPower}
        now={now}
      />

      {/* Tower visualization */}
      <TowerVisualization currentFloor={towerCurrentFloor} />

      {/* Floor detail card (current floor) */}
      {currentFloorData && (
        <FloorDetailCard
          floor={currentFloorData}
          attempts={towerAttempts}
          lastReset={towerLastReset}
          now={now}
          onChallenge={handleChallenge}
        />
      )}

      {/* Tower themes legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-black/30 border border-white/5 rounded-xl p-3 mb-4"
      >
        <h4 className="text-xs font-bold text-amber-200 mb-2 flex items-center gap-1.5">
          <Castle className="w-3.5 h-3.5 text-amber-400" />
          Tower Themes
        </h4>
        <div className="grid grid-cols-2 gap-1.5">
          {TOWER_FLOOR_THEMES.map((theme) => {
            const fc = FACTION_CONFIG[theme.faction];
            return (
              <div
                key={theme.name}
                className="flex items-center gap-1.5 text-[10px] text-gray-400"
              >
                <span className="text-base">{fc.icon}</span>
                <span className="truncate">
                  <span className={fc.color}>{theme.name}</span>
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Reset progress button */}
      <div className="flex justify-center pb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 hover:bg-red-950/60 transition-colors text-xs font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Tower Progress
        </motion.button>
      </div>

      {/* Battle result modal */}
      <AnimatePresence>
        {lastResult && (
          <BattleResultModal
            result={lastResult}
            onClose={() => setLastResult(null)}
          />
        )}
      </AnimatePresence>

      {/* Reset confirm modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <ResetConfirmModal
            onConfirm={handleResetConfirm}
            onCancel={() => setShowResetConfirm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
