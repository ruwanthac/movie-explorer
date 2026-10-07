import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';

// Grey placeholder with the same shape as a MovieCard, shown while loading
const MovieCardSkeleton = () => (
  <Card sx={{ height: '100%' }} aria-hidden="true">
    <Skeleton variant="rectangular" sx={{ width: '100%', height: 'auto', aspectRatio: '2 / 3' }} />
    <CardContent sx={{ p: 1.5 }}>
      <Skeleton width="90%" />
      <Skeleton width="40%" />
    </CardContent>
  </Card>
);

export default MovieCardSkeleton;
