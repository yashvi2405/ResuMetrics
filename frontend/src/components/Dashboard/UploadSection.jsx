import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiFile } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './UploadSection.css';

const UploadSection = ({ onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type) && !file.name.endsWith('.docx')) {
            toast.error('Please upload PDF or DOCX files only');
            return;
        }

        if (file.size > maxSize) {
            toast.error('File size should be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const result = await api.uploadResume(file);
            toast.success('Resume uploaded successfully!');
            onUploadSuccess();
        } catch (error) {
            toast.error('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    }, [onUploadSuccess]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxFiles: 1
    });

    return (
        <div className="upload-section">
            <h2>Upload New Resume</h2>
            <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
            >
                <input {...getInputProps()} />
                {uploading ? (
                    <div className="uploading-content">
                        <div className="spinner"></div>
                        <p>Uploading...</p>
                    </div>
                ) : (
                    <>
                        <FiUploadCloud className="upload-icon" />
                        <p className="dropzone-text">
                            {isDragActive
                                ? 'Drop your resume here'
                                : 'Drag & drop your resume here, or click to select'}
                        </p>
                        <p className="dropzone-hint">Supports PDF and DOCX (Max 5MB)</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default UploadSection;