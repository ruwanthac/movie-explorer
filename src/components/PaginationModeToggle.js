import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import { PAGINATION_MODES } from '../utils/constants';

// Small switch between infinite scroll and the "Load More" button
const PaginationModeToggle = ({ mode, onChange }) => (
  <ToggleButtonGroup
    value={mode}
    exclusive
    size="small"
    aria-label="How to load more movies"
    // Ignore clicks on the already-selected option (MUI passes null)
    onChange={(event, value) => value && onChange(value)}
  >
    <Tooltip title="Load automatically while scrolling">
      <ToggleButton value={PAGINATION_MODES.SCROLL} aria-label="Infinite scroll">
        <AllInclusiveIcon fontSize="small" />
      </ToggleButton>
    </Tooltip>
    <Tooltip title="Show a Load More button">
      <ToggleButton value={PAGINATION_MODES.BUTTON} aria-label="Load more button">
        <ExpandCircleDownIcon fontSize="small" />
      </ToggleButton>
    </Tooltip>
  </ToggleButtonGroup>
);

export default PaginationModeToggle;
