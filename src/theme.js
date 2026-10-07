import { alpha, createTheme } from '@mui/material/styles';

// Builds the MUI theme for the given mode ('light' or 'dark').
// Component overrides here give every button, card and input the same look.
const getTheme = (mode) => {
  const isDark = mode === 'dark';

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#90caf9' : '#1565c0',
      },
      secondary: {
        main: '#f5c518', // gold accent used for ratings
      },
      error: {
        main: isDark ? '#f44336' : '#d32f2f',
      },
      background: isDark
        ? { default: '#0e1117', paper: '#171b23' }
        : { default: '#f4f6fa', paper: '#ffffff' },
      text: isDark ? { secondary: 'rgba(255, 255, 255, 0.72)' } : { secondary: 'rgba(0, 0, 0, 0.64)' },
      divider: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.02em' },
      h2: { fontWeight: 800, letterSpacing: '-0.02em' },
      h3: { fontWeight: 800, letterSpacing: '-0.02em' },
      h4: { fontWeight: 800, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 700, letterSpacing: '-0.01em' },
      button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
    },
  });

  // Soft, low-contrast shadows instead of MUI's default heavier ones
  const softShadow = isDark ? '0 4px 14px rgba(0, 0, 0, 0.45)' : '0 4px 14px rgba(21, 101, 192, 0.18)';

  return createTheme(theme, {
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          // Clear focus outline for keyboard users (not shown for mouse clicks)
          '*:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 2,
          },
          // Gentle fade-in used by movie cards and the featured banner
          '@keyframes fadeInUp': {
            from: { opacity: 0, transform: 'translateY(8px)' },
            to: { opacity: 1, transform: 'none' },
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 999,
            paddingInline: 18,
            transition: 'transform 0.15s ease, box-shadow 0.2s ease, background-color 0.2s ease',
            '&:active': { transform: 'scale(0.97)' },
          },
          contained: {
            '&:hover': { boxShadow: softShadow },
          },
          sizeLarge: { paddingBlock: 10, fontSize: '1rem' },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'transform 0.15s ease, background-color 0.2s ease',
            '&:active': { transform: 'scale(0.92)' },
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: { textTransform: 'none' },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundColor: theme.palette.background.paper,
            transition: 'box-shadow 0.2s ease',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(theme.palette.primary.main, 0.5),
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.15)}`,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            boxShadow: isDark ? '0 2px 10px rgba(0, 0, 0, 0.4)' : '0 2px 10px rgba(15, 23, 42, 0.08)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: { borderRadius: 16 },
          outlined: { borderColor: theme.palette.divider },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500, borderRadius: 999 },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 18 },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: { borderRadius: 12, marginTop: 6 },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { borderRadius: 8, fontSize: '0.78rem' },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: { minHeight: 64 },
        },
      },
    },
  });
};

export default getTheme;
