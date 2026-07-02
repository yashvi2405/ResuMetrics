// API Configuration
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    TIMEOUT: 30000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
};

// File Upload Configuration
export const FILE_CONFIG = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FORMATS: ['.pdf', '.docx'],
    ALLOWED_MIME_TYPES: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
};

// Score Categories
export const SCORE_CATEGORIES = {
    EXCELLENT: { min: 80, label: 'Excellent', color: '#48bb78' },
    GOOD: { min: 70, label: 'Good', color: '#68d391' },
    AVERAGE: { min: 60, label: 'Average', color: '#ed8936' },
    NEEDS_IMPROVEMENT: { min: 50, label: 'Needs Improvement', color: '#f56565' },
    POOR: { min: 0, label: 'Poor', color: '#e53e3e' },
};

// Messages
export const MESSAGES = {
    CONNECTION_ERROR: 'Unable to connect to server. Please check if backend is running.',
    UPLOAD_SUCCESS: 'Resume uploaded successfully!',
    UPLOAD_ERROR: 'Failed to upload resume. Please try again.',
    ANALYSIS_SUCCESS: 'Resume analysis completed!',
    ANALYSIS_ERROR: 'Failed to analyze resume. Please try again.',
    LOGIN_SUCCESS: 'Login successful!',
    LOGIN_ERROR: 'Invalid email or password.',
    REGISTER_SUCCESS: 'Registration successful!',
    REGISTER_ERROR: 'Registration failed. Please try again.',
};

// Helper Functions
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const getScoreColor = (score) => {
    if (score >= 80) return SCORE_CATEGORIES.EXCELLENT.color;
    if (score >= 70) return SCORE_CATEGORIES.GOOD.color;
    if (score >= 60) return SCORE_CATEGORIES.AVERAGE.color;
    if (score >= 50) return SCORE_CATEGORIES.NEEDS_IMPROVEMENT.color;
    return SCORE_CATEGORIES.POOR.color;
};

export const getScoreLabel = (score) => {
    if (score >= 80) return SCORE_CATEGORIES.EXCELLENT.label;
    if (score >= 70) return SCORE_CATEGORIES.GOOD.label;
    if (score >= 60) return SCORE_CATEGORIES.AVERAGE.label;
    if (score >= 50) return SCORE_CATEGORIES.NEEDS_IMPROVEMENT.label;
    return SCORE_CATEGORIES.POOR.label;
};

export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePassword = (password) => {
    return password.length >= 6;
};

export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};