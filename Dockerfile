FROM ghcr.io/puppeteer/puppeteer:latest

USER root

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

# install python3, pip, yt-dlp và ffmpeg
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# install yt-dlp
RUN pip3 install --break-system-packages yt-dlp

# env for Puppeteer
ENV PUPPETEER_CACHE_DIR=/home/pptruser/.cache/puppeteer
ENV PUPPETEER_ARGS="--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-gpu"

# install Chromium
RUN npx puppeteer browsers install chrome && \
    find /home/pptruser/.cache/puppeteer -name chrome | grep chrome-linux64/chrome || { echo "Chromium not found"; exit 1; } && \
    CHROMIUM_PATH=$(find /home/pptruser/.cache/puppeteer -name chrome | grep chrome-linux64/chrome) && \
    ln -sf $CHROMIUM_PATH /usr/bin/chromium && \
    ls -la /usr/bin/chromium

ENV PORT=8080 \
    LOG_LEVEL=debug \
    REDIS_URL=redis://redis:6379

EXPOSE 8080

# healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -f http://127.0.0.1:${PORT}/health || exit 1

COPY start.sh ./
RUN chmod +x start.sh

CMD ["bash", "./start.sh"]
