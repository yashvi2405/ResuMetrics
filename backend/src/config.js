require('dotenv').config();

const config = {
  // Server
  PORT: parseInt(process.env.PORT) || 8000,

  // JWT
  SECRET_KEY: process.env.SECRET_KEY || 'your-secret-key-here',
  ALGORITHM: 'HS256',
  ACCESS_TOKEN_EXPIRE_MINUTES: 30,

  // MongoDB
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
  MONGO_DB_NAME: process.env.MONGO_DB_NAME || 'resume_insight',

  // File upload
  UPLOAD_DIR: './uploads/resumes',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_EXTENSIONS: ['.pdf', '.docx'],

  // Scoring weights
  SKILL_WEIGHT: 0.35,
  EXPERIENCE_WEIGHT: 0.30,
  EDUCATION_WEIGHT: 0.20,
  FORMATTING_WEIGHT: 0.15,

  // External AI
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',

  // CORS
  CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS || '',
};

module.exports = config;
