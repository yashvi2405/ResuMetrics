import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

/** Decode a JWT and return true if it is expired (or malformed). */
function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // exp is in seconds; Date.now() is in ms
        return payload.exp * 1000 < Date.now();
    } catch {
        return true; // treat malformed token as expired
    }
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    // Restore session from localStorage on mount
    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('token');
            const storedUser  = localStorage.getItem('user');
            if (storedToken && storedUser) {
                if (isTokenExpired(storedToken)) {
                    // Token is expired — clear it so the user isn't stuck in a 401 loop
                    console.warn('Stored token is expired, clearing session.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                } else {
                    const userData = JSON.parse(storedUser);
                    setToken(storedToken);
                    setUser(userData);
                    api.setAuthToken(storedToken);
                }
            }
        } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.login(email, password);

            const accessToken = response.access_token || response.token;
            if (!accessToken) {
                toast.error('Server did not return a token');
                return false;
            }

            const userData = {
                id:    response.user_id || response.id,
                name:  response.name || response.username || email.split('@')[0],
                email,
            };

            localStorage.setItem('token', accessToken);
            localStorage.setItem('user',  JSON.stringify(userData));
            setToken(accessToken);
            setUser(userData);
            api.setAuthToken(accessToken);

            toast.success(`Welcome back, ${userData.name}!`);
            return true;
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Login failed');
            return false;
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await api.register(name, email, password);

            const accessToken = response.access_token || response.token;
            if (!accessToken) {
                toast.error('Server did not return a token');
                return false;
            }

            const userData = {
                id:    response.user_id || response.id,
                name,
                email,
            };

            localStorage.setItem('token', accessToken);
            localStorage.setItem('user',  JSON.stringify(userData));
            setToken(accessToken);
            setUser(userData);
            api.setAuthToken(accessToken);

            toast.success('Registration successful!');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Registration failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        api.setAuthToken(null);
        setToken(null);
        setUser(null);
        toast.success('Logged out successfully');
    };

    // Updates display name / email in local state + localStorage only.
    // The backend doesn't have a PATCH /auth/profile endpoint yet,
    // so this is a client-side-only update.
    const updateProfile = (name, email) => {
        try {
            const updatedUser = { ...user, name, email };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            return true;
        } catch {
            return false;
        }
    };

    const isAuthenticated = !!token && !!user;

    const value = {
        user,
        token,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};