'use client';

import { useGameStore } from '@/lib/game-store';
import { CAMPAIGN_STAGES, FACTION_CONFIG, RARITY_CONFIG } from '@/lib/game-data';
import { motion } from 'framer-motion';
import { Map, Swords, Lock, ChevronRight, Zap, Star, Trophy } from 'lucide-react';

export function CampaignMap() {
  const player = useGameStore(s => s.player);
  const startBattle = useGameStore(s => s.startBattle);

  const maxStage = Math.min(player.campaignStage, CAMPAIGN_STAGES.length);
  const visibleStages = CAMPAIGN_STAGES.slice(0, Math.min(maxStage + 3, CAMPAIGN_STAGES.length));

  return (
    <div className="p-3 sm:p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <Map className="w-10 h-10 text-amber-400 mx-auto mb-2" />
        <h2 className="text-xl font-bold gold-text">Campaign</h2>
        <p className="text-xs text-gray-400 mt-1">Battle through stages to earn rewards and progress</p>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-900/50 border border-gray-700/30 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-amber-200 font-medium">Progress</span>
          <span className="text-xs text-gray-400">Stage {maxStage} / {CAMPAIGN_STAGES.length}</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all"
            style={{ width: `${(maxStage / CAMPAIGN_STAGES.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Stage List */}
      <div className="space-y-2">
        {visibleStages.map((stage, i) => {
          const isUnlocked = stage.id <= maxStage;
          const isCurrent = stage.id === maxStage;
          const isCompleted = stage.id < maxStage;
          const canAffordEnergy = player.energy >= stage.energyCost;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`relative overflow-hidden rounded-xl border transition-all ${
                isCurrent
                  ? 'border-amber-500/30 bg-gradient-to-r from-amber-900/20 to-amber-800/10 shadow-lg shadow-amber-500/10'
                  : isCompleted
                  ? 'border-green-500/20 bg-green-900/10'
                  : isUnlocked
                  ? 'border-gray-700/30 bg-gray-900/30'
                  : 'border-gray-800/20 bg-gray-900/10 opacity-50'
              }`}
            >
              {/* Completed indicator */}
              {isCompleted && (
                <div className="absolute top-2 right-2 bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ✓ Cleared
                </div>
              )}

              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-300">Stage {stage.id}</span>
                      {isCurrent && (
                        <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-white mt-0.5">{stage.name}</div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                      <span>👤 Lv.{stage.enemyLevel}</span>
                      <span>{FACTION_CONFIG[stage.enemyFaction]?.icon} {FACTION_CONFIG[stage.enemyFaction]?.label}</span>
                      <span>⚡ {stage.energyCost} Energy</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-amber-300/70">🪙 {stage.rewards.gold}</span>
                      <span className="text-[10px] text-green-300/70">XP {stage.rewards.experience}</span>
                      <span className="text-[10px] text-cyan-300/70">💎 {stage.rewards.gems}</span>
                    </div>
                  </div>

                  {isUnlocked ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startBattle(stage.id)}
                      disabled={!canAffordEnergy}
                      className={`ml-3 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1 transition-all ${
                        canAffordEnergy
                          ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600'
                          : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Swords className="w-4 h-4" />
                      Fight
                    </motion.button>
                  ) : (
                    <div className="ml-3 px-4 py-2 text-gray-600">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Energy Info */}
      <div className="mt-4 text-center">
        <div className="text-xs text-gray-500">
          ⚡ Energy: {player.energy}/{player.maxEnergy} (Refills 1 per 5 min)
        </div>
        {player.energy < 20 && (
          <button
            onClick={() => useGameStore.getState().setScreen('shop')}
            className="mt-2 text-xs text-cyan-400 hover:text-cyan-300"
          >
            Buy Energy Refill →
          </button>
        )}
      </div>
    </div>
  );
}
