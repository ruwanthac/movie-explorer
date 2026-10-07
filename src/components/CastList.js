import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { getImageUrl } from '../api/tmdb';
import { PROFILE_SIZE } from '../utils/constants';

const MAX_CAST = 15;

// Horizontal, swipeable list of the main cast with photos and character names
const CastList = ({ cast = [] }) => {
  if (cast.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No cast information available.
      </Typography>
    );
  }

  return (
    <Box
      component="ul"
      aria-label="Cast"
      sx={{
        display: 'flex',
        gap: 2,
        overflowX: 'auto',
        listStyle: 'none',
        p: 0,
        m: 0,
        pb: 1,
        scrollSnapType: 'x mandatory',
      }}
    >
      {cast.slice(0, MAX_CAST).map((person) => (
        <Box
          component="li"
          key={person.credit_id || person.id}
          sx={{ flex: '0 0 auto', width: 96, textAlign: 'center', scrollSnapAlign: 'start' }}
        >
          <Avatar
            src={getImageUrl(person.profile_path, PROFILE_SIZE) || undefined}
            alt={person.name}
            sx={{ width: 80, height: 80, mx: 'auto', mb: 1 }}
          >
            {/* Shown when there is no photo */}
            {person.name.charAt(0)}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
            {person.name}
          </Typography>
          {person.character && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
              {person.character}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default CastList;
