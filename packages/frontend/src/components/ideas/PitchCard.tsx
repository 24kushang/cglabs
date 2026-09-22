import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Button } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import FolderArchiveIcon from '@mui/icons-material/FolderCopy';
import type { IdeaDto } from '@cglabs/shared';
import { MascotBadge } from '../mascots/MascotBadge';

interface PitchCardProps {
  idea: IdeaDto;
  onOpenDetail: (idea: IdeaDto) => void;
}

export const PitchCard: React.FC<PitchCardProps> = ({ idea, onOpenDetail }) => {
  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.2s', '&:hover': { translateY: '-4px' } }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <MascotBadge pokemon={idea.authorPokemon} authorName={idea.authorName} size="small" />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, backgroundColor: 'action.hover', px: 1.5, py: 0.5, borderRadius: 4 }}>
            <StarIcon sx={{ color: '#f59e0b', fontSize: 18 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {idea.averageCoolness > 0 ? `${idea.averageCoolness}/10` : 'Not Rated'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ({idea.totalVotes})
            </Typography>
          </Box>
        </Box>

        {!idea.isCurrentMonth && (
          <Box sx={{ mb: 1 }}>
            <Chip
              icon={<FolderArchiveIcon fontSize="small" />}
              label={`Archived (${idea.monthKey})`}
              size="small"
              color="warning"
              variant="outlined"
            />
          </Box>
        )}

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, cursor: 'pointer' }} onClick={() => onOpenDetail(idea)}>
          {idea.title}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1, lineHeight: 1.6 }}>
          {idea.shortDescription}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {idea.tags?.map((tag) => (
            <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" />
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            {new Date(idea.createdAt).toLocaleDateString()}
          </Typography>
          <Button variant="contained" size="small" onClick={() => onOpenDetail(idea)}>
            View Pitch & Rate &rarr;
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
