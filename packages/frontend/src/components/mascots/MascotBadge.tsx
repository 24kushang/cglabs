import React from 'react';
import { Box, Chip, Typography, Tooltip } from '@mui/material';
import type { PokemonId } from '@cglabs/shared';
import { getEvolutionStage } from '@cglabs/shared';
import { POKEMON_MASCOTS } from '../../constants/mascots';

interface MascotBadgeProps {
  pokemon?: PokemonId;
  spiritAnimal?: string; // Fallback
  authorName?: string;
  level?: number;
  size?: 'small' | 'medium';
  showQuote?: boolean;
}

export const MascotBadge: React.FC<MascotBadgeProps> = ({
  pokemon,
  spiritAnimal,
  authorName,
  level = 1,
  size = 'medium',
  showQuote = false,
}) => {
  const activeKey = (pokemon || spiritAnimal || 'pikachu') as PokemonId;
  const mascot = POKEMON_MASCOTS[activeKey] || POKEMON_MASCOTS.pikachu;
  const evolution = getEvolutionStage(activeKey, level);
  const currentStage = evolution.currentStage;

  return (
    <Tooltip
      title={`${currentStage.name} (${currentStage.title}) • Lv. ${level} • "${mascot.motto}"`}
      arrow
    >
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
        <Chip
          avatar={
            <Box
              component="img"
              src={currentStage.imageUrl}
              alt={currentStage.name}
              sx={{
                width: size === 'small' ? 18 : 24,
                height: size === 'small' ? 18 : 24,
                objectFit: 'contain',
              }}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Typography variant={size === 'small' ? 'caption' : 'body2'} sx={{ fontWeight: 700 }}>
                {authorName ? authorName : currentStage.name}
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontSize: size === 'small' ? '0.65rem' : '0.72rem',
                  fontWeight: 800,
                  backgroundColor: mascot.themeColor,
                  color: '#000',
                  px: 0.6,
                  py: 0.1,
                  borderRadius: 1,
                  lineHeight: 1.2,
                }}
              >
                Lv.{level}
              </Typography>
            </Box>
          }
          size={size}
          sx={{
            borderColor: mascot.themeColor,
            borderWidth: 1,
            borderStyle: 'solid',
            backgroundColor: `${mascot.themeColor}18`,
          }}
        />
        {showQuote && (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            "{mascot.motto}"
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
};
