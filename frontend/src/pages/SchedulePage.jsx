import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/Layout/DashboardLayout';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { FiPlus, FiTrash2, FiClock, FiCalendar, FiCheckSquare } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import './SchedulePage.css';

const SchedulePage = () => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(false);

    // Add task form state
    const [taskText, setTaskText]   = useState('');
    const [taskTime, setTaskTime]   = useState('10:00');
    const [taskType, setTaskType]   = useState('Interview');

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.error('Please login to access the scheduler');
            navigate('/');
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Load ALL tasks on mount (we store them all and filter by date client-side)
    useEffect(() => {
        if (isAuthenticated) loadTasks();
    }, [isAuthenticated]);

    const loadTasks = async () => {
        setLoadingTasks(true);
        try {
            const data = await api.getScheduleTasks();
            setTasks(data);
        } catch (err) {
            console.error('Failed to load tasks:', err);
            toast.error('Failed to load schedule');
        } finally {
            setLoadingTasks(false);
        }
    };

    // ── Calendar helpers ──────────────────────────────────────────────────────

    const getDaysInMonth = (date) => {
        const year  = date.getFullYear();
        const month = date.getMonth();
        const startDay = new Date(year, month, 1).getDay();
        const numDays  = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < startDay; i++) days.push(null);
        for (let i = 1; i <= numDays; i++) days.push(i);
        return days;
    };

    const daysOfWeek  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames  = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const changeMonth = (direction) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
    };

    const handleDayClick = (day) => {
        if (!day) return;
        setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    };

    // ── CRUD handlers ─────────────────────────────────────────────────────────

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!taskText.trim()) return;

        const dateStr = selectedDate.toISOString().split('T')[0];
        try {
            const newTask = await api.createScheduleTask(taskText, dateStr, taskTime, taskType);
            setTasks(prev => [...prev, newTask]);
            setTaskText('');
            toast.success('Event scheduled!');
        } catch (err) {
            console.error('Failed to create task:', err);
            toast.error(err?.response?.data?.detail || 'Failed to schedule event');
        }
    };

    const handleToggleComplete = async (taskId) => {
        try {
            const { completed } = await api.toggleScheduleTask(taskId);
            setTasks(prev => prev.map(t => t.task_id === taskId ? { ...t, completed } : t));
        } catch (err) {
            console.error('Failed to toggle task:', err);
            toast.error('Failed to update task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await api.deleteScheduleTask(taskId);
            setTasks(prev => prev.filter(t => t.task_id !== taskId));
            toast.success('Event removed');
        } catch (err) {
            console.error('Failed to delete task:', err);
            toast.error('Failed to delete event');
        }
    };

    // ── Derived state ─────────────────────────────────────────────────────────

    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const filteredTasks   = tasks
        .filter(t => t.date === selectedDateStr)
        .sort((a, b) => a.time.localeCompare(b.time));

    const calendarDays = getDaysInMonth(currentDate);

    if (authLoading) return <LoadingSpinner />;
    if (!isAuthenticated) return null;

    return (
        <DashboardLayout>
            <div className="schedule-content animate-slide-up">
                {/* Header */}
                <div className="schedule-header-row">
                    <h1 className="schedule-title">Interview &amp; Job Schedule</h1>
                    <p className="schedule-subtitle">Manage submission milestones and mock interview preparation targets.</p>
                </div>

                <div className="schedule-main-grid">
                    {/* ── Interactive Calendar ────────────────────────────── */}
                    <div className="schedule-card calendar-large hover-scale">
                        <div className="cal-large-header">
                            <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                            <div className="cal-controls">
                                <button onClick={() => changeMonth(-1)} className="btn-cal-control">&lt;</button>
                                <button onClick={() => changeMonth(1)}  className="btn-cal-control">&gt;</button>
                            </div>
                        </div>

                        <div className="cal-large-grid">
                            {daysOfWeek.map((day, idx) => (
                                <div key={idx} className="cal-large-day-label">{day}</div>
                            ))}
                            {calendarDays.map((day, idx) => {
                                const isSelected = day &&
                                    selectedDate.getDate()    === day &&
                                    selectedDate.getMonth()   === currentDate.getMonth() &&
                                    selectedDate.getFullYear()=== currentDate.getFullYear();

                                const dayStr   = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0] : '';
                                const hasEvents = dayStr && tasks.some(t => t.date === dayStr);

                                return (
                                    <div
                                        key={idx}
                                        className={`cal-large-day-cell ${day ? 'clickable' : 'empty'} ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleDayClick(day)}
                                    >
                                        {day}
                                        {hasEvents && <div className="event-dot" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Right panel ─────────────────────────────────────── */}
                    <div className="schedule-details-panel">

                        {/* Agenda for selected day */}
                        <div className="schedule-card agenda-card hover-scale">
                            <h3>
                                Schedule for {selectedDate.toLocaleDateString(undefined, {
                                    month: 'long', day: 'numeric', year: 'numeric',
                                })}
                            </h3>

                            {loadingTasks ? (
                                <p style={{ opacity: 0.6, textAlign: 'center', padding: '1rem' }}>Loading…</p>
                            ) : filteredTasks.length === 0 ? (
                                <div className="no-events-view">
                                    <FiCalendar className="no-events-icon" />
                                    <p>No events scheduled for this date</p>
                                </div>
                            ) : (
                                <div className="agenda-list">
                                    {filteredTasks.map((task) => (
                                        <div key={task.task_id} className={`agenda-item ${task.completed ? 'completed' : ''}`}>
                                            <div className="agenda-checkbox-wrapper">
                                                <input
                                                    type="checkbox"
                                                    checked={task.completed}
                                                    onChange={() => handleToggleComplete(task.task_id)}
                                                    className="agenda-checkbox"
                                                />
                                            </div>
                                            <div className="agenda-body">
                                                <div className="agenda-meta">
                                                    <span className={`agenda-badge ${task.type.toLowerCase()}`}>{task.type}</span>
                                                    <span className="agenda-time">
                                                        <FiClock className="time-icon" /> {task.time}
                                                    </span>
                                                </div>
                                                <p className="agenda-text">{task.text}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteTask(task.task_id)}
                                                className="btn-agenda-delete"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Add Task Form */}
                        <div className="schedule-card add-event-card hover-scale">
                            <h3>Add Scheduled Event</h3>
                            <form onSubmit={handleAddTask} className="add-event-form">
                                <div className="form-group">
                                    <label>Event Description</label>
                                    <input
                                        type="text"
                                        value={taskText}
                                        onChange={(e) => setTaskText(e.target.value)}
                                        placeholder="e.g., Mock interview practice, Submit Google application"
                                        required
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Time</label>
                                        <input
                                            type="time"
                                            value={taskTime}
                                            onChange={(e) => setTaskTime(e.target.value)}
                                            required
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Category</label>
                                        <select
                                            value={taskType}
                                            onChange={(e) => setTaskType(e.target.value)}
                                            className="form-input"
                                        >
                                            <option value="Interview">Interview</option>
                                            <option value="Review">Resume Review</option>
                                            <option value="Application">Application</option>
                                        </select>
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary btn-submit-task">
                                    <FiPlus /> Schedule Event
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SchedulePage;
