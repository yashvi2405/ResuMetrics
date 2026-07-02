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

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    // Load user from localStorage on mount
    useEffect(() => {
        const loadUser = () => {
            try {
                const storedToken = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');
                
                console.log('Loading auth state from localStorage:', { 
                    hasToken: !!storedToken, 
                    hasUser: !!storedUser,
                });
                
                if (storedToken && storedUser) {
                    const userData = JSON.parse(storedUser);
                    console.log('Restoring user session:', userData);
                    setToken(storedToken);
                    setUser(userData);
                    api.setAuthToken(storedToken);
                } else {
                    console.log('No existing session found');
                    setToken(null);
                    setUser(null);
                }
            } catch (error) {
                console.error('Error loading user from storage:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        
        loadUser();
    }, []);

    const login = async (email, password) => {
        try {
            console.log('=== LOGIN ATTEMPT ===');
            console.log('Email:', email);
            
            const response = await api.login(email, password);
            console.log('Raw login response:', JSON.stringify(response, null, 2));
            
            // Extract token from response
            let accessToken = null;
            let userId = null;
            let userName = null;
            
            // Try different possible response formats
            if (response.access_token) {
                accessToken = response.access_token;
                console.log('Found access_token in response');
            } else if (response.token) {
                accessToken = response.token;
                console.log('Found token in response');
            }
            
            if (response.user_id) {
                userId = response.user_id;
            } else if (response.id) {
                userId = response.id;
            }
            
            if (response.name) {
                userName = response.name;
            } else if (response.username) {
                userName = response.username;
            }
            
            console.log('Extracted - Token:', !!accessToken, 'UserId:', userId, 'Name:', userName);
            
            if (!accessToken) {
                console.error('NO TOKEN FOUND IN RESPONSE!');
                toast.error('Server did not return a token');
                return false;
            }
            
            // Save to localStorage
            const userData = { 
                id: userId, 
                name: userName || email.split('@')[0], 
                email: email 
            };
            
            console.log('Saving to localStorage...');
            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Verify save worked
            const savedToken = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');
            console.log('Verification - Token saved:', !!savedToken);
            console.log('Verification - User saved:', !!savedUser);
            
            if (!savedToken) {
                console.error('FAILED TO SAVE TO LOCALSTORAGE!');
                toast.error('Failed to save login information');
                return false;
            }
            
            // Update state
            setToken(accessToken);
            setUser(userData);
            api.setAuthToken(accessToken);
            
            console.log('=== LOGIN SUCCESSFUL ===');
            toast.success(`Welcome back, ${userData.name}!`);
            return true;
            
        } catch (error) {
            console.error('=== LOGIN ERROR ===');
            console.error('Error:', error);
            console.error('Response:', error.response?.data);
            toast.error(error.response?.data?.detail || 'Login failed');
            return false;
        }
    };

    const register = async (name, email, password) => {
        try {
            console.log('=== REGISTRATION ATTEMPT ===');
            console.log('Name:', name);
            console.log('Email:', email);
            
            const response = await api.register(name, email, password);
            console.log('Raw register response:', JSON.stringify(response, null, 2));
            
            // Extract token from response
            let accessToken = null;
            let userId = null;
            
            if (response.access_token) {
                accessToken = response.access_token;
                console.log('Found access_token in response');
            } else if (response.token) {
                accessToken = response.token;
                console.log('Found token in response');
            }
            
            if (response.user_id) {
                userId = response.user_id;
            } else if (response.id) {
                userId = response.id;
            }
            
            console.log('Extracted - Token:', !!accessToken, 'UserId:', userId);
            
            if (!accessToken) {
                console.error('NO TOKEN FOUND IN RESPONSE!');
                toast.error('Server did not return a token');
                return false;
            }
            
            // Save to localStorage
            const userData = { 
                id: userId, 
                name: name, 
                email: email 
            };
            
            console.log('Saving to localStorage...');
            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Update state
            setToken(accessToken);
            setUser(userData);
            api.setAuthToken(accessToken);
            
            console.log('=== REGISTRATION SUCCESSFUL ===');
            toast.success('Registration successful!');
            return true;
            
        } catch (error) {
            console.error('=== REGISTRATION ERROR ===');
            console.error('Error:', error);
            console.error('Response:', error.response?.data);
            toast.error(error.response?.data?.detail || 'Registration failed');
            return false;
        }
    };

    const logout = () => {
        console.log('=== LOGOUT ===');
        console.log('Clearing localStorage and state');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        api.setAuthToken(null);
        setToken(null);
        setUser(null);
        toast.success('Logged out successfully');
    };

    const isAuthenticated = !!token && !!user;

    // Log current auth state
    console.log('=== CURRENT AUTH STATE ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('hasUser:', !!user);
    console.log('hasToken:', !!token);
    console.log('loading:', loading);
    if (user) {
        console.log('User:', { id: user.id, name: user.name, email: user.email });
    }
    if (token) {
        console.log('Token exists');
    }

    const updateProfile = (name, email) => {
        try {
            const updatedUser = { ...user, name, email };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            return true;
        } catch (error) {
            console.error('Failed to update profile:', error);
            return false;
        }
    };

    const value = {
        user,
        token,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};