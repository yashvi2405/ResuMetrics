/**
 * ExtractedData document schema (MongoDB native driver - no ODM).
 *
 * Collection: extracted_data
 * Fields:
 *   data_id             {Number}  - Auto-incremented integer PK
 *   resume_id           {Number}  - FK → resumes.resume_id
 *   skills              {String}  - Comma-separated skill list
 *   education_details   {String}  - Extracted education text
 *   work_experience     {String}  - Extracted experience text
 *   certifications      {String}  - Extracted certifications (may be empty)
 *   projects            {String}  - Extracted projects (may be empty)
 *   extracted_keywords  {String}  - Comma-separated top keywords
 *
 * Indexes (created in db.js):
 *   { resume_id: 1 }
 */

/**
 * Build a valid extracted_data document ready to insert.
 * @param {object} data
 * @returns {object}
 */
function createExtractedDataDoc(data) {
  return {
    data_id: data.data_id,
    resume_id: data.resume_id,
    skills: data.skills || '',
    education_details: data.education_details || '',
    work_experience: data.work_experience || '',
    certifications: data.certifications || '',
    projects: data.projects || '',
    extracted_keywords: data.extracted_keywords || '',
  };
}

module.exports = { createExtractedDataDoc };
