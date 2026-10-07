import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { getYouTubeEmbedUrl, getYouTubeUrl } from '../utils/formatters';

// Plays a YouTube trailer in a pop-up player.
// The video is removed from the page when the dialog closes, which stops playback.
const TrailerDialog = ({ open, onClose, trailer, movieTitle }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (!trailer) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="md"
      aria-labelledby="trailer-dialog-title"
      slotProps={{ paper: { sx: { bgcolor: '#000', color: '#fff', borderRadius: fullScreen ? 0 : undefined } } }}
    >
      <DialogTitle
        id="trailer-dialog-title"
        sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 1, py: 1.5 }}
      >
        <Box component="span" sx={{ flexGrow: 1, fontSize: '1rem', fontWeight: 600 }}>
          {movieTitle} - {trailer.name || 'Trailer'}
        </Box>
        <IconButton onClick={onClose} aria-label="Close trailer" sx={{ color: '#fff' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* 16:9 player; on phones it is centred in the full-screen dialog */}
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16 / 9' }}>
          {open && (
            <Box
              component="iframe"
              src={getYouTubeEmbedUrl(trailer.key)}
              title={`${movieTitle} trailer`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
            />
          )}
        </Box>
      </Box>

      {/* Fallback for videos whose owners have disabled embedding */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <Button
          size="small"
          href={getYouTubeUrl(trailer.key)}
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<OpenInNewIcon />}
          sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
        >
          Watch on YouTube
        </Button>
      </Box>
    </Dialog>
  );
};

export default TrailerDialog;
