// Hero image mapping - maps hero template IDs to generated portraits
export const HERO_IMAGES: Record<string, string> = {
  // KNIGHTS
  'knight_01': '/heroes/sir-galahad.png',
  'knight_02': '/heroes/paladin.png',
  'knight_03': '/heroes/squire-timmons.png',
  'knight_04': '/heroes/dame-valeria.png',
  'knight_05': '/heroes/crusader-roland.png',
  // UNDEAD
  'undead_01': '/heroes/necrolord.png',
  'undead_02': '/heroes/bone-collector.png',
  'undead_03': '/heroes/shambling-horror.png',
  'undead_04': '/heroes/spectral-wraith.png',
  'undead_05': '/heroes/ghoul-scratcher.png',
  // DEMONS
  'demon_01': '/heroes/archdemon.png',
  'demon_02': '/heroes/succubus-lyra.png',
  'demon_03': '/heroes/imp-scorch.png',
  'demon_04': '/heroes/hellhound-cerberus.png',
  'demon_05': '/heroes/corruptor-vex.png',
  // ELVES
  'elf_01': '/heroes/elf-queen.png',
  'elf_02': '/heroes/ranger-sylvana.png',
  'elf_03': '/heroes/elfling-piper.png',
  'elf_04': '/heroes/archmage-elowen.png',
  'elf_05': '/heroes/druid-thalion.png',
  // BARBARIANS
  'barbarian_01': '/heroes/warchief-krong.png',
  'barbarian_02': '/heroes/berserker-ursa.png',
  'barbarian_03': '/heroes/tribal-scout.png',
  'barbarian_04': '/heroes/shaman-zula.png',
  'barbarian_05': '/heroes/axe-thrower-grok.png',
  // DARK ELVES
  'darkelf_01': '/heroes/shadow-queen.png',
  'darkelf_02': '/heroes/assassin-vexil.png',
  'darkelf_03': '/heroes/dark-initiate.png',
  'darkelf_04': '/heroes/warlock-zaros.png',
  'darkelf_05': '/heroes/nightblade-sira.png',
  // SPECIAL
  'special_01': '/heroes/dragon-lord.png',
  'special_02': '/heroes/valkyrie-astrid.png',
  'special_03': '/heroes/necrolord.png',
  'special_04': '/heroes/world-tree-yggdra.png',
  'special_05': '/heroes/shadow-queen.png', // Void Emperor - reusing shadow queen
};

// Portal and background images
export const GAME_IMAGES = {
  summonPortal: '/heroes/summon-portal.png',
  titleBg: '/heroes/title-bg.png',
};

// Get hero image URL, returns undefined if no specific image exists
export function getHeroImageUrl(templateId: string): string | undefined {
  return HERO_IMAGES[templateId];
}

// Get a rarity-appropriate placeholder gradient
export function getHeroGradient(rarity: string): string {
  const gradients: Record<string, string> = {
    common: 'from-gray-600 to-gray-800',
    uncommon: 'from-green-700 to-green-900',
    rare: 'from-blue-700 to-blue-900',
    epic: 'from-purple-700 to-purple-900',
    legendary: 'from-amber-600 to-amber-900',
    mythic: 'from-red-600 to-red-900',
  };
  return gradients[rarity] || 'from-gray-600 to-gray-800';
}
