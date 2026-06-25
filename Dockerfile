# ---- Imagem base ----
FROM node:20-bookworm-slim

# Prisma precisa do openssl
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependências (camada cacheável)
COPY package.json package-lock.json ./
RUN npm ci

# Código + build
COPY . .
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Aplica o schema, popula se necessário e inicia o Samba
CMD ["node", "scripts/docker-start.mjs"]
