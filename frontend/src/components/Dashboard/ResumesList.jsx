import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiCalendar, FiHardDrive, FiBarChart2, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';
import './ResumesList.css';

const ResumesList = ({ searchQuery = '' }) => {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadResumes();
    }, []);

    const loadResumes = async () => {
        try {
            const data = await api.getUserResumes();
            setResumes(data);
        } catch (error) {
            console.error('Error loading resumes:', error);
            toast.error('Failed to load resumes');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyze = async (resumeId) => {
        setAnalyzing(resumeId);
        try {
            // Check if analysis already exists or trigger a new analysis run
            await api.analyzeResume(resumeId);
            toast.success('Analysis completed');
            navigate(`/analysis/${resumeId}`);
        } catch (error) {
            console.error('Analysis error:', error);
            toast.error('Failed to complete resume analysis');
        } finally {
            setAnalyzing(null);
        }
    };

    const handleDelete = async (e, resumeId) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this resume and its analysis?')) {
            return;
        }

        try {
            await api.deleteResume(resumeId);
            toast.success('Resume deleted successfully');
            loadResumes();
            // Dispatch event to update layout metrics
            window.dispatchEvent(new Event('storage-tasks-updated'));
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete resume');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const filteredResumes = resumes.filter(resume => 
        resume.file_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <LoadingSpinner />;

    if (resumes.length === 0) {
        return (
            <div className="no-resumes-container">
                <FiFileText className="no-resumes-icon" />
                <p className="no-resumes-title">No resumes found</p>
                <p className="no-resumes-subtext">Upload your resume PDF or DOCX file to begin analysis.</p>
            </div>
        );
    }

    return (
        <div className="resumes-table-container">
            <div className="table-header-row">
                <h3>Uploaded Resumes</h3>
                <span className="resumes-count-badge">{filteredResumes.length} files</span>
            </div>
            
            <div className="resumes-table-wrapper">
                <table className="resumes-table">
                    <thead>
                        <tr>
                            <th>File Name</th>
                            <th>Upload Date</th>
                            <th>File Size</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredResumes.map((resume) => (
                            <tr key={resume.resume_id} className="resume-table-row animate-fade-in">
                                <td className="filename-cell">
                                    <FiFileText className="file-icon" />
                                    <span className="file-name-text" title={resume.file_name}>
                                        {resume.file_name}
                                    </span>
                                </td>
                                <td>
                                    <span className="meta-info">
                                        <FiCalendar className="meta-icon" />
                                        {new Date(resume.upload_date).toLocaleDateString()}
                                    </span>
                                </td>
                                <td>
                                    <span className="meta-info">
                                        <FiHardDrive className="meta-icon" />
                                        {formatFileSize(resume.file_size)}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button
                                        className="btn-table-action analyze"
                                        onClick={() => handleAnalyze(resume.resume_id)}
                                        disabled={analyzing === resume.resume_id}
                                        title="Run AI Analysis"
                                    >
                                        {analyzing === resume.resume_id ? (
                                            <div className="table-btn-spinner" />
                                        ) : (
                                            <>
                                                <FiBarChart2 />
                                                <span>Analyze</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        className="btn-table-action delete"
                                        onClick={(e) => handleDelete(e, resume.resume_id)}
                                        title="Delete Resume"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredResumes.length === 0 && (
                            <tr>
                                <td colSpan="4" className="empty-search-cell">
                                    No resumes match your search criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResumesList;