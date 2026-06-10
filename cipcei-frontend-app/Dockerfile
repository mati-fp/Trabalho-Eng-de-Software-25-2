FROM node:22-alpine

# Diretorio de trabalho
WORKDIR /app

# Habilita o pnpm via corepack (atualiza o corepack para suportar o pnpm fixado no package.json)
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN npm install -g corepack@latest && corepack enable

# Instala dependencias primeiro (camada cacheavel)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Copia o restante do codigo
COPY . .

# Porta da aplicacao
EXPOSE 3001

# Inicia o Next.js em modo desenvolvimento com hot-reload
CMD ["pnpm", "dev"]
