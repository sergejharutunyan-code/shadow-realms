'use client';

import { useGameStore, OwnedEquipment } from '@/lib/game-store';
import { EQUIPMENT_TEMPLATES, RARITY_CONFIG, EquipmentTemplate, EquipmentSlot, HeroInstance } from '@/lib/game-data';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Shirt, Swords, Shield, HardHat, Footprints, Circle, Gem, Sparkles, ArrowUp, Star, Hammer } from 'lucide-react';

const SLOT_ICONS: Record<EquipmentSlot, React.ReactNode> = {
  weapon: <Swords className="w-4 h-4" />,
  armor: <Shield className="w-4 h-4" />,
  helmet: <HardHat className="w-4 h-4" />,
  boots: <Footprints className="w-4 h-4" />,
  ring: <Circle className="w-4 h-4" />,
  amulet: <Gem className="w-4 h-4" />,
};

const SLOT_LABELS: Record<EquipmentSlot, string> = {
  weapon: 'Weapon',
  armor: 'Armor',
  helmet: 'Helmet',
  boots: 'Boots',
  ring: 'Ring',
  amulet: 'Amulet',
};

const CRAFT_COSTS: { rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'; gold: number; gems: number }[] = [
  { rarity: 'common', gold: 500, gems: 0 },
  { rarity: 'uncommon', gold: 2000, gems: 10 },
  { rarity: 'rare', gold: 8000, gems: 50 },
  { rarity: 'epic', gold: 25000, gems: 200 },
  { rarity: 'legendary', gold: 100000, gems: 800 },
];

