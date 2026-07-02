import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './SuggestionsSection.css';

const SuggestionsSection = ({ suggestions }) => {
    const suggestionsList = suggestions ? suggestions.split('; ') : [];

    if (suggestionsList.length === 0) {
        return null;
    }

    return (
        <div className="suggestions-section">
            <h3>Improvement Suggestions</h3>
            <div className="suggestions-list">
                {suggestionsList.map((suggestion, index) => (
                    <motion.div
                        key={index}
                        className="suggestion-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <FiCheckCircle className="suggestion-icon" />
                        <span>{suggestion}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default SuggestionsSection;