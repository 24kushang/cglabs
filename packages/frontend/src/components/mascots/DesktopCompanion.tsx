import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Fade,
  ClickAwayListener,
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import CloseIcon from '@mui/icons-material/Close';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon';
import RemoveIcon from '@mui/icons-material/Remove';
import { useTempUser } from '../../context/TempUserContext';
import { POKEMON_MASCOTS } from '../../constants/mascots';
import { getEvolutionStage } from '@cglabs/shared';
import type { PokemonId } from '@cglabs/shared';
import { isAudioMuted, setAudioMuted, playPokeChirp } from '../../utils/mascotAudio';
import { subscribeMascotReaction } from '../../utils/mascotEvents';
import { navigate } from '../../utils/router';

interface DesktopCompanionProps {
  onOpenPitch?: () => void;
  onOpenTrainerCard?: () => void;
}

const MINIMIZED_STORAGE_KEY = 'cglabs_companion_minimized';

export const DesktopCompanion: React.FC<DesktopCompanionProps> = ({
  onOpenPitch,
  onOpenTrainerCard,
}) => {
  const { preferences, user } = useTempUser();
  const [minimized, setMinimized] = useState<boolean>(() => {
    return localStorage.getItem(MINIMIZED_STORAGE_KEY) === 'true';
  });
  const [soundMuted, setSoundMuted] = useState<boolean>(() => isAudioMuted());
  const [bubbleMessage, setBubbleMessage] = useState<string | null>(null);
  const [bubbleEmotion, setBubbleEmotion] = useState<string>('happy');
  const [isPoked, setIsPoked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showHearts, setShowHearts] = useState(false);

  const bubbleTimerRef = useRef<number | null>(null);

  const pokemonId = (preferences?.pokemon || 'pikachu') as PokemonId;
  const level = preferences?.level || 1;
  const mascot = POKEMON_MASCOTS[pokemonId] || POKEMON_MASCOTS.pikachu;
  const evolution = getEvolutionStage(pokemonId, level);
  const stage = evolution.currentStage;

  // Listen to platform-wide mascot reaction events
  useEffect(() => {
    const unsubscribe = subscribeMascotReaction((detail) => {
      displaySpeechBubble(detail.message, detail.emotion || 'happy', detail.durationMs || 4200);
      triggerBounce();
    });
    return unsubscribe;
  }, []);

  // Idle Thoughts Generator (triggers occasionally when resting)
  useEffect(() => {
    const idleThoughts = [
      `"${mascot.motto}"`,
      `Did you know? Reviewing pitches awards +15 EXP toward evolution!`,
      `The Showdown Arena is buzzing! Who will take today's crown?`,
      `Every breakthrough idea starts with a simple 280-character hook.`,
      `Ready to pitch? Click me to draft your proposal anytime!`,
    ];

    const interval = setInterval(() => {
      if (!bubbleMessage && !minimized && Math.random() > 0.4) {
        const randomThought = idleThoughts[Math.floor(Math.random() * idleThoughts.length)];
        displaySpeechBubble(randomThought, 'proud', 5000);
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [mascot, bubbleMessage, minimized]);

  const displaySpeechBubble = (text: string, emotion: string = 'happy', duration: number = 4200) => {
    if (bubbleTimerRef.current) {
      window.clearTimeout(bubbleTimerRef.current);
    }
    setBubbleMessage(text);
    setBubbleEmotion(emotion);

    bubbleTimerRef.current = window.setTimeout(() => {
      setBubbleMessage(null);
    }, duration);
  };

  const triggerBounce = () => {
    setIsPoked(true);
    setTimeout(() => setIsPoked(false), 500);
  };

  const handlePokeMascot = () => {
    playPokeChirp();
    triggerBounce();
    setShowHearts(true);
    setTimeout(() => setShowHearts(false), 1200);

    const cheers = [
      `${stage.name} is pumped and ready for action! ⚡`,
      `"${mascot.motto}"`,
      `Level ${level} ${stage.title} at your service! 🚀`,
      `Need inspiration? Let's check out the Showdown Arena! ⚔️`,
      `Teamwork makes the dream work! Keep building! ✨`,
    ];
    const pick = cheers[Math.floor(Math.random() * cheers.length)];
    displaySpeechBubble(pick, 'happy', 4000);
    setShowMenu((prev) => !prev);
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !soundMuted;
    setSoundMuted(next);
    setAudioMuted(next);
    displaySpeechBubble(next ? 'Sound muted 🔇' : 'Sound effects on! 🔊', 'happy', 2000);
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !minimized;
    setMinimized(next);
    localStorage.setItem(MINIMIZED_STORAGE_KEY, String(next));
    setShowMenu(false);
    if (!next) {
      playPokeChirp();
      displaySpeechBubble(`I'm back! Let's innovate! 🚀`, 'happy', 3500);
    }
  };

  // Minimized Floating Pokéball Mode
  if (minimized) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1100,
        }}
      >
        <Tooltip title={`Wake up ${stage.name} (${stage.title})`} arrow placement="left">
          <Box
            onClick={toggleMinimize}
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'background.paper',
              border: `2px solid ${mascot.themeColor}`,
              boxShadow: `0 4px 16px ${mascot.themeColor}60`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: 'pulseSlow 3s infinite',
              '@keyframes pulseSlow': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.08)' },
              },
              '&:hover': {
                transform: 'scale(1.15)',
                boxShadow: `0 6px 24px ${mascot.themeColor}99`,
              },
            }}
          >
            <CatchingPokemonIcon sx={{ color: mascot.themeColor, fontSize: 28 }} />
          </Box>
        </Tooltip>
      </Box>
    );
  }

  // Emotion icon helper
  const emotionEmoji =
    bubbleEmotion === 'battle'
      ? '⚔️'
      : bubbleEmotion === 'excited'
        ? '✨'
        : bubbleEmotion === 'proud'
          ? '🌟'
          : bubbleEmotion === 'love'
            ? '💖'
            : '💡';

  return (
    <ClickAwayListener onClickAway={() => setShowMenu(false)}>
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1100,
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}
      >
        {/* Floating Heart / Spark Particles on Poke */}
        {showHearts && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 90,
              right: 35,
              fontSize: '1.4rem',
              pointerEvents: 'none',
              animation: 'floatUpFade 1.2s ease-out forwards',
              '@keyframes floatUpFade': {
                '0%': { transform: 'translateY(0) scale(0.6)', opacity: 1 },
                '100%': { transform: 'translateY(-40px) scale(1.2)', opacity: 0 },
              },
            }}
          >
            💖 ✨
          </Box>
        )}

        {/* Dynamic Comic Speech Bubble */}
        <Fade in={Boolean(bubbleMessage)}>
          <Paper
            elevation={4}
            onClick={() => setBubbleMessage(null)}
            sx={{
              p: 1.5,
              px: 2,
              mb: 1.5,
              maxWidth: 260,
              borderRadius: 3,
              backgroundColor: 'background.paper',
              border: `2px solid ${mascot.themeColor}`,
              boxShadow: `0 8px 24px ${mascot.themeColor}30`,
              position: 'relative',
              cursor: 'pointer',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                right: 36,
                borderWidth: '8px 8px 0',
                borderStyle: 'solid',
                borderColor: `${mascot.themeColor} transparent`,
                display: 'block',
                width: 0,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8 }}>
              <Typography variant="body2" sx={{ fontSize: '1rem', lineHeight: 1 }}>
                {emotionEmoji}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.35,
                  display: 'block',
                  color: 'text.primary',
                }}
              >
                {bubbleMessage}
              </Typography>
            </Box>
          </Paper>
        </Fade>

        {/* Radial / Popover Action Menu */}
        <Fade in={showMenu}>
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              mb: 1.5,
              borderRadius: 3,
              backgroundColor: 'background.paper',
              boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
              display: showMenu ? 'flex' : 'none',
              flexDirection: 'column',
              gap: 1,
              minWidth: 190,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: mascot.themeColor }}>
                {stage.name} Companion
              </Typography>
              <IconButton size="small" onClick={() => setShowMenu(false)}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>

            {onOpenTrainerCard && (
              <Box
                onClick={() => {
                  setShowMenu(false);
                  onOpenTrainerCard();
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 0.8,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <MilitaryTechIcon sx={{ fontSize: 18, color: mascot.themeColor }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Trainer ID Card (Lv. {level})
                </Typography>
              </Box>
            )}

            <Box
              onClick={() => {
                setShowMenu(false);
                navigate('/arena');
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 0.8,
                borderRadius: 1.5,
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <FlashOnIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                Enter Battle Arena
              </Typography>
            </Box>

            {onOpenPitch && (
              <Box
                onClick={() => {
                  setShowMenu(false);
                  onOpenPitch();
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 0.8,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <AddCircleOutlineIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Pitch an Idea (+50 EXP)
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.5, borderTop: '1px solid', borderColor: 'divider' }}>
              <Tooltip title={soundMuted ? 'Unmute 8-bit sound effects' : 'Mute sound effects'}>
                <IconButton size="small" onClick={toggleSound}>
                  {soundMuted ? <VolumeOffIcon sx={{ fontSize: 16 }} /> : <VolumeUpIcon sx={{ fontSize: 16 }} />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Minimize into Pokéball">
                <IconButton size="small" onClick={toggleMinimize}>
                  <RemoveIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </Fade>

        {/* Living Mascot Character Sprite Container */}
        <Box
          onClick={handlePokeMascot}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1,
            pr: 2,
            borderRadius: 8,
            backgroundColor: 'background.paper',
            border: `2px solid ${mascot.themeColor}`,
            boxShadow: `0 8px 30px ${mascot.themeColor}55`,
            backdropFilter: 'blur(10px)',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isPoked ? 'scale(1.18) rotate(4deg)' : 'scale(1)',
            animation: 'idleBob 3.5s ease-in-out infinite',
            '@keyframes idleBob': {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-6px)' },
            },
            '&:hover': {
              transform: 'scale(1.08) translateY(-4px)',
              boxShadow: `0 12px 36px ${mascot.themeColor}88`,
            },
          }}
        >
          {/* Animated Mascot Sprite */}
          <Box
            component="img"
            src={stage.imageUrl}
            alt={stage.name}
            sx={{
              width: 50,
              height: 50,
              objectFit: 'contain',
              filter: `drop-shadow(0 4px 10px ${mascot.themeColor}90)`,
            }}
          />

          {/* Badge Text */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {stage.name}
              </Typography>
              <Typography
                component="span"
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  backgroundColor: mascot.themeColor,
                  color: '#000',
                  px: 0.6,
                  py: 0.1,
                  borderRadius: 1,
                }}
              >
                Lv.{level}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', fontSize: '0.68rem', maxWidth: 140 }} noWrap>
              {stage.title}
            </Typography>
          </Box>
        </Box>
      </Box>
    </ClickAwayListener>
  );
};
