'use client';

import { useGameStore } from '@/lib/game-store';
import { LOGIN_STREAK_MILESTONES, LoginStreakMilestone } from '@/lib/game-data';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import {
  Flame,
  Calendar,
  Star,
  Crown,
  Gift,
  Check,
  Lock,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Gem,
  Coins,
  Zap,
  Trophy,
  X,
} from 'lucide-react';

// ============= Rarity Config =============

const TIER_COLORS: Record<string, { border: string; bg: string; text: string; glow: string; badge: string }> = {
  common:    { border: 'border-gray-500/40',  bg: 'bg-gray-900/20',          text: 'text-gray-300',       glow: '',                                        badge: 'bg-gray-600/30 text-gray-300' },
  rare:      { border: 'border-blue-500/40',   bg: 'bg-blue-900/10',         text: 'text-blue-300',       glow: 'shadow-[0_0_12px_rgba(59,130,246,0.2)]',  badge: 'bg-blue-600/30 text-blue-300' },
  epic:      { border: 'border-purple-500/40', bg: 'bg-purple-900/10',       text: 'text-purple-300',     glow: 'shadow-[0_0_14px_rgba(168,85,247,0.25)]', badge: 'bg-purple-600/30 text-purple-300' },
  legendary: { border: 'border-amber-500/40',  bg: 'bg-amber-900/10',        text: 'text-amber-300',      glow: 'shadow-[0_0_16px_rgba(251,191,36,0.3)]',  badge: 'bg-amber-600/30 text-amber-300' },
  mythic:    { border: 'border-red-500/40',    bg: 'from-red-900/15 to-amber-900/10', text: 'text-red-300', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',  badge: 'bg-red-600/30 text-red-300' },
};

const MILESTONE_DAY_COLOR: Record<string, { ring: string; fill: string }> = {
  common:    { ring: 'ring-gray-400/50',    fill: 'bg-gray-400' },
  rare:      { ring: 'ring-blue-400/50',    fill: 'bg-blue-400' },
  epic:      { ring: 'ring-purple-400/50',  fill: 'bg-purple-400' },
  legendary: { ring: 'ring-amber-400/50',   fill: 'bg-amber-400' },
  mythic:    { ring: 'ring-red-400/50',     fill: 'bg-red-400' },
};

// ============= Helpers =============

function getMilestoneStatus(
  day: number,
  loginStreak: number,
  claimedStreakMilestones: number[],
  canClaimToday: boolean,
): 'claimed' | 'available' | 'locked' {
  if (claimedStreakMilestones.includes(day)) return 'claimed';
  if (loginStreak >= day && canClaimToday) return 'available';
  if (loginStreak >= day) return 'available'; // streak reached but not yet claimed via claimLoginStreak
  return 'locked';
}

// ============= Ornate Divider =============

function OrnateDivider() {
  return (
    <div className="flex items-center gap-2 my-4 px-2">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      <Star className="w-3 h-3 text-amber-500/40" />
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
    </div>
  );
}

// ============= Streak Reward Modal =============

function StreakRewardModal() {
  const showStreakReward = useGameStore(s => s.showStreakReward);
  const loginStreak = useGameStore(s => s.loginStreak);
  const claimLoginStreak = useGameStore(s => s.claimLoginStreak);
  const dismissStreakReward = useGameStore(s => s.dismissStreakReward);

  const currentMilestone = LOGIN_STREAK_MILESTONES.find(m => m.day === loginStreak + 1);

  return (
    <AnimatePresence>
      {showStreakReward && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={dismissStreakReward}>
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="bg-gradient-to-b from-amber-900/40 to-[#0f0f23] border border-amber-500/40 rounded-2xl p-6 max-w-sm w-full text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-end mb-1">
              <button onClick={dismissStreakReward} className="text-gray-500 hover:text-gray-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.6 }}
              className="text-5xl mb-3"
            >
              📅
            </motion.div>

            <div className="text-xs text-amber-400 font-bold mb-1">DAILY LOGIN</div>
            <h3 className="text-lg font-bold gold-text mb-1">Day {loginStreak + 1} Streak!</h3>
            <p className="text-xs text-gray-400 mb-4">Your dedication to the realm continues!</p>

            {currentMilestone && (
              <div className={`rounded-xl border p-3 mb-4 ${TIER_COLORS[currentMilestone.tier].border} ${TIER_COLORS[currentMilestone.tier].bg} ${TIER_COLORS[currentMilestone.tier].glow}`}>
                <div className="text-[10px] text-amber-400 font-bold mb-1">🎉 MILESTONE REWARD!</div>
                <div className="text-sm font-bold gold-text">{currentMilestone.name}</div>
                <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                  {currentMilestone.reward.gold > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-amber-300">
                      <Coins className="w-3 h-3" /> {currentMilestone.reward.gold.toLocaleString()}
                    </span>
                  )}
                  {currentMilestone.reward.gems > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-cyan-300">
                      <Gem className="w-3 h-3" /> {currentMilestone.reward.gems.toLocaleString()}
                    </span>
                  )}
                  {currentMilestone.reward.energy && (
                    <span className="flex items-center gap-0.5 text-xs text-green-300">
                      <Zap className="w-3 h-3" /> {currentMilestone.reward.energy}
                    </span>
                  )}
                  {currentMilestone.reward.vipPoints && (
                    <span className="flex items-center gap-0.5 text-xs text-purple-300">
                      <Crown className="w-3 h-3" /> {currentMilestone.reward.vipPoints}
                    </span>
                  )}
                  {currentMilestone.reward.item && (
                    <span className="flex items-center gap-0.5 text-xs text-amber-200">
                      {currentMilestone.reward.itemIcon} {currentMilestone.reward.item}
                    </span>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => claimLoginStreak()}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-2.5 rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all active:scale-95"
            >
              Claim Daily Login!
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ============= Main Component =============

export function LoginStreakScreen() {
  const loginStreak = useGameStore(s => s.loginStreak);
  const loginStreakLastClaim = useGameStore(s => s.loginStreakLastClaim);
  const claimedStreakMilestones = useGameStore(s => s.claimedStreakMilestones);
  const showStreakReward = useGameStore(s => s.showStreakReward);
  const claimLoginStreak = useGameStore(s => s.claimLoginStreak);
  const dismissStreakReward = useGameStore(s => s.dismissStreakReward);
  const checkLoginStreak = useGameStore(s => s.checkLoginStreak);
  const addNotification = useGameStore(s => s.addNotification);

  // Check streak on mount
  useEffect(() => {
    checkLoginStreak();
  }, [checkLoginStreak]);

  const oneDayMs = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const hasClaimedToday = loginStreakLastClaim > 0 && (now - loginStreakLastClaim) < oneDayMs;
  const elapsedSinceLastClaim = now - loginStreakLastClaim;
  const streakAtRisk = loginStreakLastClaim > 0 && !hasClaimedToday && elapsedSinceLastClaim >= oneDayMs && elapsedSinceLastClaim < 2 * oneDayMs;
  const streakWillReset = loginStreakLastClaim > 0 && elapsedSinceLastClaim >= 2 * oneDayMs;

  // Determine if there's an unclaimed milestone available
  const hasUnclaimedMilestone = LOGIN_STREAK_MILESTONES.some(
    m => loginStreak >= m.day && !claimedStreakMilestones.includes(m.day)
  );
  const nextMilestone = LOGIN_STREAK_MILESTONES.find(m => m.day > loginStreak);
  const currentMilestoneAvailable = LOGIN_STREAK_MILESTONES.find(
    m => loginStreak >= m.day && !claimedStreakMilestones.includes(m.day)
  );

  // ============= Header =============

  const headerSection = (
    <div className="text-center mb-4">
      <motion.div
        animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="inline-block"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-red-600/20 border-2 border-amber-500/30 flex items-center justify-center relative">
          <Calendar className="w-8 h-8 text-amber-400" />
          {loginStreak > 0 && (
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute -top-1 -right-1"
            >
              <Flame className="w-5 h-5 text-orange-400" />
            </motion.div>
          )}
        </div>
      </motion.div>
      <h2 className="text-xl font-bold gold-text mt-3">Login Streak</h2>
      <p className="text-xs text-gray-400 mt-1">Log in daily to earn milestone rewards</p>
    </div>
  );

  // ============= Current Streak Display =============

  const streakDisplay = (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-900/30 to-red-900/10 border border-amber-500/30 p-5 mb-4">
      {loginStreak > 0 && (
        <div className="absolute inset-0 animate-shimmer pointer-events-none" />
      )}
      <div className="relative z-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-amber-300 font-medium">Current Streak</span>
        </div>
        <div className="flex items-center justify-center gap-3">
          {loginStreak > 0 && (
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Flame className="w-8 h-8 text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.6)]" />
            </motion.div>
          )}
          <motion.span
            key={loginStreak}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="text-5xl font-black fire-text"
          >
            {loginStreak}
          </motion.span>
          {loginStreak > 0 && (
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            >
              <Flame className="w-8 h-8 text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            </motion.div>
          )}
        </div>
        <div className="text-sm text-amber-200 font-bold mt-1">
          Day {loginStreak}
        </div>
        {hasClaimedToday ? (
          <div className="flex items-center justify-center gap-1 mt-2">
            <Check className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs text-green-400">Claimed today</span>
          </div>
        ) : loginStreakLastClaim > 0 ? (
          <div className="text-xs text-amber-400/70 mt-2">Login to continue your streak!</div>
        ) : (
          <div className="text-xs text-amber-400/70 mt-2">Start your streak by claiming today!</div>
        )}
      </div>
    </div>
  );

  // ============= 30-Day Progress Path =============

  const progressPath = (
    <div className="rounded-xl bg-gradient-to-br from-purple-900/15 to-[#0a0a1a] border border-purple-500/20 p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <ArrowRight className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-bold text-amber-200">30-Day Path</span>
        <span className="text-xs text-gray-500 ml-auto">{loginStreak}/30 days</span>
      </div>

      <div className="flex flex-wrap gap-1.5 justify-center">
        {Array.from({ length: 30 }, (_, i) => {
          const day = i + 1;
          const isMilestone = LOGIN_STREAK_MILESTONES.some(m => m.day === day);
          const milestone = LOGIN_STREAK_MILESTONES.find(m => m.day === day);
          const isPast = day <= loginStreak;
          const isCurrent = day === loginStreak + 1;
          const isFuture = day > loginStreak + 1;
          const isClaimed = claimedStreakMilestones.includes(day);

          if (isMilestone && milestone) {
            const tierColor = MILESTONE_DAY_COLOR[milestone.tier] || MILESTONE_DAY_COLOR.common;
            const tierConfig = TIER_COLORS[milestone.tier] || TIER_COLORS.common;

            return (
              <motion.div
                key={day}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.02, type: 'spring', stiffness: 200 }}
                className={`relative w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold border-2
                  ${isClaimed
                    ? `${tierConfig.border} ${tierConfig.bg} ${tierConfig.text} ring-2 ${tierColor.ring}`
                    : isPast
                    ? `${tierConfig.border} ${tierConfig.bg} ${tierConfig.text} animate-pulse-glow`
                    : isCurrent
                    ? `border-amber-400/60 bg-amber-900/20 text-amber-300 animate-pulse ring-2 ring-amber-400/30`
                    : `border-gray-700/30 bg-gray-900/30 text-gray-600`
                  }
                `}
                title={`Day ${day}: ${milestone.name} (${milestone.tier})`}
              >
                <span className="text-sm">{milestone.icon}</span>
                {isClaimed && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-2 h-2 text-white" />
                  </div>
                )}
                {isCurrent && (
                  <motion.div
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400"
                  />
                )}
              </motion.div>
            );
          }

          // Normal day
          return (
            <motion.div
              key={day}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.01 }}
              className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-medium
                ${isPast
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-500/20'
                  : isCurrent
                  ? 'bg-amber-500/40 text-amber-200 border border-amber-400/40 animate-pulse'
                  : 'bg-gray-900/30 text-gray-600 border border-gray-800/30'
                }
              `}
              title={`Day ${day}`}
            >
              {day}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/20" />
          <span className="text-[9px] text-gray-500">Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-500/40 border border-amber-400/40 animate-pulse" />
          <span className="text-[9px] text-gray-500">Today</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-900/30 border border-gray-800/30" />
          <span className="text-[9px] text-gray-500">Upcoming</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-purple-400" />
          <span className="text-[9px] text-gray-500">Milestone</span>
        </div>
      </div>
    </div>
  );

  // ============= Milestone Cards =============

  const milestoneCards = (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Gift className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-bold text-amber-200">Milestone Rewards</span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto game-scrollbar pr-1">
        {LOGIN_STREAK_MILESTONES.map((milestone, idx) => {
          const isClaimed = claimedStreakMilestones.includes(milestone.day);
          const isAvailable = loginStreak >= milestone.day && !isClaimed;
          const isLocked = loginStreak < milestone.day;
          const tierConfig = TIER_COLORS[milestone.tier] || TIER_COLORS.common;

          return (
            <motion.div
              key={milestone.day}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.3 }}
              whileHover={{ scale: 1.01 }}
              className={`relative overflow-hidden rounded-xl border p-3 transition-all
                ${isClaimed
                  ? `${tierConfig.border} ${tierConfig.bg} opacity-80`
                  : isAvailable
                  ? `${tierConfig.border} ${tierConfig.bg} ${tierConfig.glow} animate-pulse-glow`
                  : `border-gray-700/20 bg-gray-900/20`
                }
              `}
            >
              {/* Shimmer for available milestones */}
              {isAvailable && (
                <div className="absolute inset-0 animate-shimmer pointer-events-none" />
              )}

              <div className="relative z-10">
                <div className="flex items-start gap-3">
                  {/* Milestone icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0
                    ${isLocked
                      ? 'bg-black/40 grayscale opacity-50'
                      : 'bg-black/30'
                    }
                  `}>
                    {isLocked ? <Lock className="w-4 h-4 text-gray-600" /> : milestone.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-bold ${isLocked ? 'text-gray-500' : 'gold-text'}`}>
                        {milestone.name}
                      </span>
                      {/* Day badge */}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                        ${isLocked ? 'bg-gray-800/50 text-gray-500' : tierConfig.badge}
                      `}>
                        Day {milestone.day}
                      </span>
                      {/* Tier badge */}
                      <span className={`text-[9px] font-bold uppercase px-1 py-0.5 rounded ${tierConfig.badge}`}>
                        {milestone.tier}
                      </span>
                    </div>

                    <div className={`text-[11px] mt-0.5 ${isLocked ? 'text-gray-600' : 'text-gray-400'}`}>
                      {milestone.description}
                    </div>

                    {/* Reward breakdown */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {milestone.reward.gold > 0 && (
                        <span className={`flex items-center gap-0.5 text-[10px] ${isLocked ? 'text-gray-600' : 'text-amber-400'}`}>
                          <Coins className="w-3 h-3" /> {milestone.reward.gold.toLocaleString()}
                        </span>
                      )}
                      {milestone.reward.gems > 0 && (
                        <span className={`flex items-center gap-0.5 text-[10px] ${isLocked ? 'text-gray-600' : 'text-cyan-400'}`}>
                          <Gem className="w-3 h-3" /> {milestone.reward.gems.toLocaleString()}
                        </span>
                      )}
                      {milestone.reward.energy && (
                        <span className={`flex items-center gap-0.5 text-[10px] ${isLocked ? 'text-gray-600' : 'text-green-400'}`}>
                          <Zap className="w-3 h-3" /> {milestone.reward.energy}
                        </span>
                      )}
                      {milestone.reward.vipPoints && (
                        <span className={`flex items-center gap-0.5 text-[10px] ${isLocked ? 'text-gray-600' : 'text-purple-400'}`}>
                          <Crown className="w-3 h-3" /> {milestone.reward.vipPoints}
                        </span>
                      )}
                      {milestone.reward.item && (
                        <span className={`flex items-center gap-0.5 text-[10px] ${isLocked ? 'text-gray-600' : 'text-amber-200'}`}>
                          <span>{milestone.reward.itemIcon}</span> {milestone.reward.item}
                        </span>
                      )}
                    </div>

                    {/* Status */}
                    <div className="mt-2">
                      {isClaimed && (
                        <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                          <Check className="w-3.5 h-3.5" /> Claimed ✓
                        </span>
                      )}
                      {isAvailable && (
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="flex items-center gap-1 text-xs text-amber-400 font-bold"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Available!
                        </motion.span>
                      )}
                      {isLocked && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                          <Lock className="w-3 h-3" /> Day {loginStreak}/{milestone.day}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  // ============= Claim Button =============

  const claimSection = (
    <div className="mt-4">
      {showStreakReward ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            const result = claimLoginStreak();
            if (!result.claimed) {
              addNotification('Already claimed today! Come back tomorrow.', 'info');
            }
          }}
          className="w-full btn-gold py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
        >
          <Flame className="w-4 h-4" />
          Claim Daily Login & Milestone Reward
        </motion.button>
      ) : hasClaimedToday ? (
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-green-400/80">
            <Check className="w-4 h-4" />
            <span>Today&apos;s login claimed!</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Come back tomorrow to continue your streak</p>
        </div>
      ) : loginStreakLastClaim > 0 && !hasClaimedToday ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            const result = claimLoginStreak();
            if (!result.claimed) {
              addNotification('Could not claim. Try again later.', 'info');
            }
          }}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-3 rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Calendar className="w-4 h-4" />
          Claim Today&apos;s Login
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            const result = claimLoginStreak();
            if (!result.claimed) {
              addNotification('Could not claim. Try again later.', 'info');
            }
          }}
          className="w-full btn-gold py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
        >
          <Flame className="w-4 h-4" />
          Start Your Login Streak!
        </motion.button>
      )}

      {/* Next milestone hint */}
      {!hasClaimedToday && nextMilestone && (
        <div className="text-center mt-2">
          <span className="text-[10px] text-gray-500">
            Next milestone: <span className="text-amber-400/70">{nextMilestone.name}</span> at Day {nextMilestone.day}
            {nextMilestone.day - loginStreak > 1 && ` (${nextMilestone.day - loginStreak} days away)`}
          </span>
        </div>
      )}
    </div>
  );

  // ============= Streak Reset Warning =============

  const resetWarning = (streakAtRisk || streakWillReset) && loginStreak > 0 && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-3 mb-4 flex items-start gap-2 ${
        streakWillReset
          ? 'bg-red-900/20 border-red-500/30'
          : 'bg-amber-900/20 border-amber-500/30'
      }`}
    >
      <Clock className={`w-4 h-4 mt-0.5 flex-shrink-0 ${streakWillReset ? 'text-red-400' : 'text-amber-400'}`} />
      <div>
        {streakWillReset ? (
          <>
            <div className="text-xs font-bold text-red-300">Streak Reset!</div>
            <div className="text-[11px] text-red-400/70">You missed a day and your streak has reset. Claim today to start a new streak!</div>
          </>
        ) : (
          <>
            <div className="text-xs font-bold text-amber-300">Streak at Risk!</div>
            <div className="text-[11px] text-amber-400/70">You haven&apos;t claimed today&apos;s login yet. Miss tomorrow and your streak will reset!</div>
          </>
        )}
      </div>
    </motion.div>
  );

  // ============= Render =============

  return (
    <div className="p-3 sm:p-4 max-w-4xl mx-auto">
      {headerSection}
      <OrnateDivider />
      {streakDisplay}
      <OrnateDivider />
      {resetWarning}
      {progressPath}
      <OrnateDivider />
      {milestoneCards}
      {claimSection}

      {/* Streak Reward Modal */}
      <StreakRewardModal />
    </div>
  );
}
