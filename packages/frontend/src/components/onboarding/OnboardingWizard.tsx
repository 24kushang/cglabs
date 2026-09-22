import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import { useTempUser } from '../../context/TempUserContext';
import { POKEMON_MASCOTS } from '../../constants/mascots';
import type { PokemonId, ClaimedPokemonDto } from '@cglabs/shared';
import { API_BASE } from '../../constants/api';

interface OnboardingWizardProps {
  open: boolean;
  onClose?: () => void;
  allowClose?: boolean;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  open,
  onClose,
  allowClose = false,
}) => {
  const { preferences, user, updatePreferences } = useTempUser();

  const [selectedMascotId, setSelectedMascotId] = useState<PokemonId>(preferences?.pokemon || 'pikachu');
  const [mode, setMode] = useState<'dark' | 'light'>(preferences?.mode || 'dark');
  const [claimedList, setClaimedList] = useState<ClaimedPokemonDto[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (open) {
      fetchClaimedPokemons();
    }
  }, [open]);

  const fetchClaimedPokemons = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/preferences/claimed-pokemons`);
      if (res.ok) {
        const data = await res.json();
        setClaimedList(data);
      }
    } catch (e) {
      console.error('Failed to load claimed pokemons', e);
    }
  };

  const handleSelectMascot = async (mascotId: PokemonId) => {
    setErrorMsg('');
    const claimedByOther = claimedList.find(
      (item) => item.pokemon === mascotId && item.userId !== user?.id
    );

    if (claimedByOther) {
      setErrorMsg(`This Pokémon partner is already claimed by @${claimedByOther.username}. Please select an unclaimed partner!`);
      return;
    }

    setSelectedMascotId(mascotId);
    const mascot = POKEMON_MASCOTS[mascotId] || POKEMON_MASCOTS.pikachu;
    try {
      await updatePreferences({
        pokemon: mascotId,
        primaryColor: mascot.themeColor,
        secondaryColor: mascot.themeColor,
        mode,
        mascotQuote: mascot.motto,
      });
      await fetchClaimedPokemons();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to claim Pokémon partner.');
    }
  };

  const handleModeChange = async (newMode: 'dark' | 'light') => {
    if (!newMode) return;
    setMode(newMode);
    const mascot = POKEMON_MASCOTS[selectedMascotId] || POKEMON_MASCOTS.pikachu;
    try {
      await updatePreferences({
        pokemon: selectedMascotId,
        primaryColor: mascot.themeColor,
        secondaryColor: mascot.themeColor,
        mode: newMode,
        mascotQuote: mascot.motto,
      });
    } catch (e) {}
  };

  const handleComplete = async () => {
    const mascot = POKEMON_MASCOTS[selectedMascotId] || POKEMON_MASCOTS.pikachu;
    try {
      await updatePreferences({
        pokemon: selectedMascotId,
        primaryColor: mascot.themeColor,
        secondaryColor: mascot.themeColor,
        mode,
        mascotQuote: mascot.motto,
      });
      if (onClose) onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete configuration.');
    }
  };

  const currentMascot = POKEMON_MASCOTS[selectedMascotId] || POKEMON_MASCOTS.pikachu;

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="md"
      disableEscapeKeyDown={!allowClose}
      onClose={allowClose ? onClose : undefined}
    >
      <DialogTitle sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              ⚡ Choose Your Unique Pokémon Partner
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Each Pokémon partner is 100% unique! Once claimed by a creator, it is disabled for everyone else.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Mode:
            </Typography>
            <ToggleButtonGroup
              value={mode}
              exclusive
              size="small"
              onChange={(_, newMode) => handleModeChange(newMode)}
            >
              <ToggleButton value="dark">
                <DarkModeIcon fontSize="small" sx={{ mr: 0.5 }} /> Dark
              </ToggleButton>
              <ToggleButton value="light">
                <LightModeIcon fontSize="small" sx={{ mr: 0.5 }} /> Light
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {errorMsg && (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setErrorMsg('')}>
            {errorMsg}
          </Alert>
        )}

        <Grid container spacing={2}>
          {Object.values(POKEMON_MASCOTS).map((mascot) => {
            const isSelected = selectedMascotId === mascot.id;
            const claimedItem = claimedList.find(
              (item) => item.pokemon === mascot.id && item.userId !== user?.id
            );
            const isClaimedByOther = !!claimedItem;

            return (
              <Grid item xs={12} sm={6} md={4} key={mascot.id}>
                <Card
                  variant="outlined"
                  sx={{
                    position: 'relative',
                    borderColor: isSelected ? mascot.themeColor : 'divider',
                    borderWidth: isSelected ? 2 : 1,
                    backgroundColor: isSelected
                      ? `${mascot.themeColor}18`
                      : isClaimedByOther
                      ? 'action.disabledBackground'
                      : 'background.paper',
                    opacity: isClaimedByOther ? 0.6 : 1,
                    transition: 'all 0.2s ease-in-out',
                    cursor: isClaimedByOther ? 'not-allowed' : 'pointer',
                    '&:hover': !isClaimedByOther
                      ? {
                          transform: 'translateY(-3px)',
                          boxShadow: `0 8px 24px ${mascot.themeColor}44`,
                          borderColor: mascot.themeColor,
                        }
                      : {},
                  }}
                >
                  <CardActionArea
                    onClick={() => handleSelectMascot(mascot.id as PokemonId)}
                    disabled={isClaimedByOther}
                  >
                    <CardContent sx={{ p: 2 }}>
                      {isSelected && (
                        <CheckCircleIcon
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: mascot.themeColor,
                            fontSize: 20,
                          }}
                        />
                      )}

                      {isClaimedByOther && (
                        <Chip
                          icon={<LockIcon sx={{ fontSize: 12 }} />}
                          label={`Claimed @${claimedItem.username}`}
                          size="small"
                          color="error"
                          variant="filled"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            height: 20,
                            fontSize: '0.625rem',
                            fontWeight: 800,
                          }}
                        />
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Box
                          component="img"
                          src={mascot.imageUrl}
                          alt={mascot.name}
                          sx={{
                            width: 52,
                            height: 52,
                            objectFit: 'contain',
                            filter: isClaimedByOther ? 'grayscale(80%)' : `drop-shadow(0 0 8px ${mascot.themeColor})`,
                          }}
                        />
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
                              {mascot.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              #{mascot.dexId}
                            </Typography>
                          </Box>
                          <Chip
                            label={mascot.archetype}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              backgroundColor: `${mascot.themeColor}22`,
                              color: mascot.themeColor,
                              border: `1px solid ${mascot.themeColor}55`,
                              mt: 0.25,
                            }}
                          />
                        </Box>
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontStyle: 'italic',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: 32,
                        }}
                      >
                        "{mascot.motto}"
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, px: 3, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: currentMascot.themeColor,
            }}
          />
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Active Partner: <span style={{ color: currentMascot.themeColor }}>{currentMascot.name} ({currentMascot.themeColor})</span>
          </Typography>
        </Box>

        <Button variant="contained" size="large" onClick={handleComplete}>
          🚀 Save & Enter Platform
        </Button>
      </DialogActions>
    </Dialog>
  );
};



