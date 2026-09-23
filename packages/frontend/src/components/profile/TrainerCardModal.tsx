import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Paper,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTempUser } from '../../context/TempUserContext';
import { calculateLevel, getEvolutionStage } from '@cglabs/shared';
import { POKEMON_MASCOTS } from '../../constants/mascots';

interface TrainerCardModalProps {
  open: boolean;
  onClose: () => void;
}

export const TrainerCardModal: React.FC<TrainerCardModalProps> = ({ open, onClose }) => {
  const { user, preferences } = useTempUser();

  if (!user || !preferences) return null;

  const pokemonKey = preferences.pokemon || 'pikachu';
  const mascot = POKEMON_MASCOTS[pokemonKey] || POKEMON_MASCOTS.pikachu;
  const exp = preferences.exp || 0;
  const levelInfo = calculateLevel(exp);
  const evolution = getEvolutionStage(pokemonKey, levelInfo.level);
  const currentStage = evolution.currentStage;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ p: 3, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MilitaryTechIcon sx={{ color: mascot.themeColor }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Creator Trainer ID Card
            </Typography>
          </Box>
          <Chip
            label={`Lv. ${levelInfo.level}`}
            sx={{
              backgroundColor: mascot.themeColor,
              color: '#000',
              fontWeight: 800,
              fontSize: '0.85rem',
            }}
          />
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        {/* Main Companion Showcase Card */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            textAlign: 'center',
            borderRadius: 3,
            mb: 3,
            backgroundColor: `${mascot.themeColor}10`,
            borderColor: `${mascot.themeColor}50`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Sprite */}
          <Box
            component="img"
            src={currentStage.imageUrl}
            alt={currentStage.name}
            sx={{
              width: 140,
              height: 140,
              objectFit: 'contain',
              mx: 'auto',
              display: 'block',
              filter: `drop-shadow(0 8px 16px ${mascot.themeColor}60)`,
              mb: 1.5,
              animation: 'bounce 3s ease-in-out infinite',
              '@keyframes bounce': {
                '0%, 100%': { transform: 'translateY(0)' },
                '50%': { transform: 'translateY(-8px)' },
              },
            }}
          />

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            {currentStage.name}
          </Typography>
          <Typography variant="subtitle2" sx={{ color: mascot.themeColor, fontWeight: 700, mb: 1 }}>
            {currentStage.title} (Stage {currentStage.stage} of {evolution.allStages.length})
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', maxWidth: 400, mx: 'auto' }}>
            "{mascot.motto}"
          </Typography>
        </Paper>

        {/* EXP & Level Progress */}
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Level {levelInfo.level} Progress
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              {levelInfo.expInLevel} / {levelInfo.expForLevel} EXP ({levelInfo.progressPercent}%)
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={levelInfo.progressPercent}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                backgroundColor: mascot.themeColor,
                borderRadius: 5,
              },
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Total Points: <strong>{levelInfo.currentExp} EXP</strong>
            </Typography>
            <Typography variant="caption" sx={{ color: mascot.themeColor, fontWeight: 700 }}>
              {levelInfo.expNeeded > 0
                ? `${levelInfo.expNeeded} EXP to Next Level`
                : 'Maximum Level Reached!'}
            </Typography>
          </Box>
        </Paper>

        {/* Evolution Path Timeline */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AutoAwesomeIcon fontSize="small" sx={{ color: mascot.themeColor }} /> Evolution Milestones
        </Typography>

        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          {evolution.allStages.map((stage) => {
            const isUnlocked = levelInfo.level >= stage.minLevel;
            const isCurrent = stage.stage === currentStage.stage;

            return (
              <Grid item xs={12 / evolution.allStages.length} key={stage.name}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    textAlign: 'center',
                    borderRadius: 2,
                    borderColor: isCurrent ? mascot.themeColor : isUnlocked ? 'divider' : 'action.disabledBackground',
                    backgroundColor: isCurrent ? `${mascot.themeColor}20` : 'background.paper',
                    opacity: isUnlocked ? 1 : 0.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    component="img"
                    src={stage.imageUrl}
                    alt={stage.name}
                    sx={{ width: 44, height: 44, objectFit: 'contain', mb: 1 }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                    {stage.name}
                  </Typography>
                  {isCurrent ? (
                    <Chip label="Current" size="small" color="primary" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />
                  ) : isUnlocked ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      <CheckCircleIcon sx={{ fontSize: 13, color: 'success.main' }} />
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'success.main', fontWeight: 700 }}>
                        Unlocked
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      <LockIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        Lv. {stage.minLevel}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* How to Earn EXP */}
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
          ⚡ HOW TO LEVEL UP & EVOLVE:
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              💡 <strong>+50 EXP</strong>: Pitch an Idea
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              💬 <strong>+15 EXP</strong>: Post Comment Feedback
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              ⭐ <strong>+10 EXP</strong>: Receive a Community Vote
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              🗳️ <strong>+5 EXP</strong>: Rate / Vote on an Idea
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button variant="contained" onClick={onClose}>
          Awesome
        </Button>
      </DialogActions>
    </Dialog>
  );
};
