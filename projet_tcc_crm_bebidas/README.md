# Projeto TCC - CRM de Bebidas

Sistema web para distribuidora de bebidas destiladas, unindo:
- CRM comercial
- site comercial
- painel administrativo

## Estrutura

- `backend/` API em FastAPI
- `frontend/` interface web em Next.js
- `docs/` documentação do TCC
- `.github/workflows/` CI básica

## Tecnologias

- Backend: FastAPI + SQLAlchemy
- Frontend: Next.js
- Banco: PostgreSQL
- Autenticação: JWT
- Infra: Docker + Docker Compose

## Como usar

### 1. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Observação

Esta é uma base inicial de estrutura para o TCC.
