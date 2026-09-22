import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  Grid,
  TextField,
  Paper,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import type { IdeaDto, CommentDto } from '@cglabs/shared';
import { MascotBadge } from '../mascots/MascotBadge';
import { CommentThread } from '../comments/CommentThread';
import { useTempUser } from '../../context/TempUserContext';
import { API_BASE } from '../../constants/api';

interface PitchDetailModalProps {
  idea: IdeaDto | null;
  open: boolean;
  onClose: () => void;
  onVoteCast: () => void;
}

export const PitchDetailModal: React.FC<PitchDetailModalProps> = ({
  idea,
  open,
  onClose,
  onVoteCast,
}) => {
  const { user } = useTempUser();
  const [currentVote, setCurrentVote] = useState<number | undefined>(idea?.userVote);
  const [avgScore, setAvgScore] = useState<number>(idea?.averageCoolness || 0);
  const [totalVotes, setTotalVotes] = useState<number>(idea?.totalVotes || 0);
  const [voting, setVoting] = useState(false);

  // Comments state
  const [commentsList, setCommentsList] = useState<CommentDto[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (idea) {
      setCurrentVote(idea.userVote);
      setAvgScore(idea.averageCoolness);
      setTotalVotes(idea.totalVotes);
      fetchComments(idea.id);
    }
  }, [idea]);

  const fetchComments = async (ideaId: string) => {
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
        onVoteCast();
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
        await fetchComments(idea.id);
      }
    } catch (e) {
      console.error('Failed to post comment', e);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!idea) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ p: 3, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <MascotBadge pokemon={idea.authorPokemon} authorName={idea.authorName} showQuote />
          <Typography variant="caption" color="text.secondary">
            Pitched on {new Date(idea.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
          {idea.title}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
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

        <Box sx={{ mb: 3, p: 2, borderLeft: '4px solid', borderColor: 'primary.main', backgroundColor: 'background.paper' }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
            Short Hook (280 Chars Max):
          </Typography>
          <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
            "{idea.shortDescription}"
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          📄 Full Pitch Proposal
        </Typography>
        <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.paper', mb: 4 }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
            {idea.pitchMarkdown}
          </ReactMarkdown>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          💬 Creator Discussions ({commentsList.length})
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Have feedback or a question on this pitch? Join the discussion..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            onClick={() => handlePostComment()}
            disabled={submittingComment || !newComment.trim()}
          >
            Post Comment
          </Button>
        </Box>

        {commentsList.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No comments yet. Be the first to spark a discussion!
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
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
