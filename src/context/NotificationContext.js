import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const NotificationContext = createContext({ notify: () => {} });

// Shows short messages at the bottom of the screen, e.g. "Added to favorites".
// Call notify(message, severity) from anywhere in the app.
export const NotificationProvider = ({ children }) => {
  // The last message is kept while the snackbar animates out
  const [notification, setNotification] = useState({ message: '', severity: 'success', key: 0 });
  const [open, setOpen] = useState(false);

  // A new key makes the snackbar restart its timer for every message
  const notify = useCallback((message, severity = 'success') => {
    setNotification((prev) => ({ message, severity, key: prev.key + 1 }));
    setOpen(true);
  }, []);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        key={notification.key}
        open={open}
        autoHideDuration={2500}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={notification.severity} variant="filled" sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
