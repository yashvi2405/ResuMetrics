const express = require('express');
const fs = require('fs');
const { getDB } = require('../db');
const authenticate = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/dashboard/stats ─────────────────────────────────────────────────
router.get('/stats', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.user_id;

    const userResumes = await db.collection('resumes').find({ user_id: userId }).toArray();
    const totalResumes = userResumes.length;
    const resumeIds = userResumes.map((r) => r.resume_id);

    if (resumeIds.length === 0) {
      return res.json({
        total_resumes: 0,
        average_score: 0,
        recent_analyses: 0,
        best_resume: null,
        score_trends: [],
        top_skills: [],
      });
    }

    // Average score
    const aggResult = await db.collection('analysis_results').aggregate([
      { $match: { resume_id: { $in: resumeIds } } },
      { $group: { _id: null, avg_score: { $avg: '$resume_score' } } },
    ]).toArray();
    const avgScore = aggResult.length ? aggResult[0].avg_score : 0;

    // Recent analyses (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentAnalyses = await db.collection('analysis_results').countDocuments({
      resume_id: { $in: resumeIds },
      analysis_timestamp: { $gte: thirtyDaysAgo },
    });

    // Best performing resume
    const bestAnalysisList = await db.collection('analysis_results')
      .find({ resume_id: { $in: resumeIds } })
      .sort({ resume_score: -1 })
      .limit(1)
      .toArray();

    let bestResume = null;
    if (bestAnalysisList.length) {
      const best = bestAnalysisList[0];
      const bestRes = userResumes.find((r) => r.resume_id === best.resume_id);
      if (bestRes) {
        bestResume = {
          id: best.resume_id,
          name: bestRes.resume_file_name,
          score: Math.round(best.resume_score * 100) / 100,
        };
      }
    }

    // Score trends
    const trends = await db.collection('analysis_results')
      .find({ resume_id: { $in: resumeIds } })
      .sort({ analysis_timestamp: 1 })
      .toArray();

    const scoreTrends = [];
    for (const t of trends) {
      const res = userResumes.find((r) => r.resume_id === t.resume_id);
      if (res) {
        scoreTrends.push({
          date: t.analysis_timestamp.toISOString(),
          score: Math.round(t.resume_score * 100) / 100,
          resume_name: res.resume_file_name,
        });
      }
    }

    // Skill distribution
    const extractedDocs = await db.collection('extracted_data')
      .find({ resume_id: { $in: resumeIds } })
      .toArray();

    const skillCounts = {};
    for (const doc of extractedDocs) {
      if (doc.skills) {
        doc.skills.split(', ').forEach((skill) => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      }
    }
    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    return res.json({
      total_resumes: totalResumes,
      average_score: avgScore ? Math.round(avgScore * 100) / 100 : 0,
      recent_analyses: recentAnalyses,
      best_resume: bestResume,
      score_trends: scoreTrends,
      top_skills: topSkills,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return res.status(500).json({ detail: err.message });
  }
});

// ─── GET /api/dashboard/recent-activities ─────────────────────────────────────
router.get('/recent-activities', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const db = getDB();
    const userId = req.user.user_id;

    const activities = [];

    // Recent uploads
    const recentUploads = await db.collection('resumes')
      .find({ user_id: userId })
      .sort({ upload_date: -1 })
      .limit(limit)
      .toArray();

    for (const upload of recentUploads) {
      activities.push({
        type: 'upload',
        resume_id: upload.resume_id,
        resume_name: upload.resume_file_name,
        timestamp: upload.upload_date.toISOString(),
        message: `Uploaded resume: ${upload.resume_file_name}`,
      });
    }

    // Recent analyses
    const allUserResumes = await db.collection('resumes').find({ user_id: userId }).toArray();
    const allResumeIds = allUserResumes.map((r) => r.resume_id);

    if (allResumeIds.length) {
      const recentAnalyses = await db.collection('analysis_results')
        .find({ resume_id: { $in: allResumeIds } })
        .sort({ analysis_timestamp: -1 })
        .limit(limit)
        .toArray();

      for (const analysis of recentAnalyses) {
        const resume = allUserResumes.find((r) => r.resume_id === analysis.resume_id);
        if (resume) {
          const score = Math.round(analysis.resume_score * 100) / 100;
          activities.push({
            type: 'analysis',
            resume_id: analysis.resume_id,
            resume_name: resume.resume_file_name,
            score,
            timestamp: analysis.analysis_timestamp.toISOString(),
            message: `Analyzed resume: ${resume.resume_file_name} (Score: ${score})`,
          });
        }
      }
    }

    activities.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    return res.json(activities.slice(0, limit));
  } catch (err) {
    console.error('Recent activities error:', err);
    return res.status(500).json({ detail: err.message });
  }
});

