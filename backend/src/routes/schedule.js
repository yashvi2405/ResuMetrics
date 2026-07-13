const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { getDB, getNextSequenceValue } = require('../db');
const { createTaskDoc } = require('../models/ScheduleTask');
const authenticate = require('../middleware/auth');

const router = express.Router();

const VALID_TYPES = ['Interview', 'Review', 'Application'];

// ─── GET /api/schedule ────────────────────────────────────────────────────────
// Returns all tasks for the authenticated user.
// Optional query param: ?date=YYYY-MM-DD  filters to a single day
router.get('/', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const filter = { user_id: req.user.user_id };
    if (req.query.date) filter.date = req.query.date;

    const tasks = await db
      .collection('schedule_tasks')
      .find(filter)
      .sort({ date: 1, time: 1 })
      .toArray();

    return res.json(tasks);
  } catch (err) {
    console.error('GET schedule error:', err);
    return res.status(500).json({ detail: err.message });
  }
});

// ─── POST /api/schedule ───────────────────────────────────────────────────────
// Create a new task.
router.post(
  '/',
  authenticate,
  [
    body('text').notEmpty().withMessage('text is required'),
    body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be YYYY-MM-DD'),
    body('time').matches(/^\d{2}:\d{2}$/).withMessage('time must be HH:MM'),
    body('type').optional().isIn(VALID_TYPES).withMessage(`type must be one of: ${VALID_TYPES.join(', ')}`),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ detail: errors.array()[0].msg });

    try {
      const { text, date, time, type = 'Interview' } = req.body;
      const db = getDB();

      const task_id = await getNextSequenceValue('task_id');
      const doc = createTaskDoc({
        task_id,
        user_id: req.user.user_id,
        text,
        date,
        time,
        type,
        completed: false,
      });

      await db.collection('schedule_tasks').insertOne(doc);
      return res.status(201).json(doc);
    } catch (err) {
      console.error('POST schedule error:', err);
      return res.status(500).json({ detail: err.message });
    }
  }
);

// ─── PATCH /api/schedule/:task_id/toggle ─────────────────────────────────────
// Toggle the completed status of a task.
router.patch(
  '/:task_id/toggle',
  authenticate,
  [param('task_id').isInt().withMessage('task_id must be an integer')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ detail: errors.array()[0].msg });

    try {
      const taskId = parseInt(req.params.task_id, 10);
      const db = getDB();

      const task = await db.collection('schedule_tasks').findOne({
        task_id: taskId,
        user_id: req.user.user_id,
      });
      if (!task) return res.status(404).json({ detail: 'Task not found' });

      const newCompleted = !task.completed;
      await db.collection('schedule_tasks').updateOne(
        { task_id: taskId },
        { $set: { completed: newCompleted, updated_at: new Date() } }
      );

      return res.json({ task_id: taskId, completed: newCompleted });
    } catch (err) {
      console.error('PATCH toggle error:', err);
      return res.status(500).json({ detail: err.message });
    }
  }
);

// ─── DELETE /api/schedule/:task_id ───────────────────────────────────────────
// Delete a task (must belong to the authenticated user).
router.delete(
  '/:task_id',
  authenticate,
  [param('task_id').isInt().withMessage('task_id must be an integer')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ detail: errors.array()[0].msg });

    try {
      const taskId = parseInt(req.params.task_id, 10);
      const db = getDB();

      const result = await db.collection('schedule_tasks').deleteOne({
        task_id: taskId,
        user_id: req.user.user_id,
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ detail: 'Task not found' });
      }

      return res.json({ success: true, task_id: taskId });
    } catch (err) {
      console.error('DELETE schedule error:', err);
      return res.status(500).json({ detail: err.message });
    }
  }
);

module.exports = router;
