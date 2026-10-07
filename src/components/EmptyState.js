import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Friendly placeholder for empty lists: an icon in a soft circle,
// a title, a hint and an optional action button
const EmptyState = ({ icon, title, hint, action }) => (
  <Box sx={{ textAlign: 'center', py: { xs: 6, sm: 8 }, px: 2, animation: 'fadeInUp 0.35s ease both' }}>
    <Box
      sx={{
        width: 88,
        height: 88,
        mx: 'auto',
        mb: 2,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'action.hover',
        color: 'primary.main',
        '& svg': { fontSize: 44 },
      }}
    >
      {icon}
    </Box>
    <Typography variant="h6" component="p" sx={{ mb: 0.5 }}>
      {title}
    </Typography>
    {hint && (
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto' }}>
        {hint}
      </Typography>
    )}
    {action && <Box sx={{ mt: 3 }}>{action}</Box>}
  </Box>
);

export default EmptyState;
