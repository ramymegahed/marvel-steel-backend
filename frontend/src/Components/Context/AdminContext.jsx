import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../App';

const AdminContext = createContext();

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};

export const AdminProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const storedAdmin = localStorage.getItem('admin');
            const token = localStorage.getItem('adminToken');

            if (storedAdmin && token) {
                try {
                    setAdmin(JSON.parse(storedAdmin));
                    setIsAuthenticated(true);
                } catch {
                    // Corrupted data — clear it
                    localStorage.removeItem('admin');
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminAuth');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (credentials) => {
        try {
            const formData = new URLSearchParams();
            formData.append('grant_type', 'password');
            formData.append('username', credentials.username);
            formData.append('password', credentials.password);
            formData.append('scope', '');
            formData.append('client_id', '');
            formData.append('client_secret', '');

            const response = await axios.post(
                `${BASE_URL}/api/v1/admin/login`,
                formData,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            const adminData = response.data;

            // Save token — support both access_token and token field names
            const token = adminData.access_token || adminData.token;
            if (!token) throw new Error('No token received from server');

            localStorage.setItem('admin', JSON.stringify(adminData));
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminAuth', 'true');

            setAdmin(adminData);
            setIsAuthenticated(true);

            return { success: true, data: adminData };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error:
                    error.response?.data?.detail ||
                    error.response?.data?.message ||
                    error.message ||
                    'Login failed',
            };
        }
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem('adminToken');

            if (token) {
                await axios.post(
                    `${BASE_URL}/api/v1/admin/logout`, // ✅ Fixed: was missing leading slash
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('admin');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminAuth');
            localStorage.removeItem('adminEmail');

            setAdmin(null);
            setIsAuthenticated(false);
        }
    };

    // Helper: returns headers with Authorization for protected requests
    const getAuthHeaders = () => {
        const token = localStorage.getItem('adminToken');
        return {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    };

    const value = {
        admin,
        loading,
        isAuthenticated,
        login,
        logout,
        getAuthHeaders,
    };

    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};