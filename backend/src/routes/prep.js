const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDB } = require('../db');
const { createPrepProgressDoc } = require('../models/PrepProgress');
const { createQuizScoreDoc } = require('../models/QuizScore');
const authenticate = require('../middleware/auth');

const router = express.Router();

// ── Supplementary tech keyword pool ──────────────────────────────────────────
const TECH_KEYWORD_POOL = [
  'python', 'javascript', 'java', 'sql', 'react', 'node', 'node.js', 'django',
  'mongodb', 'postgresql', 'mysql', 'docker', 'kubernetes', 'aws', 'azure',
  'git', 'html', 'css', 'c++', 'rust', 'typescript', 'machine learning',
  'data science', 'agile', 'scrum', 'redis', 'graphql', 'rest api', 'linux',
  'system design', 'operating systems', 'dbms', 'computer networks', 'flask',
  'spring', 'terraform', 'ci/cd', 'angular', 'vue', 'express', 'fastapi',
  'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit', 'hadoop', 'spark',
  'kafka', 'jenkins', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence',
];

// ─── GET /api/prep/progress ───────────────────────────────────────────────────
router.get('/progress', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const doc = await db.collection('prep_progress').findOne({ user_id: req.user.user_id });
    return res.json(doc
      ? { plan_id: doc.plan_id, solved: doc.solved }
      : { plan_id: 'leetcode-150', solved: 0 }
    );
  } catch (err) {
    console.error('GET prep/progress error:', err);
    return res.status(500).json({ detail: err.message });
  }
});

// ─── POST /api/prep/progress ──────────────────────────────────────────────────
router.post(
  '/progress',
  authenticate,
  [
    body('plan_id').notEmpty().withMessage('plan_id is required'),
    body('solved').isInt({ min: 0 }).withMessage('solved must be a non-negative integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ detail: errors.array()[0].msg });

    try {
      const { plan_id, solved } = req.body;
      const db = getDB();

      await db.collection('prep_progress').updateOne(
        { user_id: req.user.user_id },
        { $set: createPrepProgressDoc({ user_id: req.user.user_id, plan_id, solved }) },
        { upsert: true }
      );

      return res.json({ success: true, plan_id, solved });
    } catch (err) {
      console.error('POST prep/progress error:', err);
      return res.status(500).json({ detail: err.message });
    }
  }
);

// ─── GET /api/prep/quiz-scores ────────────────────────────────────────────────
router.get('/quiz-scores', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const docs = await db
      .collection('quiz_scores')
      .find({ user_id: req.user.user_id })
      .toArray();

    const result = {};
    for (const doc of docs) {
      result[`${doc.subject}_${doc.difficulty}`] = doc.score;
    }
    return res.json(result);
  } catch (err) {
    console.error('GET quiz-scores error:', err);
    return res.status(500).json({ detail: err.message });
  }
});

// ─── POST /api/prep/quiz-scores ───────────────────────────────────────────────
router.post(
  '/quiz-scores',
  authenticate,
  [
    body('subject').notEmpty().withMessage('subject is required'),
    body('difficulty').notEmpty().withMessage('difficulty is required'),
    body('score').isInt({ min: 0 }).withMessage('score must be >= 0'),
    body('total').isInt({ min: 1 }).withMessage('total must be >= 1'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ detail: errors.array()[0].msg });

    try {
      const { subject, difficulty, score, total } = req.body;
      const db = getDB();

      await db.collection('quiz_scores').updateOne(
        { user_id: req.user.user_id, subject, difficulty },
        { $set: createQuizScoreDoc({ user_id: req.user.user_id, subject, difficulty, score, total }) },
        { upsert: true }
      );

      return res.json({ success: true, key: `${subject}_${difficulty}`, score, total });
    } catch (err) {
      console.error('POST quiz-scores error:', err);
      return res.status(500).json({ detail: err.message });
    }
  }
);

