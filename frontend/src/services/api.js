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

    // Response interceptor - REMOVED auto logout on 401
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // ❌ REMOVED: Do NOT auto-wipe localStorage or redirect here
        // Let each API call handle 401 errors individually
        console.error('API Error:', error.response?.status, error.config?.url);
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
      const response = await fetch('http://localhost:8000/health');
      const data = await response.json();
      console.log('Backend connection successful:', data);
      return { connected: true, data };
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

  /**
   * Proxy Groq chat completion through the FastAPI backend.
   * The user's Groq API key is forwarded per-request and is NEVER stored server-side.
   * All actual calls to api.groq.com happen exclusively on the backend.
   *
   * @param {string} apiKey       - User's Groq API key (read from localStorage)
   * @param {string} systemPrompt - System prompt for the AI model
   * @param {Array}  messages     - Conversation history [{role: 'user'|'assistant', content: string}]
   * @param {number} temperature  - Sampling temperature (default 0.7)
   * @returns {Promise<string>}   - AI reply text
   */
  async groqChat(systemPrompt, messages, temperature = 0.7) {
    const response = await this.api.post('/chat/groq', {
      system_prompt: systemPrompt,
      messages,
      temperature,
    });
    return response.data.reply;
  }
}

export default new ApiService();