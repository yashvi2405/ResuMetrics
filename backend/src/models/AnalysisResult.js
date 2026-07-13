/**
 * AnalysisResult document schema (MongoDB native driver - no ODM).
 *
 * Collection: analysis_results
 * Fields:
 *   result_id               {Number}  - Auto-incremented integer PK
 *   resume_id               {Number}  - FK → resumes.resume_id
 *   resume_score            {Number}  - Overall score 0-100
 *   skill_match_percentage  {Number}  - Skill match score 0-100
 *   ats_compatibility_score {Number}  - ATS score 0-100
 *   keyword_relevance_score {Number}  - Keyword relevance score 0-100
 *   analysis_timestamp      {Date}    - UTC time of analysis
 *
 * Indexes (created in db.js):
 *   { resume_id: 1 }
 */

/**
 * Build a valid analysis_results document ready to insert.
 * @param {object} data
 * @returns {object}
 */
function createAnalysisResultDoc(data) {
  return {
    result_id: data.result_id,
    resume_id: data.resume_id,
    resume_score: data.resume_score,
    skill_match_percentage: data.skill_match_percentage,
    ats_compatibility_score: data.ats_compatibility_score,
    keyword_relevance_score: data.keyword_relevance_score,
    analysis_timestamp: data.analysis_timestamp || new Date(),
  };
}

module.exports = { createAnalysisResultDoc };
