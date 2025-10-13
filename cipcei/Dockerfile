FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema necessárias
RUN apk add --no-cache python3 make g++

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Expor porta da aplicação
EXPOSE 3000

# Comando para iniciar em modo desenvolvimento com hot-reload
CMD ["npm", "run", "start:dev"]