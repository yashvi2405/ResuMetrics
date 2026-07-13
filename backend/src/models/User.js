/**
 * User document schema (MongoDB native driver - no ODM).
 *
 * Collection: users
 * Fields:
 *   user_id             {Number}   - Auto-incremented integer PK
 *   name                {String}   - Display name
 *   email               {String}   - Unique e-mail address
 *   password            {String}   - bcrypt hash
 *   role                {String}   - "user" | "admin"
 *   date_of_registration {Date}    - UTC timestamp of account creation
 *   last_login_time     {Date|null} - UTC timestamp of last successful login
 *
 * Indexes (created in db.js):
 *   { email: 1 }    unique
 *   { user_id: 1 }  unique
 */

/**
 * Build a valid user document ready to insert.
 * @param {object} data
 * @returns {object}
 */
function createUserDoc(data) {
  return {
    user_id: data.user_id,
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role || 'user',
    date_of_registration: data.date_of_registration || new Date(),
    last_login_time: data.last_login_time || null,
  };
}

/**
 * Strip the MongoDB _id and password before sending to client.
 * @param {object} doc
 * @returns {object}
 */
function sanitiseUser(doc) {
  const { _id, password, ...rest } = doc;
  return rest;
}

module.exports = { createUserDoc, sanitiseUser };
