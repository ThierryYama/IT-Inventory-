# IT Monorepo

Repositorio unico com frontend em React/Vite e backend em FastAPI para importacao e tratamento de planilhas de ativos.

## Estrutura

- `frontend/`: interface atual em React, TypeScript e Vite
- `backend/`: API em Python com FastAPI, Tortoise ORM e PostgreSQL
- `docker-compose.yml`: infraestrutura local para backend e banco
- `.env.example`: variaveis de ambiente de referencia

## Frontend

O frontend existente foi movido para `frontend/` sem alterar a base funcional atual.

Comandos principais:

```bash
cd frontend
npm install
npm run dev
```

## Backend

O backend foi preparado com a estrutura inicial para evoluir models, services e rotas em seguida.

Comandos principais:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Docker

Para subir PostgreSQL e backend com Docker Compose:

```bash
cp .env.example .env
docker compose up --build
```
