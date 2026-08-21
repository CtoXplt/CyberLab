import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getDashboard } from '../services/api';

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    getDashboard()
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-primary" />
        <span>Authenticating...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
