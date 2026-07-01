'use client';

import { HeroInstance, RARITY_CONFIG, FACTION_CONFIG, ELEMENT_CONFIG, Rarity } from '@/lib/game-data';
import { getHeroImageUrl, getHeroGradient } from '@/lib/hero-images';
import { motion } from 'framer-motion';
import { Star, Swords, Shield, Heart, Zap, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useState, useCallback } from 'react';

interface HeroCardProps {
  hero: HeroInstance;
  onClick?: () => void;
  selected?: boolean;
  compact?: boolean;
  showStats?: boolean;
  animate?: boolean;
  hasDuplicates?: boolean;
  onAscensionBadgeClick?: () => void;
}

// 3D tilt hook - tracks mouse position and applies perspective transforms
function use3DTilt(maxTilt: number = 12) {
  const [tiltState, setTiltState] = useState({ x: 0, y: 0, glareX: 50, glareY: 50, isHovering: false });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const tiltX = (0.5 - y) * maxTilt;
    const tiltY = (x - 0.5) * maxTilt;
    setTiltState({
      x: tiltX,
      y: tiltY,
      glareX: x * 100,
      glareY: y * 100,
      isHovering: true,
    });
  }, [maxTilt]);

  const handleMouseEnter = useCallback(() => {
    setTiltState(prev => ({ ...prev, isHovering: true }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTiltState({ x: 0, y: 0, glareX: 50, glareY: 50, isHovering: false });
  }, []);

  const transform = tiltState.isHovering
    ? `perspective(800px) rotateX(${tiltState.x}deg) rotateY(${tiltState.y}deg) translateZ(10px)`
    : 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)';

  return {
    transform,
    isHovering: tiltState.isHovering,
    glareStyle: {
      left: `${tiltState.glareX}%`,
      top: `${tiltState.glareY}%`,
      transform: 'translate(-50%, -50%)',
    },
    glareX: tiltState.glareX,
    glareY: tiltState.glareY,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
}

// Premium aura particles for legendary+ heroes
function getPremiumAuraParticles(rarity: Rarity) {
  if (rarity === 'legendary') {
    return [
      { x: '8%', y: '15%', color: '#ffd700', delay: 0, size: 5 },
      { x: '88%', y: '10%', color: '#ffaa00', delay: 0.5, size: 4 },
      { x: '12%', y: '78%', color: '#ffd700', delay: 1, size: 4 },
      { x: '92%', y: '72%', color: '#ff9500', delay: 1.5, size: 5 },
      { x: '50%', y: '3%', color: '#ffe066', delay: 0.8, size: 3 },
      { x: '50%', y: '95%', color: '#ffd700', delay: 2, size: 3 },
      { x: '5%', y: '50%', color: '#ffcc00', delay: 1.2, size: 3 },
      { x: '95%', y: '50%', color: '#ffb300', delay: 1.8, size: 3 },
    ];
  }
  if (rarity === 'mythic') {
    return [
      { x: '5%', y: '20%', color: '#ef4444', delay: 0, size: 6 },
      { x: '90%', y: '8%', color: '#ffd700', delay: 0.3, size: 5 },
      { x: '12%', y: '82%', color: '#a855f7', delay: 0.6, size: 5 },
      { x: '88%', y: '78%', color: '#ef4444', delay: 0.9, size: 6 },
      { x: '45%', y: '2%', color: '#ff8c00', delay: 1.2, size: 4 },
      { x: '55%', y: '96%', color: '#ffd700', delay: 1.5, size: 4 },
      { x: '3%', y: '48%', color: '#ec4899', delay: 1.8, size: 4 },
      { x: '97%', y: '48%', color: '#ef4444', delay: 2.1, size: 4 },
      { x: '30%', y: '5%', color: '#ffd700', delay: 0.4, size: 3 },
      { x: '70%', y: '93%', color: '#ff6b00', delay: 1.6, size: 3 },
    ];
  }
  if (rarity === 'epic') {
    return [
      { x: '12%', y: '18%', color: '#a855f7', delay: 0, size: 4 },
      { x: '82%', y: '22%', color: '#ec4899', delay: 0.7, size: 4 },
      { x: '18%', y: '72%', color: '#a855f7', delay: 1.4, size: 3 },
      { x: '85%', y: '68%', color: '#c084fc', delay: 2.1, size: 4 },
      { x: '50%', y: '8%', color: '#8b5cf6', delay: 1.0, size: 3 },
    ];
  }
  return [];
}

// Get holographic class based on rarity
function getHolographicClass(rarity: Rarity): string {
  switch (rarity) {
    case 'epic': return 'holographic-epic';
    case 'legendary': return 'holographic-legendary';
    case 'mythic': return 'holographic-mythic';
    default: return '';
  }
}

// Get 3D glow class based on rarity
function getGlowClass(rarity: Rarity): string {
  switch (rarity) {
    case 'rare': return 'hero-3d-glow-rare';
    case 'epic': return 'hero-3d-glow-epic';
    case 'legendary': return 'hero-3d-glow-legendary';
    case 'mythic': return 'hero-3d-glow-mythic';
    default: return '';
  }
}

// Get premium border glow class based on rarity
function getPremiumBorderGlow(rarity: Rarity): string {
  switch (rarity) {
    case 'epic': return 'premium-border-glow-epic';
    case 'legendary': return 'premium-border-glow-legendary';
    case 'mythic': return 'premium-border-glow-mythic';
    default: return '';
  }
}

// Premium star rendering
function PremiumStars({ count, size = 'sm' }: { count: number; size?: 'xs' | 'sm' | 'md' }) {
  const sizeClass = size === 'xs' ? 'w-2 h-2' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <div className="flex justify-center gap-0.5">
      {Array.from({ length: count }, (_, i) => (
        <Star
          key={i}
          className={`${sizeClass} fill-yellow-400 text-yellow-400 premium-star`}
        />
      ))}
    </div>
  );
}

