import Box from '@mui/material/Box';

// The Movie Explorer app icon (same image as the browser tab icon)
const AppLogo = ({ size = 32, sx }) => (
  <Box
    component="img"
    src={`${process.env.PUBLIC_URL}/favicon.svg`}
    alt=""
    aria-hidden="true"
    sx={{ width: size, height: size, display: 'block', flexShrink: 0, ...sx }}
  />
);

export default AppLogo;
