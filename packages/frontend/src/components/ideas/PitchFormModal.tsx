import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  Alert,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import type { CreateIdeaDto } from '@cglabs/shared';
import { useTempUser } from '../../context/TempUserContext';
import { API_BASE } from '../../constants/api';
import { triggerMascotReaction } from '../../utils/mascotEvents';

interface PitchFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PitchFormModal: React.FC<PitchFormModalProps> = ({ open, onClose, onSuccess }) => {
  const { user } = useTempUser();
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [pitchMarkdown, setPitchMarkdown] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['tech', 'idea']);
  const [tab, setTab] = useState<0 | 1>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const milestone100Ref = React.useRef(false);
  const milestone200Ref = React.useRef(false);

  const getCharCount = (str: string) => [...str.trim()].length;
  const rawCharCount = [...shortDescription].length;

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async () => {
    const trimmedDesc = shortDescription.trim();
    const charCount = getCharCount(shortDescription);

    if (!title.trim() || !trimmedDesc || !pitchMarkdown.trim()) {
      setError('Title, short description (max 280 chars), and pitch proposal markdown are required.');
      return;
    }
    if (charCount > 280) {
      setError(`Short description exceeds 280 characters (currently ${charCount} chars).`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const dto: CreateIdeaDto = {
        title: title.trim(),
        shortDescription: trimmedDesc,
        pitchMarkdown: pitchMarkdown.trim(),
        tags,
      };

      const res = await fetch(`${API_BASE}/api/ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-temp-user-id': user?.id || '',
        },
        body: JSON.stringify({ idea: dto }),
      });

      if (res.ok) {
        triggerMascotReaction("PITCH DEPLOYED! +50 EXP awarded! Let's go! 🎉", 'excited', 'fanfare');
        setTitle('');
        setShortDescription('');
        setPitchMarkdown('');
        milestone100Ref.current = false;
        milestone200Ref.current = false;
        onSuccess();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit pitch proposal.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 700 }}>💡 Pitch a New Idea</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          label="Idea Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. AI-Powered Dynamic UI Theme Generator"
          sx={{ mb: 3 }}
        />

        <Box sx={{ mb: 3 }}>
          <TextField
            label="Short Hook / Catchy Summary"
            fullWidth
            multiline
            rows={2}
            value={shortDescription}
            onChange={(e) => {
              const val = e.target.value;
              const len = [...val].length;
              if (len <= 280) {
                setShortDescription(val);
                if (len >= 100 && !milestone100Ref.current) {
                  milestone100Ref.current = true;
                  triggerMascotReaction('Great problem hook! Making it punchy! ✨', 'happy', 'chirp');
                }
                if (len >= 200 && !milestone200Ref.current) {
                  milestone200Ref.current = true;
                  triggerMascotReaction('Awesome detail! Getting close to the 280-char sweet spot! 🚀', 'excited', 'chime');
                }
              }
            }}
            placeholder="Summarize your idea in 280 characters or fewer..."
            helperText={`${rawCharCount}/280 characters max`}
            error={rawCharCount > 280}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label="Edit Pitch Markdown" />
              <Tab label="Live Preview" />
            </Tabs>
            <Typography variant="caption" color="text.secondary">
              Markdown & GFM Supported
            </Typography>
          </Box>

          {tab === 0 ? (
            <TextField
              multiline
              rows={8}
              fullWidth
              value={pitchMarkdown}
              onChange={(e) => setPitchMarkdown(e.target.value)}
              placeholder="# Problem Statement&#10;Explain what problem your idea solves...&#10;&#10;## Proposed Solution&#10;Describe your pitch in detail using markdown headings, lists, or code blocks..."
            />
          ) : (
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, minHeight: 200, backgroundColor: 'background.paper' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {pitchMarkdown || '*Nothing to preview yet. Write your pitch in the editor!*'}
              </ReactMarkdown>
            </Box>
          )}
        </Box>

        <Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              size="small"
              label="Add Tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            />
            <Button variant="outlined" onClick={handleAddTag}>Add</Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {tags.map((t) => (
              <Chip key={t} label={`#${t}`} onDelete={() => handleRemoveTag(t)} size="small" />
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Publishing...' : '🚀 Submit Pitch Proposal'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
