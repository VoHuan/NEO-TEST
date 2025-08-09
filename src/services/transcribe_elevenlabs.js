const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const config = require('../ultils/config');
const logger = require('../ultils/logger');


// ElevenLabs Scribe API endpoint
async function transcribeWithElevenLabs(wavFilePath) {
  const form = new FormData();
  form.append('model_id', 'scribe_v1'); 
  form.append('file', fs.createReadStream(wavFilePath));

  try {
    const response = await axios.post(config.elevenLabsApiUrl, form, {
      headers: {
        'xi-api-key': config.elevenLabsApiKey,
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return response.data;
  } catch (error) {
    logger.error('Error calling ElevenLabs Scribe API:', error.response?.data || error.message);
    throw error;
  }
}

// convert transcript data to sentences
function buildSentencesFromWords(data) {
  const sentences = [];
  let currentSentence = {
    text: '',
    start_time: null,
    end_time: null,
    speaker: null,
  };

  data.words.forEach((word, i) => {
    if (currentSentence.text.length === 0) {
      currentSentence.start_time = word.start;
      currentSentence.speaker = word.speaker_id;
    }
    currentSentence.text += (currentSentence.text ? ' ' : '') + word.text;
    currentSentence.end_time = word.end;

    // Nếu word.text có dấu câu kết thúc câu, hoặc cuối mảng thì kết thúc câu
    if (/[.!?]/.test(word.text[word.text.length - 1]) || i === data.words.length - 1) {
      sentences.push({...currentSentence});
      currentSentence = {text: '', start_time: null, end_time: null, speaker: null};
    }
  });

  return sentences;
}
module.exports = { transcribeWithElevenLabs, buildSentencesFromWords };
