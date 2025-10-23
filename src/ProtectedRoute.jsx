import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

export default function ProtectedRoute({ allowedRoles, redirectTo = '/' }) {
  const { role, loading } = useAuth();

  if (loading)
    return (
      <div className="loader-center">
        <ClipLoader color="#543361" size={60} />
      </div>
    );

  return allowedRoles.includes(role) ? (
    <Outlet />
  ) : (
    <Navigate to={redirectTo} replace />
  );
}
