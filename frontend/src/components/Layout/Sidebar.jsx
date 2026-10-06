import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FiHome, FiCalendar, FiMessageSquare, FiSettings, FiLogOut,
    FiFileText, FiCode, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ onCollapseChange }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(() => {
        return localStorage.getItem('sidebar_collapsed') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', String(collapsed));
        onCollapseChange?.(collapsed);
    }, [collapsed]);

    const menuItems = [
        { path: '/dashboard', label: 'Home',       icon: <FiHome /> },
        { path: '/resumes',   label: 'My Resumes', icon: <FiFileText /> },
        { path: '/prep',      label: 'Prep Arena', icon: <FiCode /> },
        { path: '/schedule',  label: 'Schedule',   icon: <FiCalendar /> },
        { path: '/chats',     label: 'AI Buddy',   icon: <FiMessageSquare /> },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>

            {/* ── Top: Brand + Collapse toggle ── */}
            <div className="sidebar-top">
                {!collapsed && (
                    <div className="sidebar-brand" onClick={() => navigate('/dashboard')}>
                        <div className="brand-icon-wrap">
                            <FiFileText />
                        </div>
                        <span className="brand-text">ResuMetrics</span>
                    </div>
                )}
                {collapsed && (
                    <div className="sidebar-brand" onClick={() => navigate('/dashboard')} style={{ justifyContent: 'center', flex: 1 }}>
                        <div className="brand-icon-wrap"><FiFileText /></div>
                    </div>
                )}
                <button
                    className="sidebar-toggle-btn"
                    onClick={() => setCollapsed(c => !c)}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
                </button>
            </div>

            {/* ── Section Label ── */}
            {!collapsed && <div className="sidebar-section-label">Navigation</div>}

            {/* ── Main Navigation ── */}
            <nav className="sidebar-menu">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path
                        || (item.path === '/dashboard' && location.pathname.startsWith('/analysis'));
                    return (
                        <button
                            key={item.path}
                            className={`sidebar-item ${isActive ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                            title={collapsed ? item.label : ''}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            {!collapsed && <span className="sidebar-label">{item.label}</span>}
                            {isActive && !collapsed && <div className="sidebar-indicator" />}
                        </button>
                    );
                })}
            </nav>

            {/* ── Footer ── */}
            <div className="sidebar-footer">
                {/* User profile */}
                <div
                    className="sidebar-profile-widget"
                    onClick={() => navigate('/settings')}
                    title={collapsed ? (user?.name || 'Profile') : ''}
                >
                    <div className="profile-mini-avatar">
                        {getInitials(user?.name)}
                    </div>
                    {!collapsed && (
                        <div className="profile-mini-info">
                            <span className="profile-mini-name">{user?.name || 'User'}</span>
                            <span className="profile-mini-email">{user?.email || ''}</span>
                        </div>
                    )}
                </div>

                <button
                    className="sidebar-item"
                    onClick={() => navigate('/settings')}
                    title={collapsed ? 'Settings' : ''}
                >
                    <span className="sidebar-icon"><FiSettings /></span>
                    {!collapsed && <span className="sidebar-label">Settings</span>}
                </button>

                <button
                    className="sidebar-item logout-item"
                    onClick={handleLogout}
                    title={collapsed ? 'Log Out' : ''}
                >
                    <span className="sidebar-icon"><FiLogOut /></span>
                    {!collapsed && <span className="sidebar-label">Log Out</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
