const { v2: cloudinary } = require('cloudinary');
const config = require('../ultils/config');
const logger = require('../ultils/logger');

cloudinary.config({
  cloud_name: config.cloudName,
  api_key: config.cloudApiKey,
  api_secret: config.cloudApiSecret,
});

const uploadImage = async (imgPath) => {
  try {
    const result = await cloudinary.uploader.upload(
      imgPath,
      { folder: 'NEO_TEST' }
    );
    //console.log('Uploaded:', result.secure_url);
    return result.secure_url;
  } catch (err) {
    logger.error(err);
  }
}

module.exports = { uploadImage };
