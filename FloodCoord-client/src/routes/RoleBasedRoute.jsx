import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleBasedRoute - Component to protect routes based on user role
 * Redirects to login if not authenticated
 * Redirects to home if user doesn't have required role
 */
export default function RoleBasedRoute({ children, allowedRoles = [] }) {
    const { isAuthenticated, role, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        // User doesn't have required role, redirect to home
        return <Navigate to="/" replace />;
    }

    return children;
}
