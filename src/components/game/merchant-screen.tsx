'use client';

import { useGameStore } from '@/lib/game-store';
import { MerchantDeal, getMerchantWindow, MERCHANT_REFRESH_INTERVAL } from '@/lib/game-data';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Gem,
  Coins,
  Clock,
  Sparkles,
  Star,
  ArrowRight,
  Package,
  Tag,
  Flame,
  Crown,
  Hourglass,
  AlertTriangle,
  RefreshCw,
  Check,
  X,
} from 'lucide-react';

// ============= Helpers =============

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const TAG_CONFIG: Record<string, { label: string; bg: string; text: string; icon?: React.ReactNode }> = {
  BEST_VALUE: { label: 'BEST VALUE', bg: 'bg-green-500/25', text: 'text-green-300', icon: <Star className="w-2.5 h-2.5" /> },
  RARE: { label: 'RARE', bg: 'bg-blue-500/25', text: 'text-blue-300', icon: <Sparkles className="w-2.5 h-2.5" /> },
  EPIC: { label: 'EPIC', bg: 'bg-purple-500/25', text: 'text-purple-300', icon: <Flame className="w-2.5 h-2.5" /> },
  LEGENDARY: { label: 'LEGENDARY', bg: 'bg-amber-500/25', text: 'text-amber-300', icon: <Crown className="w-2.5 h-2.5" /> },
  NEW: { label: 'NEW', bg: 'bg-emerald-500/25', text: 'text-emerald-300', icon: <Package className="w-2.5 h-2.5" /> },
  HOT: { label: 'HOT', bg: 'bg-red-500/25', text: 'text-red-300', icon: <Flame className="w-2.5 h-2.5" /> },
};

function getDiscountPercent(original: number, discounted: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - discounted) / original) * 100);
}

function stockColor(remaining: number): string {
  if (remaining <= 0) return 'text-gray-500';
  if (remaining === 1) return 'text-red-400';
  if (remaining === 2) return 'text-yellow-400';
  return 'text-green-400';
}

// ============= Main Component =============

