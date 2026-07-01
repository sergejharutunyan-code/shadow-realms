'use client';

import { useGameStore } from '@/lib/game-store';
import { DAILY_MISSIONS, DailyMission } from '@/lib/game-data';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Scroll,
  Clock,
  Check,
  Circle,
  Trophy,
  Star,
  Coins,
  Gem,
  Zap,
  Sword,
  Sparkles,
  ChevronRight,
  Award,
} from 'lucide-react';

// Per-type theme config: left border, tinted bg, accent text, gradient bar, badge bg
const MISSION_TYPE_COLORS: Record<
  DailyMission['type'],
  { border: string; barBorder: string; bg: string; text: string; bar: string; badge: string; glow: string }
> = {
  battle: {
    border: 'border-l-red-500',
    barBorder: 'border-red-500/50',
    bg: 'bg-red-500/10',
    text: 'text-red-300',
    bar: 'from-red-600 to-red-400',
    badge: 'bg-red-500/20 text-red-200 border-red-500/40',
    glow: 'shadow-[0_0_15px_rgba(239,68,68,0.45)]',
  },
  summon: {
    border: 'border-l-purple-500',
    barBorder: 'border-purple-500/50',
    bg: 'bg-purple-500/10',
    text: 'text-purple-300',
    bar: 'from-purple-600 to-purple-400',
    badge: 'bg-purple-500/20 text-purple-200 border-purple-500/40',
    glow: 'shadow-[0_0_15px_rgba(168,85,247,0.45)]',
  },
  levelup: {
    border: 'border-l-green-500',
    barBorder: 'border-green-500/50',
    bg: 'bg-green-500/10',
    text: 'text-green-300',
    bar: 'from-green-600 to-green-400',
    badge: 'bg-green-500/20 text-green-200 border-green-500/40',
    glow: 'shadow-[0_0_15px_rgba(34,197,94,0.45)]',
  },
  equip: {
    border: 'border-l-amber-500',
    barBorder: 'border-amber-500/50',
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
    bar: 'from-amber-600 to-amber-400',
    badge: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.45)]',
  },
  campaign: {
    border: 'border-l-blue-500',
    barBorder: 'border-blue-500/50',
    bg: 'bg-blue-500/10',
    text: 'text-blue-300',
    bar: 'from-blue-600 to-blue-400',
    badge: 'bg-blue-500/20 text-blue-200 border-blue-500/40',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.45)]',
  },
  spend_gems: {
    border: 'border-l-pink-500',
    barBorder: 'border-pink-500/50',
    bg: 'bg-pink-500/10',
    text: 'text-pink-300',
    bar: 'from-pink-600 to-pink-400',
    badge: 'bg-pink-500/20 text-pink-200 border-pink-500/40',
    glow: 'shadow-[0_0_15px_rgba(236,72,153,0.45)]',
  },
};

// Small lucide icon used as a subtle accent per mission type
const MISSION_TYPE_ICON: Record<DailyMission['type'], React.ReactNode> = {
  battle: <Sword className="w-3 h-3" />,
  summon: <Sparkles className="w-3 h-3" />,
  levelup: <Zap className="w-3 h-3" />,
  equip: <Gem className="w-3 h-3" />,
  campaign: <ChevronRight className="w-3 h-3" />,
  spend_gems: <Coins className="w-3 h-3" />,
};

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const BONUS_GEMS = 500;

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}

