// Shadow Realms: Champions of Darkness - Game Data Definitions

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type Faction = 'knight' | 'undead' | 'demon' | 'elf' | 'barbarian' | 'darkelf';
export type Element = 'fire' | 'water' | 'earth' | 'dark' | 'light' | 'void';

export interface HeroTemplate {
  id: string;
  name: string;
  rarity: Rarity;
  faction: Faction;
  element: Element;
  baseAttack: number;
  baseDefense: number;
  baseHealth: number;
  baseSpeed: number;
  critRate: number;
  critDamage: number;
  skill1Name: string;
  skill1Desc: string;
  skill2Name: string;
  skill2Desc: string;
  skill3Name: string;
  skill3Desc: string;
  lore: string;
}

export interface HeroInstance {
  id: string;
  templateId: string;
  name: string;
  rarity: Rarity;
  faction: Faction;
  element: Element;
  level: number;
  experience: number;
  attack: number;
  defense: number;
  health: number;
  speed: number;
  critRate: number;
  critDamage: number;
  skill1Name: string;
  skill1Desc: string;
  skill2Name: string;
  skill2Desc: string;
  skill3Name: string;
  skill3Desc: string;
  stars: number;
  ascended: boolean;
  awakened: boolean;
  awakeningLevel: number; // 0-5
  inTeam: boolean;
}

export interface PlayerState {
  id: string;
  name: string;
  level: number;
  experience: number;
  gold: number;
  gems: number;
  energy: number;
  maxEnergy: number;
  vipLevel: number;
  vipPoints: number;
  totalSpent: number;
  campaignStage: number;
  dailyRewardDay: number;
  lastLoginAt: number;
}

export interface BattleHero extends HeroInstance {
  currentHealth: number;
  maxHealth: number;
  isAlive: boolean;
  turnMeter: number;
}

export interface BattleState {
  isActive: boolean;
  playerTeam: BattleHero[];
  enemyTeam: BattleHero[];
  currentTurn: 'player' | 'enemy';
  turnIndex: number;
  turnNumber: number;
  log: string[];
  result: 'victory' | 'defeat' | null;
  rewards: { gold: number; experience: number; gems: number } | null;
  autoPlay: boolean;
  speed: 1 | 2;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'gems' | 'gold' | 'usd';
  type: 'gems' | 'gold' | 'energy' | 'hero_shard' | 'scroll' | 'vip_points';
  amount: number;
  icon: string;
  limited: boolean;
  limitedCount: number;
  originalPrice?: number;
  discount?: number;
  featured?: boolean;
}

export interface CampaignStage {
  id: number;
  name: string;
  description: string;
  enemyLevel: number;
  enemyFaction: Faction;
  energyCost: number;
  rewards: { gold: number; experience: number; gems: number };
  bossName: string;
  bossRarity: Rarity;
}

export const RARITY_CONFIG: Record<Rarity, { label: string; color: string; bgColor: string; borderColor: string; glowColor: string; summonRate: number; stars: number }> = {
  common: { label: 'Common', color: 'text-gray-400', bgColor: 'bg-gray-800', borderColor: 'border-gray-500', glowColor: 'shadow-gray-500/30', summonRate: 0.45, stars: 1 },
  uncommon: { label: 'Uncommon', color: 'text-green-400', bgColor: 'bg-green-900/30', borderColor: 'border-green-500', glowColor: 'shadow-green-500/30', summonRate: 0.25, stars: 2 },
  rare: { label: 'Rare', color: 'text-blue-400', bgColor: 'bg-blue-900/30', borderColor: 'border-blue-500', glowColor: 'shadow-blue-500/40', summonRate: 0.18, stars: 3 },
  epic: { label: 'Epic', color: 'text-purple-400', bgColor: 'bg-purple-900/30', borderColor: 'border-purple-500', glowColor: 'shadow-purple-500/40', summonRate: 0.08, stars: 4 },
  legendary: { label: 'Legendary', color: 'text-yellow-400', bgColor: 'bg-yellow-900/30', borderColor: 'border-yellow-500', glowColor: 'shadow-yellow-500/50', summonRate: 0.035, stars: 5 },
  mythic: { label: 'Mythic', color: 'text-red-400', bgColor: 'bg-red-900/30', borderColor: 'border-red-500', glowColor: 'shadow-red-500/50', summonRate: 0.005, stars: 6 },
};

export const FACTION_CONFIG: Record<Faction, { label: string; color: string; icon: string }> = {
  knight: { label: 'Sacred Order', color: 'text-amber-300', icon: '⚔️' },
  undead: { label: 'Undead Hordes', color: 'text-gray-300', icon: '💀' },
  demon: { label: 'Demonspawn', color: 'text-red-400', icon: '👹' },
  elf: { label: 'Elven Court', color: 'text-emerald-300', icon: '🧝' },
  barbarian: { label: 'Barbarian Tribe', color: 'text-orange-400', icon: '🪓' },
  darkelf: { label: 'Dark Elves', color: 'text-violet-300', icon: '🌙' },
};

