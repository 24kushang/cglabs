import type { ThemePresetId, ThemeConfig } from '@cglabs/shared';

export interface ThemePresetDefinition {
  id: ThemePresetId;
  name: string;
  description: string;
  config: ThemeConfig;
}

export const THEME_PRESETS: ThemePresetDefinition[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'High contrast dark mode with electric cyan and hot pink accents',
    config: {
      presetId: 'cyberpunk',
      primaryColor: '#00f3ff',
      secondaryColor: '#ff0055',
      mode: 'dark',
      fontFamily: 'Inter',
      borderRadius: 8,
      density: 'comfortable',
    },
  },
  {
    id: 'oceanic',
    name: 'Oceanic Breeze',
    description: 'Calming deep teal and aqua mint with smooth rounded elements',
    config: {
      presetId: 'oceanic',
      primaryColor: '#00695c',
      secondaryColor: '#4db6ac',
      mode: 'light',
      fontFamily: 'Poppins',
      borderRadius: 12,
      density: 'comfortable',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset Flare',
    description: 'Warm coral orange and glowing gold highlights',
    config: {
      presetId: 'sunset',
      primaryColor: '#f57c00',
      secondaryColor: '#ffb74d',
      mode: 'dark',
      fontFamily: 'Roboto',
      borderRadius: 6,
      density: 'comfortable',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Obsidian',
    description: 'Deep navy background with royal purple tokens',
    config: {
      presetId: 'midnight',
      primaryColor: '#8b5cf6',
      secondaryColor: '#ec4899',
      mode: 'dark',
      fontFamily: 'Inter',
      borderRadius: 8,
      density: 'comfortable',
    },
  },
  {
    id: 'forest',
    name: 'Forest Sanctuary',
    description: 'Organic emerald green and sage earth tones',
    config: {
      presetId: 'forest',
      primaryColor: '#059669',
      secondaryColor: '#10b981',
      mode: 'light',
      fontFamily: 'Poppins',
      borderRadius: 10,
      density: 'comfortable',
    },
  },
  {
    id: 'retro',
    name: 'Retro Arcade',
    description: 'Vibrant 8-bit purple and electric yellow energy',
    config: {
      presetId: 'retro',
      primaryColor: '#7c3aed',
      secondaryColor: '#facc15',
      mode: 'dark',
      fontFamily: 'Fira Code',
      borderRadius: 2,
      density: 'compact',
    },
  },
  {
    id: 'nordic',
    name: 'Nordic Ice',
    description: 'Minimalist slate grey and crisp ice blue',
    config: {
      presetId: 'nordic',
      primaryColor: '#38bdf8',
      secondaryColor: '#94a3b8',
      mode: 'light',
      fontFamily: 'Inter',
      borderRadius: 4,
      density: 'comfortable',
    },
  },
  {
    id: 'dracula',
    name: 'Dracula Dusk',
    description: 'Classic dark palette featuring vampiric violet and hot pink',
    config: {
      presetId: 'dracula',
      primaryColor: '#bd93f9',
      secondaryColor: '#ff79c6',
      mode: 'dark',
      fontFamily: 'Inter',
      borderRadius: 8,
      density: 'comfortable',
    },
  },
  {
    id: 'solarpunk',
    name: 'Solarpunk Amber',
    description: 'Futuristic warm amber and sustainable olive leaf green',
    config: {
      presetId: 'solarpunk',
      primaryColor: '#d97706',
      secondaryColor: '#65a30d',
      mode: 'dark',
      fontFamily: 'Roboto',
      borderRadius: 16,
      density: 'comfortable',
    },
  },
  {
    id: 'bubblegum',
    name: 'Bubblegum Pop',
    description: 'Playful pastel pink and vibrant cyan pop',
    config: {
      presetId: 'bubblegum',
      primaryColor: '#ec4899',
      secondaryColor: '#06b6d4',
      mode: 'light',
      fontFamily: 'Poppins',
      borderRadius: 16,
      density: 'comfortable',
    },
  },
];
