import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import useOnlineStatus from '../hooks/useOnlineStatus';
import { isApiKeyConfigured, MISSING_API_KEY_MESSAGE } from '../api/tmdb';

// App-wide warnings shown above the page content:
// - when the browser is offline
// - when the TMDb API key has not been configured (e.g. a deploy without env vars)
const StatusBanners = () => {
  const isOnline = useOnlineStatus();
  const apiKeyMissing = !isApiKeyConfigured();

  if (isOnline && !apiKeyMissing) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
      {!isOnline && (
        <Alert severity="warning" role="status">
          You&apos;re offline. Movies will load again when your connection is back.
        </Alert>
      )}
      {apiKeyMissing && (
        <Alert severity="error">
          <AlertTitle>Configuration needed</AlertTitle>
          {MISSING_API_KEY_MESSAGE}
        </Alert>
      )}
    </Box>
  );
};

export default StatusBanners;
