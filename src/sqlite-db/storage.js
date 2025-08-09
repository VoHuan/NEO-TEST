const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, 'jobs.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL'); 

// Create jobs table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT,
    screenshot_path TEXT,
    transcript_json TEXT,
    error_message TEXT
  )
`).run();

module.exports = {
  createJob(id, job) {
    const stmt = db.prepare(`
      INSERT INTO jobs (id, url, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, job.url, job.status, job.created_at, job.updated_at || null);
  },

  updateJob(id, updates) {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(updates)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    values.push(id);

    const stmt = db.prepare(`UPDATE jobs SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
  },

  saveTranscript(id, transcriptData) {
    const stmt = db.prepare(`
      UPDATE jobs 
      SET transcript_json = ?
      WHERE id = ?
    `);
    stmt.run(JSON.stringify(transcriptData), id);
  },

  // Update getJob to parse JSON
  getJob(id) {
    const job = db.prepare(`SELECT * FROM jobs WHERE id = ?`).get(id);
    if (job && job.transcript_json) {
     const transcript = JSON.parse(job.transcript_json);

     return {
        id: job.id,
        url: job.url,
        status: job.status,
        created_at: job.created_at,
        updated_at: job.updated_at,
        screenshot: job.screenshot_path,
        error_message: job.error_message,
        transcript: transcript,
      };
    }
    return job;
  },

  getAllJobs() {
    return db.prepare(`SELECT * FROM jobs ORDER BY created_at DESC`).all();
  }
};