export const ELEMENT_CONFIG: Record<Element, { label: string; color: string; bgColor: string; icon: string; awakeningMaterial: string }> = {
  fire: { label: 'Fire', color: 'text-red-400', bgColor: 'bg-red-500/20', icon: '🔥', awakeningMaterial: 'Inferno Ember' },
  water: { label: 'Water', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20', icon: '💧', awakeningMaterial: 'Tidal Pearl' },
  earth: { label: 'Earth', color: 'text-amber-400', bgColor: 'bg-amber-500/20', icon: '🌍', awakeningMaterial: 'Gaia Stone' },
  dark: { label: 'Dark', color: 'text-purple-400', bgColor: 'bg-purple-500/20', icon: '🌑', awakeningMaterial: 'Shadow Essence' },
  light: { label: 'Light', color: 'text-yellow-300', bgColor: 'bg-yellow-500/20', icon: '☀️', awakeningMaterial: 'Light Crystal' },
  void: { label: 'Void', color: 'text-pink-400', bgColor: 'bg-pink-500/20', icon: '✨', awakeningMaterial: 'Void Fragment' },
};

// ============= HERO AWAKENING SYSTEM =============
export const AWAKENING_LEVELS = [
  {
    level: 1,
    name: 'Initial Awakening',
    materialCost: 10,
    goldCost: 50000,
    statBoost: 0.10, // +10% all stats
    description: 'Unlocks the hero\'s dormant power. +10% to all stats.',
    effect: 'Unlock passive: +5% crit rate in battle',
  },
  {
    level: 2,
    name: 'Power Surge',
    materialCost: 25,
    goldCost: 150000,
    statBoost: 0.15,
    description: 'Power surges through the hero. +15% additional stats.',
    effect: 'Skill 1 damage +20%',
  },
  {
    level: 3,
    name: 'Soul Resonance',
    materialCost: 50,
    goldCost: 500000,
    statBoost: 0.20,
    description: 'The hero\'s soul resonates with elemental energy. +20% stats.',
    effect: 'Skill 2 cooldown -1 turn',
  },
  {
    level: 4,
    name: 'Transcendence',
    materialCost: 100,
    goldCost: 1500000,
    statBoost: 0.25,
    description: 'The hero transcends mortal limits. +25% stats.',
    effect: 'Immune to stun and freeze',
  },
  {
    level: 5,
    name: 'Divine Ascension',
    materialCost: 200,
    goldCost: 5000000,
    statBoost: 0.35,
    description: 'The hero achieves divine power. +35% stats.',
    effect: 'Ultimate ability unlocked: Massive AoE damage',
  },
];

// ============= HERO SACRIFICE / ASCENSION SYSTEM =============
export const ASCENSION_COSTS: Record<number, { duplicatesRequired: number; goldCost: number; statBoost: number }> = {
  1: { duplicatesRequired: 1, goldCost: 10000, statBoost: 0.10 },   // 1→2 stars
  2: { duplicatesRequired: 1, goldCost: 25000, statBoost: 0.10 },   // 2→3 stars
  3: { duplicatesRequired: 2, goldCost: 75000, statBoost: 0.10 },   // 3→4 stars
  4: { duplicatesRequired: 3, goldCost: 200000, statBoost: 0.10 },  // 4→5 stars
  5: { duplicatesRequired: 5, goldCost: 500000, statBoost: 0.10 },  // 5→6 stars
};

export const VIP_LEVELS = [
  { level: 0, requiredPoints: 0, rewards: '', perks: ['Basic gameplay'] },
  { level: 1, requiredPoints: 100, rewards: '500 Gems', perks: ['+10% Gold from battles', 'Daily login bonus +50 Gold'] },
  { level: 2, requiredPoints: 500, rewards: '1,500 Gems', perks: ['+20% Gold from battles', '+5% Hero XP', 'Energy cap +20'] },
  { level: 3, requiredPoints: 1500, rewards: '3,000 Gems', perks: ['+30% Gold from battles', '+10% Hero XP', 'Energy cap +40', 'Auto-battle speed x2'] },
  { level: 4, requiredPoints: 5000, rewards: '7,500 Gems', perks: ['+50% Gold from battles', '+15% Hero XP', 'Energy cap +60', 'Extra daily summon'] },
  { level: 5, requiredPoints: 15000, rewards: '15,000 Gems', perks: ['+75% Gold from battles', '+25% Hero XP', 'Energy cap +80', 'Extra daily summon', '+10% summon rates'] },
  { level: 6, requiredPoints: 50000, rewards: '30,000 Gems + Mythic Hero', perks: ['+100% Gold from battles', '+50% Hero XP', 'Energy cap +100', '2 extra daily summons', '+20% summon rates', 'Exclusive Mythic Hero'] },
  { level: 7, requiredPoints: 100000, rewards: '50,000 Gems + Exclusive Skin', perks: ['All previous perks doubled', 'Exclusive cosmetics', 'Priority matchmaking', 'VIP chat badge'] },
];

// Hero Templates - 40+ unique heroes
export const HERO_TEMPLATES: HeroTemplate[] = [
  // KNIGHTS
  { id: 'knight_01', name: 'Sir Galahad', rarity: 'rare', faction: 'knight', element: 'light', baseAttack: 850, baseDefense: 720, baseHealth: 12000, baseSpeed: 95, critRate: 0.15, critDamage: 1.5, skill1Name: 'Holy Strike', skill1Desc: 'Deals 200% ATK damage to one enemy', skill2Name: 'Divine Shield', skill2Desc: 'Grants shield equal to 30% HP for 2 turns', skill3Name: 'Judgement', skill3Desc: 'Attacks all enemies for 150% ATK with 50% stun chance', lore: 'A noble paladin sworn to protect the realm from darkness.' },
  { id: 'knight_02', name: 'Aethelgard', rarity: 'legendary', faction: 'knight', element: 'light', baseAttack: 1450, baseDefense: 1100, baseHealth: 18000, baseSpeed: 105, critRate: 0.20, critDamage: 1.6, skill1Name: 'Radiant Slash', skill1Desc: 'Deals 250% ATK damage ignoring 30% DEF', skill2Name: 'Celestial Ward', skill2Desc: 'Heals all allies by 25% HP and grants immunity', skill3Name: 'Divine Retribution', skill3Desc: 'Deals 300% ATK to all enemies and stuns for 1 turn', lore: 'The legendary grandmaster of the Sacred Order.' },
  { id: 'knight_03', name: 'Squire Timmons', rarity: 'common', faction: 'knight', element: 'fire', baseAttack: 420, baseDefense: 350, baseHealth: 5500, baseSpeed: 85, critRate: 0.10, critDamage: 1.4, skill1Name: 'Swift Slash', skill1Desc: 'Deals 150% ATK damage', skill2Name: 'Block', skill2Desc: 'Reduces incoming damage by 30% for 1 turn', skill3Name: '', skill3Desc: '', lore: 'A young squire eager to prove his worth.' },
  { id: 'knight_04', name: 'Dame Valeria', rarity: 'epic', faction: 'knight', element: 'water', baseAttack: 1100, baseDefense: 950, baseHealth: 15000, baseSpeed: 100, critRate: 0.18, critDamage: 1.55, skill1Name: 'Tidal Smite', skill1Desc: 'Deals 220% ATK damage with lifesteal', skill2Name: 'Oath of Protection', skill2Desc: 'Takes damage meant for an ally for 2 turns', skill3Name: 'Wrath of the Deep', skill3Desc: 'Deals 250% ATK to all enemies and heals team by 15%', lore: 'A sea-faring knight who commands both sword and tide.' },
  { id: 'knight_05', name: 'Crusader Roland', rarity: 'uncommon', faction: 'knight', element: 'fire', baseAttack: 620, baseDefense: 540, baseHealth: 8000, baseSpeed: 90, critRate: 0.12, critDamage: 1.45, skill1Name: 'Flame Cleave', skill1Desc: 'Deals 170% ATK damage', skill2Name: 'Burning Zeal', skill2Desc: 'Increases ATK by 20% for 2 turns', skill3Name: '', skill3Desc: '', lore: 'A zealous warrior whose faith burns like fire.' },

  // UNDEAD
  { id: 'undead_01', name: 'Necrolord Xar', rarity: 'legendary', faction: 'undead', element: 'dark', baseAttack: 1500, baseDefense: 900, baseHealth: 16500, baseSpeed: 110, critRate: 0.22, critDamage: 1.7, skill1Name: 'Soul Rend', skill1Desc: 'Deals 280% ATK damage and heals 30% of damage dealt', skill2Name: 'Raise Dead', skill2Desc: 'Revives a fallen ally with 50% HP', skill3Name: 'Plague of Souls', skill3Desc: 'Deals 250% ATK to all enemies and poisons for 3 turns', lore: 'The supreme lord of the Undead Hordes, feared across all realms.' },
  { id: 'undead_02', name: 'Bone Collector', rarity: 'rare', faction: 'undead', element: 'dark', baseAttack: 880, baseDefense: 600, baseHealth: 10500, baseSpeed: 98, critRate: 0.16, critDamage: 1.5, skill1Name: 'Grave Strike', skill1Desc: 'Deals 200% ATK damage', skill2Name: 'Bone Armor', skill2Desc: 'Increases DEF by 40% for 2 turns', skill3Name: 'Cemetery Call', skill3Desc: 'Deals 160% ATK to all enemies', lore: 'A skeletal warrior animated by dark magic.' },
  { id: 'undead_03', name: 'Shambling Horror', rarity: 'common', faction: 'undead', element: 'earth', baseAttack: 380, baseDefense: 400, baseHealth: 7000, baseSpeed: 75, critRate: 0.08, critDamage: 1.35, skill1Name: 'Rotten Slam', skill1Desc: 'Deals 140% ATK damage', skill2Name: 'Putrid Aura', skill2Desc: 'Poisons attacker when hit for 10% max HP', skill3Name: '', skill3Desc: '', lore: 'A reanimated corpse that spreads disease.' },
  { id: 'undead_04', name: 'Spectral Wraith', rarity: 'epic', faction: 'undead', element: 'void', baseAttack: 1200, baseDefense: 550, baseHealth: 11000, baseSpeed: 115, critRate: 0.25, critDamage: 1.65, skill1Name: 'Phase Strike', skill1Desc: 'Deals 230% ATK damage ignoring shields', skill2Name: 'Soul Drain', skill2Desc: 'Steals 20% of target ATK for 3 turns', skill3Name: 'Void Walk', skill3Desc: 'Becomes untargetable for 1 turn and heals 30% HP', lore: 'A ghostly assassin that phases between dimensions.' },
  { id: 'undead_05', name: 'Ghoul Scratcher', rarity: 'uncommon', faction: 'undead', element: 'dark', baseAttack: 580, baseDefense: 420, baseHealth: 7500, baseSpeed: 92, critRate: 0.12, critDamage: 1.4, skill1Name: 'Festering Claw', skill1Desc: 'Deals 160% ATK damage and poisons', skill2Name: 'Cannibalize', skill2Desc: 'Heals 15% HP when defeating an enemy', skill3Name: '', skill3Desc: '', lore: 'A ravenous ghoul that feeds on the living.' },

  // DEMONS
  { id: 'demon_01', name: 'Archdemon Malachar', rarity: 'mythic', faction: 'demon', element: 'fire', baseAttack: 1800, baseDefense: 1050, baseHealth: 20000, baseSpeed: 120, critRate: 0.25, critDamage: 1.8, skill1Name: 'Hellfire Blast', skill1Desc: 'Deals 320% ATK damage with guaranteed critical', skill2Name: 'Demonic Pact', skill2Desc: 'Sacrifices 20% HP to boost ATK by 60% for 3 turns', skill3Name: 'Apocalypse', skill3Desc: 'Deals 400% ATK to all enemies, ignores DEF, applies burn', lore: 'The supreme Archdemon, ruler of the burning hells. Only the worthy may wield his power.' },
  { id: 'demon_02', name: 'Succubus Lyra', rarity: 'epic', faction: 'demon', element: 'dark', baseAttack: 1150, baseDefense: 650, baseHealth: 12000, baseSpeed: 108, critRate: 0.20, critDamage: 1.6, skill1Name: 'Kiss of Death', skill1Desc: 'Deals 220% ATK damage and charms target', skill2Name: 'Drain Life', skill2Desc: 'Steals 25% HP from target', skill3Name: 'Dark Seduction', skill3Desc: 'Charms all enemies for 1 turn with 40% chance', lore: 'A temptress who bends the wills of mortals.' },
  { id: 'demon_03', name: 'Imp Scorch', rarity: 'common', faction: 'demon', element: 'fire', baseAttack: 450, baseDefense: 280, baseHealth: 5000, baseSpeed: 100, critRate: 0.12, critDamage: 1.4, skill1Name: 'Fireball', skill1Desc: 'Deals 160% ATK damage', skill2Name: 'Mischievous Dodge', skill2Desc: '20% chance to dodge attacks for 2 turns', skill3Name: '', skill3Desc: '', lore: 'A small but annoying fire demon.' },
  { id: 'demon_04', name: 'Hellhound Cerberus', rarity: 'rare', faction: 'demon', element: 'fire', baseAttack: 920, baseDefense: 680, baseHealth: 13000, baseSpeed: 95, critRate: 0.15, critDamage: 1.5, skill1Name: 'Triple Bite', skill1Desc: 'Attacks 3 times for 100% ATK each', skill2Name: 'Hellfire Breath', skill2Desc: 'Deals 170% ATK to all enemies with burn', skill3Name: 'Unholy Howl', skill3Desc: 'Increases team ATK by 25% for 2 turns', lore: 'A three-headed beast from the depths of hell.' },
  { id: 'demon_05', name: 'Corruptor Vex', rarity: 'uncommon', faction: 'demon', element: 'void', baseAttack: 650, baseDefense: 480, baseHealth: 8500, baseSpeed: 93, critRate: 0.14, critDamage: 1.45, skill1Name: 'Corrupt Touch', skill1Desc: 'Deals 170% ATK and reduces target DEF', skill2Name: 'Shadow Step', skill2Desc: 'Attacks with 180% ATK with 30% bonus crit', skill3Name: '', skill3Desc: '', lore: 'A demon that corrupts everything it touches.' },

  // ELVES
  { id: 'elf_01', name: 'Queen Arwenya', rarity: 'legendary', faction: 'elf', element: 'earth', baseAttack: 1350, baseDefense: 850, baseHealth: 15500, baseSpeed: 115, critRate: 0.22, critDamage: 1.65, skill1Name: 'Natures Wrath', skill1Desc: 'Deals 260% ATK damage and heals lowest HP ally', skill2Name: 'Forest Blessing', skill2Desc: 'Heals all allies by 30% HP and cleanses debuffs', skill3Name: 'Elven Fury', skill3Desc: 'Deals 280% ATK to all enemies and reduces their ATK', lore: 'The immortal queen of the Elven Court, wielder of nature magic.' },
  { id: 'elf_02', name: 'Ranger Sylvana', rarity: 'rare', faction: 'elf', element: 'earth', baseAttack: 950, baseDefense: 520, baseHealth: 9500, baseSpeed: 112, critRate: 0.20, critDamage: 1.55, skill1Name: 'Precise Shot', skill1Desc: 'Deals 220% ATK damage with guaranteed hit', skill2Name: 'Volley', skill2Desc: 'Attacks all enemies for 150% ATK', skill3Name: 'Eagle Eye', skill3Desc: 'Increases crit rate by 30% for 2 turns', lore: 'An elite elven archer with unerring aim.' },
  { id: 'elf_03', name: 'Elfling Piper', rarity: 'common', faction: 'elf', element: 'water', baseAttack: 400, baseDefense: 320, baseHealth: 5200, baseSpeed: 98, critRate: 0.10, critDamage: 1.4, skill1Name: 'Water Arrow', skill1Desc: 'Deals 150% ATK damage', skill2Name: 'Soothing Song', skill2Desc: 'Heals ally by 15% HP', skill3Name: '', skill3Desc: '', lore: 'A young elf who uses music and water magic.' },
  { id: 'elf_04', name: 'Archmage Elowen', rarity: 'epic', faction: 'elf', element: 'light', baseAttack: 1250, baseDefense: 580, baseHealth: 10500, baseSpeed: 105, critRate: 0.18, critDamage: 1.6, skill1Name: 'Arcane Bolt', skill1Desc: 'Deals 240% ATK damage', skill2Name: 'Mana Shield', skill2Desc: 'Grants shield to all allies equal to 25% max HP', skill3Name: 'Starfall', skill3Desc: 'Deals 200% ATK to all enemies with 40% stun', lore: 'A powerful elven mage who channels starlight.' },
  { id: 'elf_05', name: 'Druid Thalion', rarity: 'uncommon', faction: 'elf', element: 'earth', baseAttack: 560, baseDefense: 500, baseHealth: 9000, baseSpeed: 88, critRate: 0.10, critDamage: 1.4, skill1Name: 'Root Strike', skill1Desc: 'Deals 160% ATK and slows target', skill2Name: 'Natures Touch', skill2Desc: 'Heals ally by 20% HP', skill3Name: '', skill3Desc: '', lore: 'A forest druid who speaks to the trees.' },

  // BARBARIANS
  { id: 'barbarian_01', name: 'Warchief Krong', rarity: 'legendary', faction: 'barbarian', element: 'fire', baseAttack: 1600, baseDefense: 950, baseHealth: 19000, baseSpeed: 95, critRate: 0.20, critDamage: 1.75, skill1Name: 'Skull Crusher', skill1Desc: 'Deals 300% ATK damage with 50% DEF ignore', skill2Name: 'War Cry', skill2Desc: 'Increases team ATK by 40% and Speed by 20%', skill3Name: 'Berserker Rage', skill3Desc: 'Deals 350% ATK and gains extra turn if kill', lore: 'The fearsome warchief who united the barbarian tribes.' },
  { id: 'barbarian_02', name: 'Berserker Ursa', rarity: 'rare', faction: 'barbarian', element: 'earth', baseAttack: 980, baseDefense: 650, baseHealth: 13500, baseSpeed: 88, critRate: 0.18, critDamage: 1.55, skill1Name: 'Furious Smash', skill1Desc: 'Deals 210% ATK damage', skill2Name: 'Blood Rage', skill2Desc: 'Increases ATK by 35% but reduces DEF by 15%', skill3Name: 'Earthquake', skill3Desc: 'Deals 180% ATK to all enemies', lore: 'A berserker who grows stronger with each wound.' },
  { id: 'barbarian_03', name: 'Tribal Scout', rarity: 'common', faction: 'barbarian', element: 'earth', baseAttack: 430, baseDefense: 380, baseHealth: 6500, baseSpeed: 95, critRate: 0.12, critDamage: 1.4, skill1Name: 'Spear Thrust', skill1Desc: 'Deals 155% ATK damage', skill2Name: 'Track', skill2Desc: 'Increases team speed by 15% for 2 turns', skill3Name: '', skill3Desc: '', lore: 'A swift scout who knows every trail.' },
  { id: 'barbarian_04', name: 'Shaman Zula', rarity: 'epic', faction: 'barbarian', element: 'water', baseAttack: 1000, baseDefense: 700, baseHealth: 14000, baseSpeed: 92, critRate: 0.15, critDamage: 1.5, skill1Name: 'Spirit Strike', skill1Desc: 'Deals 200% ATK damage', skill2Name: 'Healing Rain', skill2Desc: 'Heals all allies by 25% HP', skill3Name: 'Ancestral Ward', skill3Desc: 'Grants all allies immunity to debuffs for 1 turn', lore: 'A powerful shaman who communes with ancestral spirits.' },
  { id: 'barbarian_05', name: 'Axe Thrower Grok', rarity: 'uncommon', faction: 'barbarian', element: 'fire', baseAttack: 670, baseDefense: 420, baseHealth: 7800, baseSpeed: 90, critRate: 0.14, critDamage: 1.45, skill1Name: 'Throwing Axe', skill1Desc: 'Deals 175% ATK damage', skill2Name: 'Double Throw', skill2Desc: 'Attacks twice for 120% ATK each', skill3Name: '', skill3Desc: '', lore: 'A barbarian with deadly axe-throwing precision.' },

  // DARK ELVES
  { id: 'darkelf_01', name: 'Shadow Queen Nyx', rarity: 'mythic', faction: 'darkelf', element: 'dark', baseAttack: 1700, baseDefense: 800, baseHealth: 17500, baseSpeed: 125, critRate: 0.28, critDamage: 1.85, skill1Name: 'Shadow Strike', skill1Desc: 'Deals 350% ATK with guaranteed crit and DEF ignore', skill2Name: 'Veil of Darkness', skill2Desc: 'Becomes untargetable and gains extra turn', skill3Name: 'Eclipse', skill3Desc: 'Deals 380% ATK to all enemies, steals 30% of their ATK', lore: 'The mythical Shadow Queen, ruler of the Dark Elves. Her power is absolute.' },
  { id: 'darkelf_02', name: 'Assassin Vexil', rarity: 'rare', faction: 'darkelf', element: 'dark', baseAttack: 920, baseDefense: 480, baseHealth: 9000, baseSpeed: 118, critRate: 0.22, critDamage: 1.6, skill1Name: 'Backstab', skill1Desc: 'Deals 240% ATK with bonus crit damage', skill2Name: 'Vanish', skill2Desc: 'Becomes invisible for 1 turn, next attack deals +50%', skill3Name: 'Death Mark', skill3Desc: 'Marks target for death, takes 30% more damage for 2 turns', lore: 'A deadly assassin who strikes from the shadows.' },
  { id: 'darkelf_03', name: 'Dark Initiate', rarity: 'common', faction: 'darkelf', element: 'dark', baseAttack: 440, baseDefense: 350, baseHealth: 5800, baseSpeed: 96, critRate: 0.12, critDamage: 1.4, skill1Name: 'Dark Bolt', skill1Desc: 'Deals 155% ATK damage', skill2Name: 'Shadow Step', skill2Desc: 'Increases speed by 20% for 2 turns', skill3Name: '', skill3Desc: '', lore: 'A novice in the dark arts.' },
  { id: 'darkelf_04', name: 'Warlock Zaros', rarity: 'epic', faction: 'darkelf', element: 'void', baseAttack: 1180, baseDefense: 600, baseHealth: 11500, baseSpeed: 102, critRate: 0.18, critDamage: 1.6, skill1Name: 'Chaos Bolt', skill1Desc: 'Deals 230% ATK damage with random debuff', skill2Name: 'Curse of Weakness', skill2Desc: 'Reduces all enemy ATK by 30% for 2 turns', skill3Name: 'Void Rift', skill3Desc: 'Deals 200% ATK to all enemies and applies 2 random debuffs', lore: 'A master of chaos magic and forbidden rituals.' },
  { id: 'darkelf_05', name: 'Nightblade Sira', rarity: 'uncommon', faction: 'darkelf', element: 'water', baseAttack: 640, baseDefense: 450, baseHealth: 7200, baseSpeed: 110, critRate: 0.16, critDamage: 1.5, skill1Name: 'Frost Dagger', skill1Desc: 'Deals 165% ATK and slows target', skill2Name: 'Ice Clone', skill2Desc: 'Creates a clone that absorbs one hit', skill3Name: '', skill3Desc: '', lore: 'A swift assassin who uses ice magic.' },

  // Additional LEGENDARY and MYTHIC
  { id: 'special_01', name: 'Dragon Lord Ignis', rarity: 'mythic', faction: 'demon', element: 'fire', baseAttack: 1750, baseDefense: 1100, baseHealth: 22000, baseSpeed: 105, critRate: 0.24, critDamage: 1.8, skill1Name: 'Dragon Breath', skill1Desc: 'Deals 300% ATK to all enemies with burn', skill2Name: 'Dragon Scales', skill2Desc: 'Increases DEF by 80% and reflects 30% damage', skill3Name: 'Inferno Cataclysm', skill3Desc: 'Deals 450% ATK to target, 200% to all others', lore: 'An ancient dragon lord who takes human form. The rarest of all champions.' },
  { id: 'special_02', name: 'Valkyrie Astrid', rarity: 'legendary', faction: 'knight', element: 'light', baseAttack: 1400, baseDefense: 1000, baseHealth: 17000, baseSpeed: 110, critRate: 0.22, critDamage: 1.65, skill1Name: 'Heavenly Strike', skill1Desc: 'Deals 270% ATK with holy damage', skill2Name: 'Valkyrie Blessing', skill2Desc: 'Revives fallen ally with 50% HP and grants immunity', skill3Name: 'Wrath of Valhalla', skill3Desc: 'Deals 250% ATK to all enemies, heals team by 20%', lore: 'A divine warrior maiden chosen by the gods.' },
  { id: 'special_03', name: 'Lich King Mordeus', rarity: 'legendary', faction: 'undead', element: 'void', baseAttack: 1380, baseDefense: 950, baseHealth: 16000, baseSpeed: 100, critRate: 0.20, critDamage: 1.7, skill1Name: 'Soul Harvest', skill1Desc: 'Deals 260% ATK and gains extra turn on kill', skill2Name: 'Army of the Dead', skill2Desc: 'Summons skeleton minions that attack all enemies', skill3Name: 'Eternal Torment', skill3Desc: 'Deals 200% ATK to all, poisons for 5 turns, freezes for 1', lore: 'The supreme ruler of the undead, an eternal lich of immense power.' },
  { id: 'special_04', name: 'World Tree Yggdra', rarity: 'legendary', faction: 'elf', element: 'earth', baseAttack: 1100, baseDefense: 1200, baseHealth: 25000, baseSpeed: 85, critRate: 0.12, critDamage: 1.5, skill1Name: 'Root Bind', skill1Desc: 'Deals 180% ATK and freezes target for 1 turn', skill2Name: 'Natures Embrace', skill2Desc: 'Heals all allies by 40% HP and grants regen', skill3Name: 'World Tree Awakening', skill3Desc: 'Heals team to full HP, grants shield equal to 30% max HP', lore: 'The ancient spirit of the World Tree, guardian of all life.' },
  { id: 'special_05', name: 'Void Emperor Zarkon', rarity: 'mythic', faction: 'darkelf', element: 'void', baseAttack: 1650, baseDefense: 950, baseHealth: 18500, baseSpeed: 118, critRate: 0.26, critDamage: 1.8, skill1Name: 'Void Crush', skill1Desc: 'Deals 330% ATK ignoring all shields and DEF', skill2Name: 'Dimensional Rift', skill2Desc: 'Removes all buffs from enemies and transfers to allies', skill3Name: 'Oblivion', skill3Desc: 'Instantly kills one enemy below 30% HP, deals 250% to others', lore: 'The Void Emperor, a being from beyond reality. His power defies all laws.' },
];

export const CAMPAIGN_STAGES: CampaignStage[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: i < 10 ? `Chapter ${Math.floor(i / 5) + 1} - ${['The Dark Forest', 'Cursed Ruins', 'Goblin Camp', 'Haunted Graveyard', 'Ancient Temple'][i % 5]}`
    : i < 20 ? `Chapter ${Math.floor(i / 5) + 1} - ${['Demon Gateway', 'Fire Pits', 'Shadow Keep', 'Burning Citadel', 'Infernal Throne'][i % 5]}`
    : i < 30 ? `Chapter ${Math.floor(i / 5) + 1} - ${['Elven Glade', 'Crystal Lake', 'Moonlit Spire', 'Starfall Peak', 'Eternal Garden'][i % 5]}`
    : i < 40 ? `Chapter ${Math.floor(i / 5) + 1} - ${['Frozen Wastes', 'Blood Plains', 'War Camp', 'Skull Ridge', 'Chieftain Hall'][i % 5]}`
    : `Chapter ${Math.floor(i / 5) + 1} - ${['Shadow Realm', 'Void Nexus', 'Dark Portal', 'Chaos Heart', 'Final Throne'][i % 5]}`,
  description: `Defeat the enemies in stage ${i + 1}`,
  enemyLevel: Math.floor((i + 1) * 2.5),
  enemyFaction: (['undead', 'demon', 'elf', 'barbarian', 'darkelf', 'knight'] as Faction[])[i % 6],
  energyCost: 5 + Math.floor(i / 10),
  rewards: {
    gold: 100 + i * 50,
    experience: 50 + i * 25,
    gems: i % 5 === 4 ? 10 + Math.floor(i / 5) * 5 : 5,
  },
  bossName: ['Wraith Lord', 'Infernal Duke', 'Elven Outcast', 'War Mammoth', 'Shadow Sage', 'Dark Paladin'][i % 6],
  bossRarity: (['rare', 'epic', 'legendary'] as Rarity[])[Math.min(Math.floor(i / 15), 2)],
}));

