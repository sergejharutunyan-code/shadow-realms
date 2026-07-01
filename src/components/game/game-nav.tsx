'use client';

import { useGameStore, GameScreen } from '@/lib/game-store';
import { Home, Users, Sparkles, Swords, Map, ShoppingBag, Crown, Shirt, Trophy, Medal, Swords as ArenaIcon, Scroll, Flag, Castle, Flame, Store, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { feedback } from '@/lib/feedback';

const PRIMARY_NAV: { screen: GameScreen; label: string; icon: React.ReactNode }[] = [
  { screen: 'dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { screen: 'heroes', label: 'Heroes', icon: <Users className="w-5 h-5" /> },
  { screen: 'summon', label: 'Summon', icon: <Sparkles className="w-5 h-5" /> },
  { screen: 'campaign', label: 'Battle', icon: <Swords className="w-5 h-5" /> },
  { screen: 'shop', label: 'Shop', icon: <ShoppingBag className="w-5 h-5" /> },
];

const SECONDARY_NAV: { screen: GameScreen; label: string; icon: React.ReactNode; color: string }[] = [
  { screen: 'dungeon', label: 'Dungeon', icon: <Flame className="w-5 h-5" />, color: 'text-orange-400' },
  { screen: 'arena', label: 'Arena', icon: <ArenaIcon className="w-5 h-5" />, color: 'text-red-400' },
  { screen: 'tower', label: 'Tower', icon: <Castle className="w-5 h-5" />, color: 'text-fuchsia-400' },
  { screen: 'missions', label: 'Quests', icon: <Scroll className="w-5 h-5" />, color: 'text-amber-400' },
  { screen: 'guild', label: 'Guild', icon: <Flag className="w-5 h-5" />, color: 'text-emerald-400' },
  { screen: 'equipment', label: 'Gear', icon: <Shirt className="w-5 h-5" />, color: 'text-orange-400' },
  { screen: 'achievements', label: 'Awards', icon: <Trophy className="w-5 h-5" />, color: 'text-yellow-400' },
  { screen: 'leaderboard', label: 'Ranks', icon: <Medal className="w-5 h-5" />, color: 'text-cyan-400' },
  { screen: 'vip', label: 'VIP', icon: <Crown className="w-5 h-5" />, color: 'text-purple-400' },
  { screen: 'merchant', label: 'Merchant', icon: <Store className="w-5 h-5" />, color: 'text-amber-300' },
  { screen: 'login-streak', label: 'Streak', icon: <CalendarDays className="w-5 h-5" />, color: 'text-rose-400' },
];

export function GameNav() {
  const screen = useGameStore(s => s.screen);
  const setScreen = useGameStore(s => s.setScreen);
  const [showMore, setShowMore] = useState(false);

  const isSecondary = SECONDARY_NAV.some(n => n.screen === screen);
  const activeSecondary = SECONDARY_NAV.find(n => n.screen === screen);

  return (
    <div className="premium-nav-glass relative z-30">
      {/* Premium gold top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1.5">
        {PRIMARY_NAV.map((item) => {
          const isActive = screen === item.screen;
          return (
            <motion.button
              key={item.screen}
              whileTap={{ scale: 0.9 }}
              onClick={() => { feedback.unlock(); feedback.tap(); setScreen(item.screen); }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative ${
                isActive
                  ? 'text-amber-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {/* Active glow background */}
              {isActive && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute inset-0 bg-amber-500/10 rounded-xl"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon with premium glow when active */}
              <span className={`relative z-10 ${isActive ? 'drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]' : ''}`}>
                {item.icon}
              </span>

              <span className={`text-[10px] font-semibold relative z-10 ${isActive ? 'text-amber-300' : ''}`}>
                {item.label}
              </span>

              {/* Premium golden glow indicator */}
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-0.5 w-8 h-1 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, #ffd700, #ffe566, #ffd700, transparent)',
                    boxShadow: '0 0 8px rgba(255, 215, 0, 0.6), 0 0 16px rgba(255, 215, 0, 0.3)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}

        {/* More button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowMore(!showMore)}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative ${
            isSecondary || showMore ? 'text-amber-400' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {/* Active glow for more when secondary active */}
          {(isSecondary || showMore) && (
            <motion.div
              className="absolute inset-0 bg-amber-500/10 rounded-xl"
            />
          )}

          <div className="relative z-10">
            <span className={isSecondary ? 'drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]' : ''}>
              {isSecondary ? activeSecondary?.icon : <Map className="w-5 h-5" />}
            </span>
            {isSecondary && (
              <motion.div
                layoutId="nav-indicator-2"
                className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, #ffd700, #ffe566, #ffd700, transparent)',
                  boxShadow: '0 0 8px rgba(255, 215, 0, 0.6), 0 0 16px rgba(255, 215, 0, 0.3)',
                }}
              />
            )}
            {/* Notification dot for missions/arena */}
            {!isSecondary && !showMore && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/40" />
            )}
          </div>
          <span className={`text-[10px] font-semibold relative z-10 ${isSecondary ? 'text-amber-300' : ''}`}>
            {isSecondary ? activeSecondary?.label : 'More'}
          </span>
        </motion.button>
      </div>

      {/* Secondary nav dropdown - premium glass panel */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-amber-500/10 overflow-hidden premium-glass"
          >
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-w-lg mx-auto px-3 py-3">
              {SECONDARY_NAV.map((item, i) => {
                const isActive = screen === item.screen;
                return (
                  <motion.button
                    key={item.screen}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      feedback.unlock();
                      feedback.select();
                      setScreen(item.screen);
                      setShowMore(false);
                    }}
                    className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all relative ${
                      isActive
                        ? 'bg-amber-500/15 ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/10'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <span className={`transition-all ${isActive ? 'text-amber-400 drop-shadow-[0_0_4px_rgba(255,215,0,0.4)]' : item.color}`}>
                      {item.icon}
                    </span>
                    <span className={`text-[10px] font-semibold ${isActive ? 'text-amber-300' : 'text-gray-400'}`}>
                      {item.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
