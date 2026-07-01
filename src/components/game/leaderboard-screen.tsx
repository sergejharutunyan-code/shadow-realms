'use client';

import { useGameStore } from '@/lib/game-store';
import { NPC_LEADERBOARD, LeaderboardEntry } from '@/lib/game-data';
import { motion } from 'framer-motion';
import { Trophy, Crown, Swords, Shield, Zap } from 'lucide-react';

export function LeaderboardScreen() {
  const player = useGameStore(s => s.player);
  const heroes = useGameStore(s => s.heroes);

  // Calculate player power
  const playerPower = heroes.reduce((sum, h) => sum + h.attack + h.defense + Math.floor(h.health / 10) + h.speed * 5, 0);

  // Insert player into leaderboard
  const allEntries: LeaderboardEntry[] = [...NPC_LEADERBOARD];
  const playerEntry: LeaderboardEntry = {
    rank: 0, // Will be calculated
    name: player.name,
    level: player.level,
    power: playerPower,
    vipLevel: player.vipLevel,
    isPlayer: true,
  };

  // Find player's rank
  const sortedByPower = [...allEntries, playerEntry].sort((a, b) => b.power - a.power);
  const playerRank = sortedByPower.findIndex(e => e.isPlayer) + 1;
  playerEntry.rank = playerRank;

  // Get entries around player
  const playerIndex = sortedByPower.findIndex(e => e.isPlayer);
  const startIdx = Math.max(0, playerIndex - 2);
  const endIdx = Math.min(sortedByPower.length, playerIndex + 3);
  const nearbyEntries = sortedByPower.slice(startIdx, endIdx);

  // Top 10
  const top10 = sortedByPower.slice(0, 10);

  return (
    <div className="p-3 sm:p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-2" />
        <h2 className="text-xl font-bold gold-text">Hall of Champions</h2>
        <p className="text-xs text-gray-400 mt-1">The most powerful warriors in the Shadow Realms</p>
      </div>

      {/* Player Rank Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-900/30 to-yellow-900/20 border-2 border-amber-500/40 rounded-xl p-4 mb-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white font-bold text-lg border-2 border-amber-400/50">
              #{playerRank}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-amber-200">{player.name}</span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  YOU
                </span>
              </div>
              <div className="text-xs text-gray-400">Level {player.level} · VIP {player.vipLevel}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Power</div>
            <div className="text-lg font-bold gold-text">{playerPower.toLocaleString()}</div>
          </div>
        </div>
      </motion.div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {top10.slice(0, 3).map((entry, i) => {
          const podiumColors = [
            'from-yellow-500/30 to-yellow-700/10 border-yellow-500/40',
            'from-gray-300/20 to-gray-500/10 border-gray-400/30',
            'from-orange-600/20 to-orange-800/10 border-orange-600/30',
          ];
          const podiumIcons = ['🥇', '🥈', '🥉'];
          return (
            <motion.div
              key={entry.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-gradient-to-b ${podiumColors[i]} border rounded-xl p-3 text-center ${i === 0 ? 'sm:scale-105' : ''}`}
            >
              <div className="text-3xl mb-1">{podiumIcons[i]}</div>
              <div className="text-xs font-bold text-white truncate">{entry.name}</div>
              <div className="text-[10px] text-gray-400">Lv.{entry.level}</div>
              <div className="text-xs font-bold text-amber-300 mt-1">{(entry.power / 1000000).toFixed(1)}M</div>
              {entry.vipLevel > 0 && (
                <div className="flex items-center justify-center gap-0.5 mt-0.5">
                  <Crown className="w-2.5 h-2.5 text-amber-400" />
                  <span className="text-[9px] text-amber-400">VIP {entry.vipLevel}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Full Leaderboard */}
      <div className="bg-[#0f0f23]/80 border border-amber-500/10 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-amber-900/20 to-transparent px-3 py-2 border-b border-amber-500/10">
          <h3 className="text-sm font-bold text-amber-200">Global Rankings</h3>
        </div>
        <div className="divide-y divide-gray-800/30">
          {top10.map((entry, i) => (
            <LeaderboardRow key={entry.name} entry={entry} rank={i + 1} />
          ))}
          {playerRank > 10 && (
            <>
              <div className="px-3 py-1 text-center text-[10px] text-gray-600">···</div>
              {nearbyEntries.map(entry => (
                <LeaderboardRow key={entry.name} entry={entry} rank={entry.rank} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Power Calculation Info */}
      <div className="mt-4 bg-blue-900/10 border border-blue-500/20 rounded-lg p-3">
        <div className="text-xs text-blue-300 font-medium mb-1">📊 Your Power: {playerPower.toLocaleString()}</div>
        <div className="text-[10px] text-gray-400">
          Power is calculated from your heroes' total Attack + Defense + Health/10 + Speed×5.
          Level up heroes, summon stronger champions, and equip gear to increase your power!
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const isPlayer = entry.isPlayer;
  const rankColor = rank <= 3 ? 'text-yellow-400' : rank <= 10 ? 'text-gray-300' : 'text-gray-500';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center gap-3 px-3 py-2 ${
        isPlayer ? 'bg-amber-500/10 border-l-2 border-amber-400' : ''
      }`}
    >
      <div className={`w-8 text-center font-bold ${rankColor}`}>
        #{rank}
      </div>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600/40 to-indigo-700/40 flex items-center justify-center text-white text-xs font-bold border border-white/10">
        {entry.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className={`text-sm font-bold truncate ${isPlayer ? 'text-amber-200' : 'text-white'}`}>
            {entry.name}
          </span>
          {entry.vipLevel > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
              <Crown className="w-2.5 h-2.5" />
              {entry.vipLevel}
            </span>
          )}
          {isPlayer && (
            <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded">YOU</span>
          )}
        </div>
        <div className="text-[10px] text-gray-500">Level {entry.level}</div>
      </div>
      <div className="text-right">
        <div className="text-xs font-bold text-amber-300">
          {entry.power >= 1000000 ? `${(entry.power / 1000000).toFixed(2)}M` : entry.power.toLocaleString()}
        </div>
        <div className="text-[10px] text-gray-500">Power</div>
      </div>
    </motion.div>
  );
}
