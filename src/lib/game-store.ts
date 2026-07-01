import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  HeroInstance,
  PlayerState,
  BattleState,
  BattleHero,
  HeroTemplate,
  RARITY_CONFIG,
  VIP_LEVELS,
  HERO_TEMPLATES,
  EQUIPMENT_TEMPLATES,
  EquipmentTemplate,
  EquipmentSlot,
  ACHIEVEMENTS,
  Achievement,
  getSummonResult,
  createHeroInstance,
  createBattleHero,
  generateEnemyTeam,
  getHeroStats,
  getExperienceForLevel,
  CAMPAIGN_STAGES,
  DAILY_REWARDS,
  ARENA_OPPONENTS,
  DAILY_MISSIONS,
  NPC_GUILDS,
  TOWER_FLOORS,
  getDungeonById,
  AWAKENING_LEVELS,
  ELEMENT_CONFIG,
  MerchantDeal,
  rollMerchantDeals,
  getMerchantWindow,
  MERCHANT_REFRESH_INTERVAL,
  LOGIN_STREAK_MILESTONES,
  HeroSkin,
  HERO_SKINS,
  getSkinsForHero,
  ASCENSION_COSTS,
} from './game-data';

export type GameScreen = 'dashboard' | 'heroes' | 'summon' | 'battle' | 'campaign' | 'shop' | 'vip' | 'equipment' | 'achievements' | 'leaderboard' | 'arena' | 'missions' | 'guild' | 'tower' | 'dungeon' | 'merchant' | 'login-streak';

export interface OwnedEquipment {
  id: string;
  templateId: string;
  equippedTo?: string; // hero ID
}

export interface ArenaBattleResult {
  opponentId: string;
  won: boolean;
  trophies: number;
  gold: number;
  gems: number;
}

export interface MissionProgress {
  missionId: string;
  progress: number;
  claimed: boolean;
}

export interface GameState {
  player: PlayerState;
  heroes: HeroInstance[];
  team: string[]; // hero IDs in team (max 5)
  screen: GameScreen;
  battle: BattleState | null;
  summonResults: HeroInstance[];
  showSummonAnimation: boolean;
  notifications: { id: string; message: string; type: 'success' | 'warning' | 'info' | 'epic' }[];
  dailyClaimed: boolean;
  showDailyReward: boolean;
  equipment: OwnedEquipment[];
  unlockedAchievements: string[];
  battlesWon: number;
  totalBattles: number;
  maxDamage: number;
  showAchievementUnlock: Achievement | null;
  // Arena
  arenaTrophies: number;
  arenaWins: number;
  arenaLosses: number;
  arenaCooldown: number; // timestamp when next arena battle is available
  // Missions
  missionProgress: MissionProgress[];
  missionsLastRefreshed: number;
  // Guild
  guildId: string | null;
  // Tower of Eternity
  towerHighestFloor: number;
  towerCurrentFloor: number;
  towerAttempts: number; // daily attempts (max 5)
  towerLastReset: number;
  // Daily Dungeons
  dungeonAttempts: { [dungeonId: string]: number }; // attempts used per dungeon (max 3/day)
  dungeonLastReset: number; // timestamp when attempts were last reset
  dungeonMaterials: { [materialName: string]: number }; // inventory of materials collected
  dungeonHighestStage: { [dungeonId: string]: number }; // highest stage cleared per dungeon
  // Stats tracking
  heroesSummoned: number;
  gemsSpent: number;
  equipmentEquipped: number;
  campaignStagesWon: number;
  heroesLeveledUp: number;
  // Wandering Merchant
  merchantWindowStart: number; // start of the current 8h merchant window (0 = never visited)
  merchantPurchases: { [dealId: string]: number }; // dealId -> quantity bought this window
  merchantLastSeen: number; // last time merchant was viewed (for notification logic)
  // Daily Login Streak (cumulative, separate from 7-day cycle)
  loginStreak: number; // current consecutive-day streak
  loginStreakLastClaim: number; // timestamp of last streak claim (day)
  claimedStreakMilestones: number[]; // milestone days already claimed
  showStreakReward: boolean;
  // Hero Skins
  ownedSkins: string[]; // skin IDs player owns
  equippedSkins: { [heroInstanceId: string]: string }; // heroInstance.id -> skinId

  // Actions
  setScreen: (screen: GameScreen) => void;
  summon: (count: 1 | 10, cost: number) => void;
  addToTeam: (heroId: string) => void;
  removeFromTeam: (heroId: string) => void;
  startBattle: (stage: number) => void;
  executeBattleTurn: () => void;
  toggleAutoPlay: () => void;
  toggleBattleSpeed: () => void;
  buyShopItem: (itemId: string, price: number, currency: 'gems' | 'gold', type: string, amount: number) => void;
  claimDailyReward: () => void;
  levelUpHero: (heroId: string) => void;
  ascendHero: (heroId: string) => void;
  sacrificeHero: (heroId: string) => void;
  sacrificeAscend: (heroId: string, sacrificeHeroIds: string[]) => void;
  awakenHero: (heroId: string) => void;
  addGems: (amount: number) => void;
  addGold: (amount: number) => void;
  addVIPPoints: (amount: number) => void;
  refillEnergy: () => void;
  clearSummonResults: () => void;
  setShowSummonAnimation: (show: boolean) => void;
  setShowDailyReward: (show: boolean) => void;
  addNotification: (message: string, type: 'success' | 'warning' | 'info' | 'epic') => void;
  clearNotification: (id: string) => void;
  endBattle: () => void;
  checkEnergyRefill: () => void;
  // Equipment
  generateRandomEquipment: (rarityBias?: number) => OwnedEquipment;
  equipItem: (equipmentId: string, heroId: string) => void;
  unequipItem: (equipmentId: string) => void;
  craftEquipment: (rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary') => void;
  // Achievements
  checkAchievements: () => void;
  dismissAchievementUnlock: () => void;
  // Arena
  startArenaBattle: (opponentId: string) => void;
  // Missions
  updateMissionProgress: (type: string, amount: number) => void;
  claimMissionReward: (missionId: string) => void;
  refreshMissions: () => void;
  // Guild
  joinGuild: (guildId: string) => void;
  leaveGuild: () => void;
  // Tower
  startTowerBattle: (floor: number) => { won: boolean; rewards: { gold: number; gems: number; item?: string } } | null;
  resetTowerProgress: () => void;
  // Daily Dungeons
  startDungeonBattle: (dungeonId: string, stage: number) => { won: boolean; rewards: { gold: number; gems: number; material?: string; materialCount?: number } } | null;
  resetDungeonAttempts: () => void;
  canEnterDungeon: (dungeonId: string) => boolean;
  // Wandering Merchant
  getMerchantDeals: () => MerchantDeal[];
  getMerchantRemainingStock: (dealId: string) => number;
  buyMerchantDeal: (dealId: string) => { success: boolean; reason?: string };
  refreshMerchantIfStale: () => void;
  // Daily Login Streak
  claimLoginStreak: () => { claimed: boolean; milestone?: typeof LOGIN_STREAK_MILESTONES[0] };
  dismissStreakReward: () => void;
  checkLoginStreak: () => void;
  // Hero Skins
  buySkin: (skinId: string) => { success: boolean; reason?: string };
  equipSkin: (heroInstanceId: string, skinId: string) => void;
  unequipSkin: (heroInstanceId: string) => void;
  getEquippedSkin: (heroInstanceId: string) => HeroSkin | undefined;
}

const initialPlayer: PlayerState = {
  id: 'player_1',
  name: 'Champion',
  level: 1,
  experience: 0,
  gold: 10000,
  gems: 500,
  energy: 100,
  maxEnergy: 100,
  vipLevel: 0,
  vipPoints: 0,
  totalSpent: 0,
  campaignStage: 1,
  dailyRewardDay: 0,
  lastLoginAt: Date.now(),
};

// Give player starter heroes - balanced for early game
const starterHeroes: HeroInstance[] = (() => {
  // Use templates from game-data for consistency
  const knightTemplate = HERO_TEMPLATES.find(h => h.id === 'knight_01')!; // Sir Galahad - Rare
  const elfTemplate = HERO_TEMPLATES.find(h => h.id === 'elf_02')!; // Ranger Sylvana - Rare
  const undeadTemplate = HERO_TEMPLATES.find(h => h.id === 'undead_02')!; // Bone Collector - Rare

  const heroes = [knightTemplate, elfTemplate, undeadTemplate].map((t) => {
    const instance = createHeroInstance(t);
    instance.level = 5; // Start at level 5 for better stats
    // Recalculate stats for level 5
    const stats = getHeroStats(t, 5, instance.stars);
    instance.attack = stats.attack;
    instance.defense = stats.defense;
    instance.health = stats.health;
    instance.speed = stats.speed;
    instance.inTeam = true;
    return instance;
  });
  return heroes;
})();

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      player: initialPlayer,
      heroes: starterHeroes,
      team: starterHeroes.map(h => h.id),
      screen: 'dashboard' as GameScreen,
      battle: null,
      summonResults: [],
      showSummonAnimation: false,
      notifications: [],
      dailyClaimed: false,
      showDailyReward: false,
      equipment: [],
      unlockedAchievements: [],
      battlesWon: 0,
      totalBattles: 0,
      maxDamage: 0,
      showAchievementUnlock: null,
      arenaTrophies: 0,
      arenaWins: 0,
      arenaLosses: 0,
      arenaCooldown: 0,
      missionProgress: [],
      missionsLastRefreshed: Date.now(),
      guildId: null,
      // Tower of Eternity
      towerHighestFloor: 0,
      towerCurrentFloor: 1,
      towerAttempts: 5,
      towerLastReset: Date.now(),
      // Daily Dungeons
      dungeonAttempts: {},
      dungeonLastReset: Date.now(),
      dungeonMaterials: {},
      dungeonHighestStage: {},
      heroesSummoned: 0,
      gemsSpent: 0,
      equipmentEquipped: 0,
      campaignStagesWon: 0,
      heroesLeveledUp: 0,
      // Wandering Merchant
      merchantWindowStart: 0,
      merchantPurchases: {},
      merchantLastSeen: 0,
      // Daily Login Streak
      loginStreak: 0,
      loginStreakLastClaim: 0,
      claimedStreakMilestones: [],
      showStreakReward: false,
      // Hero Skins — start with default skins owned
      ownedSkins: HERO_SKINS.filter(s => s.cost === 0).map(s => s.id),
      equippedSkins: {},

