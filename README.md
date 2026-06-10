# Trabalho-Eng-de-Software-25-2

## Sistema de gerenciamento de IPs para o CEI (Centro de Empreendedorismo e Inovação do INF-UFRGS)

Aplicação web para controlar a alocação de endereços IP das empresas incubadas no CEI: cadastro de IPs por sala, fluxo de solicitação e aprovação, histórico de auditoria e notificações por e-mail.

## Stack

- Backend: NestJS 11 + TypeORM + PostgreSQL
- Frontend: Next.js 15 + React 19
- Gerenciador de pacotes: pnpm 11 (fixado pelo campo `packageManager` e instalado via corepack)
- Runtime: Node 22 LTS
- Containers: Docker + Docker Compose

## Estrutura do repositório

- `cipcei/` — backend (NestJS) e o banco de dados (PostgreSQL)
- `cipcei-frontend-app/` — frontend (Next.js)
- `Documentos-e-Diagramas/` e `misc/` — documentação, diagramas e requisitos

Cada aplicação tem o seu próprio `Dockerfile` e `docker-compose.yaml`, controlados de forma independente.

## Pré-requisitos

- Docker 20.10+
- Docker Compose v2 (comando `docker compose`)

Para rodar fora do Docker (opcional): Node 22 LTS e pnpm 11 (basta `corepack enable`).

## Como rodar com Docker

O backend e o frontend sobem separadamente, cada um a partir do seu diretório.

### 1. Backend + banco de dados (`cipcei/`)

```bash
cd cipcei

# Na primeira vez, crie o arquivo de variáveis de ambiente
cp .env.example .env

# Sobe o PostgreSQL e o backend
docker compose up --build
```

Sobe dois serviços:

- `postgres-cipcei` — PostgreSQL na porta 5432
- `backend-cipcei` — API NestJS na porta 3000 (porta de debug 9229)

### 2. Frontend (`cipcei-frontend-app/`)

Em outro terminal:

```bash
cd cipcei-frontend-app

# Sobe o frontend
docker compose up --build
```

Sobe o serviço `frontend-cipcei` na porta 3001.

O frontend conversa com a API pelo navegador em `http://localhost:3000` (variável `NEXT_PUBLIC_API_URL`), então o backend precisa estar no ar para a aplicação funcionar.

## Acessando a aplicação

- Frontend: http://localhost:3001
- API (backend): http://localhost:3000
- Documentação da API (Swagger): http://localhost:3000/api
- PostgreSQL: localhost:5432
- Debug do backend (VSCode): porta 9229

## Hot reload

Os dois containers rodam em modo de desenvolvimento com hot-reload. O código é montado por volume, então alterações nos arquivos recarregam a aplicação automaticamente dentro do container.

## Comandos úteis

```bash
# Subir em background
docker compose up -d

# Ver logs do backend (dentro de cipcei/)
docker compose logs -f app

# Ver logs do frontend (dentro de cipcei-frontend-app/)
docker compose logs -f frontend

# Parar os containers
docker compose down

# Reconstruir após mudar o Dockerfile ou as dependências
docker compose up --build

# Limpar inclusive os volumes (apaga os dados do banco)
docker compose down -v

# Instalar uma nova dependência no backend
docker compose exec app pnpm add <pacote>

# Instalar uma nova dependência no frontend
docker compose exec frontend pnpm add <pacote>

# Abrir um shell dentro de um container
docker compose exec app sh
```

## Rodando localmente sem Docker (opcional)

Requer Node 22 LTS e pnpm 11 (`corepack enable`).

```bash
# Backend (precisa de um PostgreSQL acessível e do arquivo .env)
cd cipcei
pnpm install
pnpm run start:dev

# Frontend
cd cipcei-frontend-app
pnpm install
pnpm dev
```

## Testes do backend

```bash
cd cipcei
pnpm test          # testes unitários
pnpm run test:e2e  # testes end-to-end
pnpm run test:cov  # cobertura
```

## Banco de dados

O schema é gerenciado pelo TypeORM. Em desenvolvimento, com `TYPEORM_SYNCHRONIZE=true` no `.env`, as tabelas são criadas e atualizadas automaticamente a partir das entidades. Não utilize `synchronize` em produção.

## Troubleshooting

- Container não inicia: veja os logs com `docker compose logs <serviço>`.
- Alterações não refletem: reconstrua com `docker compose down` seguido de `docker compose up --build`.
- Porta em uso: verifique se 3000, 3001 ou 5432 já estão ocupadas (por exemplo `lsof -i :3000`).
- Erro de permissão em arquivos gerados pelo container (Linux): `sudo chown -R $USER:$USER .`.
