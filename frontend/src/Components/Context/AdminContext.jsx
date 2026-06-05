import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../App';

/** Decode the `exp` claim from a JWT without verifying the signature. */
function getTokenExpiry(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp ? payload.exp * 1000 : null; // convert to ms
    } catch {
        return null;
    }
}

const WARN_BEFORE_MS = 15 * 60 * 1000; // show warning 15 min before expiry

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
    const [sessionWarning, setSessionWarning] = useState(false); // true when <15 min left
    const warnTimerRef = useRef(null);
    const expireTimerRef = useRef(null);

    const _clearExpiryTimers = useCallback(() => {
        clearTimeout(warnTimerRef.current);
        clearTimeout(expireTimerRef.current);
    }, []);

    const _scheduleExpiryTimers = useCallback((token) => {
        _clearExpiryTimers();
        const expiresAt = getTokenExpiry(token);
        if (!expiresAt) return;
        const now = Date.now();
        const warnIn = expiresAt - now - WARN_BEFORE_MS;
        const expireIn = expiresAt - now;

        if (warnIn > 0) {
            warnTimerRef.current = setTimeout(() => setSessionWarning(true), warnIn);
        } else {
            setSessionWarning(true); // already in the warning window
        }
        if (expireIn > 0) {
            expireTimerRef.current = setTimeout(() => {
                // Token expired — force client-side logout
                localStorage.removeItem('admin');
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminAuth');
                localStorage.removeItem('adminEmail');
                setAdmin(null);
                setIsAuthenticated(false);
                setSessionWarning(false);
                window.location.href = '/admin/login';
            }, expireIn);
        }
    }, [_clearExpiryTimers]);

    useEffect(() => {
        const checkAuth = () => {
            const storedAdmin = localStorage.getItem('admin');
            const token = localStorage.getItem('adminToken');

            if (storedAdmin && token) {
                try {
                    const expiry = getTokenExpiry(token);
                    if (expiry && expiry < Date.now()) {
                        // Token already expired — clear immediately
                        localStorage.removeItem('admin');
                        localStorage.removeItem('adminToken');
                        localStorage.removeItem('adminAuth');
                    } else {
                        const parsed = JSON.parse(storedAdmin);
                        setAdmin(parsed);
                        setIsAuthenticated(true);
                        _scheduleExpiryTimers(token);
                    }
                } catch {
                    localStorage.removeItem('admin');
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('adminAuth');
                }
            }
            setLoading(false);
        };

        checkAuth();
        return () => _clearExpiryTimers();
    }, [_scheduleExpiryTimers, _clearExpiryTimers]);

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
            setSessionWarning(false);
            _scheduleExpiryTimers(token);

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
            setSessionWarning(false);
            _clearExpiryTimers();
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
        sessionWarning,
        login,
        logout,
        getAuthHeaders,
    };

    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};