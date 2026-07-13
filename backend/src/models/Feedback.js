/**
 * Feedback document schema (MongoDB native driver - no ODM).
 *
 * Collection: feedbacks
 * Fields:
 *   feedback_id              {Number}  - Auto-incremented integer PK
 *   resume_id                {Number}  - FK → resumes.resume_id
 *   improvement_suggestions  {String}  - Semi-colon separated suggestions
 *   formatting_suggestions   {String}  - Semi-colon separated formatting tips
 *   skill_gap_details        {String}  - Textual skill gap description
 *   recommendation_level     {String}  - "High Priority" | "Medium Priority" | "Low Priority"
 *
 * Indexes (created in db.js):
 *   { resume_id: 1 }
 */

/**
 * Build a valid feedbacks document ready to insert.
 * @param {object} data
 * @returns {object}
 */
function createFeedbackDoc(data) {
  return {
    feedback_id: data.feedback_id,
    resume_id: data.resume_id,
    improvement_suggestions: data.improvement_suggestions || '',
    formatting_suggestions: data.formatting_suggestions || '',
    skill_gap_details: data.skill_gap_details || '',
    recommendation_level: data.recommendation_level || 'Medium Priority',
  };
}

module.exports = { createFeedbackDoc };
