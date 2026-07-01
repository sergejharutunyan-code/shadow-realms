'use client';

import { useGameStore } from '@/lib/game-store';
import { HeroCard } from './hero-card';
import { RARITY_CONFIG, FACTION_CONFIG, ELEMENT_CONFIG, HeroInstance, Rarity, Faction, EQUIPMENT_TEMPLATES, AWAKENING_LEVELS, HERO_SKINS, getSkinsForHero, HeroSkin } from '@/lib/game-data';
import { getHeroImageUrl, getHeroGradient } from '@/lib/hero-images';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, Swords, Shield, Heart, Zap, ArrowUp, ChevronDown, Sparkles, X, Shirt, Crown, Palette, Check, Lock } from 'lucide-react';

// ─── Swirling Particle Component ────────────────────────────────────────────
function SwirlingParticle({ index, total, color, delay }: { index: number; total: number; color: string; delay: number }) {
  const angle = (index / total) * Math.PI * 2;
  const radius = 80 + Math.random() * 120;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 3 + Math.random() * 5,
        height: 3 + Math.random() * 5,
        background: color,
        boxShadow: `0 0 ${6 + Math.random() * 8}px ${color}`,
        left: '50%',
        top: '50%',
      }}
      initial={{
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        opacity: 0,
        scale: 0,
      }}
      animate={{
        x: [
          Math.cos(angle) * radius,
          Math.cos(angle + 1.5) * (radius * 0.6),
          Math.cos(angle + 3) * (radius * 1.1),
          Math.cos(angle + 4.5) * (radius * 0.8),
        ],
        y: [
          Math.sin(angle) * radius,
          Math.sin(angle + 1.5) * (radius * 0.6),
          Math.sin(angle + 3) * (radius * 1.1),
          Math.sin(angle + 4.5) * (radius * 0.8),
        ],
        opacity: [0, 1, 1, 0.6, 1],
        scale: [0, 1.2, 0.8, 1],
      }}
      transition={{
        duration: 2.8,
        delay: delay,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      }}
    />
  );
}

// ─── Sparkle Burst Component ────────────────────────────────────────────────
function SparkleBurst({ x, y, delay, color }: { x: number; y: number; delay: number; color: string }) {
  return (
    <motion.div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ scale: 0, opacity: 0, rotate: 0 }}
      animate={{
        scale: [0, 1.5, 0],
        opacity: [0, 1, 0],
        rotate: [0, 180],
      }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
    >
      <Sparkles className="w-4 h-4" style={{ color }} />
    </motion.div>
  );
}

// ─── Flying Stat Number ─────────────────────────────────────────────────────
function FlyingStat({ icon, label, from, to, delay, color }: { icon: React.ReactNode; label: string; from: number; to: number; delay: number; color: string }) {
  const boost = to - from;
  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5, ease: 'backOut' }}
    >
      <span className={color}>{icon}</span>
      <span className="text-xs text-gray-400 w-16">{label}</span>
      <span className="text-sm font-bold text-gray-300 line-through decoration-red-500/60">{from}</span>
      <motion.span
        className="text-sm font-bold"
        style={{ color }}
        initial={{ scale: 0.5 }}
        animate={{ scale: [0.5, 1.3, 1] }}
        transition={{ delay: delay + 0.3, duration: 0.4 }}
      >
        {to}
      </motion.span>
      <motion.span
        className="text-xs font-bold text-green-400"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.5, duration: 0.3 }}
      >
        +{boost}
      </motion.span>
    </motion.div>
  );
}

