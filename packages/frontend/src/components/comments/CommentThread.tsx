import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Paper, Avatar } from '@mui/material';
import type { CommentDto } from '@cglabs/shared';
import { MascotBadge } from '../mascots/MascotBadge';
import ReplyIcon from '@mui/icons-material/Reply';

interface CommentThreadProps {
  comment: CommentDto;
  onReply: (parentId: string, content: string) => Promise<void>;
}

export const CommentThread: React.FC<CommentThreadProps> = ({ comment, onReply }) => {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await onReply(comment.id, replyText.trim());
      setReplyText('');
      setReplyOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 1.5, backgroundColor: 'background.paper' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <MascotBadge pokemon={comment.authorPokemon} authorName={comment.authorName} size="small" />
        <Typography variant="caption" color="text.secondary">
          {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ my: 1, whiteSpace: 'pre-wrap' }}>
        {comment.content}
      </Typography>

      <Button
        size="small"
        startIcon={<ReplyIcon />}
        onClick={() => setReplyOpen(!replyOpen)}
        sx={{ textTransform: 'none', py: 0 }}
      >
        Reply
      </Button>

      {replyOpen && (
        <Box sx={{ mt: 1.5, pl: 2, borderLeft: '2px solid', borderColor: 'primary.main' }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" variant="contained" onClick={handleSendReply} disabled={submitting}>
              Send Reply
            </Button>
            <Button size="small" onClick={() => setReplyOpen(false)}>
              Cancel
            </Button>
          </Box>
        </Box>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <Box sx={{ pl: 3, mt: 2, borderLeft: '2px dashed', borderColor: 'divider' }}>
          {comment.replies.map((reply) => (
            <CommentThread key={reply.id} comment={reply} onReply={onReply} />
          ))}
        </Box>
      )}
    </Paper>
  );
};
