import React from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiTrendingUp, FiClock, FiAward } from 'react-icons/fi';
import './StatsCards.css';

const StatsCards = ({ stats }) => {
    const cards = [
        { 
            title: 'Total Resumes', 
            value: stats.total_resumes, 
            icon: <FiFileText />, 
            color: '#667eea',
            delay: 0.1
        },
        { 
            title: 'Average Score', 
            value: `${stats.average_score}%`, 
            icon: <FiTrendingUp />, 
            color: '#48bb78',
            delay: 0.2
        },
        { 
            title: 'Recent Analyses', 
            value: stats.recent_analyses, 
            icon: <FiClock />, 
            color: '#ed8936',
            delay: 0.3
        },
        { 
            title: 'Best Score', 
            value: stats.best_resume ? `${stats.best_resume.score}%` : '0%', 
            icon: <FiAward />, 
            color: '#9f7aea',
            delay: 0.4
        }
    ];

    return (
        <div className="stats-cards">
            {cards.map((card, index) => (
                <motion.div
                    key={card.title}
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: card.delay }}
                    style={{ borderBottomColor: card.color }}
                >
                    <div className="stat-icon" style={{ color: card.color }}>
                        {card.icon}
                    </div>
                    <div className="stat-info">
                        <h3>{card.title}</h3>
                        <div className="stat-value">{card.value}</div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default StatsCards;