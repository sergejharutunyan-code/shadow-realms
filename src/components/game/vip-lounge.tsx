'use client';

import { useGameStore } from '@/lib/game-store';
import { VIP_LEVELS } from '@/lib/game-data';
import { motion } from 'framer-motion';
import { Crown, Star, Gem, Zap, Swords, Shield, Gift, ChevronRight, Lock } from 'lucide-react';

export function VIPLounge() {
  const player = useGameStore(s => s.player);
  const addVIPPoints = useGameStore(s => s.addVIPPoints);
  const addNotification = useGameStore(s => s.addNotification);

  const currentVip = VIP_LEVELS.find(v => v.level === player.vipLevel);
  const nextVip = VIP_LEVELS.find(v => v.level === player.vipLevel + 1);
  const progressToNext = nextVip ? (player.vipPoints / nextVip.requiredPoints) * 100 : 100;

  return (
    <div className="p-3 sm:p-4 max-w-4xl mx-auto">
      {/* VIP Header */}
      <div className="text-center mb-4">
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="inline-block"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/30 to-yellow-600/20 border-2 border-amber-500/30 flex items-center justify-center">
            <Crown className="w-10 h-10 text-amber-400" />
          </div>
        </motion.div>
        <h2 className="text-xl font-bold gold-text mt-3">VIP Lounge</h2>
        <p className="text-xs text-gray-400 mt-1">Exclusive rewards and perks for our most dedicated champions</p>
      </div>

      {/* Current VIP Status */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-900/30 to-yellow-900/10 border border-amber-500/30 p-4 mb-4">
        <div className="absolute inset-0 animate-shimmer" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm text-gray-400">Current VIP Level</div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold gold-text">VIP {player.vipLevel}</span>
                {player.vipLevel > 0 && (
                  <Crown className="w-6 h-6 text-amber-400" />
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">VIP Points</div>
              <div className="text-xl font-bold text-amber-300">{player.vipPoints.toLocaleString()}</div>
            </div>
          </div>

          {nextVip && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400">Progress to VIP {nextVip.level}</span>
                <span className="text-amber-300">{player.vipPoints} / {nextVip.requiredPoints.toLocaleString()}</span>
              </div>
              <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all"
                  style={{ width: `${Math.min(progressToNext, 100)}%` }}
                />
              </div>
              <div className="text-center mt-2">
                <span className="text-[10px] text-amber-400/70">
                  {nextVip.requiredPoints - player.vipPoints > 0
                    ? `${(nextVip.requiredPoints - player.vipPoints).toLocaleString()} more points needed`
                    : 'Ready to level up!'}
                </span>
              </div>
            </div>
          )}

          {/* Current Perks */}
          {currentVip && (
            <div className="mt-3 pt-3 border-t border-amber-500/10">
              <div className="text-xs text-amber-200 font-medium mb-1">Current Perks:</div>
              <div className="space-y-0.5">
                {currentVip.perks.map((perk, i) => (
                  <div key={i} className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    {perk}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick VIP Purchase */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-gradient-to-r from-red-900/30 to-amber-900/20 border border-red-500/30 rounded-xl p-4 mb-4 cursor-pointer"
        onClick={() => {
          addVIPPoints(100);
          addNotification('👑 +100 VIP Points! Keep spending to level up!', 'epic');
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">BEST VALUE</span>
              <span className="text-sm font-bold text-amber-200">VIP Accelerator Pack</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">500 VIP Points + 2,000 Gems + Exclusive Rewards</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-amber-400">$9.99</div>
            <button className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-3 py-1 rounded-lg text-xs">
              Buy Now
            </button>
          </div>
        </div>
      </motion.div>

      {/* VIP Levels */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-amber-200">All VIP Levels</h3>
        {VIP_LEVELS.map((vip) => {
          const isUnlocked = player.vipLevel >= vip.level;
          const isCurrent = player.vipLevel === vip.level;

          return (
            <motion.div
              key={vip.level}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: vip.level * 0.05 }}
              className={`relative rounded-xl border p-3 transition-all ${
                isCurrent
                  ? 'border-amber-500/30 bg-amber-900/15 shadow-lg shadow-amber-500/10'
                  : isUnlocked
                  ? 'border-green-500/20 bg-green-900/5'
                  : 'border-gray-700/20 bg-gray-900/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isUnlocked
                      ? 'bg-amber-500/20 border border-amber-500/30'
                      : 'bg-gray-800/50 border border-gray-700/30'
                  }`}>
                    {isUnlocked ? (
                      <Crown className={`w-5 h-5 ${isCurrent ? 'text-amber-400' : 'text-green-400'}`} />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isUnlocked ? 'gold-text' : 'text-gray-500'}`}>
                        VIP {vip.level}
                      </span>
                      {isCurrent && (
                        <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {vip.level === 0 ? 'Free' : `${vip.requiredPoints.toLocaleString()} VIP Points`}
                      {vip.rewards && ` · Reward: ${vip.rewards}`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Perks */}
              <div className="mt-2 ml-13 pl-13">
                <div className="space-y-0.5">
                  {vip.perks.map((perk, i) => (
                    <div key={i} className={`text-[11px] flex items-center gap-1 ${
                      isUnlocked ? 'text-green-400/70' : 'text-gray-600'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${isUnlocked ? 'bg-green-400' : 'bg-gray-700'}`} />
                      {perk}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
