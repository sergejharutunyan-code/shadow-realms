'use client';

import { useGameStore, GameScreen } from '@/lib/game-store';
import { RARITY_CONFIG, ELEMENT_CONFIG, DAILY_REWARDS, ARENA_RANKS, DAILY_MISSIONS } from '@/lib/game-data';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import {
  Swords, Sparkles, Map, ShoppingBag, Crown, Users, Zap, Star, Gift,
  ChevronRight, Trophy, Target, Flame, Shield, Clock, TowerControl as Tower,
  Landmark as Dungeon, Scroll, Store, CircleDashed, PartyPopper
} from 'lucide-react';
import Image from 'next/image';
import { GAME_IMAGES, getHeroImageUrl, getHeroGradient } from '@/lib/hero-images';

// ============= Constants =============

const NEWS_EVENTS = [
  { emoji: '🔥', text: 'Wandering Merchant arrives in 2h 30m!' },
  { emoji: '⚔️', text: 'Arena Season 3 starts tomorrow!' },
  { emoji: '🌟', text: 'New Hero: Void Emperor Zarkon - Rate Up!' },
  { emoji: '🏰', text: 'Guild Wars registration open!' },
  { emoji: '💀', text: 'Tower of Eternity: Double rewards this weekend!' },
];

const DAILY_REWARD_ICONS = ['🪙', '⬆️', '⚡', '🔮', '🦸', '🧙', '🐉'];

// ============= Main Component =============