      setScreen: (screen) => set({ screen }),

      summon: (count, cost) => {
        const state = get();
        if (state.player.gems < cost) {
          state.addNotification('Not enough gems! Visit the shop to get more!', 'warning');
          return;
        }
        if (state.player.energy < 5) {
          state.addNotification('Not enough energy! Wait for refill or buy from shop!', 'warning');
          return;
        }

        const results: HeroInstance[] = [];
        for (let i = 0; i < count; i++) {
          const template = getSummonResult(state.player.vipLevel);
          const instance = createHeroInstance(template);
          results.push(instance);
        }

        // Check for duplicates and merge
        const existingHeroes = [...state.heroes];
        const newHeroes: HeroInstance[] = [];

        for (const result of results) {
          const existing = existingHeroes.find(h => h.templateId === result.templateId);
          if (existing) {
            // Merge - add experience to existing hero
            existing.experience += 500;
          } else {
            newHeroes.push(result);
          }
        }

        set({
          player: { ...state.player, gems: state.player.gems - cost, energy: state.player.energy - 5 },
          heroes: [...existingHeroes, ...newHeroes],
          summonResults: results,
          showSummonAnimation: true,
          heroesSummoned: state.heroesSummoned + count,
          gemsSpent: state.gemsSpent + cost,
        });

        // Update mission progress
        get().updateMissionProgress('summon', count);

        // Check for epic+ pulls
        const bestRarity = results.reduce((best, h) => {
          const order = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
          return order.indexOf(h.rarity) > order.indexOf(best) ? h.rarity : best;
        }, 'common' as string);

        if (bestRarity === 'mythic') {
          state.addNotification('🌟 MYTHIC PULL! You summoned a MYTHIC champion! 🌟', 'epic');
        } else if (bestRarity === 'legendary') {
          state.addNotification('✨ LEGENDARY! An incredible champion joins your roster!', 'success');
        } else if (bestRarity === 'epic') {
          state.addNotification('💜 Epic champion acquired!', 'success');
        }
      },

      addToTeam: (heroId) => {
        const state = get();
        if (state.team.length >= 5) {
          state.addNotification('Team is full! Remove a hero first.', 'warning');
          return;
        }
        if (state.team.includes(heroId)) return;
        set({
          team: [...state.team, heroId],
          heroes: state.heroes.map(h => h.id === heroId ? { ...h, inTeam: true } : h),
        });
      },

      removeFromTeam: (heroId) => {
        const state = get();
        if (state.team.length <= 1) {
          state.addNotification('You need at least 1 hero in your team!', 'warning');
          return;
        }
        set({
          team: state.team.filter(id => id !== heroId),
          heroes: state.heroes.map(h => h.id === heroId ? { ...h, inTeam: false } : h),
        });
      },

      startBattle: (stage) => {
        const state = get();
        const stageData = CAMPAIGN_STAGES[stage - 1];
        if (!stageData) return;
        if (state.player.energy < stageData.energyCost) {
          state.addNotification('Not enough energy!', 'warning');
          return;
        }

        const teamHeroes = state.team
          .map(id => state.heroes.find(h => h.id === id))
          .filter((h): h is HeroInstance => h !== undefined);

        if (teamHeroes.length === 0) {
          state.addNotification('Add heroes to your team first!', 'warning');
          return;
        }

        const playerTeam = teamHeroes.map(createBattleHero);
        const enemyTeam = generateEnemyTeam(stage, stageData.enemyFaction);

        set({
          player: { ...state.player, energy: state.player.energy - stageData.energyCost },
          battle: {
            isActive: true,
            playerTeam,
            enemyTeam,
            currentTurn: 'player',
            turnIndex: 0,
            turnNumber: 1,
            log: ['⚔️ Battle begins! Turn 1'],
            result: null,
            rewards: null,
            autoPlay: false,
            speed: 1,
          },
          screen: 'battle',
        });

        // Auto-start battle simulation
        get().executeBattleTurn();
      },