export const SHOP_ITEMS: ShopItem[] = [
  // Gem packs (premium currency)
  { id: 'gems_small', name: 'Pouch of Gems', description: 'A small pouch containing 100 precious gems', price: 0, currency: 'usd', type: 'gems', amount: 100, icon: '💎', limited: false, limitedCount: 0, featured: false },
  { id: 'gems_medium', name: 'Chest of Gems', description: 'A treasure chest with 600 gems + 50 bonus!', price: 0, currency: 'usd', type: 'gems', amount: 650, icon: '💎', limited: false, limitedCount: 0, featured: true, originalPrice: 0, discount: 20 },
  { id: 'gems_large', name: 'Vault of Gems', description: 'A massive vault containing 1,500 gems + 300 bonus!', price: 0, currency: 'usd', type: 'gems', amount: 1800, icon: '💎', limited: false, limitedCount: 0, featured: true, originalPrice: 0, discount: 35 },
  { id: 'gems_mega', name: 'Dragon Hoard', description: 'Legendary dragon hoard: 5,000 gems + 2,000 bonus!', price: 0, currency: 'usd', type: 'gems', amount: 7000, icon: '🐉', limited: false, limitedCount: 0, featured: true, originalPrice: 0, discount: 45 },

  // Daily deals
  { id: 'daily_gems_1', name: 'Daily Gem Pack', description: '150 gems at a special daily price', price: 150, currency: 'gems', type: 'gems', amount: 150, icon: '💎', limited: true, limitedCount: 1 },
  { id: 'daily_energy', name: 'Energy Refill', description: 'Fully refills your energy', price: 50, currency: 'gems', type: 'energy', amount: 100, icon: '⚡', limited: true, limitedCount: 3 },
  { id: 'daily_gold', name: 'Gold Sack', description: '10,000 gold coins', price: 100, currency: 'gems', type: 'gold', amount: 10000, icon: '🪙', limited: true, limitedCount: 2 },

  // Summoning
  { id: 'scroll_basic', name: 'Mystic Scroll', description: 'Summon 1 champion (Rare or above guaranteed)', price: 150, currency: 'gems', type: 'scroll', amount: 1, icon: '📜', limited: false, limitedCount: 0 },
  { id: 'scroll_10', name: '10x Mystic Scroll', description: 'Summon 10 champions (Epic guaranteed!)', price: 1200, currency: 'gems', type: 'scroll', amount: 10, icon: '📜', limited: false, limitedCount: 0, originalPrice: 1500, discount: 20 },
  { id: 'scroll_ancient', name: 'Ancient Scroll', description: 'Summon 1 Legendary or Mythic champion!', price: 3000, currency: 'gems', type: 'scroll', amount: 1, icon: '📜', limited: true, limitedCount: 1, featured: true },

  // Special offers
  { id: 'starter_pack', name: 'Starter Pack', description: '1,000 gems + 1 Epic Hero + 50,000 Gold', price: 0, currency: 'usd', type: 'gems', amount: 1000, icon: '🎁', limited: true, limitedCount: 1, featured: true },
  { id: 'vip_pack', name: 'VIP Pack', description: '500 VIP Points + 2,000 Gems', price: 0, currency: 'usd', type: 'vip_points', amount: 500, icon: '👑', limited: true, limitedCount: 1, featured: true },

  // Gold shop
  { id: 'gold_exp_small', name: 'XP Brew (Small)', description: 'Grants 5,000 hero XP', price: 2000, currency: 'gold', type: 'hero_shard', amount: 5000, icon: '🧪', limited: false, limitedCount: 0 },
  { id: 'gold_exp_large', name: 'XP Brew (Large)', description: 'Grants 25,000 hero XP', price: 8000, currency: 'gold', type: 'hero_shard', amount: 25000, icon: '🧪', limited: false, limitedCount: 0 },
];

