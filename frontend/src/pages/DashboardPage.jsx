import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/Layout/DashboardLayout';
import RecentActivities from '../components/Dashboard/RecentActivities';
import ScoreTrendChart from '../components/Dashboard/ScoreTrendChart';
import TopSkillsChart from '../components/Dashboard/TopSkillsChart';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { FiSearch, FiBell, FiFileText, FiBarChart2, FiActivity, FiAward } from 'react-icons/fi';
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

    // Friendly first name
    const firstName = user?.name?.split(' ')[0] || 'there';

    // Greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const summaryCards = [
        {
            title: 'Your CVs',
            value: stats?.total_resumes || 0,
            subtext: stats?.total_resumes === 1 ? '1 resume uploaded' : `${stats?.total_resumes || 0} resumes in your library`,
            icon: <FiFileText />,
            color: '#D97706',
            bg: 'rgba(217, 119, 6, 0.12)',
        },
        {
            title: 'Average Score',
            value: stats?.average_score ? `${Math.round(stats.average_score)}%` : '—',
            subtext: stats?.average_score >= 85 ? 'Above target — great job!' : 'Target: 85% or higher',
            icon: <FiBarChart2 />,
            color: '#D97706',
            bg: 'rgba(217, 119, 6, 0.12)',
        },
        {
            title: 'Analyses Done',
            value: stats?.recent_analyses || 0,
            subtext: 'In the last 30 days',
            icon: <FiActivity />,
            color: '#D97706',
            bg: 'rgba(217, 119, 6, 0.12)',
        },
        {
            title: 'Top Resume',
            value: stats?.best_resume ? `${Math.round(stats.best_resume.score)}%` : '—',
            subtext: stats?.best_resume?.name
                ? (stats.best_resume.name.length > 22 ? stats.best_resume.name.slice(0, 20) + '…' : stats.best_resume.name)
                : 'Upload a resume to get scored',
            icon: <FiAward />,
            color: '#D97706',
            bg: 'rgba(217, 119, 6, 0.12)',
        }
    ];

    return (
        <DashboardLayout>
            <div className="dashboard-content animate-slide-up">

                {/* Top bar */}
                <div className="dashboard-topbar">
                    <div className="search-bar-container">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search resumes, skills, activities…"
                            className="search-input"
                            onClick={() => navigate('/resumes')}
                            readOnly
                        />
                    </div>
                    <div className="topbar-actions">
                        <button
                            className="icon-notification-btn"
                            onClick={() => toast('You\'re all caught up!', { icon: '🔔' })}
                        >
                            <FiBell />
                        </button>
                    </div>
                </div>

                {/* Hero welcome */}
                <div className="dashboard-hero">
                    <div className="hero-greeting">{greeting}, {firstName}</div>
                    <h1 className="hero-title-main">Here's how your resumes are doing</h1>
                    <p className="hero-desc-main">
                        Track your scores, spot skill gaps, and see what you've been up to — all in one place.
                    </p>
                </div>

                {/* Metric cards */}
                <div className="dashboard-metrics-grid">
                    {summaryCards.map((card, idx) => (
                        <div key={idx} className="metric-summary-card hover-scale">
                            <div className="metric-card-icon-wrap" style={{ background: card.bg, color: card.color }}>
                                {card.icon}
                            </div>
                            <div className="metric-card-body">
                                <span className="metric-title">{card.title}</span>
                                <h2 className="metric-value" style={{ color: card.color }}>{card.value}</h2>
                                <span className="metric-subtext">{card.subtext}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div className="dashboard-charts-panel">
                    <div className="dashboard-card chart-card-box hover-scale">
                        <h3 className="chart-box-title">Score Progression</h3>
                        <div className="chart-wrapper-inner">
                            <ScoreTrendChart trends={trends} />
                        </div>
                    </div>

                    <div className="dashboard-card chart-card-box hover-scale">
                        <h3 className="chart-box-title">Top Skills</h3>
                        <div className="chart-wrapper-inner">
                            <TopSkillsChart skills={topSkills} />
                        </div>
                    </div>
                </div>

                {/* Recent activity */}
                <div className="dashboard-card activities-full-card hover-scale">
                    <RecentActivities activities={activities} />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;