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
                label: 'Score',
                data: trends.map(t => t.score),
                borderColor: '#D97706',
                backgroundColor: (ctx) => {
                    const chart = ctx.chart;
                    const { ctx: canvasCtx, chartArea } = chart;
                    if (!chartArea) return 'rgba(217, 119, 6, 0.10)';
                    const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    gradient.addColorStop(0, 'rgba(217, 119, 6, 0.20)');
                    gradient.addColorStop(1, 'rgba(217, 119, 6, 0.0)');
                    return gradient;
                },
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#1C1814',
                pointBorderColor: '#D97706',
                pointBorderWidth: 2,
                pointHoverRadius: 7,
                pointRadius: 5,
                borderWidth: 2.5
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1C1814',
                titleColor: '#F0E6D3',
                bodyColor: '#8C7B69',
                borderColor: '#2A231A',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 10,
                callbacks: {
                    label: (context) => `Score: ${context.raw}%`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                min: 0,
                max: 100,
                grid: { color: 'rgba(42, 35, 26, 0.8)' },
                ticks: {
                    color: '#8C7B69',
                    font: { family: 'Inter', size: 11 },
                    callback: v => `${v}%`
                },
                border: { display: false }
            },
            x: {
                grid: { color: 'transparent' },
                ticks: { color: '#8C7B69', font: { family: 'Inter', size: 11 } },
                border: { display: false }
            }
        }
    };

    if (trends.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '280px', color: '#94a3b8', gap: '0.5rem' }}>
                <span style={{ fontSize: '2rem' }}>📈</span>
                <p style={{ fontWeight: 600, color: '#64748b' }}>No score history yet</p>
                <p style={{ fontSize: '0.8rem' }}>Upload and analyze resumes to see your progress</p>
            </div>
        );
    }

    return (
        <div style={{ height: '280px', width: '100%' }}>
            <Line data={data} options={options} />
        </div>
    );
};

export default ScoreTrendChart;