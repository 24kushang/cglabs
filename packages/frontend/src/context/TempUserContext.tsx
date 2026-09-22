import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserPreferencesDto } from '@cglabs/shared';
import { API_BASE } from '../constants/api';

interface TempUser {
  id: string;
  displayName: string;
  expiresAt: number;
  isConfigured: boolean;
}

interface TempUserContextType {
  user: TempUser | null;
  preferences: UserPreferencesDto | null;
  updatePreferences: (newPrefs: Partial<UserPreferencesDto>) => Promise<void>;
  resetTempUser: () => void;
  isLoading: boolean;
}

const STORAGE_KEY = 'pitchdeck_temp_user_v1';
const PREFS_KEY = 'pitchdeck_temp_prefs_v1';

const TempUserContext = createContext<TempUserContextType | undefined>(undefined);

export const TempUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TempUser | null>(null);
  const [preferences, setPreferences] = useState<UserPreferencesDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initUser();
  }, []);

  const initUser = async () => {
    setIsLoading(true);
    try {
      const storedUserRaw = localStorage.getItem(STORAGE_KEY);
      let currentUserId = '';
      let isValidSession = false;

      if (storedUserRaw) {
        try {
          const parsed = JSON.parse(storedUserRaw) as TempUser;
          if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
            currentUserId = parsed.id;
            isValidSession = true;
          }
        } catch (e) {}
      }

      if (!isValidSession) {
        currentUserId = crypto.randomUUID();
      }

      // Sync with backend API
      const res = await fetch(`${API_BASE}/api/users/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-temp-user-id': currentUserId,
        },
        body: JSON.stringify({ userId: currentUserId }),
      });

      if (res.ok) {
        const data = await res.json();
        const userData: TempUser = {
          id: data.user.id,
          displayName: data.user.displayName,
          expiresAt: data.user.expiresAt,
          isConfigured: data.preferences?.isConfigured ?? false,
        };

        const prefsData: UserPreferencesDto = data.preferences || {
          themePresetId: 'cyberpunk',
          primaryColor: '#00f3ff',
          secondaryColor: '#ff0055',
          mode: 'dark',
          fontFamily: 'Inter',
          borderRadius: 8,
          density: 'comfortable',
          pokemon: 'pikachu',
          mascotQuote: 'Sparking high-voltage breakthroughs.',
          isConfigured: false,
        };

        setUser(userData);
        setPreferences(prefsData);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        localStorage.setItem(PREFS_KEY, JSON.stringify(prefsData));
      }
    } catch (err) {
      console.error('Failed to init user session', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (newPrefs: Partial<UserPreferencesDto>) => {
    if (!user || !preferences) return;

    const merged: UserPreferencesDto = {
      ...preferences,
      ...newPrefs,
      isConfigured: true,
    };

    setPreferences(merged);

    const updatedUser = { ...user, isConfigured: true };
    setUser(updatedUser);

    localStorage.setItem(PREFS_KEY, JSON.stringify(merged));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

    try {
      await fetch(`${API_BASE}/api/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-temp-user-id': user.id,
        },
        body: JSON.stringify(merged),
      });
    } catch (e) {
      console.error('Failed to persist preferences to backend', e);
    }
  };

  const resetTempUser = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PREFS_KEY);
    initUser();
  };

  return (
    <TempUserContext.Provider value={{ user, preferences, updatePreferences, resetTempUser, isLoading }}>
      {children}
    </TempUserContext.Provider>
  );
};

export const useTempUser = () => {
  const context = useContext(TempUserContext);
  if (!context) throw new Error('useTempUser must be used within TempUserProvider');
  return context;
};
