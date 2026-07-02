import React from 'react';
import { motion } from 'framer-motion';
import './SkillsSection.css';

const SkillsSection = ({ skills }) => {
    const skillsList = skills ? skills.split(', ') : [];

    if (skillsList.length === 0) {
        return (
            <div className="skills-section">
                <h3>Skills Found</h3>
                <p className="no-skills">No skills detected. Add more technical skills to your resume.</p>
            </div>
        );
    }

    return (
        <div className="skills-section">
            <h3>Skills Found ({skillsList.length})</h3>
            <div className="skills-tags">
                {skillsList.map((skill, index) => (
                    <motion.span
                        key={index}
                        className="skill-tag"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                    >
                        {skill}
                    </motion.span>
                ))}
            </div>
        </div>
    );
};

export default SkillsSection;