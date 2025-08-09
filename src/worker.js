const path = require("path");
const fs = require("fs");
const { Worker } = require("bullmq");
const storage = require("./sqlite-db/storage");
const { uploadImage } = require("./cloud/cloudinary");
const { captureThumbnail } = require("./services/puppeteer");
const { downloadAndConvert } = require("./services/audio");
const {
  transcribeWithElevenLabs,
  buildSentencesFromWords,
} = require("./services/transcribe_elevenlabs");
const { scoreWithGPTZero } = require("./services/score_gptzero");
const logger = require("./ultils/logger");

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const QUEUE_NAME = "analyze";

const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const worker = new Worker(
  QUEUE_NAME,
  async job => {
    const { id, url, created_at } = job.data;
    logger.info(`Processing job ${id} (${url})`);
    try {
      storage.updateJob(id, {
        status: "processing",
        updated_at: new Date().toISOString(),
      });

      // 1. Take thumbnail screenshot with Puppeteer
      const screenshotPath = path.join(dataDir, `${id}.png`);
      const played = await captureThumbnail(url, screenshotPath);
      if (!played) throw new Error("Video playback failed, cannot capture thumbnail");
      // Upload thumbnail to Cloudinary
      const thumbnailUrl = await uploadImage(screenshotPath);

      // 2. Download audio and convert to WAV
      const wavPath = path.join(dataDir, `${id}.wav`);
      await downloadAndConvert(url, wavPath);

      // 3. Transcribe audio using ElevenLabs Scribe API
      const transcriptData = await transcribeWithElevenLabs(wavPath);
      const sentences = buildSentencesFromWords(transcriptData);

      // 4. Score each sentence with GPTZero
      for (const sentence of sentences) {
        const ai_probability  = await scoreWithGPTZero(sentence.text);
        sentence.ai_probability = ai_probability;
      }

      // 5. Create a comprehensive result object to store
      const result = {
        created_at,
        language_code: transcriptData.language_code,
        language_probability: transcriptData.language_probability,
        text: transcriptData.text,
        sentences,
      };

      // const resultJsonPath = path.join(dataDir, `${id}.json`);
      // fs.writeFileSync(resultJsonPath, JSON.stringify(result, null, 2));

      // 6. Update job status to done with result paths
      storage.updateJob(id, {
        status: "done",
        updated_at: new Date().toISOString(),
        screenshot_path: thumbnailUrl,
        transcript_json: JSON.stringify(result),
      });

      logger.info(`Job ${id} completed successfully`);

      // remove temporary WAV and screenshot files
      try {
        fs.unlinkSync(wavPath);
        fs.unlinkSync(screenshotPath);
      } catch (err) {
        logger.warn("Failed to delete temporary files:", err);
      }
    } catch (err) {
      logger.error(`Job ${id} failed:`, err);
      storage.updateJob(id, {
        status: "error",
        updated_at: new Date().toISOString(),
        error_message: err.message || String(err),
      });
    }
  },
  { connection: { url: REDIS_URL } }
);

worker.on("completed", job => {
  logger.info(`Job ${job.id} completed`);
});
worker.on("failed", (job, err) => {
  logger.error(`Job ${job.id} failed:`, err);
});