export function GameDashboard() {
  const player = useGameStore(s => s.player);
  const heroes = useGameStore(s => s.heroes);
  const team = useGameStore(s => s.team);
  const setScreen = useGameStore(s => s.setScreen);
  const showDailyReward = useGameStore(s => s.showDailyReward);
  const setShowDailyReward = useGameStore(s => s.setShowDailyReward);
  const claimDailyReward = useGameStore(s => s.claimDailyReward);
  const dailyClaimed = useGameStore(s => s.dailyClaimed);
  const arenaTrophies = useGameStore(s => s.arenaTrophies);
  const towerHighestFloor = useGameStore(s => s.towerHighestFloor);
  const loginStreak = useGameStore(s => s.loginStreak);
  const showStreakReward = useGameStore(s => s.showStreakReward);
  const dungeonAttempts = useGameStore(s => s.dungeonAttempts);
  const missionProgress = useGameStore(s => s.missionProgress);
  const getMerchantDeals = useGameStore(s => s.getMerchantDeals);

  const teamHeroes = team.map(id => heroes.find(h => h.id === id)).filter(Boolean);
  const todayReward = DAILY_REWARDS[player.dailyRewardDay % 7];

  // Calculate team power
  const teamPower = teamHeroes.reduce((sum, h) => {
    if (!h) return sum;
    return sum + h.attack + h.defense + h.health / 10 + h.speed * 5;
  }, 0);

  // Power ranking estimation
  const powerRank = useMemo(() => {
    const p = teamPower;
    if (p > 50000) return 'Top 1%';
    if (p > 30000) return 'Top 5%';
    if (p > 15000) return 'Top 10%';
    if (p > 5000) return 'Top 25%';
    if (p > 1000) return 'Top 50%';
    return 'Unranked';
  }, [teamPower]);

  // Arena rank from trophies
  const arenaRank = useMemo(() => {
    let rank = ARENA_RANKS[0];
    for (const r of ARENA_RANKS) {
      if (arenaTrophies >= r.minTrophies) rank = r;
    }
    return rank;
  }, [arenaTrophies]);

  // Today's dungeon element (based on day of week)
  const todayElement = useMemo(() => {
    const dayOfWeek = new Date().getDay();
    const elements = ['fire', 'water', 'earth', 'dark', 'light', 'void'];
    return elements[dayOfWeek % elements.length];
  }, []);

  const todayElementConfig = ELEMENT_CONFIG[todayElement as keyof typeof ELEMENT_CONFIG];

  // Merchant deals check
  const merchantDeals = useMemo(() => {
    try { return getMerchantDeals(); } catch { return []; }
  }, [getMerchantDeals]);
  const hasMerchantDeals = merchantDeals.length > 0;

  // Daily quest progress
  const dailyQuestProgress = useMemo(() => {
    const completed = missionProgress.filter(m => m.claimed).length;
    return { completed, total: DAILY_MISSIONS.length };
  }, [missionProgress]);

  // Countdown timer for special offer (simulated - resets daily)
  const [offerTime, setOfferTime] = useState('');
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const diff = end.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setOfferTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Confetti state for daily reward claim
  const [showConfetti, setShowConfetti] = useState(false);

  // News ticker scroll
  const [tickerIndex, setTickerIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % NEWS_EVENTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Animated gradient border keyframes
  const [gradientPhase, setGradientPhase] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setGradientPhase(prev => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-3 sm:p-4 space-y-4 max-w-4xl mx-auto">

      {/* ===== PREMIUM WELCOME BANNER ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-[2px]"
      >
        {/* Animated gradient border */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            background: gradientPhase === 0
              ? 'linear-gradient(135deg, rgba(245,158,11,0.6), transparent 40%, rgba(245,158,11,0.4))'
              : gradientPhase === 1
              ? 'linear-gradient(135deg, rgba(168,85,247,0.6), transparent 40%, rgba(168,85,247,0.4))'
              : 'linear-gradient(135deg, rgba(239,68,68,0.6), transparent 40%, rgba(239,68,68,0.4))',
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />

        <div className="relative rounded-2xl overflow-hidden border border-amber-500/15 p-4 sm:p-6 bg-[#1a0a2e]">
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src={GAME_IMAGES.titleBg}
              alt="Shadow Realms"
              fill
              className="object-cover opacity-20"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a1a]/95 via-[#1a0a2e]/80 to-[#0a0a1a]/95" />

          {/* Premium decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-500/8 to-transparent rounded-bl-full" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-purple-500/8 to-transparent rounded-tr-full" />

          {/* Premium floating sparkle particles */}
          <motion.div
            className="absolute top-6 right-8 text-amber-300/70"
            animate={{ y: [-4, 4, -4], opacity: [0.4, 0.9, 0.4], scale: [0.8, 1.3, 0.8] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            ✦
          </motion.div>
          <motion.div
            className="absolute top-14 right-20 text-purple-300/50 text-sm"
            animate={{ y: [2, -6, 2], opacity: [0.3, 0.7, 0.3], scale: [0.6, 1.1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            ✧
          </motion.div>
          <motion.div
            className="absolute bottom-10 right-14 text-red-300/50 text-xs"
            animate={{ y: [-2, 5, -2], opacity: [0.2, 0.6, 0.2], scale: [0.7, 1.2, 0.7] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            ✦
          </motion.div>
          <motion.div
            className="absolute bottom-6 left-20 text-amber-200/40 text-sm"
            animate={{ y: [-3, 3, -3], opacity: [0.2, 0.5, 0.2], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          >
            ✧
          </motion.div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/30 to-red-600/30 flex items-center justify-center border border-amber-500/30">
                  <Flame className="w-4 h-4 text-amber-400" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold premium-gold-text">Shadow Realms</h1>
              </div>
              {/* Premium Power Ranking Badge */}
              <div className="premium-power-display px-3 py-1.5 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-bold premium-gold-text">{powerRank}</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4 font-medium tracking-wide">Champions of Darkness</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <PremiumDashboardStat label="Team Power" value={Math.floor(teamPower).toLocaleString()} icon={<Swords className="w-4 h-4 text-red-400" />} accent="from-red-500/20 to-red-500/5" />
              <PremiumDashboardStat label="Heroes" value={heroes.length.toString()} icon={<Users className="w-4 h-4 text-purple-400" />} accent="from-purple-500/20 to-purple-500/5" />
              <PremiumDashboardStat label="Campaign" value={`Stage ${player.campaignStage}`} icon={<Target className="w-4 h-4 text-green-400" />} accent="from-green-500/20 to-green-500/5" />
              <PremiumDashboardStat label="VIP" value={`Level ${player.vipLevel}`} icon={<Crown className="w-4 h-4 text-amber-400" />} accent="from-amber-500/20 to-amber-500/5" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== PREMIUM NEWS/EVENTS TICKER ===== */}
      <div className="premium-ticker rounded-xl h-9 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={tickerIndex}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="whitespace-nowrap text-xs text-amber-200/80 px-12 w-full text-center font-medium"
          >
            {NEWS_EVENTS[tickerIndex].emoji} {NEWS_EVENTS[tickerIndex].text}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ===== PREMIUM DAILY REWARD BANNER ===== */}
      {!dailyClaimed && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-amber-700/25 to-amber-500/5 border border-amber-500/25 rounded-xl p-3.5 flex items-center justify-between cursor-pointer hover:border-amber-400/40 transition-all group"
          onClick={() => setShowDailyReward(true)}
        >
          {/* Premium shimmer */}
          <div className="absolute inset-0 premium-shimmer opacity-50" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-11 h-11 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-500/20">
              <Gift className="w-5 h-5 text-amber-400 animate-bounce" />
            </div>
            <div>
              <div className="text-sm font-bold premium-gold-text">Daily Reward Available!</div>
              <div className="text-xs text-amber-400/70">Day {(player.dailyRewardDay % 7) + 1} - {todayReward?.item}</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform relative z-10" />
        </motion.div>
      )}

      {/* ===== IDLE EARNINGS CHEST ===== */}
      <IdleRewardsCard />

      {/* ===== PREMIUM QUICK ACTIONS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <PremiumQuickAction
          icon={<Sparkles className="w-7 h-7" />}
          label="Summon Heroes"
          sublabel={`${150} Gems`}
          gradientFrom="from-purple-700/40"
          gradientTo="to-purple-500/10"
          borderColor="border-purple-500/25"
          glowColor="shadow-purple-500/10"
          onClick={() => setScreen('summon')}
        />
        <PremiumQuickAction
          icon={<Swords className="w-7 h-7" />}
          label="Battle Now"
          sublabel={`Stage ${player.campaignStage}`}
          gradientFrom="from-red-700/40"
          gradientTo="to-red-500/10"
          borderColor="border-red-500/25"
          glowColor="shadow-red-500/10"
          onClick={() => setScreen('campaign')}
        />
        <PremiumQuickAction
          icon={<ShoppingBag className="w-7 h-7" />}
          label="Shop"
          sublabel="Special Offers"
          gradientFrom="from-amber-700/40"
          gradientTo="to-amber-500/10"
          borderColor="border-amber-500/25"
          glowColor="shadow-amber-500/10"
          onClick={() => setScreen('shop')}
        />
        <PremiumQuickAction
          icon={<Crown className="w-7 h-7" />}
          label="VIP Lounge"
          sublabel={`Level ${player.vipLevel}`}
          gradientFrom="from-yellow-700/40"
          gradientTo="to-yellow-500/10"
          borderColor="border-yellow-500/25"
          glowColor="shadow-yellow-500/10"
          onClick={() => setScreen('vip')}
        />
      </div>

      {/* ===== PREMIUM ACTIVITY HUB SECTION ===== */}
      <div className="premium-glass rounded-xl p-4">
        <h2 className="text-sm font-bold text-amber-200 flex items-center gap-2 mb-3 section-title">
          <Zap className="w-4 h-4" /> Activity Hub
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Arena Rank */}
          <PremiumActivityCard
            icon={<span className="text-lg">{arenaRank.icon}</span>}
            label="Arena Rank"
            value={arenaRank.rank}
            sublabel={`${arenaTrophies} 🏆`}
            accentColor="text-amber-300"
            bgColor="bg-amber-500/10"
            borderColor="border-amber-500/20"
            onClick={() => setScreen('arena')}
          />
          {/* Tower */}
          <PremiumActivityCard
            icon={<Tower className="w-4 h-4 text-purple-400" />}
            label="Tower"
            value={`Floor ${towerHighestFloor}`}
            sublabel="Highest"
            accentColor="text-purple-300"
            bgColor="bg-purple-500/10"
            borderColor="border-purple-500/20"
            onClick={() => setScreen('tower')}
          />
          {/* Login Streak */}
          <PremiumActivityCard
            icon={<Flame className="w-4 h-4 text-orange-400" />}
            label="Login Streak"
            value={`${loginStreak} Days`}
            sublabel={loginStreak >= 7 ? '🔥 On Fire!' : 'Keep going!'}
            accentColor="text-orange-300"
            bgColor="bg-orange-500/10"
            borderColor="border-orange-500/20"
            onClick={() => setScreen('login-streak')}
          />
          {/* Dungeon */}
          <PremiumActivityCard
            icon={<span className="text-sm">{todayElementConfig?.icon || '⚔️'}</span>}
            label="Dungeon"
            value={todayElementConfig?.label || 'N/A'}
            sublabel="Today's Element"
            accentColor={todayElementConfig?.color || 'text-gray-300'}
            bgColor={todayElementConfig?.bgColor || 'bg-gray-500/10'}
            borderColor="border-gray-500/20"
            onClick={() => setScreen('dungeon')}
          />
        </div>
      </div>

      {/* ===== PREMIUM QUICK ACCESS BAR ===== */}
      {(hasMerchantDeals || showStreakReward || dailyQuestProgress.completed < dailyQuestProgress.total) && (
        <div className="flex gap-2 overflow-x-auto pb-1 game-scrollbar">
          {hasMerchantDeals && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setScreen('merchant')}
              className="flex-shrink-0 flex items-center gap-2 premium-glass rounded-xl px-3 py-2.5 hover:border-amber-400/30 transition-all group"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <div className="text-[10px] font-bold text-amber-200">Wandering Merchant</div>
                <div className="text-[9px] text-amber-400/70">{merchantDeals.length} deals available</div>
              </div>
              <ChevronRight className="w-3 h-3 text-amber-400/60 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          )}
          {showStreakReward && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setScreen('login-streak')}
              className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-orange-600/20 to-orange-500/5 border border-orange-500/25 rounded-xl px-3 py-2.5 hover:border-orange-400/40 transition-all group"
            >
              <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
              <div className="text-left">
                <div className="text-[10px] font-bold text-orange-200">Login Streak Reward!</div>
                <div className="text-[9px] text-orange-400/70">Claim now</div>
              </div>
              <ChevronRight className="w-3 h-3 text-orange-400/60 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          )}
          {dailyQuestProgress.completed < dailyQuestProgress.total && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setScreen('missions')}
              className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-r from-cyan-600/20 to-cyan-500/5 border border-cyan-500/25 rounded-xl px-3 py-2.5 hover:border-cyan-400/40 transition-all group"
            >
              <Scroll className="w-4 h-4 text-cyan-400" />
              <div className="text-left">
                <div className="text-[10px] font-bold text-cyan-200">Daily Quests</div>
                <div className="text-[9px] text-cyan-400/70">{dailyQuestProgress.completed}/{dailyQuestProgress.total} complete</div>
              </div>
              <ChevronRight className="w-3 h-3 text-cyan-400/60 group-hover:translate-x-0.5 transition-transform" />
            </motion.button>
          )}
        </div>
      )}

      {/* ===== PREMIUM TEAM PREVIEW ===== */}
      <div className="premium-glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-amber-200 flex items-center gap-2 section-title">
            <Star className="w-4 h-4" /> Your Team
          </h2>
          <button onClick={() => setScreen('heroes')} className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors">
            Manage →
          </button>
        </div>
        {teamHeroes.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-10 h-10 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400 mb-2">No heroes in your team yet!</p>
            <button
              onClick={() => setScreen('summon')}
              className="premium-btn px-4 py-2.5 rounded-xl text-xs"
            >
              <Sparkles className="w-3 h-3 inline mr-1" /> Summon Your First Hero
            </button>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 game-scrollbar">
            {teamHeroes.map((hero) => {
              if (!hero) return null;
              const rarity = RARITY_CONFIG[hero.rarity];
              const element = ELEMENT_CONFIG[hero.element];
              const heroPower = Math.floor(hero.attack + hero.defense + hero.health / 10 + hero.speed * 5);
              const heroImage = getHeroImageUrl(hero.templateId);
              const heroGradient = getHeroGradient(hero.rarity);
              const isPremium = ['legendary', 'mythic'].includes(hero.rarity);
              const isEpicPlus = ['epic', 'legendary', 'mythic'].includes(hero.rarity);
              return (
                <motion.div
                  key={hero.id}
                  whileHover={{ scale: 1.03, y: -3 }}
                  className={`hero-3d-container flex-shrink-0 relative premium-team-card premium-frame-${hero.rarity}`}
                >
                  <div className={`hero-3d-card rounded-xl overflow-hidden hero-3d-frame-${hero.rarity} hero-3d-glow-${hero.rarity} ${isEpicPlus ? `premium-border-glow-${hero.rarity}` : ''}`}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className={`bg-gradient-to-b ${heroGradient} min-w-[110px] relative`}>
                      {/* Prominent hero image */}
                      <div className="relative h-24 overflow-hidden premium-portrait-area">
                        {heroImage ? (
                          <Image
                            src={heroImage}
                            alt={hero.name}
                            fill
                            className="object-cover object-top"
                            sizes="110px"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl opacity-50">{element.icon}</span>
                          </div>
                        )}
                        {/* Premium vignette */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        {/* Premium shimmer for legendary+ */}
                        {isPremium && <div className="absolute inset-0 premium-shimmer opacity-50" />}
                        {/* Element badge */}
                        <div className="absolute -top-1 -right-1 bg-black/60 border border-gray-600/30 rounded-full w-5 h-5 flex items-center justify-center text-[10px] badge-3d" title={element.label}>
                          {element.icon}
                        </div>
                      </div>

                      <div className="text-center p-2 hero-3d-layer-front">
                        <div className="text-xs font-bold text-white truncate embossed-text">{hero.name}</div>
                        <div className={`text-[10px] font-semibold ${rarity.color}`}>{rarity.label}</div>
                        <div className="text-[10px] text-gray-400">Lv.{hero.level}</div>
                        {/* Premium power number */}
                        <div className="premium-power-display mt-1 mx-auto w-fit px-2 py-0.5 text-[9px]">
                          ⚡{heroPower.toLocaleString()}
                        </div>
                        <div className="flex justify-center gap-0.5 mt-1">
                          {Array.from({ length: hero.stars }, (_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400 premium-star" />
                          ))}
                        </div>
                      </div>

                      {/* Premium corner flourishes for legendary+ */}
                      {isPremium && (
                        <>
                          <div className="premium-corner-tl" />
                          <div className="premium-corner-tr" />
                          <div className="premium-corner-bl" />
                          <div className="premium-corner-br" />
                        </>
                      )}

                      {/* Holographic overlay for epic+ */}
                      {isEpicPlus && (
                        <div className={`holographic-overlay ${
                          hero.rarity === 'epic' ? 'holographic-epic' :
                          hero.rarity === 'legendary' ? 'holographic-legendary' : 'holographic-mythic'
                        }`} />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {team.length < 5 && (
              <motion.div
                whileHover={{ scale: 1.03 }}
                onClick={() => setScreen('heroes')}
                className="flex-shrink-0 rounded-xl p-3 min-w-[110px] flex items-center justify-center cursor-pointer relative overflow-hidden premium-glass"
              >
                <motion.div
                  className="absolute inset-0 bg-amber-500/5"
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="text-center text-gray-400 relative z-10">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Sparkles className="w-5 h-5 mx-auto text-amber-400/60" />
                  </motion.div>
                  <div className="text-[10px] mt-1.5 text-amber-400/70 font-medium">Summon</div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* ===== PREMIUM SPECIAL OFFER BANNER ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative overflow-hidden rounded-xl p-[2px] cursor-pointer"
        onClick={() => setScreen('shop')}
      >
        {/* Animated gradient border */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          animate={{
            background: gradientPhase === 0
              ? 'linear-gradient(90deg, rgba(239,68,68,0.7), transparent 30%, transparent 70%, rgba(239,68,68,0.7))'
              : gradientPhase === 1
              ? 'linear-gradient(90deg, rgba(245,158,11,0.7), transparent 30%, transparent 70%, rgba(245,158,11,0.7))'
              : 'linear-gradient(90deg, rgba(168,85,247,0.7), transparent 30%, transparent 70%, rgba(168,85,247,0.7))',
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
        <div className="relative rounded-xl bg-gradient-to-r from-red-900/50 via-amber-900/30 to-red-900/50 border border-red-500/25 p-4 overflow-hidden hover:border-red-400/40 transition-all">
          {/* Premium shimmer overlay */}
          <div className="absolute inset-0 premium-shimmer opacity-30" />

          {/* 75% OFF Badge */}
          <div className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-700 text-white text-[10px] font-black px-2.5 py-1 rounded-bl-lg rounded-tr-xl shadow-lg shadow-red-500/40 transform rotate-3">
            75% OFF
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-lg shadow-red-500/30">LIMITED</span>
                <span className="text-sm font-bold premium-gold-text">Starter Pack</span>
              </div>
              <div className="text-xs text-gray-300 mt-1">1,000 Gems + Epic Hero + 50,000 Gold</div>
              {/* Countdown Timer */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <Clock className="w-3 h-3 text-red-400" />
                <span className="text-[10px] font-mono text-red-300 font-bold">Ends in {offerTime}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black premium-gold-text">$4.99</div>
              <div className="text-[10px] text-gray-500 line-through">$19.99</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== PREMIUM DAILY REWARD MODAL ===== */}
      <AnimatePresence>
        {showDailyReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDailyReward(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-gradient-to-b from-[#1a0a2e] to-[#0f0f23] border border-amber-500/25 rounded-2xl p-6 max-w-sm w-full relative overflow-hidden premium-card-shadow"
              onClick={e => e.stopPropagation()}
            >
              {/* Confetti burst on claim */}
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none z-20">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-sm"
                      initial={{
                        x: '50%',
                        y: '50%',
                        scale: 0,
                        opacity: 1,
                      }}
                      animate={{
                        x: `${50 + (Math.random() - 0.5) * 80}%`,
                        y: `${50 + (Math.random() - 0.5) * 80}%`,
                        scale: [0, 1.5, 0],
                        opacity: [1, 1, 0],
                        rotate: Math.random() * 360,
                      }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    >
                      {['🪙', '💎', '⭐', '✨', '🎁'][i % 5]}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Close button */}
              <button
                onClick={() => { setShowDailyReward(false); setShowConfetti(false); }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 border border-gray-600/30 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-400 transition-all z-10"
              >
                ✕
              </button>

              {/* Premium sparkle effects */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-4xl"
                >
                  🎁
                </motion.div>
              </div>

              <h3 className="text-lg font-bold premium-gold-text text-center mb-4 mt-4">Daily Login Reward</h3>
              <div className="text-center mb-4">
                <div className="text-sm text-gray-400">Day {(player.dailyRewardDay % 7) + 1} of 7</div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-amber-300 font-semibold">
                    <span>🪙</span> +{todayReward?.gold} Gold
                  </div>
                  <div className="flex items-center justify-center gap-2 text-cyan-300 font-semibold">
                    <span>💎</span> +{todayReward?.gems} Gems
                  </div>
                  <div className="flex items-center justify-center gap-2 text-purple-300 font-semibold">
                    <span>🎁</span> {todayReward?.item}
                  </div>
                </div>
              </div>

              {/* 7-day reward preview with premium styling */}
              <div className="grid grid-cols-7 gap-1.5 mb-4">
                {DAILY_REWARDS.map((r, i) => {
                  const isToday = i === (player.dailyRewardDay % 7);
                  const isPast = i < (player.dailyRewardDay % 7);
                  return (
                    <div
                      key={i}
                      className={`text-center p-1.5 rounded-lg text-[10px] relative ${
                        isToday
                          ? 'bg-amber-500/30 border border-amber-400/60 animate-pulse shadow-lg shadow-amber-500/20'
                          : isPast
                          ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                          : 'bg-gray-800/50 border border-gray-700/30 text-gray-500'
                      }`}
                    >
                      <div className="text-sm mb-0.5">{DAILY_REWARD_ICONS[i]}</div>
                      <div className="font-bold">D{i + 1}</div>
                      {isPast && (
                        <div className="absolute top-0.5 right-0.5 text-[8px]">✓</div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setShowDailyReward(false); setShowConfetti(false); }}
                  className="flex-1 bg-gray-700/50 text-gray-300 font-medium py-2.5 rounded-xl hover:bg-gray-600/50 transition-all border border-gray-600/30"
                >
                  Later
                </button>
                <button
                  onClick={() => { claimDailyReward(); setShowConfetti(true); }}
                  disabled={showConfetti}
                  className={`flex-1 font-bold py-2.5 rounded-xl transition-all shadow-lg ${
                    showConfetti
                      ? 'bg-green-600 text-white shadow-green-500/30'
                      : 'premium-btn shadow-amber-500/30'
                  }`}
                >
                  {showConfetti ? '✓ Claimed!' : 'Claim!'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============= Premium Sub-Components =============

function PremiumDashboardStat({ label, value, icon, accent }: { label: string; value: string; icon: React.ReactNode; accent: string }) {
  return (
    <div className={`premium-stat-card bg-gradient-to-br ${accent} p-2.5 text-center`}>
      <div className="flex items-center justify-center gap-1 mb-1.5">
        {icon}
      </div>
      <div className="text-sm font-bold text-white embossed-text">{value}</div>
      <div className="text-[10px] text-amber-400/60 font-medium">{label}</div>
    </div>
  );
}

function PremiumQuickAction({ icon, label, sublabel, gradientFrom, gradientTo, borderColor, glowColor, onClick }: {
  icon: React.ReactNode; label: string; sublabel: string; gradientFrom: string; gradientTo: string; borderColor: string; glowColor: string; onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`premium-quick-action bg-gradient-to-br ${gradientFrom} ${gradientTo} border ${borderColor} rounded-xl p-3.5 text-left hover:${glowColor} transition-all`}
    >
      <div className="text-amber-300 mb-2 drop-shadow-[0_0_6px_rgba(255,215,0,0.3)]">{icon}</div>
      <div className="text-xs font-bold text-white">{label}</div>
      <div className="text-[10px] text-gray-400 mt-0.5">{sublabel}</div>
    </motion.button>
  );
}

function PremiumActivityCard({ icon, label, value, sublabel, accentColor, bgColor, borderColor, onClick }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`${bgColor} border ${borderColor} rounded-xl p-3 text-left hover:shadow-lg transition-all cursor-pointer backdrop-blur-sm`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="text-[10px] text-amber-400/50 font-medium">{label}</span>
      </div>
      <div className={`text-sm font-bold ${accentColor}`}>{value}</div>
      <div className="text-[9px] text-gray-500 mt-0.5">{sublabel}</div>
    </motion.button>
  );
}

// ─── Idle earnings chest (AFK-style offline farming) ─────────────
function IdleRewardsCard() {
  const getIdleRewards = useGameStore(s => s.getIdleRewards);
  const claimIdleRewards = useGameStore(s => s.claimIdleRewards);
  const lastIdleClaimAt = useGameStore(s => s.lastIdleClaimAt);
  const [rewards, setRewards] = useState(() => getIdleRewards());

  // Tick the accrual display every 30s.
  useEffect(() => {
    setRewards(getIdleRewards());
    const t = setInterval(() => setRewards(getIdleRewards()), 30_000);
    return () => clearInterval(t);
  }, [lastIdleClaimAt, getIdleRewards]);

  if (rewards.minutes < 5) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-r from-emerald-800/25 via-teal-700/15 to-emerald-800/10 border border-emerald-500/25 rounded-xl p-3.5 flex items-center justify-between"
    >
      <div className="absolute inset-0 premium-shimmer opacity-30" />
      <div className="flex items-center gap-3 relative z-10 min-w-0">
        <motion.div
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity }}
          className="w-11 h-11 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/20 text-xl"
        >
          ⛏️
        </motion.div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-emerald-300">Idle Loot {rewards.capped && <span className="text-[9px] text-red-300 font-bold align-middle">FULL (8h cap)</span>}</div>
          <div className="text-xs text-emerald-200/70 truncate">
            Your champions farmed {rewards.minutes >= 60 ? `${Math.floor(rewards.minutes / 60)}h ${rewards.minutes % 60}m` : `${rewards.minutes}m`}: 🪙 {rewards.gold.toLocaleString()}{rewards.gems > 0 ? ` · 💎 ${rewards.gems}` : ''}
          </div>
        </div>
      </div>
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={claimIdleRewards}
        className="relative z-10 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-black shadow-lg shadow-emerald-600/30 hover:brightness-110 transition-all"
      >
        CLAIM
      </motion.button>
    </motion.div>
  );
}