export function EquipmentScreen() {
  const equipment = useGameStore(s => s.equipment);
  const heroes = useGameStore(s => s.heroes);
  const player = useGameStore(s => s.player);
  const equipItem = useGameStore(s => s.equipItem);
  const unequipItem = useGameStore(s => s.unequipItem);
  const craftEquipment = useGameStore(s => s.craftEquipment);
  const [selectedItem, setSelectedItem] = useState<OwnedEquipment | null>(null);
  const [tab, setTab] = useState<'inventory' | 'craft'>('inventory');

  const unequipped = equipment.filter(e => !e.equippedTo);
  const equipped = equipment.filter(e => e.equippedTo);

  return (
    <div className="p-3 sm:p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <Shirt className="w-10 h-10 text-amber-400 mx-auto mb-2" />
        <h2 className="text-xl font-bold gold-text">Armory</h2>
        <p className="text-xs text-gray-400 mt-1">Equip your champions with powerful gear</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setTab('inventory')}
          className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            tab === 'inventory' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-gray-900/30 text-gray-400 border border-gray-700/30'
          }`}
        >
          🎒 Inventory ({unequipped.length})
        </button>
        <button
          onClick={() => setTab('craft')}
          className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            tab === 'craft' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-gray-900/30 text-gray-400 border border-gray-700/30'
          }`}
        >
          🔨 Forge
        </button>
      </div>

      {tab === 'inventory' ? (
        <>
          {/* Unequipped Items */}
          <h3 className="text-sm font-bold text-amber-200 mb-2">Available Equipment</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
            {unequipped.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                <Shirt className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No equipment available</p>
                <p className="text-xs mt-1">Win battles to get drops, or forge new gear!</p>
              </div>
            ) : (
              unequipped.map(item => {
                const template = EQUIPMENT_TEMPLATES.find(t => t.id === item.templateId);
                if (!template) return null;
                return (
                  <EquipmentCard
                    key={item.id}
                    item={item}
                    template={template}
                    onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                    selected={selectedItem?.id === item.id}
                  />
                );
              })
            )}
          </div>

          {/* Equipped Items */}
          {equipped.length > 0 && (
            <>
              <h3 className="text-sm font-bold text-amber-200 mb-2">Equipped</h3>
              <div className="space-y-2 mb-4">
                {equipped.map(item => {
                  const template = EQUIPMENT_TEMPLATES.find(t => t.id === item.templateId);
                  const hero = heroes.find(h => h.id === item.equippedTo);
                  if (!template || !hero) return null;
                  return (
                    <div key={item.id} className={`bg-gradient-to-r ${RARITY_CONFIG[template.rarity].bgColor} border ${RARITY_CONFIG[template.rarity].borderColor} rounded-lg p-2 flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{template.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-white">{template.name}</div>
                          <div className="text-[10px] text-gray-400">Equipped on {hero.name}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => unequipItem(item.id)}
                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                      >
                        Unequip
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      ) : (
        /* Forge Tab */
        <div className="space-y-2">
          <p className="text-xs text-gray-400 mb-3">Forge powerful equipment using gold and gems. Higher rarity = better stats!</p>
          {CRAFT_COSTS.map(cost => {
            const rarity = RARITY_CONFIG[cost.rarity];
            const canAfford = player.gold >= cost.gold && player.gems >= cost.gems;
            const sampleItems = EQUIPMENT_TEMPLATES.filter(e => e.rarity === cost.rarity);
            return (
              <motion.div
                key={cost.rarity}
                whileHover={{ scale: canAfford ? 1.01 : 1 }}
                className={`${rarity.bgColor} border ${rarity.borderColor} rounded-xl p-3`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${rarity.color}`}>{rarity.label} Forge</span>
                      <span className="text-[10px] text-gray-500">({sampleItems.length} possible items)</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className={player.gold >= cost.gold ? 'text-amber-300' : 'text-red-400'}>
                        🪙 {cost.gold.toLocaleString()}
                      </span>
                      {cost.gems > 0 && (
                        <span className={player.gems >= cost.gems ? 'text-cyan-300' : 'text-red-400'}>
                          💎 {cost.gems}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => craftEquipment(cost.rarity)}
                    disabled={!canAfford}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500'
                        : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Hammer className="w-4 h-4 inline mr-1" />
                    Forge
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Equip Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center" onClick={() => setSelectedItem(null)}>
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-gradient-to-b from-[#1a0a2e] to-[#0f0f23] border border-amber-500/20 rounded-t-2xl sm:rounded-2xl p-5 max-w-md w-full max-h-[80vh] overflow-y-auto game-scrollbar"
              onClick={e => e.stopPropagation()}
            >
              <EquipDetail
                item={selectedItem}
                heroes={heroes}
                onEquip={(heroId) => {
                  equipItem(selectedItem.id, heroId);
                  setSelectedItem(null);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EquipmentCard({ item, template, onClick, selected }: {
  item: OwnedEquipment; template: EquipmentTemplate; onClick: () => void; selected: boolean;
}) {
  const rarity = RARITY_CONFIG[template.rarity];
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`${rarity.bgColor} border ${rarity.borderColor} rounded-lg p-2 cursor-pointer transition-all ${selected ? 'ring-2 ring-amber-400' : ''} ${
        template.rarity === 'legendary' || template.rarity === 'mythic' ? 'animate-pulse-glow' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-2xl">{template.icon}</span>
        <span className="text-[9px] text-gray-500">{SLOT_LABELS[template.slot]}</span>
      </div>
      <div className="text-xs font-bold text-white truncate">{template.name}</div>
      <div className={`text-[9px] ${rarity.color}`}>{rarity.label}</div>
      <div className="space-y-0.5 mt-1">
        {template.attackBonus && <StatLine label="ATK" value={`+${template.attackBonus}`} color="text-red-400" />}
        {template.defenseBonus && <StatLine label="DEF" value={`+${template.defenseBonus}`} color="text-blue-400" />}
        {template.healthBonus && <StatLine label="HP" value={`+${template.healthBonus}`} color="text-green-400" />}
        {template.speedBonus && <StatLine label="SPD" value={`+${template.speedBonus}`} color="text-yellow-400" />}
        {template.critRateBonus && <StatLine label="CR" value={`+${(template.critRateBonus * 100).toFixed(0)}%`} color="text-orange-400" />}
        {template.critDamageBonus && <StatLine label="CD" value={`+${(template.critDamageBonus * 100).toFixed(0)}%`} color="text-pink-400" />}
      </div>
    </motion.div>
  );
}

function StatLine({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between text-[10px]">
      <span className="text-gray-500">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}

function EquipDetail({ item, heroes, onEquip }: {
  item: OwnedEquipment; heroes: HeroInstance[]; onEquip: (heroId: string) => void;
}) {
  const template = EQUIPMENT_TEMPLATES.find(t => t.id === item.templateId);
  if (!template) return null;
  const rarity = RARITY_CONFIG[template.rarity];

  return (
    <div>
      <div className="text-center mb-4">
        <div className="text-5xl mb-2">{template.icon}</div>
        <h3 className="text-lg font-bold text-white">{template.name}</h3>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded ${rarity.bgColor} ${rarity.color}`}>{rarity.label}</span>
          <span className="text-xs text-gray-400">{SLOT_LABELS[template.slot]}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">{template.description}</p>
      </div>

      <div className="bg-black/30 rounded-lg p-3 mb-4">
        <div className="text-xs text-gray-400 mb-2">Stat Bonuses:</div>
        <div className="grid grid-cols-2 gap-2">
          {template.attackBonus && <BonusStat label="Attack" value={`+${template.attackBonus}`} color="text-red-400" />}
          {template.defenseBonus && <BonusStat label="Defense" value={`+${template.defenseBonus}`} color="text-blue-400" />}
          {template.healthBonus && <BonusStat label="Health" value={`+${template.healthBonus}`} color="text-green-400" />}
          {template.speedBonus && <BonusStat label="Speed" value={`+${template.speedBonus}`} color="text-yellow-400" />}
          {template.critRateBonus && <BonusStat label="Crit Rate" value={`+${(template.critRateBonus * 100).toFixed(0)}%`} color="text-orange-400" />}
          {template.critDamageBonus && <BonusStat label="Crit DMG" value={`+${(template.critDamageBonus * 100).toFixed(0)}%`} color="text-pink-400" />}
        </div>
      </div>

      <div className="text-xs text-amber-200 font-medium mb-2">Equip to Hero:</div>
      <div className="space-y-1.5 max-h-48 overflow-y-auto game-scrollbar">
        {heroes.map(hero => {
          const rarityConfig = RARITY_CONFIG[hero.rarity];
          return (
            <motion.button
              key={hero.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onEquip(hero.id)}
              className={`w-full flex items-center gap-2 p-2 rounded-lg ${rarityConfig.bgColor} border ${rarityConfig.borderColor} hover:ring-1 hover:ring-amber-400 transition-all`}
            >
              <div className="flex-1 text-left">
                <div className="text-xs font-bold text-white">{hero.name}</div>
                <div className="text-[10px] text-gray-400">Lv.{hero.level} · {rarityConfig.label}</div>
              </div>
              <ArrowUp className="w-4 h-4 text-amber-400" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function BonusStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] text-gray-500">{label}</span>
      <span className={`text-xs font-bold ${color}`}>{value}</span>
    </div>
  );
}
