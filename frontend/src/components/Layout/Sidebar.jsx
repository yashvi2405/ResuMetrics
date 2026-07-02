import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiCalendar, FiMessageSquare, FiSettings, FiLogOut, FiFileText, FiUser, FiCode } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { path: '/dashboard', label: 'Home', icon: <FiHome /> },
        { path: '/resumes', label: 'Resumes', icon: <FiFileText /> },
        { path: '/prep', label: 'Coding Prep', icon: <FiCode /> },
        { path: '/schedule', label: 'Schedule', icon: <FiCalendar /> },
        { path: '/chats', label: 'AI Assistant', icon: <FiMessageSquare /> },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="sidebar">
            <div className="sidebar-brand" onClick={() => navigate('/dashboard')}>
                <FiFileText className="brand-icon" />
                <span className="brand-text">ResuMetrics</span>
            </div>

            <div className="sidebar-menu">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname.startsWith('/analysis'));
                    return (
                        <button
                            key={item.path}
                            className={`sidebar-item ${isActive ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            <span className="sidebar-label">{item.label}</span>
                            {isActive && <div className="sidebar-indicator" />}
                        </button>
                    );
                })}
            </div>

            <div className="sidebar-footer">
                {/* User Mini Profile Widget */}
                <div className="sidebar-profile-widget" onClick={() => navigate('/settings')} title="View profile settings">
                    <div className="profile-mini-avatar">
                        <FiUser />
                    </div>
                    <div className="profile-mini-info">
                        <span className="profile-mini-name">{user?.name || 'Yashvi Abhay'}</span>
                        <span className="profile-mini-email">{user?.email || 'yamuchhala@gmail.com'}</span>
                    </div>
                </div>

                <button className="sidebar-item" onClick={() => navigate('/settings')}>
                    <span className="sidebar-icon"><FiSettings /></span>
                    <span className="sidebar-label">Settings</span>
                </button>
                <button className="sidebar-item logout-item" onClick={handleLogout}>
                    <span className="sidebar-icon"><FiLogOut /></span>
                    <span className="sidebar-label">Log Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
