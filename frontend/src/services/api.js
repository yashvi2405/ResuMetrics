import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Request interceptor - always attach token from localStorage
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Request interceptor: Token attached to', config.url);
        } else {
          console.warn('Request interceptor: No token found for', config.url);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle 401 with token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        console.error('API Error:', error.response?.status, error.config?.url);

        // If 401 and we haven't already tried refreshing, attempt a refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshResponse = await this.api.post('/auth/refresh');
            const newToken = refreshResponse.data.access_token;

            if (newToken) {
              localStorage.setItem('token', newToken);
              this.api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed — clear auth state and redirect to login
            console.warn('Token refresh failed, logging out.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete this.api.defaults.headers.common['Authorization'];
            window.location.href = '/';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  // Test connection
  async testConnection() {
    try {
      const response = await this.api.get('/health'.replace('/api', '').replace(/\/api$/, '') || `${API_BASE_URL.replace('/api', '')}/health`);
      return { connected: true, data: response.data };
    } catch (error) {
      console.error('Backend connection failed:', error.message);
      return { connected: false, error: error.message };
    }
  }

  // Auth endpoints
  async register(name, email, password) {
    console.log('API: Making register request');
    const response = await this.api.post('/auth/register', { name, email, password });
    return response.data;
  }

  async login(email, password) {
    console.log('API.login called with:', { email });
    try {
      const response = await this.api.post('/auth/login', { email, password });
      console.log('API.login response:', response.status, response.data);
      return response.data;
    } catch (error) {
      console.error('API.login error:', error.response?.status, error.response?.data);
      throw error;
    }
  }

  async logout() {
    const response = await this.api.post('/auth/logout');
    return response.data;
  }

  async refreshToken() {
    const response = await this.api.post('/auth/refresh');
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async changePassword(oldPassword, newPassword) {
    const response = await this.api.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  }

  // Resume endpoints
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.api.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async getUserResumes() {
    const response = await this.api.get('/resume/list');
    return response.data;
  }

  // Analysis endpoints
  async analyzeResume(resumeId) {
    const response = await this.api.post(`/analysis/analyze/${resumeId}`);
    return response.data;
  }

  async getAnalysisResults(resumeId) {
    const response = await this.api.get(`/analysis/results/${resumeId}`);
    return response.data;
  }

  // Dashboard endpoints
  async getDashboardStats() {
    const response = await this.api.get('/dashboard/stats');
    return response.data;
  }

  async getRecentActivities(limit = 10) {
    const response = await this.api.get(`/dashboard/recent-activities?limit=${limit}`);
    return response.data;
  }

  async getPerformanceMetrics() {
    const response = await this.api.get('/dashboard/performance-metrics');
    return response.data;
  }

  async getSkillGaps() {
    const response = await this.api.get('/dashboard/skill-gaps');
    return response.data;
  }

  async deleteResume(resumeId) {
    const response = await this.api.delete(`/dashboard/resume/${resumeId}`);
    return response.data;
  }

  // ── Prep Arena endpoints ──────────────────────────────────────────────────

  /** Fetch active study plan + solved count from the DB. */
  async getPrepProgress() {
    const response = await this.api.get('/prep/progress');
    return response.data; // { plan_id, solved }
  }

  /** Persist active study plan + solved count to the DB. */
  async savePrepProgress(plan_id, solved) {
    const response = await this.api.post('/prep/progress', { plan_id, solved });
    return response.data;
  }

  /** Fetch all quiz scores for the current user as { "os_easy": 18, ... }. */
  async getQuizScores() {
    const response = await this.api.get('/prep/quiz-scores');
    return response.data;
  }

  /** Persist a single quiz result. */
  async saveQuizScore(subject, difficulty, score, total) {
    const response = await this.api.post('/prep/quiz-scores', { subject, difficulty, score, total });
    return response.data;
  }

  /**
   * Run the JD matcher using real resume skills stored in the DB.
   * @param {number} resumeId
   * @param {string} jobDescription  - raw paste of the job posting
   */
  async runJdMatch(resumeId, jobDescription) {
    const response = await this.api.post(`/prep/jd-match/${resumeId}`, {
      job_description: jobDescription,
    });
    return response.data; // { score, matched, missing, jd_keywords, resume_skills, suggestions }
  }

  // ── Groq AI Chat endpoints ────────────────────────────────────────────────

  /**
   * Check whether the backend has a Groq API key configured.
   * Returns { available: boolean }
   */
  async groqStatus() {
    const response = await this.api.get('/chat/status');
    return response.data;
  }

  /**
   * Send a message to the Groq-backed LLM through the backend proxy.
   * @param {string} systemPrompt  - Role/persona instructions
   * @param {Array}  messages      - [{ role: 'user'|'assistant', content: string }]
   * @param {number} temperature   - 0–1 (default 0.8)
   * @returns {string} The assistant's reply text
   */
  async groqChat(systemPrompt, messages, temperature = 0.8) {
    const response = await this.api.post('/chat', {
      system_prompt: systemPrompt,
      messages,
      temperature,
    });
    return response.data.reply;
  }

  // ── Schedule endpoints ────────────────────────────────────────────────────

  /** Get all tasks for the user. Pass a date string "YYYY-MM-DD" to filter by day. */
  async getScheduleTasks(date = null) {
    const params = date ? { date } : {};
    const response = await this.api.get('/schedule', { params });
    return response.data;
  }

  /** Create a new scheduled task. */
  async createScheduleTask(text, date, time, type) {
    const response = await this.api.post('/schedule', { text, date, time, type });
    return response.data;
  }

  /** Toggle the completed status of a task. */
  async toggleScheduleTask(taskId) {
    const response = await this.api.patch(`/schedule/${taskId}/toggle`);
    return response.data;
  }

  /** Delete a task. */
  async deleteScheduleTask(taskId) {
    const response = await this.api.delete(`/schedule/${taskId}`);
    return response.data;
  }

}




export default new ApiService();