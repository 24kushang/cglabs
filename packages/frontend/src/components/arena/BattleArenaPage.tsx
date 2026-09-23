import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Tooltip,
  Snackbar,
} from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import QueuePlayNextIcon from '@mui/icons-material/QueuePlayNext';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import type {
  ArenaMatchDto,
  ArenaLeaderboardEntryDto,
  IdeaDto,
  ArenaConcludeResultDto,
} from '@cglabs/shared';
import { useTempUser } from '../../context/TempUserContext';
import { MascotBadge } from '../mascots/MascotBadge';
import { POKEMON_MASCOTS } from '../../constants/mascots';
import { API_BASE } from '../../constants/api';
import { navigate } from '../../utils/router';
import { triggerMascotReaction } from '../../utils/mascotEvents';

export const BattleArenaPage: React.FC = () => {
  const { user, preferences, refreshUser } = useTempUser();
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0); // 0 = Live Showdown, 1 = Nominate & Queue, 2 = Champions Leaderboard

  // Active Match State
  const [activeMatch, setActiveMatch] = useState<ArenaMatchDto | null>(null);
  const [loadingMatch, setLoadingMatch] = useState(true);
  const [voting, setVoting] = useState(false);

  // Match Queue & My Ideas
  const [nominatedIdeas, setNominatedIdeas] = useState<IdeaDto[]>([]);
  const [myIdeas, setMyIdeas] = useState<IdeaDto[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [selectedMatchA, setSelectedMatchA] = useState<string>('');
  const [selectedMatchB, setSelectedMatchB] = useState<string>('');

  // Champions Leaderboard
  const [leaderboard, setLeaderboard] = useState<ArenaLeaderboardEntryDto[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Inspector & Notifications
  const [inspectIdea, setInspectIdea] = useState<IdeaDto | null>(null);
  const [concludeResult, setConcludeResult] = useState<ArenaConcludeResultDto | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveMatch();
  }, [user]);

  useEffect(() => {
    if (activeTab === 1) {
      fetchQueueAndMyIdeas();
    } else if (activeTab === 2) {
      fetchLeaderboard();
    }
  }, [activeTab, user]);

  const fetchActiveMatch = async () => {
    setLoadingMatch(true);
    try {
      const res = await fetch(`${API_BASE}/api/arena/active-match`, {
        headers: {
          'x-temp-user-id': user?.id || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setActiveMatch(data);
      } else {
        setActiveMatch(null);
      }
    } catch (e) {
      console.error('Failed to load active arena match', e);
      setActiveMatch(null);
    } finally {
      setLoadingMatch(false);
    }
  };

  const fetchQueueAndMyIdeas = async () => {
    setLoadingQueue(true);
    try {
      // Fetch nominated ideas
      const nomRes = await fetch(`${API_BASE}/api/arena/nominated-ideas`);
      if (nomRes.ok) {
        const nomData = await nomRes.json();
        setNominatedIdeas(nomData);
      }

      // Fetch user's own ideas
      if (user) {
        const ideasRes = await fetch(`${API_BASE}/api/ideas?month=all`, {
          headers: { 'x-temp-user-id': user.id },
        });
        if (ideasRes.ok) {
          const allIdeas: IdeaDto[] = await ideasRes.json();
          setMyIdeas(allIdeas.filter((i) => i.authorId === user.id));
        }
      }
    } catch (e) {
      console.error('Failed to load queue ideas', e);
    } finally {
      setLoadingQueue(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await fetch(`${API_BASE}/api/arena/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (e) {
      console.error('Failed to load arena leaderboard', e);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleAudienceVote = async (votedIdeaId: string) => {
    if (!activeMatch || !user || voting) return;

    if (activeMatch.isContender) {
      setToastMessage('Contenders cannot vote in their own showdown battle!');
      return;
    }

    setVoting(true);
    try {
      const res = await fetch(`${API_BASE}/api/arena/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-temp-user-id': user.id,
        },
        body: JSON.stringify({
          matchId: activeMatch.id,
          votedIdeaId,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setActiveMatch(updated);
        setToastMessage('⚡ Your audience vote has been recorded! (+5 EXP earned)');
        refreshUser();
        triggerMascotReaction('Audience ballot cast! The stadium cheers! ⚡', 'battle', 'fanfare');
      } else {
        const err = await res.json();
        setToastMessage(err.error || 'Failed to submit vote.');
      }
    } catch (e: any) {
      setToastMessage('Error casting vote.');
    } finally {
      setVoting(false);
    }
  };

  const handleNominateIdea = async (ideaId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/api/arena/nominate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-temp-user-id': user.id,
        },
        body: JSON.stringify({ ideaId }),
      });

      if (res.ok) {
        setToastMessage('🏟️ Idea entered into the Arena queue!');
        fetchQueueAndMyIdeas();
        fetchActiveMatch();
        triggerMascotReaction('Idea entered into the Arena! Time to step onto the battlefield! 🏟️', 'proud', 'chime');
      } else {
        const err = await res.json();
        setToastMessage(err.error || 'Failed to nominate idea.');
      }
    } catch (e) {
      setToastMessage('Failed to nominate idea.');
    }
  };

  const handleStartCustomMatch = async () => {
    if (!selectedMatchA || !selectedMatchB) return;
    try {
      const res = await fetch(`${API_BASE}/api/arena/start-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaAId: selectedMatchA, ideaBId: selectedMatchB }),
      });

      if (res.ok) {
        setToastMessage('🚀 New Showdown Battle is LIVE on stage!');
        setActiveTab(0);
        fetchActiveMatch();
      }
    } catch (e) {
      setToastMessage('Failed to start showdown.');
    }
  };

  const handleConcludeMatch = async () => {
    if (!activeMatch) return;
    try {
      const res = await fetch(`${API_BASE}/api/arena/conclude`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: activeMatch.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setConcludeResult(data);
        fetchActiveMatch();
        refreshUser();
        triggerMascotReaction('Match concluded! All hail our Showdown Champion! 🏆', 'happy', 'fanfare');
      }
    } catch (e) {
      setToastMessage('Failed to conclude showdown.');
    }
  };

  const activeThemeColor = preferences?.primaryColor || '#eab308';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pb: 8,
        background: 'radial-gradient(ellipse at top, rgba(234, 179, 8, 0.08) 0%, rgba(15, 23, 42, 0) 70%)',
      }}
    >
      <Container maxWidth="lg" sx={{ pt: 3 }}>
        {/* Navigation & Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            ← Back to Feed
          </Button>

          {activeMatch && activeMatch.status === 'active' && (
            <Chip
              icon={<PlayCircleFilledIcon sx={{ color: '#ef4444 !important' }} />}
              label="STAGE LIVE: Offline Pitching & Audience Voting"
              color="error"
              variant="outlined"
              sx={{ fontWeight: 800 }}
            />
          )}
        </Box>

        {/* Hero Title */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <FlashOnIcon sx={{ color: '#f59e0b', fontSize: 36 }} />
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.5px' }}>
              IDEA SHOWDOWN ARENA
            </Typography>
            <FlashOnIcon sx={{ color: '#f59e0b', fontSize: 36 }} />
          </Box>
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Creators enter their ideas into the ring for offline presentation meetings. The audience in the arena casts live votes to determine the champion!
          </Typography>
        </Box>

        {/* Arena Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            centered
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab icon={<FlashOnIcon />} iconPosition="start" label="⚔️ Live Stage & Voting" sx={{ fontWeight: 800 }} />
            <Tab icon={<QueuePlayNextIcon />} iconPosition="start" label="🏟️ Enter Idea & Match Queue" sx={{ fontWeight: 800 }} />
            <Tab icon={<EmojiEventsIcon />} iconPosition="start" label="🏆 Champions Hall of Fame" sx={{ fontWeight: 800 }} />
          </Tabs>
        </Box>

        {/* Tab 0: Live Stage & Audience Voting */}
        {activeTab === 0 && (
          <>
            {loadingMatch ? (
              <Box sx={{ py: 12, textAlign: 'center' }}>
                <CircularProgress size={48} sx={{ color: activeThemeColor }} />
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 700 }}>
                  Summoning Showdown Stage...
                </Typography>
              </Box>
            ) : !activeMatch ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 6,
                  textAlign: 'center',
                  borderRadius: 4,
                  maxWidth: 600,
                  mx: 'auto',
                  backgroundColor: 'background.paper',
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 60, color: '#f59e0b', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
                  The Arena Stage is Ready for Challengers!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  No showdown match is currently active on stage. Select your idea in the <strong>Enter Idea & Match Queue</strong> tab to set up the next battle!
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setActiveTab(1)}
                  sx={{ px: 4, py: 1, fontWeight: 800, textTransform: 'none' }}
                >
                  🏟️ Enter Your Idea into the Queue
                </Button>
              </Paper>
            ) : (
              <Box>
                {/* Contender Anti-Self-Voting Alert */}
                {activeMatch.isContender && (
                  <Alert
                    severity="warning"
                    variant="filled"
                    sx={{ mb: 3, fontWeight: 700, borderRadius: 3 }}
                  >
                    🥊 <strong>You are a Contender on Stage!</strong> Pitch your idea to the room while the audience casts their votes. (Contenders cannot vote in their own battle).
                  </Alert>
                )}

                {/* Audience Already Voted Confirmation */}
                {activeMatch.hasVoted && (
                  <Alert
                    severity="success"
                    variant="outlined"
                    sx={{ mb: 3, fontWeight: 700, borderRadius: 3, backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
                  >
                    ✅ <strong>Your audience ballot is confirmed!</strong> You voted in this showdown. Watching the audience score split update live below.
                  </Alert>
                )}

                {/* Live Audience Score Tug-of-War Bar */}
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: 3,
                    backgroundColor: 'background.paper',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#ef4444' }}>
                        🔴 {activeMatch.ideaA.title}: {activeMatch.votesA} Votes ({activeMatch.percentA}%)
                      </Typography>
                    </Box>

                    <Chip
                      icon={<HowToVoteIcon />}
                      label={`Total Ballots: ${activeMatch.totalVotes}`}
                      sx={{ fontWeight: 800 }}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#3b82f6' }}>
                        🔵 {activeMatch.ideaB.title}: {activeMatch.votesB} Votes ({activeMatch.percentB}%)
                      </Typography>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                    </Box>
                  </Box>

                  {/* Tug-of-war Bar */}
                  <Box sx={{ width: '100%', height: 16, borderRadius: 8, backgroundColor: '#3b82f6', overflow: 'hidden', display: 'flex' }}>
                    <Box
                      sx={{
                        width: `${activeMatch.percentA}%`,
                        height: '100%',
                        backgroundColor: '#ef4444',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Red Corner
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Live Audience Tug-of-War Split
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Blue Corner
                    </Typography>
                  </Box>
                </Paper>

                {/* The Two Corners on Stage */}
                <Grid container spacing={3} alignItems="stretch">
                  {/* Red Corner (Idea A) */}
                  <Grid item xs={12} md={5.5}>
                    <StageCard
                      side="A"
                      idea={activeMatch.ideaA}
                      votes={activeMatch.votesA}
                      percentage={activeMatch.percentA}
                      isContender={activeMatch.isContender}
                      userIsThisAuthor={activeMatch.userIsAuthorA}
                      hasVoted={activeMatch.hasVoted}
                      userVotedThis={activeMatch.userVotedIdeaId === activeMatch.ideaA.id}
                      onVote={() => handleAudienceVote(activeMatch.ideaA.id)}
                      onInspect={() => setInspectIdea(activeMatch.ideaA)}
                      voting={voting}
                    />
                  </Grid>

                  {/* Center VS Crest */}
                  <Grid
                    item
                    xs={12}
                    md={1}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: 68,
                        height: 68,
                        borderRadius: '50%',
                        backgroundColor: 'background.paper',
                        borderColor: '#f59e0b',
                        borderWidth: 3,
                        borderStyle: 'solid',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 24px rgba(245, 158, 11, 0.4)',
                        animation: 'pulseSlow 3s infinite',
                        '@keyframes pulseSlow': {
                          '0%, 100%': { transform: 'scale(1)' },
                          '50%': { transform: 'scale(1.08)' },
                        },
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 900, color: '#f59e0b', fontStyle: 'italic' }}>
                        VS
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Blue Corner (Idea B) */}
                  <Grid item xs={12} md={5.5}>
                    <StageCard
                      side="B"
                      idea={activeMatch.ideaB}
                      votes={activeMatch.votesB}
                      percentage={activeMatch.percentB}
                      isContender={activeMatch.isContender}
                      userIsThisAuthor={activeMatch.userIsAuthorB}
                      hasVoted={activeMatch.hasVoted}
                      userVotedThis={activeMatch.userVotedIdeaId === activeMatch.ideaB.id}
                      onVote={() => handleAudienceVote(activeMatch.ideaB.id)}
                      onInspect={() => setInspectIdea(activeMatch.ideaB)}
                      voting={voting}
                    />
                  </Grid>
                </Grid>

                {/* Conclude Session Action */}
                <Box sx={{ mt: 5, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    color="warning"
                    size="large"
                    startIcon={<EmojiEventsIcon />}
                    onClick={handleConcludeMatch}
                    sx={{
                      px: 5,
                      py: 1.5,
                      fontWeight: 900,
                      fontSize: '1rem',
                      borderRadius: 3,
                    }}
                  >
                    🏆 Conclude Pitch Session & Crown Champion
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Concludes this battle round, calculates winner by audience majority, and awards +25 EXP!
                  </Typography>
                </Box>
              </Box>
            )}
          </>
        )}

        {/* Tab 1: Enter Idea & Match Queue */}
        {activeTab === 1 && (
          <Box>
            {loadingQueue ? (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <CircularProgress size={40} sx={{ color: activeThemeColor }} />
              </Box>
            ) : (
              <Grid container spacing={4}>
                {/* Left Column: My Pitched Ideas */}
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <QueuePlayNextIcon color="primary" /> Enter Your Pitch into Arena
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                      Select any of your ideas to register it into the queue for the upcoming offline pitching session.
                    </Typography>

                    {myIdeas.length === 0 ? (
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        You haven't pitched any ideas yet! Go to the home feed and click "Pitch Idea" to deploy your first proposal.
                      </Alert>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {myIdeas.map((idea) => (
                          <Paper
                            key={idea.id}
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 1.5,
                              backgroundColor: idea.isInArena ? 'rgba(234, 179, 8, 0.08)' : 'background.paper',
                            }}
                          >
                            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                                {idea.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                                {idea.shortDescription}
                              </Typography>
                            </Box>

                            {idea.isInArena ? (
                              <Chip
                                icon={<CheckCircleIcon />}
                                label="In Arena"
                                color="warning"
                                size="small"
                                sx={{ fontWeight: 700 }}
                              />
                            ) : (
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleNominateIdea(idea.id)}
                                sx={{ textTransform: 'none', fontWeight: 700 }}
                              >
                                Enter Arena 🏟️
                              </Button>
                            )}
                          </Paper>
                        ))}
                      </Box>
                    )}
                  </Paper>
                </Grid>

                {/* Right Column: Arena Contenders Queue & Match Starter */}
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FlashOnIcon color="warning" /> Nominated Queue ({nominatedIdeas.length})
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                      Ideas registered by creators ready to take the live showdown stage.
                    </Typography>

                    {nominatedIdeas.length === 0 ? (
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        No ideas in the queue. Nominate an idea from the left panel to get started!
                      </Alert>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                        {nominatedIdeas.map((idea) => (
                          <Paper key={idea.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <MascotBadge pokemon={idea.authorPokemon} level={idea.authorLevel || 1} size="small" />
                            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                                {idea.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                by @{idea.authorName}
                              </Typography>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    )}

                    {/* Pair & Start Showdown Match */}
                    {nominatedIdeas.length >= 2 && (
                      <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                          Pair & Start Live Showdown Match:
                        </Typography>
                        <Grid container spacing={1} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <select
                              value={selectedMatchA}
                              onChange={(e) => setSelectedMatchA(e.target.value)}
                              style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'transparent', color: 'inherit', borderColor: '#888' }}
                            >
                              <option value="">Select Red Corner</option>
                              {nominatedIdeas.map((i) => (
                                <option key={i.id} value={i.id} style={{ background: '#1e293b' }}>
                                  {i.title} (@{i.authorName})
                                </option>
                              ))}
                            </select>
                          </Grid>
                          <Grid item xs={6}>
                            <select
                              value={selectedMatchB}
                              onChange={(e) => setSelectedMatchB(e.target.value)}
                              style={{ width: '100%', padding: '8px', borderRadius: '6px', background: 'transparent', color: 'inherit', borderColor: '#888' }}
                            >
                              <option value="">Select Blue Corner</option>
                              {nominatedIdeas.map((i) => (
                                <option key={i.id} value={i.id} style={{ background: '#1e293b' }}>
                                  {i.title} (@{i.authorName})
                                </option>
                              ))}
                            </select>
                          </Grid>
                        </Grid>

                        <Button
                          variant="contained"
                          color="error"
                          fullWidth
                          startIcon={<FlashOnIcon />}
                          disabled={!selectedMatchA || !selectedMatchB || selectedMatchA === selectedMatchB}
                          onClick={handleStartCustomMatch}
                          sx={{ fontWeight: 800, textTransform: 'none' }}
                        >
                          Launch Showdown on Stage 🚀
                        </Button>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        )}

        {/* Tab 2: Champions Hall of Fame Leaderboard */}
        {activeTab === 2 && (
          <Box>
            {loadingLeaderboard ? (
              <Box sx={{ py: 10, textAlign: 'center' }}>
                <CircularProgress size={40} sx={{ color: activeThemeColor }} />
              </Box>
            ) : leaderboard.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  No Arena Battles Recorded Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Conclude a showdown session to crown champions and view rankings!
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 800 }}>Rank</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Pitch Title</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Creator & Companion</TableCell>
                      <TableCell sx={{ fontWeight: 800, textAlign: 'center' }}>Win Rate</TableCell>
                      <TableCell sx={{ fontWeight: 800, textAlign: 'center' }}>Record (W - L)</TableCell>
                      <TableCell sx={{ fontWeight: 800, textAlign: 'right' }}>Avg Coolness</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaderboard.map((entry) => {
                      const isTop3 = entry.rank <= 3;
                      const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`;

                      return (
                        <TableRow
                          key={entry.idea.id}
                          hover
                          sx={{
                            cursor: 'pointer',
                            backgroundColor: entry.rank === 1 ? 'rgba(245, 158, 11, 0.05)' : 'inherit',
                          }}
                          onClick={() => navigate(`/ideas/${entry.idea.id}`)}
                        >
                          <TableCell sx={{ fontWeight: 800, fontSize: isTop3 ? '1.2rem' : '0.95rem' }}>
                            {medal}
                          </TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                              {entry.idea.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 300 }}>
                              {entry.idea.shortDescription}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <MascotBadge
                              pokemon={entry.idea.authorPokemon}
                              authorName={`@${entry.idea.authorName}`}
                              level={entry.idea.authorLevel || 1}
                              size="small"
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center', minWidth: 140 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                              <Typography variant="body2" sx={{ fontWeight: 800, width: 40 }}>
                                {entry.winRate}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={entry.winRate}
                                sx={{
                                  width: 70,
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: 'action.hover',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: entry.winRate >= 60 ? '#10b981' : entry.winRate >= 40 ? '#f59e0b' : '#ef4444',
                                  },
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            <Chip
                              label={`${entry.battleWins}W - ${entry.battleLosses}L`}
                              size="small"
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: 'right', fontWeight: 700 }}>
                            {entry.idea.averageCoolness > 0 ? `${entry.idea.averageCoolness}/10` : '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Container>

      {/* Full Proposal Specs Modal */}
      <Dialog open={Boolean(inspectIdea)} onClose={() => setInspectIdea(null)} maxWidth="md" fullWidth>
        {inspectIdea && (
          <>
            <DialogTitle sx={{ p: 3, pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {inspectIdea.title}
                </Typography>
                <MascotBadge
                  pokemon={inspectIdea.authorPokemon}
                  authorName={`@${inspectIdea.authorName}`}
                  level={inspectIdea.authorLevel || 1}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                {inspectIdea.shortDescription}
              </Typography>
              <Box sx={{ '& pre': { overflowX: 'auto', p: 2, borderRadius: 2, backgroundColor: 'action.hover' } }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                  {inspectIdea.pitchMarkdown}
                </ReactMarkdown>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setInspectIdea(null)}>Close Specs</Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setInspectIdea(null);
                  navigate(`/ideas/${inspectIdea.id}`);
                }}
              >
                Open Standalone Page &rarr;
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Session Conclude / Winner Fanfare Dialog */}
      <Dialog open={Boolean(concludeResult)} onClose={() => setConcludeResult(null)} maxWidth="xs" fullWidth>
        {concludeResult && (
          <>
            <DialogContent sx={{ p: 4, textAlign: 'center' }}>
              <EmojiEventsIcon sx={{ fontSize: 64, color: '#f59e0b', mb: 1, animation: 'bounce 2s infinite' }} />
              <Typography variant="overline" sx={{ fontWeight: 900, color: '#f59e0b', letterSpacing: 2 }}>
                ARENA SHOWDOWN CONCLUDED!
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, mt: 1, mb: 1 }}>
                🏆 {concludeResult.winnerTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Won the session with <strong>{concludeResult.winnerVotes} audience votes</strong> to {concludeResult.loserVotes}!
              </Typography>
              <Chip
                label="+25 EXP Awarded to Winning Creator!"
                color="success"
                sx={{ fontWeight: 800, mb: 2 }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
              <Button variant="contained" onClick={() => setConcludeResult(null)}>
                Spectacular! 🚀
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar Toast */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        message={toastMessage}
      />
    </Box>
  );
};

interface StageCardProps {
  side: 'A' | 'B';
  idea: IdeaDto;
  votes: number;
  percentage: number;
  isContender: boolean;
  userIsThisAuthor: boolean;
  hasVoted: boolean;
  userVotedThis: boolean;
  onVote: () => void;
  onInspect: () => void;
  voting: boolean;
}

const StageCard: React.FC<StageCardProps> = ({
  side,
  idea,
  votes,
  percentage,
  isContender,
  userIsThisAuthor,
  hasVoted,
  userVotedThis,
  onVote,
  onInspect,
  voting,
}) => {
  const pokemonKey = idea.authorPokemon || 'pikachu';
  const mascot = POKEMON_MASCOTS[pokemonKey] || POKEMON_MASCOTS.pikachu;
  const accentColor = side === 'A' ? '#ef4444' : '#3b82f6';
  const badgeLabel = side === 'A' ? '🔴 RED CORNER' : '🔵 BLUE CORNER';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        position: 'relative',
        borderWidth: 2,
        borderColor: userVotedThis ? '#10b981' : `${accentColor}50`,
        backgroundColor: userVotedThis ? 'rgba(16, 185, 129, 0.08)' : 'background.paper',
        boxShadow: userVotedThis ? '0 0 24px rgba(16, 185, 129, 0.3)' : `0 8px 24px ${accentColor}12`,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Chip
          label={badgeLabel}
          size="small"
          sx={{
            fontWeight: 900,
            fontSize: '0.72rem',
            backgroundColor: `${accentColor}20`,
            color: accentColor,
            borderColor: accentColor,
            borderWidth: 1,
            borderStyle: 'solid',
          }}
        />

        <Chip
          label={`${votes} Audience Votes (${percentage}%)`}
          size="small"
          color={userVotedThis ? 'success' : 'default'}
          variant={userVotedThis ? 'filled' : 'outlined'}
          sx={{ fontWeight: 800 }}
        />
      </Box>

      {/* Author & Companion Banner */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          borderRadius: 3,
          backgroundColor: `${mascot.themeColor}12`,
          border: `1px solid ${mascot.themeColor}30`,
          mb: 2.5,
        }}
      >
        <Box
          component="img"
          src={idea.authorStageImage || mascot.imageUrl}
          alt={idea.authorStageName || mascot.name}
          sx={{
            width: 72,
            height: 72,
            objectFit: 'contain',
            filter: `drop-shadow(0 4px 10px ${mascot.themeColor}60)`,
            animation: 'idleFloat 3s ease-in-out infinite',
            '@keyframes idleFloat': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-6px)' },
            },
          }}
        />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <MascotBadge
            pokemon={idea.authorPokemon}
            authorName={`@${idea.authorName}`}
            level={idea.authorLevel || 1}
            size="small"
          />
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
            "{idea.authorMascotQuote || mascot.motto}"
          </Typography>
        </Box>
      </Box>

      {/* Pitch Details */}
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, lineHeight: 1.3 }}>
        {idea.title}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6, flexGrow: 1 }}>
        {idea.shortDescription}
      </Typography>

      {idea.tags && idea.tags.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 3 }}>
          {idea.tags.map((tag) => (
            <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" />
          ))}
        </Box>
      )}

      {/* Interactive Voting Actions */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 'auto' }}>
        {userIsThisAuthor ? (
          <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#f59e0b' }}>
              ⭐ THIS IS YOUR PITCH! (Audience is voting on it)
            </Typography>
          </Paper>
        ) : isContender ? (
          <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Contenders cannot vote in their own showdown.
            </Typography>
          </Paper>
        ) : userVotedThis ? (
          <Chip
            icon={<CheckCircleIcon />}
            label="Your Audience Ballot Cast Here!"
            color="success"
            sx={{ py: 2.5, fontWeight: 800, fontSize: '0.9rem' }}
          />
        ) : hasVoted ? (
          <Button variant="outlined" disabled sx={{ py: 1.2, fontWeight: 700 }}>
            Vote Cast for Opponent
          </Button>
        ) : (
          <Button
            variant="contained"
            size="large"
            startIcon={<FlashOnIcon />}
            onClick={onVote}
            disabled={voting}
            sx={{
              py: 1.5,
              fontWeight: 900,
              fontSize: '1rem',
              backgroundColor: accentColor,
              '&:hover': {
                backgroundColor: accentColor,
                filter: 'brightness(1.15)',
                boxShadow: `0 0 20px ${accentColor}80`,
              },
            }}
          >
            ⚡ VOTE FOR THIS PITCH (+5 EXP)
          </Button>
        )}

        <Button
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={onInspect}
          sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
        >
          Inspect Full Markdown Specs
        </Button>
      </Box>
    </Paper>
  );
};
