import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmin } from '../Components/Context/AdminContext';

export default function AdminProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAdmin();

    if (loading) {
        // You can show a loading spinner here
        return (
            <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#8B5E3C] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin-login" replace />;
    }

    return children;
}