import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  clearError,
} from '../store/slices/authSlice';

/**
 * Custom Hook: useAuth
 * 
 * Provides authentication state and methods
 * Uses useCallback to memoize functions and prevent unnecessary re-renders
 * 
 * Why useCallback:
 * - Prevents function recreation on every render
 * - Useful when passing functions as props to memoized components
 * - Reduces unnecessary re-renders of child components
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  // Memoize login function
  const login = useCallback(
    async (credentials) => {
      return await dispatch(loginUser(credentials));
    },
    [dispatch]
  );

  // Memoize register function
  const register = useCallback(
    async (userData) => {
      return await dispatch(registerUser(userData));
    },
    [dispatch]
  );

  // Memoize logout function
  const logout = useCallback(() => {
    dispatch(logoutUser());
  }, [dispatch]);

  // Memoize getCurrentUser function
  const fetchCurrentUser = useCallback(() => {
    return dispatch(getCurrentUser());
  }, [dispatch]);

  // Memoize clearError function
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    fetchCurrentUser,
    clearError: clearAuthError,
  };
};




