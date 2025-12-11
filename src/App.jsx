import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './utils/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';

/**
 * App Component
 * Main application router and layout
 * Initializes authentication and socket connection
 */
function App() {
  const { isAuthenticated, fetchCurrentUser } = useAuth();

  // Fetch current user on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    // Always validate token on load to avoid stale/invalid tokens
    if (token) {
      fetchCurrentUser();
    }
  }, [fetchCurrentUser]);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/chat" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/chat" replace /> : <Register />
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
}

export default App;

