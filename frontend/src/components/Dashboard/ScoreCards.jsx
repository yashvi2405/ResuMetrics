import React from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2, FiCpu, FiTarget, FiKey } from 'react-icons/fi';
import './ScoreCards.css';

const ScoreCards = ({ scores }) => {
    const cards = [
        { 
            title: 'Overall Score', 
            value: scores.resume_score, 
            icon: <FiBarChart2 />, 
            color: '#8072e6', // var(--primary)
            description: 'Overall resume quality score'
        },
        { 
            title: 'ATS Compatibility', 
            value: scores.ats_compatibility_score, 
            icon: <FiCpu />, 
            color: '#10b981', // var(--success)
            description: 'How well ATS systems can parse your resume'
        },
        { 
            title: 'Skill Match', 
            value: scores.skill_match_percentage, 
            icon: <FiTarget />, 
            color: '#f59e0b', // var(--warning)
            description: 'Relevance of skills to job requirements'
        },
        { 
            title: 'Keyword Relevance', 
            value: scores.keyword_relevance_score, 
            icon: <FiKey />, 
            color: '#8b5cf6', 
            description: 'Industry keyword optimization'
        }
    ];

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981'; // success
        if (score >= 60) return '#f59e0b'; // warning
        return '#ef4444'; // danger
    };

    const getScoreLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 70) return 'Good';
        if (score >= 60) return 'Average';
        if (score >= 50) return 'Needs Work';
        return 'Poor';
    };

    return (
        <div className="score-cards-container">
            {cards.map((card, index) => (
                <motion.div
                    key={card.title}
                    className="score-card animate-fade-in"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={{ y: -4 }}
                >
                    <div className="score-card-header">
                        <div className="score-card-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                            {card.icon}
                        </div>
                        <div className="score-card-title">
                            <h3>{card.title}</h3>
                            <p>{card.description}</p>
                        </div>
                    </div>
                    
                    <div className="score-value-section">
                        <div className="score-value" style={{ color: getScoreColor(card.value) }}>
                            {Math.round(card.value)}
                            <span className="score-percent">/100</span>
                        </div>
                        <div className="score-label" style={{ backgroundColor: getScoreColor(card.value) }}>
                            {getScoreLabel(card.value)}
                        </div>
                    </div>
                    
                    <div className="score-progress">
                        <div 
                            className="score-progress-bar"
                            style={{ 
                                width: `${card.value}%`,
                                backgroundColor: card.color
                            }}
                        />
                    </div>
                    
                    <div className="score-stats">
                        <div className="stat-item">
                            <span className="stat-label">Percentile</span>
                            <span className="stat-value">{Math.floor(card.value * 0.85)}%</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Rank</span>
                            <span className="stat-value">
                                {card.value >= 80 ? 'Top 10%' : 
                                 card.value >= 60 ? 'Top 30%' : 
                                 card.value >= 50 ? 'Top 50%' : 'Below Average'}
                            </span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default ScoreCards;