export function HeroCard({ hero, onClick, selected, compact, showStats, animate, hasDuplicates, onAscensionBadgeClick }: HeroCardProps) {
  const rarityConfig = RARITY_CONFIG[hero.rarity];
  const factionConfig = FACTION_CONFIG[hero.faction];
  const elementConfig = ELEMENT_CONFIG[hero.element];
  const heroImage = getHeroImageUrl(hero.templateId);
  const gradient = getHeroGradient(hero.rarity);
  const tilt3d = use3DTilt(hero.rarity === 'mythic' ? 15 : hero.rarity === 'legendary' ? 13 : 10);
  const auraParticles = getPremiumAuraParticles(hero.rarity);
  const holoClass = getHolographicClass(hero.rarity);
  const glowClass = getGlowClass(hero.rarity);
  const premiumBorderGlow = getPremiumBorderGlow(hero.rarity);

  // Determine if hero has premium frame (legendary+)
  const isPremiumRarity = ['legendary', 'mythic'].includes(hero.rarity);
  const isEpicPlus = ['epic', 'legendary', 'mythic'].includes(hero.rarity);

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`hero-3d-container relative cursor-pointer rounded-lg overflow-hidden transition-all ${selected ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/30' : ''}`}
      >
        <div
          className={`hero-3d-card hero-3d-frame-${hero.rarity} hero-3d-glow rounded-lg ${glowClass} ${isEpicPlus ? premiumBorderGlow : ''} premium-frame-${hero.rarity}`}
          style={{ transform: tilt3d.transform, transformStyle: 'preserve-3d' }}
          {...tilt3d.handlers}
        >
          {/* Holographic overlay for epic+ */}
          {holoClass && (
            <div className={`holographic-overlay ${holoClass} rounded-lg`} />
          )}
          {/* Glare spot */}
          {tilt3d.isHovering && (
            <div
              className="hero-3d-glare"
              style={tilt3d.glareStyle}
            />
          )}
          <div className={`hero-3d-layer-bg bg-gradient-to-b ${gradient} p-2 text-center rounded-lg`}>
            {/* Hero Image - ALWAYS shown prominently */}
            <div className="premium-compact-portrait w-12 h-12 mx-auto mb-1.5 relative overflow-hidden">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={hero.name}
                  fill
                  className="object-cover object-top"
                  sizes="48px"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/40">
                  <span className="text-lg opacity-60">{factionConfig.icon}</span>
                </div>
              )}
              {/* Inner glow on portrait */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            <div className="hero-3d-layer-front">
              <div className="text-xs font-bold text-white truncate embossed-text">{hero.name}</div>
              <PremiumStars count={hero.stars} size="xs" />
              <div className={`text-[10px] mt-1 font-semibold ${rarityConfig.color}`}>Lv.{hero.level}</div>
            </div>
          </div>
          {/* Premium corner flourishes for legendary+ */}
          {isPremiumRarity && (
            <>
              <div className="premium-corner-tl" />
              <div className="premium-corner-tr" />
              <div className="premium-corner-bl" />
              <div className="premium-corner-br" />
            </>
          )}
          {hero.inTeam && (
            <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[8px] badge-3d z-20 shadow-lg shadow-green-500/30">✓</div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="hero-3d-container relative cursor-pointer" onClick={onClick}>
      {/* Aura rings for legendary+ */}
      {hero.rarity === 'legendary' && (
        <div className="aura-ring aura-ring-legendary" />
      )}
      {hero.rarity === 'mythic' && (
        <>
          <div className="aura-ring aura-ring-mythic" />
          <div className="aura-ring aura-ring-outer aura-ring-mythic" />
        </>
      )}

      {/* 3D card with tilt */}
      <motion.div
        initial={animate ? { scale: 0.3, opacity: 0 } : undefined}
        animate={animate ? { scale: 1, opacity: 1 } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`hero-3d-card hero-3d-frame-${hero.rarity} hero-3d-glow rounded-xl overflow-hidden ${glowClass} ${isEpicPlus ? premiumBorderGlow : ''} premium-frame-${hero.rarity} ${selected ? 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/30' : ''}`}
        style={{ transform: tilt3d.transform, transformStyle: 'preserve-3d' }}
        {...tilt3d.handlers}
      >
        {/* 3D depth shadow */}
        <div className="hero-3d-shadow rounded-xl" />

        {/* === PREMIUM HERO PORTRAIT (taller, more prominent) === */}
        <div className={`hero-3d-layer-mid relative h-44 bg-gradient-to-b ${gradient} overflow-hidden premium-portrait-area premium-vignette`}>
          {/* Hero Image - ALWAYS shown prominently, full portrait */}
          {heroImage ? (
            <div className="hero-3d-portrait absolute inset-0">
              <Image
                src={heroImage}
                alt={hero.name}
                fill
                className="object-cover object-top"
                sizes="200px"
                unoptimized
              />
            </div>
          ) : (
            <div className="hero-3d-portrait flex items-center justify-center h-full">
              <span className="text-6xl opacity-40">{factionConfig.icon}</span>
            </div>
          )}

          {/* Premium inner glow/vignette on portrait */}
          <div className="absolute inset-0 z-[2] pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent h-12" />
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-b from-white/10 to-transparent" />
          </div>

          {/* Premium shimmer for legendary+ */}
          {isPremiumRarity && (
            <div className="absolute inset-0 premium-shimmer z-[2] pointer-events-none" />
          )}

          {/* Rarity glow effect */}
          {(hero.rarity === 'legendary' || hero.rarity === 'mythic') && (
            <div className={`absolute inset-0 opacity-15 animate-pulse z-[2] ${
              hero.rarity === 'mythic' ? 'bg-red-500' : 'bg-yellow-500'
            }`} />
          )}

          {/* Element badge (depth layer: front) */}
          <div className="absolute top-2 right-2 z-[5] hero-3d-layer-front">
            <span className={`badge-3d text-xs px-2 py-1 rounded-lg ${elementConfig.bgColor} ${elementConfig.color} backdrop-blur-sm font-semibold shadow-lg`}>
              {elementConfig.icon}
            </span>
          </div>

          {/* Premium nameplate at bottom */}
          <div className="hero-3d-layer-front absolute bottom-0 left-0 right-0 z-[5] premium-nameplate">
            <div className="p-2.5 pt-4">
              <h3 className="font-bold text-white text-sm drop-shadow-lg embossed-text leading-tight">{hero.name}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${rarityConfig.color} bg-black/40 backdrop-blur-sm`}>
                  {rarityConfig.label}
                </span>
                <PremiumStars count={hero.stars} size="xs" />
              </div>
            </div>
          </div>

          {/* In team indicator */}
          {hero.inTeam && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full badge-3d z-[6] shadow-lg shadow-green-500/30">
              IN TEAM
            </div>
          )}

          {/* Awakening indicator */}
          {hero.awakeningLevel > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-purple-300/50 shadow-lg shadow-purple-500/30 badge-3d z-[6]">
              <Sparkles className="w-2.5 h-2.5" />
              <span>✦{hero.awakeningLevel}</span>
            </div>
          )}

          {/* Ascension available badge */}
          {hasDuplicates && hero.stars < 6 && (
            <motion.div
              className={`absolute z-20 ${hero.awakeningLevel > 0 ? 'top-8' : 'top-2'} left-2`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              onClick={(e) => {
                e.stopPropagation();
                onAscensionBadgeClick?.();
              }}
            >
              <div className="flex items-center gap-0.5 bg-gradient-to-r from-amber-500/90 to-yellow-500/90 text-black text-[9px] font-black px-2 py-0.5 rounded-full border border-yellow-300/80 shadow-lg shadow-amber-500/40 cursor-pointer hover:from-amber-400 hover:to-yellow-400 transition-all badge-3d">
                <span>✦</span>
                <span>ASCEND</span>
              </div>
            </motion.div>
          )}

          {/* Floating aura particles for epic+ */}
          {auraParticles.map((p, i) => (
            <div
              key={i}
              className="hero-3d-particle"
              style={{
                left: p.x,
                top: p.y,
                width: p.size,
                height: p.size,
                background: p.color,
                boxShadow: `0 0 ${p.size * 3}px ${p.color}, 0 0 ${p.size * 5}px ${p.color}40`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${2.5 + (i % 3) * 0.5}s`,
              }}
            />
          ))}

          {/* Premium corner flourishes for legendary+ */}
          {isPremiumRarity && (
            <>
              <div className="premium-corner-tl" />
              <div className="premium-corner-tr" />
            </>
          )}
        </div>

        {/* === INFO SECTION === */}
        <div className="hero-3d-layer-mid bg-[#0a0a1a] p-2.5 relative">
          {/* Top decorative line */}
          <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

          <div className="hero-3d-layer-front flex items-center justify-between text-[10px]">
            <span className="text-gray-400 flex items-center gap-1">
              <span className="text-[9px] opacity-70">{factionConfig.icon}</span>
              {factionConfig.label}
            </span>
            <span className="text-gray-300 embossed-text font-semibold">Lv.{hero.level} {hero.ascended ? '★' : ''}</span>
          </div>

          {/* Mini Stats with animated colored bars */}
          <div className="grid grid-cols-4 gap-1 mt-2 hero-3d-layer-front">
            <PremiumMiniStat icon={<Swords className="w-3 h-3" />} value={hero.attack} color="text-red-400" barColor="bg-red-500" maxValue={15000} />
            <PremiumMiniStat icon={<Shield className="w-3 h-3" />} value={hero.defense} color="text-blue-400" barColor="bg-blue-500" maxValue={12000} />
            <PremiumMiniStat icon={<Heart className="w-3 h-3" />} value={hero.health} color="text-green-400" barColor="bg-green-500" maxValue={80000} />
            <PremiumMiniStat icon={<Zap className="w-3 h-3" />} value={hero.speed} color="text-yellow-400" barColor="bg-yellow-500" maxValue={200} />
          </div>
        </div>

        {/* Skills preview - premium styling */}
        {showStats && (
          <div className="hero-3d-layer-bg bg-[#080818] px-2.5 pb-2.5">
            <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent mb-2" />
            <div className="hero-3d-layer-mid text-[10px] text-gray-400 space-y-1">
              <div className="premium-skill-row">
                <span className="text-amber-500 font-bold">★</span> <span className="text-gray-300">{hero.skill1Name}</span>
              </div>
              {hero.skill2Name && (
                <div className="premium-skill-row">
                  <span className="text-amber-500 font-bold">★★</span> <span className="text-gray-300">{hero.skill2Name}</span>
                </div>
              )}
              {hero.skill3Name && (
                <div className="premium-skill-row">
                  <span className="text-amber-500 font-bold">★★★</span> <span className="text-gray-300">{hero.skill3Name}</span>
                </div>
              )}
            </div>
            <div className="hero-3d-layer-front flex gap-2 text-[10px] text-gray-500 mt-1.5">
              <span className="text-red-400/70">Crit: {(hero.critRate * 100).toFixed(0)}%</span>
              <span className="text-orange-400/70">CD: {(hero.critDamage * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}

        {/* === 3D VISUAL EFFECT LAYERS === */}
        {/* Holographic overlay for epic+ rarity */}
        {holoClass && (
          <div className={`holographic-overlay ${holoClass}`} />
        )}

        {/* Edge lights - top and left highlight */}
        <div className="edge-light edge-light-top" />
        <div className="edge-light edge-light-left" />

        {/* Dynamic glare/reflection spot that follows mouse */}
        {tilt3d.isHovering && (
          <div
            className="hero-3d-glare"
            style={tilt3d.glareStyle}
          />
        )}

        {/* Dynamic light overlay based on tilt */}
        {tilt3d.isHovering && (
          <div
            className="hero-3d-light"
            style={{
              background: `radial-gradient(circle at ${tilt3d.glareX}% ${tilt3d.glareY}%, rgba(255,255,255,0.06) 0%, transparent 50%)`,
            }}
          />
        )}

        {/* Premium corner flourishes for legendary+ bottom section */}
        {isPremiumRarity && (
          <>
            <div className="premium-corner-bl" />
            <div className="premium-corner-br" />
          </>
        )}
      </motion.div>
    </div>
  );
}

// Premium mini stat with animated colored bar
function PremiumMiniStat({ icon, value, color, barColor, maxValue }: { icon: React.ReactNode; value: number; color: string; barColor: string; maxValue: number }) {
  const barWidth = Math.min(100, (value / maxValue) * 100);

  return (
    <div className="stat-3d-bar flex flex-col gap-0.5 px-1.5 py-1 rounded-lg bg-black/40 border border-white/5">
      <div className="flex items-center gap-0.5">
        <span className={color}>{icon}</span>
        <span className={`text-[9px] font-bold ${color}`}>
          {value >= 10000 ? `${(value / 1000).toFixed(1)}K` : value.toLocaleString()}
        </span>
      </div>
      <div className="premium-stat-animated h-1 w-full">
        <div
          className={`premium-stat-animated-fill ${barColor}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}