      executeBattleTurn: () => {
        const state = get();
        if (!state.battle || state.battle.result) return;

        const battle = { ...state.battle };
        const log = [...battle.log];
        const playerTeam = battle.playerTeam.map(h => ({ ...h }));
        const enemyTeam = battle.enemyTeam.map(h => ({ ...h }));

        const livingPlayers = playerTeam.filter(h => h.isAlive);
        const livingEnemies = enemyTeam.filter(h => h.isAlive);

        if (livingPlayers.length === 0) {
          set({
            battle: {
              ...battle,
              playerTeam,
              enemyTeam,
              log: [...log, '💀 DEFEAT! Your team has been destroyed.'],
              result: 'defeat',
              rewards: null,
            },
          });
          return;
        }
        if (livingEnemies.length === 0) {
          const stageData = CAMPAIGN_STAGES[state.player.campaignStage - 1];
          const goldReward = stageData?.rewards.gold || 100;
          const expReward = stageData?.rewards.experience || 50;
          const gemReward = stageData?.rewards.gems || 5;

          // Apply VIP bonuses
          const vipGoldBonus = 1 + state.player.vipLevel * 0.1;
          const actualGold = Math.floor(goldReward * vipGoldBonus);

          // Level up player
          let newExp = state.player.experience + expReward;
          let newLevel = state.player.level;
          let newGold = state.player.gold + actualGold;
          let newGems = state.player.gems + gemReward;

          while (newExp >= getExperienceForLevel(newLevel)) {
            newExp -= getExperienceForLevel(newLevel);
            newLevel++;
            newGems += 10;
          }

          // Level up heroes
          const updatedHeroes = state.heroes.map(h => {
            if (state.team.includes(h.id)) {
              let heroExp = h.experience + expReward;
              let heroLevel = h.level;
              while (heroExp >= getExperienceForLevel(heroLevel)) {
                heroExp -= getExperienceForLevel(heroLevel);
                heroLevel++;
              }
              const stats = getHeroStats(
                { baseAttack: h.attack / (1 + (h.level - 1) * 0.08) / (1 + (h.stars - 1) * 0.15), baseDefense: h.defense / (1 + (h.level - 1) * 0.08) / (1 + (h.stars - 1) * 0.15), baseHealth: h.health / (1 + (h.level - 1) * 0.08) / (1 + (h.stars - 1) * 0.15), baseSpeed: h.speed / (1 + (h.stars - 1) * 0.05) } as HeroTemplate,
                heroLevel,
                h.stars
              );
              return { ...h, level: heroLevel, experience: heroExp, attack: stats.attack, defense: stats.defense, health: stats.health, speed: stats.speed };
            }
            return h;
          });

          const newCampaignStage = Math.max(state.player.campaignStage, stageData ? stageData.id + 1 : state.player.campaignStage);

          // Equipment drop chance (15% base + 2% per stage)
          const dropChance = 0.15 + (stageData?.id || 1) * 0.02;
          const droppedEquipment = Math.random() < dropChance ? get().generateRandomEquipment(stageData ? stageData.id / 50 : 0) : null;
          const newEquipment = droppedEquipment ? [...state.equipment, droppedEquipment] : state.equipment;

          // Get dropped equipment name for notification
          let dropName = '';
          if (droppedEquipment) {
            const dropTemplate = EQUIPMENT_TEMPLATES.find(t => t.id === droppedEquipment.templateId);
            dropName = dropTemplate ? `${dropTemplate.icon} ${dropTemplate.name}` : 'Equipment';
          }

          set({
            player: {
              ...state.player,
              level: newLevel,
              experience: newExp,
              gold: newGold,
              gems: newGems,
              campaignStage: newCampaignStage,
            },
            heroes: updatedHeroes,
            equipment: newEquipment,
            battlesWon: state.battlesWon + 1,
            totalBattles: state.totalBattles + 1,
            battle: {
              ...battle,
              playerTeam,
              enemyTeam,
              log: [...log, `🏆 VICTORY! +${actualGold} Gold, +${expReward} XP, +${gemReward} Gems`, droppedEquipment ? `🎁 Equipment Drop: ${dropName}!` : ''].filter(Boolean),
              result: 'victory',
              rewards: { gold: actualGold, experience: expReward, gems: gemReward },
            },
          });

          if (droppedEquipment) {
            setTimeout(() => get().addNotification(`🎁 Equipment Drop: ${dropName}!`, 'epic'), 500);
          }
          // Check achievements after victory
          setTimeout(() => get().checkAchievements(), 100);
          return;
        }

        // Player turn
        for (const hero of livingPlayers) {
          const target = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
          if (!target) continue;

          const isCrit = Math.random() < hero.critRate;
          let damage = Math.floor(hero.attack * (1.5 + Math.random() * 0.5) * (isCrit ? hero.critDamage : 1));
          const defReduction = target.defense / (target.defense + 500);
          damage = Math.floor(damage * (1 - defReduction));

          // Track max damage for achievements
          if (damage > state.maxDamage) {
            set({ maxDamage: damage });
          }

          const enemyIdx = enemyTeam.findIndex(e => e.id === target.id);
          enemyTeam[enemyIdx] = {
            ...target,
            currentHealth: Math.max(0, target.currentHealth - damage),
            isAlive: target.currentHealth - damage > 0,
          };

          log.push(`${hero.name} attacks ${target.name} for ${damage}${isCrit ? ' CRIT!' : ''}`);

          if (enemyTeam[enemyIdx].currentHealth <= 0) {
            enemyTeam[enemyIdx] = { ...enemyTeam[enemyIdx], isAlive: false, currentHealth: 0 };
            log.push(`💀 ${target.name} has been slain!`);
          }
        }

        // Check if enemies are dead
        const remainingEnemies = enemyTeam.filter(e => e.isAlive);
        if (remainingEnemies.length === 0) {
          // Victory will be handled on next call
          set({
            battle: {
              ...battle,
              playerTeam,
              enemyTeam,
              log,
              currentTurn: 'player',
              turnNumber: battle.turnNumber + 1,
            },
          });
          setTimeout(() => get().executeBattleTurn(), 100);
          return;
        }

        // Enemy turn
        const updatedLivingEnemies = enemyTeam.filter(e => e.isAlive);
        const updatedLivingPlayers = playerTeam.filter(h => h.isAlive);

        for (const enemy of updatedLivingEnemies) {
          const target = updatedLivingPlayers[Math.floor(Math.random() * updatedLivingPlayers.length)];
          if (!target) continue;

          const isCrit = Math.random() < enemy.critRate;
          let damage = Math.floor(enemy.attack * (1.2 + Math.random() * 0.3) * (isCrit ? enemy.critDamage : 1));
          const defReduction = target.defense / (target.defense + 500);
          damage = Math.floor(damage * (1 - defReduction));

          const playerIdx = playerTeam.findIndex(p => p.id === target.id);
          playerTeam[playerIdx] = {
            ...target,
            currentHealth: Math.max(0, target.currentHealth - damage),
            isAlive: target.currentHealth - damage > 0,
          };

          log.push(`${enemy.name} attacks ${target.name} for ${damage}${isCrit ? ' CRIT!' : ''}`);

          if (playerTeam[playerIdx].currentHealth <= 0) {
            playerTeam[playerIdx] = { ...playerTeam[playerIdx], isAlive: false, currentHealth: 0 };
            log.push(`💀 ${target.name} has fallen!`);
          }
        }

        const newTurnNumber = battle.turnNumber + 1;
        log.push(`━━━ Turn ${newTurnNumber} ━━━━`);
        set({
          battle: {
            ...battle,
            playerTeam,
            enemyTeam,
            log: log.slice(-20), // Keep last 20 messages
            currentTurn: 'player',
            turnNumber: newTurnNumber,
          },
        });

        // Auto-play continues
        if (state.battle?.autoPlay && !state.battle.result) {
          setTimeout(() => get().executeBattleTurn(), 1500 / (state.battle?.speed || 1));
        }
      },

      toggleAutoPlay: () => {
        const state = get();
        if (!state.battle) return;
        const autoPlay = !state.battle.autoPlay;
        set({ battle: { ...state.battle, autoPlay } });
        if (autoPlay && !state.battle.result) {
          setTimeout(() => get().executeBattleTurn(), 1500 / (state.battle?.speed || 1));
        }
      },

      toggleBattleSpeed: () => {
        const state = get();
        if (!state.battle) return;
        set({ battle: { ...state.battle, speed: state.battle.speed === 1 ? 2 : 1 } });
      },

      buyShopItem: (itemId, price, currency, type, amount) => {
        const state = get();
        if (currency === 'gems' && state.player.gems < price) {
          state.addNotification('Not enough gems!', 'warning');
          return;
        }
        if (currency === 'gold' && state.player.gold < price) {
          state.addNotification('Not enough gold!', 'warning');
          return;
        }

        const updates: Partial<PlayerState> = {};
        if (currency === 'gems') updates.gems = state.player.gems - price;
        if (currency === 'gold') updates.gold = state.player.gold - price;

        if (type === 'gems') updates.gems = (updates.gems || state.player.gems) + amount;
        if (type === 'gold') updates.gold = (updates.gold || state.player.gold) + amount;
        if (type === 'energy') {
          updates.energy = state.player.maxEnergy;
          updates.maxEnergy = state.player.maxEnergy;
        }
        if (type === 'vip_points') {
          const newVipPoints = state.player.vipPoints + amount;
          const nextVipLevel = VIP_LEVELS.find(v => v.requiredPoints > newVipPoints);
          if (nextVipLevel && nextVipLevel.level - 1 > state.player.vipLevel) {
            updates.vipLevel = nextVipLevel.level - 1;
            state.addNotification(`🎉 VIP Level Up! You are now VIP ${nextVipLevel.level - 1}!`, 'epic');
          }
          updates.vipPoints = newVipPoints;
        }

        // For USD items, add VIP points
        if (currency === 'usd') {
          const vipPoints = Math.floor(amount / 10);
          const newVipPoints = state.player.vipPoints + vipPoints;
          updates.vipPoints = newVipPoints;
          updates.totalSpent = state.player.totalSpent + price;
          const nextVipLevel = VIP_LEVELS.find(v => v.requiredPoints > newVipPoints);
          if (nextVipLevel && nextVipLevel.level - 1 > state.player.vipLevel) {
            updates.vipLevel = nextVipLevel.level - 1;
          }
          if (type === 'gems') updates.gems = state.player.gems + amount;
          if (type === 'vip_points') updates.vipPoints = newVipPoints;
        }

        set({ player: { ...state.player, ...updates } });
        state.addNotification(`Purchased successfully! +${amount} ${type}`, 'success');
      },

      claimDailyReward: () => {
        const state = get();
        if (state.dailyClaimed) return;

        const day = (state.player.dailyRewardDay % 7);
        const reward = DAILY_REWARDS[day];
        if (!reward) return;

        set({
          player: {
            ...state.player,
            gold: state.player.gold + reward.gold,
            gems: state.player.gems + reward.gems,
            dailyRewardDay: state.player.dailyRewardDay + 1,
          },
          dailyClaimed: true,
          showDailyReward: false,
        });
        state.addNotification(`Daily reward claimed! +${reward.gold} Gold, +${reward.gems} Gems, ${reward.item}`, 'success');
      },

