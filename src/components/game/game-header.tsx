'use client';

import { useGameStore } from '@/lib/game-store';
import { Gem, Coins, Zap, Crown, Star, Flame, Bell, Volume2, VolumeX, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { feedback } from '@/lib/feedback';
import { useAuthStore } from '@/lib/auth-store';

export function GameHeader() {
  const player = useGameStore(s => s.player);
  const notifications = useGameStore(s => s.notifications);
  const signOut = useAuthStore(s => s.signOut);
  const [muted, setMuted] = useState(false);

  // Sync the persisted mute preference after hydration (localStorage only
  // exists on the client, so we read it in an effect to avoid mismatches).
  useEffect(() => {
    setMuted(feedback.isMuted());
  }, []);
  const playerLevel = player.level;
  const xpNeeded = Math.floor(100 * Math.pow(1.5, playerLevel - 1));
  const xpPercent = Math.min(100, (player.experience / xpNeeded) * 100);

  return (
    <div className="relative z-40">
      {/* Main header bar - premium upgraded */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#080412] via-[#1a0a2e] to-[#080412] border-b border-amber-500/20">
        {/* Animated gold line at top */}
        <div className="premium-header-line" />

        {/* Richer background pattern */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-5" style={{
            background: 'repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255,200,50,0.03) 60px, rgba(255,200,50,0.03) 61px)'
          }} />
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-transparent via-amber-500/8 to-transparent"
          />
          {/* Subtle diagonal light beam */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-bl from-amber-500/5 to-transparent rotate-45" />
        </div>

        <div className="relative flex items-center justify-between px-3 py-2.5 max-w-7xl mx-auto">
          {/* Player info */}
          <div className="flex items-center gap-2.5">
            {/* Premium Avatar with frame */}
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-red-600 to-purple-800 flex items-center justify-center text-white font-bold text-sm premium-avatar-frame shadow-lg"
              >
                {playerLevel}
              </motion.div>
              {/* Level glow ring - enhanced */}
              <div className="absolute -inset-1.5 rounded-xl border border-amber-500/25 animate-pulse" />
              {/* VIP badge */}
              {player.vipLevel > 0 && (
                <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/40 border border-yellow-300/50">
                  <Crown className="w-2.5 h-2.5 text-black" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold premium-gold-text">{player.name}</span>
                {player.vipLevel > 0 && (
                  <span className="flex items-center gap-0.5 bg-gradient-to-r from-amber-600/30 to-amber-500/10 border border-amber-500/30 rounded-full px-1.5 py-0">
                    <Crown className="w-2.5 h-2.5 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-300">{player.vipLevel}</span>
                  </span>
                )}
              </div>
              {/* Premium XP bar */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-20 h-2 bg-black/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercent}%` }}
                    className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 rounded-full relative"
                  >
                    <div className="absolute inset-0 premium-shimmer opacity-40" />
                  </motion.div>
                </div>
                <span className="text-[9px] text-amber-400/60 font-medium whitespace-nowrap">Lv.{playerLevel}</span>
              </div>
            </div>
          </div>

          {/* Premium Resource badges */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <PremiumResourceBadge
              icon={<Zap className="w-3.5 h-3.5" />}
              value={player.energy}
              max={player.maxEnergy}
              color="text-emerald-400"
              iconBg="bg-emerald-500/20"
            />
            <PremiumResourceBadge
              icon={<Coins className="w-3.5 h-3.5" />}
              value={player.gold}
              color="text-amber-400"
              iconBg="bg-amber-500/20"
            />
            <PremiumResourceBadge
              icon={<Gem className="w-3.5 h-3.5" />}
              value={player.gems}
              color="text-cyan-400"
              iconBg="bg-cyan-500/20"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                feedback.unlock();
                const m = feedback.toggleMuted();
                setMuted(m);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black/40 border border-white/10 text-amber-300/80 hover:text-amber-200 transition-colors"
              title={muted ? 'Unmute sound' : 'Mute sound'}
              aria-label={muted ? 'Unmute sound' : 'Mute sound'}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { feedback.tap(); signOut(); }}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black/40 border border-white/10 text-amber-300/80 hover:text-red-300 transition-colors"
              title="Switch profile / sign out"
              aria-label="Switch profile or sign out"
            >
              <LogOut className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-1 pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ y: -30, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0, scale: 0.8 }}
              className={`px-4 py-2 rounded-xl text-sm font-medium text-center whitespace-nowrap shadow-xl pointer-events-auto ${
                n.type === 'epic'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/30'
                  : n.type === 'success'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-500/30'
                  : n.type === 'warning'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-amber-500/30'
                  : 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-slate-500/30'
              }`}
            >
              {n.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PremiumResourceBadge({ icon, value, max, color, iconBg }: {
  icon: React.ReactNode; value: number; max?: number; color: string; iconBg: string;
}) {
  const formatValue = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 10000) return `${(v / 1000).toFixed(1)}K`;
    return v.toLocaleString();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="premium-resource-pill flex items-center gap-1.5"
    >
      <span className={`${iconBg} rounded-full w-5 h-5 flex items-center justify-center`}>
        {icon}
      </span>
      <span className={`text-xs font-bold ${color} tabular-nums`}>
        {formatValue(value)}
      </span>
      {max !== undefined && (
        <span className="text-[8px] text-amber-400/40 font-medium">/{max}</span>
      )}
    </motion.div>
  );
}
