# motion-mcp: server MCP motion-engine (render HTML -> MP4).
# Image Playwright sudah membawa Node, Chromium yang cocok dengan versi paket playwright,
# dan font (termasuk emoji) yang dipakai komposisi. Versinya HARUS sama dengan
# "playwright" di package.json — Chromium dicari di /ms-playwright menurut versi paket.
FROM mcr.microsoft.com/playwright:v1.64.1-noble

RUN apt-get update \
 && apt-get install -y --no-install-recommends bubblewrap ffmpeg unzip tini \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

COPY lib ./lib
COPY bin ./bin
COPY mcp ./mcp
COPY sfx-stok ./sfx-stok
# Templat komposisi untuk alat MCP daftar_templat/pakai_templat (P6-05).
COPY templat ./templat

ENV NODE_ENV=production \
    PORT=8420 \
    DATA_DIR=/data \
    WORKERS=4 \
    MOTION_VIEWPORT=1400x1600 \
    MOTION_ENCODER=cpu \
    MOTION_BLOKIR_PRIVAT=1

RUN mkdir -p /data && chown -R pwuser:pwuser /data
USER pwuser
VOLUME ["/data"]
EXPOSE 8420

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/sehat').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "mcp/server.mjs"]
