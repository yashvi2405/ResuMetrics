import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBarChart2, FiCpu, FiSliders, FiSearch, FiTrendingUp, FiDownload } from 'react-icons/fi';
import Navbar from '../components/Layout/Navbar';
import AuthModal from '../components/Auth/AuthModal';
import './HomePage.css';

const HomePage = () => {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect authenticated users to dashboard automatically
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const features = [
        { 
            icon: <FiBarChart2 />, 
            title: 'Resume Scoring', 
            description: 'Get comprehensive scores based on industry standards'
        },
        { 
            icon: <FiCpu />, 
            title: 'ATS Compatibility', 
            description: 'Check how well your resume performs with ATS systems'
        },
        { 
            icon: <FiSliders />, 
            title: 'Smart Suggestions', 
            description: 'Receive personalized improvement recommendations'
        },
        { 
            icon: <FiSearch />, 
            title: 'Keyword Analysis', 
            description: 'Identify missing keywords and optimize your resume'
        },
        { 
            icon: <FiTrendingUp />, 
            title: 'Visual Analytics', 
            description: 'View performance with interactive charts'
        },
        { 
            icon: <FiDownload />, 
            title: 'Report Download', 
            description: 'Download detailed analysis reports'
        },
    ];

    const handleFeatureClick = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            setIsAuthModalOpen(true);
        }
    };

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            setIsAuthModalOpen(true);
        }
    };

    // Animation Variants
    const gridContainerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { 
            opacity: 1, 
            y: 0,
            transition: { 
                type: 'spring', 
                stiffness: 100, 
                damping: 15 
            }
        }
    };

    return (
        <div className="homepage">
            <Navbar />
            
            <section className="hero-section">
                <div className="container">
                    <motion.div
                        className="hero-content"
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                        <h1 className="hero-title">
                            AI-Powered Resume Analytics
                        </h1>
                        <p className="hero-subtitle">
                            Get instant insights, ATS compatibility scores, and personalized suggestions
                            to optimize your resume and land your dream job.
                        </p>
                        <button className="cta-button" onClick={handleGetStarted}>
                            {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                        </button>
                    </motion.div>
                </div>
            </section>

            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">Powerful Features</h2>
                    <motion.div 
                        className="features-grid"
                        variants={gridContainerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.1 }}
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="feature-card"
                                variants={cardVariants}
                                whileHover={{ y: -8, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleFeatureClick}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                                <button className="feature-btn">
                                    {isAuthenticated ? 'Go to Dashboard →' : 'Learn More →'}
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
            />
        </div>
    );
};

export default HomePage;