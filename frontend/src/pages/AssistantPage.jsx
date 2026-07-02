import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { FiSend, FiMessageSquare, FiCpu, FiTerminal, FiUser } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import './AssistantPage.css';

const AssistantPage = () => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    
    const [resumes, setResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState('');
    const [resumeDetails, setResumeDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    // Toggle state: 'counselor' | 'interview'
    const [assistantMode, setAssistantMode] = useState('counselor');
    const [interviewStep, setInterviewStep] = useState(0);

    const messagesEndRef = useRef(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.error('Please login to access AI Assistant');
            navigate('/');
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Load user resumes
    useEffect(() => {
        if (isAuthenticated) {
            loadResumes();
        }
    }, [isAuthenticated]);

    // Fetch detailed analysis once a resume is selected
    useEffect(() => {
        if (selectedResumeId) {
            fetchResumeAnalysis(selectedResumeId);
        } else {
            setResumeDetails(null);
            setMessages([]);
            setInterviewStep(0);
        }
    }, [selectedResumeId, assistantMode]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // ─── Helper: format chat history into [{role, content}] for backend ───
    const buildHistory = (msgList) =>
        msgList
            .filter(m => m.text && !m.text.includes('Initializing dynamic'))
            .slice(-14)
            .map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text,
            }));

    const loadResumes = async () => {
        try {
            const list = await api.getUserResumes();
            setResumes(list);
            if (list.length > 0) {
                setSelectedResumeId(list[0].resume_id);
            }
        } catch (error) {
            console.error('Failed to load resumes:', error);
            toast.error('Failed to load resumes');
        } finally {
            setLoading(false);
        }
    };

    const fetchResumeAnalysis = async (id) => {
        try {
            const results = await api.getAnalysisResults(id);
            setResumeDetails(results);
            const fileName = resumes.find(r => r.resume_id === Number(id))?.file_name || 'your resume';

            if (assistantMode === 'counselor') {
                // Counselor initial greeting (static, no API call needed)
                setMessages([
                    {
                        sender: 'ai',
                        text: `Hello! I have loaded and analyzed "${fileName}" (Overall Score: ${results.analysis.resume_score}/100). How can I assist you in optimizing it today? You can ask me to:\n\n1. Suggest keywords to add\n2. Rewrite bullet points using the STAR method\n3. Check formatting guidelines for ATS systems\n4. Structure a custom cover letter template`,
                    },
                ]);
            } else {
                // Mock Interview initial greeting
                setInterviewStep(0);
                // Dynamic first question via backend → Groq
                setIsTyping(true);
                setMessages([{ sender: 'ai', text: 'Initializing dynamic Mock Interview based on your skills...' }]);

                const skills     = results?.extracted_data?.skills || '';
                const experience = results?.extracted_data?.work_experience || '';

                const systemPrompt = `You are a Technical Interview Coach conducting a Mock Technical Interview.
Candidate's Resume Context:
- Extracted Skills: ${skills}
- Extracted Experience: ${experience}
- Overall ATS Score: ${results?.analysis?.resume_score}/100

Introduce yourself briefly and ask exactly ONE tailored technical question (Question 1 of 5). State it will be a 5-question interview. Use friendly markdown.`;

                try {
                    const firstQuestion = await api.groqChat(
                        systemPrompt,
                        [{ role: 'user', content: 'Start the interview and ask Question 1.' }]
                    );
                    setMessages([{ sender: 'ai', text: firstQuestion }]);
                } catch (err) {
                    console.error('Failed to fetch first interview question:', err);
                    const errMsg = err?.response?.data?.detail || err.message || 'Unknown error';
                    setMessages([
                        {
                            sender: 'ai',
                            text: `Hello! I am your Technical Interview Coach. (Dynamic question generation failed: ${errMsg})\n\n**Question 1:** In JavaScript/Node.js or Python, how does asynchronous programming work, and what is the difference between synchronous execution and asynchronous event-loops?`,
                        },
                    ]);
                } finally {
                    setIsTyping(false);
                }
            }
        } catch (error) {
            console.error('Failed to load analysis for assistant:', error);
            toast.error('This resume has not been analyzed yet. Please run the analysis first.');
            setSelectedResumeId('');
        }
    };

    const handleModeChange = (mode) => {
        setAssistantMode(mode);
        setInterviewStep(0);
        // Resets message thread via fetchResumeAnalysis useEffect
    };

    // ─── Main send handler ───
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userQuery = inputValue;
        setMessages(prev => [...prev, { sender: 'user', text: userQuery }]);
        setInputValue('');
        setIsTyping(true);

        // ── DYNAMIC: backend → Groq proxy ──
        (async () => {
            try {
                const history = buildHistory(messages);

                if (assistantMode === 'interview') {
                    const skills     = resumeDetails?.extracted_data?.skills || '';
                    const experience = resumeDetails?.extracted_data?.work_experience || '';
                    const education  = resumeDetails?.extracted_data?.education_details || '';

                    const systemPrompt = `You are a Technical Interview Coach conducting a Mock Technical Interview.
Candidate's Resume Context:
- Extracted Skills: ${skills}
- Extracted Experience: ${experience}
- Extracted Education: ${education}
- Overall ATS Score: ${resumeDetails?.analysis?.resume_score}/100

Conduct an interactive mock technical interview following these rules:
1. Ask exactly 5 technical questions, one at a time, tailored to the candidate's skills.
2. After each user answer: provide brief feedback, give a score (e.g. 7/10), then ask the next question.
3. After the 5th answer: give a final placement grade out of 100 and a short wrap-up.
4. Use clear labels: "Question 1", "Question 2", ..., "Question 5".
5. Current step: Question ${interviewStep + 1} of 5. Respond in friendly markdown.`;

                    const reply = await api.groqChat(systemPrompt, [
                        ...history,
                        { role: 'user', content: userQuery }
                    ]);
                    setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
                    setInterviewStep(prev => prev + 1);

                } else {
                    const skills      = resumeDetails?.extracted_data?.skills || '';
                    const experience  = resumeDetails?.extracted_data?.work_experience || '';
                    const education   = resumeDetails?.extracted_data?.education_details || '';
                    const score       = resumeDetails?.analysis?.resume_score || 0;
                    const suggestions = resumeDetails?.feedback?.improvement_suggestions || '';
                    const formatting  = resumeDetails?.feedback?.formatting_suggestions || '';

                    const systemPrompt = `You are an expert AI Resume Coach and Career Counselor helping the user optimize their resume.
Resume Context:
- Overall ATS Score: ${score}/100
- Extracted Skills: ${skills}
- Extracted Experience: ${experience}
- Extracted Education: ${education}
- Improvement Suggestions: ${suggestions}
- Formatting Suggestions: ${formatting}

Provide actionable, specific advice. Help rewrite bullets using STAR method, suggest keywords to add, and explain ATS formatting rules. Keep responses structured and concise. Respond in friendly markdown.`;

                    const reply = await api.groqChat(systemPrompt, [
                        ...history,
                        { role: 'user', content: userQuery }
                    ]);
                    setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
                }
            } catch (error) {
                console.error('Groq backend error:', error);
                const errMsg = error?.response?.data?.detail || error.message || 'Unknown error';
                toast.error(`AI Error: ${errMsg}`);
                setMessages(prev => [
                    ...prev,
                    { sender: 'ai', text: `Sorry, I encountered an error: ${errMsg}. Please verify the server configuration.` },
                ]);
            } finally {
                setIsTyping(false);
            }
        })();
    };

    if (authLoading || loading) return <LoadingSpinner />;
    if (!isAuthenticated) return null;

    return (
        <DashboardLayout>
            <div className="assistant-content animate-slide-up">
                
                {/* Header row */}
                <div className="assistant-header-row">
                    <div>
                        <h1 className="assistant-title">AI Prep &amp; Resume Coach</h1>
                        <p className="assistant-subtitle">Get instant expert advice or simulate technical interview rounds.</p>
                    </div>

                    <div className="assistant-controls-box">
                        {/* Selector mode pills */}
                        <div className="assistant-mode-toggle">
                            <button 
                                className={`mode-pill-btn ${assistantMode === 'counselor' ? 'active' : ''}`}
                                onClick={() => handleModeChange('counselor')}
                            >
                                <FiMessageSquare className="mode-icon" /> Counselor Chat
                            </button>
                            <button 
                                className={`mode-pill-btn ${assistantMode === 'interview' ? 'active' : ''}`}
                                onClick={() => handleModeChange('interview')}
                                disabled={resumes.length === 0}
                            >
                                <FiCpu className="mode-icon" /> Mock Interview
                            </button>
                        </div>

                        {resumes.length > 0 && (
                            <div className="resume-selector-wrapper">
                                <span className="selector-label">Resume:</span>
                                <select
                                    value={selectedResumeId}
                                    onChange={(e) => setSelectedResumeId(e.target.value)}
                                    className="resume-select-dropdown"
                                    disabled={isTyping}
                                >
                                    {resumes.map(r => (
                                        <option key={r.resume_id} value={r.resume_id}>
                                            {r.file_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>



                {resumes.length === 0 ? (
                    <div className="assistant-card empty-state-card text-center">
                        <FiMessageSquare className="empty-state-icon" />
                        <h3>No Resumes Found</h3>
                        <p>You must upload and analyze a resume first before consulting the AI Coach.</p>
                        <button onClick={() => navigate('/resumes')} className="btn btn-primary mt-4">
                            Go to Resumes to Upload
                        </button>
                    </div>
                ) : (
                    <div className="chat-window-card">
                        {/* Chat Messages */}
                        <div className="chat-messages-container">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`chat-bubble-wrapper ${msg.sender}`}>
                                    <div className="chat-bubble animate-fade-in">
                                        <div className="bubble-text">
                                            {msg.text.split('\n').map((line, i) => (
                                                <p key={i}>{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="chat-bubble-wrapper ai">
                                    <div className="chat-bubble typing-bubble">
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleSendMessage} className="chat-input-form">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={assistantMode === 'interview' ? "Type your answer to the coach..." : "Ask about keywords, STAR method, ATS formatting..."}
                                className="chat-text-input"
                                disabled={!selectedResumeId || isTyping}
                            />
                            <button
                                type="submit"
                                className="chat-send-btn"
                                disabled={!inputValue.trim() || !selectedResumeId || isTyping}
                            >
                                <FiSend />
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AssistantPage;
