import React, { useState } from 'react';
import api from '../services/api';

const ApiTest = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const testHealthEndpoint = async () => {
        setLoading(true);
        try {
            // Test direct fetch first
            const directResponse = await fetch('http://localhost:8000/health');
            const directData = await directResponse.json();
            
            // Then test via API service
            const apiResult = await api.testConnection();
            
            setResult({
                success: true,
                directFetch: directData,
                apiService: apiResult,
                apiBaseUrl: api.api.defaults.baseURL
            });
        } catch (error) {
            setResult({
                success: false,
                error: error.message,
                apiBaseUrl: api.api.defaults.baseURL
            });
        } finally {
            setLoading(false);
        }
    };

    const testRegisterEndpoint = async () => {
        setLoading(true);
        try {
            const testData = {
                name: 'Test User',
                email: `test${Date.now()}@example.com`,
                password: 'test123456'
            };
            
            const response = await api.register(testData.name, testData.email, testData.password);
            setResult({
                success: true,
                endpoint: '/auth/register',
                data: response
            });
        } catch (error) {
            setResult({
                success: false,
                endpoint: '/auth/register',
                error: error.message,
                response: error.response?.data
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>API Connection Test</h1>
            
            <div style={{ marginBottom: '20px' }}>
                <h3>Configuration:</h3>
                <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
                    API Base URL: {api.api.defaults.baseURL}
                </pre>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                    onClick={testHealthEndpoint} 
                    disabled={loading}
                    style={{ padding: '10px 20px', cursor: 'pointer' }}
                >
                    Test Health Endpoint
                </button>
                <button 
                    onClick={testRegisterEndpoint} 
                    disabled={loading}
                    style={{ padding: '10px 20px', cursor: 'pointer' }}
                >
                    Test Register Endpoint
                </button>
            </div>

            {loading && <div>Testing connection...</div>}

            {result && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    background: result.success ? '#e8f5e9' : '#ffebee',
                    borderRadius: '5px',
                    border: `1px solid ${result.success ? '#48bb78' : '#f56565'}`
                }}>
                    <h3 style={{ color: result.success ? '#2e7d32' : '#c62828' }}>
                        {result.success ? '✅ Connection Successful!' : '❌ Connection Failed'}
                    </h3>
                    <pre style={{ 
                        background: 'white', 
                        padding: '10px', 
                        borderRadius: '5px',
                        overflow: 'auto',
                        fontSize: '12px'
                    }}>
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}

            <div style={{ marginTop: '20px', padding: '15px', background: '#fff3e0', borderRadius: '5px' }}>
                <h4>Troubleshooting Tips:</h4>
                <ul>
                    <li>Check that backend is running on port 8000</li>
                    <li>Verify .env file is in the correct directory (frontend-vite/.env)</li>
                    <li>Restart dev server after changing .env: <code>npm run dev</code></li>
                    <li>Check browser console for CORS errors (F12)</li>
                    <li>Try accessing <code>http://localhost:8000/health</code> directly in browser</li>
                </ul>
            </div>
        </div>
    );
};

export default ApiTest;