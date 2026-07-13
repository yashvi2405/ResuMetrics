const { MongoClient } = require('mongodb');
const config = require('./config');

let client;
let db;

/**
 * Connect to MongoDB and return the database instance.
 */
async function connectDB() {
  if (db) return db;

  client = new MongoClient(config.MONGO_URL);
  await client.connect();
  db = client.db(config.MONGO_DB_NAME);

  // Create indexes (equivalent to FastAPI startup event)
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ user_id: 1 }, { unique: true });
  await db.collection('resumes').createIndex({ resume_id: 1 }, { unique: true });
  await db.collection('analysis_results').createIndex({ resume_id: 1 });
  await db.collection('extracted_data').createIndex({ resume_id: 1 });
  await db.collection('feedbacks').createIndex({ resume_id: 1 });
  // Prep Arena — one progress doc per user, one quiz score per user+subject+difficulty
  await db.collection('prep_progress').createIndex({ user_id: 1 }, { unique: true });
  await db.collection('quiz_scores').createIndex({ user_id: 1, subject: 1, difficulty: 1 }, { unique: true });
  // Schedule — index by user and date for fast per-day queries
  await db.collection('schedule_tasks').createIndex({ user_id: 1, date: 1 });
  await db.collection('schedule_tasks').createIndex({ task_id: 1 }, { unique: true });


  console.log(`✅ Connected to MongoDB: ${config.MONGO_DB_NAME}`);
  return db;
}

/**
 * Return the active database instance (must call connectDB first).
 */
function getDB() {
  if (!db) throw new Error('Database not initialised. Call connectDB() first.');
  return db;
}

/**
 * Auto-increment counter — same logic as Python's get_next_sequence_value().
 */
async function getNextSequenceValue(sequenceName) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  return result.sequence_value;
}

/**
 * Ping the MongoDB server — used for health checks.
 */
async function pingDB() {
  await client.db('admin').command({ ping: 1 });
}

module.exports = { connectDB, getDB, getNextSequenceValue, pingDB };
