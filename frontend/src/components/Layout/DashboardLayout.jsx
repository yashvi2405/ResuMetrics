import React from 'react';
import Sidebar from './Sidebar';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
    return (
        <div className="dashboard-layout">
            <Sidebar />
            
            <div className="layout-content-wrapper">
                <main className="layout-main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
