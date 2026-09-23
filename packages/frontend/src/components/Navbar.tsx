import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip } from '@mui/material';
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTempUser } from '../context/TempUserContext';
import { MascotBadge } from './mascots/MascotBadge';
import { TrainerCardModal } from './profile/TrainerCardModal';
import { navigate } from '../utils/router';

interface NavbarProps {
  onOpenCustomizer: () => void;
  onOpenNewPitch: () => void;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCustomizer, onOpenNewPitch, onOpenAuth }) => {
  const { preferences, user, logout } = useTempUser();
  const [trainerCardOpen, setTrainerCardOpen] = useState(false);

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1} sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box
            component="a"
            href="/"
            onClick={(e) => {
              if (e.button === 0 && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                navigate('/');
              }
            }}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
              🚀 PitchDeck
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Idea Pitching & 1-10 Coolness Polling
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {user ? (
              <>
                {preferences && (
                  <Tooltip title="View Your Trainer Card & Level Progress" arrow>
                    <Box
                      onClick={() => setTrainerCardOpen(true)}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 2,
                        p: 0.5,
                        transition: '0.2s',
                        '&:hover': { transform: 'scale(1.03)', backgroundColor: 'action.hover' },
                      }}
                    >
                      <MascotBadge
                        pokemon={preferences.pokemon}
                        authorName={`@${user.username || user.displayName}`}
                        level={preferences.level || 1}
                        size="medium"
                      />
                    </Box>
                  </Tooltip>
                )}

                <Tooltip title="Sign Out">
                  <IconButton size="small" onClick={logout} color="inherit">
                    <LogoutIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Button variant="contained" size="small" onClick={onOpenAuth}>
                Sign In / Register
              </Button>
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

            <Tooltip title="Enter the Head-to-Head Idea Showdown Arena">
              <Button
                variant="outlined"
                color="warning"
                startIcon={<FlashOnIcon />}
                onClick={() => navigate('/arena')}
                size="small"
                sx={{ fontWeight: 800 }}
              >
                Arena ⚔️
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

      {/* Trainer ID Card Modal */}
      <TrainerCardModal open={trainerCardOpen} onClose={() => setTrainerCardOpen(false)} />
    </>
  );
};
