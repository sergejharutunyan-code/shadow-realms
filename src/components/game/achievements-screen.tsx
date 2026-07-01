'use client';

import { useGameStore } from '@/lib/game-store';
import { ACHIEVEMENTS, Achievement, RARITY_CONFIG } from '@/lib/game-data';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Trophy, Lock, CheckCircle, Star, Gem, Coins, Crown } from 'lucide-react';

const TIER_CONFIG: Record<string, { color: string; bgColor: string; borderColor: string; icon: string }> = {
  bronze: { color: 'text-orange-400', bgColor: 'bg-orange-900/20', borderColor: 'border-orange-500/30', icon: '🥉' },
  silver: { color: 'text-gray-300', bgColor: 'bg-gray-700/20', borderColor: 'border-gray-400/30', icon: '🥈' },
  gold: { color: 'text-yellow-400', bgColor: 'bg-yellow-900/20', borderColor: 'border-yellow-500/30', icon: '🥇' },
  platinum: { color: 'text-cyan-300', bgColor: 'bg-cyan-900/20', borderColor: 'border-cyan-400/30', icon: '💎' },
};

const CATEGORY_LABELS: Record<string, string> = {
  progression: 'Progression',
  collection: 'Collection',
  combat: 'Combat',
  social: 'Social',
  special: 'Special',
};

export function AchievementsScreen() {
  const unlockedAchievements = useGameStore(s => s.unlockedAchievements);
  const player = useGameStore(s => s.player);
  const heroes = useGameStore(s => s.heroes);
  const battlesWon = useGameStore(s => s.battlesWon);
  const maxDamage = useGameStore(s => s.maxDamage);
  const showAchievementUnlock = useGameStore(s => s.showAchievementUnlock);
  const dismissAchievementUnlock = useGameStore(s => s.dismissAchievementUnlock);
  const [category, setCategory] = useState<string>('all');

  const categories = ['all', 'progression', 'collection', 'combat', 'special'];
  const filtered = category === 'all' ? ACHIEVEMENTS : ACHIEVEMENTS.filter(a => a.category === category);

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;
  const completionPercent = (unlockedCount / totalCount) * 100;

  // Calculate progress for each achievement
  const getProgress = (achievement: Achievement): number => {
    switch (achievement.id) {
      case 'first_battle':
      case 'battles_10':
      case 'battles_50':
      case 'battles_100':
        return battlesWon;
      case 'stage_10':
      case 'stage_25':
      case 'stage_50':
        return player.campaignStage - 1;
      case 'heroes_5':
      case 'heroes_15':
      case 'heroes_30':
      case 'heroes_all':
        return heroes.length;
      case 'vip_1':
      case 'vip_3':
      case 'vip_5':
      case 'vip_7':
        return player.vipLevel;
      case 'rich_100k':
      case 'rich_1m':
        return player.gold;
      case 'crit_2000':
      case 'crit_5000':
        return maxDamage;
      default:
        return 0;
    }
  };

  return (
    <div className="p-3 sm:p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-2" />
        <h2 className="text-xl font-bold gold-text">Achievements</h2>
        <p className="text-xs text-gray-400 mt-1">Complete challenges to earn rewards</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/10 border border-amber-500/20 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-amber-200">Completion</span>
          <span className="text-sm text-amber-300">{unlockedCount} / {totalCount}</span>
        </div>
        <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
          />
        </div>
        <div className="text-center mt-1 text-xs text-amber-400/70">{completionPercent.toFixed(1)}% Complete</div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1 mb-3 overflow-x-auto game-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              category === cat
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-gray-900/30 text-gray-400 border border-gray-700/30 hover:bg-gray-800/30'
            }`}
          >
            {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filtered.map(achievement => {
          const isUnlocked = unlockedAchievements.includes(achievement.id);
          const progress = getProgress(achievement);
          const progressPercent = Math.min(100, (progress / achievement.requirement) * 100);
          const tier = TIER_CONFIG[achievement.tier];

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative overflow-hidden rounded-xl border p-3 transition-all ${
                isUnlocked
                  ? `${tier.bgColor} ${tier.borderColor}`
                  : 'bg-gray-900/30 border-gray-700/30'
              }`}
            >
              {isUnlocked && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                  isUnlocked ? 'bg-black/30' : 'bg-black/40 grayscale opacity-50'
                }`}>
                  {isUnlocked ? achievement.icon : <Lock className="w-4 h-4 text-gray-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className={`text-sm font-bold ${isUnlocked ? tier.color : 'text-gray-500'}`}>
                      {achievement.name}
                    </span>
                    <span className="text-xs">{tier.icon}</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{achievement.description}</div>

                  {/* Progress bar */}
                  {!isUnlocked && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[10px] text-gray-500 mb-0.5">
                        <span>{progress.toLocaleString()} / {achievement.requirement.toLocaleString()}</span>
                        <span>{progressPercent.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500/50 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Rewards */}
                  <div className="flex items-center gap-2 mt-2">
                    {achievement.reward.gold && (
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                        <Coins className="w-2.5 h-2.5" />
                        {achievement.reward.gold.toLocaleString()}
                      </span>
                    )}
                    {achievement.reward.gems && (
                      <span className="flex items-center gap-0.5 text-[10px] text-cyan-400">
                        <Gem className="w-2.5 h-2.5" />
                        {achievement.reward.gems.toLocaleString()}
                      </span>
                    )}
                    {achievement.reward.vipPoints && (
                      <span className="flex items-center gap-0.5 text-[10px] text-purple-400">
                        <Crown className="w-2.5 h-2.5" />
                        {achievement.reward.vipPoints.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Achievement Unlock Modal */}
      <AnimatePresence>
        {showAchievementUnlock && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={dismissAchievementUnlock}>
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="bg-gradient-to-b from-amber-900/40 to-[#0f0f23] border border-amber-500/40 rounded-2xl p-6 max-w-sm w-full text-center"
              onClick={e => e.stopPropagation()}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="text-6xl mb-3"
              >
                {showAchievementUnlock.icon}
              </motion.div>
              <div className="text-xs text-amber-400 font-bold mb-1">ACHIEVEMENT UNLOCKED!</div>
              <h3 className="text-lg font-bold gold-text mb-2">{showAchievementUnlock.name}</h3>
              <p className="text-xs text-gray-400 mb-4">{showAchievementUnlock.description}</p>

              <div className="bg-black/30 rounded-lg p-3 mb-4">
                <div className="text-[10px] text-gray-500 mb-1">Rewards:</div>
                <div className="flex items-center justify-center gap-3">
                  {showAchievementUnlock.reward.gold && (
                    <span className="flex items-center gap-1 text-sm text-amber-300">
                      <Coins className="w-4 h-4" />
                      {showAchievementUnlock.reward.gold.toLocaleString()}
                    </span>
                  )}
                  {showAchievementUnlock.reward.gems && (
                    <span className="flex items-center gap-1 text-sm text-cyan-300">
                      <Gem className="w-4 h-4" />
                      {showAchievementUnlock.reward.gems.toLocaleString()}
                    </span>
                  )}
                  {showAchievementUnlock.reward.vipPoints && (
                    <span className="flex items-center gap-1 text-sm text-purple-300">
                      <Crown className="w-4 h-4" />
                      {showAchievementUnlock.reward.vipPoints.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={dismissAchievementUnlock}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-2 rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all"
              >
                Claim!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
