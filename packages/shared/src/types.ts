export type ThemePresetId =
  | 'cyberpunk'
  | 'oceanic'
  | 'sunset'
  | 'midnight'
  | 'forest'
  | 'retro'
  | 'nordic'
  | 'dracula'
  | 'solarpunk'
  | 'bubblegum'
  | 'custom';

export interface ThemeConfig {
  presetId: ThemePresetId;
  primaryColor: string;
  secondaryColor: string;
  mode: 'dark' | 'light';
  fontFamily: string;
  borderRadius: number;
  density: 'comfortable' | 'compact';
}

export type PokemonId =
  | 'pikachu'
  | 'charizard'
  | 'bulbasaur'
  | 'squirtle'
  | 'gengar'
  | 'eevee'
  | 'mewtwo'
  | 'snorlax'
  | 'lucario'
  | 'jigglypuff'
  | 'blastoise'
  | 'dragonite'
  | 'mew'
  | 'gyarados'
  | 'rayquaza'
  | 'gardevoir'
  | 'garchomp'
  | 'greninja'
  | 'sceptile'
  | 'blaziken'
  | 'tyranitar'
  | 'scizor'
  | 'umbreon'
  | 'espeon'
  | 'sylveon'
  | 'lapras'
  | 'machamp'
  | 'arcanine'
  | 'psyduck'
  | 'togepi'
  | 'incineroar'
  | 'metagross'
  | 'mimikyu'
  | 'decidueye'
  | 'cinderace'
  | 'zoroark'
  | 'ampharos'
  | 'salamence'
  | 'infernape'
  | 'alakazam'
  | 'meowscarada'
  | 'skeledirge'
  | 'swampert'
  | 'aegislash'
  | 'glaceon';

export interface PokemonConfig {
  id: PokemonId;
  dexId: number;
  name: string;
  archetype: string;
  motto: string;
  emoji: string;
  themeColor: string;
  imageUrl: string;
}

export interface PokemonStage {
  stage: 1 | 2 | 3;
  name: string;
  dexId: number;
  minLevel: number;
  imageUrl: string;
  title: string;
}

export interface PokemonEvolutionLine {
  baseId: PokemonId;
  stages: PokemonStage[];
}

export interface UserPreferencesDto {
  themePresetId: ThemePresetId;
  primaryColor: string;
  secondaryColor: string;
  mode: 'dark' | 'light';
  fontFamily: string;
  borderRadius: number;
  density: 'comfortable' | 'compact';
  pokemon: PokemonId;
  mascotQuote: string;
  isConfigured: boolean;
  exp: number;
  level: number;
}

export interface UserDto {
  id: string;
  username: string;
  displayName?: string;
  isTemporary?: boolean;
  createdAt: string;
  preferences?: UserPreferencesDto;
  exp?: number;
  level?: number;
}

export interface RegisterDto {
  username: string;
  password: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponseDto {
  user: UserDto;
  token: string;
  preferences?: UserPreferencesDto;
}

export interface ClaimedPokemonDto {
  pokemon: PokemonId;
  username: string;
  userId: string;
}

export interface CreateIdeaDto {
  title: string;
  shortDescription: string; // Max 280 chars
  pitchMarkdown: string;    // Full pitch in Markdown
  tags: string[];
}

export interface IdeaDto {
  id: string;
  authorId: string;
  authorName: string;
  authorPokemon?: PokemonId;
  authorLevel?: number;
  authorStageName?: string;
  authorStageImage?: string;
  authorMascotQuote?: string;
  title: string;
  shortDescription: string;
  pitchMarkdown: string;
  tags: string[];
  averageCoolness: number; // 1-10 average
  totalVotes: number;
  userVote?: number; // 1-10 rating if voted by current user
  battleWins?: number;
  battleLosses?: number;
  battleWinRate?: number; // 0 to 100 percentage
  isInArena?: boolean;
  createdAt: string;
  updatedAt: string;
  isCurrentMonth: boolean;
  monthKey: string; // e.g. "2026-09"
}

export interface ArchiveMonthDto {
  monthKey: string; // e.g. "2026-08"
  label: string;    // e.g. "August 2026"
  count: number;
  isCurrent: boolean;
}

export interface VoteDto {
  ideaId: string;
  userId: string;
  coolnessScore: number; // 1 to 10
}

export interface CreateCommentDto {
  ideaId: string;
  parentId?: string;
  content: string;
}

export interface CommentDto {
  id: string;
  ideaId: string;
  authorId: string;
  authorName: string;
  authorPokemon?: PokemonId;
  authorLevel?: number;
  authorStageName?: string;
  authorStageImage?: string;
  parentId?: string | null;
  content: string;
  createdAt: string;
  replies?: CommentDto[];
}

export interface ArenaMatchDto {
  id: string;
  ideaA: IdeaDto;
  ideaB: IdeaDto;
  status: 'active' | 'concluded';
  winnerIdeaId?: string | null;
  votesA: number;
  votesB: number;
  totalVotes: number;
  percentA: number;
  percentB: number;
  hasVoted: boolean;
  userVotedIdeaId?: string | null;
  isContender: boolean;
  userIsAuthorA: boolean;
  userIsAuthorB: boolean;
  createdAt: string;
  concludedAt?: string | null;
}

export interface ArenaVoteRequestDto {
  matchId: string;
  votedIdeaId: string;
}

export interface ArenaNominateDto {
  ideaId: string;
}

export interface ArenaStartMatchDto {
  ideaAId: string;
  ideaBId: string;
}

export interface ArenaConcludeResultDto {
  success: boolean;
  matchId: string;
  winnerIdeaId: string | null;
  winnerTitle?: string;
  winnerVotes: number;
  loserVotes: number;
  isDraw: boolean;
  authorExpEarned: number;
}

export interface ShowdownMatchupDto {
  ideaA: IdeaDto;
  ideaB: IdeaDto;
  totalPoolCount: number;
}

export interface ShowdownVoteDto {
  winnerIdeaId: string;
  loserIdeaId: string;
}

export interface ShowdownResultDto {
  success: boolean;
  winnerIdeaId: string;
  loserIdeaId: string;
  winnerWins: number;
  loserLosses: number;
  voterExpEarned: number;
  newMatchup?: ShowdownMatchupDto | null;
}

export interface ArenaLeaderboardEntryDto {
  idea: IdeaDto;
  battleWins: number;
  battleLosses: number;
  totalBattles: number;
  winRate: number; // 0 - 100
  rank: number;
}
