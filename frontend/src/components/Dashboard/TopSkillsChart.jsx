import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const TopSkillsChart = ({ skills }) => {
    const data = {
        labels: skills.map(s => s.skill.charAt(0).toUpperCase() + s.skill.slice(1)),
        datasets: [
            {
                label: 'Resumes containing skill',
                data: skills.map(s => s.count),
                backgroundColor: 'rgba(95, 82, 255, 0.4)',
                borderColor: '#5f52ff', // var(--primary)
                borderWidth: 1.5,
                borderRadius: 4,
                hoverBackgroundColor: '#5f52ff'
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: '#0f1322',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: '#1e293b',
                borderWidth: 1,
                padding: 10
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#1e293b'
                },
                ticks: {
                    color: '#94a3b8',
                    stepSize: 1,
                    font: {
                        family: 'Inter'
                    }
                }
            },
            x: {
                grid: {
                    color: 'transparent'
                },
                ticks: {
                    color: '#94a3b8',
                    font: {
                        family: 'Inter'
                    }
                }
            }
        }
    };

    if (skills.length === 0) {
        return (
            <div className="no-data">
                <p>No skills data available yet</p>
                <p className="hint">Upload resumes to see skill analysis</p>
            </div>
        );
    }

    return (
        <div style={{ height: '320px', width: '100%' }}>
            <Bar data={data} options={options} />
        </div>
    );
};

export default TopSkillsChart;