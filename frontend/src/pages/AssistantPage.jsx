import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { FiSend, FiMessageSquare, FiCpu, FiZap } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import './AssistantPage.css';

// ─── System prompts for each mode ────────────────────────────────────────────

function buildCounselorPrompt(resumeDetails) {
    const skills      = resumeDetails?.extracted_data?.skills      || 'not detected';
    const experience  = resumeDetails?.extracted_data?.experience  || 'not detected';
    const education   = resumeDetails?.extracted_data?.education   || 'not detected';
    const score       = resumeDetails?.analysis?.resume_score      ?? 'N/A';
    const ats         = resumeDetails?.analysis?.ats_compatibility_score ?? 'N/A';
    const suggestions = resumeDetails?.feedback?.improvement_suggestions || 'none';
    const formatting  = resumeDetails?.feedback?.formatting_suggestions  || 'none';
    const level       = resumeDetails?.feedback?.recommendation_level    || 'N/A';

    return `You are ResuMeterics AI, an expert resume coach and career counselor. You help software engineers and tech professionals optimise their resumes for ATS systems and job interviews.

RESUME DATA FOR THIS USER:
- Overall Score: ${score}/100
- ATS Compatibility Score: ${ats}/100
- Detected Skills: ${skills}
- Work Experience Summary: ${experience}
- Education: ${education}
- Recommendation Level: ${level}
- Improvement Suggestions: ${suggestions}
- Formatting Suggestions: ${formatting}

YOUR ROLE:
- Give specific, actionable resume advice based on the user's actual data above
- Help with ATS keyword optimisation, STAR-format bullet points, formatting, cover letters, and skill gaps
- Be encouraging but honest — point out real weaknesses with concrete fixes
- Keep responses concise (under 300 words) and use markdown formatting (bold, bullet points)
- Always reference the user's actual skills/score when relevant

Do NOT make up data. If something is "not detected", say so and advise the user to add it.`;
}

function buildInterviewPrompt(resumeDetails, questionNumber, totalQuestions) {
    const skills     = resumeDetails?.extracted_data?.skills     || 'general software engineering';
    const experience = resumeDetails?.extracted_data?.experience || 'software development';

    return `You are a senior technical interviewer conducting a mock interview. You are currently on question ${questionNumber} of ${totalQuestions}.

CANDIDATE PROFILE:
- Skills: ${skills}
- Experience Background: ${experience}

YOUR ROLE:
- Evaluate the candidate's answer to the previous question with specific, constructive feedback
- Give a score out of 10 for the answer (be fair but strict)
- Ask the next interview question tailored to their skill set
- If this is the final question (Q${totalQuestions}), give an overall assessment and final score out of 100

QUESTION TOPICS TO COVER (vary based on their skills):
1. Introduction and background
2. Technical project deep-dive
3. Problem-solving / debugging approach
4. System design or architecture question
5. Career goals and growth mindset

FORMAT your response as:
**Feedback:** [specific feedback on their answer, 2-3 sentences] *(Score: X/10)*

---

**Question ${questionNumber} of ${totalQuestions}:**
[Your question here]

Keep feedback constructive and the interview conversational. If they are on Q${totalQuestions} and have answered, give the **Final Assessment** instead of another question.`;
}

// ─── Fallback rule-based engine (used when Groq is unavailable) ──────────────

