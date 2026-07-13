/**
 * PrepProgress document schema (MongoDB native driver).
 *
 * Collection: prep_progress
 * Stores the user's active coding study plan and how many problems
 * they've solved so far. One document per user.
 *
 * Fields:
 *   user_id    {Number}  - FK → users.user_id
 *   plan_id    {String}  - Active plan key (e.g. "leetcode-150")
 *   solved     {Number}  - Problems solved in the active plan
 *   updated_at {Date}    - Last update timestamp
 */
function createPrepProgressDoc(data) {
  return {
    user_id:    data.user_id,
    plan_id:    data.plan_id    || 'leetcode-150',
    solved:     data.solved     ?? 0,
    updated_at: new Date(),
  };
}

module.exports = { createPrepProgressDoc };