// ─── POST /api/prep/jd-match/:resume_id ──────────────────────────────────────
// Smart bi-directional JD matcher:
//   1. Extracts multi-word tech phrases from the JD
//   2. Checks hardcoded pool keywords against the JD
//   3. Finds resume skills/keywords that also appear in the JD text
//   4. Gives a meaningful score even for generic JDs
router.post(
  '/jd-match/:resume_id',
  authenticate,
  [body('job_description').notEmpty().withMessage('job_description is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ detail: errors.array()[0].msg });

    try {
      const resumeId = parseInt(req.params.resume_id, 10);
      if (isNaN(resumeId)) return res.status(400).json({ detail: 'Invalid resume ID' });

      const { job_description } = req.body;
      const db = getDB();

      // Verify resume belongs to user
      const resume = await db.collection('resumes').findOne({
        resume_id: resumeId,
        user_id: req.user.user_id,
      });
      if (!resume) return res.status(404).json({ detail: 'Resume not found' });

      // Get extracted data from DB
      const extractedDoc = await db.collection('extracted_data').findOne({ resume_id: resumeId });
      if (!extractedDoc) {
        return res.status(404).json({ detail: 'Resume has not been analyzed yet. Run analysis first.' });
      }

      // ── Resume signal: skills + keywords, deduped ─────────────────────────
      const resumeSkills = extractedDoc.skills
        ? extractedDoc.skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
        : [];
      const resumeKeywords = extractedDoc.extracted_keywords
        ? extractedDoc.extracted_keywords.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
        : [];
      const allResumeTerms = [...new Set([...resumeSkills, ...resumeKeywords])];

      const jdLower = job_description.toLowerCase();

      // ── Multi-word tech phrases to scan for in the JD ────────────────────
      const MULTI_WORD_PHRASES = [
        'machine learning', 'deep learning', 'data science', 'natural language processing',
        'computer vision', 'system design', 'object oriented', 'data structures',
        'operating systems', 'computer networks', 'full stack', 'front end', 'back end',
        'rest api', 'continuous integration', 'version control', 'agile methodologies',
        'cloud computing', 'big data', 'artificial intelligence', 'data analysis',
        'data engineering', 'ci/cd', 'software development', 'web development',
        'mobile development', 'problem solving', 'communication skills',
      ];
      const foundPhrases = MULTI_WORD_PHRASES.filter(p => jdLower.includes(p));

      // Pool keywords found in JD
      const poolHits = TECH_KEYWORD_POOL.filter(kw => jdLower.includes(kw));

      // Resume terms that also appear verbatim in the JD
      const jdTermsFromResume = allResumeTerms.filter(t => t.length >= 3 && jdLower.includes(t));

      // Union of all JD technical signals
      const allJdTerms = [...new Set([...poolHits, ...foundPhrases, ...jdTermsFromResume])];

      // ── Matched: resume terms that overlap with JD terms ──────────────────
      const matched = allResumeTerms.filter(rt =>
        allJdTerms.some(jt => jt.includes(rt) || rt.includes(jt))
      );

      // Missing: pool/phrase JD terms not covered by resume
      const poolAndPhraseMissing = [...new Set([...poolHits, ...foundPhrases])].filter(jt =>
        !allResumeTerms.some(rt => rt.includes(jt) || jt.includes(rt))
      );

      // ── Score ─────────────────────────────────────────────────────────────
      let score;
      if (allJdTerms.length === 0) {
        // Generic JD with no detectable tech keywords — use resume richness
        score = Math.min(40 + allResumeTerms.length * 4, 75);
      } else {
        const matchRatio = matched.length / Math.max(allJdTerms.length, 1);
        score = Math.min(Math.round(matchRatio * 65) + 30, 98);
      }

      // ── Suggestions ───────────────────────────────────────────────────────
      const suggestions = [];

      if (allJdTerms.length === 0) {
        suggestions.push(
          'This JD uses generic language without specific tech keywords. Make sure your resume explicitly lists tools and technologies (e.g. Python, React, SQL) so ATS systems can match it.'
        );
      }
      if (poolAndPhraseMissing.some(k => ['machine learning', 'deep learning', 'artificial intelligence', 'data science'].includes(k))) {
        suggestions.push('Add ML/AI projects or coursework (TensorFlow, PyTorch, scikit-learn) to meet the AI/ML requirements.');
      }
      if (poolAndPhraseMissing.some(k => ['python', 'java', 'c++', 'javascript', 'typescript'].includes(k))) {
        suggestions.push('Explicitly list programming languages — the JD expects clear language proficiency.');
      }
      if (poolAndPhraseMissing.some(k => ['system design', 'docker', 'kubernetes', 'aws', 'azure', 'cloud computing'].includes(k))) {
        suggestions.push('Highlight cloud or system design experience (AWS, GCP, Docker, Kubernetes).');
      }
      if (poolAndPhraseMissing.some(k => ['sql', 'dbms', 'postgresql', 'mongodb', 'data analysis', 'data engineering'].includes(k))) {
        suggestions.push('Include database or data handling experience — mention specific tools and query optimisation.');
      }
      if ((jdLower.includes('agile') || jdLower.includes('scrum')) &&
          !allResumeTerms.some(t => ['agile', 'scrum', 'jira', 'sprint'].includes(t))) {
        suggestions.push('Add Agile/Scrum experience — the JD specifically calls for it.');
      }
      if (matched.length > 0 && poolAndPhraseMissing.length === 0 && suggestions.length === 0) {
        suggestions.push('Great alignment! Strengthen impact with quantified achievements (e.g. "Reduced latency by 35%").');
      }
      if (suggestions.length === 0) {
        suggestions.push('Tailor your resume summary to mirror the exact language in this job posting to improve ATS ranking.');
      }

      return res.json({
        score,
        matched,
        missing:          poolAndPhraseMissing,
        jd_keywords:      allJdTerms,
        resume_skills:    allResumeTerms,
        suggestions,
        no_tech_keywords: allJdTerms.length === 0,
      });
    } catch (err) {
      console.error('JD match error:', err);
      return res.status(500).json({ detail: err.message });
    }
  }
);

module.exports = router;
