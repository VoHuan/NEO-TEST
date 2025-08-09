const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const path = require('path');
const storage = require("./sqlite-db/storage");
const { Queue } = require('bullmq');
const logger = require('./ultils/logger');

const app = express();
app.use(bodyParser.json());

// serve results statically
app.use('/data', express.static(path.join(__dirname,'../data')));

const analyzeQueue = new Queue('analyze', { connection: { url: process.env.REDIS_URL } });

app.post('/analyze', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({error:'Missing url'});
  // minimal validation
  if (!/youtube\.com|youtu\.be/.test(url)) return res.status(400).json({error:'Only YouTube URLs allowed'});
  const id = uuidv4();
  storage.createJob(id, { url, status: 'queued', created_at: new Date().toISOString() });
  await analyzeQueue.add('analyze', { id, url, created_at: new Date().toISOString() });
  res.status(202).json({ id, status: 'queued' });
});


app.get('/result/:id', (req, res) => {
  const id = req.params.id;
  const result = storage.getJob(id);
  if (!result) return res.status(404).json({error:'Not found or still processing'});
  res.json(result);
});

const port = process.env.PORT || 8080;
app.listen(port, () => logger.info(`App is running on port ${port}`));
