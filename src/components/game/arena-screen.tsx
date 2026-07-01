'use client';

import { useGameStore } from '@/lib/game-store';
import { ARENA_OPPONENTS, ARENA_RANKS, ArenaOpponent } from '@/lib/game-data';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import {
  Swords,
  Shield,
  Trophy,
  Crown,
  Clock,
  Flame,
  Skull,
  Star,
  Zap,
  ChevronRight,
} from 'lucide-react';

// ============= Helpers =============

function getCurrentRank(trophies: number) {
  let rank = ARENA_RANKS[0];
  for (const r of ARENA_RANKS) {
    if (trophies >= r.minTrophies) rank = r;
  }
  return rank;
}

function getNextRank(trophies: number) {
  for (const r of ARENA_RANKS) {
    if (trophies < r.minTrophies) return r;
  }
  return null;
}

function formatTime(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatPower(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

// Defense rating 1-5 -> themed color palette for opponent cards
function getDefenseTheme(rating: number) {
  switch (rating) {
    case 1:
      return {
        border: 'border-gray-500/40',
        text: 'text-gray-300',
        bg: 'from-gray-900/70 to-gray-950/90',
        ring: 'shadow-[0_0_18px_rgba(156,163,175,0.20)]',
        accent: 'text-gray-400',
      };
    case 2:
      return {
        border: 'border-green-500/40',
        text: 'text-green-300',
        bg: 'from-green-950/50 to-gray-950/90',
        ring: 'shadow-[0_0_18px_rgba(34,197,94,0.22)]',
        accent: 'text-green-400',
      };
    case 3:
      return {
        border: 'border-sky-500/50',
        text: 'text-sky-300',
        bg: 'from-sky-950/50 to-gray-950/90',
        ring: 'shadow-[0_0_20px_rgba(56,189,248,0.25)]',
        accent: 'text-sky-400',
      };
    case 4:
      return {
        border: 'border-purple-500/50',
        text: 'text-purple-300',
        bg: 'from-purple-950/60 to-gray-950/90',
        ring: 'shadow-[0_0_22px_rgba(168,85,247,0.30)]',
        accent: 'text-purple-400',
      };
    case 5:
      return {
        border: 'border-red-500/60',
        text: 'text-red-300',
        bg: 'from-red-950/60 to-gray-950/90',
        ring: 'shadow-[0_0_26px_rgba(239,68,68,0.40)]',
        accent: 'text-red-400',
      };
    default:
      return {
        border: 'border-gray-500/40',
        text: 'text-gray-300',
        bg: 'from-gray-900/70 to-gray-950/90',
        ring: 'shadow-[0_0_18px_rgba(156,163,175,0.20)]',
        accent: 'text-gray-400',
      };
  }
}

// ============= Battle Result Modal =============

interface BattleResult {
  won: boolean;
  gold: number;
  gems: number;
  trophies: number;
  opponentName: string;
}

function BattleResultModal({
  result,
  onClose,
}: {
  result: BattleResult;
  onClose: () => void;
}) {
  const { won, gold, gems, trophies, opponentName } = result;

  // Confetti particles for victory
  const confetti = useMemo(() => {
    if (!won) return [];
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.2 + Math.random() * 1.6,
      color: ['#ffd700', '#ff6b00', '#ff4500', '#ffe066', '#ff8c00', '#ffaa00'][i % 6],
      size: 4 + Math.random() * 6,
      rotate: Math.random() * 360,
    }));
  }, [won]);

  // Ash particles for defeat
  const ash = useMemo(() => {
    if (won) return [];
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 1.6 + Math.random() * 1.6,
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
            : 'bg-[radial-gradient(circle_at_center,rgba(120,40,40,0.28),transparent_60%)]'
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
        transition={{ type: 'spring', damping: 18, stiffness: 220 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-sm rounded-2xl border-2 p-6 text-center ${
          won
            ? 'bg-gradient-to-b from-amber-950/95 via-yellow-950/80 to-black border-amber-500/60 shadow-[0_0_40px_rgba(255,215,0,0.40)]'
            : 'bg-gradient-to-b from-red-950/95 via-gray-950/80 to-black border-red-700/60 shadow-[0_0_40px_rgba(220,38,38,0.30)]'
        }`}
      >
        {/* Trophy / Skull emblem */}
        <motion.div
          initial={{ scale: 0, rotate: won ? -90 : 90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', damping: 12, stiffness: 200 }}
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
          transition={{ delay: 0.3 }}
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
          transition={{ delay: 0.4 }}
          className={`text-xs mt-1 mb-4 ${
            won ? 'text-amber-200/80' : 'text-red-300/70'
          }`}
        >
          {won
            ? 'Glory and spoils are yours, champion.'
            : `${opponentName} has bested your team...`}
        </motion.p>

        {/* Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-black/40 border border-white/10 rounded-xl p-3 mb-4 space-y-2"
        >
          <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
            Rewards Earned
          </div>
          <RewardRow
            icon="🪙"
            label="Gold"
            value={`+${gold.toLocaleString()}`}
            color="text-amber-300"
          />
          <RewardRow
            icon="💎"
            label="Gems"
            value={`+${gems}`}
            color="text-cyan-300"
          />
          <RewardRow
            icon="🏆"
            label="Trophies"
            value={`${trophies >= 0 ? '+' : ''}${trophies}`}
            color={trophies >= 0 ? 'text-yellow-300' : 'text-red-300'}
          />
        </motion.div>

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onClose}
          className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide ${
            won
              ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/30'
              : 'bg-gradient-to-r from-red-700 to-gray-800 text-white shadow-lg shadow-red-700/30'
          }`}
        >
          <ChevronRight className="w-4 h-4 inline mr-1" />
          Continue
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
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  );
}

// ============= Opponent Card =============

function OpponentCard({
  opponent,
  isCoolingDown,
  cooldownRemaining,
  onAttack,
  playerPower,
  canAffordEnergy,
}: {
  opponent: ArenaOpponent;
  isCoolingDown: boolean;
  cooldownRemaining: string;
  onAttack: (o: ArenaOpponent) => void;
  playerPower: number;
  canAffordEnergy: boolean;
}) {
  const theme = getDefenseTheme(opponent.defenseRating);
  const powerRatio = playerPower / (playerPower + opponent.power);
  const winChance = Math.min(0.85, Math.max(0.15, powerRatio));

  const disabled = isCoolingDown || !canAffordEnergy;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.99 }}
      className={`relative bg-gradient-to-b ${theme.bg} border-2 ${theme.border} rounded-xl p-3 overflow-hidden ${theme.ring} hover:shadow-xl transition-shadow`}
    >
      {/* Decorative background skull */}
      <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none">
        <Skull className="w-24 h-24" />
      </div>

      {/* Rank position badge */}
      <div className="absolute top-2 right-2 z-10">
        <div className="flex items-center gap-1 bg-black/50 border border-white/10 rounded-full px-2 py-0.5">
          <Crown className="w-2.5 h-2.5 text-amber-400" />
          <span className="text-[10px] font-bold text-amber-200">
            #{opponent.rank}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${theme.bg} border ${theme.border} flex items-center justify-center flex-shrink-0`}
        >
          <Skull className={`w-6 h-6 ${theme.text}`} />
        </div>
        <div className="flex-1 min-w-0 pr-12">
          <div className="text-sm font-bold text-white truncate">
            {opponent.name}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-gray-400">Lv.{opponent.level}</span>
            {opponent.vipLevel > 0 && (
              <span className="flex items-center gap-0.5 bg-amber-500/15 border border-amber-500/30 rounded-full px-1.5 py-0.5">
                <Crown className="w-2.5 h-2.5 text-amber-400" />
                <span className="text-[9px] font-bold text-amber-300">
                  VIP {opponent.vipLevel}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-black/30 border border-white/5 rounded-lg p-2">
          <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-gray-500">
            <Zap className="w-2.5 h-2.5 text-orange-400" />
            Power
          </div>
          <div className="text-sm font-bold text-orange-300">
            {formatPower(opponent.power)}
          </div>
        </div>
        <div className="bg-black/30 border border-white/5 rounded-lg p-2">
          <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-gray-500">
            <Shield className="w-2.5 h-2.5 text-blue-400" />
            Defense
          </div>
          <div className="flex items-center gap-0.5 mt-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < opponent.defenseRating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Win chance bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[10px] text-gray-400 mb-0.5">
          <span>Win Chance</span>
          <span
            className={
              winChance >= 0.5 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'
            }
          >
            {Math.round(winChance * 100)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${
              winChance >= 0.6
                ? 'from-green-600 to-green-400'
                : winChance >= 0.4
                ? 'from-amber-600 to-amber-400'
                : 'from-red-700 to-red-500'
            }`}
            style={{ width: `${winChance * 100}%` }}
          />
        </div>
      </div>

      {/* Rewards preview */}
      <div className="flex items-center justify-between bg-black/30 rounded-lg p-2 mb-3">
        <div className="flex items-center gap-1 text-[10px]">
          <span>🪙</span>
          <span className="text-amber-300 font-bold">
            {opponent.reward.gold.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px]">
          <span>💎</span>
          <span className="text-cyan-300 font-bold">{opponent.reward.gems}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px]">
          <span>🏆</span>
          <span className="text-yellow-300 font-bold">
            +{opponent.reward.trophies}
          </span>
        </div>
      </div>

      {/* Action area */}
      {isCoolingDown ? (
        <div className="w-full py-2.5 rounded-lg bg-gray-900/60 border border-gray-700/40 flex items-center justify-center gap-2 text-gray-400 text-xs font-medium animate-pulse">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-mono tabular-nums">{cooldownRemaining}</span>
        </div>
      ) : (
        <motion.button
          whileHover={canAffordEnergy ? { scale: 1.03 } : {}}
          whileTap={canAffordEnergy ? { scale: 0.96 } : {}}
          onClick={() => onAttack(opponent)}
          disabled={!canAffordEnergy}
          className={`w-full py-2.5 rounded-lg font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-shadow ${
            canAffordEnergy
              ? 'bg-gradient-to-r from-red-700 via-red-600 to-orange-600 text-white shadow-lg shadow-red-700/30 hover:shadow-red-500/50'
              : 'bg-gray-800/60 text-gray-500 border border-gray-700/40 cursor-not-allowed'
          }`}
        >
          <Swords className="w-4 h-4" />
          ATTACK
          <span className="ml-1 bg-black/30 px-1.5 py-0.5 rounded text-[9px] font-bold">
            ⚡10
          </span>
        </motion.button>
      )}
    </motion.div>
  );
}

// ============= Screen Header =============

function ScreenHeader() {
  return (
    <div className="text-center mb-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center justify-center gap-2 mb-1"
      >
        <motion.div
          animate={{ rotate: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Swords className="w-5 h-5 text-red-500" />
        </motion.div>
        <Trophy className="w-10 h-10 text-amber-400" />
        <motion.div
          animate={{ rotate: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Swords className="w-5 h-5 text-red-500" />
        </motion.div>
      </motion.div>
      <h2 className="text-2xl font-black gold-text tracking-wide">PvP Arena</h2>
      <p className="text-xs text-gray-400 mt-1">
        Battle rival champions for glory and trophies
      </p>
    </div>
  );
}

// ============= Main Screen =============

export function ArenaScreen() {
  const player = useGameStore((s) => s.player);
  const team = useGameStore((s) => s.team);
  const heroes = useGameStore((s) => s.heroes);
  const arenaTrophies = useGameStore((s) => s.arenaTrophies);
  const arenaWins = useGameStore((s) => s.arenaWins);
  const arenaLosses = useGameStore((s) => s.arenaLosses);
  const arenaCooldown = useGameStore((s) => s.arenaCooldown);
  const startArenaBattle = useGameStore((s) => s.startArenaBattle);
  const setScreen = useGameStore((s) => s.setScreen);

  const [lastResult, setLastResult] = useState<BattleResult | null>(null);
  const [now, setNow] = useState(Date.now());

  // Tick every second for cooldown timer
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

  const isCoolingDown = arenaCooldown > now;
  const cooldownRemaining = formatTime(arenaCooldown - now);

  const currentRank = getCurrentRank(arenaTrophies);
  const nextRank = getNextRank(arenaTrophies);
  const rankProgress = nextRank
    ? ((arenaTrophies - currentRank.minTrophies) /
        (nextRank.minTrophies - currentRank.minTrophies)) *
      100
    : 100;
  const trophiesToNext = nextRank ? nextRank.minTrophies - arenaTrophies : 0;

  const totalBattles = arenaWins + arenaLosses;
  const winRate =
    totalBattles > 0 ? Math.round((arenaWins / totalBattles) * 100) : 0;

  const canAffordEnergy = player.energy >= 10;

  const handleAttack = (opponent: ArenaOpponent) => {
    // Snapshot before
    const before = useGameStore.getState();
    const prev = {
      wins: before.arenaWins,
      gold: before.player.gold,
      gems: before.player.gems,
      trophies: before.arenaTrophies,
      energy: before.player.energy,
      cooldown: before.arenaCooldown,
    };

    startArenaBattle(opponent.id);

    // Snapshot after (Zustand set is synchronous)
    const after = useGameStore.getState();

    // If nothing changed, battle didn't actually happen (cooldown/energy guard)
    if (
      after.arenaCooldown === prev.cooldown &&
      after.player.energy === prev.energy
    ) {
      return;
    }

    const won = after.arenaWins > prev.wins;
    const gold = after.player.gold - prev.gold;
    const gems = after.player.gems - prev.gems;
    const trophies = after.arenaTrophies - prev.trophies;

    setLastResult({
      won,
      gold,
      gems,
      trophies,
      opponentName: opponent.name,
    });
  };

  // ===== Empty team guard =====
  if (team.length === 0) {
    return (
      <div className="relative p-3 sm:p-4 max-w-4xl mx-auto min-h-[60vh] flex flex-col">
        <ScreenHeader />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center text-center bg-gradient-to-b from-red-950/30 to-black/40 border-2 border-red-700/30 rounded-2xl p-8"
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 rounded-full bg-red-900/30 border-2 border-red-700/40 flex items-center justify-center mb-4"
          >
            <Skull className="w-10 h-10 text-red-400" />
          </motion.div>
          <h3 className="text-lg font-bold gold-text mb-2">No Team Assembled</h3>
          <p className="text-sm text-gray-400 mb-1">
            You need at least one champion in your team to enter the arena.
          </p>
          <p className="text-xs text-gray-500 mb-5">
            Assemble a team of worthy champions before seeking battle.
          </p>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setScreen('heroes')}
            className="bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-2"
          >
            <Swords className="w-4 h-4" />
            Go to Heroes
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative p-3 sm:p-4 max-w-4xl mx-auto">
      {/* Atmospheric glow overlays */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-700/5 rounded-full blur-3xl" />
      </div>

      <ScreenHeader />

      {/* Player rank / status card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-950/40 via-purple-950/20 to-black border border-amber-500/30 p-4 mb-4"
      >
        <div className="absolute -top-2 -right-2 opacity-10 pointer-events-none">
          <Trophy className="w-24 h-24 text-amber-400" />
        </div>

        <div className="relative z-10">
          {/* Top row: rank + trophies */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentRank.icon}</span>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-gray-400">
                  Current Rank
                </div>
                <div className="text-base font-bold gold-text leading-tight">
                  {currentRank.rank}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-gray-400">
                  Trophies
                </div>
                <div className="text-lg font-bold gold-text leading-tight">
                  {arenaTrophies.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Progress to next rank */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-gray-400">
                {nextRank ? (
                  <>
                    Progress to{' '}
                    <span className="text-amber-300 font-medium">
                      {nextRank.rank}
                    </span>
                  </>
                ) : (
                  <span className="text-amber-300 font-medium">
                    Maximum rank achieved!
                  </span>
                )}
              </span>
              {nextRank && (
                <span className="text-gray-400">
                  {trophiesToNext} 🏆 to go
                </span>
              )}
            </div>
            <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(rankProgress, 100)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 rounded-full shadow-[0_0_8px_rgba(255,200,50,0.5)]"
              />
            </div>
          </div>

          {/* W-L-Record + win rate */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-black/30 border border-white/5 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-wider text-gray-500">
                <Swords className="w-2.5 h-2.5 text-green-400" />
                Wins
              </div>
              <div className="text-sm font-bold text-green-400">{arenaWins}</div>
            </div>
            <div className="bg-black/30 border border-white/5 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-wider text-gray-500">
                <Skull className="w-2.5 h-2.5 text-red-400" />
                Losses
              </div>
              <div className="text-sm font-bold text-red-400">{arenaLosses}</div>
            </div>
            <div className="bg-black/30 border border-white/5 rounded-lg p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[9px] uppercase tracking-wider text-gray-500">
                <Flame className="w-2.5 h-2.5 text-orange-400" />
                Win Rate
              </div>
              <div className="text-sm font-bold text-orange-300">{winRate}%</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Cooldown banner */}
      <AnimatePresence>
        {isCoolingDown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="bg-gradient-to-r from-red-950/50 via-purple-950/30 to-red-950/50 border border-red-700/40 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Clock className="w-5 h-5 text-red-400" />
                </motion.div>
                <div>
                  <div className="text-xs font-bold text-red-300">
                    Battle Cooldown
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Your champions are recovering...
                  </div>
                </div>
              </div>
              <div className="font-mono text-lg font-bold text-red-300 tabular-nums">
                {cooldownRemaining}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player power indicator */}
      <div className="bg-black/30 border border-white/5 rounded-lg p-2 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-orange-400" />
          <span className="text-xs text-gray-400">Your Team Power</span>
        </div>
        <span className="text-sm font-bold text-orange-300">
          {formatPower(playerPower)}
        </span>
      </div>

      {/* Opponents header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-amber-200 flex items-center gap-2">
          <Swords className="w-4 h-4 text-red-400" />
          Available Opponents
        </h3>
        <span className="text-[10px] text-gray-500">
          ⚡10 energy per battle
        </span>
      </div>

      {/* Opponents grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {ARENA_OPPONENTS.map((opponent) => (
          <OpponentCard
            key={opponent.id}
            opponent={opponent}
            isCoolingDown={isCoolingDown}
            cooldownRemaining={cooldownRemaining}
            onAttack={handleAttack}
            playerPower={playerPower}
            canAffordEnergy={canAffordEnergy}
          />
        ))}
      </div>

      {/* Arena rank tiers */}
      <div className="mt-6">
        <h3 className="text-sm font-bold text-amber-200 mb-2 flex items-center gap-2">
          <Crown className="w-4 h-4 text-amber-400" />
          Arena Ranks
        </h3>
        <div className="bg-black/30 border border-white/5 rounded-xl p-3 overflow-x-auto game-scrollbar">
          <div className="flex gap-2 min-w-max">
            {ARENA_RANKS.map((r) => {
              const isCurrent = r.rank === currentRank.rank;
              const isAchieved = arenaTrophies >= r.minTrophies;
              return (
                <div
                  key={r.rank}
                  className={`relative flex flex-col items-center justify-center min-w-[80px] py-2 px-3 rounded-lg border ${
                    isCurrent
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-[0_0_12px_rgba(255,200,50,0.3)]'
                      : isAchieved
                      ? 'bg-green-900/15 border-green-600/30'
                      : 'bg-gray-900/40 border-gray-700/30'
                  }`}
                >
                  <span className="text-lg">{r.icon}</span>
                  <span
                    className={`text-[9px] font-bold mt-0.5 ${
                      isCurrent
                        ? 'gold-text'
                        : isAchieved
                        ? 'text-green-300'
                        : 'text-gray-500'
                    }`}
                  >
                    {r.rank}
                  </span>
                  <span className="text-[8px] text-gray-500">
                    {r.minTrophies} 🏆
                  </span>
                  {isCurrent && (
                    <motion.div
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
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
    </div>
  );
}
