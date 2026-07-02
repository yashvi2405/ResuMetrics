import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { FiPlus, FiTrash2, FiClock, FiCalendar, FiCheckSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './SchedulePage.css';

const SchedulePage = () => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    
    // Add task form state
    const [taskText, setTaskText] = useState('');
    const [taskTime, setTaskTime] = useState('10:00');
    const [taskType, setTaskType] = useState('Interview'); // Interview, Review, Application

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.error('Please login to access the scheduler');
            navigate('/');
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Load tasks from localStorage
    useEffect(() => {
        const storedTasks = localStorage.getItem('scheduled_tasks');
        if (storedTasks) {
            setTasks(JSON.parse(storedTasks));
        } else {
            // Seed initial sample tasks matching the reference image layout
            const sampleTasks = [
                {
                    id: 1,
                    text: 'Mock Interview Practice with Peers',
                    time: '14:30',
                    date: new Date().toISOString().split('T')[0],
                    type: 'Interview',
                    completed: false
                },
                {
                    id: 2,
                    text: 'Apply to Frontend Developer at TechCorp',
                    time: '09:00',
                    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
                    type: 'Application',
                    completed: true
                },
                {
                    id: 3,
                    text: 'Incorporate AI suggestions into Resume V2',
                    time: '16:00',
                    date: new Date().toISOString().split('T')[0],
                    type: 'Review',
                    completed: false
                }
            ];
            setTasks(sampleTasks);
            localStorage.setItem('scheduled_tasks', JSON.stringify(sampleTasks));
            triggerGlobalUpdate();
        }
    }, []);

    const triggerGlobalUpdate = () => {
        // Dispatch window storage event so the right panel re-calculates progress
        window.dispatchEvent(new Event('storage-tasks-updated'));
    };

    // Calendar generation
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const startDay = new Date(year, month, 1).getDay();
        const numDays = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= numDays; i++) {
            days.push(i);
        }
        return days;
    };

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const changeMonth = (direction) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
        setCurrentDate(newDate);
    };

    const handleDayClick = (day) => {
        if (!day) return;
        const newSelected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(newSelected);
    };

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!taskText.trim()) return;

        const dateStr = selectedDate.toISOString().split('T')[0];
        const newTask = {
            id: Date.now(),
            text: taskText,
            time: taskTime,
            date: dateStr,
            type: taskType,
            completed: false
        };

        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        localStorage.setItem('scheduled_tasks', JSON.stringify(updatedTasks));
        triggerGlobalUpdate();
        
        setTaskText('');
        toast.success('Task scheduled successfully');
    };

    const handleToggleComplete = (taskId) => {
        const updated = tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        setTasks(updated);
        localStorage.setItem('scheduled_tasks', JSON.stringify(updated));
        triggerGlobalUpdate();
    };

    const handleDeleteTask = (taskId) => {
        const updated = tasks.filter(task => task.id !== taskId);
        setTasks(updated);
        localStorage.setItem('scheduled_tasks', JSON.stringify(updated));
        triggerGlobalUpdate();
        toast.success('Task removed');
    };

    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const filteredTasks = tasks.filter(task => task.date === selectedDateStr);
    
    // Sort tasks chronologically by time
    filteredTasks.sort((a, b) => a.time.localeCompare(b.time));

    const calendarDays = getDaysInMonth(currentDate);

    if (authLoading) return <LoadingSpinner />;
    if (!isAuthenticated) return null;

    return (
        <DashboardLayout>
            <div className="schedule-content animate-slide-up">
                {/* Header title */}
                <div className="schedule-header-row">
                    <h1 className="schedule-title">Interview & Job Schedule</h1>
                    <p className="schedule-subtitle">Manage submission milestones and mock interview preparation targets.</p>
                </div>

                <div className="schedule-main-grid">
                    {/* Interactive Calendar panel */}
                    <div className="schedule-card calendar-large hover-scale">
                        <div className="cal-large-header">
                            <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                            <div className="cal-controls">
                                <button onClick={() => changeMonth(-1)} className="btn-cal-control">&lt;</button>
                                <button onClick={() => changeMonth(1)} className="btn-cal-control">&gt;</button>
                            </div>
                        </div>

                        <div className="cal-large-grid">
                            {daysOfWeek.map((day, idx) => (
                                <div key={idx} className="cal-large-day-label">{day}</div>
                            ))}
                            {calendarDays.map((day, idx) => {
                                const isSelected = day && 
                                    selectedDate.getDate() === day && 
                                    selectedDate.getMonth() === currentDate.getMonth() && 
                                    selectedDate.getFullYear() === currentDate.getFullYear();
                                
                                const dayStr = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0] : '';
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

                    {/* Task Scheduler Form & View */}
                    <div className="schedule-details-panel">
                        {/* Selected Day Agenda */}
                        <div className="schedule-card agenda-card hover-scale">
                            <h3>Schedule for {selectedDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                            
                            {filteredTasks.length === 0 ? (
                                <div className="no-events-view">
                                    <FiCalendar className="no-events-icon" />
                                    <p>No events scheduled for this date</p>
                                </div>
                            ) : (
                                <div className="agenda-list">
                                    {filteredTasks.map((task) => (
                                        <div key={task.id} className={`agenda-item ${task.completed ? 'completed' : ''}`}>
                                            <div className="agenda-checkbox-wrapper">
                                                <input 
                                                    type="checkbox" 
                                                    checked={task.completed} 
                                                    onChange={() => handleToggleComplete(task.id)}
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
                                                onClick={() => handleDeleteTask(task.id)} 
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
