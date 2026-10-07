import { createContext, useContext, useMemo, useState } from 'react';
import { getStoredItem, setStoredItem, removeStoredItem } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

export const MIN_USERNAME_LENGTH = 3;
export const MIN_PASSWORD_LENGTH = 6;

const AuthContext = createContext(null);

// Checks the login form and returns an error message for each invalid field
export const validateCredentials = (username, password) => {
  const errors = {};

  if (!username.trim()) {
    errors.username = 'Username is required';
  } else if (username.trim().length < MIN_USERNAME_LENGTH) {
    errors.username = `Username must be at least ${MIN_USERNAME_LENGTH} characters`;
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }

  return errors;
};

// Frontend-only authentication.
// The task does not include a backend, so any valid username/password signs in.
// Only the username is stored - the password is never saved.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredItem(STORAGE_KEYS.USER));

  const value = useMemo(() => {
    const login = (username, password) => {
      const errors = validateCredentials(username, password);
      if (Object.keys(errors).length > 0) {
        return { success: false, errors };
      }

      const loggedInUser = { username: username.trim() };
      setUser(loggedInUser);
      setStoredItem(STORAGE_KEYS.USER, loggedInUser);
      return { success: true };
    };

    const logout = () => {
      setUser(null);
      removeStoredItem(STORAGE_KEYS.USER);
    };

    return { user, isAuthenticated: Boolean(user), login, logout };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
