import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { 
    FiCode, FiBookOpen, FiActivity, FiAward, FiSearch, FiSliders, 
    FiFileText, FiChevronRight, FiCheckCircle, FiXCircle, FiPlay, 
    FiSend, FiChevronLeft, FiExternalLink, FiHelpCircle, FiCpu, FiCheck, FiSquare, FiInfo
} from 'react-icons/fi';
import { generateQuiz, generateFinalExam } from '../data/mockQuestions';
import api from '../services/api';
import toast from 'react-hot-toast';
import './PrepPage.css';

const PrepPage = () => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Tab states: 'overview' | 'coding' | 'cs' | 'aptitude' | 'jd-matcher'
    const [activeTab, setActiveTab] = useState('overview');

    // Data lists
    const [resumes, setResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState('');
    const [loadingResumes, setLoadingResumes] = useState(false);
    const [activeResumeDetails, setActiveResumeDetails] = useState(null);

    // Official Study Plans list
    const studyPlans = [
        {
            id: 'leetcode-150',
            title: 'LeetCode Top Interview 150',
            totalQuestions: 150,
            platform: 'LeetCode',
            description: 'The absolute standard for SDE interviews. Curated list of 150 problems covering arrays, graphs, trees, and dynamic programming.',
            url: 'https://leetcode.com/studyplan/top-interview-150/'
        },
        {
            id: 'leetcode-75',
            title: 'LeetCode 75 (Essential DSA)',
            totalQuestions: 75,
            platform: 'LeetCode',
            description: 'A structured, essential list of 75 high-frequency questions for rapid data structure review.',
            url: 'https://leetcode.com/studyplan/leetcode-75/'
        },
        {
            id: 'leetcode-sql-50',
            title: 'LeetCode SQL 50 (Databases)',
            totalQuestions: 50,
            platform: 'LeetCode',
            description: '50 curated SQL questions to master joins, aggregations, CTEs, and subqueries for data analysts.',
            url: 'https://leetcode.com/studyplan/sql-50/'
        },
        {
            id: 'hackerrank-prep',
            title: 'HackerRank Interview Prep Kit',
            totalQuestions: 60,
            platform: 'HackerRank',
            description: 'Curated challenges by HackerRank engineers covering sorting, dictionaries, string manipulations, and graphs.',
            url: 'https://www.hackerrank.com/interview/interview-preparation-kit'
        },
        {
            id: 'gfg-sde-sheet',
            title: 'GeeksforGeeks SDE Sheet',
            totalQuestions: 180,
            platform: 'GeeksforGeeks',
            description: 'Comprehensive topic-wise coding sheet targeting placements at FAANG and high-growth tech startups.',
            url: 'https://www.geeksforgeeks.org/sde-sheet-a-complete-guide-for-sde-preparation/'
        }
    ];

    // Core CS study resources direct search links
    const csResources = {
        os: {
            title: 'Operating Systems (OS)',
            youtube: 'https://www.youtube.com/results?search_query=Gate+Smashers+Operating+System+Playlist',
            gfg: 'https://www.geeksforgeeks.org/operating-systems/'
        },
        dbms: {
            title: 'Database Management Systems (DBMS)',
            youtube: 'https://www.youtube.com/results?search_query=Gate+Smashers+DBMS+Playlist',
            gfg: 'https://www.geeksforgeeks.org/dbms/'
        },
        cn: {
            title: 'Computer Networks (CN)',
            youtube: 'https://www.youtube.com/results?search_query=Gate+Smashers+Computer+Networks+Playlist',
            gfg: 'https://www.geeksforgeeks.org/computer-network-tutorials/'
        },
        system_design: {
            title: 'System Design & Architecture',
            youtube: 'https://www.youtube.com/results?search_query=Gaurav+Sen+System+Design+Playlist',
            gfg: 'https://www.geeksforgeeks.org/system-design-tutorial/'
        }
    };

    // Aptitude study resources direct links
    const aptitudeResources = {
        logical: {
            title: 'Logical Reasoning',
            youtube: 'https://www.youtube.com/results?search_query=CareerRide+Logical+Reasoning+Playlist',
            indiabix: 'https://www.indiabix.com/logical-reasoning/questions-and-answers/'
        },
        language: {
            title: 'Verbal Ability & Language',
            youtube: 'https://www.youtube.com/results?search_query=CareerRide+Verbal+Ability+Playlist',
            indiabix: 'https://www.indiabix.com/verbal-ability/questions-and-answers/'
        },
        maths: {
            title: 'Quantitative Aptitude (Maths)',
            youtube: 'https://www.youtube.com/results?search_query=CareerRide+Quantitative+Aptitude+Playlist',
            indiabix: 'https://www.indiabix.com/quantitative-aptitude/questions-and-answers/'
        }
    };

    // Active Study Plan and solved count states
    const [activePlanId, setActivePlanId] = useState('leetcode-150');
    const [solvedCount, setSolvedCount] = useState(0);
    const [quizHistory, setQuizHistory] = useState({});

    // Quiz engine states
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [quizResult, setQuizResult] = useState(null);

    // JD Matcher states
    const [selectedResume, setSelectedResume] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [jdResults, setJdResults] = useState(null);
    const [matchingJd, setMatchingJd] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.error('Please login to prepare for placements');
            navigate('/');
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Load progress, quiz scores, and resumes from the API on mount
    useEffect(() => {
        if (isAuthenticated) {
            loadAllPrepData();
        }
    }, [isAuthenticated]);

    // Fetch analysis whenever selected resume changes
    useEffect(() => {
        if (selectedResumeId) {
            loadResumeAnalysis(selectedResumeId);
        } else {
            setActiveResumeDetails(null);
        }
    }, [selectedResumeId]);

    async function loadAllPrepData() {
        try {
            // All three requests in parallel
            const [progress, scores, resumeList] = await Promise.all([
                api.getPrepProgress(),
                api.getQuizScores(),
                api.getUserResumes(),
            ]);

            setActivePlanId(progress.plan_id || 'leetcode-150');
            setSolvedCount(progress.solved ?? 0);
            setQuizHistory(scores || {});

            setResumes(resumeList);
            if (resumeList.length > 0) {
                // resume_id from backend, not .id
                setSelectedResumeId(resumeList[0].resume_id);
                setSelectedResume(resumeList[0].resume_id);
            }
        } catch (err) {
            console.error('Failed to load prep data:', err);
        } finally {
            setLoadingResumes(false);
        }
    }

    async function loadResumeAnalysis(id) {
        try {
            const results = await api.getAnalysisResults(id);
            setActiveResumeDetails(results);
        } catch (err) {
            console.error('Failed to load analysis metrics', err);
        }
    }

    // ----------------------------------------------------
    // ACTIVE PLAN SELECTION & SOLVE COUNTER MUTATIONS
    // ----------------------------------------------------
    const selectActivePlan = async (planId) => {
        setActivePlanId(planId);
        setSolvedCount(0);
        try {
            await api.savePrepProgress(planId, 0);
            toast.success('Active plan updated!');
        } catch (err) {
            console.error('Failed to save plan:', err);
        }
    };

    const updateSolvedCount = async (val, maxLimit) => {
        let cleanVal = Number(val);
        if (isNaN(cleanVal) || cleanVal < 0) cleanVal = 0;
        if (cleanVal > maxLimit) cleanVal = maxLimit;
        setSolvedCount(cleanVal);
        try {
            await api.savePrepProgress(activePlanId, cleanVal);
        } catch (err) {
            console.error('Failed to save solved count:', err);
        }
    };

    // ----------------------------------------------------
    // QUIZ GAME ENGINE LOGIC
    // ----------------------------------------------------
    const startQuizOption = (subject, difficulty) => {
        setQuizResult(null);
        let questions = [];
        if (difficulty === 'final') {
            questions = generateFinalExam(subject === 'cs-final' ? 'cs' : 'apt', 30);
        } else {
            questions = generateQuiz(subject, difficulty, 30);
        }

        if (questions.length === 0) {
            toast.error('Failed to construct quiz. Question pool is empty.');
            return;
        }

        setActiveQuiz({
            subject,
            difficulty,
            questions,
            currentIdx: 0,
            answers: {}
        });
    };

    const handleSelectOption = (qId, optionIdx) => {
        setActiveQuiz(prev => ({
            ...prev,
            answers: {
                ...prev.answers,
                [qId]: optionIdx
            }
        }));
    };

    const nextQuizQuestion = () => {
        if (activeQuiz.currentIdx < activeQuiz.questions.length - 1) {
            setActiveQuiz(prev => ({ ...prev, currentIdx: prev.currentIdx + 1 }));
        }
    };

    const prevQuizQuestion = () => {
        if (activeQuiz.currentIdx > 0) {
            setActiveQuiz(prev => ({ ...prev, currentIdx: prev.currentIdx - 1 }));
        }
    };

    const submitQuiz = async () => {
        const { questions, answers, subject, difficulty } = activeQuiz;
        let score = 0;
        questions.forEach(q => {
            if (answers[q.id] === q.correctOption) score++;
        });

        const historyKey = `${subject}_${difficulty}`;
        setQuizHistory(prev => ({ ...prev, [historyKey]: score }));
        setQuizResult({ score, total: questions.length, questions, answers });
        setActiveQuiz(null);
        toast.success(`Quiz completed! You scored ${score}/${questions.length}`);

        // Persist to DB (non-blocking)
        try {
            await api.saveQuizScore(subject, difficulty, score, questions.length);
        } catch (err) {
            console.error('Failed to save quiz score:', err);
        }
    };

    // ----------------------------------------------------
    // JOB DESCRIPTION MATCHER LOGIC  (backend-powered)
    // ----------------------------------------------------
    const runJdMatcher = async () => {
        if (!selectedResume) {
            toast.error('Please upload and select a resume first');
            return;
        }
        if (!jobDescription.trim()) {
            toast.error('Please paste a Job Description');
            return;
        }

        setMatchingJd(true);
        try {
            const result = await api.runJdMatch(selectedResume, jobDescription);
            setJdResults({
                score:       result.score,
                matches:     result.matched,
                missing:     result.missing,
                suggestions: result.suggestions,
                jd_keywords: result.jd_keywords,
                resume_skills: result.resume_skills,
            });
            toast.success('Job Description matching analysis complete!');
        } catch (err) {
            const msg = err?.response?.data?.detail || err.message;
            toast.error(`JD Match failed: ${msg}`);
            console.error('JD match error:', err);
        } finally {
            setMatchingJd(false);
        }
    };

    // ----------------------------------------------------
    // GENERATING OVERVIEW DAY-TO-DAY FEEDBACK TEXT
    // ----------------------------------------------------
    const generateFeedbackAdvice = () => {
        let lowestVal = 30;
        let lowestLabel = '';
        const quizHistoryKeys = Object.keys(quizHistory);
        
        quizHistoryKeys.forEach(k => {
            if (quizHistory[k] < lowestVal) {
                lowestVal = quizHistory[k];
                lowestLabel = k;
            }
        });

        if (!selectedResumeId) {
            return {
                title: 'Please Select a Resume',
                body: 'Choose an analyzed resume at the top to generate a personalized placement preparation roadmap tailored to your skills gaps.',
                type: 'primary'
            };
        }

        if (solvedCount === 0 && quizHistoryKeys.length === 0) {
            return {
                title: 'Placement Prep Path Ready',
                body: `Review your customized targets. Start by attempting the suggested LeetCode exercises or clicking the CS study links.`,
                type: 'primary'
            };
        }

        if (lowestLabel) {
            const [topic, level] = lowestLabel.split('_');
            const friendlyTopic = topic === 'cs-final' ? 'CS Final Exam' : topic.toUpperCase();
            return {
                title: `Focus Target: ${friendlyTopic}`,
                body: `Your score on the ${level} level test was ${lowestVal}/30. We recommend reviewing the playlists and trying a new shuffled test to raise this threshold.`,
                type: 'danger'
            };
        }

        return {
            title: 'On-Track for Placement',
            body: 'Excellent overall indicators. Keep taking mixed Final Exams to audit your readiness, and paste upcoming specs in the JD Matcher.',
            type: 'success'
        };
    };

    const advice = generateFeedbackAdvice();

    if (authLoading) return <LoadingSpinner />;
    if (!isAuthenticated) return null;

    const activePlan = studyPlans.find(p => p.id === activePlanId) || studyPlans[0];

    return (
        <DashboardLayout>
            <div className="prep-page-content animate-slide-up">
                
                {/* Header row */}
                <div className="prep-header-row">
                    <div>
                        <h1 className="prep-title">Placement Prep Hub</h1>
                        <p className="prep-subtitle">
                            Practice official study plans directly on LeetCode & HackerRank, review playlists, and audit CS quizzes.
                        </p>
                    </div>

                    {/* Resume selection widget */}
                    {resumes.length > 0 && (
                        <div className="resume-selector-wrapper">
                            <span className="selector-label">Resume Target:</span>
                            <select
                                value={selectedResumeId}
                                onChange={(e) => {
                                    const id = Number(e.target.value);
                                    setSelectedResumeId(id);
                                    setSelectedResume(id);   // keep JD matcher in sync
                                }}
                                className="resume-select-dropdown"
                                disabled={loadingResumes}
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

                {/* Tab Navigation Menu */}
                <div className="prep-tabs-bar">
                    <button 
                        className={`prep-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('overview'); setQuizResult(null); }}
                    >
                        <FiActivity className="tab-icon" /> Overview
                    </button>
                    <button 
                        className={`prep-tab-btn ${activeTab === 'coding' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('coding'); setQuizResult(null); }}
                    >
                        <FiCode className="tab-icon" /> Coding Arena
                    </button>
                    <button 
                        className={`prep-tab-btn ${activeTab === 'cs' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('cs'); setQuizResult(null); }}
                    >
                        <FiCpu className="tab-icon" /> CS Fundamentals
                    </button>
                    <button 
                        className={`prep-tab-btn ${activeTab === 'aptitude' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('aptitude'); setQuizResult(null); }}
                    >
                        <FiBookOpen className="tab-icon" /> Aptitude Round
                    </button>
                    <button 
                        className={`prep-tab-btn ${activeTab === 'jd-matcher' ? 'active' : ''}`}
                        onClick={() => { setActiveTab('jd-matcher'); setQuizResult(null); }}
                    >
                        <FiFileText className="tab-icon" /> JD Matcher
                    </button>
                </div>

                {/* ---------------------------------------------------- */}
                {/* TAB CONTENT: OVERVIEW (Dynamic Diagnostic Panel) */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'overview' && (
                    <div className="tab-panel overview-panel">
                        {/* Summary Grid stats */}
                        <div className="overview-stats-row">
                            <div className="prep-stat-card">
                                <span className="stat-card-title">Coding Target</span>
                                <h2 className="stat-card-val">{solvedCount} <span className="max-val">/ {activePlan.totalQuestions}</span></h2>
                                <span className="stat-card-hint">{activePlan.title}</span>
                            </div>
                            <div className="prep-stat-card">
                                <span className="stat-card-title">Quizzes Run</span>
                                <h2 className="stat-card-val">{Object.keys(quizHistory).length}</h2>
                                <span className="stat-card-hint">CS & Aptitude tests completed</span>
                            </div>
                            <div className="prep-stat-card">
                                <span className="stat-card-title">Average Score</span>
                                <h2 className="stat-card-val">
                                    {Object.keys(quizHistory).length > 0 
                                        ? `${Math.round((Object.values(quizHistory).reduce((a,b) => a+b, 0) / (Object.keys(quizHistory).length * 30)) * 100)}%`
                                        : '0%'}
                                </h2>
                                <span className="stat-card-hint">Diagnostic accuracy threshold</span>
                            </div>
                        </div>

                        {/* Daily Feedback Advice */}
                        <div className={`feedback-advice-card border-${advice.type}`}>
                            <div className="advice-header-sec">
                                <FiAward className="advice-award-icon" />
                                <div>
                                    <h4>{advice.title}</h4>
                                    <p>{advice.body}</p>
                                </div>
                            </div>
                        </div>

                        {/* Resume Matcher Insights */}
                        {activeResumeDetails && (
                            <div className="prep-card resume-diagnostic-card">
                                <div className="diagnostic-badge-title">
                                    <FiInfo className="info-icon" /> Resume Diagnostic Match
                                </div>
                                <h4 className="cv-info-title">
                                    Targeting: {(activeResumeDetails.analysis.industry || 'general_tech').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </h4>
                                <div className="diagnostic-detail-list">
                                    <div className="diagnostic-detail-row">
                                        <span className="detail-lbl">Overall ATS Score:</span>
                                        <span className="detail-val text-primary">{activeResumeDetails.analysis.resume_score} / 100</span>
                                    </div>
                                    <div className="diagnostic-detail-row">
                                        <span className="detail-lbl">Detected Core Skills:</span>
                                        <span className="detail-val">{activeResumeDetails.extracted_data.skills || 'No skills parsed'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recommended Path Tasks */}
                        {activeResumeDetails && (
                            <div className="prep-card">
                                <h3>Recommended Placement Tracker</h3>
                                <p className="settings-hint">You are actively preparing using this study path. Launch the portal on LeetCode/HackerRank to solve, and log your counts here:</p>
                                
                                <div className="recommended-tasks-list">
                                    <div className="rec-task-card">
                                        <div className="rec-task-left">
                                            <FiCode className="playlist-icon" />
                                            <div>
                                                <h5>{activePlan.title}</h5>
                                                <span className="rec-task-meta">{activePlan.platform} • {activePlan.totalQuestions} Curated Questions</span>
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div className="solve-counter-input-grp">
                                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--gray)' }}>Solved:</label>
                                                <input 
                                                    type="number"
                                                    value={solvedCount}
                                                    onChange={(e) => updateSolvedCount(e.target.value, activePlan.totalQuestions)}
                                                    className="settings-input solve-count-number"
                                                    style={{ width: '65px', padding: '4px 8px', textAlign: 'center', margin: '0 8px' }}
                                                />
                                                <span style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>/ {activePlan.totalQuestions}</span>
                                            </div>

                                            <a 
                                                href={activePlan.url} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="btn-link-action youtube"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                            >
                                                Open on {activePlan.platform} <FiExternalLink />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* TAB CONTENT: CODING ARENA (Official LeetCode Portals) */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'coding' && (
                    <div className="tab-panel coding-panel">
                        {/* Overall progress indicator bar */}
                        <div className="prep-card progress-dashboard-card">
                            <div className="progress-dashboard-header">
                                <h3>Active Study Target: {activePlan.title}</h3>
                                <span className="progress-badge">
                                    {solvedCount} / {activePlan.totalQuestions} Solved ({Math.round((solvedCount / activePlan.totalQuestions) * 100)}%)
                                </span>
                            </div>
                            <div className="quiz-progress-outer" style={{ margin: '1rem 0 0.5rem 0', height: '10px' }}>
                                <div 
                                    className="quiz-progress-inner"
                                    style={{ width: `${(solvedCount / activePlan.totalQuestions) * 100}%` }}
                                />
                            </div>
                            <div className="solve-count-controller-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div className="manual-solved-adjuster">
                                    <span style={{ fontSize: '0.85rem', color: 'var(--dark)', fontWeight: '600' }}>Adjust Solved Count: </span>
                                    <input 
                                        type="number"
                                        value={solvedCount}
                                        onChange={(e) => updateSolvedCount(e.target.value, activePlan.totalQuestions)}
                                        className="settings-input"
                                        style={{ width: '80px', padding: '6px', textAlign: 'center', marginLeft: '8px', display: 'inline-block' }}
                                    />
                                    <span style={{ fontSize: '0.85rem', color: 'var(--gray)', marginLeft: '8px' }}>out of {activePlan.totalQuestions}</span>
                                </div>
                                <a 
                                    href={activePlan.url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="btn-link-action youtube"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                >
                                    Open Official Plan on {activePlan.platform} <FiExternalLink />
                                </a>
                            </div>
                        </div>

                        {/* Tracks Display cards */}
                        <div className="coding-tracks-grid" style={{ gridTemplateColumns: '1fr' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--dark)', marginBottom: '0.25rem' }}>Select Platform Placement Track</h3>
                            {studyPlans.map((plan) => {
                                const isActive = plan.id === activePlanId;
                                const planSolved = isActive ? solvedCount : Number(localStorage.getItem(`pref_coding_solved_${plan.id}`) || '0');
                                
                                return (
                                    <div key={plan.id} className={`prep-card study-plan-card-item ${isActive ? 'active-target' : ''}`} style={{ borderLeft: isActive ? '5px solid var(--primary)' : '1px solid var(--border)' }}>
                                        <div className="plan-item-left">
                                            <FiCode className="plan-item-icon" />
                                            <div className="plan-item-details">
                                                <div className="plan-item-title-row">
                                                    <h5>{plan.title}</h5>
                                                    <span className="plan-item-platform-badge">{plan.platform}</span>
                                                </div>
                                                <p className="plan-item-desc">{plan.description}</p>
                                                <span className="plan-item-progress-stats">
                                                    Progress: **{planSolved} / {plan.totalQuestions}** questions checked off
                                                </span>
                                            </div>
                                        </div>

                                        <div className="plan-item-right-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            {isActive ? (
                                                <button className="btn-quiz-start easy" style={{ cursor: 'default' }}>Active Target</button>
                                            ) : (
                                                <button className="btn-table-action analyze" onClick={() => selectActivePlan(plan.id)}>
                                                    Track this plan
                                                </button>
                                            )}
                                            <a 
                                                href={plan.url} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="btn-link-action gfg"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                            >
                                                Open <FiExternalLink />
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* TAB CONTENT: CS FUNDAMENTALS */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'cs' && !activeQuiz && !quizResult && (
                    <div className="tab-panel cs-panel">
                        {/* Direct Playlists & Tutorials */}
                        <div className="prep-card">
                            <h3>Study Resources & Reference Guides</h3>
                            <p className="settings-hint" style={{ marginBottom: '1.25rem' }}>Top-rated playlist channels and technical reference pages to master core computer science rounds.</p>
                            
                            <div className="cs-playlists-vertical">
                                {Object.entries(csResources).map(([key, res]) => (
                                    <div key={key} className="resource-playlist-row">
                                        <div className="playlist-info-side">
                                            <FiBookOpen className="playlist-icon" />
                                            <div>
                                                <h5>{res.title}</h5>
                                                <p>Learn core properties, interview problems, and diagnostics guidelines.</p>
                                            </div>
                                        </div>
                                        <div className="playlist-actions-side">
                                            <a href={res.youtube} target="_blank" rel="noreferrer" className="btn-link-action youtube">
                                                YouTube Playlist <FiExternalLink />
                                            </a>
                                            <a href={res.gfg} target="_blank" rel="noreferrer" className="btn-link-action gfg">
                                                GeeksforGeeks Guide <FiExternalLink />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quiz subjects rows */}
                        <div className="prep-card">
                            <h3>Dynamic Practice Quizzes</h3>
                            <p className="settings-hint" style={{ marginBottom: '1.5rem' }}>Select a subject and difficulty to generate a randomized multiple-choice test containing 30 questions.</p>
                            
                            <div className="quizzes-trigger-list">
                                {['os', 'dbms', 'cn', 'system_design'].map((sub) => (
                                    <div key={sub} className="quiz-trigger-row">
                                        <div className="quiz-row-left">
                                            <FiHelpCircle className="quiz-row-icon" />
                                            <div>
                                                <h4 className="quiz-row-name">
                                                    {sub === 'system_design' ? 'System Design' : sub.toUpperCase()}
                                                </h4>
                                                <span className="quiz-row-hint">Covers key placement interview questions</span>
                                            </div>
                                        </div>
                                        <div className="quiz-row-actions">
                                            <button className="btn-quiz-start easy" onClick={() => startQuizOption(sub, 'easy')}>Easy</button>
                                            <button className="btn-quiz-start medium" onClick={() => startQuizOption(sub, 'medium')}>Medium</button>
                                            <button className="btn-quiz-start hard" onClick={() => startQuizOption(sub, 'hard')}>Hard</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Final CS Exam card */}
                        <div className="prep-card final-exam-prep-card">
                            <div className="final-exam-content">
                                <h3>CS Fundamentals Final Exam</h3>
                                <p>Attempt a simulated 30-question placement quiz combining Operating Systems, Databases, Computer Networks, and System Design problems.</p>
                                <button className="cta-button secondary" onClick={() => startQuizOption('cs-final', 'final')}>
                                    Start Final Exam
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* TAB CONTENT: APTITUDE ROUND */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'aptitude' && !activeQuiz && !quizResult && (
                    <div className="tab-panel aptitude-panel">
                        {/* Direct Playlists & Tutorials */}
                        <div className="prep-card">
                            <h3>Aptitude Study Resources & Reference Guides</h3>
                            <p className="settings-hint" style={{ marginBottom: '1.25rem' }}>Curated learning content to clear pre-interview screening tests.</p>
                            
                            <div className="cs-playlists-vertical">
                                {Object.entries(aptitudeResources).map(([key, res]) => (
                                    <div key={key} className="resource-playlist-row">
                                        <div className="playlist-info-side">
                                            <FiBookOpen className="playlist-icon" />
                                            <div>
                                                <h5>{res.title}</h5>
                                                <p>Learn tips, fast shortcut tricks, and practice topic questions.</p>
                                            </div>
                                        </div>
                                        <div className="playlist-actions-side">
                                            <a href={res.youtube} target="_blank" rel="noreferrer" className="btn-link-action youtube">
                                                YouTube Playlist <FiExternalLink />
                                            </a>
                                            <a href={res.indiabix} target="_blank" rel="noreferrer" className="btn-link-action gfg">
                                                IndiaBIX Prep <FiExternalLink />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quizzes list */}
                        <div className="prep-card">
                            <h3>Aptitude Practice Quizzes</h3>
                            <div className="quizzes-trigger-list">
                                {['logical', 'language', 'maths'].map((sub) => (
                                    <div key={sub} className="quiz-trigger-row">
                                        <div className="quiz-row-left">
                                            <FiHelpCircle className="quiz-row-icon" />
                                            <div>
                                                <h4 className="quiz-row-name" style={{ textTransform: 'capitalize' }}>
                                                    {sub === 'maths' ? 'Quantitative Maths' : sub}
                                                </h4>
                                                <span className="quiz-row-hint">Required for aptitude screening rounds</span>
                                            </div>
                                        </div>
                                        <div className="quiz-row-actions">
                                            <button className="btn-quiz-start easy" onClick={() => startQuizOption(sub, 'easy')}>Easy</button>
                                            <button className="btn-quiz-start medium" onClick={() => startQuizOption(sub, 'medium')}>Medium</button>
                                            <button className="btn-quiz-start hard" onClick={() => startQuizOption(sub, 'hard')}>Hard</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="prep-card final-exam-prep-card">
                            <div className="final-exam-content">
                                <h3>Aptitude round Final Exam</h3>
                                <p>A full 30-question test combining logical reasoning, maths, and sentence corrections.</p>
                                <button className="cta-button secondary" onClick={() => startQuizOption('aptitude-final', 'final')}>
                                    Start Final Aptitude Exam
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* ACTIVE QUIZ FORM CONTROLLER */}
                {/* ---------------------------------------------------- */}
                {activeQuiz && (
                    <div className="prep-card quiz-game-container animate-fade-in">
                        <div className="quiz-game-header">
                            <div>
                                <span className="quiz-badge-info">
                                    {activeQuiz.subject.replace('-', ' ').toUpperCase()} ({activeQuiz.difficulty.toUpperCase()})
                                </span>
                                <h4>Question {activeQuiz.currentIdx + 1} of {activeQuiz.questions.length}</h4>
                            </div>
                            {/* Progress bar */}
                            <div className="quiz-progress-outer" style={{ flex: 1, margin: '0 1.5rem' }}>
                                <div
                                    className="quiz-progress-inner"
                                    style={{ width: `${((activeQuiz.currentIdx + 1) / activeQuiz.questions.length) * 100}%` }}
                                />
                            </div>
                            {/* Exit button */}
                            <button
                                className="btn-back"
                                style={{ flexShrink: 0, background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                                onClick={() => {
                                    if (window.confirm('Exit quiz? Your progress will not be saved.')) {
                                        setActiveQuiz(null);
                                        toast('Quiz exited — score not saved.', { icon: '↩️' });
                                    }
                                }}
                            >
                                <FiXCircle style={{ marginRight: 4 }} /> Exit Quiz
                            </button>
                        </div>

                        {/* Current Question */}
                        {(() => {
                            const questionObj = activeQuiz.questions[activeQuiz.currentIdx];
                            const selectedAnswer = activeQuiz.answers[questionObj.id];

                            return (
                                <div className="quiz-question-body">
                                    <p className="quiz-question-text">{questionObj.question}</p>

                                    <div className="quiz-options-list">
                                        {questionObj.options.map((opt, optIdx) => (
                                            <label
                                                key={optIdx}
                                                className={`quiz-option-label ${selectedAnswer === optIdx ? 'selected' : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`q-${questionObj.id}`}
                                                    checked={selectedAnswer === optIdx}
                                                    onChange={() => handleSelectOption(questionObj.id, optIdx)}
                                                    className="quiz-radio-input"
                                                />
                                                <span className="option-letter">{['A', 'B', 'C', 'D', 'E'][optIdx]}.</span>
                                                <span className="option-text-val">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Navigation controls */}
                        <div className="quiz-controls-footer">
                            <button
                                className="btn-back"
                                onClick={prevQuizQuestion}
                                disabled={activeQuiz.currentIdx === 0}
                            >
                                <FiChevronLeft /> Previous
                            </button>

                            {activeQuiz.currentIdx === activeQuiz.questions.length - 1 ? (
                                <button className="btn-submit" onClick={submitQuiz}>
                                    Submit Quiz <FiCheckCircle style={{ marginLeft: '6px' }} />
                                </button>
                            ) : (
                                <button className="btn-submit" onClick={nextQuizQuestion}>
                                    Next <FiChevronRight />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* QUIZ RESULT REPORT */}
                {/* ---------------------------------------------------- */}
                {quizResult && (
                    <div className="quiz-results-container animate-slide-up">
                        <div className="prep-card results-score-card">
                            <h3>Test Diagnostics Report</h3>
                            <h2 className="score-number-display">{quizResult.score} <span className="slash-total">/ {quizResult.total}</span></h2>
                            <p className="score-percentage-label">
                                Score: {Math.round((quizResult.score / quizResult.total) * 100)}%
                            </p>
                            <button className="cta-button" onClick={() => setQuizResult(null)}>
                                Close Report & Return
                            </button>
                        </div>

                        {/* Audit Details */}
                        <div className="prep-card">
                            <h3>Review Questions</h3>
                            <div className="review-questions-list">
                                {quizResult.questions.map((q, idx) => {
                                    const userAnswer = quizResult.answers[q.id];
                                    const isCorrect = userAnswer === q.correctOption;
                                    
                                    return (
                                        <div key={q.id} className="review-question-item">
                                            <div className="review-question-header">
                                                <span className="review-idx">Q{idx + 1}.</span>
                                                <p className="review-text">{q.question}</p>
                                            </div>

                                            <div className="review-options-summary">
                                                {q.options.map((opt, oIdx) => {
                                                    let labelClass = '';
                                                    if (oIdx === q.correctOption) labelClass = 'correct-target';
                                                    else if (userAnswer === oIdx && !isCorrect) labelClass = 'incorrect-target';

                                                    return (
                                                        <div key={oIdx} className={`review-option-row ${labelClass}`}>
                                                            <span className="opt-marker">
                                                                {oIdx === q.correctOption ? '✓ ' : (userAnswer === oIdx ? '✗ ' : '')}
                                                            </span>
                                                            {opt}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="review-explanation-block">
                                                <strong>Explanation:</strong> {q.explanation}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* TAB CONTENT: JD SPECIFIC MATCHING */}
                {/* ---------------------------------------------------- */}
                {activeTab === 'jd-matcher' && (
                    <div className="tab-panel jd-matcher-panel">
                        <div className="prep-card">
                            <h3>Resume Alignment Matching</h3>
                            <p className="settings-hint" style={{ marginBottom: '1.5rem' }}>Paste a job description to extract core keywords and calculate dynamic resume match statistics.</p>
                            
                            <div className="jd-form-row">
                                <div className="form-group select-resume-group">
                                    <label>Select Target Resume</label>
                                    <select 
                                        value={selectedResume} 
                                        onChange={(e) => {
                                            const id = Number(e.target.value);
                                            setSelectedResume(id);
                                            setSelectedResumeId(id); // keep overview diagnostic in sync
                                        }}
                                        className="settings-input settings-select"
                                        disabled={loadingResumes}
                                    >
                                        {resumes.length === 0
                                            ? <option value="">No resumes uploaded yet</option>
                                            : resumes.map(r => (
                                                <option key={r.resume_id} value={r.resume_id}>{r.file_name}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '1.25rem' }}>
                                <label>Paste Job Description Text</label>
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste SDE, SQL or Data Analyst job description here..."
                                    rows="8"
                                    className="jd-textarea-box"
                                />
                            </div>

                            <button className="cta-button" onClick={runJdMatcher} disabled={matchingJd || resumes.length === 0}>
                                {matchingJd ? 'Running matching algorithm...' : 'Analyze JD Alignment'}
                            </button>
                        </div>

                        {/* Match Results Diagnostic Panel */}
                        {jdResults && (
                            <div className="jd-results-grid animate-slide-up">
                                {/* Score ring card */}
                                <div className="prep-card score-radial-card">
                                    <h4>Matching Index</h4>
                                    <div className="radial-percentage-container">
                                        <h2 className="radial-percentage">{jdResults.score}%</h2>
                                        <span className="radial-sub">{jdResults.score >= 80 ? 'Highly Aligned' : 'Audit Advised'}</span>
                                    </div>
                                </div>

                                {/* Matching vs Missing Card */}
                                <div className="prep-card matches-lists-card">
                                    <h4>Keyword Intersections</h4>
                                    
                                    <div className="matches-pane">
                                        <span className="matches-title-label text-success">Matching Keywords:</span>
                                        <div className="tags-container">
                                            {jdResults.matched && jdResults.matched.length > 0
                                                ? jdResults.matched.map((m, i) => (
                                                    <span key={i} className="badge-tag match-tag">{m}</span>
                                                ))
                                                : <span className="badge-tag" style={{opacity:0.6}}>
                                                    {jdResults.no_tech_keywords
                                                        ? 'No specific tech keywords detected in this JD'
                                                        : 'No overlapping keywords found'}
                                                  </span>
                                            }
                                        </div>
                                    </div>

                                    <div className="matches-pane" style={{ marginTop: '1.5rem' }}>
                                        <span className="matches-title-label text-danger">Missing Keywords:</span>
                                        <div className="tags-container">
                                            {jdResults.missing && jdResults.missing.length > 0
                                                ? jdResults.missing.map((m, i) => (
                                                    <span key={i} className="badge-tag missing-tag">{m}</span>
                                                ))
                                                : <span className="badge-tag" style={{opacity:0.6}}>
                                                    {jdResults.no_tech_keywords
                                                        ? 'Add specific tools & technologies to your resume'
                                                        : 'No missing keywords — good coverage!'}
                                                  </span>
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Tailoring Suggestion checklist */}
                                <div className="prep-card suggestions-full-card">
                                    <h4>Tailoring Guidelines</h4>
                                    <ul className="tailor-steps-list">
                                        {jdResults.suggestions.map((s, idx) => (
                                            <li key={idx} className="tailor-step-item">
                                                <FiChevronRight className="tailor-icon" />
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default PrepPage;
