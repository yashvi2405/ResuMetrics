import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(() => {
        return localStorage.getItem('sidebar_collapsed') === 'true';
    });

    return (
        <div className={`dashboard-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
            <Sidebar onCollapseChange={setCollapsed} />

            <div className="layout-content-wrapper">
                <main className="layout-main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
