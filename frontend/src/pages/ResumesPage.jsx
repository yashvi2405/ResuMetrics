import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/Layout/DashboardLayout';
import UploadSection from '../components/Dashboard/UploadSection';
import ResumesList from '../components/Dashboard/ResumesList';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { FiSearch, FiBell, FiPlus } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import './ResumesPage.css';

const ResumesPage = () => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.error('Please login to manage resumes');
            navigate('/');
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchStats();
        }
    }, [refreshKey, isAuthenticated]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const statsData = await api.getDashboardStats();
            setStats(statsData);
        } catch (err) {
            console.error('Failed to load stats for resumes page', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccess = () => {
        setRefreshKey(prev => prev + 1);
        toast.success('Resume uploaded successfully');
        // Dispatch global sync event
        window.dispatchEvent(new Event('storage-tasks-updated'));
    };

    if (authLoading || loading) return <LoadingSpinner />;
    if (!isAuthenticated) return null;

    return (
        <DashboardLayout>
            <div className="resumes-page-content animate-slide-up">
                {/* Top Search bar header */}
                <div className="resumes-topbar">
                    <div className="resumes-search-container">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search resumes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="resumes-topbar-actions">
                        <button className="icon-notification-btn" onClick={() => toast('No new notifications', { icon: '🔔' })}>
                            <FiBell />
                        </button>
                    </div>
                </div>

                {/* Page Title */}
                <div className="resumes-page-header">
                    <h1 className="resumes-title">Resume Management</h1>
                    <p className="resumes-subtitle">
                        Upload new CV profiles, run AI scores, and audit file configurations.
                    </p>
                </div>

                {/* Primary Content Split Grid */}
                <div className="resumes-split-grid">
                    {/* Left/Main Column: Uploads & Listings */}
                    <div className="resumes-grid-left">
                        {/* File Upload Section */}
                        <div className="resumes-card upload-section-card">
                            <UploadSection onUploadSuccess={handleUploadSuccess} />
                        </div>

                        {/* File Table Section */}
                        <div className="resumes-card list-section-card">
                            <ResumesList key={refreshKey} searchQuery={searchQuery} />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ResumesPage;
