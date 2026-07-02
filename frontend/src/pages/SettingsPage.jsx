import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { FiUser, FiSettings, FiSliders, FiCheckSquare, FiAlertCircle, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './SettingsPage.css';

const SettingsPage = () => {
    const { user, isAuthenticated, loading: authLoading, updateProfile } = useAuth();
    const navigate = useNavigate();

    // Profile states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    
    // Preferences states
    const [industry, setIndustry] = useState('software_engineering');
    const [minScore, setMinScore] = useState(70);
    const [defaultCategory, setDefaultCategory] = useState('interview');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    // Password change states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);

    // Active theme state
    const [activeTheme, setActiveTheme] = useState('cyber-stealth');



    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.error('Please login to view settings');
            navigate('/');
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Populate initial settings from storage
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            
            const prefIndustry = localStorage.getItem('pref_industry');
            if (prefIndustry) setIndustry(prefIndustry);
            
            const prefMinScore = localStorage.getItem('pref_min_score');
            if (prefMinScore) setMinScore(Number(prefMinScore));

            const prefDefaultCat = localStorage.getItem('pref_default_category');
            if (prefDefaultCat) setDefaultCategory(prefDefaultCat);

            const prefNotif = localStorage.getItem('pref_notifications');
            if (prefNotif) setNotificationsEnabled(prefNotif === 'true');

            const savedTheme = localStorage.getItem('pref_theme') || 'cyber-stealth';
            setActiveTheme(savedTheme);


        }
    }, [user]);

    const handleSaveProfile = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Name cannot be empty');
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            toast.error('Please enter a valid email');
            return;
        }

        const success = updateProfile(name, email);
        if (success) {
            toast.success('Account profile updated successfully');
        } else {
            toast.error('Failed to save profile details');
        }
    };



    const handleSavePreferences = (e) => {
        e.preventDefault();
        
        localStorage.setItem('pref_industry', industry);
        localStorage.setItem('pref_min_score', minScore.toString());
        localStorage.setItem('pref_default_category', defaultCategory);
        localStorage.setItem('pref_notifications', notificationsEnabled.toString());

        toast.success('ATS Optimizer preferences saved');
        window.dispatchEvent(new Event('storage-tasks-updated'));
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        
        // Validations
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Please fill in all password fields');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters long');
            return;
        }
        
        // Complexity Check: requires at least one letter and one number
        const hasLetter = /[a-zA-Z]/.test(newPassword);
        const hasNumber = /\d/.test(newPassword);
        if (!hasLetter || !hasNumber) {
            toast.error('Password must contain both letters and numbers');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        // Mock success for client-side execution
        toast.success('Password updated successfully!');
        
        // Reset fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleSelectTheme = (themeName) => {
        setActiveTheme(themeName);
        localStorage.setItem('pref_theme', themeName);
        document.documentElement.setAttribute('data-theme', themeName);
        
        const friendlyName = themeName
            .split('-')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
            
        toast.success(`${friendlyName} theme applied!`);
    };

    if (authLoading) return <LoadingSpinner />;
    if (!isAuthenticated) return null;

    return (
        <DashboardLayout>
            <div className="settings-page-content animate-slide-up">
                {/* Header Section */}
                <div className="settings-header-row">
                    <div>
                        <h1 className="settings-title">System Settings</h1>
                        <p className="settings-subtitle">
                            Configure profile details, theme visual interfaces, and custom security protocols.
                        </p>
                    </div>
                </div>

                <div className="settings-main-grid">
                    {/* Left: Settings Forms */}
                    <div className="settings-forms-column">
                        {/* Interactive Theme Selector */}
                        <div className="settings-card">
                            <h3><FiSliders style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--primary)' }} /> Select UI Theme</h3>
                            <p className="settings-hint" style={{ marginBottom: '1.25rem' }}>Choose an interface scheme matching your development environment.</p>
                            
                            <div className="theme-cards-grid">
                                {/* Cyber Stealth Card */}
                                <div 
                                    className={`theme-option-card cyber-stealth ${activeTheme === 'cyber-stealth' ? 'active' : ''}`}
                                    onClick={() => handleSelectTheme('cyber-stealth')}
                                >
                                    <div className="theme-color-preview">
                                        <span className="dot dot-bg"></span>
                                        <span className="dot dot-primary"></span>
                                    </div>
                                    <span className="theme-label">Cyber Stealth</span>
                                    <span className="theme-sub">Default Dark</span>
                                </div>

                                {/* Ivory Minimalist Card */}
                                <div 
                                    className={`theme-option-card ivory-minimalist ${activeTheme === 'ivory-minimalist' ? 'active' : ''}`}
                                    onClick={() => handleSelectTheme('ivory-minimalist')}
                                >
                                    <div className="theme-color-preview">
                                        <span className="dot dot-bg"></span>
                                        <span className="dot dot-primary"></span>
                                    </div>
                                    <span className="theme-label">Ivory Minimalist</span>
                                    <span className="theme-sub">Light Mode</span>
                                </div>

                                {/* VS Code Dark Card */}
                                <div 
                                    className={`theme-option-card vscode-dark ${activeTheme === 'vscode-dark' ? 'active' : ''}`}
                                    onClick={() => handleSelectTheme('vscode-dark')}
                                >
                                    <div className="theme-color-preview">
                                        <span className="dot dot-bg"></span>
                                        <span className="dot dot-primary"></span>
                                    </div>
                                    <span className="theme-label">VS Code Dark</span>
                                    <span className="theme-sub">Developer Grey</span>
                                </div>
                            </div>
                        </div>

                        {/* Profile Settings */}
                        <div className="settings-card">
                            <h3><FiUser style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--primary)' }} /> Profile Account</h3>
                            <form onSubmit={handleSaveProfile} className="settings-form">
                                <div className="settings-form-row">
                                    <div className="settings-form-group">
                                        <label>Full Name</label>
                                        <input 
                                            type="text" 
                                            className="settings-input" 
                                            value={name} 
                                            onChange={(e) => setName(e.target.value)} 
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div className="settings-form-group">
                                        <label>Email Address</label>
                                        <input 
                                            type="email" 
                                            className="settings-input" 
                                            value={email} 
                                            onChange={(e) => setEmail(e.target.value)} 
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-settings-save">Save Profile Details</button>
                            </form>
                        </div>



                        {/* Password Modification Section */}
                        <div className="settings-card">
                            <h3>
                                <FiLock style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--primary)' }} /> 
                                Change Account Password
                            </h3>
                            <form onSubmit={handleChangePassword} className="settings-form">
                                <div className="password-toggle-header">
                                    <span className="settings-hint">Must contain at least 6 characters including numbers and letters.</span>
                                    <button 
                                        type="button" 
                                        className="btn-text-action" 
                                        onClick={() => setShowPasswords(prev => !prev)}
                                    >
                                        {showPasswords ? <><FiEyeOff /> Hide</> : <><FiEye /> Show</>}
                                    </button>
                                </div>
                                
                                <div className="settings-form-group">
                                    <label>Current Password</label>
                                    <input 
                                        type={showPasswords ? "text" : "password"} 
                                        className="settings-input"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="settings-form-row">
                                    <div className="settings-form-group">
                                        <label>New Password</label>
                                        <input 
                                            type={showPasswords ? "text" : "password"} 
                                            className="settings-input"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="settings-form-group">
                                        <label>Confirm New Password</label>
                                        <input 
                                            type={showPasswords ? "text" : "password"} 
                                            className="settings-input"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                
                                <button type="submit" className="btn-settings-save btn-security">Update Password</button>
                            </form>
                        </div>

                        {/* ATS Scoring Preferences */}
                        <div className="settings-card">
                            <h3><FiSliders style={{ marginRight: '8px', verticalAlign: 'middle', color: 'var(--primary)' }} /> ATS & Industry Benchmarks</h3>
                            <form onSubmit={handleSavePreferences} className="settings-form">
                                <div className="settings-form-group">
                                    <label>Target Job Category</label>
                                    <select 
                                        className="settings-input settings-select"
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                    >
                                        <option value="software_engineering">Software Engineering (SDE)</option>
                                        <option value="data_science">Data Science & Analytics</option>
                                        <option value="product_management">Product Management (Tech)</option>
                                    </select>
                                    <span className="settings-hint">Influences key terms and weights in optimizer chat scans.</span>
                                </div>

                                <div className="settings-form-group">
                                    <div className="range-labels">
                                        <label>Target Passing Score</label>
                                        <span className="range-value">{minScore}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="50" 
                                        max="90" 
                                        step="5"
                                        className="settings-range-slider"
                                        value={minScore}
                                        onChange={(e) => setMinScore(Number(e.target.value))}
                                    />
                                    <span className="settings-hint">Lowers or raises caution highlights in score reports.</span>
                                </div>

                                <div className="settings-form-row">
                                    <div className="settings-form-group">
                                        <label>Default Calendar Task</label>
                                        <select 
                                            className="settings-input settings-select"
                                            value={defaultCategory}
                                            onChange={(e) => setDefaultCategory(e.target.value)}
                                        >
                                            <option value="interview">Interview Milestone</option>
                                            <option value="application">Job Application</option>
                                            <option value="review">CV Review Session</option>
                                        </select>
                                    </div>

                                    <div className="settings-form-group toggle-group-container">
                                        <label>Enable Notifications</label>
                                        <label className="toggle-switch">
                                            <input 
                                                type="checkbox" 
                                                checked={notificationsEnabled}
                                                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                                            />
                                            <span className="toggle-slider round"></span>
                                        </label>
                                    </div>
                                </div>

                                <button type="submit" className="btn-settings-save">Save Benchmarks & Preferences</button>
                            </form>
                        </div>
                    </div>

                    {/* Right: Quick Panel info */}
                    <div className="settings-side-column">
                        <div className="settings-card sidebar-detail-card">
                            <div className="detail-avatar-large">
                                <FiUser />
                            </div>
                            <h4 className="detail-name">{user?.name || 'Guest User'}</h4>
                            <p className="detail-email">{user?.email || 'yamuchhala@gmail.com'}</p>
                            
                            <div className="settings-summary-list">
                                <div className="summary-row-item">
                                    <span className="summary-label">Target Industry:</span>
                                    <span className="summary-val">{industry.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                                </div>
                                <div className="summary-row-item">
                                    <span className="summary-label">Target ATS Threshold:</span>
                                    <span className="summary-val">{minScore}%</span>
                                </div>
                                <div className="summary-row-item">
                                    <span className="summary-label">Active Theme:</span>
                                    <span className="summary-val text-primary" style={{ textTransform: 'capitalize' }}>
                                        {activeTheme.replace('-', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="settings-card info-notice-card">
                            <FiAlertCircle className="notice-icon" />
                            <div className="notice-content">
                                <h5>System Sync</h5>
                                <p>Saving setting updates triggers an immediate reactive sync across all tabs in your browser.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage;