// ─── Ascension Animation Overlay ────────────────────────────────────────────
function AscensionAnimationOverlay({
  hero,
  prevStats,
  onComplete,
}: {
  hero: HeroInstance;
  prevStats: { attack: number; defense: number; health: number; speed: number };
  onComplete: () => void;
}) {
  const rarity = RARITY_CONFIG[hero.rarity];
  const element = ELEMENT_CONFIG[hero.element];
  const faction = FACTION_CONFIG[hero.faction];
  const heroImage = getHeroImageUrl(hero.templateId);
  const heroGradient = getHeroGradient(hero.rarity);

  // Generate particle configs once
  const particles = useMemo(() => {
    const goldenColors = ['#fbbf24', '#f59e0b', '#d97706', '#eab308', '#fcd34d'];
    const purpleColors = ['#a855f7', '#9333ea', '#7c3aed', '#c084fc', '#d8b4fe'];
    const allColors = [...goldenColors, ...purpleColors];
    return Array.from({ length: 40 }, (_, i) => ({
      index: i,
      total: 40,
      color: allColors[i % allColors.length],
      delay: Math.random() * 0.5,
    }));
  }, []);

  // Generate sparkle positions once
  const sparkles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      x: 30 + Math.random() * 40,
      y: 25 + Math.random() * 35,
      delay: 0.8 + i * 0.12,
      color: i % 2 === 0 ? '#fbbf24' : '#a855f7',
    }));
  }, []);

  // Auto-dismiss after 3 seconds
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Dark background overlay */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.92 }}
        transition={{ duration: 0.5 }}
      />

      {/* Radial light burst behind hero */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, rgba(168,85,247,0.1) 40%, transparent 70%)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 1.2], opacity: [0, 1, 0.8] }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />

      {/* Concentric ring pulse */}
      <motion.div
        className="absolute w-64 h-64 rounded-full border-2 border-amber-400/30"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 3], opacity: [1, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute w-64 h-64 rounded-full border border-purple-400/20"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 3.5], opacity: [1, 0] }}
        transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: 'easeOut' }}
      />

      {/* Swirling particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <SwirlingParticle key={p.index} index={p.index} total={p.total} color={p.color} delay={p.delay} />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Hero portrait - enlarged and centered with pulsing glow */}
        <motion.div
          className={`relative w-32 h-32 rounded-2xl overflow-hidden border-3 ${rarity.borderColor}`}
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        >
          {/* Pulsing glow border */}
          <motion.div
            className="absolute -inset-1 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, rgba(251,191,36,0.6), rgba(168,85,247,0.6))`,
              zIndex: -1,
            }}
            animate={{
              boxShadow: [
                '0 0 20px rgba(251,191,36,0.3), 0 0 40px rgba(168,85,247,0.2)',
                '0 0 40px rgba(251,191,36,0.6), 0 0 80px rgba(168,85,247,0.4)',
                '0 0 20px rgba(251,191,36,0.3), 0 0 40px rgba(168,85,247,0.2)',
              ],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {heroImage ? (
            <img src={heroImage} alt={hero.name} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${heroGradient} flex items-center justify-center text-5xl`}>
              {faction.icon}
            </div>
          )}

          {/* Shimmer overlay */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
            }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Hero name */}
        <motion.h2
          className="mt-4 text-xl font-bold text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {hero.name}
        </motion.h2>

        {/* Rarity & element badges */}
        <motion.div
          className="flex items-center gap-2 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${rarity.bgColor} ${rarity.color} font-medium`}>{rarity.label}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${element.bgColor} ${element.color}`}>{element.icon}</span>
        </motion.div>

        {/* Star count incrementing with sparkle effects */}
        <div className="flex items-center gap-0.5 mt-3 relative h-7">
          {Array.from({ length: hero.stars }, (_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{
                delay: 0.8 + i * 0.15,
                type: 'spring',
                stiffness: 300,
                damping: 12,
              }}
            >
              <Star
                className={`w-5 h-5 ${i === hero.stars - 1 ? 'fill-amber-300 text-amber-300' : 'fill-yellow-400 text-yellow-400'}`}
              />
            </motion.div>
          ))}

          {/* Sparkle effects around new star */}
          {sparkles.map((s, i) => (
            <SparkleBurst key={i} x={s.x} y={s.y} delay={s.delay} color={s.color} />
          ))}
        </div>

        {/* "ASCENDED!" dramatic text */}
        <motion.div
          className="mt-4"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 1] }}
          transition={{ delay: 1.0, duration: 0.6, ease: 'backOut' }}
        >
          <div className="relative">
            <motion.span
              className="text-3xl sm:text-4xl font-black tracking-widest"
              style={{
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #a855f7, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ASCENDED!
            </motion.span>
            {/* Glow behind text */}
            <motion.div
              className="absolute inset-0 blur-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(251,191,36,0.4), rgba(168,85,247,0.4))',
              }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Stat boosts with flying numbers */}
        <motion.div
          className="mt-4 bg-black/60 backdrop-blur-sm rounded-xl p-3 border border-amber-500/20 space-y-1.5 min-w-[260px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <FlyingStat icon={<Swords className="w-4 h-4" />} label="Attack" from={prevStats.attack} to={hero.attack} delay={1.3} color="#f87171" />
          <FlyingStat icon={<Shield className="w-4 h-4" />} label="Defense" from={prevStats.defense} to={hero.defense} delay={1.5} color="#60a5fa" />
          <FlyingStat icon={<Heart className="w-4 h-4" />} label="Health" from={prevStats.health} to={hero.health} delay={1.7} color="#4ade80" />
          <FlyingStat icon={<Zap className="w-4 h-4" />} label="Speed" from={prevStats.speed} to={hero.speed} delay={1.9} color="#facc15" />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Main Hero Roster Component ─────────────────────────────────────────────
export function HeroRoster() {
  const heroes = useGameStore(s => s.heroes);
  const team = useGameStore(s => s.team);
  const addToTeam = useGameStore(s => s.addToTeam);
  const removeFromTeam = useGameStore(s => s.removeFromTeam);
  const levelUpHero = useGameStore(s => s.levelUpHero);
  const ascendHero = useGameStore(s => s.ascendHero);
  const equipment = useGameStore(s => s.equipment);
  const player = useGameStore(s => s.player);

  const [search, setSearch] = useState('');
  const [rarityFilter, setRarityFilter] = useState<Rarity | 'all'>('all');
  const [factionFilter, setFactionFilter] = useState<Faction | 'all'>('all');
  const [selectedHero, setSelectedHero] = useState<HeroInstance | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAscendConfirm, setShowAscendConfirm] = useState(false);
  const [ascensionAnimating, setAscensionAnimating] = useState(false);
  const [ascendedHero, setAscendedHero] = useState<HeroInstance | null>(null);
  const [prevStats, setPrevStats] = useState<{ attack: number; defense: number; health: number; speed: number } | null>(null);

  const filteredHeroes = heroes.filter(h => {
    if (search && !h.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (rarityFilter !== 'all' && h.rarity !== rarityFilter) return false;
    if (factionFilter !== 'all' && h.faction !== factionFilter) return false;
    return true;
  });

  const sortedHeroes = [...filteredHeroes].sort((a, b) => {
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
    return rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity) || b.level - a.level;
  });

  const handleHeroClick = (hero: HeroInstance) => {
    setSelectedHero(selectedHero?.id === hero.id ? null : hero);
    setShowAscendConfirm(false);
  };

  const handleToggleTeam = (heroId: string) => {
    if (team.includes(heroId)) {
      removeFromTeam(heroId);
    } else {
      addToTeam(heroId);
    }
  };

  const handleAscendAnimationComplete = useCallback(() => {
    setAscensionAnimating(false);
    setAscendedHero(null);
    setPrevStats(null);
  }, []);

  const handleAscend = () => {
    if (!selectedHero) return;
    // Capture prev stats before ascending
    const before = {
      attack: selectedHero.attack,
      defense: selectedHero.defense,
      health: selectedHero.health,
      speed: selectedHero.speed,
    };
    setPrevStats(before);
    ascendHero(selectedHero.id);
    setShowAscendConfirm(false);
    // Get the updated hero after ascension
    const updated = useGameStore.getState().heroes.find(h => h.id === selectedHero.id);
    if (updated) {
      setSelectedHero(updated);
      setAscendedHero(updated);
      setAscensionAnimating(true);
    }
  };

  return (
    <div className="p-3 sm:p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold gold-text">Hero Collection</h2>
        <span className="text-xs text-muted-foreground">{heroes.length} Champions</span>
      </div>

      {/* Search & Filters */}
      <div className="mb-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search heroes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 p-2 bg-gray-900/30 rounded-lg">
                <div>
                  <div className="text-[10px] text-gray-500 mb-1">Rarity</div>
                  <div className="flex flex-wrap gap-1">
                    <FilterChip label="All" active={rarityFilter === 'all'} onClick={() => setRarityFilter('all')} />
                    {Object.entries(RARITY_CONFIG).map(([key, val]) => (
                      <FilterChip key={key} label={val.label} active={rarityFilter === key} onClick={() => setRarityFilter(key as Rarity)} color={val.color} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 mb-1">Faction</div>
                  <div className="flex flex-wrap gap-1">
                    <FilterChip label="All" active={factionFilter === 'all'} onClick={() => setFactionFilter('all')} />
                    {Object.entries(FACTION_CONFIG).map(([key, val]) => (
                      <FilterChip key={key} label={val.label} active={factionFilter === key} onClick={() => setFactionFilter(key as Faction)} color={val.color} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Team bar */}
      <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/10 border border-amber-500/20 rounded-lg p-2 mb-3">
        <div className="text-[10px] text-amber-400 font-medium mb-1">ACTIVE TEAM ({team.length}/5)</div>
        <div className="flex gap-1.5">
          {team.map(id => {
            const hero = heroes.find(h => h.id === id);
            if (!hero) return null;
            return (
              <div key={id} className="flex items-center gap-1 bg-black/30 rounded px-1.5 py-0.5">
                <span className="text-xs">{ELEMENT_CONFIG[hero.element].icon}</span>
                <span className="text-[10px] text-white font-medium">{hero.name}</span>
                <button onClick={() => removeFromTeam(id)} className="text-red-400 hover:text-red-300 text-[10px]">✕</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hero Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {sortedHeroes.map(hero => (
          <HeroCard
            key={hero.id}
            hero={hero}
            onClick={() => handleHeroClick(hero)}
            selected={selectedHero?.id === hero.id}
            showStats
          />
        ))}
      </div>

      {/* Hero Detail Modal */}
      <AnimatePresence>
        {selectedHero && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedHero(null)}>
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-gradient-to-b from-[#1a0a2e] to-[#0f0f23] border border-amber-500/20 rounded-t-2xl sm:rounded-2xl p-5 max-w-md w-full max-h-[85vh] overflow-y-auto game-scrollbar"
              onClick={e => e.stopPropagation()}
            >
              <HeroDetail
                hero={selectedHero}
                isInTeam={team.includes(selectedHero.id)}
                onToggleTeam={() => handleToggleTeam(selectedHero.id)}
                onLevelUp={() => {
                  levelUpHero(selectedHero.id);
                  const updated = useGameStore.getState().heroes.find(h => h.id === selectedHero.id);
                  if (updated) setSelectedHero(updated);
                }}
                onAscend={() => setShowAscendConfirm(true)}
                gold={player.gold}
                gems={player.gems}
                equipment={equipment}
                showAscendConfirm={showAscendConfirm}
                onConfirmAscend={handleAscend}
                onCancelAscend={() => setShowAscendConfirm(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ascension Animation Overlay */}
      <AnimatePresence>
        {ascensionAnimating && ascendedHero && prevStats && (
          <AscensionAnimationOverlay
            hero={ascendedHero}
            prevStats={prevStats}
            onComplete={handleAscendAnimationComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function HeroDetail({ hero, isInTeam, onToggleTeam, onLevelUp, onAscend, gold, gems, equipment, showAscendConfirm, onConfirmAscend, onCancelAscend }: {
  hero: HeroInstance;
  isInTeam: boolean;
  onToggleTeam: () => void;
  onLevelUp: () => void;
  onAscend: () => void;
  gold: number;
  gems: number;
  equipment: { id: string; templateId: string; equippedTo?: string }[];
  showAscendConfirm: boolean;
  onConfirmAscend: () => void;
  onCancelAscend: () => void;
}) {
  const rarity = RARITY_CONFIG[hero.rarity];
  const element = ELEMENT_CONFIG[hero.element];
  const faction = FACTION_CONFIG[hero.faction];
  const levelUpCost = hero.level * 500;
  const ascendCost = RARITY_CONFIG[hero.rarity].stars * 2000;

  // Awakening system
  const awakenHero = useGameStore(s => s.awakenHero);
  const dungeonMaterials = useGameStore(s => s.dungeonMaterials);
  const awakeningLevel = hero.awakeningLevel || 0;
  const nextAwakening = awakeningLevel < 5 ? AWAKENING_LEVELS[awakeningLevel] : null;
  const materialName = element.awakeningMaterial;
  const materialOwned = dungeonMaterials[materialName] || 0;
  const heroImage = getHeroImageUrl(hero.templateId);
  const heroGradient = getHeroGradient(hero.rarity);
  const heroPower = hero.attack + hero.defense + Math.floor(hero.health / 10) + hero.speed * 5;

  // Get equipped items for this hero
  const equippedItems = equipment.filter(e => e.equippedTo === hero.id);

  const canAscend = !hero.ascended && hero.level >= 20 && gems >= ascendCost;
  const ascendBlockedReason = hero.ascended
    ? 'Already ascended'
    : hero.level < 20
    ? `Requires level 20 (current: ${hero.level})`
    : gems < ascendCost
    ? `Need ${ascendCost} gems`
    : null;

  return (
    <div>
      {/* Hero Portrait Header - 3D Showcase */}
      <div className={`relative -mx-5 -mt-5 mb-4 p-5 pb-4 bg-gradient-to-b ${heroGradient} border-b border-amber-500/20 overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f0f23]" />

        {/* 3D Aura rings for legendary+ */}
        {(hero.rarity === 'legendary' || hero.rarity === 'mythic') && (
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className={`absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 ${
              hero.rarity === 'mythic' ? 'border-red-500/40' : 'border-amber-500/40'
            } animate-[aura-ring_4s_linear_infinite]`} style={{ transform: 'rotateX(60deg) rotateZ(0deg)' }} />
            <div className={`absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-dashed ${
              hero.rarity === 'mythic' ? 'border-amber-500/30' : 'border-purple-500/30'
            } animate-[aura-ring_6s_linear_infinite_reverse]`} style={{ transform: 'rotateX(60deg) rotateZ(0deg)' }} />
          </div>
        )}

        <div className="relative z-10 flex items-center gap-4">
          {/* 3D Portrait with perspective showcase */}
          <div className="hero-3d-container flex-shrink-0" style={{ perspective: '600px' }}>
            <div
              className="hero-showcase-relative"
              style={{
                transformStyle: 'preserve-3d',
                animation: hero.rarity === 'mythic'
                  ? 'hero-showcase-rotate 6s ease-in-out infinite'
                  : hero.rarity === 'legendary'
                  ? 'hero-showcase-rotate 10s ease-in-out infinite'
                  : 'none',
              }}
            >
              <div className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 ${rarity.borderColor} shadow-lg hero-3d-glow-${hero.rarity}`}
                style={{ transform: 'translateZ(10px)' }}
              >
                {heroImage ? (
                  <img src={heroImage} alt={hero.name} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${heroGradient} flex items-center justify-center text-3xl`}>
                    {faction.icon}
                  </div>
                )}
                {/* Holographic shimmer on portrait */}
                {['epic', 'legendary', 'mythic'].includes(hero.rarity) && (
                  <div className={`absolute inset-0 holographic-overlay ${
                    hero.rarity === 'epic' ? 'holographic-epic' :
                    hero.rarity === 'legendary' ? 'holographic-legendary' : 'holographic-mythic'
                  }`} style={{ opacity: 0.6, animation: 'holographic-sweep 3s linear infinite' }} />
                )}
                {/* Level badge with 3D depth */}
                <div className="absolute bottom-0 inset-x-0 bg-black/80 text-center text-[10px] font-bold text-amber-300 py-0.5 badge-3d" style={{ transform: 'translateZ(20px)' }}>
                  Lv.{hero.level}
                </div>
              </div>
              {/* 3D pedestal shadow */}
              <div className="hero-pedestal absolute -bottom-3 left-2 right-2 h-3 rounded-b-xl" style={{ background: 'linear-gradient(to bottom, rgba(255,215,0,0.1), transparent)' }} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0" style={{ transform: 'translateZ(5px)' }}>
            <h3 className="text-lg font-bold text-white truncate embossed-text">{hero.name}</h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={`badge-3d text-[10px] px-1.5 py-0.5 rounded ${rarity.bgColor} ${rarity.color} font-medium`}>{rarity.label}</span>
              <span className={`badge-3d text-[10px] px-1.5 py-0.5 rounded ${element.bgColor} ${element.color}`}>{element.icon}</span>
              <span className="text-[10px] text-gray-400">{faction.icon} {faction.label}</span>
            </div>
            <div className="flex gap-0.5 mt-1.5">
              {Array.from({ length: hero.stars }, (_, i) => (
                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
              ))}
              {hero.ascended && (
                <span className="ml-1 text-[10px] text-amber-300 font-bold flex items-center gap-0.5">
                  <Crown className="w-2.5 h-2.5" /> ASCENDED
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Power rating with 3D raised panel */}
        <div className="relative z-10 mt-3 flex items-center justify-between raised-panel rounded-lg px-3 py-1.5 bg-black/40">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">Power</span>
          <span className="text-sm font-bold gold-text embossed-text">{heroPower.toLocaleString()}</span>
        </div>
      </div>

      {/* Stats Grid with 3D depth */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <StatBlock3D icon={<Swords className="w-4 h-4" />} label="Attack" value={hero.attack} color="text-red-400" barColor="bg-red-500" />
        <StatBlock3D icon={<Shield className="w-4 h-4" />} label="Defense" value={hero.defense} color="text-blue-400" barColor="bg-blue-500" />
        <StatBlock3D icon={<Heart className="w-4 h-4" />} label="Health" value={hero.health} color="text-green-400" barColor="bg-green-500" />
        <StatBlock3D icon={<Zap className="w-4 h-4" />} label="Speed" value={hero.speed} color="text-yellow-400" barColor="bg-yellow-500" />
      </div>

      {/* Crit stats */}
      <div className="flex gap-3 text-[11px] text-muted-foreground mb-3 recessed-panel rounded-lg px-3 py-1.5 bg-black/20">
        <span>Crit Rate: <span className="text-amber-300 font-medium embossed-text">{(hero.critRate * 100).toFixed(0)}%</span></span>
        <span>Crit Damage: <span className="text-amber-300 font-medium embossed-text">{(hero.critDamage * 100).toFixed(0)}%</span></span>
      </div>

      {/* Equipment slots */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-1.5 text-[11px] text-gray-400">
          <Shirt className="w-3 h-3" />
          <span className="uppercase tracking-wider">Equipment ({equippedItems.length}/6)</span>
        </div>
        <div className="grid grid-cols-6 gap-1">
          {['weapon', 'helmet', 'armor', 'boots', 'ring', 'amulet'].map(slot => {
            const item = equippedItems.find(e => {
              const t = EQUIPMENT_TEMPLATES.find(t => t.id === e.templateId);
              return t?.slot === slot;
            });
            const template = item ? EQUIPMENT_TEMPLATES.find(t => t.id === item.templateId) : null;
            return (
              <div
                key={slot}
                className={`aspect-square rounded-md border flex items-center justify-center text-base ${
                  template
                    ? `${RARITY_CONFIG[template.rarity].borderColor} ${RARITY_CONFIG[template.rarity].bgColor}`
                    : 'border-dashed border-gray-700/50 bg-black/30 text-gray-700'
                }`}
                title={template ? template.name : `Empty ${slot} slot`}
              >
                {template ? template.icon : ''}
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-1.5 mb-4">
        <div className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Skills</div>
        <SkillDisplay name={hero.skill1Name} desc={hero.skill1Desc} stars={1} />
        {hero.skill2Name && <SkillDisplay name={hero.skill2Name} desc={hero.skill2Desc} stars={2} />}
        {hero.skill3Name && <SkillDisplay name={hero.skill3Name} desc={hero.skill3Desc} stars={3} />}
      </div>

      {/* Lore */}
      <div className="mb-4 bg-black/20 rounded-lg p-2.5 border-l-2 border-amber-500/30">
        <div className="text-[10px] text-amber-400/70 uppercase tracking-wider mb-1">Lore</div>
        <div className="text-[11px] text-gray-400 italic">{hero.lore}</div>
      </div>

      {/* Ascend Confirmation */}
      <AnimatePresence>
        {showAscendConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 bg-gradient-to-r from-purple-900/40 to-amber-900/30 border border-purple-500/40 rounded-lg p-3 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-bold text-purple-200">Confirm Ascension</span>
            </div>
            <p className="text-[11px] text-gray-300 mb-2">
              Sacrifice {ascendCost} 💎 to elevate <span className="text-amber-300 font-medium">{hero.name}</span> to ★{hero.stars + 1}.
              All stats will be permanently boosted by ~15%.
            </p>
            <div className="flex gap-2">
              <button
                onClick={onConfirmAscend}
                disabled={!canAscend}
                className="flex-1 py-1.5 rounded-lg font-medium text-xs bg-gradient-to-r from-purple-500 to-amber-500 text-white hover:from-purple-400 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ⚡ Ascend Now
              </button>
              <button
                onClick={onCancelAscend}
                className="px-3 py-1.5 rounded-lg text-xs bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onToggleTeam}
          className={`py-2 rounded-lg font-medium text-sm transition-all ${
            isInTeam
              ? 'bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30'
              : 'bg-green-600/20 text-green-400 border border-green-500/30 hover:bg-green-600/30'
          }`}
        >
          {isInTeam ? '✕ Remove' : '+ Add to Team'}
        </button>
        <button
          onClick={onLevelUp}
          disabled={gold < levelUpCost}
          className="py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          Lv.Up {levelUpCost}🪙
        </button>
      </div>

      {/* Ascend Button */}
      <button
        onClick={onAscend}
        disabled={!!ascendBlockedReason}
        className="w-full mt-2 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-purple-600/40 to-amber-600/40 text-purple-100 border border-purple-500/40 hover:from-purple-600/60 hover:to-amber-600/60 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all"
      >
        <Crown className="w-3.5 h-3.5" />
        {hero.ascended ? 'Already Ascended' : `Ascend (${ascendCost} 💎)`}
      </button>
      {ascendBlockedReason && !hero.ascended && (
        <div className="text-center text-[10px] text-red-400/70 mt-1">⚠ {ascendBlockedReason}</div>
      )}

      {/* Hero Skins Section */}
      <HeroSkinSection hero={hero} />

      {/* Awakening System */}
      <div className="mt-3 bg-gradient-to-br from-purple-950/40 to-[#0f0f23] border border-purple-500/30 rounded-xl p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-4 h-4 text-purple-300" />
          <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">Hero Awakening</span>
          <span className="ml-auto text-[10px] text-purple-400">Lv.{awakeningLevel}/5</span>
        </div>

        {/* Awakening level progress dots */}
        <div className="flex items-center justify-center gap-1.5 mb-2">
          {[1, 2, 3, 4, 5].map(lvl => (
            <div
              key={lvl}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border ${
                lvl <= awakeningLevel
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-300 shadow-lg shadow-purple-500/50'
                  : lvl === awakeningLevel + 1
                  ? 'bg-purple-900/40 text-purple-300 border-purple-400/50 animate-pulse'
                  : 'bg-gray-800/50 text-gray-600 border-gray-700/50'
              }`}
            >
              {lvl <= awakeningLevel ? '✦' : lvl}
            </div>
          ))}
        </div>

        {awakeningLevel > 0 && (
          <div className="text-[10px] text-purple-300/70 text-center mb-2 italic">
            Current: {AWAKENING_LEVELS[awakeningLevel - 1].effect}
          </div>
        )}

        {nextAwakening ? (
          <>
            <div className="bg-black/30 rounded-lg p-2 mb-2">
              <div className="text-[10px] text-amber-300 font-bold mb-0.5">
                Next: {nextAwakening.name} (Lv.{awakeningLevel + 1})
              </div>
              <div className="text-[10px] text-gray-400 mb-1">{nextAwakening.description}</div>
              <div className="text-[10px] text-purple-300">✦ {nextAwakening.effect}</div>
            </div>

            <div className="flex items-center justify-between text-[10px] mb-2">
              <span className="flex items-center gap-1">
                <span className="text-lg">{element.icon}</span>
                <span className={materialOwned >= nextAwakening.materialCost ? 'text-green-400' : 'text-red-400'}>
                  {materialOwned}/{nextAwakening.materialCost} {materialName}
                </span>
              </span>
              <span className={gold >= nextAwakening.goldCost ? 'text-amber-300' : 'text-red-400'}>
                🪙 {nextAwakening.goldCost.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => awakenHero(hero.id)}
              disabled={materialOwned < nextAwakening.materialCost || gold < nextAwakening.goldCost}
              className="w-full py-2 rounded-lg font-bold text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-purple-500/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Awaken to Level {awakeningLevel + 1}
            </button>
            {materialOwned < nextAwakening.materialCost && (
              <div className="text-center text-[9px] text-cyan-400/70 mt-1">
                💡 Collect {materialName} from Daily Dungeons ({element.label} day)
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-xs text-amber-300 font-bold py-2 bg-amber-900/20 rounded-lg border border-amber-500/30">
            ✦ MAX AWAKENING REACHED ✦
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Hero Skin Section Component ────────────────────────────────────────────
function HeroSkinSection({ hero }: { hero: HeroInstance }) {
  const buySkin = useGameStore(s => s.buySkin);
  const equipSkin = useGameStore(s => s.equipSkin);
  const ownedSkins = useGameStore(s => s.ownedSkins);
  const equippedSkins = useGameStore(s => s.equippedSkins);
  const gems = useGameStore(s => s.player.gems);
  const [buyingSkin, setBuyingSkin] = useState<string | null>(null);
  const [skinEffect, setSkinEffect] = useState<string | null>(null);

  const availableSkins = getSkinsForHero(hero.templateId);
  const currentlyEquipped = equippedSkins[hero.id] || null;

  if (availableSkins.length <= 1) return null; // Only default skin, no need to show

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-600/50';
      case 'rare': return 'border-blue-500/50';
      case 'epic': return 'border-purple-500/50';
      case 'legendary': return 'border-amber-500/50';
      case 'mythic': return 'border-red-500/50';
      default: return 'border-gray-600/50';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'epic': return 'shadow-purple-500/30';
      case 'legendary': return 'shadow-amber-500/30';
      case 'mythic': return 'shadow-red-500/30';
      default: return '';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common': return { text: 'Common', color: 'text-gray-400' };
      case 'rare': return { text: 'Rare', color: 'text-blue-400' };
      case 'epic': return { text: 'Epic', color: 'text-purple-400' };
      case 'legendary': return { text: 'Legendary', color: 'text-amber-400' };
      case 'mythic': return { text: 'Mythic', color: 'text-red-400' };
      default: return { text: rarity, color: 'text-gray-400' };
    }
  };

  const handleBuy = (skin: HeroSkin) => {
    if (gems < skin.cost || ownedSkins.includes(skin.id)) return;
    setBuyingSkin(skin.id);
    setSkinEffect(skin.id);
    setTimeout(() => {
      const result = buySkin(skin.id);
      setBuyingSkin(null);
      if (result.success) {
        setTimeout(() => setSkinEffect(null), 1500);
      }
    }, 600);
  };

  const handleEquip = (skinId: string) => {
    if (!ownedSkins.includes(skinId)) return;
    equipSkin(hero.id, skinId);
  };

  return (
    <div className="mt-3 bg-gradient-to-br from-rose-950/30 to-[#0f0f23] border border-rose-500/20 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Palette className="w-4 h-4 text-rose-300" />
        <span className="text-xs font-bold text-rose-200 uppercase tracking-wider">Hero Skins</span>
        <span className="ml-auto text-[10px] text-rose-400">{ownedSkins.filter(id => availableSkins.some(s => s.id === id)).length}/{availableSkins.length}</span>
      </div>

      <div className="space-y-2">
        {availableSkins.map((skin) => {
          const isOwned = ownedSkins.includes(skin.id);
          const isEquipped = currentlyEquipped === skin.id;
          const canAfford = gems >= skin.cost;
          const rarityInfo = getRarityLabel(skin.rarity);
          const isDefault = skin.cost === 0;
          const isBuying = buyingSkin === skin.id;
          const showEffect = skinEffect === skin.id;

          return (
            <motion.div
              key={skin.id}
              layout
              className={`relative rounded-lg border ${getRarityBorder(skin.rarity)} ${isEquipped ? 'ring-1 ring-rose-400/50' : ''} overflow-hidden transition-all`}
              whileHover={{ scale: 1.01 }}
            >
              {/* Skin effect overlay */}
              {showEffect && (
                <motion.div
                  className="absolute inset-0 z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 1.5 }}
                  style={{
                    background: `radial-gradient(circle, ${skin.accentColor}40 0%, transparent 70%)`,
                  }}
                />
              )}

              <div className={`flex items-center gap-3 p-2.5 ${isEquipped ? 'bg-rose-900/20' : 'bg-black/20'}`}>
                {/* Skin icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${skin.gradient} flex items-center justify-center text-xl border ${getRarityBorder(skin.rarity)} ${getRarityGlow(skin.rarity) ? `shadow-lg ${getRarityGlow(skin.rarity)}` : ''}`}>
                  {skin.icon}
                </div>

                {/* Skin info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">{skin.name}</span>
                    <span className={`text-[9px] font-medium ${rarityInfo.color}`}>{rarityInfo.text}</span>
                    {isEquipped && (
                      <span className="text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0 rounded-full border border-rose-500/30 flex items-center gap-0.5">
                        <Check className="w-2 h-2" /> Equipped
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5 truncate">{skin.description}</div>
                  {!isDefault && (
                    <div className="flex items-center gap-1 mt-1">
                      {skin.effect !== 'none' && (
                        <span className="text-[9px] bg-black/30 px-1 py-0 rounded text-gray-300">
                          ✨ {skin.effect}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action button */}
                <div className="flex-shrink-0">
                  {isDefault ? (
                    <button
                      onClick={() => handleEquip(skin.id)}
                      className={`px-2 py-1 rounded text-[10px] font-medium ${
                        isEquipped
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-gray-700/50 text-gray-300 border border-gray-600/30 hover:bg-gray-600/50'
                      }`}
                    >
                      {isEquipped ? 'Active' : 'Equip'}
                    </button>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleEquip(skin.id)}
                      className={`px-2 py-1 rounded text-[10px] font-medium ${
                        isEquipped
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-rose-600/30 text-rose-200 border border-rose-500/30 hover:bg-rose-600/50'
                      }`}
                    >
                      {isEquipped ? 'Active' : 'Equip'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(skin)}
                      disabled={!canAfford || isBuying}
                      className={`px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1 ${
                        canAfford
                          ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white hover:from-rose-500 hover:to-amber-500 disabled:opacity-50'
                          : 'bg-gray-800/50 text-gray-500 border border-gray-700/30 cursor-not-allowed'
                      }`}
                    >
                      {isBuying ? (
                        <motion.div
                          className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                        />
                      ) : (
                        <>
                          💎 {skin.cost}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function StatBlock({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-black/30 rounded-lg p-2.5 flex items-center gap-2 border border-white/5">
      <span className={color}>{icon}</span>
      <div className="min-w-0">
        <div className="text-[9px] text-gray-500 uppercase tracking-wide">{label}</div>
        <div className={`text-sm font-bold ${color} truncate`}>{value.toLocaleString()}</div>
      </div>
    </div>
  );
}

function StatBlock3D({ icon, label, value, color, barColor }: { icon: React.ReactNode; label: string; value: number; color: string; barColor: string }) {
  // Normalize stat value for bar display (approximate max ranges)
  const maxValues: Record<string, number> = { Attack: 5000, Defense: 4000, Health: 50000, Speed: 200 };
  const maxVal = maxValues[label] || 5000;
  const percentage = Math.min((value / maxVal) * 100, 100);

  return (
    <div className="raised-panel rounded-lg p-2.5 flex items-center gap-2 bg-black/30">
      <div className="stat-orb-3d w-8 h-8 flex-shrink-0" style={{
        background: `radial-gradient(circle at 35% 35%, ${color.includes('red') ? 'rgba(239,68,68,0.3)' : color.includes('blue') ? 'rgba(59,130,246,0.3)' : color.includes('green') ? 'rgba(34,197,94,0.3)' : 'rgba(234,179,8,0.3)'}, rgba(0,0,0,0.5))`,
      }}>
        <span className={color} style={{ transform: 'translateZ(10px)' }}>{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[9px] text-gray-500 uppercase tracking-wide">{label}</div>
        <div className={`text-sm font-bold ${color} truncate embossed-text`}>{value.toLocaleString()}</div>
        {/* 3D stat bar */}
        <div className="stat-3d-bar mt-1 h-1.5 bg-black/50 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            style={{ boxShadow: '0 0 6px currentColor' }}
          />
        </div>
      </div>
    </div>
  );
}

function SkillDisplay({ name, desc, stars }: { name: string; desc: string; stars: number }) {
  return (
    <div className="bg-black/20 rounded-lg p-2 border border-white/5 hover:border-amber-500/20 transition-colors">
      <div className="flex items-center gap-1 text-xs font-medium text-amber-300">
        {Array.from({ length: stars }, (_, i) => (
          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
        ))}
        <span className="ml-1">{name}</span>
      </div>
      <div className="text-[11px] text-gray-400 mt-0.5">{desc}</div>
    </div>
  );
}

function FilterChip({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
        active
          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          : 'bg-gray-800/50 text-gray-400 border border-gray-700/30 hover:bg-gray-700/50'
      }`}
    >
      {label}
    </button>
  );
}
