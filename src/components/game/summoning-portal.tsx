'use client';

import { useGameStore } from '@/lib/game-store';
import {
  RARITY_CONFIG,
  ELEMENT_CONFIG,
  FACTION_CONFIG,
  HERO_TEMPLATES,
  Rarity,
  HeroInstance,
  PITY_CONFIG,
} from '@/lib/game-data';
import { GAME_IMAGES, getHeroImageUrl } from '@/lib/hero-images';
import { feedback } from '@/lib/feedback';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Star,
  Flame,
  ChevronRight,
  Clock,
  TrendingUp,
  Crown,
  SkipForward,
  Hand as HandIcon,
  Gem,
  CircleDot,
} from 'lucide-react';
import Image from 'next/image';

/* =========================================================
   Type definitions & static config
   ========================================================= */

interface HistoryEntry {
  id: string;
  templateId: string;
  name: string;
  rarity: Rarity;
  element: string;
  faction: string;
  timestamp: number;
}

interface PityState {
  sinceRare: number; // summons since last rare+
  sinceEpic: number; // summons since last epic+
  total: number;
}

const RARITY_ORDER: Record<Rarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  mythic: 5,
};

const RARITY_EFFECTS: Record<
  Rarity,
  {
    glow: string;
    burst: string;
    ringColor: string;
    particleColor: string;
    text: string;
    screenEffect: 'none' | 'flash' | 'shake';
    flipDuration: number;
    flavor: string;
  }
> = {
  common: {
    glow: 'shadow-gray-500/40',
    burst: 'from-gray-500/30 via-gray-700/15 to-transparent',
    ringColor: 'border-gray-400',
    particleColor: 'bg-gray-300',
    text: 'text-gray-300',
    screenEffect: 'none',
    flipDuration: 0.6,
    flavor: 'A humble soul answers your call.',
  },
  uncommon: {
    glow: 'shadow-green-500/40',
    burst: 'from-green-500/30 via-emerald-700/15 to-transparent',
    ringColor: 'border-green-400',
    particleColor: 'bg-green-300',
    text: 'text-green-300',
    screenEffect: 'none',
    flipDuration: 0.65,
    flavor: 'A worthy champion emerges.',
  },
  rare: {
    glow: 'shadow-blue-500/50',
    burst: 'from-blue-500/40 via-cyan-600/20 to-transparent',
    ringColor: 'border-blue-400',
    particleColor: 'bg-blue-300',
    text: 'text-blue-300',
    screenEffect: 'none',
    flipDuration: 0.75,
    flavor: 'A rare warrior steps through the portal!',
  },
  epic: {
    glow: 'shadow-purple-500/60',
    burst: 'from-purple-500/45 via-fuchsia-700/25 to-transparent',
    ringColor: 'border-purple-400',
    particleColor: 'bg-purple-300',
    text: 'text-purple-300',
    screenEffect: 'none',
    flipDuration: 0.9,
    flavor: 'An Epic champion heeds your summons!',
  },
  legendary: {
    glow: 'shadow-yellow-500/70',
    burst: 'from-yellow-400/55 via-amber-600/30 to-transparent',
    ringColor: 'border-yellow-300',
    particleColor: 'bg-yellow-200',
    text: 'text-yellow-300',
    screenEffect: 'flash',
    flipDuration: 1.1,
    flavor: 'A LEGENDARY hero descends in radiant light!',
  },
  mythic: {
    glow: 'shadow-red-500/80',
    burst: 'from-red-500/65 via-orange-600/40 to-transparent',
    ringColor: 'border-red-400',
    particleColor: 'bg-red-300',
    text: 'text-red-300',
    screenEffect: 'shake',
    flipDuration: 1.3,
    flavor: 'A MYTHIC entity tears through reality itself!',
  },
};

const PITY_RARE_THRESHOLD = 10;
const PITY_EPIC_THRESHOLD = 10;

/* =========================================================
   Main SummoningPortal component
   ========================================================= */

