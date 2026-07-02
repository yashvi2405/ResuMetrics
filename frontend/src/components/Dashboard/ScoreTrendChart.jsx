import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ScoreTrendChart = ({ trends }) => {
    const data = {
        labels: trends.map(t => new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: 'Score progression',
                data: trends.map(t => t.score),
                borderColor: '#5f52ff', // var(--primary)
                backgroundColor: 'rgba(95, 82, 255, 0.12)',
                tension: 0.35,
                fill: true,
                pointBackgroundColor: '#5f52ff',
                pointHoverRadius: 7,
                pointRadius: 4,
                borderWidth: 2
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false // Hide since it's only one line
            },
            tooltip: {
                backgroundColor: '#0f1322',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: '#1e293b',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    label: (context) => {
                        return `Score: ${context.raw}% - ${trends[context.dataIndex].resume_name}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: {
                    color: '#1e293b' // var(--border)
                },
                ticks: {
                    color: '#94a3b8', // var(--gray)
                    font: {
                        family: 'Inter'
                    }
                }
            },
            x: {
                grid: {
                    color: 'transparent' // Hide vertical grid lines
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

    if (trends.length === 0) {
        return (
            <div className="no-data">
                <p>No score data available yet</p>
                <p className="hint">Upload and analyze resumes to see trends</p>
            </div>
        );
    }

    return (
        <div style={{ height: '320px', width: '100%' }}>
            <Line data={data} options={options} />
        </div>
    );
};

export default ScoreTrendChart;