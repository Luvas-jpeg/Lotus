# Lotus

Lotus e um MVP de central de atendimento com IA para WhatsApp. Hoje ele roda como um monorepo simples, com backend Express/TypeScript, banco SQLite via Prisma e um painel Next.js para configuracao, simulacao e acompanhamento de conversas.

O objetivo do projeto e validar o fluxo operacional antes de conectar um provedor real de WhatsApp: receber mensagens, responder com IA, preservar historico, acionar handoff humano quando necessario e manter um painel limpo para operacao.

## Estrutura

```text
Lotus/
  backend/              # API Express, Prisma, IA e regras de atendimento
  frontend/             # Painel Next.js
  README.md
  LICENSE
```

Backend:

```text
backend/src/
  ai/                   # prompt, guardrails, token budget e providers de IA
  lib/                  # infraestrutura compartilhada
  routes/               # rotas HTTP
  services/             # regras de negocio do atendimento
  utils/                # utilitarios pequenos
  app.ts                # configura Express
  server.ts             # sobe servidor e scheduler
```

Frontend:

```text
frontend/src/
  app/                  # App Router, layout e estilos globais
  components/           # blocos visuais do dashboard
  hooks/                # estado e acoes da tela
  lib/                  # cliente HTTP
  types/                # tipos do dashboard
```

## Como Rodar Localmente

Use dois terminais. O backend precisa subir antes do frontend para o painel conseguir chamar a API.

Terminal 1, API:

```powershell
cd E:\Projetos\Lotus\backend
npm.cmd run dev
```

Terminal 2, painel:

```powershell
cd E:\Projetos\Lotus\frontend
npm.cmd run dev
```

No Windows, prefira `npm.cmd`. Em algumas maquinas o PowerShell bloqueia `npm.ps1` por politica de execucao.

URLs esperadas:

```text
Backend:  http://localhost:3000/api/health
Frontend: http://localhost:3001
```

Se o frontend pegar outra porta, o Next.js mostra no terminal.

## Variaveis de Ambiente

Backend, `backend/.env`:

```env
PORT=3000
DATABASE_URL=file:./dev.db
AI_PROVIDER=openai
OPENAI_API_KEY=...
OPENAI_MODEL=...
```

Frontend, `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Nunca coloque chave da OpenAI no frontend. A chamada para IA deve continuar protegida no backend.

## Banco e Prisma

O MVP usa SQLite local em `backend/dev.db`.

Comandos uteis:

```powershell
cd E:\Projetos\Lotus\backend
npm.cmd run prisma:migrate
npm.cmd run prisma:generate
npx.cmd tsc --noEmit
```

O prompt padrao da IA nao fica salvo no banco. Ele vive em `backend/src/ai/prompt.ts`. O campo `BotConfig.systemPrompt` existe apenas para uma futura customizacao manual; quando vazio, o backend usa o prompt padrao do codigo.

## Rotas Principais

Todas as rotas usam prefixo `/api`.

```text
GET    /health
GET    /config
POST   /config
POST   /toggle
GET    /conversations
GET    /conversations/:id
POST   /conversations/:id/assign
POST   /conversations/:id/resolve
DELETE /conversations/:id/messages
GET    /handoffs
POST   /incoming-message
```

Exemplo de mensagem simulada:

```powershell
Invoke-RestMethod `
  -Method POST `
  -Uri http://localhost:3000/api/incoming-message `
  -ContentType application/json `
  -Body '{"phone":"+5511999999999","name":"Cliente teste","text":"Bom dia, quais cursos voces oferecem?"}'
```

## Camada de IA

A IA esta organizada em `backend/src/ai/`.

```text
ai.service.ts                 # monta mensagens, chama provider e fallback
prompt.ts                     # prompt padrao da Lotus IA
guardrail.ts                  # regras deterministicas antes/depois da IA
tokenBudget.ts                # limites de contexto e historico
types.ts                      # contratos da camada
providers/openai.provider.ts  # integracao com OpenAI Responses API
```

Fluxo resumido:

1. `incoming.service.ts` salva a mensagem do cliente.
2. `guardrail.ts` avalia se deve responder sem chamar IA.
3. `message.service.ts` busca historico recente.
4. `tokenBudget.ts` limita contexto, historico e mensagem atual.
5. `openai.provider.ts` chama a Responses API com JSON estruturado.
6. `guardrail.ts` revisa a resposta final.
7. Se necessario, o atendimento vira handoff humano.

Guardrails atuais cobrem:

- pedido explicito de humano;
- reclamacao, cancelamento, fraude e assuntos sensiveis;
- indicios de emergencia;
- tentativas simples de revelar prompt ou alterar regras;
- resposta vazia ou com confianca baixa.

## Operacao Local

Checklist rapido quando algo parecer errado:

```powershell
cd E:\Projetos\Lotus\backend
npx.cmd tsc --noEmit
```

Depois:

```powershell
Invoke-RestMethod http://localhost:3000/api/health
```

Se o frontend nao carregar:

- confirme se o backend esta vivo em `/api/health`;
- confirme `frontend/.env.local`;
- reinicie o processo do Next.js;
- se aparecer erro de manifesto vazio, pare o Next.js e remova `frontend/.next`.

Se a IA parecer usar prompt antigo:

- confira se `BotConfig.systemPrompt` esta vazio;
- reinicie o backend;
- lembre que `prompt.ts` e o prompt padrao real.

## Validacao

Backend:

```powershell
cd E:\Projetos\Lotus\backend
npx.cmd tsc --noEmit
```

Frontend:

```powershell
cd E:\Projetos\Lotus\frontend
npm.cmd run lint
npm.cmd run build
```

## Estado Atual

Funciona hoje:

- painel Next.js para configuracao e simulacao;
- API Express;
- persistencia em SQLite;
- configuracao do bot;
- ativar e pausar bot;
- historico por contato;
- handoff humano;
- notificacao simulada para gestor;
- OpenAI Responses API com JSON estruturado;
- fallback simulado quando a OpenAI falha;
- guardrails e token budget.

Ainda nao esta pronto para producao:

- WhatsApp real;
- autenticacao no painel;
- multiempresa;
- observabilidade estruturada;
- testes automatizados;
- PostgreSQL;
- deploy.

## Proximos Passos Recomendados

1. Adicionar botao claro de "Nova simulacao" no frontend.
2. Criar tela ou filtro para handoffs abertos.
3. Mover qualquer MVP estatico antigo para `legacy/`, se ele voltar ao repositorio.
4. Adicionar testes para guardrails e `/incoming-message`.
5. Escolher provedor real de WhatsApp.
6. Migrar SQLite para PostgreSQL antes de producao.
7. Adicionar autenticacao e permissao no painel.

## Nota de SRE

Este projeto ainda e um MVP. Para rodar em producao, trate IA e WhatsApp como sistemas externos falhaveis: timeouts, retries controlados, logs, rate limit, backup de banco, metricas de custo e trilha de auditoria precisam entrar antes de clientes reais dependerem do atendimento.