export function MissionsScreen() {
  const missionProgress = useGameStore(s => s.missionProgress);
  const missionsLastRefreshed = useGameStore(s => s.missionsLastRefreshed);
  const claimMissionReward = useGameStore(s => s.claimMissionReward);
  const refreshMissions = useGameStore(s => s.refreshMissions);
  const addGems = useGameStore(s => s.addGems);
  const addNotification = useGameStore(s => s.addNotification);

  const [now, setNow] = useState(Date.now());

  // Tick every second for the live countdown
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const elapsed = now - missionsLastRefreshed;
  const remaining = Math.max(0, TWENTY_FOUR_HOURS - elapsed);
  const canRefresh = elapsed >= TWENTY_FOUR_HOURS;

  // Bonus claim is one-time per refresh cycle. Key it to the refresh timestamp
  // so a fresh cycle auto-unlocks the bonus again.
  const bonusStorageKey = `sr-missions-bonus-${missionsLastRefreshed}`;
  const [bonusClaimed, setBonusClaimed] = useState(false);

  useEffect(() => {
    try {
      setBonusClaimed(localStorage.getItem(bonusStorageKey) === '1');
    } catch {
      setBonusClaimed(false);
    }
  }, [bonusStorageKey]);

  const claimedCount = useMemo(
    () => missionProgress.filter(m => m.claimed).length,
    [missionProgress]
  );

  const allComplete = claimedCount === DAILY_MISSIONS.length;

  const handleClaimBonus = useCallback(() => {
    if (bonusClaimed || !allComplete) return;
    addGems(BONUS_GEMS);
    addNotification(
      `🌟 Daily Mastery Bonus! +${BONUS_GEMS} Gems awarded!`,
      'epic'
    );
    try {
      localStorage.setItem(bonusStorageKey, '1');
    } catch {
      /* ignore storage errors */
    }
    setBonusClaimed(true);
  }, [bonusClaimed, allComplete, addGems, addNotification, bonusStorageKey]);

  const handleRefresh = useCallback(() => {
    if (!canRefresh) return;
    refreshMissions();
    addNotification('Daily missions refreshed! New challenges await.', 'info');
  }, [canRefresh, refreshMissions, addNotification]);

  return (
    <div className="relative p-3 sm:p-4 max-w-4xl mx-auto">
      {/* Ambient backdrop: dark purple/black gradient with subtle vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b from-[#1a0a2e] via-[#0f0f23] to-[#0a0a1a]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-2xl opacity-60"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.15) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(234,179,8,0.08) 0%, transparent 50%)',
        }}
      />

      {/* ===== Header ===== */}
      <header className="text-center mb-4 pt-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-700/40 to-amber-700/30 border border-amber-500/40 mb-2 shadow-[0_0_20px_rgba(234,179,8,0.35)]"
        >
          <Scroll className="w-7 h-7 text-amber-300" />
        </motion.div>
        <h2 className="text-2xl font-extrabold gold-text tracking-wide">
          Daily Missions
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Complete quests for valuable rewards
        </p>
      </header>

      {/* ===== Status bar: countdown + progress + refresh ===== */}
      <div className="bg-gradient-to-r from-purple-950/40 via-[#1a0a2e]/60 to-amber-950/30 border border-amber-500/20 rounded-xl p-3 sm:p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Countdown */}
          <div className="flex-1 flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full bg-black/40 border border-amber-500/30 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-300" />
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full border border-amber-400/40"
                animate={{ opacity: [0.3, 0.9, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-amber-400/70">
                Resets in
              </div>
              <div className="font-mono text-lg font-bold text-amber-200 tabular-nums">
                {formatCountdown(remaining)}
              </div>
            </div>
          </div>

          {/* Progress count */}
          <div className="flex items-center gap-3 sm:px-4 sm:border-l sm:border-r border-amber-500/15">
            <div className="w-12 h-12 rounded-full bg-black/40 border border-purple-500/30 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-purple-300/70">
                Claimed
              </div>
              <div className="text-lg font-bold text-purple-200">
                {claimedCount}
                <span className="text-purple-400/60 text-sm">/{DAILY_MISSIONS.length}</span>
              </div>
            </div>
          </div>

          {/* Refresh button */}
          <motion.button
            whileHover={canRefresh ? { scale: 1.04, y: -1 } : {}}
            whileTap={canRefresh ? { scale: 0.96 } : {}}
            onClick={handleRefresh}
            disabled={!canRefresh}
            aria-label="Refresh daily missions"
            className={`px-4 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
              canRefresh
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.5)]'
                : 'bg-gray-800/60 text-gray-500 border border-gray-700/40 cursor-not-allowed'
            }`}
          >
            <Zap className="w-4 h-4" />
            {canRefresh ? 'Refresh' : 'Locked'}
          </motion.button>
        </div>
      </div>

      {/* ===== Completion Celebration Banner ===== */}
      <AnimatePresence>
        {allComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative overflow-hidden rounded-2xl mb-4 border border-amber-400/50 bg-gradient-to-r from-amber-900/40 via-purple-900/30 to-amber-900/40 p-4"
          >
            {/* Shimmer sweep */}
            <motion.div
              aria-hidden
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  'linear-gradient(110deg, transparent 30%, rgba(255,215,0,0.25) 50%, transparent 70%)',
              }}
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />

            <div className="relative flex flex-col sm:flex-row items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.7)]"
              >
                <Award className="w-8 h-8 text-black" />
              </motion.div>

              <div className="flex-1 text-center sm:text-left">
                <div className="text-base font-extrabold gold-text flex items-center justify-center sm:justify-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  All Missions Complete!
                </div>
                <div className="text-xs text-amber-200/80 mt-0.5">
                  Daily Mastery Bonus:{' '}
                  <span className="inline-flex items-center gap-1 font-bold text-cyan-300">
                    <Gem className="w-3.5 h-3.5" />
                    {BONUS_GEMS} Gems
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={bonusClaimed ? {} : { scale: 1.05 }}
                whileTap={bonusClaimed ? {} : { scale: 0.95 }}
                onClick={handleClaimBonus}
                disabled={bonusClaimed}
                className={`px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
                  bonusClaimed
                    ? 'bg-green-900/40 text-green-300 border border-green-500/40 cursor-default'
                    : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:from-cyan-400 hover:to-purple-400'
                }`}
              >
                {bonusClaimed ? (
                  <>
                    <Check className="w-4 h-4" />
                    Bonus Claimed
                  </>
                ) : (
                  <>
                    <Gem className="w-4 h-4" />
                    Claim Bonus
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Mission Cards Grid ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DAILY_MISSIONS.map((mission, idx) => {
          const progressEntry = missionProgress.find(m => m.missionId === mission.id);
          const progress = progressEntry?.progress ?? 0;
          const claimed = progressEntry?.claimed ?? false;
          const claimable = !claimed && progress >= mission.requirement;
          return (
            <MissionCard
              key={mission.id}
              mission={mission}
              progress={progress}
              claimed={claimed}
              claimable={claimable}
              index={idx}
              onClaim={() => claimMissionReward(mission.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
 * MissionCard - a single daily mission tile
 * ========================================================= */

interface MissionCardProps {
  mission: DailyMission;
  progress: number;
  claimed: boolean;
  claimable: boolean;
  index: number;
  onClaim: () => void;
}

function MissionCard({
  mission,
  progress,
  claimed,
  claimable,
  index,
  onClaim,
}: MissionCardProps) {
  const colors = MISSION_TYPE_COLORS[mission.type];
  const progressPercent = Math.min(
    100,
    (progress / mission.requirement) * 100
  );
  const displayProgress = Math.min(progress, mission.requirement);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: claimed ? 0.55 : 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`relative overflow-hidden rounded-xl border ${colors.barBorder} border-l-4 ${colors.border} ${colors.bg} bg-gradient-to-br from-[#150925]/90 to-[#0a0a1a]/90 p-3 sm:p-4 transition-shadow ${
        claimable ? colors.glow : ''
      }`}
    >
      {/* Decorative corner flourishes */}
      <CornerFlourish className="top-0 left-0" />
      <CornerFlourish className="top-0 right-0 rotate-90" />
      <CornerFlourish className="bottom-0 left-0 -rotate-90" />
      <CornerFlourish className="bottom-0 right-0 rotate-180" />

      {/* Claimed overlay checkmark */}
      <AnimatePresence>
        {claimed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-2 right-2 z-10"
          >
            <div className="w-7 h-7 rounded-full bg-green-600/90 border border-green-300/50 flex items-center justify-center shadow-[0_0_12px_rgba(34,197,94,0.6)]">
              <Check className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start gap-3 relative">
        {/* Icon badge */}
        <div
          className={`shrink-0 w-12 h-12 rounded-full bg-black/40 border ${colors.barBorder} flex items-center justify-center text-2xl ${
            claimed ? 'grayscale opacity-60' : ''
          }`}
        >
          <span aria-hidden>{mission.icon}</span>
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3
              className={`text-sm font-bold gold-text ${
                claimed ? 'opacity-60' : ''
              }`}
            >
              {mission.name}
            </h3>
            <span
              className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${colors.badge} inline-flex items-center gap-1`}
            >
              {MISSION_TYPE_ICON[mission.type]}
              {mission.type.replace('_', ' ')}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">
            {mission.description}
          </p>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className={`font-semibold ${colors.text}`}>
                {displayProgress.toLocaleString()} / {mission.requirement.toLocaleString()}
              </span>
              <span className="text-gray-500">{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`h-full bg-gradient-to-r ${colors.bar} rounded-full relative`}
              >
                {claimable && (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    }}
                  />
                )}
              </motion.div>
            </div>
          </div>

          {/* Reward preview + action */}
          <div className="flex items-center justify-between mt-3 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <RewardChip
                icon={<Coins className="w-3 h-3" />}
                value={mission.reward.gold}
                className="text-amber-300"
              />
              <RewardChip
                icon={<Gem className="w-3 h-3" />}
                value={mission.reward.gems}
                className="text-cyan-300"
              />
              <RewardChip
                icon={<Star className="w-3 h-3" />}
                value={mission.reward.experience}
                className="text-yellow-300"
              />
            </div>

            {claimed ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-300 px-2 py-1 rounded-md bg-green-600/15 border border-green-500/30">
                <Check className="w-3 h-3" /> Claimed
              </span>
            ) : (
              <motion.button
                whileHover={claimable ? { scale: 1.05 } : {}}
                whileTap={claimable ? { scale: 0.94 } : {}}
                onClick={onClaim}
                disabled={!claimable}
                aria-label={`Claim reward for ${mission.name}`}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                  claimable
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_14px_rgba(245,158,11,0.55)] hover:from-amber-400 hover:to-amber-500'
                    : 'bg-gray-800/70 text-gray-500 border border-gray-700/40 cursor-not-allowed'
                }`}
              >
                {claimable ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Claim
                  </>
                ) : (
                  <>
                    <Circle className="w-3 h-3" />
                    In Progress
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
 * Small presentational helpers
 * ========================================================= */

function RewardChip({
  icon,
  value,
  className,
}: {
  icon: React.ReactNode;
  value: number;
  className?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold">
      <span className={className}>{icon}</span>
      <span className={className}>{value.toLocaleString()}</span>
    </span>
  );
}

/** Decorative L-shaped corner flourish rendered with SVG. */
function CornerFlourish({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden
      width="14"
      height="14"
      viewBox="0 0 14 14"
      className={`absolute ${className} text-amber-400/30 pointer-events-none`}
      fill="none"
    >
      <path
        d="M1 1 L1 8 M1 1 L8 1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="1" cy="1" r="1.1" fill="currentColor" />
    </svg>
  );
}