      levelUpHero: (heroId) => {
        const state = get();
        const hero = state.heroes.find(h => h.id === heroId);
        if (!hero) return;

        const cost = hero.level * 500;
        if (state.player.gold < cost) {
          state.addNotification('Not enough gold to level up!', 'warning');
          return;
        }

        const newLevel = hero.level + 1;
        const template = {
          baseAttack: hero.attack / (1 + (hero.level - 1) * 0.08) / (1 + (hero.stars - 1) * 0.15),
          baseDefense: hero.defense / (1 + (hero.level - 1) * 0.08) / (1 + (hero.stars - 1) * 0.15),
          baseHealth: hero.health / (1 + (hero.level - 1) * 0.08) / (1 + (hero.stars - 1) * 0.15),
          baseSpeed: hero.speed / (1 + (hero.stars - 1) * 0.05),
        } as HeroTemplate;
        const stats = getHeroStats(template, newLevel, hero.stars);

        set({
          player: { ...state.player, gold: state.player.gold - cost },
          heroes: state.heroes.map(h =>
            h.id === heroId ? { ...h, level: newLevel, attack: stats.attack, defense: stats.defense, health: stats.health, speed: stats.speed } : h
          ),
        });
      },

      ascendHero: (heroId) => {
        const state = get();
        const hero = state.heroes.find(h => h.id === heroId);
        if (!hero || hero.ascended) return;
        if (hero.level < 20) {
          state.addNotification('Hero must be level 20 to ascend!', 'warning');
          return;
        }

        const cost = RARITY_CONFIG[hero.rarity].stars * 2000;
        if (state.player.gems < cost) {
          state.addNotification(`Need ${cost} gems to ascend!`, 'warning');
          return;
        }

        const newStars = hero.stars + 1;
        const template = {
          baseAttack: hero.attack / (1 + (hero.level - 1) * 0.08) / (1 + (hero.stars - 1) * 0.15),
          baseDefense: hero.defense / (1 + (hero.level - 1) * 0.08) / (1 + (hero.stars - 1) * 0.15),
          baseHealth: hero.health / (1 + (hero.level - 1) * 0.08) / (1 + (hero.stars - 1) * 0.15),
          baseSpeed: hero.speed / (1 + (hero.stars - 1) * 0.05),
        } as HeroTemplate;
        const stats = getHeroStats(template, hero.level, newStars);

        set({
          player: { ...state.player, gems: state.player.gems - cost },
          heroes: state.heroes.map(h =>
            h.id === heroId ? { ...h, stars: newStars, ascended: true, attack: stats.attack, defense: stats.defense, health: stats.health, speed: stats.speed } : h
          ),
        });
        state.addNotification(`${hero.name} has ascended! ⭐${newStars}`, 'epic');
      },

      sacrificeHero: (heroId) => {
        const state = get();
        const hero = state.heroes.find(h => h.id === heroId);
        if (!hero) return;

        // Unequip any equipment on this hero
        const updatedEquipment = state.equipment.map(e =>
          e.equippedTo === heroId ? { ...e, equippedTo: undefined } : e
        );

        // Remove hero from team if present
        const updatedTeam = state.team.filter(id => id !== heroId);

        // Remove hero from heroes array
        set({
          heroes: state.heroes.filter(h => h.id !== heroId),
          team: updatedTeam.length > 0 ? updatedTeam : state.team, // keep at least 1 hero in team
          equipment: updatedEquipment,
        });
      },

      sacrificeAscend: (heroId, sacrificeHeroIds) => {
        const state = get();
        const hero = state.heroes.find(h => h.id === heroId);
        if (!hero) return;

        // Check star cap
        if (hero.stars >= 6) {
          state.addNotification(`${hero.name} is already at maximum star rating!`, 'warning');
          return;
        }

        // Get ascension cost
        const cost = ASCENSION_COSTS[hero.stars];
        if (!cost) return;

        // Validate sacrifice heroes exist and are duplicates (same templateId, same rarity)
        const sacrificeHeroes = sacrificeHeroIds.map(id => state.heroes.find(h => h.id === id)).filter(Boolean) as HeroInstance[];
        const validSacrifices = sacrificeHeroes.filter(h => h.templateId === hero.templateId && h.rarity === hero.rarity && h.id !== heroId);

        if (validSacrifices.length < cost.duplicatesRequired) {
          state.addNotification(`Need ${cost.duplicatesRequired} duplicate heroes to ascend! Have ${validSacrifices.length}.`, 'warning');
          return;
        }

        if (state.player.gold < cost.goldCost) {
          state.addNotification(`Need ${cost.goldCost.toLocaleString()} gold to ascend! Have ${state.player.gold.toLocaleString()}.`, 'warning');
          return;
        }

        // Remove sacrificed heroes
        const sacrificedIds = validSacrifices.slice(0, cost.duplicatesRequired).map(h => h.id);
        let remainingHeroes = state.heroes.filter(h => !sacrificedIds.includes(h.id));

        // Unequip equipment from sacrificed heroes
        let updatedEquipment = state.equipment.map(e =>
          sacrificedIds.includes(e.equippedTo || '') ? { ...e, equippedTo: undefined } : e
        );

        // Remove sacrificed heroes from team
        let updatedTeam = state.team.filter(id => !sacrificedIds.includes(id));

        // If team is now empty, add the ascending hero
        if (updatedTeam.length === 0) {
          updatedTeam = [heroId];
        }

        // Calculate new stats with +10% per star ascension
        const newStars = hero.stars + 1;
        const boostMultiplier = 1 + cost.statBoost;
        const newAttack = Math.floor(hero.attack * boostMultiplier);
        const newDefense = Math.floor(hero.defense * boostMultiplier);
        const newHealth = Math.floor(hero.health * boostMultiplier);
        const newSpeed = Math.floor(hero.speed * (1 + cost.statBoost * 0.5));

        // Update the ascending hero
        remainingHeroes = remainingHeroes.map(h =>
          h.id === heroId
            ? {
                ...h,
                stars: newStars,
                ascended: newStars >= hero.stars + 1,
                attack: newAttack,
                defense: newDefense,
                health: newHealth,
                speed: newSpeed,
                inTeam: updatedTeam.includes(h.id),
              }
            : { ...h, inTeam: updatedTeam.includes(h.id) }
        );

        set({
          player: { ...state.player, gold: state.player.gold - cost.goldCost },
          heroes: remainingHeroes,
          team: updatedTeam,
          equipment: updatedEquipment,
        });

        state.addNotification(`✦ ${hero.name} ascended to ★${newStars}! ${sacrificedIds.length} hero${sacrificedIds.length > 1 ? 'es' : ''} sacrificed!`, 'epic');
      },

      awakenHero: (heroId) => {
        const state = get();
        const hero = state.heroes.find(h => h.id === heroId);
        if (!hero) return;

        const currentLevel = hero.awakeningLevel;
        if (currentLevel >= 5) {
          state.addNotification(`${hero.name} is already at maximum awakening!`, 'warning');
          return;
        }

        const nextAwakening = AWAKENING_LEVELS[currentLevel];
        const materialName = ELEMENT_CONFIG[hero.element].awakeningMaterial;
        const materialOwned = state.dungeonMaterials[materialName] || 0;

        if (materialOwned < nextAwakening.materialCost) {
          state.addNotification(`Need ${nextAwakening.materialCost} ${materialName}! Have ${materialOwned}. Collect more from daily dungeons.`, 'warning');
          return;
        }
        if (state.player.gold < nextAwakening.goldCost) {
          state.addNotification(`Need ${nextAwakening.goldCost.toLocaleString()} gold for awakening!`, 'warning');
          return;
        }

        // Apply stat boost
        const boostMultiplier = 1 + nextAwakening.statBoost;
        const newMaterials = { ...state.dungeonMaterials };
        newMaterials[materialName] -= nextAwakening.materialCost;

        set({
          player: { ...state.player, gold: state.player.gold - nextAwakening.goldCost },
          dungeonMaterials: newMaterials,
          heroes: state.heroes.map(h =>
            h.id === heroId
              ? {
                  ...h,
                  awakened: true,
                  awakeningLevel: currentLevel + 1,
                  attack: Math.floor(h.attack * boostMultiplier),
                  defense: Math.floor(h.defense * boostMultiplier),
                  health: Math.floor(h.health * boostMultiplier),
                  speed: Math.floor(h.speed * (1 + nextAwakening.statBoost * 0.5)),
                }
              : h
          ),
        });
        state.addNotification(`✨ ${hero.name} has reached Awakening Level ${currentLevel + 1}! ${nextAwakening.effect}`, 'epic');
        get().checkAchievements();
      },

