/**
 * Resume document schema (MongoDB native driver - no ODM).
 *
 * Collection: resumes
 * Fields:
 *   resume_id        {Number}  - Auto-incremented integer PK
 *   user_id          {Number}  - FK → users.user_id
 *   resume_file_name {String}  - Original filename
 *   file_format      {String}  - ".pdf" | ".docx"
 *   file_size        {Number}  - Bytes
 *   upload_date      {Date}    - UTC upload timestamp
 *   resume_path      {String}  - Absolute path on disk
 *
 * Indexes (created in db.js):
 *   { resume_id: 1 }  unique
 */

/**
 * Build a valid resume document ready to insert.
 * @param {object} data
 * @returns {object}
 */
function createResumeDoc(data) {
  return {
    resume_id: data.resume_id,
    user_id: data.user_id,
    resume_file_name: data.resume_file_name,
    file_format: data.file_format,
    file_size: data.file_size,
    upload_date: data.upload_date || new Date(),
    resume_path: data.resume_path,
  };
}

module.exports = { createResumeDoc };
