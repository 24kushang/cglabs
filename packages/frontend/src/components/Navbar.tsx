import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip } from '@mui/material';
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon';
import AddIcon from '@mui/icons-material/Add';
import { useTempUser } from '../context/TempUserContext';
import { MascotBadge } from './mascots/MascotBadge';

interface NavbarProps {
  onOpenCustomizer: () => void;
  onOpenNewPitch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCustomizer, onOpenNewPitch }) => {
  const { preferences, user } = useTempUser();

  return (
    <AppBar position="sticky" color="default" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
            🚀 PitchDeck
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Idea Pitching & 1-10 Coolness Polling
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {preferences && (
            <MascotBadge
              pokemon={preferences.pokemon}
              authorName={user?.displayName}
              size="medium"
            />
          )}

          <Tooltip title="Select Pokémon Partner & Dark/Light Mode">
            <Button
              variant="outlined"
              startIcon={<CatchingPokemonIcon />}
              onClick={onOpenCustomizer}
              size="small"
            >
              Select Pokémon
            </Button>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onOpenNewPitch}
            size="small"
          >
            Pitch Idea
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