      addGems: (amount) => set(state => ({ player: { ...state.player, gems: state.player.gems + amount } })),
      addGold: (amount) => set(state => ({ player: { ...state.player, gold: state.player.gold + amount } })),
      addVIPPoints: (amount) => {
        const state = get();
        const newPoints = state.player.vipPoints + amount;
        const nextVipLevel = VIP_LEVELS.find(v => v.requiredPoints > newPoints);
        const newVipLevel = nextVipLevel ? nextVipLevel.level - 1 : state.player.vipLevel;
        set({
          player: {
            ...state.player,
            vipPoints: newPoints,
            vipLevel: Math.max(newVipLevel, state.player.vipLevel),
            totalSpent: state.player.totalSpent + amount,
          },
        });
      },

      refillEnergy: () => set(state => ({ player: { ...state.player, energy: state.player.maxEnergy } })),

      clearSummonResults: () => set({ summonResults: [], showSummonAnimation: false }),
      setShowSummonAnimation: (show) => set({ showSummonAnimation: show }),
      setShowDailyReward: (show) => set({ showDailyReward: show }),

      addNotification: (message, type) => {
        const id = `notif_${Date.now()}_${Math.random()}`;
        set(state => ({
          notifications: [...state.notifications.slice(-4), { id, message, type }],
        }));
        setTimeout(() => get().clearNotification(id), 4000);
      },

      clearNotification: (id) => set(state => ({
        notifications: state.notifications.filter(n => n.id !== id),
      })),

      endBattle: () => set({ battle: null }),

      checkEnergyRefill: () => {
        const state = get();
        const now = Date.now();
        const elapsed = now - state.player.lastLoginAt;
        const energyGain = Math.floor(elapsed / (5 * 60 * 1000)); // 1 energy per 5 min
        if (energyGain > 0 && state.player.energy < state.player.maxEnergy) {
          set({
            player: {
              ...state.player,
              energy: Math.min(state.player.maxEnergy, state.player.energy + energyGain),
              lastLoginAt: now,
            },
          });
        }
      },

      // ============= EQUIPMENT SYSTEM =============
      generateRandomEquipment: (rarityBias) => {
        const roll = Math.random() + (rarityBias || 0);
        let rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
        if (roll > 1.99) rarity = 'mythic';
        else if (roll > 1.95) rarity = 'legendary';
        else if (roll > 1.85) rarity = 'epic';
        else if (roll > 1.65) rarity = 'rare';
        else if (roll > 1.4) rarity = 'uncommon';
        else rarity = 'common';

        const eligible = EQUIPMENT_TEMPLATES.filter(e => e.rarity === rarity);
        const template = eligible[Math.floor(Math.random() * eligible.length)] || EQUIPMENT_TEMPLATES[0];
        return {
          id: `eq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          templateId: template.id,
        };
      },

      equipItem: (equipmentId, heroId) => {
        const state = get();
        const item = state.equipment.find(e => e.id === equipmentId);
        if (!item) return;
        const template = EQUIPMENT_TEMPLATES.find(t => t.id === item.templateId);
        if (!template) return;
        const hero = state.heroes.find(h => h.id === heroId);
        if (!hero) return;

        // Unequip from current holder if any
        const updatedEquipment = state.equipment.map(e => {
          if (e.id === equipmentId) return { ...e, equippedTo: heroId };
          // Unequip any existing item in the same slot on this hero
          const existingTemplate = EQUIPMENT_TEMPLATES.find(t => t.id === e.templateId);
          if (e.equippedTo === heroId && existingTemplate?.slot === template.slot) {
            return { ...e, equippedTo: undefined };
          }
          return e;
        });

        // Apply stat bonuses to hero
        const updatedHeroes = state.heroes.map(h => {
          if (h.id !== heroId) return h;
          // Calculate new stats from base + all equipped items
          const baseTemplate = HERO_TEMPLATES.find(t => t.id === h.templateId);
          if (!baseTemplate) return h;
          const baseStats = getHeroStats(baseTemplate, h.level, h.stars);
          let bonusAttack = 0, bonusDefense = 0, bonusHealth = 0, bonusSpeed = 0;
          let bonusCritRate = 0, bonusCritDamage = 0;
          updatedEquipment.forEach(e => {
            if (e.equippedTo === heroId) {
              const t = EQUIPMENT_TEMPLATES.find(t => t.id === e.templateId);
              if (t) {
                bonusAttack += t.attackBonus || 0;
                bonusDefense += t.defenseBonus || 0;
                bonusHealth += t.healthBonus || 0;
                bonusSpeed += t.speedBonus || 0;
                bonusCritRate += t.critRateBonus || 0;
                bonusCritDamage += t.critDamageBonus || 0;
              }
            }
          });
          return {
            ...h,
            attack: baseStats.attack + bonusAttack,
            defense: baseStats.defense + bonusDefense,
            health: baseStats.health + bonusHealth,
            speed: baseStats.speed + bonusSpeed,
            critRate: baseTemplate.critRate + bonusCritRate,
            critDamage: baseTemplate.critDamage + bonusCritDamage,
          };
        });

        set({ equipment: updatedEquipment, heroes: updatedHeroes });
        state.addNotification(`Equipped ${template.name} on ${hero.name}`, 'success');
      },

      unequipItem: (equipmentId) => {
        const state = get();
        const item = state.equipment.find(e => e.id === equipmentId);
        if (!item || !item.equippedTo) return;
        const template = EQUIPMENT_TEMPLATES.find(t => t.id === item.templateId);
        if (!template) return;
        const heroId = item.equippedTo;

        const updatedEquipment = state.equipment.map(e =>
          e.id === equipmentId ? { ...e, equippedTo: undefined } : e
        );

        // Recalculate hero stats
        const updatedHeroes = state.heroes.map(h => {
          if (h.id !== heroId) return h;
          const baseTemplate = HERO_TEMPLATES.find(t => t.id === h.templateId);
          if (!baseTemplate) return h;
          const baseStats = getHeroStats(baseTemplate, h.level, h.stars);
          let bonusAttack = 0, bonusDefense = 0, bonusHealth = 0, bonusSpeed = 0;
          let bonusCritRate = 0, bonusCritDamage = 0;
          updatedEquipment.forEach(e => {
            if (e.equippedTo === heroId) {
              const t = EQUIPMENT_TEMPLATES.find(t => t.id === e.templateId);
              if (t) {
                bonusAttack += t.attackBonus || 0;
                bonusDefense += t.defenseBonus || 0;
                bonusHealth += t.healthBonus || 0;
                bonusSpeed += t.speedBonus || 0;
                bonusCritRate += t.critRateBonus || 0;
                bonusCritDamage += t.critDamageBonus || 0;
              }
            }
          });
          return {
            ...h,
            attack: baseStats.attack + bonusAttack,
            defense: baseStats.defense + bonusDefense,
            health: baseStats.health + bonusHealth,
            speed: baseStats.speed + bonusSpeed,
            critRate: baseTemplate.critRate + bonusCritRate,
            critDamage: baseTemplate.critDamage + bonusCritDamage,
          };
        });

        set({ equipment: updatedEquipment, heroes: updatedHeroes });
      },

      craftEquipment: (rarity) => {
        const state = get();
        const costs: Record<string, { gold: number; gems: number }> = {
          common: { gold: 500, gems: 0 },
          uncommon: { gold: 2000, gems: 10 },
          rare: { gold: 8000, gems: 50 },
          epic: { gold: 25000, gems: 200 },
          legendary: { gold: 100000, gems: 800 },
        };
        const cost = costs[rarity];
        if (!cost) return;
        if (state.player.gold < cost.gold || state.player.gems < cost.gems) {
          state.addNotification('Not enough resources to craft!', 'warning');
          return;
        }

        const eligible = EQUIPMENT_TEMPLATES.filter(e => e.rarity === rarity);
        const template = eligible[Math.floor(Math.random() * eligible.length)];
        if (!template) return;

        const newItem: OwnedEquipment = {
          id: `eq_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          templateId: template.id,
        };

        set({
          player: { ...state.player, gold: state.player.gold - cost.gold, gems: state.player.gems - cost.gems },
          equipment: [...state.equipment, newItem],
        });
        state.addNotification(`Forged ${template.icon} ${template.name}!`, 'epic');
      },

