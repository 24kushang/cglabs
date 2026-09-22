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

      {/* Interactive Bottom-Right Pokémon Partner Floating Badge */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          pointerEvents: 'auto',
        }}
      >
        <Tooltip
          title={
            <Box sx={{ p: 1, textAlign: 'center', maxWidth: 220 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: mascot.themeColor }}>
                {mascot.emoji} {mascot.name} (#{mascot.dexId})
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                {mascot.archetype} • {user?.displayName || 'Creator'}
              </Typography>
              <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary', display: 'block' }}>
                "{mascot.motto}"
              </Typography>
            </Box>
          }
          placement="left"
          arrow
        >
          <Box
            sx={{
              p: 0.75,
              pr: 1.5,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: 'background.paper',
              borderColor: mascot.themeColor,
              borderWidth: 2,
              borderStyle: 'solid',
              boxShadow: `0 8px 30px ${mascot.themeColor}44`,
              backdropFilter: 'blur(8px)',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: 0.9,
              '&:hover': {
                opacity: 1,
                transform: 'scale(1.08) translateY(-4px)',
                boxShadow: `0 12px 40px ${mascot.themeColor}77`,
              },
            }}
          >
            <Box
              component="img"
              src={mascot.imageUrl}
              alt={mascot.name}
              sx={{
                width: 36,
                height: 36,
                objectFit: 'contain',
                filter: `drop-shadow(0 0 6px ${mascot.themeColor})`,
              }}
            />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', lineHeight: 1.1 }}>
                {mascot.name}
              </Typography>
              <Chip
                label={mascot.archetype}
                size="small"
                sx={{
                  height: 16,
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  backgroundColor: `${mascot.themeColor}22`,
                  color: mascot.themeColor,
                  border: `1px solid ${mascot.themeColor}44`,
                  mt: 0.25,
                }}
              />
            </Box>
          </Box>
        </Tooltip>
      </Box>
    </>
  );
};

