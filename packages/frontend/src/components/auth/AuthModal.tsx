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
  Alert,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { useTempUser } from '../../context/TempUserContext';

interface AuthModalProps {
  open: boolean;
  onClose?: () => void;
  allowClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, allowClose = false }) => {
  const { login, register } = useTempUser();
  const [tab, setTab] = useState<0 | 1>(0); // 0 = Login, 1 = Register

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      if (tab === 0) {
        await login(username, password);
      } else {
        await register(username, password);
      }
      if (onClose) onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} fullWidth maxWidth="xs" disableEscapeKeyDown={!allowClose} onClose={allowClose ? onClose : undefined}>
      <DialogTitle sx={{ textCenter: 'center', pt: 3, pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, textAlign: 'center' }}>
          {tab === 0 ? '🔒 Creator Sign-In' : '🚀 Create Creator Account'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 0.5 }}>
          Your username will be displayed across all pitch decks, comments & ratings.
        </Typography>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, val) => { setTab(val); setErrorMsg(''); }} centered indicatorColor="primary">
          <Tab icon={<LockOutlinedIcon />} iconPosition="start" label="Sign In" sx={{ fontWeight: 700 }} />
          <Tab icon={<PersonAddOutlinedIcon />} iconPosition="start" label="Register" sx={{ fontWeight: 700 }} />
        </Tabs>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            helperText="At least 3 characters. Used on your badges & pitches."
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            helperText="At least 4 characters."
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'space-between' }}>
          <Button
            variant="text"
            onClick={() => {
              setTab(tab === 0 ? 1 : 0);
              setErrorMsg('');
            }}
          >
            {tab === 0 ? "Need an account? Register" : "Have an account? Sign in"}
          </Button>

          <Button type="submit" variant="contained" size="large" disabled={submitting || !username.trim() || !password.trim()}>
            {tab === 0 ? 'Sign In' : 'Register'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