      // ============= ACHIEVEMENTS =============
      checkAchievements: () => {
        const state = get();
        const newlyUnlocked: Achievement[] = [];

        for (const achievement of ACHIEVEMENTS) {
          if (state.unlockedAchievements.includes(achievement.id)) continue;

          let progress = 0;
          switch (achievement.id) {
            case 'first_battle':
            case 'battles_10':
            case 'battles_50':
            case 'battles_100':
              progress = state.battlesWon;
              break;
            case 'stage_10':
            case 'stage_25':
            case 'stage_50':
              progress = state.player.campaignStage - 1;
              break;
            case 'heroes_5':
            case 'heroes_15':
            case 'heroes_30':
            case 'heroes_all':
              progress = state.heroes.length;
              break;
            case 'vip_1':
            case 'vip_3':
            case 'vip_5':
            case 'vip_7':
              progress = state.player.vipLevel;
              break;
            case 'rich_100k':
            case 'rich_1m':
              progress = state.player.gold;
              break;
          }

          if (progress >= achievement.requirement) {
            newlyUnlocked.push(achievement);
          }
        }

        if (newlyUnlocked.length > 0) {
          const newIds = newlyUnlocked.map(a => a.id);
          let bonusGold = 0, bonusGems = 0, bonusVip = 0;
          newlyUnlocked.forEach(a => {
            bonusGold += a.reward.gold || 0;
            bonusGems += a.reward.gems || 0;
            bonusVip += a.reward.vipPoints || 0;
          });

          set({
            unlockedAchievements: [...state.unlockedAchievements, ...newIds],
            player: {
              ...state.player,
              gold: state.player.gold + bonusGold,
              gems: state.player.gems + bonusGems,
              vipPoints: state.player.vipPoints + bonusVip,
            },
            showAchievementUnlock: newlyUnlocked[0],
          });
        }
      },

      dismissAchievementUnlock: () => set({ showAchievementUnlock: null }),

      // ============= ARENA =============
      startArenaBattle: (opponentId) => {
        const state = get();
        if (Date.now() < state.arenaCooldown) {
          state.addNotification('Arena is on cooldown! Wait for the timer.', 'warning');
          return;
        }
        if (state.player.energy < 10) {
          state.addNotification('Not enough energy for arena battle!', 'warning');
          return;
        }

        const opponent = ARENA_OPPONENTS.find(o => o.id === opponentId);
        if (!opponent) return;

        // Simplified auto-battle calculation based on power
        const playerPower = state.team.reduce((sum, id) => {
          const h = state.heroes.find(hr => hr.id === id);
          return sum + (h ? h.attack + h.defense + Math.floor(h.health / 10) + h.speed * 5 : 0);
        }, 0);

        const winChance = Math.min(0.85, Math.max(0.15, playerPower / (playerPower + opponent.power)));
        const won = Math.random() < winChance;

        const trophies = won ? opponent.reward.trophies : Math.max(1, Math.floor(opponent.reward.trophies * 0.3));
        const gold = won ? opponent.reward.gold : Math.floor(opponent.reward.gold * 0.2);
        const gems = won ? opponent.reward.gems : 0;

        set({
          player: {
            ...state.player,
            energy: state.player.energy - 10,
            gold: state.player.gold + gold,
            gems: state.player.gems + gems,
          },
          arenaTrophies: state.arenaTrophies + (won ? trophies : -Math.min(trophies, state.arenaTrophies)),
          arenaWins: state.arenaWins + (won ? 1 : 0),
          arenaLosses: state.arenaLosses + (won ? 0 : 1),
          arenaCooldown: Date.now() + 5 * 60 * 1000, // 5 min cooldown
          battlesWon: won ? state.battlesWon + 1 : state.battlesWon,
          totalBattles: state.totalBattles + 1,
        });

        if (won) {
          state.addNotification(`🏆 Arena Victory! +${gold} Gold, +${gems} Gems, +${trophies} Trophies`, 'epic');
          get().updateMissionProgress('battle', 1);
        } else {
          state.addNotification(`💀 Arena Defeat! +${gold} Gold consolation prize`, 'warning');
        }
        get().checkAchievements();
      },

      // ============= MISSIONS =============
      updateMissionProgress: (type, amount) => {
        const state = get();
        const updated = state.missionProgress.map(mp => {
          const mission = DAILY_MISSIONS.find(m => m.id === mp.missionId);
          if (mission && mission.type === type && !mp.claimed) {
            return { ...mp, progress: mp.progress + amount };
          }
          return mp;
        });
        set({ missionProgress: updated });
      },

      claimMissionReward: (missionId) => {
        const state = get();
        const mp = state.missionProgress.find(m => m.missionId === missionId);
        if (!mp || mp.claimed) return;
        const mission = DAILY_MISSIONS.find(m => m.id === missionId);
        if (!mission || mp.progress < mission.requirement) return;

        set({
          player: {
            ...state.player,
            gold: state.player.gold + mission.reward.gold,
            gems: state.player.gems + mission.reward.gems,
            experience: state.player.experience + mission.reward.experience,
          },
          missionProgress: state.missionProgress.map(m =>
            m.missionId === missionId ? { ...m, claimed: true } : m
          ),
        });
        state.addNotification(`Mission complete! +${mission.reward.gold} Gold, +${mission.reward.gems} Gems`, 'success');
      },

      refreshMissions: () => {
        const now = Date.now();
        const lastRefresh = get().missionsLastRefreshed;
        // Refresh if more than 24 hours have passed
        if (now - lastRefresh > 24 * 60 * 60 * 1000) {
          set({
            missionProgress: DAILY_MISSIONS.map(m => ({ missionId: m.id, progress: 0, claimed: false })),
            missionsLastRefreshed: now,
          });
        }
      },

      // ============= GUILD =============
      joinGuild: (guildId) => {
        set({ guildId });
        get().addNotification('Joined guild! Enjoy guild perks!', 'success');
      },

      leaveGuild: () => {
        set({ guildId: null });
        get().addNotification('Left guild.', 'info');
      },

      // ============= TOWER OF ETERNITY =============
      startTowerBattle: (floor) => {
        const state = get();
        // Reset attempts if 24h passed
        const now = Date.now();
        let attempts = state.towerAttempts;
        if (now - state.towerLastReset > 24 * 60 * 60 * 1000) {
          attempts = 5;
        }
        if (attempts <= 0) {
          state.addNotification('No tower attempts left today! Come back tomorrow.', 'warning');
          return null;
        }
        if (floor > state.towerCurrentFloor) {
          state.addNotification(`You must clear floor ${state.towerCurrentFloor} first!`, 'warning');
          return null;
        }
        if (state.team.length === 0) {
          state.addNotification('You need a team to enter the tower!', 'warning');
          return null;
        }

        const floorData = TOWER_FLOORS[floor - 1];
        if (!floorData) return null;

        // Calculate player power
        const playerPower = state.team.reduce((sum, id) => {
          const h = state.heroes.find(hr => hr.id === id);
          return sum + (h ? h.attack + h.defense + Math.floor(h.health / 10) + h.speed * 5 : 0);
        }, 0);

        // Enemy power scales with floor
        const enemyPower = Math.floor(15000 * floorData.difficulty * (floorData.bossFloor ? 1.5 : 1));

        // Win chance: harder as floor increases
        const winChance = Math.min(0.95, Math.max(0.05, playerPower / (playerPower + enemyPower)));
        const won = Math.random() < winChance;

        const rewards = {
          gold: won ? floorData.rewardGold : Math.floor(floorData.rewardGold * 0.1),
          gems: won ? floorData.rewardGems : 0,
          item: won ? floorData.rewardItem : undefined,
        };

        const newHighest = won ? Math.max(state.towerHighestFloor, floor) : state.towerHighestFloor;
        const newCurrent = won ? Math.max(state.towerCurrentFloor, floor + 1) : state.towerCurrentFloor;

        set({
          player: {
            ...state.player,
            gold: state.player.gold + rewards.gold,
            gems: state.player.gems + rewards.gems,
          },
          towerHighestFloor: newHighest,
          towerCurrentFloor: newCurrent,
          towerAttempts: attempts - 1,
          towerLastReset: now - state.towerLastReset > 24 * 60 * 60 * 1000 ? now : state.towerLastReset,
          battlesWon: won ? state.battlesWon + 1 : state.battlesWon,
          totalBattles: state.totalBattles + 1,
        });

        if (won) {
          state.addNotification(
            `🏆 Tower Floor ${floor} cleared! +${rewards.gold} Gold, +${rewards.gems} Gems${rewards.item ? `, ${rewards.item}` : ''}`,
            'epic'
          );
          get().updateMissionProgress('battle', 1);
          // Drop equipment on every 5th floor
          if (floor % 5 === 0) {
            const newItem = get().generateRandomEquipment(floor / 25);
            set({ equipment: [...get().equipment, newItem] });
            state.addNotification(`🎁 Equipment dropped on floor ${floor}!`, 'epic');
          }
        } else {
          state.addNotification(`💀 Tower Floor ${floor} defeated you! +${rewards.gold} Gold consolation`, 'warning');
        }
        get().checkAchievements();

        return { won, rewards };
      },

