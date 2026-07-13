const express = require('express');
const { getDB, getNextSequenceValue } = require('../db');
const { createExtractedDataDoc } = require('../models/ExtractedData');
const { createAnalysisResultDoc } = require('../models/AnalysisResult');
const { createFeedbackDoc } = require('../models/Feedback');
const authenticate = require('../middleware/auth');
const resumeParser = require('../services/resumeParser');
const scoringService = require('../services/scoringService');
const atsService = require('../services/atsService');

const router = express.Router();

// ─── POST /api/analysis/analyze/:resume_id ─────────────────────────────────────
router.post('/analyze/:resume_id', authenticate, async (req, res) => {
  try {
    const resumeId = parseInt(req.params.resume_id, 10);
    if (isNaN(resumeId)) {
      return res.status(400).json({ detail: 'Invalid resume ID' });
    }

    const db = getDB();

    // Verify resume ownership
    const resumeDoc = await db.collection('resumes').findOne({
      resume_id: resumeId,
      user_id: req.user.user_id,
    });
    if (!resumeDoc) {
      return res.status(404).json({ detail: 'Resume not found' });
    }

    // Extract text
    const resumeText = await resumeParser.extractText(resumeDoc.resume_path, resumeDoc.file_format);

    // Extract data
    const skills     = resumeParser.extractSkills(resumeText);
    const education  = resumeParser.extractEducation(resumeText);
    const experience = resumeParser.extractExperience(resumeText);
    const keywords   = resumeParser.extractKeywords(resumeText);

    // Save extracted data
    const dataId = await getNextSequenceValue('data_id');
    const extractedDataDoc = createExtractedDataDoc({
      data_id: dataId,
      resume_id: resumeId,
      skills: skills.join(', '),
      education_details: education,
      work_experience: experience,
      certifications: '',
      projects: '',
      extracted_keywords: keywords.slice(0, 15).join(', '),
    });
    await db.collection('extracted_data').insertOne(extractedDataDoc);

    // Calculate scores
    const keywordRelevanceScore = Math.min(keywords.length * 5, 100);
    const atsScore = atsService.calculateAtsScore(resumeText, keywords);
    const skillMatch = Math.min(skills.length * 10, 100);
    const resumeScore = scoringService.calculateResumeScore(
      skills, experience, education, atsScore, keywordRelevanceScore
    );

    // Save analysis result
    const resultId = await getNextSequenceValue('result_id');
    const analysisResultDoc = createAnalysisResultDoc({
      result_id: resultId,
      resume_id: resumeId,
      resume_score: resumeScore,
      skill_match_percentage: skillMatch,
      ats_compatibility_score: atsScore,
      keyword_relevance_score: keywordRelevanceScore,
      analysis_timestamp: new Date(),
    });
    await db.collection('analysis_results').insertOne(analysisResultDoc);

    // Generate feedback
    const resumeData = {
      skills,
      experience,
      education,
      ats_score: atsScore,
      formatting_score: atsService.checkFormatting(resumeText),
      keyword_score: keywordRelevanceScore,
    };
    const suggestions = scoringService.generateImprovementSuggestions(resumeData);

    // Save feedback
    const feedbackId = await getNextSequenceValue('feedback_id');
    const feedbackDoc = createFeedbackDoc({
      feedback_id: feedbackId,
      resume_id: resumeId,
      improvement_suggestions: suggestions.slice(0, 5).join('; '),
      formatting_suggestions: suggestions.length > 5 ? suggestions.slice(5, 7).join('; ') : '',
      skill_gap_details: 'Focus on adding in-demand skills relevant to your target role',
      recommendation_level:
        resumeScore < 70 ? 'High Priority' : resumeScore < 85 ? 'Medium Priority' : 'Low Priority',
    });
    await db.collection('feedbacks').insertOne(feedbackDoc);

    return res.json({
      resume_score: resumeScore,
      skill_match_percentage: skillMatch,
      ats_compatibility_score: atsScore,
      keyword_relevance_score: keywordRelevanceScore,
      skills_found: skills,
      improvement_suggestions: suggestions.slice(0, 5),
    });
  } catch (err) {
    console.error('Analyze error:', err);
    return res.status(500).json({ detail: `Analysis failed: ${err.message}` });
  }
});

// ─── GET /api/analysis/results/:resume_id ────────────────────────────────────
router.get('/results/:resume_id', authenticate, async (req, res) => {
  try {
    const resumeId = parseInt(req.params.resume_id, 10);
    if (isNaN(resumeId)) {
      return res.status(400).json({ detail: 'Invalid resume ID' });
    }

    const db = getDB();

    // Verify resume ownership
    const resumeDoc = await db.collection('resumes').findOne({
      resume_id: resumeId,
      user_id: req.user.user_id,
    });
    if (!resumeDoc) {
      return res.status(404).json({ detail: 'Resume not found' });
    }

    const analysisDoc  = await db.collection('analysis_results').findOne({ resume_id: resumeId });
    const extractedDoc = await db.collection('extracted_data').findOne({ resume_id: resumeId });
    const feedbackDoc  = await db.collection('feedbacks').findOne({ resume_id: resumeId });

    if (!analysisDoc) {
      return res.status(404).json({ detail: 'Analysis not found' });
    }

    return res.json({
      analysis: {
        resume_score:            analysisDoc.resume_score,
        skill_match_percentage:  analysisDoc.skill_match_percentage,
        ats_compatibility_score: analysisDoc.ats_compatibility_score,
        keyword_relevance_score: analysisDoc.keyword_relevance_score,
      },
      extracted_data: {
        skills:    extractedDoc ? extractedDoc.skills           : '',
        education: extractedDoc ? extractedDoc.education_details : '',
        experience:extractedDoc ? extractedDoc.work_experience   : '',
        keywords:  extractedDoc ? extractedDoc.extracted_keywords: '',
      },
      feedback: {
        improvement_suggestions: feedbackDoc ? feedbackDoc.improvement_suggestions : '',
        formatting_suggestions:  feedbackDoc ? feedbackDoc.formatting_suggestions  : '',
        recommendation_level:    feedbackDoc ? feedbackDoc.recommendation_level    : '',
      },
    });
  } catch (err) {
    console.error('Get results error:', err);
    return res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
