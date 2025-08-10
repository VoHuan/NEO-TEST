# NEO-TEST

## Description

NEO-TEST is a challenger project to NEO, providing a YouTube video processing queue system using Node.js, Express, BullMQ (Redis), Puppeteer, ffmpeg, yt-dlp, and SQLite. The system allows you to submit YouTube URLs, automatically download audio, capture thumbnails, convert to WAV, detect AI (GPTZero), transcribe (ElevenLabs), and retrieve results via API.

---

## Setup

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/)
- (Optional for local dev) Node.js >= 18, Redis, ffmpeg, yt-dlp, Python3, Google Chrome/Chromium

### Quick Start (Docker)

1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd NEO-TEST
   ```
2. Copy `.env.example` to `.env` and fill in API keys and configuration as needed:
   ```sh
   cp .env.example .env
   # Then edit .env to set your API keys and other settings
   ```
3. Build and run:
   ```sh
   docker compose build
   docker compose up -d
   ```
4. Access the API at [http://localhost:8080](http://localhost:8080)

### Local Development (without Docker)

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start Redis server and ensure ffmpeg, yt-dlp, and Chrome/Chromium are installed and in your PATH.
3. Run in development mode:
   ```sh
   npm run start_dev
   ```

---

## Environment Variables

| Variable                                          | Default            | Description                                       |
| ------------------------------------------------- | ------------------ | ------------------------------------------------- |
| `PORT`                                            | 8080               | API server port                                   |
| `REDIS_URL`                                       | redis://redis:6379 | Redis connection string for BullMQ                |
| `LOG_LEVEL`                                       | error              | Logging level (`debug`, `info`, `warn`, `error`)  |
| `PUPPETEER_ARGS`                                  | see Dockerfile     | Chromium launch arguments                         |
| `PUPPETEER_EXECUTABLE_PATH`                       | (auto-detect)      | Path to Chrome/Chromium binary (if system Chrome) |
| `ELEVENLABS_API_KEY`                              |                    | API key for ElevenLabs Scribe                     |
| `GPTZERO_API_KEY`                                 |                    | API key for GPTZero                               |
| `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET` |                    | Cloudinary credentials (if using image upload)    |

---

## Design Decisions

- **Job Queue:** Uses BullMQ with Redis for scalable, reliable background processing.
- **Audio Download:** Uses yt-dlp and ffmpeg for robust, cross-platform YouTube audio extraction and conversion.
- **Thumbnail Capture:** Puppeteer is used for headless Chrome-based screenshotting, with Docker image and launch args optimized for CI/cloud.
- **Database:** SQLite is used for simplicity and portability; can be swapped for another DB if needed.
- **API Structure:** RESTful endpoints for job submission and result retrieval; healthcheck for orchestration.
- **Dockerization:** All dependencies (including Chrome, ffmpeg, yt-dlp) are installed in the image for reproducible builds and easy deployment.
- **Secrets:** All API keys and credentials are injected via environment variables, never hardcoded.
- **Extensibility:** Modular service structure (audio, puppeteer, transcribe, score) for easy extension or replacement.

---

## Main Features

- Submit YouTube video analysis jobs via the `/analyze` API
- Download audio, convert to WAV, transcribe, and score AI probability
- Capture video thumbnails with Puppeteer
- Store job status and results in SQLite
- Retrieve results via `/result/:id` API
- Healthcheck endpoint at `/health`

---

## API Usage

### Submit an Analysis Job

```sh
curl -X POST http://localhost:8080/analyze -H "Content-Type: application/json" -d '{"url": "https://www.youtube.com/watch?v=xxxx"}'
```

### Get Results

```sh
curl http://localhost:8080/result/<job_id>
```

---

## Development & Debugging

- Run dev: `npm run start_dev`
- Run app/worker separately: `npm run app_dev` or `npm run worker_dev`
- Enable detailed logs: set `LOG_LEVEL=debug`

---
