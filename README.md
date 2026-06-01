# MVP WhatsApp IA

Este MVP e uma interface local para testar a ideia antes de conectar WhatsApp e uma IA real.

## Como abrir

Abra o arquivo `index.html` no navegador.

## O que ja funciona

- Cadastro de numero de WhatsApp.
- Campo de contexto da IA.
- Intervalo configuravel em minutos.
- Modo reativo: responde quando uma mensagem e enviada no simulador.
- Modo automatico: envia mensagens no intervalo configurado.
- Ativar e pausar o bot.
- Historico salvo no navegador com `localStorage`.

## Proximos encaixes

- Trocar a resposta simulada em `app.js` por uma chamada para a API da IA.
- Criar um backend para proteger chaves de API.
- Adicionar webhook do WhatsApp para receber mensagens reais.
- Adicionar envio real via WhatsApp Cloud API, Twilio ou outro provedor.
- Persistir configuracoes em banco de dados.

## Arquivos

- `index.html`: estrutura da tela.
- `styles.css`: visual da interface.
- `app.js`: estado, simulador de IA e agendamento local.

## Backend

O backend TypeScript fica em `src/`.

- `src/server.ts`: inicia o servidor e o agendador.
- `src/app.ts`: configura Express, middlewares e rotas.
- `src/routes/`: endpoints HTTP.
- `src/services/`: regras de negocio.
- `src/lib/prisma.ts`: instancia do Prisma Client.
- `src/config/defaultPrompt.ts`: prompt padrao da IA.
- `prisma/schema.prisma`: modelos do banco.

Comandos:

```bash
npm run prisma:migrate
npm run prisma:generate
npm run dev
```
