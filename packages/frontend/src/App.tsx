import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import type { IdeaDto, ArchiveMonthDto } from '@cglabs/shared';
import { useTempUser } from './context/TempUserContext';
import { Navbar } from './components/Navbar';
import { PitchCard } from './components/ideas/PitchCard';
import { PitchViewPage } from './components/ideas/PitchViewPage';
import { BattleArenaPage } from './components/arena/BattleArenaPage';
import { PitchFormModal } from './components/ideas/PitchFormModal';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { EvolutionCelebrationModal } from './components/profile/EvolutionCelebrationModal';
import { TrainerCardModal } from './components/profile/TrainerCardModal';
import { WatermarkMascot } from './components/mascots/WatermarkMascot';
import { DesktopCompanion } from './components/mascots/DesktopCompanion';
import { API_BASE } from './constants/api';
import { useCurrentRoute, navigate } from './utils/router';

export const App: React.FC = () => {
  const route = useCurrentRoute();
  const { preferences, user, isLoading: userLoading, refreshUser } = useTempUser();
  const [ideas, setIdeas] = useState<IdeaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState<'coolness' | 'votes' | 'recent'>('coolness');

  // Monthly Partitioning State
  const [feedTab, setFeedTab] = useState<0 | 1>(0); // 0 = Current Month, 1 = Previous Months Archive
  const [archiveMonths, setArchiveMonths] = useState<ArchiveMonthDto[]>([]);
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState<string>('archive');

  // Modals
  const [authOpen, setAuthOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);
  const [pitchFormOpen, setPitchFormOpen] = useState(false);
  const [trainerCardOpen, setTrainerCardOpen] = useState(false);

  useEffect(() => {
    fetchArchiveMonths();
    fetchIdeas();
  }, [user, feedTab, selectedArchiveMonth]);

  const fetchArchiveMonths = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ideas/archive/months`);
      if (res.ok) {
        const data = await res.json();
        setArchiveMonths(data);
      }
    } catch (e) {
      console.error('Failed to load archive months', e);
    }
  };

  const fetchIdeas = async () => {
    setLoading(true);
    try {
      const monthFilter = feedTab === 0 ? 'current' : selectedArchiveMonth;
      const res = await fetch(`${API_BASE}/api/ideas?month=${monthFilter}`, {
        headers: {
          'x-temp-user-id': user?.id || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setIdeas(data);
      }
    } catch (e) {
      console.error('Failed to load ideas', e);
    } finally {
      setLoading(false);
    }
  };

  const sortedIdeas = [...ideas].sort((a, b) => {
    if (sortMode === 'coolness') return b.averageCoolness - a.averageCoolness;
    if (sortMode === 'votes') return b.totalVotes - a.totalVotes;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const mandatoryAuthOpen = !userLoading && !user;
  const mandatoryWizardOpen = !userLoading && user !== null && preferences !== null && !preferences.isConfigured;
  const currentMonthLabel = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', position: 'relative', overflowX: 'hidden' }}>
      <Navbar
        onOpenCustomizer={() => setCustomizerOpen(true)}
        onOpenNewPitch={() => {
          if (!user) {
            setAuthOpen(true);
          } else {
            setPitchFormOpen(true);
          }
        }}
        onOpenAuth={() => setAuthOpen(true)}
      />

      {/* Auth Sign In / Register Dialog */}
      <AuthModal
        open={mandatoryAuthOpen || authOpen}
        onClose={() => setAuthOpen(false)}
        allowClose={!mandatoryAuthOpen}
      />

      {/* Mandatory Onboarding / Customization Wizard */}
      <OnboardingWizard
        open={mandatoryWizardOpen || customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        allowClose={!mandatoryWizardOpen}
      />

      {/* Evolution Celebration Modal (triggers when evolution threshold is crossed) */}
      <EvolutionCelebrationModal />

      {/* Background Translucent Watermark */}
      <WatermarkMascot />

      {/* Living Interactive Desktop Mascot Companion */}
      <DesktopCompanion
        onOpenPitch={() => {
          if (!user) setAuthOpen(true);
          else setPitchFormOpen(true);
        }}
        onOpenTrainerCard={() => setTrainerCardOpen(true)}
      />

      {/* Trainer ID Card Modal */}
      <TrainerCardModal open={trainerCardOpen} onClose={() => setTrainerCardOpen(false)} />

      {/* Main Content: Arena Battle OR Standalone Pitch View OR Feed */}
      {route.page === 'arena' ? (
        <BattleArenaPage />
      ) : route.page === 'idea' ? (
        <PitchViewPage ideaId={route.ideaId} />
      ) : (
        <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          {/* Hero Banner */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
              Pitch Your Next Big Idea
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 700, mx: 'auto' }}>
              Share 280-character hooks & full Markdown proposals. Vote on 1–10 "Coolness" scores for active pitches. Monthly ideas auto-archive at the end of each calendar month.
            </Typography>
          </Box>

          {/* Arena Showdown Callout Banner */}
          <Paper
            variant="outlined"
            onClick={() => navigate('/arena')}
            sx={{
              p: 2.5,
              mb: 4,
              borderRadius: 3,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(239, 68, 68, 0.12) 100%)',
              borderColor: 'rgba(245, 158, 11, 0.4)',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                borderColor: '#f59e0b',
                boxShadow: '0 8px 24px rgba(245, 158, 11, 0.2)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 2,
                  backgroundColor: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                }}
              >
                <FlashOnIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  ⚔️ Idea Showdown: Battle Arena Mode
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pit two hackathon ideas head-to-head, crown the victor, and earn +5 EXP for your Pokémon companion!
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              color="warning"
              size="small"
              sx={{ fontWeight: 800, textTransform: 'none' }}
            >
              Enter the Arena &rarr;
            </Button>
          </Paper>

          {/* Monthly Partition Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={feedTab}
              onChange={(_, val) => setFeedTab(val)}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab
                icon={<LocalFireDepartmentIcon />}
                iconPosition="start"
                label={`🔥 Current Month Pitches (${currentMonthLabel})`}
                sx={{ fontWeight: 700 }}
              />
              <Tab
                icon={<FolderCopyIcon />}
                iconPosition="start"
                label="📁 Previous Months & Archive"
                sx={{ fontWeight: 700 }}
              />
            </Tabs>
          </Box>

          {/* Feed Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {feedTab === 0 ? `Current Month Pitches (${ideas.length})` : `Archived Pitches (${ideas.length})`}
              </Typography>

              {feedTab === 1 && (
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Select Past Month</InputLabel>
                  <Select
                    value={selectedArchiveMonth}
                    label="Select Past Month"
                    onChange={(e) => setSelectedArchiveMonth(e.target.value)}
                  >
                    <MenuItem value="archive">All Previous Months</MenuItem>
                    {archiveMonths
                      .filter((m) => !m.isCurrent)
                      .map((m) => (
                        <MenuItem key={m.monthKey} value={m.monthKey}>
                          {m.label} ({m.count} pitches)
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortMode}
                  label="Sort By"
                  onChange={(e) => setSortMode(e.target.value as any)}
                >
                  <MenuItem value="coolness">Highest Coolness (1-10)</MenuItem>
                  <MenuItem value="votes">Most Rated</MenuItem>
                  <MenuItem value="recent">Latest Submissions</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setPitchFormOpen(true)}
              >
                New Pitch
              </Button>
            </Box>
          </Box>

          {/* Ideas Grid */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : sortedIdeas.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {feedTab === 0 ? `No pitches yet for ${currentMonthLabel}!` : 'No archived pitches found for this period.'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {feedTab === 0
                  ? 'Be the first creator to pitch an idea for the current month!'
                  : 'Previous monthly pitches will appear here after calendar months end.'}
              </Typography>
              {feedTab === 0 && (
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setPitchFormOpen(true)}>
                  Pitch an Idea Now
                </Button>
              )}
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {sortedIdeas.map((idea) => (
                <Grid item xs={12} sm={6} md={4} key={idea.id}>
                  <PitchCard idea={idea} />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      )}

      {/* Modals */}
      <PitchFormModal
        open={pitchFormOpen}
        onClose={() => setPitchFormOpen(false)}
        onSuccess={() => {
          refreshUser();
          fetchArchiveMonths();
          fetchIdeas();
        }}
      />
    </Box>
  );
};
