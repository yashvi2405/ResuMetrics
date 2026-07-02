import React from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiBarChart2, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './RecentActivities.css';

const RecentActivities = ({ activities, onDelete }) => {
    const navigate = useNavigate();

    const getActivityIcon = (type) => {
        switch(type) {
            case 'upload':
                return <FiUpload className="activity-icon upload" />;
            case 'analysis':
                return <FiBarChart2 className="activity-icon analysis" />;
            default:
                return null;
        }
    };

    const getActivityColor = (type) => {
        return type === 'upload' ? '#48bb78' : '#667eea';
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        return `${days} day${days > 1 ? 's' : ''} ago`;
    };

    if (activities.length === 0) {
        return (
            <div className="recent-activities">
                <h3>Recent Activities</h3>
                <div className="no-activities">
                    <p>No recent activities</p>
                    <p className="hint">Upload a resume to get started</p>
                </div>
            </div>
        );
    }

    return (
        <div className="recent-activities">
            <h3>Recent Activities</h3>
            <div className="activities-list">
                {activities.map((activity, index) => (
                    <motion.div
                        key={index}
                        className="activity-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div className="activity-icon-wrapper" style={{ color: getActivityColor(activity.type) }}>
                            {getActivityIcon(activity.type)}
                        </div>
                        <div className="activity-details">
                            <p className="activity-message">{activity.message}</p>
                            <span className="activity-time">{formatTime(activity.timestamp)}</span>
                        </div>
                        {activity.type === 'analysis' && (
                            <button 
                                className="view-analysis-btn"
                                onClick={() => navigate(`/analysis/${activity.resume_id}`)}
                            >
                                View Analysis
                            </button>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default RecentActivities;