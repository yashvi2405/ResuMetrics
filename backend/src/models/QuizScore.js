/**
 * QuizScore document schema (MongoDB native driver).
 *
 * Collection: quiz_scores
 * One document per (user_id, subject, difficulty) combination.
 * Upserted on every quiz submission so only the latest score is kept.
 *
 * Fields:
 *   user_id    {Number}  - FK → users.user_id
 *   subject    {String}  - e.g. "os", "dbms", "cn", "logical", "maths", "cs-final"
 *   difficulty {String}  - "easy" | "medium" | "hard" | "final"
 *   score      {Number}  - Correct answers
 *   total      {Number}  - Total questions in that quiz
 *   updated_at {Date}    - Last submission timestamp
 */
function createQuizScoreDoc(data) {
  return {
    user_id:    data.user_id,
    subject:    data.subject,
    difficulty: data.difficulty,
    score:      data.score,
    total:      data.total,
    updated_at: new Date(),
  };
}

module.exports = { createQuizScoreDoc };