// ─── GET /api/dashboard/performance-metrics ───────────────────────────────────
router.get('/performance-metrics', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.user_id;

    const userResumes = await db.collection('resumes').find({ user_id: userId }).toArray();
    const resumeIds = userResumes.map((r) => r.resume_id);

    const empty = {
      average_scores: { overall: 0, ats: 0, skill_match: 0, keyword: 0 },
      best_score: 0,
      worst_score: 0,
      improvement_rate: 0,
      total_analyses: 0,
    };

    if (!resumeIds.length) return res.json(empty);

    const analyses = await db.collection('analysis_results')
      .find({ resume_id: { $in: resumeIds } })
      .toArray();

    if (!analyses.length) return res.json(empty);

    const avgOverall  = analyses.reduce((s, a) => s + a.resume_score,            0) / analyses.length;
    const avgAts      = analyses.reduce((s, a) => s + a.ats_compatibility_score,  0) / analyses.length;
    const avgSkill    = analyses.reduce((s, a) => s + a.skill_match_percentage,   0) / analyses.length;
    const avgKeyword  = analyses.reduce((s, a) => s + a.keyword_relevance_score,  0) / analyses.length;

    const bestScore  = Math.max(...analyses.map((a) => a.resume_score));
    const worstScore = Math.min(...analyses.map((a) => a.resume_score));

    let improvementRate = 0;
    if (analyses.length > 1) {
      const sorted = [...analyses].sort((a, b) =>
        new Date(a.analysis_timestamp) - new Date(b.analysis_timestamp)
      );
      const first = sorted[0].resume_score;
      const last  = sorted[sorted.length - 1].resume_score;
      if (first > 0) improvementRate = ((last - first) / first) * 100;
    }

    const round = (n) => Math.round(n * 100) / 100;

    return res.json({
      average_scores: {
        overall:     round(avgOverall),
        ats:         round(avgAts),
        skill_match: round(avgSkill),
        keyword:     round(avgKeyword),
      },
      best_score:       round(bestScore),
      worst_score:      round(worstScore),
      improvement_rate: round(improvementRate),
      total_analyses:   analyses.length,
    });
  } catch (err) {
    console.error('Performance metrics error:', err);
    return res.status(500).json({ detail: err.message });
  }
});

// ─── GET /api/dashboard/skill-gaps ────────────────────────────────────────────
router.get('/skill-gaps', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.user_id;

    const userResumes = await db.collection('resumes').find({ user_id: userId }).toArray();
    const resumeIds = userResumes.map((r) => r.resume_id);

    const emptyResponse = {
      user_skills: [],
      missing_skills: { technical: [], soft: [], data: [] },
      recommendations: [],
      skill_coverage: { technical: 0, soft: 0, data: 0 },
    };

    if (!resumeIds.length) return res.json(emptyResponse);

    const extractedDocs = await db.collection('extracted_data')
      .find({ resume_id: { $in: resumeIds } })
      .toArray();

    const industrySkills = {
      technical: ['python', 'java', 'sql', 'javascript', 'react', 'node.js', 'aws', 'docker'],
      soft:      ['leadership', 'communication', 'teamwork', 'problem solving', 'project management'],
      data:      ['machine learning', 'data analysis', 'statistics', 'pandas', 'tensorflow'],
    };

    const userSkills = new Set();
    for (const doc of extractedDocs) {
      if (doc.skills) {
        doc.skills.split(', ').forEach((s) => userSkills.add(s.toLowerCase().trim()));
      }
    }

    const missingSkills = {
      technical: industrySkills.technical.filter((s) => !userSkills.has(s)),
      soft:      industrySkills.soft.filter((s) => !userSkills.has(s)),
      data:      industrySkills.data.filter((s) => !userSkills.has(s)),
    };

    const recommendations = [];
    if (missingSkills.technical.length)
      recommendations.push(`Add technical skills: ${missingSkills.technical.slice(0, 5).join(', ')}`);
    if (missingSkills.soft.length)
      recommendations.push(`Highlight soft skills: ${missingSkills.soft.slice(0, 3).join(', ')}`);
    if (missingSkills.data.length)
      recommendations.push(`Include data skills: ${missingSkills.data.slice(0, 3).join(', ')}`);

    const pct = (list) =>
      (list.filter((s) => userSkills.has(s)).length / list.length) * 100;

    return res.json({
      user_skills: [...userSkills].slice(0, 20),
      missing_skills: missingSkills,
      recommendations,
      skill_coverage: {
        technical: pct(industrySkills.technical),
        soft:      pct(industrySkills.soft),
        data:      pct(industrySkills.data),
      },
    });
  } catch (err) {
    console.error('Skill gaps error:', err);
    return res.status(500).json({ detail: err.message });
  }
});

// ─── DELETE /api/dashboard/resume/:resume_id ──────────────────────────────────
router.delete('/resume/:resume_id', authenticate, async (req, res) => {
  try {
    const resumeId = parseInt(req.params.resume_id, 10);
    if (isNaN(resumeId)) {
      return res.status(400).json({ detail: 'Invalid resume ID' });
    }

    const db = getDB();

    const resume = await db.collection('resumes').findOne({
      resume_id: resumeId,
      user_id: req.user.user_id,
    });
    if (!resume) {
      return res.status(404).json({ detail: 'Resume not found' });
    }

    // Remove file from disk (best-effort)
    try {
      if (resume.resume_path && fs.existsSync(resume.resume_path)) {
        fs.unlinkSync(resume.resume_path);
      }
    } catch (fileErr) {
      console.warn('Could not delete file from disk:', fileErr.message);
    }

    // Delete all associated data
    await db.collection('extracted_data').deleteMany({ resume_id: resumeId });
    await db.collection('analysis_results').deleteMany({ resume_id: resumeId });
    await db.collection('feedbacks').deleteMany({ resume_id: resumeId });
    await db.collection('resumes').deleteOne({ resume_id: resumeId });

    return res.json({ message: 'Resume deleted successfully' });
  } catch (err) {
    console.error('Delete resume error:', err);
    return res.status(500).json({ detail: err.message });
  }
});

module.exports = router;
