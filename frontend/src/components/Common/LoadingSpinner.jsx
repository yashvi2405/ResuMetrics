import React from 'react';
import { ThreeDots } from 'react-loader-spinner';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
    return (
        <div className="loading-spinner">
            <ThreeDots
                height="80"
                width="80"
                radius="9"
                color="#667eea"
                ariaLabel="three-dots-loading"
                visible={true}
            />
        </div>
    );
};

export default LoadingSpinner;