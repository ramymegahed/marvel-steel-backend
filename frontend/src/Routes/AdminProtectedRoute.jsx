import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../Components/Context/AdminContext';

export default function AdminProtectedRoute({ children }) {
    const { isAuthenticated, loading, mustChangePassword } = useAdmin();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#8B5E3C] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    if (mustChangePassword && location.pathname !== '/admin/change-password') {
        return <Navigate to="/admin/change-password" replace />;
    }

    return children;
}