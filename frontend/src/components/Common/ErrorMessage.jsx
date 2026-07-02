import React from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiX } from 'react-icons/fi';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onClose, retryFn }) => {
    if (!message) return null;

    return (
        <motion.div 
            className="error-message-container"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <div className="error-message">
                <FiAlertCircle className="error-icon" />
                <div className="error-content">
                    <p className="error-text">{message}</p>
                    {retryFn && (
                        <button onClick={retryFn} className="retry-btn">
                            Try Again
                        </button>
                    )}
                </div>
                {onClose && (
                    <button onClick={onClose} className="error-close">
                        <FiX />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export const ErrorBoundary = ({ children }) => {
    const [hasError, setHasError] = React.useState(false);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        const handleError = (error) => {
            setHasError(true);
            setError(error);
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    if (hasError) {
        return (
            <div className="error-boundary">
                <FiAlertCircle className="error-boundary-icon" />
                <h2>Something went wrong</h2>
                <p>{error?.message || 'An unexpected error occurred'}</p>
                <button onClick={() => window.location.reload()} className="reload-btn">
                    Reload Page
                </button>
            </div>
        );
    }

    return children;
};

export default ErrorMessage;