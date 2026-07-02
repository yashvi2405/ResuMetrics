import React from 'react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const ScoreChart = ({ scores }) => {
    const data = {
        labels: ['Overall Score', 'ATS Compatibility', 'Skill Match', 'Keyword Relevance'],
        datasets: [
            {
                label: 'Resume Scores',
                data: [
                    scores.resume_score,
                    scores.ats_compatibility_score,
                    scores.skill_match_percentage,
                    scores.keyword_relevance_score
                ],
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(102, 126, 234, 1)'
            }
        ]
    };

    const options = {
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    stepSize: 20,
                    backdropColor: 'transparent'
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            }
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        return `${context.label}: ${context.raw}/100`;
                    }
                }
            }
        },
        maintainAspectRatio: true
    };

    return (
        <div className="chart-container">
            <Radar data={data} options={options} />
        </div>
    );
};

export default ScoreChart;