import type { PokemonId, PokemonStage, PokemonEvolutionLine } from './types.js';

export const LEVEL_EXP_TABLE: number[] = [
  0,     // Level 1
  50,    // Level 2
  120,   // Level 3
  210,   // Level 4
  320,   // Level 5 (Stage 2 Evolution)
  450,   // Level 6
  600,   // Level 7
  770,   // Level 8
  960,   // Level 9
  1170,  // Level 10 (Stage 2 Evolution for 2-stage lines)
  1400,  // Level 11
  1650,  // Level 12
  1920,  // Level 13
  2210,  // Level 14
  2520,  // Level 15 (Final Stage Evolution)
  2850,  // Level 16
  3200,  // Level 17
  3570,  // Level 18
  3960,  // Level 19
  4370,  // Level 20 (Master Level)
];

export const EXP_REWARDS = {
  PITCH_CREATED: 50,
  VOTE_CAST: 5,
  VOTE_RECEIVED: 10,
  COMMENT_ADDED: 15,
  SHOWDOWN_VOTE_CAST: 5,
  SHOWDOWN_VOTE_WON: 10,
};

export function calculateLevel(exp: number = 0): {
  level: number;
  currentExp: number;
  expInLevel: number;
  expForLevel: number;
  progressPercent: number;
  expNeeded: number;
} {
  const safeExp = Math.max(0, exp);
  let level = 1;

  for (let i = 0; i < LEVEL_EXP_TABLE.length; i++) {
    if (safeExp >= LEVEL_EXP_TABLE[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  const currentLevelMinExp = LEVEL_EXP_TABLE[level - 1] || 0;
  const nextLevelMinExp = LEVEL_EXP_TABLE[level] || currentLevelMinExp + 500;
  const expForLevel = nextLevelMinExp - currentLevelMinExp;
  const expInLevel = safeExp - currentLevelMinExp;
  const progressPercent = Math.min(100, Math.round((expInLevel / expForLevel) * 100));
  const expNeeded = Math.max(0, nextLevelMinExp - safeExp);

  return {
    level,
    currentExp: safeExp,
    expInLevel,
    expForLevel,
    progressPercent,
    expNeeded,
  };
}

const pokeImg = (dexId: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexId}.png`;

export const POKEMON_EVOLUTION_LINES: Record<PokemonId, PokemonEvolutionLine> = {
  pikachu: {
    baseId: 'pikachu',
    stages: [
      { stage: 1, name: 'Pichu', dexId: 172, minLevel: 1, title: 'Static Spark', imageUrl: pokeImg(172) },
      { stage: 2, name: 'Pikachu', dexId: 25, minLevel: 5, title: 'Electric Innovator', imageUrl: pokeImg(25) },
      { stage: 3, name: 'Raichu', dexId: 26, minLevel: 15, title: 'Thunder Titan', imageUrl: pokeImg(26) },
    ],
  },
  charizard: {
    baseId: 'charizard',
    stages: [
      { stage: 1, name: 'Charmander', dexId: 4, minLevel: 1, title: 'Ember Hatchling', imageUrl: pokeImg(4) },
      { stage: 2, name: 'Charmeleon', dexId: 5, minLevel: 5, title: 'Fiery Vanguard', imageUrl: pokeImg(5) },
      { stage: 3, name: 'Charizard', dexId: 6, minLevel: 15, title: 'Flame Striker', imageUrl: pokeImg(6) },
    ],
  },
  bulbasaur: {
    baseId: 'bulbasaur',
    stages: [
      { stage: 1, name: 'Bulbasaur', dexId: 1, minLevel: 1, title: 'Organic Architect', imageUrl: pokeImg(1) },
      { stage: 2, name: 'Ivysaur', dexId: 2, minLevel: 5, title: 'Flourishing Canopy', imageUrl: pokeImg(2) },
      { stage: 3, name: 'Venusaur', dexId: 3, minLevel: 15, title: 'Prime Ecosystem', imageUrl: pokeImg(3) },
    ],
  },
  squirtle: {
    baseId: 'squirtle',
    stages: [
      { stage: 1, name: 'Squirtle', dexId: 7, minLevel: 1, title: 'Torrential Executor', imageUrl: pokeImg(7) },
      { stage: 2, name: 'Wartortle', dexId: 8, minLevel: 5, title: 'Tailwind Navigator', imageUrl: pokeImg(8) },
      { stage: 3, name: 'Blastoise', dexId: 9, minLevel: 15, title: 'Hydro Cannon Engineer', imageUrl: pokeImg(9) },
    ],
  },
  gengar: {
    baseId: 'gengar',
    stages: [
      { stage: 1, name: 'Gastly', dexId: 92, minLevel: 1, title: 'Phantom Spark', imageUrl: pokeImg(92) },
      { stage: 2, name: 'Haunter', dexId: 93, minLevel: 5, title: 'Shadow Infiltrator', imageUrl: pokeImg(93) },
      { stage: 3, name: 'Gengar', dexId: 94, minLevel: 15, title: 'Shadow Strategist', imageUrl: pokeImg(94) },
    ],
  },
  eevee: {
    baseId: 'eevee',
    stages: [
      { stage: 1, name: 'Eevee', dexId: 133, minLevel: 1, title: 'Evolutionary Maker', imageUrl: pokeImg(133) },
      { stage: 2, name: 'Jolteon', dexId: 135, minLevel: 10, title: 'Lightning Catalyst', imageUrl: pokeImg(135) },
      { stage: 3, name: 'Flareon', dexId: 136, minLevel: 15, title: 'Solar Core Maker', imageUrl: pokeImg(136) },
    ],
  },
  mewtwo: {
    baseId: 'mewtwo',
    stages: [
      { stage: 1, name: 'Mewtwo', dexId: 150, minLevel: 1, title: 'Psychic Visionary', imageUrl: pokeImg(150) },
      { stage: 2, name: 'Awakened Mewtwo', dexId: 150, minLevel: 10, title: 'Psionic Mastermind', imageUrl: pokeImg(150) },
      { stage: 3, name: 'Mega Mewtwo', dexId: 10044, minLevel: 15, title: 'Transcendent Entity', imageUrl: pokeImg(10044) },
    ],
  },
  snorlax: {
    baseId: 'snorlax',
    stages: [
      { stage: 1, name: 'Munchlax', dexId: 446, minLevel: 1, title: 'Restless Appetite', imageUrl: pokeImg(446) },
      { stage: 2, name: 'Snorlax', dexId: 143, minLevel: 10, title: 'Resilient Tank', imageUrl: pokeImg(143) },
      { stage: 3, name: 'Evergreen Snorlax', dexId: 143, minLevel: 15, title: 'Unshakable Pillar', imageUrl: pokeImg(143) },
    ],
  },
  lucario: {
    baseId: 'lucario',
    stages: [
      { stage: 1, name: 'Riolu', dexId: 447, minLevel: 1, title: 'Aura Apprentice', imageUrl: pokeImg(447) },
      { stage: 2, name: 'Lucario', dexId: 448, minLevel: 10, title: 'Aura Master', imageUrl: pokeImg(448) },
      { stage: 3, name: 'Mega Lucario', dexId: 10059, minLevel: 15, title: 'Ascendant Warrior', imageUrl: pokeImg(10059) },
    ],
  },
  jigglypuff: {
    baseId: 'jigglypuff',
    stages: [
      { stage: 1, name: 'Igglybuff', dexId: 174, minLevel: 1, title: 'Lullaby Novice', imageUrl: pokeImg(174) },
      { stage: 2, name: 'Jigglypuff', dexId: 39, minLevel: 5, title: 'Vocal Orchestrator', imageUrl: pokeImg(39) },
      { stage: 3, name: 'Wigglytuff', dexId: 40, minLevel: 15, title: 'Symphony Virtuoso', imageUrl: pokeImg(40) },
    ],
  },
  blastoise: {
    baseId: 'blastoise',
    stages: [
      { stage: 1, name: 'Squirtle', dexId: 7, minLevel: 1, title: 'Aqua Cadet', imageUrl: pokeImg(7) },
      { stage: 2, name: 'Wartortle', dexId: 8, minLevel: 5, title: 'Tidal Vanguard', imageUrl: pokeImg(8) },
      { stage: 3, name: 'Blastoise', dexId: 9, minLevel: 15, title: 'Hydro Cannon Engineer', imageUrl: pokeImg(9) },
    ],
  },
  dragonite: {
    baseId: 'dragonite',
    stages: [
      { stage: 1, name: 'Dratini', dexId: 147, minLevel: 1, title: 'Mythic Sprout', imageUrl: pokeImg(147) },
      { stage: 2, name: 'Dragonair', dexId: 148, minLevel: 5, title: 'Skyline Serpent', imageUrl: pokeImg(148) },
      { stage: 3, name: 'Dragonite', dexId: 149, minLevel: 15, title: 'Global Pathfinder', imageUrl: pokeImg(149) },
    ],
  },
  mew: {
    baseId: 'mew',
    stages: [
      { stage: 1, name: 'Mew', dexId: 151, minLevel: 1, title: 'Genesis Originator', imageUrl: pokeImg(151) },
      { stage: 2, name: 'Awakened Mew', dexId: 151, minLevel: 10, title: 'Infinite Possibility', imageUrl: pokeImg(151) },
      { stage: 3, name: 'Cosmic Mew', dexId: 151, minLevel: 15, title: 'Architect of Code', imageUrl: pokeImg(151) },
    ],
  },
  gyarados: {
    baseId: 'gyarados',
    stages: [
      { stage: 1, name: 'Magikarp', dexId: 129, minLevel: 1, title: 'Determined Splasher', imageUrl: pokeImg(129) },
      { stage: 2, name: 'Gyarados', dexId: 130, minLevel: 10, title: 'Apex Disruptor', imageUrl: pokeImg(130) },
      { stage: 3, name: 'Mega Gyarados', dexId: 10041, minLevel: 15, title: 'Tidal Colossus', imageUrl: pokeImg(10041) },
    ],
  },
  rayquaza: {
    baseId: 'rayquaza',
    stages: [
      { stage: 1, name: 'Rayquaza', dexId: 384, minLevel: 1, title: 'Sky High Visionary', imageUrl: pokeImg(384) },
      { stage: 2, name: 'Stratosphere Ruler', dexId: 384, minLevel: 10, title: 'Ozone Commander', imageUrl: pokeImg(384) },
      { stage: 3, name: 'Mega Rayquaza', dexId: 10079, minLevel: 15, title: 'Celestial Vanguard', imageUrl: pokeImg(10079) },
    ],
  },
  gardevoir: {
    baseId: 'gardevoir',
    stages: [
      { stage: 1, name: 'Ralts', dexId: 280, minLevel: 1, title: 'Empathy Seeker', imageUrl: pokeImg(280) },
      { stage: 2, name: 'Kirlia', dexId: 281, minLevel: 5, title: 'Harmonic Dancer', imageUrl: pokeImg(281) },
      { stage: 3, name: 'Gardevoir', dexId: 282, minLevel: 15, title: 'Empathetic Strategist', imageUrl: pokeImg(282) },
    ],
  },
  garchomp: {
    baseId: 'garchomp',
    stages: [
      { stage: 1, name: 'Gible', dexId: 443, minLevel: 1, title: 'Land Shark Pup', imageUrl: pokeImg(443) },
      { stage: 2, name: 'Gabite', dexId: 444, minLevel: 5, title: 'Desert Striker', imageUrl: pokeImg(444) },
      { stage: 3, name: 'Garchomp', dexId: 445, minLevel: 15, title: 'Supersonic Velocity', imageUrl: pokeImg(445) },
    ],
  },
  greninja: {
    baseId: 'greninja',
    stages: [
      { stage: 1, name: 'Froakie', dexId: 656, minLevel: 1, title: 'Bubble Scout', imageUrl: pokeImg(656) },
      { stage: 2, name: 'Frogadier', dexId: 657, minLevel: 5, title: 'Swift Infiltrator', imageUrl: pokeImg(657) },
      { stage: 3, name: 'Greninja', dexId: 658, minLevel: 15, title: 'Stealth Operator', imageUrl: pokeImg(658) },
    ],
  },
  sceptile: {
    baseId: 'sceptile',
    stages: [
      { stage: 1, name: 'Treecko', dexId: 252, minLevel: 1, title: 'Forest Initiate', imageUrl: pokeImg(252) },
      { stage: 2, name: 'Grovyle', dexId: 253, minLevel: 5, title: 'Blade Scout', imageUrl: pokeImg(253) },
      { stage: 3, name: 'Sceptile', dexId: 254, minLevel: 15, title: 'Agile Tactician', imageUrl: pokeImg(254) },
    ],
  },
  blaziken: {
    baseId: 'blaziken',
    stages: [
      { stage: 1, name: 'Torchic', dexId: 255, minLevel: 1, title: 'Ember Chick', imageUrl: pokeImg(255) },
      { stage: 2, name: 'Combusken', dexId: 256, minLevel: 5, title: 'Brawler Vanguard', imageUrl: pokeImg(256) },
      { stage: 3, name: 'Blaziken', dexId: 257, minLevel: 15, title: 'High-Impact Striker', imageUrl: pokeImg(257) },
    ],
  },
  tyranitar: {
    baseId: 'tyranitar',
    stages: [
      { stage: 1, name: 'Larvitar', dexId: 246, minLevel: 1, title: 'Bedrock Burrower', imageUrl: pokeImg(246) },
      { stage: 2, name: 'Pupitar', dexId: 247, minLevel: 5, title: 'Hardened Cocoon', imageUrl: pokeImg(247) },
      { stage: 3, name: 'Tyranitar', dexId: 248, minLevel: 15, title: 'Unshakable Powerhouse', imageUrl: pokeImg(248) },
    ],
  },
  scizor: {
    baseId: 'scizor',
    stages: [
      { stage: 1, name: 'Scyther', dexId: 123, minLevel: 1, title: 'Forest Mantis', imageUrl: pokeImg(123) },
      { stage: 2, name: 'Scizor', dexId: 212, minLevel: 10, title: 'Precision Cutter', imageUrl: pokeImg(212) },
      { stage: 3, name: 'Mega Scizor', dexId: 10046, minLevel: 15, title: 'Crimson Bladesmith', imageUrl: pokeImg(10046) },
    ],
  },
  umbreon: {
    baseId: 'umbreon',
    stages: [
      { stage: 1, name: 'Eevee', dexId: 133, minLevel: 1, title: 'Nocturnal Aspirant', imageUrl: pokeImg(133) },
      { stage: 2, name: 'Umbreon', dexId: 197, minLevel: 10, title: 'Nocturnal Sentinel', imageUrl: pokeImg(197) },
      { stage: 3, name: 'Moonlight Umbreon', dexId: 197, minLevel: 15, title: 'Apex Dark Watcher', imageUrl: pokeImg(197) },
    ],
  },
  espeon: {
    baseId: 'espeon',
    stages: [
      { stage: 1, name: 'Eevee', dexId: 133, minLevel: 1, title: 'Solar Aspirant', imageUrl: pokeImg(133) },
      { stage: 2, name: 'Espeon', dexId: 196, minLevel: 10, title: 'Solar Clairvoyant', imageUrl: pokeImg(196) },
      { stage: 3, name: 'Morningstar Espeon', dexId: 196, minLevel: 15, title: 'Apex Diviner', imageUrl: pokeImg(196) },
    ],
  },
  sylveon: {
    baseId: 'sylveon',
    stages: [
      { stage: 1, name: 'Eevee', dexId: 133, minLevel: 1, title: 'Ribbon Seeker', imageUrl: pokeImg(133) },
      { stage: 2, name: 'Sylveon', dexId: 700, minLevel: 10, title: 'Harmonious Catalyst', imageUrl: pokeImg(700) },
      { stage: 3, name: 'Radiant Sylveon', dexId: 700, minLevel: 15, title: 'Unity Maestro', imageUrl: pokeImg(700) },
    ],
  },
  lapras: {
    baseId: 'lapras',
    stages: [
      { stage: 1, name: 'Lapras', dexId: 131, minLevel: 1, title: 'Tranquil Navigator', imageUrl: pokeImg(131) },
      { stage: 2, name: 'Oceanic Lapras', dexId: 131, minLevel: 10, title: 'Deep Current Ferry', imageUrl: pokeImg(131) },
      { stage: 3, name: 'Gigantamax Lapras', dexId: 10196, minLevel: 15, title: 'Melodic Leviathan', imageUrl: pokeImg(10196) },
    ],
  },
  machamp: {
    baseId: 'machamp',
    stages: [
      { stage: 1, name: 'Machop', dexId: 66, minLevel: 1, title: 'Muscle Novice', imageUrl: pokeImg(66) },
      { stage: 2, name: 'Machoke', dexId: 67, minLevel: 5, title: 'Heavy Lifter', imageUrl: pokeImg(67) },
      { stage: 3, name: 'Machamp', dexId: 68, minLevel: 15, title: 'Multi-Threaded Builder', imageUrl: pokeImg(68) },
    ],
  },
  arcanine: {
    baseId: 'arcanine',
    stages: [
      { stage: 1, name: 'Growlithe', dexId: 58, minLevel: 1, title: 'Loyal Pup', imageUrl: pokeImg(58) },
      { stage: 2, name: 'Arcanine', dexId: 59, minLevel: 10, title: 'Majestic Leader', imageUrl: pokeImg(59) },
      { stage: 3, name: 'Solar Arcanine', dexId: 59, minLevel: 15, title: 'Legendary Swift Sovereign', imageUrl: pokeImg(59) },
    ],
  },
  psyduck: {
    baseId: 'psyduck',
    stages: [
      { stage: 1, name: 'Psyduck', dexId: 54, minLevel: 1, title: 'Overthinking Genius', imageUrl: pokeImg(54) },
      { stage: 2, name: 'Golduck', dexId: 55, minLevel: 10, title: 'Clarity Achiever', imageUrl: pokeImg(55) },
      { stage: 3, name: 'Psychic Golduck', dexId: 55, minLevel: 15, title: 'Cerebral Master', imageUrl: pokeImg(55) },
    ],
  },
  togepi: {
    baseId: 'togepi',
    stages: [
      { stage: 1, name: 'Togepi', dexId: 175, minLevel: 1, title: 'Lucky Incubator', imageUrl: pokeImg(175) },
      { stage: 2, name: 'Togetic', dexId: 176, minLevel: 5, title: 'Joyful Flyer', imageUrl: pokeImg(176) },
      { stage: 3, name: 'Togekiss', dexId: 468, minLevel: 15, title: 'Serene Benefactor', imageUrl: pokeImg(468) },
    ],
  },
  incineroar: {
    baseId: 'incineroar',
    stages: [
      { stage: 1, name: 'Litten', dexId: 725, minLevel: 1, title: 'Ember Kitten', imageUrl: pokeImg(725) },
      { stage: 2, name: 'Torracat', dexId: 726, minLevel: 5, title: 'Flame Striker', imageUrl: pokeImg(726) },
      { stage: 3, name: 'Incineroar', dexId: 727, minLevel: 15, title: 'Apex Heel Champion', imageUrl: pokeImg(727) },
    ],
  },
  metagross: {
    baseId: 'metagross',
    stages: [
      { stage: 1, name: 'Beldum', dexId: 374, minLevel: 1, title: 'Magnetic Cell', imageUrl: pokeImg(374) },
      { stage: 2, name: 'Metang', dexId: 375, minLevel: 5, title: 'Dual-Core Processor', imageUrl: pokeImg(375) },
      { stage: 3, name: 'Metagross', dexId: 376, minLevel: 15, title: 'Supercomputer Brain', imageUrl: pokeImg(376) },
    ],
  },
  mimikyu: {
    baseId: 'mimikyu',
    stages: [
      { stage: 1, name: 'Mimikyu', dexId: 778, minLevel: 1, title: 'Disguised Seeker', imageUrl: pokeImg(778) },
      { stage: 2, name: 'Phantom Mimikyu', dexId: 778, minLevel: 10, title: 'Shadow Performer', imageUrl: pokeImg(778) },
      { stage: 3, name: 'Radiant Mimikyu', dexId: 778, minLevel: 15, title: 'Beloved Mascot', imageUrl: pokeImg(778) },
    ],
  },
  decidueye: {
    baseId: 'decidueye',
    stages: [
      { stage: 1, name: 'Rowlet', dexId: 722, minLevel: 1, title: 'Leaf Fledgling', imageUrl: pokeImg(722) },
      { stage: 2, name: 'Dartrix', dexId: 723, minLevel: 5, title: 'Blade Feather', imageUrl: pokeImg(723) },
      { stage: 3, name: 'Decidueye', dexId: 724, minLevel: 15, title: 'Silent Sharpshooter', imageUrl: pokeImg(724) },
    ],
  },
  cinderace: {
    baseId: 'cinderace',
    stages: [
      { stage: 1, name: 'Scorbunny', dexId: 815, minLevel: 1, title: 'Spirited Sprinter', imageUrl: pokeImg(815) },
      { stage: 2, name: 'Raboot', dexId: 816, minLevel: 5, title: 'Focused Dynamo', imageUrl: pokeImg(816) },
      { stage: 3, name: 'Cinderace', dexId: 817, minLevel: 15, title: 'Goal Striker', imageUrl: pokeImg(817) },
    ],
  },
  zoroark: {
    baseId: 'zoroark',
    stages: [
      { stage: 1, name: 'Zorua', dexId: 570, minLevel: 1, title: 'Trickster Pup', imageUrl: pokeImg(570) },
      { stage: 2, name: 'Shadow Zorua', dexId: 570, minLevel: 10, title: 'Illusion Scout', imageUrl: pokeImg(570) },
      { stage: 3, name: 'Zoroark', dexId: 571, minLevel: 15, title: 'Master Illusionist', imageUrl: pokeImg(571) },
    ],
  },
  ampharos: {
    baseId: 'ampharos',
    stages: [
      { stage: 1, name: 'Mareep', dexId: 179, minLevel: 1, title: 'Static Wool', imageUrl: pokeImg(179) },
      { stage: 2, name: 'Flaaffy', dexId: 180, minLevel: 5, title: 'Glowing Fleece', imageUrl: pokeImg(180) },
      { stage: 3, name: 'Ampharos', dexId: 181, minLevel: 15, title: 'Lighthouse Beacon', imageUrl: pokeImg(181) },
    ],
  },
  salamence: {
    baseId: 'salamence',
    stages: [
      { stage: 1, name: 'Bagon', dexId: 371, minLevel: 1, title: 'Unyielding Dreamer', imageUrl: pokeImg(371) },
      { stage: 2, name: 'Shelgon', dexId: 372, minLevel: 5, title: 'Armored Cocoon', imageUrl: pokeImg(372) },
      { stage: 3, name: 'Salamence', dexId: 373, minLevel: 15, title: 'Soaring Conqueror', imageUrl: pokeImg(373) },
    ],
  },
  infernape: {
    baseId: 'infernape',
    stages: [
      { stage: 1, name: 'Chimchar', dexId: 390, minLevel: 1, title: 'Fiery Scamp', imageUrl: pokeImg(390) },
      { stage: 2, name: 'Monferno', dexId: 391, minLevel: 5, title: 'Acrobatic Spark', imageUrl: pokeImg(391) },
      { stage: 3, name: 'Infernape', dexId: 392, minLevel: 15, title: 'Martial Innovator', imageUrl: pokeImg(392) },
    ],
  },
  alakazam: {
    baseId: 'alakazam',
    stages: [
      { stage: 1, name: 'Abra', dexId: 63, minLevel: 1, title: 'Psionic Slumberer', imageUrl: pokeImg(63) },
      { stage: 2, name: 'Kadabra', dexId: 64, minLevel: 5, title: 'Spoon Bender', imageUrl: pokeImg(64) },
      { stage: 3, name: 'Alakazam', dexId: 65, minLevel: 15, title: 'Cognitive Polymath', imageUrl: pokeImg(65) },
    ],
  },
  meowscarada: {
    baseId: 'meowscarada',
    stages: [
      { stage: 1, name: 'Sprigatito', dexId: 906, minLevel: 1, title: 'Whimsical Sprout', imageUrl: pokeImg(906) },
      { stage: 2, name: 'Floragato', dexId: 907, minLevel: 5, title: 'Yo-Yo Virtuoso', imageUrl: pokeImg(907) },
      { stage: 3, name: 'Meowscarada', dexId: 908, minLevel: 15, title: 'Floragato Showman', imageUrl: pokeImg(908) },
    ],
  },
  skeledirge: {
    baseId: 'skeledirge',
    stages: [
      { stage: 1, name: 'Fuecoco', dexId: 909, minLevel: 1, title: 'Laidback Ember', imageUrl: pokeImg(909) },
      { stage: 2, name: 'Crocalor', dexId: 910, minLevel: 5, title: 'Rhythm Egghead', imageUrl: pokeImg(910) },
      { stage: 3, name: 'Skeledirge', dexId: 911, minLevel: 15, title: 'Operatic Firebrand', imageUrl: pokeImg(911) },
    ],
  },
  swampert: {
    baseId: 'swampert',
    stages: [
      { stage: 1, name: 'Mudkip', dexId: 258, minLevel: 1, title: 'Fin Initiate', imageUrl: pokeImg(258) },
      { stage: 2, name: 'Marshtomp', dexId: 259, minLevel: 5, title: 'Mud Brawler', imageUrl: pokeImg(259) },
      { stage: 3, name: 'Swampert', dexId: 260, minLevel: 15, title: 'Torrential Titan', imageUrl: pokeImg(260) },
    ],
  },
  aegislash: {
    baseId: 'aegislash',
    stages: [
      { stage: 1, name: 'Honedge', dexId: 679, minLevel: 1, title: 'Spectral Blade', imageUrl: pokeImg(679) },
      { stage: 2, name: 'Doublade', dexId: 680, minLevel: 5, title: 'Dual Swordsman', imageUrl: pokeImg(680) },
      { stage: 3, name: 'Aegislash', dexId: 681, minLevel: 15, title: 'Stance Tactician', imageUrl: pokeImg(681) },
    ],
  },
  glaceon: {
    baseId: 'glaceon',
    stages: [
      { stage: 1, name: 'Eevee', dexId: 133, minLevel: 1, title: 'Frost Aspirant', imageUrl: pokeImg(133) },
      { stage: 2, name: 'Glaceon', dexId: 471, minLevel: 10, title: 'Sub-Zero Specialist', imageUrl: pokeImg(471) },
      { stage: 3, name: 'Glacial Glaceon', dexId: 471, minLevel: 15, title: 'Apex Frost Empress', imageUrl: pokeImg(471) },
    ],
  },
};

export function getEvolutionStage(pokemonId: PokemonId, level: number = 1): {
  currentStage: PokemonStage;
  nextStage?: PokemonStage;
  allStages: PokemonStage[];
  isMaxEvolution: boolean;
} {
  const line = POKEMON_EVOLUTION_LINES[pokemonId] || POKEMON_EVOLUTION_LINES.pikachu;
  const stages = line.stages;

  let currentStage = stages[0];
  let nextStage: PokemonStage | undefined = undefined;

  for (let i = stages.length - 1; i >= 0; i--) {
    if (level >= stages[i].minLevel) {
      currentStage = stages[i];
      nextStage = stages[i + 1];
      break;
    }
  }

  if (!nextStage && level < stages[1]?.minLevel) {
    nextStage = stages[1];
  }

  return {
    currentStage,
    nextStage,
    allStages: stages,
    isMaxEvolution: !nextStage,
  };
}