      resetTowerProgress: () => {
        set({
          towerCurrentFloor: 1,
          towerAttempts: 5,
          towerLastReset: Date.now(),
        });
        get().addNotification('Tower progress reset. 5 attempts refreshed!', 'info');
      },

      // ============= DAILY DUNGEONS =============
      canEnterDungeon: (dungeonId) => {
        const state = get();
        const dungeon = getDungeonById(dungeonId);
        if (!dungeon) return false;

        // Check correct day of week
        const today = new Date().getDay();
        if (dungeon.dayOfWeek !== today) return false;

        // Check attempts remaining (resets every 24h)
        const now = Date.now();
        const resetElapsed = now - state.dungeonLastReset;
        const isReset = resetElapsed > 24 * 60 * 60 * 1000;
        const attemptsUsed = isReset ? 0 : (state.dungeonAttempts[dungeonId] || 0);
        if (attemptsUsed >= 3) return false;

        // Need a team
        if (state.team.length === 0) return false;

        // Need energy
        if (state.player.energy < 15) return false;

        return true;
      },

      resetDungeonAttempts: () => {
        const state = get();
        const now = Date.now();
        const resetElapsed = now - state.dungeonLastReset;
        if (resetElapsed > 24 * 60 * 60 * 1000) {
          set({
            dungeonAttempts: {},
            dungeonLastReset: now,
          });
        }
      },

      startDungeonBattle: (dungeonId, stage) => {
        const state = get();
        const dungeon = getDungeonById(dungeonId);
        if (!dungeon) return null;

        const stageData = dungeon.stages[stage - 1];
        if (!stageData) return null;

        // Auto-reset attempts if 24h passed
        const now = Date.now();
        const resetElapsed = now - state.dungeonLastReset;
        const isReset = resetElapsed > 24 * 60 * 60 * 1000;
        const attemptsUsed = isReset ? 0 : (state.dungeonAttempts[dungeonId] || 0);

        // Day check
        const today = new Date().getDay();
        if (dungeon.dayOfWeek !== today) {
          state.addNotification(`${dungeon.name} is not available today!`, 'warning');
          return null;
        }

        // Attempts check
        if (attemptsUsed >= 3) {
          state.addNotification(`No attempts left for ${dungeon.name} today!`, 'warning');
          return null;
        }

        // Team check
        if (state.team.length === 0) {
          state.addNotification('You need a team to enter the dungeon!', 'warning');
          return null;
        }

        // Energy check (15 energy per dungeon battle)
        if (state.player.energy < 15) {
          state.addNotification('Not enough energy for a dungeon battle! (15 required)', 'warning');
          return null;
        }

        // Stage progression check — must have cleared previous stage (or be stage 1)
        if (stage > 1) {
          const highestCleared = state.dungeonHighestStage[dungeonId] || 0;
          if (stage > highestCleared + 1) {
            state.addNotification(`Clear stage ${stage - 1} first!`, 'warning');
            return null;
          }
        }

        // Calculate player power (matches arena/tower formula)
        const playerPower = state.team.reduce((sum, id) => {
          const h = state.heroes.find((hr) => hr.id === id);
          return sum + (h ? h.attack + h.defense + Math.floor(h.health / 10) + h.speed * 5 : 0);
        }, 0);

        // Enemy power scales with stage's recommended power and dungeon difficulty
        const enemyPower = Math.floor(stageData.recommendedPower * dungeon.difficulty);
        const winChance = Math.min(0.95, Math.max(0.05, playerPower / (playerPower + enemyPower)));
        const won = Math.random() < winChance;

        // Build rewards
        const rewards = won
          ? {
              gold: stageData.rewards.gold,
              gems: stageData.rewards.gems,
              material: stageData.rewards.material,
              materialCount: stageData.rewards.materialCount,
            }
          : {
              gold: Math.floor(stageData.rewards.gold * 0.15),
              gems: 0,
              material: undefined,
              materialCount: 0,
            };

        // Update material inventory
        const newMaterials = { ...state.dungeonMaterials };
        if (won && rewards.material && rewards.materialCount) {
          newMaterials[rewards.material] = (newMaterials[rewards.material] || 0) + rewards.materialCount;
        }

        // Update highest stage cleared
        const newHighest = { ...state.dungeonHighestStage };
        if (won) {
          newHighest[dungeonId] = Math.max(newHighest[dungeonId] || 0, stage);
        }

        // Update attempts (reset if needed)
        const newAttempts = isReset ? { [dungeonId]: 1 } : { ...state.dungeonAttempts, [dungeonId]: attemptsUsed + 1 };

        set({
          player: {
            ...state.player,
            energy: state.player.energy - 15,
            gold: state.player.gold + rewards.gold,
            gems: state.player.gems + rewards.gems,
          },
          dungeonAttempts: newAttempts,
          dungeonLastReset: isReset ? now : state.dungeonLastReset,
          dungeonMaterials: newMaterials,
          dungeonHighestStage: newHighest,
          battlesWon: won ? state.battlesWon + 1 : state.battlesWon,
          totalBattles: state.totalBattles + 1,
        });

        if (won) {
          state.addNotification(
            `🏆 ${dungeon.name} Stage ${stage} cleared! +${rewards.gold} Gold, +${rewards.gems} Gems, +${rewards.materialCount} ${rewards.material}`,
            'epic'
          );
          get().updateMissionProgress('battle', 1);
        } else {
          state.addNotification(
            `💀 Defeated in ${dungeon.name} Stage ${stage}! +${rewards.gold} Gold consolation`,
            'warning'
          );
        }
        get().checkAchievements();

        return { won, rewards };
      },

      // ============= WANDERING MERCHANT =============
      refreshMerchantIfStale: () => {
        const state = get();
        const { windowStart } = getMerchantWindow(Date.now());
        if (state.merchantWindowStart !== windowStart) {
          // Window changed — reset purchases and update windowStart
          set({
            merchantWindowStart: windowStart,
            merchantPurchases: {},
          });
        }
      },

      getMerchantDeals: () => {
        const state = get();
        // Refresh window if stale
        const { windowStart, seed } = getMerchantWindow(Date.now());
        if (state.merchantWindowStart !== windowStart) {
          set({
            merchantWindowStart: windowStart,
            merchantPurchases: {},
          });
        }
        return rollMerchantDeals(seed);
      },

      getMerchantRemainingStock: (dealId) => {
        const state = get();
        const { seed } = getMerchantWindow(Date.now());
        const deals = rollMerchantDeals(seed);
        const deal = deals.find(d => d.id === dealId);
        if (!deal) return 0;
        const bought = state.merchantPurchases[dealId] || 0;
        return Math.max(0, deal.stock - bought);
      },

