import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

// Movie search input with a search icon and a clear button
const SearchBar = ({ value, onChange, onClear }) => (
  <TextField
    fullWidth
    type="search"
    placeholder="Search for a movie..."
    value={value}
    onChange={(event) => onChange(event.target.value)}
    // Escape clears the search, like most search boxes
    onKeyDown={(event) => {
      if (event.key === 'Escape') onClear();
    }}
    slotProps={{
      htmlInput: { 'aria-label': 'Search movies' },
      input: {
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: value ? (
          <InputAdornment position="end">
            <IconButton onClick={onClear} edge="end" aria-label="Clear search">
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ) : null,
      },
    }}
    sx={{
      bgcolor: 'background.paper',
      borderRadius: 1,
      // Hide the browser's built-in clear "x" so only our button shows
      '& input[type="search"]::-webkit-search-cancel-button': { display: 'none' },
    }}
  />
);

export default SearchBar;
