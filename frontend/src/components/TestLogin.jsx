import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const TestLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [debug, setDebug] = useState(null);
    const { login, isAuthenticated, user } = useAuth();

    const testDirectAPI = async () => {
        setLoading(true);
        try {
            const response = await api.login(email, password);
            setDebug({ success: true, data: response });
            console.log('Direct API response:', response);
        } catch (error) {
            setDebug({ success: false, error: error.response?.data || error.message });
            console.error('Direct API error:', error);
        } finally {
            setLoading(false);
        }
    };

    const testLogin = async () => {
        setLoading(true);
        try {
            const result = await login(email, password);
            setDebug({ success: result, message: result ? 'Login successful' : 'Login failed' });
        } finally {
            setLoading(false);
        }
    };

    const checkStorage = () => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        setDebug({
            storage: {
                hasToken: !!token,
                tokenValue: token ? token.substring(0, 50) + '...' : null,
                hasUser: !!user,
                userValue: user
            }
        });
    };

    return (
        <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px', background: 'white', borderRadius: '10px' }}>
            <h2>Test Login Component</h2>
            <p>Current Auth Status: {isAuthenticated ? '✅ Logged In' : '❌ Not Logged In'}</p>
            {user && <p>User: {user.name} ({user.email})</p>}
            
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                />
                <button onClick={testLogin} disabled={loading} style={{ marginRight: '10px', padding: '10px' }}>
                    Test Login via Auth Context
                </button>
                <button onClick={testDirectAPI} disabled={loading} style={{ marginRight: '10px', padding: '10px' }}>
                    Test Direct API
                </button>
                <button onClick={checkStorage} style={{ padding: '10px' }}>
                    Check Storage
                </button>
            </div>
            
            {debug && (
                <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
                    <pre>{JSON.stringify(debug, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default TestLogin;