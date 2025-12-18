# --- Stage 1: Build ---
FROM node:24.12.0-slim AS builder

WORKDIR /app

# Tell Puppeteer to skip downloading Chromium during 'npm install'
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install dependencies for building (if any)
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# --- Stage 2: Production ---
FROM node:24.12.0-slim AS runner

# 1. Install Puppeteer dependencies (as specified in wwebjs docs)
RUN apt-get update && apt-get install -y \
  wget \
  gnupg \
  ca-certificates \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  xdg-utils \
  # Install chromium package
  chromium \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# 2. Set Environment Variables
ENV NODE_ENV=production
ENV PORT=3000
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# 3. Security: Create a non-root user
# Puppeteer runs more reliably without root privileges
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
  && mkdir -p /home/pptruser/Downloads \
  && chown -R pptruser:pptruser /home/pptruser \
  && chown -R pptruser:pptruser /app

# Use the non-root user
USER pptruser

# 4. Copy build artifacts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
