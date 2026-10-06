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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TopSkillsChart = ({ skills }) => {
    // Amber palette — slightly varying opacity per bar for depth
    const barColors = skills.map((_, i) => {
        const alpha = 0.9 - i * 0.04;
        return `rgba(217, 119, 6, ${Math.max(alpha, 0.45)})`;
    });
    const hoverColors = skills.map(() => '#FBBF24');

    const data = {
        labels: skills.map(s => s.skill.charAt(0).toUpperCase() + s.skill.slice(1)),
        datasets: [
            {
                label: 'Resumes',
                data: skills.map(s => s.count),
                backgroundColor: barColors,
                hoverBackgroundColor: hoverColors,
                borderColor: 'transparent',
                borderWidth: 0,
                borderRadius: 6,
                borderSkipped: false,
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
                    label: ctx => `${ctx.raw} resume${ctx.raw !== 1 ? 's' : ''}`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(42, 35, 26, 0.8)' },
                ticks: {
                    color: '#8C7B69',
                    stepSize: 1,
                    font: { family: 'Inter', size: 11 }
                },
                border: { display: false }
            },
            x: {
                grid: { color: 'transparent' },
                ticks: {
                    color: '#8C7B69',
                    font: { family: 'Inter', size: 11 },
                    maxRotation: 30
                },
                border: { display: false }
            }
        }
    };

    if (skills.length === 0) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '280px', color: '#94a3b8', gap: '0.5rem' }}>
                <span style={{ fontSize: '2rem' }}>🧰</span>
                <p style={{ fontWeight: 600, color: '#64748b' }}>No skills detected yet</p>
                <p style={{ fontSize: '0.8rem' }}>Analyze a resume to see your skill set</p>
            </div>
        );
    }

    return (
        <div style={{ height: '280px', width: '100%' }}>
            <Bar data={data} options={options} />
        </div>
    );
};

export default TopSkillsChart;