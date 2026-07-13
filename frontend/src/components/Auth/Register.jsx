import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Register = ({ onSwitchToLogin, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState(0);
    const { register } = useAuth();

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name) {
            newErrors.name = 'Full name is required';
        } else if (formData.name.length < 3) {
            newErrors.name = 'Name must be at least 3 characters';
        }
        
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        setPasswordStrength(strength);
        return strength;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'password') {
            checkPasswordStrength(value);
        }
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        try {
            const success = await register(formData.name, formData.email, formData.password);
            if (success && onSuccess) {
                onSuccess();
            }
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrengthText = () => {
        switch(passwordStrength) {
            case 0:
            case 1:
                return { text: 'Weak', color: '#f56565' };
            case 2:
            case 3:
                return { text: 'Medium', color: '#ed8936' };
            case 4:
            case 5:
                return { text: 'Strong', color: '#48bb78' };
            default:
                return { text: '', color: '#e0e0e0' };
        }
    };

    const strengthInfo = getPasswordStrengthText();

    return (
        <motion.div
            className="auth-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
        >
            <div className="auth-header">
                <h2>Create Account</h2>
                <p>Join us and start improving your resume</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="name">
                        <FiUser className="input-icon" />
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className={errors.name ? 'error' : ''}
                        disabled={loading}
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="email">
                        <FiMail className="input-icon" />
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className={errors.email ? 'error' : ''}
                        disabled={loading}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="password">
                        <FiLock className="input-icon" />
                        Password
                    </label>
                    <div className="password-input-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            className={errors.password ? 'error' : ''}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>
                    {formData.password && (
                        <div className="password-strength">
                            <div className="strength-bar">
                                <div 
                                    className="strength-fill"
                                    style={{ 
                                        width: `${(passwordStrength / 5) * 100}%`,
                                        backgroundColor: strengthInfo.color
                                    }}
                                />
                            </div>
                            <span className="strength-text" style={{ color: strengthInfo.color }}>
                                Password strength: {strengthInfo.text}
                            </span>
                        </div>
                    )}
                    {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">
                        <FiLock className="input-icon" />
                        Confirm Password
                    </label>
                    <div className="password-input-wrapper">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            className={errors.confirmPassword ? 'error' : ''}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>
                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>

                <button 
                    type="submit" 
                    className="auth-submit-btn"
                    disabled={loading}
                >
                    {loading ? (
                        <div className="btn-loader">
                            <div className="loader-spinner"></div>
                            <span>Creating account...</span>
                        </div>
                    ) : (
                        'Create Account'
                    )}
                </button>
            </form>

            <div className="auth-footer">
                <p>
                    Already have an account?{' '}
                    <button 
                        type="button" 
                        className="auth-switch-btn"
                        onClick={onSwitchToLogin}
                    >
                        Login
                    </button>
                </p>
            </div>
        </motion.div>
    );
};

export default Register;