      buyMerchantDeal: (dealId) => {
        const state = get();
        // Ensure window is current
        const { windowStart, seed } = getMerchantWindow(Date.now());
        if (state.merchantWindowStart !== windowStart) {
          set({
            merchantWindowStart: windowStart,
            merchantPurchases: {},
          });
        }
        const deals = rollMerchantDeals(seed);
        const deal = deals.find(d => d.id === dealId);
        if (!deal) return { success: false, reason: 'Deal not available' };

        const bought = get().merchantPurchases[dealId] || 0;
        if (bought >= deal.stock) return { success: false, reason: 'Out of stock' };

        if (state.player.gems < deal.discountedPrice) {
          return { success: false, reason: 'Not enough gems' };
        }

        // Apply rewards based on deal type
        const playerUpdates: Partial<PlayerState> = {
          gems: state.player.gems - deal.discountedPrice,
        };

        if (deal.type === 'gold') {
          playerUpdates.gold = state.player.gold + deal.amount;
        } else if (deal.type === 'energy') {
          playerUpdates.energy = Math.min(state.player.maxEnergy, state.player.energy + deal.amount);
        } else if (deal.type === 'vip_points') {
          playerUpdates.vipPoints = state.player.vipPoints + deal.amount;
        }

        // Equipment/material/scroll rewards use existing systems
        const newEquipment = [...state.equipment];
        if (deal.type === 'equipment' && deal.rarity) {
          for (let i = 0; i < deal.amount; i++) {
            const rarityBias = ['rare', 'epic', 'legendary', 'mythic'].indexOf(deal.rarity);
            const eq = state.generateRandomEquipment(rarityBias >= 0 ? rarityBias + 2 : 2);
            newEquipment.push(eq);
          }
        }

        const newMaterials = { ...state.dungeonMaterials };
        if (deal.type === 'material') {
          // Infer material name from deal name (e.g., "Inferno Ember Cache" -> "Inferno Ember")
          const matName = deal.name.replace(' Cache', '').replace(' Bundle', '');
          newMaterials[matName] = (newMaterials[matName] || 0) + deal.amount;
        }

        // Scrolls and hero shards — just notify, the existing shop doesn't track inventory
        // For simplicity, we grant equivalent reward immediately:
        // - scroll: grant a free summon result by adding gems equivalent OR auto-summon
        // We'll handle scrolls by issuing gems back so the user can summon, plus a notification.
        if (deal.type === 'scroll') {
          // Add the scrolls as gem credit (refund at base price) since we don't have a scroll inventory
          // Simpler: just give gems equivalent to the scroll's gem value so user can summon
          playerUpdates.gems = (playerUpdates.gems || 0) + deal.originalPrice * deal.amount;
        }

        set({
          player: { ...state.player, ...playerUpdates },
          equipment: newEquipment,
          dungeonMaterials: newMaterials,
          merchantPurchases: {
            ...get().merchantPurchases,
            [dealId]: bought + 1,
          },
          gemsSpent: state.gemsSpent + deal.discountedPrice,
        });

        // Build notification
        const summary =
          deal.type === 'gold' ? `+${deal.amount.toLocaleString()} Gold` :
          deal.type === 'energy' ? `+${deal.amount} Energy` :
          deal.type === 'equipment' ? `+${deal.amount}x ${deal.rarity} Equipment` :
          deal.type === 'material' ? `+${deal.amount} Materials` :
          deal.type === 'scroll' ? `${deal.amount}x Scroll (gems credited)` :
          `+${deal.amount}`;
        get().addNotification(`🛒 Merchant: ${deal.name} purchased! ${summary}`, 'epic');

        return { success: true };
      },

      // ============= DAILY LOGIN STREAK =============
      checkLoginStreak: () => {
        const state = get();
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        const lastClaim = state.loginStreakLastClaim;
        if (lastClaim === 0) {
          // First-ever visit — show streak reward after a small delay (handled by UI)
          return;
        }
        const elapsed = now - lastClaim;
        if (elapsed >= oneDayMs) {
          // A new day has started — show streak reward modal
          if (!state.showStreakReward) {
            set({ showStreakReward: true });
          }
        }
      },

      claimLoginStreak: () => {
        const state = get();
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        const lastClaim = state.loginStreakLastClaim;
        // Determine new streak
        let newStreak: number;
        if (lastClaim === 0) {
          newStreak = 1;
        } else {
          const elapsed = now - lastClaim;
          if (elapsed < oneDayMs) {
            // Already claimed today
            return { claimed: false };
          }
          // If elapsed > 2 days, streak resets to 1; otherwise increments
          if (elapsed >= 2 * oneDayMs) {
            newStreak = 1;
          } else {
            newStreak = state.loginStreak + 1;
          }
        }

        // Check for milestone at this new streak
        const milestone = LOGIN_STREAK_MILESTONES.find(m => m.day === newStreak);
        const playerUpdates: Partial<PlayerState> = {
          gold: state.player.gold + (milestone ? milestone.reward.gold : 0),
          gems: state.player.gems + (milestone ? milestone.reward.gems : 0),
          energy: milestone?.reward.energy
            ? Math.min(state.player.maxEnergy, state.player.energy + milestone.reward.energy)
            : state.player.energy,
          vipPoints: milestone?.reward.vipPoints
            ? state.player.vipPoints + milestone.reward.vipPoints
            : state.player.vipPoints,
        };

        const newClaimedMilestones = milestone
          ? [...state.claimedStreakMilestones, milestone.day]
          : state.claimedStreakMilestones;

        set({
          player: { ...state.player, ...playerUpdates },
          loginStreak: newStreak,
          loginStreakLastClaim: now,
          claimedStreakMilestones: newClaimedMilestones,
          showStreakReward: false,
        });

        if (milestone) {
          const summary = `+${milestone.reward.gold} Gold, +${milestone.reward.gems} Gems${milestone.reward.energy ? `, +${milestone.reward.energy} Energy` : ''}${milestone.reward.item ? `, ${milestone.reward.item}` : ''}`;
          get().addNotification(`🎯 ${milestone.name}! Day ${newStreak} streak milestone reached! ${summary}`, 'epic');
        } else {
          get().addNotification(`📅 Day ${newStreak} login streak! Keep coming back for milestone rewards!`, 'success');
        }

        return { claimed: true, milestone };
      },

      dismissStreakReward: () => set({ showStreakReward: false }),

      // ============= HERO SKINS =============
      buySkin: (skinId) => {
        const state = get();
        const skin = HERO_SKINS.find(s => s.id === skinId);
        if (!skin) return { success: false, reason: 'Skin not found' };
        if (state.ownedSkins.includes(skinId)) return { success: false, reason: 'Already owned' };
        if (state.player.gems < skin.cost) return { success: false, reason: 'Not enough gems' };

        set({
          player: { ...state.player, gems: state.player.gems - skin.cost },
          ownedSkins: [...state.ownedSkins, skinId],
          gemsSpent: state.gemsSpent + skin.cost,
        });
        get().addNotification(`🎨 Skin unlocked: ${skin.name}! Equip it from the Heroes screen.`, 'epic');
        return { success: true };
      },

      equipSkin: (heroInstanceId, skinId) => {
        const state = get();
        if (!state.ownedSkins.includes(skinId)) return;
        // Validate skin matches hero's template
        const hero = state.heroes.find(h => h.id === heroInstanceId);
        if (!hero) return;
        const skin = HERO_SKINS.find(s => s.id === skinId);
        if (!skin || skin.heroTemplateId !== hero.templateId) return;
        set({
          equippedSkins: { ...state.equippedSkins, [heroInstanceId]: skinId },
        });
      },

      unequipSkin: (heroInstanceId) => {
        const state = get();
        const next = { ...state.equippedSkins };
        delete next[heroInstanceId];
        set({ equippedSkins: next });
      },

      getEquippedSkin: (heroInstanceId) => {
        const state = get();
        const skinId = state.equippedSkins[heroInstanceId];
        if (!skinId) return undefined;
        return HERO_SKINS.find(s => s.id === skinId);
      },
    }),
    {
      name: 'shadow-realms-game-v6',
      version: 6,
      partialize: (state) => ({
        player: state.player,
        heroes: state.heroes,
        team: state.team,
        dailyClaimed: state.dailyClaimed,
        equipment: state.equipment,
        unlockedAchievements: state.unlockedAchievements,
        battlesWon: state.battlesWon,
        totalBattles: state.totalBattles,
        maxDamage: state.maxDamage,
        arenaTrophies: state.arenaTrophies,
        arenaWins: state.arenaWins,
        arenaLosses: state.arenaLosses,
        arenaCooldown: state.arenaCooldown,
        missionProgress: state.missionProgress,
        missionsLastRefreshed: state.missionsLastRefreshed,
        guildId: state.guildId,
        towerHighestFloor: state.towerHighestFloor,
        towerCurrentFloor: state.towerCurrentFloor,
        towerAttempts: state.towerAttempts,
        towerLastReset: state.towerLastReset,
        dungeonAttempts: state.dungeonAttempts,
        dungeonLastReset: state.dungeonLastReset,
        dungeonMaterials: state.dungeonMaterials,
        dungeonHighestStage: state.dungeonHighestStage,
        heroesSummoned: state.heroesSummoned,
        gemsSpent: state.gemsSpent,
        equipmentEquipped: state.equipmentEquipped,
        campaignStagesWon: state.campaignStagesWon,
        heroesLeveledUp: state.heroesLeveledUp,
      }),
    }
  )
);
