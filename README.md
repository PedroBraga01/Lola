# 🐕 Lola — Gestor Pessoal com IA

Aplicação web PWA de gestão pessoal com chat inteligente, integrada ao Google Calendar e Google Tasks.

## 🛠️ Stack

- **Frontend**: React + Vite + PWA (vite-plugin-pwa)
- **Backend**: Node.js + Express
- **IA**: Google Gemini 2.0 Flash
- **Integrações**: Google Calendar API, Google Tasks API
- **Deploy**: Render (free tier)

## 📦 Instalação

### Pré-requisitos
- [Node.js](https://nodejs.org/) v18+
- Conta Google com acesso ao [Google Cloud Console](https://console.cloud.google.com/)
- [API Key do Gemini](https://aistudio.google.com/)

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/lola.git
cd lola
```

### 2. Configurar o backend
```bash
cd backend
cp .env.example .env
# Preencha as variáveis no arquivo .env
npm install
```

### 3. Configurar o frontend
```bash
cd frontend
npm install
```

### 4. Rodar em desenvolvimento
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

O frontend roda em `http://localhost:5173` e o backend em `http://localhost:3001`.

## 🔑 Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID do Google Cloud |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret |
| `GEMINI_API_KEY` | API Key do Google AI Studio |
| `SESSION_SECRET` | Segredo para sessões Express |
| `FRONTEND_URL` | URL do frontend (ex: `http://localhost:5173`) |
| `GOOGLE_REDIRECT_URI` | URI de callback OAuth |

## 🚀 Deploy no Render

1. Suba o projeto no GitHub
2. No Render, vá em **Blueprints** > **New Blueprint Instance**
3. Conecte seu repositório GitHub
4. O `render.yaml` configura tudo automaticamente
5. Preencha as variáveis de ambiente no painel do Render

## 📄 Licença

Projeto pessoal — uso privado.
