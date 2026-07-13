const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { getDB, getNextSequenceValue } = require('../db');
const { createResumeDoc } = require('../models/Resume');
const authenticate = require('../middleware/auth');
const config = require('../config');

const router = express.Router();

// ─── Multer (file upload) ─────────────────────────────────────────────────────

// Ensure upload directory exists
fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.UPLOAD_DIR),
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 15);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.user.user_id}_${timestamp}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (config.ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    // In multer 2.x passing an Error as first arg still works
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', `Invalid file format. Allowed formats: ${config.ALLOWED_EXTENSIONS.join(', ')}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.MAX_FILE_SIZE },
});

// Upload middleware wrapped to convert multer errors into JSON responses
function uploadSingle(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ detail: `File too large. Maximum size: ${config.MAX_FILE_SIZE / (1024 * 1024)}MB` });
      }
      return res.status(400).json({ detail: err.field || err.message });
    }
    return res.status(400).json({ detail: err.message });
  });
}

// ─── POST /api/resume/upload ──────────────────────────────────────────────────
router.post('/upload', authenticate, uploadSingle, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ detail: 'No file uploaded' });
  }

  try {
    const db = getDB();
    const file = req.file;
    const ext = path.extname(file.originalname).toLowerCase();

    const resumeId = await getNextSequenceValue('resume_id');
    const resumeDoc = createResumeDoc({
      resume_id: resumeId,
      user_id: req.user.user_id,
      resume_file_name: file.originalname,
      file_format: ext,
      file_size: file.size,
      upload_date: new Date(),
      resume_path: file.path,
    });

    await db.collection('resumes').insertOne(resumeDoc);

    return res.status(201).json({
      message: 'Resume uploaded successfully',
      resume_id: resumeId,
      file_name: file.originalname,
    });
  } catch (dbErr) {
    console.error('Resume upload DB error:', dbErr);
    return res.status(500).json({ detail: `Upload failed: ${dbErr.message}` });
  }
});

// ─── GET /api/resume/list ─────────────────────────────────────────────────────
router.get('/list', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const resumes = await db
      .collection('resumes')
      .find({ user_id: req.user.user_id })
      .toArray();

    return res.json(
      resumes.map((r) => ({
        resume_id: r.resume_id,
        file_name: r.resume_file_name,
        upload_date: r.upload_date,
        file_size: r.file_size,
      }))
    );
  } catch (err) {
    console.error('List resumes error:', err);
    return res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
