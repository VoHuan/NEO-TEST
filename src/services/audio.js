const { execFile } = require("child_process");
const path = require("path");

async function downloadAndConvert(url, outWavPath) {
  return new Promise((resolve, reject) => {
    const ytdlpPath = path.join(__dirname, "..", "lib", "yt-dlp.exe");
    const ffmpegPath = path.join(__dirname, "..", "lib", "ffmpeg.exe");
    execFile(
      ytdlpPath,
      [
        "--ffmpeg-location",
        ffmpegPath,
        "-f",
        "bestaudio",
        "--extract-audio",
        "--audio-format",
        "wav",
        "--audio-quality",
        "0",
        "--postprocessor-args",
        "-ar 16000 -ac 1 -sample_fmt s16",
        "-o",
        outWavPath,
        url,
      ],
      (error, stdout, stderr) => {
        if (error) {
          return reject(new Error(`yt-dlp error: ${error.message}\n${stderr}`));
        }
        resolve();
      }
    );
  });
}

module.exports = { downloadAndConvert };
