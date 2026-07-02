import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiUser, FiHome, FiBarChart2, FiMenu, FiX, FiFileText } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const response = await fetch('http://localhost:8000/health');
                setIsConnected(response.ok);
            } catch {
                setIsConnected(false);
            }
        };
        
        checkConnection();
        const interval = setInterval(checkConnection, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    const handleNavigation = (path) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-brand" onClick={() => setIsMenuOpen(false)}>
                    <FiFileText className="brand-icon" />
                    <span className="brand-text">ResuMetrics</span>
                </Link>
                
                <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <FiX /> : <FiMenu />}
                </button>
                
                <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                    {isAuthenticated ? (
                        <>
                            <button onClick={() => handleNavigation('/dashboard')} className="nav-link">
                                <FiBarChart2 className="nav-icon" />
                                Dashboard
                            </button>
                            <div className="nav-user">
                                <FiUser className="nav-icon" />
                                <span>Welcome, {user?.name}</span>
                            </div>
                            <button onClick={handleLogout} className="nav-logout-btn">
                                <FiLogOut />
                                Logout
                            </button>
                        </>
                    ) : (
                        <button onClick={() => handleNavigation('/')} className="nav-link">
                            <FiHome className="nav-icon" />
                            Home
                        </button>
                    )}
                    
                    <div className="connection-status">
                        <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
                        <span>{isConnected ? 'Online' : 'Offline'}</span>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;