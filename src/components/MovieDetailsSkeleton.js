import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

// Loading placeholder with the same layout as the details page
const MovieDetailsSkeleton = () => (
  <Box aria-hidden="true">
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 4 } }}>
      <Skeleton
        variant="rectangular"
        sx={{ width: { xs: 180, sm: 260 }, height: 'auto', aspectRatio: '2 / 3', borderRadius: 2, flexShrink: 0 }}
      />
      <Box sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" sx={{ fontSize: '2.5rem', width: '70%' }} />
        <Skeleton variant="text" width="40%" />
        <Box sx={{ display: 'flex', gap: 1, my: 2 }}>
          <Skeleton variant="rounded" width={70} height={28} />
          <Skeleton variant="rounded" width={70} height={28} />
          <Skeleton variant="rounded" width={70} height={28} />
        </Box>
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="80%" />
      </Box>
    </Box>
  </Box>
);

export default MovieDetailsSkeleton;
