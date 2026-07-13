/**
 * ScheduleTask document schema (MongoDB native driver).
 *
 * Collection: schedule_tasks
 * One document per task. Each user can have many tasks.
 *
 * Fields:
 *   task_id    {Number}  - Auto-incremented primary key
 *   user_id    {Number}  - FK → users.user_id
 *   text       {String}  - Event description
 *   date       {String}  - ISO date string "YYYY-MM-DD"
 *   time       {String}  - "HH:MM" (24-hour)
 *   type       {String}  - "Interview" | "Review" | "Application"
 *   completed  {Boolean} - Completion status
 *   created_at {Date}    - Creation timestamp
 *   updated_at {Date}    - Last update timestamp
 */
function createTaskDoc(data) {
  return {
    task_id:    data.task_id,
    user_id:    data.user_id,
    text:       data.text,
    date:       data.date,
    time:       data.time       || '09:00',
    type:       data.type       || 'Interview',
    completed:  data.completed  ?? false,
    created_at: data.created_at || new Date(),
    updated_at: new Date(),
  };
}

module.exports = { createTaskDoc };
