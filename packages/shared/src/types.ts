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
  | 'togepi';

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
}

export interface UserDto {
  id: string;
  username: string;
  displayName?: string;
  isTemporary?: boolean;
  createdAt: string;
  preferences?: UserPreferencesDto;
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
  authorMascotQuote?: string;
  title: string;
  shortDescription: string;
  pitchMarkdown: string;
  tags: string[];
  averageCoolness: number; // 1-10 average
  totalVotes: number;
  userVote?: number; // 1-10 rating if voted by current user
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
  parentId?: string | null;
  content: string;
  createdAt: string;
  replies?: CommentDto[];
}
