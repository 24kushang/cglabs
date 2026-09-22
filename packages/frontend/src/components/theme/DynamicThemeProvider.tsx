import React, { useMemo } from 'react';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { useTempUser } from '../../context/TempUserContext';
import { POKEMON_MASCOTS } from '../../constants/mascots';

export const DynamicThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { preferences } = useTempUser();

  const activeTheme = useMemo(() => {
    const pokemonId = preferences?.pokemon || 'pikachu';
    const mascot = POKEMON_MASCOTS[pokemonId] || POKEMON_MASCOTS.pikachu;

    const mode = preferences?.mode || 'dark';
    const primaryColor = mascot.themeColor;
    const secondaryColor = mascot.themeColor;
    const fontFamily = preferences?.fontFamily || 'Inter';
    const borderRadius = preferences?.borderRadius ?? 10;

    return createTheme({
      palette: {
        mode,
        primary: {
          main: primaryColor,
        },
        secondary: {
          main: secondaryColor,
        },
        background: {
          default: mode === 'dark' ? '#090d16' : '#f8fafc',
          paper: mode === 'dark' ? '#131b2e' : '#ffffff',
        },
      },
      typography: {
        fontFamily: `"${fontFamily}", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
        h4: {
          fontWeight: 800,
        },
        h6: {
          fontWeight: 700,
        },
      },
      shape: {
        borderRadius,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 700,
              borderRadius,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius,
              boxShadow: mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.4)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
            },
          },
        },
      },
    });
  }, [preferences]);

  return (
    <ThemeProvider theme={activeTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

