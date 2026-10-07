import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';

// Movie details page - will show full information for a single movie
const MovieDetails = () => {
  const { id } = useParams();

  return (
    <Typography variant="h5" component="h1">
      Movie details #{id}
    </Typography>
  );
};

export default MovieDetails;
