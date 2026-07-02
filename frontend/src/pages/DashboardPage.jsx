import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/Layout/DashboardLayout';
import RecentActivities from '../components/Dashboard/RecentActivities';
import ScoreTrendChart from '../components/Dashboard/ScoreTrendChart';
import TopSkillsChart from '../components/Dashboard/TopSkillsChart';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { FiSearch, FiBell, FiFileText, FiBarChart2, FiActivity, FiTarget } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import './DashboardPage.css';

const DashboardPage = () => {
    const { isAuthenticated, loading: authLoading, user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [trends, setTrends] = useState([]);
    const [topSkills, setTopSkills] = useState([]);
    const [loading, setLoading] = useState(true);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.error('Please login to access dashboard');
            navigate('/');
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            loadDashboardData();
        }
    }, [isAuthenticated]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [statsData, activitiesData] = await Promise.all([
                api.getDashboardStats(),
                api.getRecentActivities(10)
            ]);
            
            setStats(statsData);
            setActivities(activitiesData);
            setTrends(statsData.score_trends || []);
            setTopSkills(statsData.top_skills || []);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                navigate('/');
            } else {
                toast.error('Failed to load dashboard data');
            }
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
        return null;
    }

    // Analytics Summary Cards data
    const summaryCards = [
        {
            title: 'Uploaded Resumes',
            value: stats?.total_resumes || 0,
            subtext: 'Total files managed',
            icon: <FiFileText />,
            color: '#5f52ff' // primary neon indigo
        },
        {
            title: 'Average CV Score',
            value: stats?.average_score ? `${Math.round(stats.average_score)}%` : '0%',
            subtext: 'Target score: 85%+',
            icon: <FiBarChart2 />,
            color: '#10b981' // success emerald
        },
        {
            title: 'Analyses Run',
            value: stats?.recent_analyses || 0,
            subtext: 'In the last 30 days',
            icon: <FiActivity />,
            color: '#f59e0b' // warning amber
        },
        {
            title: 'Best Performing',
            value: stats?.best_resume ? `${Math.round(stats.best_resume.score)}%` : '0%',
            subtext: stats?.best_resume?.name 
                ? (stats.best_resume.name.length > 20 ? stats.best_resume.name.slice(0, 18) + '...' : stats.best_resume.name) 
                : 'No files evaluated',
            icon: <FiTarget />,
            color: '#8b5cf6'
        }
    ];

    return (
        <DashboardLayout>
            <div className="dashboard-content animate-slide-up">
                {/* Search & Header Row */}
                <div className="dashboard-topbar">
                    <div className="search-bar-container">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Quick search..."
                            className="search-input"
                            onClick={() => navigate('/resumes')}
                        />
                    </div>
                    <div className="topbar-actions">
                        <button className="icon-notification-btn" onClick={() => toast('No new notifications', { icon: '🔔' })}>
                            <FiBell />
                        </button>
                    </div>
                </div>

                {/* Dashboard Title & Welcome Section */}
                <div className="dashboard-hero">
                    <h1 className="hero-title-main">Dashboard Overview</h1>
                    <p className="hero-desc-main">
                        Welcome back, {user?.name}. Audit resume diagnostics, monitor scoring indicators, and analyze skills frequency.
                    </p>
                </div>

                {/* Metrics Cards Grid */}
                <div className="dashboard-metrics-grid">
                    {summaryCards.map((card, idx) => (
                        <div key={idx} className="metric-summary-card hover-scale">
                            <div className="metric-card-header">
                                <div className="metric-card-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                                    {card.icon}
                                </div>
                                <div className="metric-card-info">
                                    <span className="metric-title">{card.title}</span>
                                    <h2 className="metric-value">{card.value}</h2>
                                    <span className="metric-subtext" title={card.subtext}>{card.subtext}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Double Column Chart Panel */}
                <div className="dashboard-charts-panel">
                    <div className="dashboard-card chart-card-box hover-scale">
                        <h3 className="chart-box-title">Score Progression Trend</h3>
                        <div className="chart-wrapper-inner">
                            <ScoreTrendChart trends={trends} />
                        </div>
                    </div>

                    <div className="dashboard-card chart-card-box hover-scale">
                        <h3 className="chart-box-title">Identified Skills Distribution</h3>
                        <div className="chart-wrapper-inner">
                            <TopSkillsChart skills={topSkills} />
                        </div>
                    </div>
                </div>

                {/* Bottom Recent Activities list */}
                <div className="dashboard-card activities-full-card hover-scale">
                    <RecentActivities activities={activities} />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;