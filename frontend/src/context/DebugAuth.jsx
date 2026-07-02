import React from 'react';
import { useAuth } from '../context/AuthContext';

const DebugAuth = () => {
    const { user, isAuthenticated, token, loading } = useAuth();

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 9999,
            fontFamily: 'monospace'
        }}>
            <div><strong>Auth Debug:</strong></div>
            <div>Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
            <div>Loading: {loading ? '⏳ Yes' : '✅ No'}</div>
            <div>User: {user ? user.name : 'None'}</div>
            <div>Token: {token ? '✅ Present' : '❌ Missing'}</div>
            <div>LocalStorage: {localStorage.getItem('token') ? '✅ Has token' : '❌ No token'}</div>
        </div>
    );
};

export default DebugAuth;