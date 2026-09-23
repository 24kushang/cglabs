import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTempUser } from '../../context/TempUserContext';
import type { PokemonId } from '@cglabs/shared';
import { POKEMON_MASCOTS } from '../../constants/mascots';

export const EvolutionCelebrationModal: React.FC = () => {
  const { evolutionCelebration, clearCelebration } = useTempUser();

  if (!evolutionCelebration) return null;

  const { pokemon, oldStage, newStage, newLevel } = evolutionCelebration;
  const mascotKey = (pokemon || 'pikachu') as PokemonId;
  const mascot = POKEMON_MASCOTS[mascotKey] || POKEMON_MASCOTS.pikachu;

  return (
    <Dialog open={true} onClose={clearCelebration} fullWidth maxWidth="xs">
      <DialogContent sx={{ p: 4, textAlign: 'center' }}>
        <AutoAwesomeIcon
          sx={{
            fontSize: 54,
            color: mascot.themeColor,
            animation: 'spin 4s linear infinite',
            '@keyframes spin': { '100%': { transform: 'rotate(360deg)' } },
            mb: 1,
          }}
        />

        <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 2, color: mascot.themeColor }}>
          EVOLUTION UNLOCKED!
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, mb: 3 }}>
          What? Your {oldStage.name} evolved!
        </Typography>

        {/* Evolution Visual Showcase */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 3,
            backgroundColor: `${mascot.themeColor}12`,
            borderColor: `${mascot.themeColor}50`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            mb: 3,
          }}
        >
          {/* Old Stage */}
          <Box sx={{ opacity: 0.7, textAlign: 'center' }}>
            <Box
              component="img"
              src={oldStage.imageUrl}
              alt={oldStage.name}
              sx={{ width: 64, height: 64, objectFit: 'contain', mb: 0.5 }}
            />
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>
              {oldStage.name}
            </Typography>
          </Box>

          <ArrowForwardIcon sx={{ color: mascot.themeColor, fontSize: 28 }} />

          {/* New Evolved Stage */}
          <Box sx={{ textAlign: 'center' }}>
            <Box
              component="img"
              src={newStage.imageUrl}
              alt={newStage.name}
              sx={{
                width: 90,
                height: 90,
                objectFit: 'contain',
                mb: 0.5,
                filter: `drop-shadow(0 6px 12px ${mascot.themeColor}80)`,
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.08)' },
                },
              }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: mascot.themeColor }}>
              {newStage.name}
            </Typography>
          </Box>
        </Paper>

        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
          Your companion reached <strong>Level {newLevel}</strong> and transformed into <strong>{newStage.name}</strong>!
        </Typography>
        <Typography variant="caption" color="text.secondary">
          New archetype unlocked: <em>{newStage.title}</em>
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center' }}>
        <Button variant="contained" onClick={clearCelebration} sx={{ px: 4, fontWeight: 700 }}>
          Let's Go! 🚀
        </Button>
      </DialogActions>
    </Dialog>
  );
};