export const DAILY_REWARDS = [
  { day: 1, gold: 500, gems: 10, item: '1x Mystic Scroll' },
  { day: 2, gold: 1000, gems: 15, item: '5,000 XP Brew' },
  { day: 3, gold: 1500, gems: 20, item: 'Energy Refill' },
  { day: 4, gold: 2000, gems: 25, item: '1x Ancient Shard' },
  { day: 5, gold: 3000, gems: 30, item: '1x Rare Hero' },
  { day: 6, gold: 4000, gems: 40, item: '1x Epic Hero' },
  { day: 7, gold: 5000, gems: 100, item: '1x Legendary Hero' },
];

export function getHeroStats(hero: HeroTemplate, level: number, stars: number): { attack: number; defense: number; health: number; speed: number } {
  const levelMultiplier = 1 + (level - 1) * 0.08;
  const starMultiplier = 1 + (stars - 1) * 0.15;
  return {
    attack: Math.floor(hero.baseAttack * levelMultiplier * starMultiplier),
    defense: Math.floor(hero.baseDefense * levelMultiplier * starMultiplier),
    health: Math.floor(hero.baseHealth * levelMultiplier * starMultiplier),
    speed: Math.floor(hero.baseSpeed * (1 + (stars - 1) * 0.05)),
  };
}

export function getExperienceForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getSummonResult(vipLevel: number): HeroTemplate {
  const vipBonus = vipLevel * 0.01;
  const roll = Math.random();

  const rates = {
    mythic: 0.005 + vipBonus * 0.5,
    legendary: 0.035 + vipBonus,
    epic: 0.08 + vipBonus * 1.5,
    rare: 0.18 + vipBonus * 2,
    uncommon: 0.25,
    common: 0,
  };
  rates.common = 1 - rates.mythic - rates.legendary - rates.epic - rates.rare - rates.uncommon;

  let rarity: Rarity;
  if (roll < rates.mythic) rarity = 'mythic';
  else if (roll < rates.mythic + rates.legendary) rarity = 'legendary';
  else if (roll < rates.mythic + rates.legendary + rates.epic) rarity = 'epic';
  else if (roll < rates.mythic + rates.legendary + rates.epic + rates.rare) rarity = 'rare';
  else if (roll < rates.mythic + rates.legendary + rates.epic + rates.rare + rates.uncommon) rarity = 'uncommon';
  else rarity = 'common';

  const eligibleHeroes = HERO_TEMPLATES.filter(h => h.rarity === rarity);
  return eligibleHeroes[Math.floor(Math.random() * eligibleHeroes.length)];
}

