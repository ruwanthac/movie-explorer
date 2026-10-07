import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import getTheme from '../theme';
import { getStoredItem, setStoredItem } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

const ColorModeContext = createContext({ mode: 'light', toggleColorMode: () => {} });

// Uses the saved choice first, then falls back to the operating system preference
const getInitialMode = () => {
  const saved = getStoredItem(STORAGE_KEYS.THEME);
  if (saved === 'light' || saved === 'dark') return saved;

  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

// Provides the MUI theme plus a toggle for switching between light and dark mode
export const ColorModeProvider = ({ children }) => {
  const [mode, setMode] = useState(getInitialMode);

  // Remember the user's choice for their next visit
  useEffect(() => {
    setStoredItem(STORAGE_KEYS.THEME, mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggleColorMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
    }),
    [mode]
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export const useColorMode = () => useContext(ColorModeContext);
