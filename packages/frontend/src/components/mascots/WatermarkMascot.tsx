import React from 'react';
import { Box, Typography, Tooltip, Chip } from '@mui/material';
import { useTempUser } from '../../context/TempUserContext';
import { POKEMON_MASCOTS } from '../../constants/mascots';

export const WatermarkMascot: React.FC = () => {
  const { preferences, user } = useTempUser();

  const pokemonId = preferences?.pokemon || 'pikachu';
  const mascot = POKEMON_MASCOTS[pokemonId] || POKEMON_MASCOTS.pikachu;

  return (
    <>
      {/* Fixed Large Background Translucent Pokémon Watermark */}
      <Box
        aria-hidden="true"
        sx={{
          position: 'fixed',
          bottom: -40,
          right: -40,
          width: { xs: 260, sm: 380, md: 460 },
          height: { xs: 260, sm: 380, md: 460 },
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.14,
          transition: 'all 0.5s ease-in-out',
          animation: 'floatWatermark 8s ease-in-out infinite alternate',
          '@keyframes floatWatermark': {
            '0%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-15px) rotate(2deg)' },
            '100%': { transform: 'translateY(0px) rotate(0deg)' },
          },
        }}
      >
        <Box
          component="img"
          src={mascot.imageUrl}
          alt={`${mascot.name} background watermark`}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: `drop-shadow(0 0 40px ${mascot.themeColor})`,
          }}
        />
      </Box>
    </>
  );
};

