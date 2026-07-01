'use client';

import { useGameStore } from '@/lib/game-store';
import { SHOP_ITEMS, ShopItem } from '@/lib/game-data';
import { motion } from 'framer-motion';
import { ShoppingBag, Gem, Coins, Zap, Crown, Star, Gift, Flame, Clock, Tag } from 'lucide-react';
import { useState } from 'react';

export function GameShop() {
  const player = useGameStore(s => s.player);
  const buyShopItem = useGameStore(s => s.buyShopItem);
  const addNotification = useGameStore(s => s.addNotification);
  const [tab, setTab] = useState<'featured' | 'gems' | 'daily' | 'gold'>('featured');

  const featured = SHOP_ITEMS.filter(i => i.featured);
  const gemPacks = SHOP_ITEMS.filter(i => i.type === 'gems' && i.currency === 'usd');
  const dailyDeals = SHOP_ITEMS.filter(i => i.currency === 'gems');
  const goldShop = SHOP_ITEMS.filter(i => i.currency === 'gold');

  return (
    <div className="p-3 sm:p-4 max-w-4xl mx-auto">
      {/* Shop Header */}
      <div className="text-center mb-4">
        <ShoppingBag className="w-10 h-10 text-amber-400 mx-auto mb-2" />
        <h2 className="text-xl font-bold gold-text">Grand Bazaar</h2>
        <p className="text-xs text-gray-400 mt-1">Power up your champions with premium items</p>
      </div>

      {/* Current Resources */}
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

      {/* Special Offer Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-900/50 via-amber-900/30 to-red-900/50 border border-red-500/30 p-4 mb-4 cursor-pointer"
        onClick={() => {
          addGemsWithAnimation(1000);
          addNotification('🎉 Starter Pack purchased! +1,000 Gems + Epic Hero!', 'epic');
        }}
      >
        <div className="absolute inset-0 animate-shimmer" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">75% OFF</span>
            <span className="text-sm font-bold text-amber-200">🔥 MEGA Starter Pack</span>
          </div>
          <div className="text-xs text-gray-300">1,000 Gems + Epic Hero + 50,000 Gold + 100 VIP Points</div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-amber-400">$4.99</span>
              <span className="text-sm text-gray-500 line-through">$19.99</span>
            </div>
            <button className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-4 py-1.5 rounded-lg text-sm hover:from-amber-400 hover:to-amber-500 transition-all">
              Buy Now
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto game-scrollbar">
        {(['featured', 'gems', 'daily', 'gold'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              tab === t
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-gray-900/30 text-gray-400 border border-gray-700/30 hover:bg-gray-800/30'
            }`}
          >
            {t === 'featured' && '⭐ Featured'}
            {t === 'gems' && '💎 Gem Packs'}
            {t === 'daily' && '📅 Daily Deals'}
            {t === 'gold' && '🪙 Gold Shop'}
          </button>
        ))}
      </div>

      {/* Shop Items */}
      <div className="space-y-2">
        {tab === 'featured' && featured.map(item => (
          <ShopItemCard key={item.id} item={item} onBuy={() => handleBuy(item)} />
        ))}
        {tab === 'gems' && gemPacks.map(item => (
          <ShopItemCard key={item.id} item={item} onBuy={() => handleBuy(item)} />
        ))}
        {tab === 'daily' && dailyDeals.map(item => (
          <ShopItemCard key={item.id} item={item} onBuy={() => handleBuy(item)} />
        ))}
        {tab === 'gold' && goldShop.map(item => (
          <ShopItemCard key={item.id} item={item} onBuy={() => handleBuy(item)} />
        ))}
      </div>

      {/* VIP CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 bg-gradient-to-r from-yellow-900/20 to-amber-900/10 border border-yellow-500/20 rounded-xl p-3 text-center"
      >
        <Crown className="w-6 h-6 text-amber-400 mx-auto mb-1" />
        <div className="text-sm font-bold text-amber-200">VIP Program</div>
        <div className="text-xs text-gray-400 mt-1">Every purchase earns VIP points! Higher VIP = better perks</div>
        <button
          onClick={() => useGameStore.getState().setScreen('vip')}
          className="mt-2 text-xs text-amber-400 hover:text-amber-300 font-medium"
        >
          View VIP Benefits →
        </button>
      </motion.div>
    </div>
  );

  function handleBuy(item: ShopItem) {
    if (item.currency === 'gems') {
      buyShopItem(item.id, item.price, 'gems', item.type, item.amount);
    } else if (item.currency === 'gold') {
      buyShopItem(item.id, item.price, 'gold', item.type, item.amount);
    } else if (item.currency === 'usd') {
      // Simulate purchase - add gems and VIP points
      addGemsWithAnimation(item.amount);
      const vipPoints = Math.floor(item.amount / 10);
      useGameStore.getState().addVIPPoints(vipPoints);
      addNotification(`💎 Purchased! +${item.amount} Gems + ${vipPoints} VIP Points`, 'success');
    }
  }

  function addGemsWithAnimation(amount: number) {
    useGameStore.getState().addGems(amount);
  }
}

function ShopItemCard({ item, onBuy }: { item: ShopItem; onBuy: () => void }) {
  const player = useGameStore(s => s.player);
  const canAfford = item.currency === 'gems' ? player.gems >= item.price : item.currency === 'gold' ? player.gold >= item.price : true;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`relative overflow-hidden rounded-xl border transition-all ${
        item.featured
          ? 'border-amber-500/30 bg-gradient-to-r from-amber-900/15 to-amber-800/5'
          : 'border-gray-700/30 bg-gray-900/30'
      }`}
    >
      {item.featured && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      )}

      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center text-xl">
            {item.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{item.name}</span>
              {item.discount && (
                <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  -{item.discount}%
                </span>
              )}
              {item.limited && (
                <span className="bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" /> Limited
                </span>
              )}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">{item.description}</div>
          </div>
        </div>

        <div className="text-right flex-shrink-0 ml-3">
          <div className="flex items-center gap-1 justify-end">
            {item.originalPrice && (
              <span className="text-xs text-gray-500 line-through">{item.originalPrice}</span>
            )}
            <span className="text-sm font-bold text-amber-300">
              {item.currency === 'usd' ? `$${(item.price || item.amount / 100).toFixed(2)}` : `${item.price}`}
            </span>
            {item.currency === 'gems' && <Gem className="w-3.5 h-3.5 text-cyan-400" />}
            {item.currency === 'gold' && <Coins className="w-3.5 h-3.5 text-amber-400" />}
          </div>
          <button
            onClick={onBuy}
            disabled={!canAfford}
            className={`mt-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              canAfford
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500'
                : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
            }`}
          >
            Buy
          </button>
        </div>
      </div>
    </motion.div>
  );
}