export function createHeroInstance(template: HeroTemplate, stars?: number): HeroInstance {
  const heroStars = stars || RARITY_CONFIG[template.rarity].stars;
  const stats = getHeroStats(template, 1, heroStars);
  return {
    id: `${template.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    templateId: template.id,
    name: template.name,
    rarity: template.rarity,
    faction: template.faction,
    element: template.element,
    level: 1,
    experience: 0,
    attack: stats.attack,
    defense: stats.defense,
    health: stats.health,
    speed: stats.speed,
    critRate: template.critRate,
    critDamage: template.critDamage,
    skill1Name: template.skill1Name,
    skill1Desc: template.skill1Desc,
    skill2Name: template.skill2Name,
    skill2Desc: template.skill2Desc,
    skill3Name: template.skill3Name,
    skill3Desc: template.skill3Desc,
    stars: heroStars,
    ascended: false,
    awakened: false,
    awakeningLevel: 0,
    inTeam: false,
  };
}

export function createBattleHero(hero: HeroInstance): BattleHero {
  return {
    ...hero,
    currentHealth: hero.health,
    maxHealth: hero.health,
    isAlive: true,
    turnMeter: 0,
  };
}

export function generateEnemyTeam(stage: number, faction: Faction): BattleHero[] {
  const enemyLevel = Math.max(1, Math.floor(stage * 1.5));
  const templates = HERO_TEMPLATES.filter(h => h.faction === faction);
  const count = Math.min(3 + Math.floor(stage / 15), 5);

  return Array.from({ length: count }, (_, i) => {
    const template = templates[i % templates.length];
    // Scale enemy rarity with stage - easier early game
    let rarity: Rarity;
    if (i === 0) {
      // Boss
      rarity = stage > 25 ? 'epic' : stage > 10 ? 'rare' : 'uncommon';
    } else {
      // Minions
      rarity = stage > 30 ? 'rare' : stage > 15 ? 'uncommon' : 'common';
    }
    const actualTemplate = templates.find(t => t.rarity === rarity) || template;
    const stars = RARITY_CONFIG[actualTemplate.rarity].stars;
    const stats = getHeroStats(actualTemplate, enemyLevel, stars);
    const heroInstance: HeroInstance = {
      id: `enemy_${i}_${Date.now()}`,
      templateId: actualTemplate.id,
      name: actualTemplate.name,
      rarity: actualTemplate.rarity,
      faction: actualTemplate.faction,
      element: actualTemplate.element,
      level: enemyLevel,
      experience: 0,
      attack: stats.attack,
      defense: stats.defense,
      health: stats.health,
      speed: stats.speed,
      critRate: actualTemplate.critRate,
      critDamage: actualTemplate.critDamage,
      skill1Name: actualTemplate.skill1Name,
      skill1Desc: actualTemplate.skill1Desc,
      skill2Name: actualTemplate.skill2Name,
      skill2Desc: actualTemplate.skill2Desc,
      skill3Name: actualTemplate.skill3Name,
      skill3Desc: actualTemplate.skill3Desc,
      stars,
      ascended: false,
      inTeam: false,
    };
    return createBattleHero(heroInstance);
  });
}

// ============= EQUIPMENT SYSTEM =============

export type EquipmentSlot = 'weapon' | 'armor' | 'helmet' | 'boots' | 'ring' | 'amulet';

export interface EquipmentTemplate {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: Rarity;
  icon: string;
  attackBonus?: number;
  defenseBonus?: number;
  healthBonus?: number;
  speedBonus?: number;
  critRateBonus?: number;
  critDamageBonus?: number;
  description: string;
  setBonus?: string;
  setId?: string;
}

export const EQUIPMENT_TEMPLATES: EquipmentTemplate[] = [
  // Common
  { id: 'wpn_c1', name: 'Rusty Sword', slot: 'weapon', rarity: 'common', icon: '🗡️', attackBonus: 50, description: 'A worn but reliable blade.' },
  { id: 'arm_c1', name: 'Leather Tunic', slot: 'armor', rarity: 'common', icon: '🥋', defenseBonus: 40, healthBonus: 300, description: 'Simple leather protection.' },
  { id: 'helm_c1', name: 'Iron Cap', slot: 'helmet', rarity: 'common', icon: '⛑️', defenseBonus: 25, healthBonus: 200, description: 'Basic head protection.' },
  { id: 'boot_c1', name: 'Worn Boots', slot: 'boots', rarity: 'common', icon: '🥾', speedBonus: 8, description: 'Travel-worn footwear.' },
  // Uncommon
  { id: 'wpn_u1', name: 'Steel Longsword', slot: 'weapon', rarity: 'uncommon', icon: '⚔️', attackBonus: 120, critRateBonus: 0.03, description: 'A well-forged steel blade.' },
  { id: 'arm_u1', name: 'Chainmail Armor', slot: 'armor', rarity: 'uncommon', icon: '🦺', defenseBonus: 90, healthBonus: 700, description: 'Interlocking iron rings.' },
  { id: 'helm_u1', name: 'Knight Helm', slot: 'helmet', rarity: 'uncommon', icon: '🪖', defenseBonus: 60, healthBonus: 500, description: 'A knight\'s proud helm.' },
  { id: 'boot_u1', name: 'Swift Boots', slot: 'boots', rarity: 'uncommon', icon: '👟', speedBonus: 18, description: 'Boots enchanted with haste.' },
  { id: 'ring_u1', name: 'Copper Ring', slot: 'ring', rarity: 'uncommon', icon: '💍', attackBonus: 60, critDamageBonus: 0.1, description: 'A simple magical ring.' },
  // Rare
  { id: 'wpn_r1', name: 'Flame Tongue', slot: 'weapon', rarity: 'rare', icon: '🔥', attackBonus: 250, critRateBonus: 0.05, description: 'A blade wreathed in eternal flame.', setId: 'inferno' },
  { id: 'arm_r1', name: 'Magma Plate', slot: 'armor', rarity: 'rare', icon: '🌋', defenseBonus: 180, healthBonus: 1500, description: 'Forged from cooled magma.', setId: 'inferno' },
  { id: 'helm_r1', name: 'Dragon Skull Helm', slot: 'helmet', rarity: 'rare', icon: '🐉', defenseBonus: 120, healthBonus: 1000, description: 'Helm carved from a dragon\'s skull.' },
  { id: 'boot_r1', name: 'Wind Walker Boots', slot: 'boots', rarity: 'rare', icon: '🌪️', speedBonus: 35, description: 'Boots that harness the wind.' },
  { id: 'ring_r1', name: 'Ring of Valor', slot: 'ring', rarity: 'rare', icon: '💍', attackBonus: 150, defenseBonus: 80, description: 'Grants courage in battle.' },
  { id: 'amul_r1', name: 'Amulet of Warding', slot: 'amulet', rarity: 'rare', icon: '📿', healthBonus: 2000, defenseBonus: 100, description: 'Protects the wearer from harm.' },
  // Epic
  { id: 'wpn_e1', name: 'Soulreaper Scythe', slot: 'weapon', rarity: 'epic', icon: '☠️', attackBonus: 450, critRateBonus: 0.08, critDamageBonus: 0.2, description: 'Harvests the souls of the fallen.', setId: 'soul' },
  { id: 'arm_e1', name: 'Soulbound Armor', slot: 'armor', rarity: 'epic', icon: '👻', defenseBonus: 320, healthBonus: 2800, description: 'Armor bound to your very soul.', setId: 'soul' },
  { id: 'helm_e1', name: 'Crown of Thorns', slot: 'helmet', rarity: 'epic', icon: '👑', defenseBonus: 200, healthBonus: 1800, attackBonus: 100, description: 'A painful but powerful crown.' },
  { id: 'boot_e1', name: 'Boots of Leaping', slot: 'boots', rarity: 'epic', icon: '🦘', speedBonus: 60, attackBonus: 80, description: 'Allows impossible leaps.' },
  { id: 'ring_e1', name: 'Bloodstone Ring', slot: 'ring', rarity: 'epic', icon: '💍', attackBonus: 300, critDamageBonus: 0.3, description: 'Pulses with dark power.' },
  { id: 'amul_e1', name: 'Phoenix Amulet', slot: 'amulet', rarity: 'epic', icon: '📿', healthBonus: 4000, defenseBonus: 200, description: 'Grants a second chance at life.' },
  // Legendary
  { id: 'wpn_l1', name: 'Excalibur', slot: 'weapon', rarity: 'legendary', icon: '⚔️', attackBonus: 800, critRateBonus: 0.12, critDamageBonus: 0.4, description: 'The legendary sword of kings.', setId: 'king' },
  { id: 'arm_l1', name: 'Aegis Plate', slot: 'armor', rarity: 'legendary', icon: '🛡️', defenseBonus: 600, healthBonus: 5000, description: 'The shield of the gods.', setId: 'king' },
  { id: 'helm_l1', name: 'Crown of Light', slot: 'helmet', rarity: 'legendary', icon: '👑', defenseBonus: 400, healthBonus: 3500, attackBonus: 200, description: 'Radiates divine power.', setId: 'king' },
  { id: 'boot_l1', name: 'Hermes Sandals', slot: 'boots', rarity: 'legendary', icon: '👡', speedBonus: 100, attackBonus: 150, description: 'Grants godlike speed.' },
  { id: 'ring_l1', name: 'Ring of Infinity', slot: 'ring', rarity: 'legendary', icon: '💍', attackBonus: 500, critRateBonus: 0.1, critDamageBonus: 0.5, description: 'Contains infinite power.' },
  { id: 'amul_l1', name: 'Amulet of Eternity', slot: 'amulet', rarity: 'legendary', icon: '📿', healthBonus: 8000, defenseBonus: 400, speedBonus: 30, description: 'Time itself bends to its will.' },
  // Mythic
  { id: 'wpn_m1', name: 'Worldender', slot: 'weapon', rarity: 'mythic', icon: '🌟', attackBonus: 1500, critRateBonus: 0.15, critDamageBonus: 0.6, description: 'A blade capable of ending worlds.', setId: 'apocalypse' },
  { id: 'arm_m1', name: 'Godslayer Armor', slot: 'armor', rarity: 'mythic', icon: '🌌', defenseBonus: 1000, healthBonus: 10000, description: 'Forged to slay divine beings.', setId: 'apocalypse' },
  { id: 'amul_m1', name: 'Heart of the Cosmos', slot: 'amulet', rarity: 'mythic', icon: '💠', healthBonus: 15000, attackBonus: 500, defenseBonus: 600, speedBonus: 50, description: 'The heart of a dying universe.' },
];

export const SET_BONUSES: Record<string, { name: string; pieces: number; bonus: string; stat?: Partial<Pick<EquipmentTemplate, 'attackBonus' | 'defenseBonus' | 'healthBonus' | 'speedBonus' | 'critRateBonus' | 'critDamageBonus'>> }> = {
  inferno: { name: 'Inferno Set', pieces: 2, bonus: '+15% Attack', stat: { attackBonus: 200 } },
  soul: { name: 'Soul Bound Set', pieces: 2, bonus: '+20% Health, Lifesteal', stat: { healthBonus: 2000 } },
  king: { name: 'Kings Set', pieces: 3, bonus: '+25% All Stats', stat: { attackBonus: 500, defenseBonus: 300, healthBonus: 3000 } },
  apocalypse: { name: 'Apocalypse Set', pieces: 2, bonus: '+50% Attack, +30% Crit Damage', stat: { attackBonus: 1000, critDamageBonus: 0.3 } },
};

// ============= ACHIEVEMENTS SYSTEM =============

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'progression' | 'collection' | 'combat' | 'social' | 'special';
  requirement: number;
  reward: { gold?: number; gems?: number; vipPoints?: number };
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export const ACHIEVEMENTS: Achievement[] = [
  // Progression
  { id: 'first_battle', name: 'First Blood', description: 'Complete your first battle', icon: '⚔️', category: 'progression', requirement: 1, reward: { gold: 500, gems: 10 }, tier: 'bronze' },
  { id: 'battles_10', name: 'Veteran Warrior', description: 'Complete 10 battles', icon: '⚔️', category: 'progression', requirement: 10, reward: { gold: 2000, gems: 25 }, tier: 'bronze' },
  { id: 'battles_50', name: 'Battle Master', description: 'Complete 50 battles', icon: '⚔️', category: 'progression', requirement: 50, reward: { gold: 10000, gems: 100 }, tier: 'silver' },
  { id: 'battles_100', name: 'Warlord', description: 'Complete 100 battles', icon: '⚔️', category: 'progression', requirement: 100, reward: { gold: 50000, gems: 500 }, tier: 'gold' },
  { id: 'stage_10', name: 'Explorer', description: 'Reach campaign stage 10', icon: '🗺️', category: 'progression', requirement: 10, reward: { gold: 3000, gems: 30 }, tier: 'bronze' },
  { id: 'stage_25', name: 'Adventurer', description: 'Reach campaign stage 25', icon: '🗺️', category: 'progression', requirement: 25, reward: { gold: 15000, gems: 150 }, tier: 'silver' },
  { id: 'stage_50', name: 'Conqueror', description: 'Complete all 50 campaign stages', icon: '🗺️', category: 'progression', requirement: 50, reward: { gold: 100000, gems: 1000 }, tier: 'gold' },

  // Collection
  { id: 'heroes_5', name: 'Recruiter', description: 'Own 5 heroes', icon: '👥', category: 'collection', requirement: 5, reward: { gold: 1000, gems: 20 }, tier: 'bronze' },
  { id: 'heroes_15', name: 'Commander', description: 'Own 15 heroes', icon: '👥', category: 'collection', requirement: 15, reward: { gold: 5000, gems: 75 }, tier: 'silver' },
  { id: 'heroes_30', name: 'Collector', description: 'Own 30 heroes', icon: '👥', category: 'collection', requirement: 30, reward: { gold: 20000, gems: 200 }, tier: 'gold' },
  { id: 'heroes_all', name: 'Completionist', description: 'Collect all hero templates', icon: '🏆', category: 'collection', requirement: 30, reward: { gold: 500000, gems: 5000, vipPoints: 1000 }, tier: 'platinum' },
  { id: 'legendary_pull', name: 'Lucky Summon', description: 'Summon a Legendary hero', icon: '✨', category: 'collection', requirement: 1, reward: { gems: 50 }, tier: 'silver' },
  { id: 'mythic_pull', name: 'Mythic Fortune', description: 'Summon a Mythic hero', icon: '🌟', category: 'collection', requirement: 1, reward: { gems: 500, vipPoints: 100 }, tier: 'gold' },

  // Combat
  { id: 'crit_2000', name: 'Critical Strike', description: 'Deal 2000+ damage in one hit', icon: '💥', category: 'combat', requirement: 2000, reward: { gold: 2000, gems: 25 }, tier: 'silver' },
  { id: 'crit_5000', name: 'Devastating Blow', description: 'Deal 5000+ damage in one hit', icon: '💥', category: 'combat', requirement: 5000, reward: { gold: 10000, gems: 100 }, tier: 'gold' },
  { id: 'flawless_victory', name: 'Flawless Victory', description: 'Win a battle without losing any heroes', icon: '🎯', category: 'combat', requirement: 1, reward: { gold: 3000, gems: 50 }, tier: 'silver' },
  { id: 'speedrun', name: 'Speed Demon', description: 'Win a battle in under 3 turns', icon: '⚡', category: 'combat', requirement: 1, reward: { gold: 2000, gems: 30 }, tier: 'silver' },

  // Special
  { id: 'vip_1', name: 'VIP Supporter', description: 'Reach VIP Level 1', icon: '👑', category: 'special', requirement: 1, reward: { gems: 100 }, tier: 'bronze' },
  { id: 'vip_3', name: 'VIP Elite', description: 'Reach VIP Level 3', icon: '👑', category: 'special', requirement: 3, reward: { gems: 500 }, tier: 'silver' },
  { id: 'vip_5', name: 'VIP Legend', description: 'Reach VIP Level 5', icon: '👑', category: 'special', requirement: 5, reward: { gems: 2000 }, tier: 'gold' },
  { id: 'vip_7', name: 'VIP God', description: 'Reach maximum VIP Level 7', icon: '👑', category: 'special', requirement: 7, reward: { gems: 10000, vipPoints: 5000 }, tier: 'platinum' },
  { id: 'rich_100k', name: 'Treasure Hunter', description: 'Accumulate 100,000 gold', icon: '💰', category: 'special', requirement: 100000, reward: { gems: 100 }, tier: 'silver' },
  { id: 'rich_1m', name: 'Gold Tycoon', description: 'Accumulate 1,000,000 gold', icon: '💰', category: 'special', requirement: 1000000, reward: { gems: 1000 }, tier: 'gold' },
];

// ============= LEADERBOARD (NPC) =============

export interface LeaderboardEntry {
  rank: number;
  name: string;
  level: number;
  power: number;
  vipLevel: number;
  isPlayer?: boolean;
}

export const NPC_LEADERBOARD: Omit<LeaderboardEntry, 'isPlayer'>[] = [
  { rank: 1, name: 'DragonSlayer99', level: 60, power: 1850000, vipLevel: 7 },
  { rank: 2, name: 'ShadowKing', level: 58, power: 1720000, vipLevel: 7 },
  { rank: 3, name: 'MythicLord', level: 57, power: 1650000, vipLevel: 6 },
  { rank: 4, name: 'VoidWalker', level: 55, power: 1480000, vipLevel: 6 },
  { rank: 5, name: 'ChaosBringer', level: 54, power: 1350000, vipLevel: 5 },
  { rank: 6, name: 'PaladinPrime', level: 52, power: 1280000, vipLevel: 5 },
  { rank: 7, name: 'NecroMaster', level: 50, power: 1150000, vipLevel: 4 },
  { rank: 8, name: 'ElvenQueen', level: 48, power: 980000, vipLevel: 4 },
  { rank: 9, name: 'DemonHunter', level: 45, power: 850000, vipLevel: 3 },
  { rank: 10, name: 'BattleMage', level: 42, power: 720000, vipLevel: 3 },
  { rank: 11, name: 'FrostKing', level: 40, power: 650000, vipLevel: 2 },
  { rank: 12, name: 'StormBringer', level: 38, power: 580000, vipLevel: 2 },
  { rank: 13, name: 'IronWill', level: 35, power: 450000, vipLevel: 1 },
  { rank: 14, name: 'SwiftBlade', level: 32, power: 380000, vipLevel: 1 },
  { rank: 15, name: 'MysticSage', level: 30, power: 320000, vipLevel: 1 },
  { rank: 16, name: 'BloodThirst', level: 28, power: 280000, vipLevel: 0 },
  { rank: 17, name: 'DarkProphet', level: 25, power: 220000, vipLevel: 0 },
  { rank: 18, name: 'WolfHunter', level: 22, power: 180000, vipLevel: 0 },
  { rank: 19, name: 'SilverArrow', level: 20, power: 150000, vipLevel: 0 },
  { rank: 20, name: 'NewChampion', level: 15, power: 100000, vipLevel: 0 },
];

// ============= TOWER OF ETERNITY =============

export interface TowerFloor {
  floor: number;
  name: string;
  difficulty: number; // multiplier for enemy stats
  enemyFaction: Faction;
  rewardGold: number;
  rewardGems: number;
  rewardItem?: string;
  bossFloor: boolean;
  description: string;
}

export const TOWER_FLOOR_THEMES = [
  { name: 'Whispering Halls', faction: 'undead' as Faction, desc: 'Echoes of fallen warriors linger here' },
  { name: 'Burning Rift', faction: 'demon' as Faction, desc: 'Lava bubbles beneath cracked stone' },
  { name: 'Twilight Grove', faction: 'elf' as Faction, desc: 'Ancient trees watch your every step' },
  { name: 'Blood Fields', faction: 'barbarian' as Faction, desc: 'The ground is stained crimson' },
  { name: 'Shadow Sanctum', faction: 'darkelf' as Faction, desc: 'Darkness devours all light' },
  { name: 'Hall of Champions', faction: 'knight' as Faction, desc: 'Fallen paladins guard the path' },
];

export const TOWER_BOSS_NAMES = [
  'The Warden',
  'Soul Conductor',
  'Infernal Sovereign',
  'Eternal Sentinel',
  'Void Reaper',
  'Crimson Tyrant',
  'Shadow Sovereign',
  'Ancient Devourer',
  'Twilight Queen',
  'Eternity Itself',
];

// Generate 100 tower floors with scaling difficulty
export const TOWER_FLOORS: TowerFloor[] = Array.from({ length: 100 }, (_, i) => {
  const floor = i + 1;
  const isBoss = floor % 10 === 0;
  const theme = TOWER_FLOOR_THEMES[Math.floor(i / 5) % TOWER_FLOOR_THEMES.length];
  const bossName = TOWER_BOSS_NAMES[Math.floor((floor - 1) / 10) % TOWER_BOSS_NAMES.length];

  return {
    floor,
    name: isBoss ? `${bossName} (Floor ${floor})` : `${theme.name} ${floor}`,
    difficulty: 1 + floor * 0.15,
    enemyFaction: theme.faction,
    rewardGold: 200 + floor * 80,
    rewardGems: isBoss ? 50 + floor * 2 : Math.floor(floor / 5) * 5,
    rewardItem: isBoss ? `Mythic Shard x${Math.floor(floor / 10)}` : floor % 5 === 0 ? 'Equipment Chest' : undefined,
    bossFloor: isBoss,
    description: isBoss
      ? `A mighty boss guards this floor. Defeat ${bossName} to claim legendary rewards!`
      : theme.desc,
  };
});

// ============= PVP ARENA =============

export interface ArenaOpponent {
  id: string;
  name: string;
  level: number;
  power: number;
  vipLevel: number;
  defenseRating: number; // 1-5 stars
  heroes: { templateId: string; level: number; stars: number }[];
  rank: number;
  reward: { gold: number; gems: number; trophies: number };
}

export const ARENA_OPPONENTS: ArenaOpponent[] = [
  { id: 'arena_1', name: 'BladeMaster', level: 8, power: 25000, vipLevel: 0, defenseRating: 1, heroes: [{ templateId: 'knight_03', level: 6, stars: 1 }, { templateId: 'undead_03', level: 5, stars: 1 }, { templateId: 'elf_03', level: 5, stars: 1 }], rank: 100, reward: { gold: 200, gems: 5, trophies: 10 } },
  { id: 'arena_2', name: 'FireWitch', level: 12, power: 55000, vipLevel: 1, defenseRating: 2, heroes: [{ templateId: 'demon_05', level: 10, stars: 2 }, { templateId: 'demon_03', level: 8, stars: 1 }, { templateId: 'demon_04', level: 9, stars: 2 }], rank: 80, reward: { gold: 500, gems: 10, trophies: 20 } },
  { id: 'arena_3', name: 'IronGuard', level: 18, power: 120000, vipLevel: 1, defenseRating: 3, heroes: [{ templateId: 'knight_01', level: 15, stars: 3 }, { templateId: 'knight_04', level: 14, stars: 3 }, { templateId: 'knight_02', level: 13, stars: 3 }], rank: 50, reward: { gold: 1000, gems: 20, trophies: 35 } },
  { id: 'arena_4', name: 'ShadowDancer', level: 25, power: 250000, vipLevel: 2, defenseRating: 4, heroes: [{ templateId: 'darkelf_02', level: 22, stars: 4 }, { templateId: 'darkelf_04', level: 20, stars: 3 }, { templateId: 'darkelf_01', level: 21, stars: 4 }], rank: 25, reward: { gold: 2500, gems: 50, trophies: 50 } },
  { id: 'arena_5', name: 'DragonBorn', level: 35, power: 500000, vipLevel: 3, defenseRating: 5, heroes: [{ templateId: 'special_01', level: 30, stars: 5 }, { templateId: 'special_02', level: 28, stars: 5 }, { templateId: 'special_04', level: 27, stars: 5 }], rank: 10, reward: { gold: 5000, gems: 100, trophies: 75 } },
  { id: 'arena_6', name: 'VoidEmperor', level: 50, power: 1000000, vipLevel: 5, defenseRating: 5, heroes: [{ templateId: 'special_05', level: 45, stars: 6 }, { templateId: 'demon_01', level: 42, stars: 6 }, { templateId: 'darkelf_01', level: 40, stars: 6 }], rank: 3, reward: { gold: 15000, gems: 250, trophies: 150 } },
];

export const ARENA_RANKS = [
  { minTrophies: 0, rank: 'Bronze III', icon: '🥉', rewardMultiplier: 1 },
  { minTrophies: 50, rank: 'Bronze II', icon: '🥉', rewardMultiplier: 1.2 },
  { minTrophies: 100, rank: 'Bronze I', icon: '🥉', rewardMultiplier: 1.5 },
  { minTrophies: 200, rank: 'Silver III', icon: '🥈', rewardMultiplier: 2 },
  { minTrophies: 350, rank: 'Silver II', icon: '🥈', rewardMultiplier: 2.5 },
  { minTrophies: 500, rank: 'Silver I', icon: '🥈', rewardMultiplier: 3 },
  { minTrophies: 750, rank: 'Gold III', icon: '🥇', rewardMultiplier: 4 },
  { minTrophies: 1000, rank: 'Gold II', icon: '🥇', rewardMultiplier: 5 },
  { minTrophies: 1500, rank: 'Gold I', icon: '🥇', rewardMultiplier: 6 },
  { minTrophies: 2000, rank: 'Platinum', icon: '💎', rewardMultiplier: 8 },
  { minTrophies: 3000, rank: 'Champion', icon: '👑', rewardMultiplier: 10 },
];

// ============= DAILY MISSIONS =============

export interface DailyMission {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'battle' | 'summon' | 'levelup' | 'equip' | 'spend_gems' | 'campaign';
  requirement: number;
  reward: { gold: number; gems: number; experience: number };
  refreshesDaily: boolean;
}

export const DAILY_MISSIONS: DailyMission[] = [
  { id: 'dm_1', name: 'First Victory', description: 'Win 1 battle', icon: '⚔️', type: 'battle', requirement: 1, reward: { gold: 500, gems: 5, experience: 100 }, refreshesDaily: true },
  { id: 'dm_2', name: 'Battle Hardened', description: 'Win 3 battles', icon: '🛡️', type: 'battle', requirement: 3, reward: { gold: 1000, gems: 10, experience: 250 }, refreshesDaily: true },
  { id: 'dm_3', name: 'Summoner', description: 'Summon 1 hero', icon: '✨', type: 'summon', requirement: 1, reward: { gold: 300, gems: 5, experience: 150 }, refreshesDaily: true },
  { id: 'dm_4', name: 'Power Up', description: 'Level up a hero', icon: '⬆️', type: 'levelup', requirement: 1, reward: { gold: 400, gems: 5, experience: 200 }, refreshesDaily: true },
  { id: 'dm_5', name: 'Gear Up', description: 'Equip 1 item', icon: '🗡️', type: 'equip', requirement: 1, reward: { gold: 300, gems: 3, experience: 100 }, refreshesDaily: true },
  { id: 'dm_6', name: 'Campaign Runner', description: 'Complete 2 campaign stages', icon: '🗺️', type: 'campaign', requirement: 2, reward: { gold: 800, gems: 8, experience: 300 }, refreshesDaily: true },
  { id: 'dm_7', name: 'Big Spender', description: 'Spend 200 gems', icon: '💎', type: 'spend_gems', requirement: 200, reward: { gold: 1500, gems: 20, experience: 500 }, refreshesDaily: true },
];

// ============= GUILD SYSTEM =============

export interface GuildMember {
  name: string;
  level: number;
  power: number;
  role: 'leader' | 'officer' | 'member';
  contributed: number;
  lastOnline: string;
}

export interface Guild {
  id: string;
  name: string;
  level: number;
  members: GuildMember[];
  experience: number;
  maxMembers: number;
  description: string;
  banner: string;
  perks: string[];
}

export const NPC_GUILDS: Guild[] = [
  { id: 'guild_1', name: 'Shadow Legion', level: 8, members: [
    { name: 'DarkLord', level: 45, power: 800000, role: 'leader', contributed: 50000, lastOnline: 'Online' },
    { name: 'NightBlade', level: 38, power: 500000, role: 'officer', contributed: 35000, lastOnline: '2h ago' },
    { name: 'SoulReaper', level: 35, power: 420000, role: 'member', contributed: 20000, lastOnline: '1h ago' },
    { name: 'BloodFang', level: 30, power: 300000, role: 'member', contributed: 15000, lastOnline: '3h ago' },
    { name: 'GhostArrow', level: 25, power: 200000, role: 'member', contributed: 8000, lastOnline: 'Online' },
  ], experience: 128000, maxMembers: 30, description: 'Top ranked guild. Serious players only.', banner: '🗡️', perks: ['+15% Battle Gold', '+10% Hero XP', 'Guild Shop Access'] },
  { id: 'guild_2', name: 'Knights of Dawn', level: 6, members: [
    { name: 'SunBlade', level: 35, power: 550000, role: 'leader', contributed: 35000, lastOnline: 'Online' },
    { name: 'HolyShield', level: 30, power: 350000, role: 'officer', contributed: 22000, lastOnline: '30m ago' },
    { name: 'DawnGuard', level: 28, power: 280000, role: 'member', contributed: 12000, lastOnline: '1h ago' },
    { name: 'LightBearer', level: 22, power: 150000, role: 'member', contributed: 5000, lastOnline: 'Online' },
  ], experience: 75000, maxMembers: 25, description: 'Friendly guild helping each other grow.', banner: '☀️', perks: ['+10% Battle Gold', '+5% Hero XP'] },
  { id: 'guild_3', name: 'Dragon Hoard', level: 4, members: [
    { name: 'GoldScale', level: 25, power: 300000, role: 'leader', contributed: 20000, lastOnline: 'Online' },
    { name: 'CoinMaster', level: 20, power: 180000, role: 'officer', contributed: 10000, lastOnline: '2h ago' },
  ], experience: 30000, maxMembers: 20, description: 'We hoard gold and power. Join us!', banner: '🐉', perks: ['+5% Battle Gold'] },
];

// ============= DAILY DUNGEONS =============

export interface DungeonStage {
  stage: number; // 1-5
  name: string;
  recommendedPower: number;
  rewards: {
    gold: number;
    gems: number;
    material: string;
    materialCount: number;
  };
}

export interface DailyDungeon {
  id: string;
  name: string;
  description: string;
  element: Element;
  dayOfWeek: number; // 0 = Sunday
  difficulty: number; // base difficulty multiplier for the dungeon
  stages: DungeonStage[];
  rewards: { gold: number; gems: number; material: string }; // representative top-tier reward summary
  bossName: string;
  bossElement: Element;
  icon: string; // emoji
}

// Materials granted by each elemental dungeon
export const DUNGEON_MATERIALS: Record<
  string,
  { description: string; use: string; element: Element; icon: string }
> = {
  'Inferno Ember': {
    description: 'A glowing ember of pure flame that never extinguishes. Warmth pulses through your fingers when held.',
    use: 'Used to awaken and ascend heroes of fire affinity. Required for forging legendary weapons of flame.',
    element: 'fire',
    icon: '🔥',
  },
  'Tidal Pearl': {
    description: 'A pearl formed under crushing ocean depths. Shimmers with the sorrow of drowned kingdoms.',
    use: 'Used to awaken and ascend heroes of water affinity. Required for forging legendary weapons of the tide.',
    element: 'water',
    icon: '💧',
  },
  'Gaia Stone': {
    description: 'A fragment of the world\'s heart, humming with ancient life. The earth whispers through it.',
    use: 'Used to awaken and ascend heroes of earth affinity. Required for forging legendary armor of the mountain.',
    element: 'earth',
    icon: '🌍',
  },
  'Shadow Essence': {
    description: 'Concentrated darkness that writhes in your hand. Stolen from the rifts between worlds.',
    use: 'Used to awaken and ascend heroes of dark affinity. Required for forging cursed blades of the void.',
    element: 'dark',
    icon: '🌑',
  },
  'Light Crystal': {
    description: 'A radiant crystal pulsing with holy energy. Its glow banishes even the deepest despair.',
    use: 'Used to awaken and ascend heroes of light affinity. Required for forging sacred relics of the dawn.',
    element: 'light',
    icon: '☀️',
  },
  'Void Fragment': {
    description: 'A sliver of pure void that defies reality itself. Staring into it reveals impossible geometries.',
    use: 'Used to awaken and ascend heroes of void affinity. Required for forging reality-bending artifacts.',
    element: 'void',
    icon: '✨',
  },
};

// Helper to generate 5 escalating stages for a dungeon
function buildDungeonStages(
  basePower: number,
  baseGold: number,
  baseGems: number,
  material: string,
  baseMaterial: number
): DungeonStage[] {
  const stageNames = [
    'Outer Gate',
    'Forgotten Halls',
    'Cursed Sanctum',
    'Inner Veil',
    'Throne of Ruin',
  ];
  return Array.from({ length: 5 }, (_, i) => {
    const stage = i + 1;
    return {
      stage,
      name: stageNames[i],
      recommendedPower: Math.floor(basePower * Math.pow(1.65, i)),
      rewards: {
        gold: baseGold * stage,
        gems: baseGems * stage,
        material,
        materialCount: baseMaterial * stage,
      },
    } as DungeonStage;
  });
}

export const DAILY_DUNGEONS: DailyDungeon[] = [
  {
    id: 'dungeon_sunday_light',
    name: 'Sunwell Sanctum',
    description: 'A radiant cathedral bathed in eternal dawn. Holy guardians stand watch over the Light Crystal hoard.',
    element: 'light',
    dayOfWeek: 0, // Sunday
    difficulty: 1.0,
    stages: buildDungeonStages(8000, 600, 8, 'Light Crystal', 1),
    rewards: { gold: 3000, gems: 40, material: 'Light Crystal' },
    bossName: 'Seraphiel the Dawnbringer',
    bossElement: 'light',
    icon: '☀️',
  },
  {
    id: 'dungeon_monday_fire',
    name: 'Emberfall Caverns',
    description: 'Molten rivers carve through obsidian halls. Inferno Embers burn brightest in the deepest forges.',
    element: 'fire',
    dayOfWeek: 1, // Monday
    difficulty: 1.05,
    stages: buildDungeonStages(9000, 650, 9, 'Inferno Ember', 1),
    rewards: { gold: 3250, gems: 45, material: 'Inferno Ember' },
    bossName: 'Pyroclast the Eternal Flame',
    bossElement: 'fire',
    icon: '🔥',
  },
  {
    id: 'dungeon_tuesday_water',
    name: 'Abyssal Trench',
    description: 'Beneath the crushing dark of the endless sea, the Tidal Pearls gleam like drowned stars.',
    element: 'water',
    dayOfWeek: 2, // Tuesday
    difficulty: 1.05,
    stages: buildDungeonStages(9500, 700, 9, 'Tidal Pearl', 1),
    rewards: { gold: 3500, gems: 45, material: 'Tidal Pearl' },
    bossName: 'Leviathan Tidecaller',
    bossElement: 'water',
    icon: '💧',
  },
  {
    id: 'dungeon_wednesday_earth',
    name: "Gaia's Heart",
    description: 'A living cavern of crystal roots and ancient stone. The world itself guards the Gaia Stones.',
    element: 'earth',
    dayOfWeek: 3, // Wednesday
    difficulty: 1.1,
    stages: buildDungeonStages(10000, 750, 10, 'Gaia Stone', 1),
    rewards: { gold: 3750, gems: 50, material: 'Gaia Stone' },
    bossName: 'Terraxis World-Shaper',
    bossElement: 'earth',
    icon: '🌍',
  },
  {
    id: 'dungeon_thursday_dark',
    name: 'Twilight Catacombs',
    description: 'Endless tombs where the shadows breathe. Shadow Essence drips from the weeping walls.',
    element: 'dark',
    dayOfWeek: 4, // Thursday
    difficulty: 1.15,
    stages: buildDungeonStages(11000, 800, 11, 'Shadow Essence', 1),
    rewards: { gold: 4000, gems: 55, material: 'Shadow Essence' },
    bossName: 'Nyxalia Soulreaver',
    bossElement: 'dark',
    icon: '🌑',
  },
  {
    id: 'dungeon_friday_void',
    name: 'Voidstorm Rift',
    description: 'A tear in reality where time runs sideways. Void Fragments crystallize from nothing itself.',
    element: 'void',
    dayOfWeek: 5, // Friday
    difficulty: 1.2,
    stages: buildDungeonStages(13000, 900, 13, 'Void Fragment', 1),
    rewards: { gold: 4500, gems: 65, material: 'Void Fragment' },
    bossName: 'Nullshroud the Devourer',
    bossElement: 'void',
    icon: '✨',
  },
  {
    id: 'dungeon_saturday_phoenix',
    name: 'Phoenix Caldera',
    description: 'The weekend trial — a volcanic throne where the Phoenix reborn guards a bounty of Inferno Embers and gems.',
    element: 'fire',
    dayOfWeek: 6, // Saturday
    difficulty: 1.25,
    stages: buildDungeonStages(15000, 1100, 15, 'Inferno Ember', 2),
    rewards: { gold: 5500, gems: 75, material: 'Inferno Ember' },
    bossName: 'Cinderwing the Reborn',
    bossElement: 'fire',
    icon: '🦅',
  },
];

// Quick lookup helpers
export function getTodayDungeon(date: Date = new Date()): DailyDungeon | undefined {
  const day = date.getDay(); // 0-6, 0 = Sunday
  return DAILY_DUNGEONS.find((d) => d.dayOfWeek === day);
}

export function getDungeonById(id: string): DailyDungeon | undefined {
  return DAILY_DUNGEONS.find((d) => d.id === id);
}

// ============= WANDERING MERCHANT =============
// The Wandering Merchant appears periodically with rotating limited-time deals
// on rare resources at discounted prices. Refreshes every 8 hours.

export interface MerchantDeal {
  id: string;
  name: string;
  description: string;
  icon: string;
  originalPrice: number; // in gems
  discountedPrice: number; // in gems
  currency: 'gems' | 'gold';
  type: 'gems' | 'gold' | 'energy' | 'scroll' | 'equipment' | 'material' | 'hero_shard';
  amount: number;
  rarity?: Rarity;
  stock: number; // available to buy
  tag?: 'BEST_VALUE' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'NEW' | 'HOT';
}

// Pool of possible merchant deals — merchant picks 6 random deals per visit
export const MERCHANT_DEAL_POOL: MerchantDeal[] = [
  // Equipment deals
  {
    id: 'merch_eq_legendary',
    name: 'Legendary Equipment Chest',
    description: 'Guaranteed Legendary or Mythic equipment piece',
    icon: '🎁',
    originalPrice: 2500,
    discountedPrice: 1200,
    currency: 'gems',
    type: 'equipment',
    amount: 1,
    rarity: 'legendary',
    stock: 1,
    tag: 'LEGENDARY',
  },
  {
    id: 'merch_eq_epic_chest',
    name: 'Epic Equipment Bundle',
    description: '3 Epic equipment pieces for the price of 2',
    icon: '📦',
    originalPrice: 1500,
    discountedPrice: 900,
    currency: 'gems',
    type: 'equipment',
    amount: 3,
    rarity: 'epic',
    stock: 2,
    tag: 'BEST_VALUE',
  },
  {
    id: 'merch_eq_rare_5',
    name: 'Rare Equipment Pack',
    description: '5 Rare equipment pieces — perfect for early progression',
    icon: '🎒',
    originalPrice: 600,
    discountedPrice: 300,
    currency: 'gems',
    type: 'equipment',
    amount: 5,
    rarity: 'rare',
    stock: 3,
    tag: 'HOT',
  },
  // Material bundles
  {
    id: 'merch_mats_inferno',
    name: 'Inferno Ember Cache',
    description: '30 Inferno Embers — awaken your Fire heroes',
    icon: '🔥',
    originalPrice: 800,
    discountedPrice: 450,
    currency: 'gems',
    type: 'material',
    amount: 30,
    stock: 2,
    tag: 'RARE',
  },
  {
    id: 'merch_mats_tidal',
    name: 'Tidal Pearl Cache',
    description: '30 Tidal Pearls — awaken your Water heroes',
    icon: '💧',
    originalPrice: 800,
    discountedPrice: 450,
    currency: 'gems',
    type: 'material',
    amount: 30,
    stock: 2,
    tag: 'RARE',
  },
  {
    id: 'merch_mats_gaia',
    name: 'Gaia Stone Cache',
    description: '30 Gaia Stones — awaken your Earth heroes',
    icon: '🌍',
    originalPrice: 800,
    discountedPrice: 450,
    currency: 'gems',
    type: 'material',
    amount: 30,
    stock: 2,
    tag: 'RARE',
  },
  {
    id: 'merch_mats_shadow',
    name: 'Shadow Essence Cache',
    description: '30 Shadow Essences — awaken your Dark heroes',
    icon: '🌑',
    originalPrice: 1000,
    discountedPrice: 600,
    currency: 'gems',
    type: 'material',
    amount: 30,
    stock: 1,
    tag: 'EPIC',
  },
  {
    id: 'merch_mats_light',
    name: 'Light Crystal Cache',
    description: '30 Light Crystals — awaken your Light heroes',
    icon: '☀️',
    originalPrice: 1000,
    discountedPrice: 600,
    currency: 'gems',
    type: 'material',
    amount: 30,
    stock: 1,
    tag: 'EPIC',
  },
  // Scroll deals
  {
    id: 'merch_scroll_10_discount',
    name: '10x Mystic Scroll Bundle',
    description: 'Summon 10 champions — Epic guaranteed',
    icon: '📜',
    originalPrice: 1200,
    discountedPrice: 900,
    currency: 'gems',
    type: 'scroll',
    amount: 10,
    stock: 2,
    tag: 'BEST_VALUE',
  },
  {
    id: 'merch_scroll_ancient',
    name: 'Ancient Shard',
    description: 'Summon 1 Legendary or Mythic champion!',
    icon: '🔮',
    originalPrice: 3000,
    discountedPrice: 2200,
    currency: 'gems',
    type: 'scroll',
    amount: 1,
    stock: 1,
    tag: 'LEGENDARY',
  },
  // Currency exchanges
  {
    id: 'merch_gold_50k',
    name: 'Treasure Chest (50K Gold)',
    description: 'A chest overflowing with 50,000 gold coins',
    icon: '🪙',
    originalPrice: 200,
    discountedPrice: 120,
    currency: 'gems',
    type: 'gold',
    amount: 50000,
    stock: 5,
    tag: 'HOT',
  },
  {
    id: 'merch_gold_100k',
    name: 'Royal Vault (100K Gold)',
    description: 'A royal vault containing 100,000 gold coins',
    icon: '💰',
    originalPrice: 400,
    discountedPrice: 240,
    currency: 'gems',
    type: 'gold',
    amount: 100000,
    stock: 3,
    tag: 'BEST_VALUE',
  },
  {
    id: 'merch_energy_refill',
    name: 'Energy Keg',
    description: 'Refills your energy to maximum',
    icon: '⚡',
    originalPrice: 80,
    discountedPrice: 40,
    currency: 'gems',
    type: 'energy',
    amount: 100,
    stock: 5,
    tag: 'NEW',
  },
  {
    id: 'merch_xp_brew_xl',
    name: 'Mega XP Brew (100K XP)',
    description: 'Grants 100,000 hero XP — level up instantly',
    icon: '🧪',
    originalPrice: 500,
    discountedPrice: 300,
    currency: 'gems',
    type: 'hero_shard',
    amount: 100000,
    stock: 2,
    tag: 'EPIC',
  },
];

export const MERCHANT_REFRESH_INTERVAL = 8 * 60 * 60 * 1000; // 8 hours in ms
export const MERCHANT_DEALS_PER_VISIT = 6;

// Pick N random deals from the pool (deterministic given a seed)
export function rollMerchantDeals(seed: number, count: number = MERCHANT_DEALS_PER_VISIT): MerchantDeal[] {
  const pool = [...MERCHANT_DEAL_POOL];
  const result: MerchantDeal[] = [];
  // simple seeded PRNG (mulberry32)
  let s = seed >>> 0;
  const rand = () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(rand() * pool.length);
    const deal = pool.splice(idx, 1)[0];
    // Reset stock to fresh value on each roll (clone)
    result.push({ ...deal });
  }
  return result;
}

// Compute the merchant "visit window" for a given timestamp.
// Returns the seed and the start time so deals stay stable within a window.
export function getMerchantWindow(now: number = Date.now()): { seed: number; windowStart: number; windowEnd: number } {
  const windowStart = Math.floor(now / MERCHANT_REFRESH_INTERVAL) * MERCHANT_REFRESH_INTERVAL;
  const windowEnd = windowStart + MERCHANT_REFRESH_INTERVAL;
  // Seed from window start so deals are stable for the entire 8-hour window
  const seed = Math.floor(windowStart / 1000);
  return { seed, windowStart, windowEnd };
}

// ============= DAILY LOGIN STREAK MILESTONES =============
// Tracks a 30-day cumulative login streak with milestone bonuses
// (separate from the existing 7-day DAILY_REWARDS cycle which stays).

export interface LoginStreakMilestone {
  day: number;
  name: string;
  description: string;
  reward: {
    gold: number;
    gems: number;
    energy?: number;
    vipPoints?: number;
    item?: string;
    itemIcon?: string;
  };
  icon: string;
  tier: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
}

export const LOGIN_STREAK_MILESTONES: LoginStreakMilestone[] = [
  { day: 3,  name: '三日 Devotion',  description: 'Three days of dedication earns a small reward.', reward: { gold: 2000,  gems: 30,  energy: 30 }, icon: '🌟', tier: 'common' },
  { day: 7,  name: 'Week\'s Resolve', description: 'A full week of loyalty unlocks an Epic reward.', reward: { gold: 5000,  gems: 75,  energy: 50, item: '1x Epic Hero', itemIcon: '💜' }, icon: '✨', tier: 'epic' },
  { day: 14, name: 'Fortnight Crown', description: 'Two weeks of devotion earns royal treasure.', reward: { gold: 12000, gems: 150, energy: 80, vipPoints: 25 }, icon: '👑', tier: 'legendary' },
  { day: 21, name: 'Three Weeks Awe',  description: 'A sacred milestone — a Legendary champion joins you.', reward: { gold: 25000, gems: 250, item: '1x Legendary Hero', itemIcon: '⭐' }, icon: '🌟', tier: 'legendary' },
  { day: 30, name: 'Eternal Vow',     description: 'A full month of devotion — the realm rewards its champion with a Mythic champion!', reward: { gold: 100000, gems: 1000, vipPoints: 100, item: '1x Mythic Hero', itemIcon: '🔥' }, icon: '🔥', tier: 'mythic' },
];

// ============= HERO SKIN SYSTEM =============
// Cosmetic skins that change a hero's visual appearance (gradient + accent).
// Pure cosmetic — does not affect stats. Acquired via shop / events.

export interface HeroSkin {
  id: string;
  heroTemplateId: string; // which hero this skin is for
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  // Tailwind gradient classes for portrait background
  gradient: string;
  // Accent color hex for borders/glows
  accentColor: string;
  // Particle/effect overlay
  effect: 'none' | 'embers' | 'frost' | 'shadow' | 'lightning' | 'arcane' | 'golden';
  // Aura ring color (Tailwind text color class)
  auraRing: string;
  cost: number; // in gems (0 = default/free)
  icon: string;
}

export const HERO_SKINS: HeroSkin[] = [
  // Default skins (free, always available)
  {
    id: 'skin_default_galahad',
    heroTemplateId: 'knight_01',
    name: 'Default',
    description: 'Sir Galahad\'s classic silver armor.',
    rarity: 'common',
    gradient: 'from-blue-700 to-blue-900',
    accentColor: '#3b82f6',
    effect: 'none',
    auraRing: 'text-blue-400',
    cost: 0,
    icon: '⚔️',
  },
  {
    id: 'skin_inferno_galahad',
    heroTemplateId: 'knight_01',
    name: 'Inferno Paladin',
    description: 'Burning armor wreathed in hellfire. Embers dance around the holy knight.',
    rarity: 'legendary',
    gradient: 'from-red-600 via-orange-600 to-amber-700',
    accentColor: '#ef4444',
    effect: 'embers',
    auraRing: 'text-red-400',
    cost: 800,
    icon: '🔥',
  },
  {
    id: 'skin_divine_galahad',
    heroTemplateId: 'knight_01',
    name: 'Divine Archon',
    description: 'Radiant golden armor blessed by the heavens themselves.',
    rarity: 'mythic',
    gradient: 'from-amber-300 via-yellow-500 to-amber-700',
    accentColor: '#f59e0b',
    effect: 'golden',
    auraRing: 'text-amber-300',
    cost: 2000,
    icon: '☀️',
  },
  // Ranger Sylvana skins
  {
    id: 'skin_default_sylvana',
    heroTemplateId: 'elf_02',
    name: 'Default',
    description: 'Ranger Sylvana\'s forest-green cloak.',
    rarity: 'common',
    gradient: 'from-green-700 to-green-900',
    accentColor: '#22c55e',
    effect: 'none',
    auraRing: 'text-green-400',
    cost: 0,
    icon: '🏹',
  },
  {
    id: 'skin_frost_sylvana',
    heroTemplateId: 'elf_02',
    name: 'Frostbite Sentinel',
    description: 'Glacial armor that freezes the air around her. A frost mist trails her steps.',
    rarity: 'epic',
    gradient: 'from-cyan-400 via-blue-500 to-indigo-800',
    accentColor: '#06b6d4',
    effect: 'frost',
    auraRing: 'text-cyan-300',
    cost: 600,
    icon: '❄️',
  },
  {
    id: 'skin_void_sylvana',
    heroTemplateId: 'elf_02',
    name: 'Voidwalker Ranger',
    description: 'Cloaked in shadow essence, Sylvana becomes one with the void.',
    rarity: 'legendary',
    gradient: 'from-violet-600 via-purple-800 to-slate-900',
    accentColor: '#a855f7',
    effect: 'arcane',
    auraRing: 'text-violet-300',
    cost: 1200,
    icon: '🌌',
  },
  // Bone Collector skins
  {
    id: 'skin_default_bone',
    heroTemplateId: 'undead_02',
    name: 'Default',
    description: 'Bone Collector\'s macabre skeletal form.',
    rarity: 'common',
    gradient: 'from-gray-700 to-gray-900',
    accentColor: '#6b7280',
    effect: 'none',
    auraRing: 'text-gray-300',
    cost: 0,
    icon: '💀',
  },
  {
    id: 'skin_shadow_bone',
    heroTemplateId: 'undead_02',
    name: 'Shadow Reaper',
    description: 'A spectral form wreathed in living shadow. Lightning crackles within its ribs.',
    rarity: 'epic',
    gradient: 'from-violet-700 via-purple-900 to-black',
    accentColor: '#7c3aed',
    effect: 'lightning',
    auraRing: 'text-violet-400',
    cost: 700,
    icon: '⚡',
  },
  {
    id: 'skin_blood_bone',
    heroTemplateId: 'undead_02',
    name: 'Bloodlord Wight',
    description: 'Drenched in the blood of a thousand foes. Mythic-tier menace.',
    rarity: 'mythic',
    gradient: 'from-red-700 via-rose-900 to-black',
    accentColor: '#dc2626',
    effect: 'shadow',
    auraRing: 'text-red-400',
    cost: 1800,
    icon: '🩸',
  },
];

export function getSkinsForHero(templateId: string): HeroSkin[] {
  return HERO_SKINS.filter(s => s.heroTemplateId === templateId);
}



// ============= MARKET-STANDARD META MECHANICS =============
// (pity/mercy summons, elemental affinity, idle earnings)

// Pity ("mercy") system — genre standard (cf. Raid's mercy rule, scaled
// to this game's much higher base rates): an Epic-or-better champion is
// guaranteed within 20 pulls and a Legendary-or-better within 50.
export const PITY_CONFIG = { epicAt: 20, legendaryAt: 50 };

const RARITY_RANK: Record<Rarity, number> = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, mythic: 5 };

export function rarityRank(r: Rarity): number {
  return RARITY_RANK[r];
}

export function getSummonOfRarity(rarity: Rarity): HeroTemplate {
  const eligible = HERO_TEMPLATES.filter(h => h.rarity === rarity);
  return eligible[Math.floor(Math.random() * eligible.length)];
}

// Elemental affinity wheel: fire → earth → water → fire; light ⇄ dark
// punish each other; void sits outside the wheel. Attacking into an
// advantage deals +25%, into a disadvantage −20%.
export const ELEMENT_ADVANTAGE: Record<Element, Element | null> = {
  fire: 'earth',
  earth: 'water',
  water: 'fire',
  light: 'dark',
  dark: 'light',
  void: null,
};

export function elementMultiplier(attacker: Element, defender: Element): number {
  if (ELEMENT_ADVANTAGE[attacker] === defender) return 1.25;
  if (ELEMENT_ADVANTAGE[defender] === attacker) return 0.8;
  return 1;
}

// Idle earnings (AFK-style): your champions farm while you're away.
// Rewards scale with campaign progress and cap at 8 hours.
export const IDLE_CONFIG = {
  goldPerMinutePerStage: 6,
  capHours: 8,
  minMinutes: 5,
  gemsCap: 20, // small gem trickle, maxes out at the cap
};

export function computeIdleRewards(elapsedMs: number, campaignStage: number): { minutes: number; gold: number; gems: number; capped: boolean } {
  const capMs = IDLE_CONFIG.capHours * 3600_000;
  const capped = elapsedMs >= capMs;
  const ms = Math.min(elapsedMs, capMs);
  const minutes = Math.floor(ms / 60_000);
  const stage = Math.max(1, campaignStage);
  const gold = Math.floor(minutes * IDLE_CONFIG.goldPerMinutePerStage * (1 + stage * 0.35));
  const gems = Math.min(IDLE_CONFIG.gemsCap, Math.floor(minutes / 30));
  return { minutes, gold, gems, capped };
}
