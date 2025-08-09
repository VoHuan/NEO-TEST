require('dotenv').config({ silent: true });

module.exports = {
  port: process.env.PORT || 8080,

  ffmpegPath: process.env.FFMPEG_PATH || 'ffmpeg',

  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
  elevenLabsApiUrl: process.env.ELEVENLABS_API_URL,

  gptZeroApiKey: process.env.GPTZERO_API_KEY,
  gptZeroApiUrl: process.env.GPTZERO_API_URL,

  cloudName: process.env.CLOUD_NAME,
  cloudApiKey: process.env.CLOUD_API_KEY,
  cloudApiSecret: process.env.CLOUD_API_SECRET,

  puppeteerExecutablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  storageDir: process.env.STORAGE_DIR || './data',
  googleProjectId: process.env.GCP_PROJECT_ID,
};