const { execFile } = require("child_process");
const path = require("path");
const os = require("os");

async function downloadAndConvert(url, outWavPath) {
 return new Promise((resolve, reject) => {
    const isWin = os.platform() === "win32"; // if Windows yt-dlp and ffmpeg are in lib folder, if Linux use system path

    const ytdlpPath = isWin
      ? path.join(__dirname, "..", "lib", "yt-dlp.exe")
      : "yt-dlp";

    const ffmpegLocation = isWin
      ? path.join(__dirname, "..", "lib", "ffmpeg.exe") 
      : null; 

    if (isWin) {
      if (!fs.existsSync(ytdlpPath))
        return reject(new Error(`yt-dlp.exe không tồn tại: ${ytdlpPath}`));
      if (!fs.existsSync(path.join(ffmpegLocation, "ffmpeg.exe")))
        return reject(new Error(`ffmpeg.exe không tồn tại: ${ffmpegLocation}`));
    }

    const args = [
      "-f", "bestaudio",
      "--extract-audio",
      "--audio-format", "wav",
      "--audio-quality", "0",
      "--postprocessor-args", "-ar 16000 -ac 1 -sample_fmt s16",
      "-o", outWavPath,
      url,
    ];

    if (ffmpegLocation) {
      args.unshift("--ffmpeg-location", ffmpegLocation);
    }

    execFile(ytdlpPath, args, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`yt-dlp error: ${error.message}\n${stderr}`));
      }
      resolve();
    });
  });
}

module.exports = { downloadAndConvert };
