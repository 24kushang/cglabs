import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Chip,
  Divider,
  Button,
  Paper,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';
import StarIcon from '@mui/icons-material/Star';
import FolderArchiveIcon from '@mui/icons-material/FolderCopy';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import type { IdeaDto, CommentDto } from '@cglabs/shared';
import { MascotBadge } from '../mascots/MascotBadge';
import { CommentThread } from '../comments/CommentThread';
import { useTempUser } from '../../context/TempUserContext';
import { API_BASE } from '../../constants/api';
import { navigate } from '../../utils/router';
import { triggerMascotReaction } from '../../utils/mascotEvents';

interface PitchViewPageProps {
  ideaId: string;
}

export const PitchViewPage: React.FC<PitchViewPageProps> = ({ ideaId }) => {
  const { user, refreshUser } = useTempUser();
  const [idea, setIdea] = useState<IdeaDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Voting state
  const [currentVote, setCurrentVote] = useState<number | undefined>(undefined);
  const [avgScore, setAvgScore] = useState<number>(0);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [voting, setVoting] = useState(false);

  // Comments state
  const [commentsList, setCommentsList] = useState<CommentDto[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Share notification
  const [shareToast, setShareToast] = useState(false);

  useEffect(() => {
    fetchIdeaDetail();
    fetchComments();
  }, [ideaId, user?.id]);

  const fetchIdeaDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/ideas/${ideaId}`, {
        headers: {
          'x-temp-user-id': user?.id || '',
        },
      });

      if (!res.ok) {
        if (res.status === 404) {
          setError('Pitch not found. It may have been removed or archived.');
        } else {
          setError('Failed to load pitch details.');
        }
        return;
      }

      const data: IdeaDto = await res.json();
      setIdea(data);
      setCurrentVote(data.userVote);
      setAvgScore(data.averageCoolness || 0);
      setTotalVotes(data.totalVotes || 0);
    } catch (e) {
      console.error('Failed to load idea detail', e);
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/comments/idea/${ideaId}`);
      if (res.ok) {
        const data = await res.json();
        setCommentsList(data);
      }
    } catch (e) {
      console.error('Failed to load comments', e);
    }
  };

  const handleCastVote = async (score: number) => {
    if (!idea || !user) return;
    setVoting(true);
    try {
      const res = await fetch(`${API_BASE}/api/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-temp-user-id': user.id,
        },
        body: JSON.stringify({ ideaId: idea.id, coolnessScore: score }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentVote(score);
        setAvgScore(data.averageCoolness);
        setTotalVotes(data.totalVotes);
        refreshUser();
        triggerMascotReaction('Coolness rating cast! Curation builds great products. ✨', 'happy', 'chime');
      }
    } catch (e) {
      console.error('Failed to cast vote', e);
    } finally {
      setVoting(false);
    }
  };

  const handlePostComment = async (parentId?: string, contentOverride?: string) => {
    if (!idea || !user) return;
    const text = contentOverride || newComment;
    if (!text.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`${API_BASE}/api/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-temp-user-id': user.id,
        },
        body: JSON.stringify({
          comment: {
            ideaId: idea.id,
            parentId: parentId || undefined,
            content: text.trim(),
          },
        }),
      });

      if (res.ok) {
        if (!contentOverride) setNewComment('');
        await fetchComments();
        refreshUser();
        triggerMascotReaction('Feedback shared! Constructive reviews build champions. 💬', 'proud', 'chime');
      }
    } catch (e) {
      console.error('Failed to post comment', e);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareToast(true);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Loading pitch details...
        </Typography>
      </Container>
    );
  }

  if (error || !idea) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
            {error || 'Pitch Not Found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            The requested pitch could not be found or may have been deleted.
          </Typography>
          <Button variant="contained" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
            Back to All Pitches
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Top Navigation & Breadcrumbs */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => navigate('/')}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}
          >
            <ArrowBackIcon fontSize="small" /> All Pitches
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>
            {idea.title.length > 30 ? `${idea.title.slice(0, 30)}...` : idea.title}
          </Typography>
        </Breadcrumbs>

        <Button
          variant="outlined"
          size="small"
          startIcon={<ShareIcon />}
          onClick={handleCopyLink}
          sx={{ textTransform: 'none' }}
        >
          Share Pitch
        </Button>
      </Box>

      {/* Main Pitch Card */}
      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3, mb: 4 }}>
        {/* Header: Author & Date */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
          <MascotBadge
            pokemon={idea.authorPokemon}
            authorName={idea.authorName.startsWith('@') ? idea.authorName : `@${idea.authorName}`}
            level={idea.authorLevel || 1}
            showQuote
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!idea.isCurrentMonth && (
              <Chip
                icon={<FolderArchiveIcon fontSize="small" />}
                label={`Archived (${idea.monthKey})`}
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
            <Typography variant="caption" color="text.secondary">
              Pitched on {new Date(idea.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        {/* Pitch Title */}
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
          {idea.title}
        </Typography>

        {/* Tags */}
        {idea.tags && idea.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 3 }}>
            {idea.tags.map((tag) => (
              <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" />
            ))}
          </Box>
        )}

        {/* Voting & Coolness Score Box */}
        <Paper variant="outlined" sx={{ p: 2.5, mb: 4, backgroundColor: 'action.hover', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon sx={{ color: '#f59e0b' }} /> Overall Coolness Factor: {avgScore} / 10
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Based on {totalVotes} ratings from platform creators
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                {currentVote ? `Your Rating: ${currentVote}/10 (Click to change)` : 'Rate the Coolness Factor (1 to 10):'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                  const isSelected = currentVote === score;
                  return (
                    <Button
                      key={score}
                      size="small"
                      variant={isSelected ? 'contained' : 'outlined'}
                      color={isSelected ? 'secondary' : 'inherit'}
                      onClick={() => handleCastVote(score)}
                      disabled={voting}
                      sx={{ minWidth: 32, px: 1, fontWeight: 700 }}
                    >
                      {score}
                    </Button>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Hook */}
        <Box
          sx={{
            mb: 4,
            p: 2.5,
            borderLeft: '4px solid',
            borderColor: 'primary.main',
            backgroundColor: 'background.default',
            borderRadius: '0 8px 8px 0',
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
            Short Hook:
          </Typography>
          <Typography variant="body1" sx={{ fontStyle: 'italic', fontWeight: 500, lineHeight: 1.6 }}>
            "{idea.shortDescription}"
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Full Markdown Proposal */}
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          📄 Full Pitch Proposal
        </Typography>
        <Box
          sx={{
            p: { xs: 2, md: 3 },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'background.default',
            lineHeight: 1.7,
            '& p': { mb: 2 },
            '& h1, & h2, & h3': { mt: 3, mb: 1.5, fontWeight: 700 },
            '& ul, & ol': { pl: 3, mb: 2 },
            '& code': {
              backgroundColor: 'action.hover',
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontFamily: 'monospace',
            },
            '& pre': {
              backgroundColor: 'action.hover',
              p: 2,
              borderRadius: 2,
              overflowX: 'auto',
            },
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
            {idea.pitchMarkdown}
          </ReactMarkdown>
        </Box>
      </Paper>

      {/* Creator Discussions */}
      <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3, mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          💬 Creator Discussions ({commentsList.length})
        </Typography>

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Have feedback, questions, or ideas to build on this pitch? Join the discussion..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ mb: 1.5 }}
          />
          <Button
            variant="contained"
            onClick={() => handlePostComment()}
            disabled={submittingComment || !newComment.trim()}
          >
            Post Comment
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {commentsList.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 2 }}>
            No comments yet. Be the first creator to spark a discussion!
          </Typography>
        ) : (
          commentsList.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              onReply={(parentId, content) => handlePostComment(parentId, content)}
            />
          ))
        )}
      </Paper>

      {/* Share Toast */}
      <Snackbar
        open={shareToast}
        autoHideDuration={3000}
        onClose={() => setShareToast(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setShareToast(false)} sx={{ width: '100%' }}>
          Pitch link copied to clipboard!
        </Alert>
      </Snackbar>
    </Container>
  );
};
