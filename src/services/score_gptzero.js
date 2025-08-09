const axios = require("axios");
const config = require("../ultils/config");
const logger = require("../ultils/logger");

// Function to score text using GPTZero API
async function scoreWithGPTZero(text) {
  try {
    const res = await axios.post(
      config.gptZeroApiUrl,
      { input_text: text },
      {
        headers: {
          ApiKey: config.gptZeroApiKey,
          "Content-Type": "application/json",
        },
      }
    );

    const fakePercentage = res.data?.data?.fakePercentage;
    const ai_probability =
      fakePercentage !== undefined && fakePercentage !== null
        ? parseFloat(fakePercentage) / 100
        : null;
        
    return ai_probability;
  } catch (error) {
    logger.error('Error calling GPTZero API:', error);
    return { ai_probability: null };
  }
}

module.exports = { scoreWithGPTZero };
