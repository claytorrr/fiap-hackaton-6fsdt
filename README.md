# PlanoAula.AI — FIAP Hackaton 6FSDT

MVP do Hackaton FIAP 6FSDT — Auxílio aos professores e professoras do ensino público.

## 💡 O que é

Plataforma web onde professores geram **planos de aula, atividades e avaliações** alinhados à BNCC em segundos usando IA. Cada plano pode ser editado, salvo na biblioteca pessoal e exportado em PDF.

## 🛠️ Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui
- **Backend**: API Routes do Next.js
- **Banco + Auth**: Supabase (Postgres + Auth)
- **IA**: Groq API (Llama 3.3 70B)
- **Deploy**: Vercel
- **Dev/Runtime**: Docker

## 🚀 Como rodar

### Pré-requisitos
- Docker Desktop
- Uma chave de API do [Groq](https://console.groq.com/keys) (grátis)
- Um projeto no [Supabase](https://supabase.com) (grátis)

### Passos

```bash
# 1. Clonar o repositório
git clone https://github.com/claytorrr/fiap-hackaton-6fsdt.git
cd fiap-hackaton-6fsdt

# 2. Copiar .env.example e preencher as chaves
cp .env.example .env.local
# edite .env.local com suas chaves

# 3. Subir o container de desenvolvimento
docker compose up --build

# App disponível em http://localhost:3000
```

## 📁 Estrutura

```
fiap-hackaton-6fsdt/
├── src/
│   └── app/                    # App Router (páginas + rotas)
├── public/                     # Assets estáticos
├── Dockerfile                  # Imagem de produção (multi-stage)
├── Dockerfile.dev              # Imagem de desenvolvimento
├── docker-compose.yml          # Orquestração dev
├── .env.example                # Template de variáveis de ambiente
└── package.json
```

## 📋 Requisitos do Hackaton

Este projeto atende ao Hackaton 6FSDT da FIAP com tema **"Auxílio aos professores e professoras do ensino público"**.

Entregáveis:
- ✅ Vídeo do Pitch (máx 8 min)
- ✅ Vídeo do MVP funcionando (máx 8 min)
- ✅ Relatório do Projeto

## 👤 Autor

Clayton Gomes — Pós Tech FIAP 6FSDT
