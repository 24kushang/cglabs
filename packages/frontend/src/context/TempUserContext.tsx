import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserDto, UserPreferencesDto, AuthResponseDto } from '@cglabs/shared';
import { API_BASE } from '../constants/api';

interface TempUserContextType {
  user: UserDto | null;
  preferences: UserPreferencesDto | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updatePreferences: (newPrefs: Partial<UserPreferencesDto>) => Promise<void>;
  isLoading: boolean;
}

const AUTH_USER_KEY = 'cglabs_auth_user_v2';
const AUTH_TOKEN_KEY = 'cglabs_auth_token_v2';
const PREFS_KEY = 'cglabs_prefs_v2';

const TempUserContext = createContext<TempUserContextType | undefined>(undefined);

export const TempUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDto | null>(null);
  const [preferences, setPreferences] = useState<UserPreferencesDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initAuthSession();
  }, []);

  const initAuthSession = async () => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const storedUserRaw = localStorage.getItem(AUTH_USER_KEY);
      const storedPrefsRaw = localStorage.getItem(PREFS_KEY);

      if (storedToken && storedUserRaw) {
        const parsedUser = JSON.parse(storedUserRaw) as UserDto;
        setUser(parsedUser);
        if (storedPrefsRaw) {
          setPreferences(JSON.parse(storedPrefsRaw));
        }

        // Verify session with backend
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            'x-temp-user-id': storedToken,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
          }
          if (data.preferences) {
            setPreferences(data.preferences);
            localStorage.setItem(PREFS_KEY, JSON.stringify(data.preferences));
          }
        }
      }
    } catch (err) {
      console.error('Failed to restore auth session', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed.');
    }

    const authData = data as AuthResponseDto;
    setUser(authData.user);
    setPreferences(authData.preferences || null);

    localStorage.setItem(AUTH_TOKEN_KEY, authData.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authData.user));
    if (authData.preferences) {
      localStorage.setItem(PREFS_KEY, JSON.stringify(authData.preferences));
    }
  };

  const register = async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed.');
    }

    const authData = data as AuthResponseDto;
    setUser(authData.user);
    setPreferences(authData.preferences || null);

    localStorage.setItem(AUTH_TOKEN_KEY, authData.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authData.user));
    if (authData.preferences) {
      localStorage.setItem(PREFS_KEY, JSON.stringify(authData.preferences));
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(PREFS_KEY);
    setUser(null);
    setPreferences(null);
  };

  const updatePreferences = async (newPrefs: Partial<UserPreferencesDto>) => {
    if (!user) return;

    const merged: UserPreferencesDto = {
      themePresetId: 'cyberpunk',
      primaryColor: '#eab308',
      secondaryColor: '#eab308',
      mode: 'dark',
      fontFamily: 'Inter',
      borderRadius: 10,
      density: 'comfortable',
      pokemon: 'pikachu',
      mascotQuote: 'Innovating at full speed.',
      ...preferences,
      ...newPrefs,
      isConfigured: true,
    };

    setPreferences(merged);
    localStorage.setItem(PREFS_KEY, JSON.stringify(merged));

    const token = localStorage.getItem(AUTH_TOKEN_KEY) || user.id;

    try {
      const res = await fetch(`${API_BASE}/api/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-temp-user-id': token,
        },
        body: JSON.stringify(merged),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save preferences.');
      }

      const updatedPref = await res.json();
      setPreferences(updatedPref);
      localStorage.setItem(PREFS_KEY, JSON.stringify(updatedPref));
    } catch (e: any) {
      console.error('Failed to persist preferences to backend', e);
      throw e;
    }
  };

  return (
    <TempUserContext.Provider
      value={{
        user,
        preferences,
        login,
        register,
        logout,
        updatePreferences,
        isLoading,
      }}
    >
      {children}
    </TempUserContext.Provider>
  );
};

export const useTempUser = () => {
  const context = useContext(TempUserContext);
  if (!context) throw new Error('useTempUser must be used within TempUserProvider');
  return context;
};

