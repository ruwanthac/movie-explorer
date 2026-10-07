import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import StarIcon from '@mui/icons-material/Star';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { countActiveFilters, EMPTY_FILTERS } from '../context/MovieContext';

const FIRST_YEAR = 1950;

// Years from next year (for announced releases) back to FIRST_YEAR
const getYearOptions = () => {
  const latest = new Date().getFullYear() + 1;
  return Array.from({ length: latest - FIRST_YEAR + 1 }, (_, index) => String(latest - index));
};

const RATING_MARKS = [0, 3, 5, 7, 9].map((value) => ({ value, label: value === 0 ? 'Any' : `${value}+` }));

// Genre, release year and minimum rating filters.
// `filters` is { genre, year, minRating }; every change calls onChange with the new filters.
const FilterPanel = ({ filters, onChange, genres, genresLoading, genresError, onRetryGenres }) => {
  // The slider shows its value while dragging but only applies it on release,
  // so dragging does not send a request for every step
  const [rating, setRating] = useState(filters.minRating);
  useEffect(() => setRating(filters.minRating), [filters.minRating]);

  const handleSelect = (field) => (event) => onChange({ ...filters, [field]: event.target.value });

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Box
        sx={{
          display: 'grid',
          gap: { xs: 2, sm: 3 },
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1.4fr' },
          alignItems: 'start',
        }}
      >
        <FormControl fullWidth size="small" error={Boolean(genresError)}>
          <InputLabel id="genre-filter-label">Genre</InputLabel>
          <Select
            labelId="genre-filter-label"
            label="Genre"
            value={filters.genre}
            onChange={handleSelect('genre')}
            disabled={genresLoading && genres.length === 0}
          >
            <MenuItem value="">All genres</MenuItem>
            {genres.map((genre) => (
              <MenuItem key={genre.id} value={String(genre.id)}>
                {genre.name}
              </MenuItem>
            ))}
          </Select>
          {genresError && (
            <FormHelperText>
              {genresError}{' '}
              <Button size="small" onClick={onRetryGenres} sx={{ p: 0, minWidth: 0, verticalAlign: 'baseline' }}>
                Retry
              </Button>
            </FormHelperText>
          )}
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel id="year-filter-label">Release year</InputLabel>
          <Select
            labelId="year-filter-label"
            label="Release year"
            value={filters.year}
            onChange={handleSelect('year')}
            MenuProps={{ slotProps: { paper: { sx: { maxHeight: 320 } } } }}
          >
            <MenuItem value="">Any year</MenuItem>
            {getYearOptions().map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ px: 1 }}>
          <Typography id="rating-filter-label" variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            Minimum rating:
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', fontWeight: 700, color: 'text.primary' }}>
              {rating > 0 ? (
                <>
                  {rating}+ <StarIcon sx={{ fontSize: 16, color: 'secondary.main', ml: 0.25 }} />
                </>
              ) : (
                'Any'
              )}
            </Box>
          </Typography>
          <Slider
            aria-labelledby="rating-filter-label"
            value={rating}
            onChange={(event, value) => setRating(value)}
            onChangeCommitted={(event, value) => onChange({ ...filters, minRating: value })}
            min={0}
            max={9}
            step={1}
            marks={RATING_MARKS}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>
      </Box>

      {countActiveFilters(filters) > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button size="small" startIcon={<FilterAltOffIcon />} onClick={() => onChange(EMPTY_FILTERS)}>
            Clear filters
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default FilterPanel;