export function MerchantScreen() {
  const player = useGameStore(s => s.player);
  const getMerchantDeals = useGameStore(s => s.getMerchantDeals);
  const getMerchantRemainingStock = useGameStore(s => s.getMerchantRemainingStock);
  const buyMerchantDeal = useGameStore(s => s.buyMerchantDeal);
  const refreshMerchantIfStale = useGameStore(s => s.refreshMerchantIfStale);
  const addNotification = useGameStore(s => s.addNotification);

  const [timeLeft, setTimeLeft] = useState(0);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [errorReason, setErrorReason] = useState<string | null>(null);

  // Refresh merchant deals on mount
  useEffect(() => {
    refreshMerchantIfStale();
  }, [refreshMerchantIfStale]);

  // Countdown timer
  useEffect(() => {
    const update = () => {
      const { windowEnd } = getMerchantWindow(Date.now());
      const remaining = Math.max(0, windowEnd - Date.now());
      setTimeLeft(remaining);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const deals = getMerchantDeals();

  const handleBuy = useCallback((deal: MerchantDeal) => {
    setPurchasingId(deal.id);
    setErrorReason(null);
    const result = buyMerchantDeal(deal.id);
    if (result.success) {
      // Store already adds success notification
    } else {
      setErrorReason(result.reason || 'Purchase failed');
      addNotification(`❌ ${result.reason || 'Purchase failed'}`, 'error');
    }
    // Clear purchasing state after a brief delay
    setTimeout(() => {
      setPurchasingId(prev => (prev === deal.id ? null : prev));
      setErrorReason(null);
    }, 2000);
  }, [buyMerchantDeal, addNotification]);

  const isUrgent = timeLeft > 0 && timeLeft < 30 * 60 * 1000; // < 30 min

  return (
    <div className="p-3 sm:p-4 max-w-4xl mx-auto">
      {/* ============= Header ============= */}
      <div className="text-center mb-4">
        <motion.div
          animate={{ y: [0, -4, 0], rotate: [0, -2, 2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ShoppingBag className="w-12 h-12 text-amber-400 mx-auto mb-2 drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]" />
        </motion.div>
        <h2 className="text-2xl font-bold gold-text">Wandering Merchant</h2>
        <p className="text-xs text-gray-400 mt-1">
          Rare wares at discounted prices — returns every 8 hours
        </p>
      </div>

      {/* ============= Ornate Divider ============= */}
      <OrnateDivider />

      {/* ============= Time Banner ============= */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-xl border p-3 mb-4 ${
          isUrgent
            ? 'border-red-500/40 bg-gradient-to-r from-red-900/30 via-red-950/20 to-red-900/30'
            : 'border-purple-500/20 bg-gradient-to-r from-purple-900/20 via-purple-950/10 to-purple-900/20'
        }`}
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),transparent_70%)]" />
        </div>
        <div className="relative z-10 flex items-center justify-center gap-3">
          <Hourglass className={`w-5 h-5 ${isUrgent ? 'text-red-400 animate-pulse' : 'text-purple-400'}`} />
          <div className="text-center">
            <div className={`text-[10px] uppercase tracking-wider ${isUrgent ? 'text-red-400/80' : 'text-purple-400/80'}`}>
              Merchant departs in
            </div>
            <div className={`text-xl font-bold font-mono tracking-widest ${
              isUrgent ? 'text-red-300' : 'text-amber-300'
            }`}>
              {formatCountdown(timeLeft)}
            </div>
          </div>
          <Clock className={`w-5 h-5 ${isUrgent ? 'text-red-400 animate-pulse' : 'text-purple-400'}`} />
        </div>
        {isUrgent && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute top-1 right-2 text-[9px] font-bold text-red-400 uppercase tracking-wider"
          >
            ⚠ Hurry!
          </motion.div>
        )}
      </motion.div>

      {/* ============= Current Resources ============= */}
      <div className="flex justify-center gap-4 mb-4">
        <div className="flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3 py-1.5">
          <Gem className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-bold text-cyan-300">{player.gems.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-amber-300">{player.gold.toLocaleString()}</span>
        </div>
      </div>

      {/* ============= Error Banner ============= */}
      {errorReason && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-3 flex items-center gap-2 bg-red-900/20 border border-red-500/30 rounded-lg p-2 text-red-300 text-xs"
        >
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorReason}</span>
        </motion.div>
      )}

      {/* ============= Deal Cards Grid ============= */}
      {deals.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 mx-auto mb-3 text-gray-600 opacity-30" />
          <p className="text-gray-400 text-sm">The merchant has no wares today...</p>
          <p className="text-gray-500 text-xs mt-1">Check back when the merchant returns!</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Next visit in {formatCountdown(timeLeft)}</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {deals.map((deal, index) => (
            <DealCard
              key={deal.id}
              deal={deal}
              index={index}
              remainingStock={getMerchantRemainingStock(deal.id)}
              canAfford={deal.currency === 'gems' ? player.gems >= deal.discountedPrice : player.gold >= deal.discountedPrice}
              isPurchasing={purchasingId === deal.id}
              onBuy={() => handleBuy(deal)}
            />
          ))}
        </div>
      )}

      {/* ============= Ornate Divider ============= */}
      <OrnateDivider />

      {/* ============= Footer Note ============= */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center py-2"
      >
        <p className="text-[10px] text-gray-500">
          🏪 The Wandering Merchant appears with new deals every 8 hours. Stock is limited — buy before they&apos;re gone!
        </p>
      </motion.div>
    </div>
  );
}

// ============= Deal Card =============

function DealCard({
  deal,
  index,
  remainingStock,
  canAfford,
  isPurchasing,
  onBuy,
}: {
  deal: MerchantDeal;
  index: number;
  remainingStock: number;
  canAfford: boolean;
  isPurchasing: boolean;
  onBuy: () => void;
}) {
  const tagConfig = deal.tag ? TAG_CONFIG[deal.tag] : null;
  const discount = getDiscountPercent(deal.originalPrice, deal.discountedPrice);
  const isOutOfStock = remainingStock <= 0;
  const isDisabled = isOutOfStock || !canAfford || isPurchasing;

  // Determine border accent based on tag/rarity
  const borderAccent = (() => {
    if (deal.tag === 'LEGENDARY') return 'border-amber-500/50';
    if (deal.tag === 'EPIC') return 'border-purple-500/50';
    if (deal.tag === 'RARE') return 'border-blue-500/50';
    if (deal.tag === 'BEST_VALUE') return 'border-green-500/50';
    if (deal.tag === 'HOT') return 'border-red-500/50';
    if (deal.tag === 'NEW') return 'border-emerald-500/50';
    if (deal.rarity === 'legendary') return 'border-amber-500/40';
    if (deal.rarity === 'epic') return 'border-purple-500/40';
    if (deal.rarity === 'rare') return 'border-blue-500/40';
    return 'border-gray-600/40';
  })();

  const glowClass = (() => {
    if (deal.tag === 'LEGENDARY' || deal.rarity === 'legendary') return 'animate-pulse-glow';
    if (deal.tag === 'EPIC' || deal.rarity === 'epic') return 'shadow-[0_0_15px_rgba(168,85,247,0.2)]';
    return '';
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={isDisabled ? {} : { scale: 1.03, y: -2 }}
      className={`relative group ${glowClass}`}
    >
      {/* Gradient border wrapper */}
      <div className={`rounded-xl p-[1px] bg-gradient-to-b ${
        deal.tag === 'LEGENDARY' || deal.rarity === 'legendary'
          ? 'from-amber-500/40 via-amber-600/20 to-amber-500/10'
          : deal.tag === 'EPIC' || deal.rarity === 'epic'
          ? 'from-purple-500/40 via-purple-600/20 to-purple-500/10'
          : deal.tag === 'HOT'
          ? 'from-red-500/40 via-red-600/20 to-red-500/10'
          : deal.tag === 'BEST_VALUE'
          ? 'from-green-500/40 via-green-600/20 to-green-500/10'
          : 'from-gray-500/20 via-gray-600/10 to-gray-500/5'
      }`}>
        <div className="rounded-xl bg-gradient-to-b from-[#1a0f2e] to-[#0f0a1e] overflow-hidden h-full flex flex-col">
          {/* Left border accent */}
          <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${borderAccent.replace('border-', 'bg-').replace('/50', '/60')}`} />

          {/* Tag + Discount banner area */}
          <div className="relative px-3 pt-2.5 pb-1">
            <div className="flex items-center justify-between">
              {/* Tag badge */}
              {tagConfig ? (
                <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded ${tagConfig.bg} ${tagConfig.text}`}>
                  {tagConfig.icon}
                  {tagConfig.label}
                </span>
              ) : (
                <span className="text-[9px] text-gray-600">—</span>
              )}
              {/* Discount badge */}
              {discount > 0 && (
                <span className="bg-red-500/30 text-red-300 text-[9px] font-bold px-1.5 py-0.5 rounded">
                  -{discount}%
                </span>
              )}
            </div>
          </div>

          {/* Icon + Info */}
          <div className="px-3 pb-2 flex-1 flex flex-col">
            <div className="text-center mb-1.5">
              <span className="text-3xl drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]">{deal.icon}</span>
            </div>
            <h3 className="text-sm font-bold gold-text text-center leading-tight mb-0.5 truncate" title={deal.name}>
              {deal.name}
            </h3>
            <p className="text-[10px] text-gray-400 text-center leading-snug mb-2 line-clamp-2" title={deal.description}>
              {deal.description}
            </p>

            {/* Price area */}
            <div className="mt-auto">
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                {deal.originalPrice > deal.discountedPrice && (
                  <span className="text-xs text-gray-500 line-through">
                    {deal.originalPrice.toLocaleString()}
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <span className="text-base font-bold text-amber-300">
                    {deal.discountedPrice.toLocaleString()}
                  </span>
                  <span className="text-sm">
                    {deal.currency === 'gems' ? '💎' : '🪙'}
                  </span>
                </div>
              </div>

              {/* Stock indicator */}
              <div className="flex items-center justify-center gap-1 mb-2">
                <Package className="w-3 h-3 text-gray-500" />
                <span className={`text-[10px] font-medium ${stockColor(remainingStock)}`}>
                  {isOutOfStock ? 'Sold out' : `${remainingStock} left`}
                </span>
                {!isOutOfStock && remainingStock <= 2 && (
                  <Flame className="w-3 h-3 text-orange-400 animate-pulse" />
                )}
              </div>

              {/* Buy button */}
              <button
                onClick={onBuy}
                disabled={isDisabled}
                className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                  isPurchasing
                    ? 'bg-amber-500/20 text-amber-300/60 cursor-wait'
                    : isOutOfStock
                    ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                    : !canAfford
                    ? 'bg-gray-700/30 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 active:scale-95 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                }`}
              >
                {isPurchasing ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Buying...
                  </>
                ) : isOutOfStock ? (
                  <>
                    <X className="w-3 h-3" />
                    Sold Out
                  </>
                ) : !canAfford ? (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    Can&apos;t Afford
                  </>
                ) : (
                  <>
                    <Check className="w-3 h-3" />
                    Buy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sold out overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 rounded-xl bg-black/50 flex items-center justify-center pointer-events-none">
          <span className="text-xs font-bold text-red-400/80 uppercase tracking-wider rotate-[-8deg]">
            Sold Out
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ============= Ornate Divider =============

function OrnateDivider() {
  return (
    <div className="flex items-center gap-2 my-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      <Star className="w-3 h-3 text-amber-500/40" />
      <div className="h-px w-6 bg-gradient-to-r from-amber-500/20 to-transparent" />
      <div className="h-px w-6 bg-gradient-to-l from-amber-500/20 to-transparent" />
      <Star className="w-3 h-3 text-amber-500/40" />
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
    </div>
  );
}
