'use client';

import { useGameStore, GameScreen } from '@/lib/game-store';
import { useAuthStore } from '@/lib/auth-store';
import { AuthScreen } from '@/components/game/auth-screen';
import { GameHeader } from '@/components/game/game-header';
import { GameNav } from '@/components/game/game-nav';
import { GameDashboard } from '@/components/game/game-dashboard';
import { HeroRoster } from '@/components/game/hero-roster';
import { SummoningPortal } from '@/components/game/summoning-portal';
import { BattleArena } from '@/components/game/battle-arena';
import { CampaignMap } from '@/components/game/campaign-map';
import { GameShop } from '@/components/game/game-shop';
import { VIPLounge } from '@/components/game/vip-lounge';
import { EquipmentScreen } from '@/components/game/equipment-screen';
import { AchievementsScreen } from '@/components/game/achievements-screen';
import { LeaderboardScreen } from '@/components/game/leaderboard-screen';
import { ArenaScreen } from '@/components/game/arena-screen';
import { MissionsScreen } from '@/components/game/missions-screen';
import { GuildScreen } from '@/components/game/guild-screen';
import { TowerScreen } from '@/components/game/tower-screen';
import { DungeonScreen } from '@/components/game/dungeon-screen';
import { MerchantScreen } from '@/components/game/merchant-screen';
import { LoginStreakScreen } from '@/components/game/login-streak-screen';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Map screens to their ambient backdrop class
const SCREEN_BACKDROP: Partial<Record<GameScreen, string>> = {
  battle: 'backdrop-battle',
  campaign: 'backdrop-battle',
  summon: 'backdrop-summon',
  shop: 'backdrop-shop',
  guild: 'backdrop-guild',
  arena: 'backdrop-arena',
  dungeon: 'backdrop-battle',
  tower: 'backdrop-summon',
  merchant: 'backdrop-shop',
};

// Screen transition variants
const screenVariants = {
  initial: { opacity: 0, scale: 0.98, filter: 'blur(2px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.98, filter: 'blur(2px)' },
};

export default function GamePage() {
  const screen = useGameStore(s => s.screen);
  const checkEnergyRefill = useGameStore(s => s.checkEnergyRefill);
  const setShowDailyReward = useGameStore(s => s.setShowDailyReward);
  const dailyClaimed = useGameStore(s => s.dailyClaimed);
  const checkAchievements = useGameStore(s => s.checkAchievements);
  const checkLoginStreak = useGameStore(s => s.checkLoginStreak);
  const authUser = useAuthStore(s => s.user);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Check energy refill on mount
  useEffect(() => {
    checkEnergyRefill();
    // Show daily reward on first load
    const timer = setTimeout(() => {
      if (!dailyClaimed) {
        setShowDailyReward(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Auto energy refill check
  useEffect(() => {
    const interval = setInterval(() => {
      checkEnergyRefill();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check achievements periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkAchievements();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Check login streak on mount
  useEffect(() => {
    checkLoginStreak();
  }, []);

  const backdropClass = SCREEN_BACKDROP[screen] || '';

  // Gate the game behind the login/profile screen (offline-first).
  // Avoid a hydration flash by waiting for the client mount first.
  if (!mounted) return <div className="min-h-screen dark-fantasy-bg particles-bg" />;
  if (!authUser) return <AuthScreen />;

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard': return <GameDashboard />;
      case 'heroes': return <HeroRoster />;
      case 'summon': return <SummoningPortal />;
      case 'battle': return <BattleArena />;
      case 'campaign': return <CampaignMap />;
      case 'shop': return <GameShop />;
      case 'vip': return <VIPLounge />;
      case 'equipment': return <EquipmentScreen />;
      case 'achievements': return <AchievementsScreen />;
      case 'leaderboard': return <LeaderboardScreen />;
      case 'arena': return <ArenaScreen />;
      case 'missions': return <MissionsScreen />;
      case 'guild': return <GuildScreen />;
      case 'tower': return <TowerScreen />;
      case 'dungeon': return <DungeonScreen />;
      case 'merchant': return <MerchantScreen />;
      case 'login-streak': return <LoginStreakScreen />;
      default: return <GameDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col dark-fantasy-bg particles-bg relative">
      {/* Atmospheric ember particles */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="ember-particle"
            style={{
              left: `${(i * 6.25) % 100}%`,
              animationDuration: `${8 + (i % 5) * 2}s`,
              animationDelay: `${i * 0.5}s`,
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
            }}
          />
        ))}
        {/* Ambient backdrop per screen */}
        <div className={`inset-0 absolute transition-opacity duration-700 ${backdropClass}`} />
      </div>
      <GameHeader />
      <main className="flex-1 overflow-y-auto game-scrollbar relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>
      <GameNav />
    </div>
  );
}