export function SummoningPortal() {
  const player = useGameStore(s => s.player);
  const summon = useGameStore(s => s.summon);
  const summonResults = useGameStore(s => s.summonResults);
  const showSummonAnimation = useGameStore(s => s.showSummonAnimation);
  const clearSummonResults = useGameStore(s => s.clearSummonResults);

  const [selectedBanner, setSelectedBanner] = useState<'mystic' | 'ancient'>('mystic');

  // Persist pity + history locally (lazy-load from localStorage on first render)
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const raw = localStorage.getItem('sr_summon_history');
      return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
    } catch {
      return [];
    }
  });
  const [pity, setPity] = useState<PityState>(() => {
    try {
      const raw = localStorage.getItem('sr_summon_pity');
      return raw
        ? (JSON.parse(raw) as PityState)
        : { sinceRare: 0, sinceEpic: 0, total: 0 };
    } catch {
      return { sinceRare: 0, sinceEpic: 0, total: 0 };
    }
  });

  // Track new summon results -> append to history & update pity.
  // Subscribe once on mount; setState is called inside the subscription
  // callback (not synchronously in the effect body) to avoid cascading renders.
  const lastSeenResultsRef = useRef<string>('');
  useEffect(() => {
    const processResults = (results: HeroInstance[]) => {
      if (results.length === 0) return;
      const sig = results.map(h => h.id).join('|');
      if (sig === lastSeenResultsRef.current) return;
      lastSeenResultsRef.current = sig;

      const newEntries: HistoryEntry[] = results.map(h => ({
        id: h.id,
        templateId: h.templateId,
        name: h.name,
        rarity: h.rarity,
        element: h.element,
        faction: h.faction,
        timestamp: Date.now(),
      }));

      setHistory(prev => {
        const next = [...newEntries.reverse(), ...prev].slice(0, 10);
        try {
          localStorage.setItem('sr_summon_history', JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });

      setPity(prev => {
        let sinceRare = prev.sinceRare;
        let sinceEpic = prev.sinceEpic;
        for (const h of results) {
          if (RARITY_ORDER[h.rarity] >= RARITY_ORDER.rare) sinceRare = 0;
          else sinceRare += 1;
          if (RARITY_ORDER[h.rarity] >= RARITY_ORDER.epic) sinceEpic = 0;
          else sinceEpic += 1;
        }
        const next = { sinceRare, sinceEpic, total: prev.total + results.length };
        try {
          localStorage.setItem('sr_summon_pity', JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    };

    const unsub = useGameStore.subscribe((state, prev) => {
      if (
        state.summonResults !== prev.summonResults &&
        state.showSummonAnimation &&
        state.summonResults.length > 0
      ) {
        processResults(state.summonResults);
      }
    });
    return unsub;
  }, []);

  const canSummon1 = player.gems >= 150;
  const canSummon10 = player.gems >= 1200;

  const handleSummon1 = useCallback(() => {
    feedback.unlock();
    feedback.summon();
    if (selectedBanner === 'mystic') summon(1, 150);
    else summon(1, 3000);
  }, [selectedBanner, summon]);

  const handleSummon10 = useCallback(() => {
    feedback.unlock();
    feedback.summon();
    summon(10, 1200);
  }, [summon]);

  // Featured heroes for showcase
  const featuredHeroes = useMemo(() => {
    const mythics = HERO_TEMPLATES.filter(h => h.rarity === 'mythic');
    const legendaries = HERO_TEMPLATES.filter(h => h.rarity === 'legendary');
    return [...mythics, ...legendaries].slice(0, 6);
  }, []);

  return (
    <div className="p-3 sm:p-4 max-w-4xl mx-auto">
      {/* =================================================
          PORTAL HEADER (enhanced)
          ================================================= */}
      <div className="relative text-center mb-4 overflow-hidden rounded-2xl border border-purple-500/20">
        <div className="absolute inset-0">
          <Image
            src={GAME_IMAGES.summonPortal}
            alt="Summoning Portal"
            fill
            className="object-cover opacity-40"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a]/70 via-[#0a0a1a]/40 to-[#0a0a1a]/90" />

        {/* Floating particles around the portal */}
        <PortalParticleField />

        <div className="relative z-10 py-8 px-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-3"
          >
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-purple-400/40 flex items-center justify-center bg-gradient-to-br from-purple-900/60 to-fuchsia-900/40 backdrop-blur-sm animate-portal-glow">
              {/* Inner spinning ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-1 rounded-full border border-dashed border-amber-300/40"
              />
              <Sparkles className="w-12 h-12 text-purple-200 drop-shadow-[0_0_8px_rgba(216,180,254,0.8)]" />
            </div>
          </motion.div>
          <h2 className="text-2xl font-bold gold-text tracking-wide">Summoning Portal</h2>
          <p className="text-xs text-gray-400 mt-1">
            Tear the veil between realms and summon mighty champions
          </p>

          {/* Inline gem + pity quick stats */}
          <div className="flex items-center justify-center gap-3 mt-3 text-xs">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-900/40 border border-cyan-500/30">
              <Gem className="w-3 h-3 text-cyan-300" />
              <span className="text-cyan-200 font-semibold">{player.gems.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-900/40 border border-purple-500/30">
              <TrendingUp className="w-3 h-3 text-purple-300" />
              <span className="text-purple-200 font-semibold">{pity.total} Summons</span>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          RATE-UP BANNER
          ================================================= */}
      <RateUpBanner selectedBanner={selectedBanner} />

      {/* =================================================
          BANNER SELECTION
          ================================================= */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedBanner('mystic')}
          aria-pressed={selectedBanner === 'mystic'}
          className={`relative overflow-hidden rounded-xl p-4 border transition-all text-left ${
            selectedBanner === 'mystic'
              ? 'border-purple-500/60 bg-gradient-to-br from-purple-900/50 to-fuchsia-900/30 shadow-lg shadow-purple-500/20'
              : 'border-gray-700/40 bg-gray-900/40 hover:border-purple-500/30'
          }`}
        >
          <div className="absolute inset-0 animate-shimmer pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <div className="text-base font-bold text-purple-200">Mystic Portal</div>
            </div>
            <div className="text-[10px] text-gray-400">All champions available</div>
            <div className="text-[10px] text-purple-300 mt-0.5">Rare+ guaranteed</div>
            <div className="mt-2 space-y-0.5">
              <RateLine rarity="mythic" rate="0.5%" />
              <RateLine rarity="legendary" rate="3.5%" />
              <RateLine rarity="epic" rate="8%" />
              <RateLine rarity="rare" rate="18%" />
            </div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedBanner('ancient')}
          aria-pressed={selectedBanner === 'ancient'}
          className={`relative overflow-hidden rounded-xl p-4 border transition-all text-left ${
            selectedBanner === 'ancient'
              ? 'border-amber-500/60 bg-gradient-to-br from-amber-900/50 to-red-900/30 shadow-lg shadow-amber-500/20'
              : 'border-gray-700/40 bg-gray-900/40 hover:border-amber-500/30'
          }`}
        >
          <div className="absolute inset-0 animate-shimmer pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-1">
              <Crown className="w-4 h-4 text-amber-300" />
              <div className="text-base font-bold text-amber-200">Ancient Portal</div>
            </div>
            <div className="text-[10px] text-gray-400">Legendary+ guaranteed!</div>
            <div className="text-[10px] text-red-300 mt-0.5">3,000 Gems per summon</div>
            <div className="mt-2 space-y-0.5">
              <RateLine rarity="mythic" rate="5%" />
              <RateLine rarity="legendary" rate="95%" />
            </div>
          </div>
        </motion.button>
      </div>

      {/* =================================================
          PITY COUNTER DISPLAY
          ================================================= */}
      <PityCounter pity={pity} banner={selectedBanner} />

      {/* =================================================
          SUMMON BUTTONS
          ================================================= */}
      <div className="space-y-2 mb-4">
        {selectedBanner === 'mystic' ? (
          <>
            <SummonButton
              label="Summon x1"
              cost={150}
              currency="gems"
              canAfford={canSummon1}
              onClick={handleSummon1}
              highlight={false}
            />
            <SummonButton
              label="Summon x10"
              cost={1200}
              currency="gems"
              canAfford={canSummon10}
              onClick={handleSummon10}
              highlight
              bonus="Epic Guaranteed!"
              originalCost={1500}
            />
          </>
        ) : (
          <SummonButton
            label="Ancient Summon x1"
            cost={3000}
            currency="gems"
            canAfford={player.gems >= 3000}
            onClick={handleSummon1}
            highlight
            bonus="Legendary+ Guaranteed!"
          />
        )}
      </div>

      <PityMeter />

      {/* Gem Purchase CTA */}
      {player.gems < 150 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-cyan-900/30 to-teal-900/20 border border-cyan-500/20 rounded-xl p-3 text-center"
        >
          <p className="text-sm text-cyan-300 mb-2">Need more gems to summon?</p>
          <button
            onClick={() => useGameStore.getState().setScreen('shop')}
            className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold px-6 py-2 rounded-lg text-sm hover:from-cyan-400 hover:to-teal-400 transition-all"
          >
            Get Gems Now
          </button>
        </motion.div>
      )}

      {/* =================================================
          FEATURED CHAMPIONS SHOWCASE
          ================================================= */}
      <FeaturedShowcase heroes={featuredHeroes} banner={selectedBanner} />

      {/* =================================================
          SUMMON HISTORY
          ================================================= */}
      <SummonHistory history={history} />

      {/* =================================================
          DRAMATIC SUMMON ANIMATION OVERLAY
          ================================================= */}
      <AnimatePresence>
        {showSummonAnimation && summonResults.length > 0 && (
          <SummonAnimationOverlay
            results={summonResults}
            onClose={clearSummonResults}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   Portal floating particle field
   ========================================================= */
function PortalParticleField() {
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 4,
        duration: 4 + Math.random() * 4,
        delay: Math.random() * 4,
        gold: Math.random() > 0.5,
      })),
    [],
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${p.gold ? 'bg-amber-300/70' : 'bg-purple-300/70'}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            filter: 'blur(0.5px)',
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1.4, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* =========================================================
   Rate-Up Banner
   ========================================================= */
function RateUpBanner({ selectedBanner }: { selectedBanner: 'mystic' | 'ancient' }) {
  const featured = useMemo(() => {
    if (selectedBanner === 'ancient') {
      return HERO_TEMPLATES.filter(h => h.rarity === 'mythic').slice(0, 2);
    }
    return HERO_TEMPLATES.filter(h => h.rarity === 'legendary').slice(0, 2);
  }, [selectedBanner]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl border mb-4 p-3 ${
        selectedBanner === 'ancient'
          ? 'border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-red-950/40 to-amber-950/60'
          : 'border-purple-500/40 bg-gradient-to-r from-purple-950/60 via-fuchsia-950/40 to-purple-950/60'
      }`}
    >
      <div className="absolute -top-2 -right-2 rotate-12">
        <div className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-400 to-red-500 text-[9px] font-bold text-black tracking-wider shadow-lg">
          RATE UP
        </div>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Flame
          className={`w-3.5 h-3.5 ${
            selectedBanner === 'ancient' ? 'text-amber-300' : 'text-purple-300'
          }`}
        />
        <span
          className={`text-[11px] font-bold uppercase tracking-wider ${
            selectedBanner === 'ancient' ? 'text-amber-200' : 'text-purple-200'
          }`}
        >
          Featured Champions — Increased Drop Rate
        </span>
      </div>
      <div className="flex gap-2">
        {featured.map(h => {
          const img = getHeroImageUrl(h.id);
          const rarity = RARITY_CONFIG[h.rarity];
          return (
            <div
              key={h.id}
              className={`flex-1 flex items-center gap-2 ${rarity.bgColor} border ${rarity.borderColor}/40 rounded-lg p-1.5`}
            >
              <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-black/40">
                {img ? (
                  <Image src={img} alt={h.name} width={32} height={32} className="object-cover object-top w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm">
                    {ELEMENT_CONFIG[h.element].icon}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-white truncate">{h.name}</div>
                <div className={`text-[9px] ${rarity.color}`}>{rarity.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* =========================================================
   Pity Counter
   ========================================================= */
function PityCounter({
  pity,
  banner,
}: {
  pity: PityState;
  banner: 'mystic' | 'ancient';
}) {
  if (banner === 'ancient') {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 mb-4 text-center">
        <div className="flex items-center justify-center gap-2 text-amber-200 text-xs">
          <Crown className="w-3.5 h-3.5" />
          <span className="font-semibold">Ancient Portal — Legendary+ Guaranteed Every Summon</span>
        </div>
      </div>
    );
  }

  const rarePct = Math.min(100, (pity.sinceRare / PITY_RARE_THRESHOLD) * 100);
  const epicPct = Math.min(100, (pity.sinceEpic / PITY_EPIC_THRESHOLD) * 100);
  const rareLeft = Math.max(0, PITY_RARE_THRESHOLD - pity.sinceRare);
  const epicLeft = Math.max(0, PITY_EPIC_THRESHOLD - pity.sinceEpic);

  return (
    <div className="rounded-xl border border-purple-500/25 bg-gradient-to-br from-purple-950/40 to-[#0a0a1a]/60 p-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <CircleDot className="w-3.5 h-3.5 text-purple-300" />
        <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">
          Pity Counter
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {/* Rare pity */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-blue-300 font-semibold">Rare+ Guarantee</span>
            <span className="text-gray-400">{pity.sinceRare}/{PITY_RARE_THRESHOLD}</span>
          </div>
          <div className="h-2 rounded-full bg-black/50 overflow-hidden border border-blue-500/20">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
              initial={{ width: 0 }}
              animate={{ width: `${rarePct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-[9px] text-gray-500 mt-0.5">
            {rareLeft === 0 ? 'Guaranteed on next!' : `${rareLeft} summons to go`}
          </div>
        </div>
        {/* Epic pity */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-purple-300 font-semibold">Epic+ (x10)</span>
            <span className="text-gray-400">{pity.sinceEpic}/{PITY_EPIC_THRESHOLD}</span>
          </div>
          <div className="h-2 rounded-full bg-black/50 overflow-hidden border border-purple-500/20">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400"
              initial={{ width: 0 }}
              animate={{ width: `${epicPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-[9px] text-gray-500 mt-0.5">
            {epicLeft === 0 ? 'Guaranteed on next x10!' : `${epicLeft} summons to go`}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Featured Champions Showcase
   ========================================================= */
function FeaturedShowcase({
  heroes,
  banner,
}: {
  heroes: typeof HERO_TEMPLATES;
  banner: 'mystic' | 'ancient';
}) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Crown className="w-4 h-4 text-amber-300" />
        <h3 className="text-sm font-bold text-amber-200 uppercase tracking-wider">
          Featured Champions
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {heroes.map(hero => {
          const rarity = RARITY_CONFIG[hero.rarity];
          const element = ELEMENT_CONFIG[hero.element];
          const faction = FACTION_CONFIG[hero.faction];
          const img = getHeroImageUrl(hero.id);
          const isMythic = hero.rarity === 'mythic';
          const dropRate =
            hero.rarity === 'mythic'
              ? banner === 'ancient' ? '5%' : '0.5%'
              : banner === 'ancient' ? '95%' : '3.5%';

          return (
            <motion.div
              key={hero.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03, y: -2 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={`relative overflow-hidden rounded-lg border ${rarity.borderColor} ${
                isMythic ? 'animate-mythic-border' : 'animate-legendary-border'
              } ${rarity.bgColor} group cursor-pointer`}
            >
              {/* Rate-up badge */}
              <div className="absolute top-1.5 left-1.5 z-20 px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-red-500 text-[8px] font-bold text-black shadow-md">
                RATE UP
              </div>
              {/* Drop rate badge */}
              <div className="absolute top-1.5 right-1.5 z-20 px-1.5 py-0.5 rounded bg-black/70 border border-amber-500/40 text-[9px] font-bold text-amber-300">
                {dropRate}
              </div>

              {/* Hero image */}
              <div className="relative h-28 sm:h-32 overflow-hidden">
                {img ? (
                  <Image
                    src={img}
                    alt={hero.name}
                    fill
                    className="object-cover object-top group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    {element.icon}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              </div>

              {/* Info */}
              <div className="relative p-2 -mt-8">
                <div className="flex items-center gap-0.5 mb-0.5">
                  {Array.from({ length: rarity.stars }, (_, i) => (
                    <Star key={i} className={`w-2.5 h-2.5 fill-current ${rarity.color}`} />
                  ))}
                </div>
                <div className="text-xs font-bold text-white truncate">{hero.name}</div>
                <div className={`text-[9px] ${rarity.color} font-semibold`}>{rarity.label}</div>
                <div className="flex items-center gap-1 mt-0.5 text-[9px] text-gray-400">
                  <span>{element.icon}</span>
                  <span className="truncate">{faction?.label}</span>
                </div>
              </div>

              {/* Mythic glow overlay */}
              {isMythic && (
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-red-500/10 via-transparent to-amber-500/10 animate-pulse-glow" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   Summon History
   ========================================================= */
function SummonHistory({ history }: { history: HistoryEntry[] }) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-purple-300" />
        <h3 className="text-sm font-bold text-purple-200 uppercase tracking-wider">
          Recent Summons
        </h3>
        {history.length > 0 && (
          <span className="text-[10px] text-gray-500 ml-auto">Last {history.length}</span>
        )}
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-700/50 bg-gray-900/30 p-6 text-center">
          <Sparkles className="w-6 h-6 text-gray-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500">
            No summons yet. Perform a ritual to begin your collection.
          </p>
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto game-scrollbar rounded-xl border border-gray-800/50 bg-black/30 p-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {history.map((entry, i) => {
              const rarity = RARITY_CONFIG[entry.rarity];
              const element = ELEMENT_CONFIG[entry.element as keyof typeof ELEMENT_CONFIG];
              const img = getHeroImageUrl(entry.templateId);
              const ago = timeAgo(entry.timestamp);
              return (
                <motion.div
                  key={`${entry.id}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`relative flex items-center gap-2 ${rarity.bgColor} border ${rarity.borderColor}/40 rounded-lg p-1.5`}
                >
                  <div className="w-9 h-9 rounded overflow-hidden flex-shrink-0 bg-black/50">
                    {img ? (
                      <Image
                        src={img}
                        alt={entry.name}
                        width={36}
                        height={36}
                        className="object-cover object-top w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-base">
                        {element?.icon}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-white truncate">{entry.name}</div>
                    <div className={`text-[9px] ${rarity.color} font-semibold`}>{rarity.label}</div>
                    <div className="text-[8px] text-gray-500">{ago}</div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {Array.from({ length: Math.min(rarity.stars, 3) }, (_, si) => (
                      <Star key={si} className={`w-2 h-2 fill-current ${rarity.color}`} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   DRAMATIC SUMMON ANIMATION OVERLAY
   ========================================================= */
function SummonAnimationOverlay({
  results,
  onClose,
}: {
  results: HeroInstance[];
  onClose: () => void;
}) {
  const isMulti = results.length > 1;

  // Sort so the highest-rarity result is revealed last (most dramatic)
  const ordered = useMemo(() => {
    if (!isMulti) return results;
    return [...results].sort(
      (a, b) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity],
    );
  }, [results, isMulti]);

  const bestRarity = useMemo(() => {
    return ordered.reduce<Rarity>((best, h) => {
      return RARITY_ORDER[h.rarity] > RARITY_ORDER[best] ? h.rarity : best;
    }, 'common');
  }, [ordered]);

  // Phase: 'intro' (magic circle swirling) -> 'revealing' (cards flipping) -> 'complete' (tap to continue)
  const [phase, setPhase] = useState<'intro' | 'revealing' | 'complete'>('intro');
  const [revealedCount, setRevealedCount] = useState(0);
  const [activeCloseup, setActiveCloseup] = useState<number | null>(null); // index of card shown in closeup
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  }, []);

  // Drive the intro -> revealing -> complete flow
  useEffect(() => {
    clearTimers();

    // Intro phase
    const introT = setTimeout(() => setPhase('revealing'), 1500);
    timersRef.current.push(introT);

    if (!isMulti) {
      // Single reveal — flip after intro, then complete
      const flipT = setTimeout(() => {
        setActiveCloseup(0);
        feedback.reveal(ordered[0].rarity);
      }, 1700);
      const completeT = setTimeout(() => {
        setPhase('complete');
      }, 1700 + RARITY_EFFECTS[ordered[0].rarity].flipDuration * 1000 + 600);
      timersRef.current.push(flipT, completeT);
    } else {
      // Multi — reveal first 9 quickly, 10th gets closeup
      let elapsed = 1700;
      const quickStep = 280;
      for (let i = 0; i < ordered.length; i++) {
        const isLast = i === ordered.length - 1;
        const step = isLast ? 600 : quickStep;
        const revealT = setTimeout(() => {
          setRevealedCount(c => Math.max(c, i + 1));
          if (RARITY_ORDER[ordered[i].rarity] >= RARITY_ORDER.epic) feedback.reveal(ordered[i].rarity);
          else feedback.select();
          if (isLast) {
            // Only closeup if epic+
            if (RARITY_ORDER[ordered[i].rarity] >= RARITY_ORDER.epic) {
              setActiveCloseup(i);
            }
          }
        }, elapsed);
        timersRef.current.push(revealT);
        elapsed += step;
      }
      const completeT = setTimeout(() => {
        setPhase('complete');
      }, elapsed + (RARITY_ORDER[ordered[ordered.length - 1].rarity] >= RARITY_ORDER.epic
        ? RARITY_EFFECTS[ordered[ordered.length - 1].rarity].flipDuration * 1000 + 800
        : 400));
      timersRef.current.push(completeT);
    }

    return clearTimers;
  }, []);

  const handleSkip = useCallback(() => {
    clearTimers();
    setRevealedCount(ordered.length);
    setActiveCloseup(null);
    setPhase('complete');
  }, [clearTimers, ordered.length]);

  const handleClose = useCallback(() => {
    clearTimers();
    onClose();
  }, [clearTimers, onClose]);

  const effects = RARITY_EFFECTS[bestRarity];
  const screenShake = activeCloseup !== null && effects.screenEffect === 'shake';
  const screenFlash = activeCloseup !== null && effects.screenEffect === 'flash';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        screenShake ? 'animate-screen-shake' : ''
      }`}
      onClick={phase === 'complete' ? handleClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-label="Summon results"
    >
      {/* ===== Dark background ===== */}
      <div className="absolute inset-0 bg-black/95" />

      {/* ===== Swirling particle background ===== */}
      <SwirlingParticles rarity={bestRarity} active={phase !== 'complete' || activeCloseup !== null} />

      {/* ===== Screen flash for legendary/mythic ===== */}
      <AnimatePresence>
        {screenFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0] }}
            transition={{ duration: 0.6, times: [0, 0.2, 1] }}
            className="absolute inset-0 bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* ===== Magic circle (intro + behind reveal) ===== */}
      <AnimatePresence>
        {phase !== 'complete' && (
          <MagicCircle rarity={bestRarity} active={phase === 'intro'} />
        )}
      </AnimatePresence>

      {/* ===== Lightning streaks for epic+ ===== */}
      {RARITY_ORDER[bestRarity] >= RARITY_ORDER.epic && phase !== 'complete' && (
        <LightningStreaks rarity={bestRarity} />
      )}

      {/* ===== Content layer ===== */}
      <div className="relative z-10 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <AnimatePresence mode="wait">
          {/* INTRO PHASE */}
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-amber-300 text-sm font-bold tracking-[0.3em] uppercase"
              >
                Summoning…
              </motion.div>
              <motion.div
                animate={{ opacity: [0.2, 0.7, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-purple-300 text-xs mt-2"
              >
                The veil between realms tears open
              </motion.div>
            </motion.div>
          )}

          {/* REVEALING PHASE */}
          {phase === 'revealing' && (
            <motion.div
              key="revealing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              {!isMulti ? (
                /* ===== SINGLE SUMMON REVEAL ===== */
                <SingleReveal
                  hero={ordered[0]}
                  revealed={revealedCount >= 1 || activeCloseup === 0}
                  onClose={handleClose}
                  showContinue={phase === 'complete'}
                />
              ) : (
                /* ===== MULTI SUMMON GRID REVEAL ===== */
                <MultiReveal
                  ordered={ordered}
                  revealedCount={revealedCount}
                  activeCloseup={activeCloseup}
                  onClose={handleClose}
                  onSkip={handleSkip}
                  showContinue={phase === 'complete'}
                  onCloseupDismiss={() => setActiveCloseup(null)}
                />
              )}
            </motion.div>
          )}

          {/* COMPLETE PHASE */}
          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <CompleteSummary
                results={results}
                isMulti={isMulti}
                bestRarity={bestRarity}
                onClose={handleClose}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== Skip button (top-right) — visible during intro/revealing ===== */}
      {phase !== 'complete' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleSkip}
          className="absolute top-4 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-900/50 transition-colors"
          aria-label="Skip animation"
        >
          <SkipForward className="w-3.5 h-3.5" />
          Skip
        </motion.button>
      )}

      {/* ===== Tap to continue prompt ===== */}
      {phase === 'complete' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 text-amber-300 text-sm font-bold tracking-wider pointer-events-none"
        >
          <HandIcon className="w-4 h-4" />
          TAP TO CONTINUE
        </motion.div>
      )}
    </motion.div>
  );
}

/* =========================================================
   Swirling particle background for overlay
   ========================================================= */
function SwirlingParticles({ rarity, active }: { rarity: Rarity; active: boolean }) {
  const effects = RARITY_EFFECTS[rarity];
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        const angle = (i / 30) * Math.PI * 2;
        const radius = 80 + Math.random() * 180;
        return {
          id: i,
          angle,
          radius,
          size: 2 + Math.random() * 5,
          duration: 3 + Math.random() * 4,
          delay: Math.random() * 3,
        };
      }),
    [],
  );

  if (!active) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${effects.particleColor}`}
          style={{
            width: p.size,
            height: p.size,
            filter: 'blur(1px)',
          }}
          animate={{
            rotate: 360,
            x: [
              Math.cos(p.angle) * p.radius,
              Math.cos(p.angle + Math.PI) * p.radius,
              Math.cos(p.angle) * p.radius,
            ],
            y: [
              Math.sin(p.angle) * p.radius,
              Math.sin(p.angle + Math.PI) * p.radius,
              Math.sin(p.angle) * p.radius,
            ],
            opacity: [0, 1, 0],
            scale: [0.3, 1.5, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

/* =========================================================
   Magic Circle
   ========================================================= */
function MagicCircle({ rarity, active }: { rarity: Rarity; active: boolean }) {
  const effects = RARITY_EFFECTS[rarity];
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: active ? [0, 1.4, 1.1] : 1.1,
        opacity: active ? [0, 1, 0.85] : 0.6,
      }}
      exit={{ scale: 2, opacity: 0 }}
      transition={{ duration: active ? 1.5 : 0.4 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <div className="relative w-[280px] h-[280px] sm:w-[400px] sm:h-[400px]">
        {/* Outer rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          className={`absolute inset-0 rounded-full border-2 ${effects.ringColor} ${effects.glow} shadow-2xl`}
          style={{
            background:
              'conic-gradient(from 0deg, transparent, rgba(168,85,247,0.15), transparent, rgba(251,191,36,0.15), transparent)',
          }}
        >
          {/* Rune ticks */}
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-3 ${effects.particleColor} rounded-full`}
              style={{
                top: '-6px',
                left: '50%',
                transformOrigin: `0.5px 206px`,
                transform: `rotate(${i * 30}deg)`,
              }}
            />
          ))}
        </motion.div>

        {/* Middle counter-rotating ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className={`absolute inset-8 rounded-full border border-dashed ${effects.ringColor}/60`}
        />

        {/* Inner glowing ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          className={`absolute inset-16 rounded-full border-2 ${effects.ringColor}/80 ${effects.glow}`}
        >
          {/* Inner glyphs */}
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="absolute text-amber-300/60 text-xs"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 60}deg) translateY(-72px) rotate(-${i * 60}deg)`,
              }}
            >
              ✦
            </div>
          ))}
        </motion.div>

        {/* Center burst */}
        <motion.div
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute inset-0 m-auto w-20 h-20 rounded-full bg-gradient-to-br ${effects.burst} blur-xl`}
        />
      </div>
    </motion.div>
  );
}

/* =========================================================
   Lightning Streaks
   ========================================================= */
function LightningStreaks({ rarity }: { rarity: Rarity }) {
  const effects = RARITY_EFFECTS[rarity];
  const streaks = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        angle: (i / 8) * 360 + Math.random() * 30,
        length: 100 + Math.random() * 150,
        delay: Math.random() * 1.5,
        duration: 0.3 + Math.random() * 0.3,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {streaks.map(s => (
        <motion.div
          key={s.id}
          className={`absolute origin-center ${effects.particleColor}`}
          style={{
            width: 2,
            height: s.length,
            transform: `rotate(${s.angle}deg)`,
            background: `linear-gradient(to bottom, transparent, currentColor, transparent)`,
            boxShadow: `0 0 8px currentColor`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scaleY: [0.3, 1, 0.3],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            repeatDelay: 0.8 + Math.random() * 1.5,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

/* =========================================================
   Single Summon Reveal (card flip)
   ========================================================= */
function SingleReveal({
  hero,
  revealed,
  onClose,
  showContinue,
}: {
  hero: HeroInstance;
  revealed: boolean;
  onClose: () => void;
  showContinue: boolean;
}) {
  const rarity = RARITY_CONFIG[hero.rarity];
  const effects = RARITY_EFFECTS[hero.rarity];
  const element = ELEMENT_CONFIG[hero.element];
  const faction = FACTION_CONFIG[hero.faction];
  const img = getHeroImageUrl(hero.templateId);

  return (
    <div className="flex flex-col items-center">
      <HeroRevealCard
        hero={hero}
        revealed={revealed}
        size="large"
        effects={effects}
        rarity={rarity}
        element={element}
        faction={faction}
        img={img}
      />

      {/* Flavor text */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-center max-w-sm"
          >
            <div className={`text-xs italic ${effects.text}`}>{effects.flavor}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {showContinue && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onClose}
          className="mt-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-2.5 px-8 rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg"
        >
          Continue
        </motion.button>
      )}
    </div>
  );
}

/* =========================================================
   Multi Summon Reveal (10-card grid + closeup)
   ========================================================= */
function MultiReveal({
  ordered,
  revealedCount,
  activeCloseup,
  onClose,
  onSkip,
  showContinue,
  onCloseupDismiss,
}: {
  ordered: HeroInstance[];
  revealedCount: number;
  activeCloseup: number | null;
  onClose: () => void;
  onSkip: () => void;
  showContinue: boolean;
  onCloseupDismiss: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-amber-300 text-xs font-bold tracking-[0.2em] uppercase mb-3"
      >
        10 Champions Summoned
      </motion.div>

      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 max-w-lg">
        {ordered.map((hero, i) => {
          const isRevealed = i < revealedCount;
          const isCloseup = activeCloseup === i;
          return (
            <motion.div
              key={hero.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.04 }}
            >
              <MiniRevealCard hero={hero} revealed={isRevealed} isCloseup={isCloseup} />
            </motion.div>
          );
        })}
      </div>

      {/* Progress indicator */}
      {revealedCount < ordered.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-[10px] text-purple-300 tracking-wider"
        >
          Revealing {revealedCount}/{ordered.length}…
        </motion.div>
      )}

      {/* Skip during reveal */}
      {revealedCount < ordered.length && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onSkip}
          className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 border border-purple-500/40 text-purple-200 text-[11px] font-bold hover:bg-purple-900/50 transition-colors"
        >
          <SkipForward className="w-3 h-3" />
          Skip
        </motion.button>
      )}

      {/* Closeup dramatic reveal */}
      <AnimatePresence>
        {activeCloseup !== null && (
          <CloseupReveal
            hero={ordered[activeCloseup]}
            onDismiss={onCloseupDismiss}
          />
        )}
      </AnimatePresence>

      {showContinue && activeCloseup === null && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onClose}
          className="mt-4 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-2.5 px-8 rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg"
        >
          Continue
        </motion.button>
      )}
    </div>
  );
}

/* =========================================================
   Mini Reveal Card (grid slot)
   ========================================================= */
function MiniRevealCard({
  hero,
  revealed,
  isCloseup,
}: {
  hero: HeroInstance;
  revealed: boolean;
  isCloseup: boolean;
}) {
  const rarity = RARITY_CONFIG[hero.rarity];
  const effects = RARITY_EFFECTS[hero.rarity];
  const element = ELEMENT_CONFIG[hero.element];
  const img = getHeroImageUrl(hero.templateId);
  const isRare = RARITY_ORDER[hero.rarity] >= RARITY_ORDER.epic;

  return (
    <motion.div
      animate={isCloseup ? { scale: 1.1 } : { scale: 1 }}
      className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 ${
        revealed ? rarity.borderColor : 'border-purple-500/40'
      } ${revealed && isRare ? effects.glow : ''} ${revealed && hero.rarity === 'mythic' ? 'animate-mythic-border' : ''} ${revealed && hero.rarity === 'legendary' ? 'animate-legendary-border' : ''}`}
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Card back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-fuchsia-950 border border-purple-400/30"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="text-amber-300/70 text-2xl"
          >
            ✦
          </motion.div>
          <div className="text-[8px] text-purple-300/60 mt-1 tracking-widest">RUNE</div>
        </div>

        {/* Card front */}
        <div
          className={`absolute inset-0 ${rarity.bgColor} flex flex-col`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {img ? (
            <div className="hero-3d-portrait relative w-full flex-1">
              <Image
                src={img}
                alt={hero.name}
                fill
                className="object-cover object-top"
                sizes="80px"
                unoptimized
              />
              <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/90 to-transparent" />
              {/* Holographic shimmer for epic+ */}
              {['epic', 'legendary', 'mythic'].includes(hero.rarity) && (
                <div className={`holographic-overlay ${
                  hero.rarity === 'epic' ? 'holographic-epic' :
                  hero.rarity === 'legendary' ? 'holographic-legendary' : 'holographic-mythic'
                }`} style={{ opacity: 0.5, animation: 'holographic-sweep 2s linear infinite' }} />
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-2xl">
              {element.icon}
            </div>
          )}
          <div className="bg-black/80 p-0.5 text-center">
            <div className="text-[8px] font-bold text-white truncate leading-tight">
              {hero.name}
            </div>
            <div className={`text-[7px] ${rarity.color} leading-tight`}>{rarity.label}</div>
          </div>
          {/* Rarity burst on reveal */}
          {isRare && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.8 }}
              className={`absolute inset-0 bg-gradient-to-br ${effects.burst} pointer-events-none`}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   Closeup Reveal (dramatic for epic+)
   ========================================================= */
function CloseupReveal({
  hero,
  onDismiss,
}: {
  hero: HeroInstance;
  onDismiss: () => void;
}) {
  const rarity = RARITY_CONFIG[hero.rarity];
  const effects = RARITY_EFFECTS[hero.rarity];
  const element = ELEMENT_CONFIG[hero.element];
  const faction = FACTION_CONFIG[hero.faction];
  const img = getHeroImageUrl(hero.templateId);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      onClick={onDismiss}
    >
      <div className="absolute inset-0 bg-black/80" />

      {/* Burst rays */}
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 2.5, rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="absolute w-96 h-96 pointer-events-none"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, ${
            hero.rarity === 'mythic'
              ? 'rgba(239,68,68,0.4)'
              : hero.rarity === 'legendary'
                ? 'rgba(251,191,36,0.4)'
                : 'rgba(168,85,247,0.4)'
          } 10deg, transparent 20deg, transparent 40deg, ${
            hero.rarity === 'mythic'
              ? 'rgba(249,115,22,0.3)'
              : 'rgba(251,191,36,0.3)'
          } 50deg, transparent 60deg)`,
          borderRadius: '50%',
          filter: 'blur(2px)',
        }}
      />

      <motion.div
        onClick={e => e.stopPropagation()}
        className="relative z-10 flex flex-col items-center"
      >
        <HeroRevealCard
          hero={hero}
          revealed
          size="large"
          effects={effects}
          rarity={rarity}
          element={element}
          faction={faction}
          img={img}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-center"
        >
          <div className={`text-lg font-black tracking-[0.2em] ${effects.text} drop-shadow-lg`}>
            {rarity.label.toUpperCase()}!
          </div>
          <div className={`text-xs italic ${effects.text} mt-1`}>{effects.flavor}</div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={onDismiss}
          className="mt-4 px-6 py-2 rounded-lg bg-black/70 border border-amber-500/50 text-amber-300 text-xs font-bold hover:bg-amber-900/40 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            Continue <ChevronRight className="w-3 h-3" />
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* =========================================================
   Hero Reveal Card (large, used for single + closeup)
   ========================================================= */
function HeroRevealCard({
  hero,
  revealed,
  size,
  effects,
  rarity,
  element,
  faction,
  img,
}: {
  hero: HeroInstance;
  revealed: boolean;
  size: 'large' | 'medium';
  effects: (typeof RARITY_EFFECTS)[Rarity];
  rarity: (typeof RARITY_CONFIG)[Rarity];
  element: (typeof ELEMENT_CONFIG)[keyof typeof ELEMENT_CONFIG];
  faction: (typeof FACTION_CONFIG)[keyof typeof FACTION_CONFIG] | undefined;
  img?: string;
}) {
  const dims = size === 'large' ? 'w-44 h-60 sm:w-52 sm:h-72' : 'w-32 h-44';

  return (
    <div
      className={`relative ${dims} ${effects.glow} ${hero.rarity === 'mythic' ? 'animate-mythic-border' : ''} ${hero.rarity === 'legendary' ? 'animate-legendary-border' : ''}`}
      style={{ perspective: 1200 }}
    >
      <motion.div
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ duration: effects.flipDuration, ease: 'easeInOut' }}
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Card back */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden border-2 border-purple-400/50 bg-gradient-to-br from-purple-900 via-fuchsia-950 to-purple-950 flex flex-col items-center justify-center shadow-2xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-4 rounded-lg border border-dashed border-amber-300/30"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-8 rounded-full border border-purple-300/30"
          />
          <motion.div
            animate={{ scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-amber-300 text-5xl drop-shadow-[0_0_12px_rgba(251,191,36,0.7)]"
          >
            ✦
          </motion.div>
          <div className="absolute bottom-3 text-[9px] text-purple-300/70 tracking-[0.3em] uppercase">
            Shadow Realm
          </div>
        </div>

        {/* Card front */}
        <div
          className={`absolute inset-0 rounded-xl overflow-hidden border-2 ${rarity.borderColor} ${rarity.bgColor} shadow-2xl`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {img ? (
            <div className="hero-3d-portrait relative w-full h-full">
              <Image
                src={img}
                alt={hero.name}
                fill
                className="object-cover object-top"
                sizes="220px"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

              {/* Holographic shimmer for epic+ */}
              {['epic', 'legendary', 'mythic'].includes(hero.rarity) && (
                <div className={`holographic-overlay ${
                  hero.rarity === 'epic' ? 'holographic-epic' :
                  hero.rarity === 'legendary' ? 'holographic-legendary' : 'holographic-mythic'
                }`} style={{ opacity: 0.6, animation: 'holographic-sweep 2s linear infinite' }} />
              )}

              {/* Burst rays behind hero */}
              <motion.div
                initial={{ scale: 0, opacity: 0.6 }}
                animate={revealed ? { scale: 1.5, opacity: 0 } : {}}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`absolute inset-0 bg-gradient-to-br ${effects.burst}`}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {element.icon}
            </div>
          )}

          {/* Info overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/95 to-transparent">
            <div className="flex items-center gap-0.5 mb-1">
              {Array.from({ length: rarity.stars }, (_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={revealed ? { scale: 1, rotate: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.08, type: 'spring' }}
                >
                  <Star className={`w-3 h-3 fill-current ${rarity.color}`} />
                </motion.div>
              ))}
            </div>
            <div className="text-sm font-bold text-white truncate">{hero.name}</div>
            <div className={`text-[10px] ${rarity.color} font-semibold`}>{rarity.label}</div>
            <div className="flex items-center gap-1 mt-0.5 text-[9px] text-gray-300">
              <span>{element.icon}</span>
              <span className="truncate">{faction?.label}</span>
            </div>
          </div>

          {/* Rarity label badge */}
          <motion.div
            initial={{ scale: 0, y: -10 }}
            animate={revealed ? { scale: 1, y: 0 } : {}}
            transition={{ delay: 0.5, type: 'spring' }}
            className={`absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/80 border ${rarity.borderColor} ${rarity.color} text-[9px] font-bold tracking-wider uppercase shadow-lg`}
          >
            {rarity.label}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

/* =========================================================
   Complete Summary (shown after all reveals)
   ========================================================= */
function CompleteSummary({
  results,
  isMulti,
  bestRarity,
  onClose,
}: {
  results: HeroInstance[];
  isMulti: boolean;
  bestRarity: Rarity;
  onClose: () => void;
}) {
  const effects = RARITY_EFFECTS[bestRarity];
  const bestHero = results.find(h => h.rarity === bestRarity);

  return (
    <div className="w-full">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring' }}
        className="text-center mb-4"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-block text-5xl mb-1"
        >
          {RARITY_ORDER[bestRarity] >= RARITY_ORDER.legendary ? '🌟' : '✨'}
        </motion.div>
        <h3 className="text-xl font-bold gold-text">Summoning Complete!</h3>
        <p className={`text-xs ${effects.text} mt-1`}>
          Best pull: <span className="font-bold">{RARITY_CONFIG[bestRarity].label}</span>
          {bestHero && <span> — {bestHero.name}</span>}
        </p>
      </motion.div>

      {/* Results grid */}
      <div
        className={`grid ${
          results.length === 1
            ? 'grid-cols-1 max-w-[160px] mx-auto'
            : 'grid-cols-5'
        } gap-1.5 mb-4`}
      >
        {results.map((hero, i) => {
          const rarity = RARITY_CONFIG[hero.rarity];
          const element = ELEMENT_CONFIG[hero.element];
          const img = getHeroImageUrl(hero.templateId);
          return (
            <motion.div
              key={hero.id}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.05, type: 'spring' }}
              className={`${rarity.bgColor} border ${rarity.borderColor} rounded-lg overflow-hidden text-center ${
                hero.rarity === 'legendary' || hero.rarity === 'mythic' ? 'animate-pulse-glow' : ''
              }`}
            >
              {img ? (
                <div className="relative w-full h-14">
                  <Image src={img} alt={hero.name} fill className="object-cover object-top" sizes="80px" />
                  <div className="absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
              ) : (
                <div className="text-xl py-2.5">{element.icon}</div>
              )}
              <div className="p-1">
                <div className="text-[9px] font-bold text-white truncate leading-tight">{hero.name}</div>
                <div className={`text-[8px] ${rarity.color} leading-tight`}>{rarity.label}</div>
                <div className="flex justify-center gap-0.5 mt-0.5">
                  {Array.from({ length: hero.stars }, (_, si) => (
                    <Star key={si} className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {!isMulti && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onClose}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-3 rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg"
        >
          Continue
        </motion.button>
      )}
    </div>
  );
}

/* =========================================================
   Summon Button (kept from original)
   ========================================================= */
function SummonButton({
  label,
  cost,
  currency,
  canAfford,
  onClick,
  highlight,
  bonus,
  originalCost,
}: {
  label: string;
  cost: number;
  currency: string;
  canAfford: boolean;
  onClick: () => void;
  highlight: boolean;
  bonus?: string;
  originalCost?: number;
}) {
  return (
    <motion.button
      whileHover={canAfford ? { scale: 1.01 } : undefined}
      whileTap={canAfford ? { scale: 0.99 } : undefined}
      onClick={onClick}
      disabled={!canAfford}
      className={`w-full relative overflow-hidden rounded-xl p-3 font-medium text-sm transition-all ${
        highlight
          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500'
          : 'bg-gradient-to-r from-purple-600/80 to-fuchsia-600/80 text-white hover:from-purple-500/80 hover:to-fuchsia-500/80'
      } ${!canAfford ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold">{label}</span>
        <div className="flex items-center gap-2">
          {originalCost && (
            <span className="text-xs line-through opacity-60">{originalCost} 💎</span>
          )}
          <span className="flex items-center gap-1">
            {cost} 💎
          </span>
        </div>
      </div>
      {bonus && (
        <div className="text-[10px] mt-0.5 font-bold animate-pulse flex items-center justify-center gap-1">
          <Star className="w-2.5 h-2.5 fill-current" />
          {bonus}
        </div>
      )}
    </motion.button>
  );
}

/* =========================================================
   Rate Line (kept from original)
   ========================================================= */
function RateLine({ rarity, rate }: { rarity: string; rate: string }) {
  const config = RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG];
  return (
    <div className="flex items-center justify-between text-[10px]">
      <span className={config?.color || 'text-gray-400'}>{config?.label || rarity}</span>
      <span className="text-gray-400">{rate}</span>
    </div>
  );
}

/* =========================================================
   Helpers
   ========================================================= */
function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// ─── Pity / Mercy meter ───────────────────────────────────────────
// Genre-standard transparency: shows how many pulls remain before an
// Epic (20) and a Legendary (50) are guaranteed.
function PityMeter() {
  const pityEpic = useGameStore(s => s.pityEpic);
  const pityLegendary = useGameStore(s => s.pityLegendary);
  const rows = [
    { label: 'Epic', at: PITY_CONFIG.epicAt, count: pityEpic, bar: 'from-purple-600 to-fuchsia-500', text: 'text-purple-300' },
    { label: 'Legendary', at: PITY_CONFIG.legendaryAt, count: pityLegendary, bar: 'from-amber-500 to-yellow-400', text: 'text-amber-300' },
  ];
  return (
    <div className="mb-4 rounded-xl border border-white/10 bg-black/35 p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Mercy System</span>
        <span className="text-[9px] text-gray-500">— guaranteed drops</span>
      </div>
      <div className="space-y-2">
        {rows.map(r => {
          const left = Math.max(0, r.at - r.count);
          const pct = Math.min(100, (r.count / r.at) * 100);
          return (
            <div key={r.label}>
              <div className="flex justify-between text-[10px] mb-0.5">
                <span className={`font-bold ${r.text}`}>{r.label}</span>
                <span className="text-gray-400">
                  {left === 0 ? 'GUARANTEED next pull!' : `guaranteed in ${left} pull${left === 1 ? '' : 's'}`}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${r.bar} transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
