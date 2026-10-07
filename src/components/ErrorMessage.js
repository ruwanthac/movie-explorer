import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';

// Consistent error box used across the app, with an optional Retry button
const ErrorMessage = ({ message, onRetry, title, sx }) => (
  <Alert
    severity="error"
    role="alert"
    sx={sx}
    action={
      onRetry ? (
        <Button color="inherit" size="small" startIcon={<RefreshIcon />} onClick={onRetry}>
          Retry
        </Button>
      ) : null
    }
  >
    {title && <AlertTitle>{title}</AlertTitle>}
    {message}
  </Alert>
);

export default ErrorMessage;
