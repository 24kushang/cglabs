import React from 'react';
import { Box, Chip, Typography, Tooltip } from '@mui/material';
import type { PokemonId } from '@cglabs/shared';
import { POKEMON_MASCOTS } from '../../constants/mascots';

interface MascotBadgeProps {
  pokemon?: PokemonId;
  spiritAnimal?: string; // Fallback
  authorName?: string;
  size?: 'small' | 'medium';
  showQuote?: boolean;
}

export const MascotBadge: React.FC<MascotBadgeProps> = ({
  pokemon,
  spiritAnimal,
  authorName,
  size = 'medium',
  showQuote = false,
}) => {
  const activeKey = (pokemon || spiritAnimal || 'pikachu') as PokemonId;
  const mascot = POKEMON_MASCOTS[activeKey] || POKEMON_MASCOTS.pikachu;

  return (
    <Tooltip title={`${mascot.name} (${mascot.archetype}): "${mascot.motto}"`} arrow>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
        <Chip
          avatar={
            <Box
              component="img"
              src={mascot.imageUrl}
              alt={mascot.name}
              sx={{
                width: size === 'small' ? 16 : 22,
                height: size === 'small' ? 16 : 22,
                objectFit: 'contain',
              }}
            />
          }
          label={
            <Typography variant={size === 'small' ? 'caption' : 'body2'} sx={{ fontWeight: 700 }}>
              {authorName ? authorName : mascot.name}
            </Typography>
          }
          size={size}
          sx={{
            borderColor: mascot.themeColor,
            borderWidth: 1,
            borderStyle: 'solid',
            backgroundColor: `${mascot.themeColor}15`,
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