function counselorFallback(userMsg, resumeDetails) {
    const msg   = userMsg.toLowerCase();
    const score = resumeDetails?.analysis?.resume_score ?? 0;
    const ats   = resumeDetails?.analysis?.ats_compatibility_score ?? 0;
    const skills = resumeDetails?.extracted_data?.skills || 'none detected';

    if (msg.includes('keyword') || msg.includes('ats')) {
        return `**ATS & Keywords** (your ATS score: ${ats}/100)\n\n- Include exact keywords from job descriptions\n- Use standard section headings: *Skills*, *Experience*, *Education*\n- Avoid tables and graphics — ATS parsers skip them\n- Detected skills: ${skills}`;
    }
    if (msg.includes('star') || msg.includes('bullet')) {
        return `**STAR Method**\n\n- **S**ituation → **T**ask → **A**ction → **R**esult\n\n**Before:** *Worked on backend API*\n**After:** *Built REST API in Node.js reducing response time by 40% for 10,000 daily users*`;
    }
    if (msg.includes('score')) {
        return `**Your Resume Score: ${score}/100**\n\nATS Compatibility: ${ats}/100\n\n${score >= 80 ? '🎉 Great score!' : score >= 60 ? '👍 Good, but room to improve.' : '⚠️ Significant improvements needed.'}`;
    }
    return `I'm your Resume Coach! Ask me about:\n- **ATS & keywords**\n- **STAR bullet points**\n- **Formatting tips**\n- **Your score**\n\nCurrent score: **${score}/100**`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AssistantPage = () => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [resumes, setResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState('');
    const [resumeDetails, setResumeDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    const [messages, setMessages] = useState([]);
    // chatHistory holds [{ role: 'user'|'assistant', content: string }] for Groq context
    const [chatHistory, setChatHistory] = useState([]);

    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const [assistantMode, setAssistantMode] = useState('counselor');
    const [interviewStep, setInterviewStep] = useState(0);
    const [groqAvailable, setGroqAvailable] = useState(false);

    const messagesEndRef = useRef(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.error('Please login to access AI Assistant');
            navigate('/');
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Load resumes + check Groq status on mount
    useEffect(() => {
        if (isAuthenticated) {
            loadResumes();
            checkGroqStatus();
        }
    }, [isAuthenticated]);

    // Reload chat when resume or mode changes
    useEffect(() => {
        if (selectedResumeId) {
            fetchResumeAnalysis(selectedResumeId);
        } else {
            setResumeDetails(null);
            setMessages([]);
            setChatHistory([]);
            setInterviewStep(0);
        }
    }, [selectedResumeId, assistantMode]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const checkGroqStatus = async () => {
        try {
            const { available } = await api.groqStatus();
            setGroqAvailable(available);
        } catch {
            setGroqAvailable(false);
        }
    };

    const loadResumes = async () => {
        try {
            const list = await api.getUserResumes();
            setResumes(list);
            if (list.length > 0) setSelectedResumeId(list[0].resume_id);
        } catch (err) {
            console.error('Failed to load resumes:', err);
            toast.error('Failed to load resumes');
        } finally {
            setLoading(false);
        }
    };

    const fetchResumeAnalysis = async (id) => {
        try {
            const results = await api.getAnalysisResults(id);
            setResumeDetails(results);
            setChatHistory([]);

            const fileName = resumes.find(r => r.resume_id === Number(id))?.file_name || 'your resume';
            const score = results.analysis.resume_score;

            if (assistantMode === 'counselor') {
                const welcome = groqAvailable
                    ? `Hello! I've loaded **"${fileName}"** (Score: **${score}/100**). I'm powered by Groq AI 🤖\n\nAsk me anything about your resume — ATS optimisation, bullet rewrites, skill gaps, cover letters, or interview prep!`
                    : `Hello! I've loaded **"${fileName}"** (Score: **${score}/100**).\n\nI can help with: ATS keywords, STAR bullets, formatting, skill gaps, and cover letters. What would you like to improve?`;

                setMessages([{ sender: 'ai', text: welcome }]);
            } else {
                // Mock Interview mode — kick off with Q1
                setInterviewStep(1);
                setIsTyping(true);
                setMessages([{ sender: 'ai', text: 'Preparing your personalised mock interview…' }]);

                await new Promise(r => setTimeout(r, 500));

                const skills = results?.extracted_data?.skills || '';
                const firstQuestion = groqAvailable
                    ? await startGroqInterview(results, 1)
                    : `Hello! I'm your Technical Interview Coach. We'll go through **5 questions** tailored to your resume.\n\n**Question 1 of 5:**\nTell me about yourself and your main technical skills (${skills || 'as listed on your resume'}).`;

                setMessages([{ sender: 'ai', text: firstQuestion }]);
                setIsTyping(false);
            }
        } catch (err) {
            console.error('Failed to load analysis for assistant:', err);
            toast.error('This resume has not been analyzed yet. Please run the analysis first.');
            setSelectedResumeId('');
        }
    };

    const startGroqInterview = async (details, qNum) => {
        const systemPrompt = buildInterviewPrompt(details, qNum, 5);
        const initMessages = [{ role: 'user', content: 'Start the interview. Ask me question 1.' }];
        try {
            const reply = await api.groqChat(systemPrompt, initMessages, 0.7);
            setChatHistory(initMessages.concat([{ role: 'assistant', content: reply }]));
            return reply;
        } catch {
            return `**Question 1 of 5:**\nTell me about yourself and your main technical skills.`;
        }
    };

    const handleModeChange = (mode) => {
        setAssistantMode(mode);
        setInterviewStep(0);
        setChatHistory([]);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userQuery = inputValue.trim();
        const userBubble = { sender: 'user', text: userQuery };
        setMessages(prev => [...prev, userBubble]);
        setInputValue('');
        setIsTyping(true);

        try {
            let reply;

            if (groqAvailable) {
                // ── Groq path ──────────────────────────────────────────────
                if (assistantMode === 'interview') {
                    const nextStep = interviewStep + 1;
                    const systemPrompt = buildInterviewPrompt(resumeDetails, nextStep, 5);
                    const updatedHistory = [
                        ...chatHistory,
                        { role: 'user', content: userQuery },
                    ];
                    reply = await api.groqChat(systemPrompt, updatedHistory, 0.7);
                    setChatHistory([...updatedHistory, { role: 'assistant', content: reply }]);
                    setInterviewStep(nextStep);
                } else {
                    // Counselor mode — keep last 10 messages for context
                    const systemPrompt = buildCounselorPrompt(resumeDetails);
                    const updatedHistory = [
                        ...chatHistory.slice(-10),
                        { role: 'user', content: userQuery },
                    ];
                    reply = await api.groqChat(systemPrompt, updatedHistory, 0.8);
                    setChatHistory([...updatedHistory, { role: 'assistant', content: reply }]);
                }
            } else {
                // ── Fallback rule-based path ───────────────────────────────
                await new Promise(r => setTimeout(r, 500));
                if (assistantMode === 'interview') {
                    const step = interviewStep;
                    const QUESTIONS = [
                        'Describe a challenging project you worked on. What was your role?',
                        'How do you approach debugging a complex production issue?',
                        'Walk me through designing a scalable REST API.',
                        'Where do you see yourself growing technically in the next two years?',
                    ];
                    if (step >= 5) {
                        reply = `🎓 **Interview Complete!**\n\nGreat effort! Focus on quantifying achievements and practising system design. Good luck! 🍀`;
                    } else {
                        reply = `**Feedback:** Good answer! Try to quantify results more. *(Score: 7/10)*\n\n---\n\n**Question ${step + 1} of 5:**\n${QUESTIONS[step - 1] || 'What are your strengths and areas for growth?'}`;
                    }
                    setInterviewStep(prev => prev + 1);
                } else {
                    reply = counselorFallback(userQuery, resumeDetails);
                }
            }

            setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
        } catch (err) {
            console.error('Assistant error:', err);
            const errMsg = err?.response?.data?.detail || err.message;
            setMessages(prev => [...prev, {
                sender: 'ai',
                text: `⚠️ ${errMsg || 'Something went wrong. Please try again.'}`,
            }]);
        } finally {
            setIsTyping(false);
        }
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
                        <p className="assistant-subtitle">
                            {groqAvailable
                                ? <><FiZap style={{ verticalAlign: 'middle', marginRight: 4, color: '#a855f7' }} /> Powered by Groq LLaMA 3.3 · 70B</>
                                : 'Get instant expert advice or simulate technical interview rounds.'}
                        </p>
                    </div>

                    <div className="assistant-controls-box">
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
                                placeholder={assistantMode === 'interview'
                                    ? 'Type your answer to the interviewer…'
                                    : groqAvailable
                                        ? 'Ask anything about your resume…'
                                        : 'Ask about keywords, STAR method, ATS formatting…'}
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
