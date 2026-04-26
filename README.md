# Diagnóstico de Marca — Alexandre Oliveira

Funil multi-etapas com sistema de pontuação e envio de e-mail via Resend.

## Stack
- **Front**: Next.js 14 (App Router) + React + Tailwind CSS
- **Back**: API Route serverless (Vercel)
- **E-mail**: Resend

## Deploy no Vercel

### 1. Clone e instale
```bash
npm install
```

### 2. Configure o Resend
1. Crie uma conta em [resend.com](https://resend.com)
2. Vá em **API Keys** e gere uma nova chave
3. Em **Domains**, adicione e verifique seu domínio (ou use `onboarding@resend.dev` para testes)
4. Copie `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```
5. Preencha `RESEND_API_KEY` com sua chave

### 3. Rode localmente
```bash
npm run dev
```

### 4. Deploy na Vercel
```bash
npx vercel
```
Ou conecte o repositório no painel da Vercel e adicione a variável de ambiente:
- **Nome**: `RESEND_API_KEY`
- **Valor**: sua chave do Resend

### 5. Domínio de envio
No `src/app/api/send-email/route.ts`, altere o campo `from` para usar seu domínio verificado:
```ts
from: 'Alexandre Oliveira <oi@seudominio.com.br>',
```

## Sistema de Pontuação

| Etapa | Critério | Pontos |
|-------|----------|--------|
| Etapa 7 — Tipo de produto | Digital/Infoproduto → +2, Físico/Serviço → +1, Estruturando → -1 |
| Etapa 8 — Vendas | Não vendemos → 0, Pouco → 1, Consistência → 2, Bem → 3 |
| Etapa 9 — Página | Não tenho → 0, Não converte → 1, Pode melhorar → 2, Vende bem → 3 |
| Etapa 10 — Aquisição | 0 canais → 0, 1 → 1, 2–3 → 2, 4+ → 3 |
| Etapa 11 — Faturamento | Até 50k → 0, 50–100k → 1, 100–500k → 2, 500k–1M → 3, 1M–2M → 4, 2M+ → 5 |

### Classificação
- **0–4** → Início
- **5–8** → Validação  
- **9–12** → Crescimento
- **13+** → Escala

### Regras de exceção
- Etapa 8 = 0 → máximo: Validação
- Etapa 9 = 0 → máximo: Crescimento
- Etapa 10 = 0 canais → máximo: Validação
