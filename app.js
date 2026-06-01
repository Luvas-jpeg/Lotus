const STORAGE_KEY = "whatsapp-ai-mvp";

const defaultState = {
  botActive: false,
  phone: "",
  context: "",
  interval: 10,
  temperature: 0.6,
  mode: "reactive",
  messages: [],
  nextRunAt: null,
};

let state = loadState();
let scheduler = null;

const form = document.querySelector("#botForm");
const phoneInput = document.querySelector("#phoneInput");
const contextInput = document.querySelector("#contextInput");
const intervalInput = document.querySelector("#intervalInput");
const temperatureInput = document.querySelector("#temperatureInput");
const toggleButton = document.querySelector("#toggleButton");
const statusBadge = document.querySelector("#statusBadge");
const chatTitle = document.querySelector("#chatTitle");
const chatLog = document.querySelector("#chatLog");
const messageForm = document.querySelector("#messageForm");
const messageInput = document.querySelector("#messageInput");
const clearButton = document.querySelector("#clearButton");

hydrateForm();
render();
startScheduler();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  state = {
    ...state,
    phone: phoneInput.value.trim(),
    context: contextInput.value.trim(),
    interval: clamp(Number(intervalInput.value), 1, 1440),
    temperature: Number(temperatureInput.value),
    mode: new FormData(form).get("mode"),
  };

  if (state.botActive) {
    state.nextRunAt = getNextRunAt();
  }

  addSystemMessage("Configuracoes salvas.");
  saveState();
  render();
  startScheduler();
});

toggleButton.addEventListener("click", () => {
  if (!state.botActive && !state.phone) {
    addSystemMessage("Informe um numero antes de ativar o bot.");
    saveState();
    render();
    return;
  }

  state.botActive = !state.botActive;
  state.nextRunAt = state.botActive ? getNextRunAt() : null;
  addSystemMessage(state.botActive ? "Bot ativado." : "Bot pausado.");
  saveState();
  render();
  startScheduler();
});

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();

  if (!text) {
    return;
  }

  addMessage("user", text);
  messageInput.value = "";

  if (state.botActive) {
    setTimeout(() => {
      addMessage("bot", createBotReply(text));
      saveState();
      render();
    }, 550);
  } else {
    addSystemMessage("Mensagem recebida, mas o bot esta inativo.");
  }

  saveState();
  render();
});

clearButton.addEventListener("click", () => {
  state.messages = [];
  saveState();
  render();
});

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaultState, ...saved };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrateForm() {
  phoneInput.value = state.phone;
  contextInput.value = state.context;
  intervalInput.value = state.interval;
  temperatureInput.value = state.temperature;
  const modeInput = form.querySelector(`[name="mode"][value="${state.mode}"]`);

  if (modeInput) {
    modeInput.checked = true;
  }
}

function render() {
  statusBadge.textContent = state.botActive ? "Ativo" : "Inativo";
  statusBadge.className = `status-badge ${state.botActive ? "on" : "off"}`;

  toggleButton.textContent = state.botActive ? "Pausar bot" : "Ativar bot";
  toggleButton.classList.toggle("active", state.botActive);

  chatTitle.textContent = state.phone ? `Conversa com ${state.phone}` : "Conversa sem numero";

  chatLog.innerHTML = "";

  if (!state.messages.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Envie uma mensagem no simulador ou ative o modo automatico para ver a IA trabalhando.";
    chatLog.appendChild(empty);
    return;
  }

  state.messages.forEach((message) => {
    const bubble = document.createElement("article");
    bubble.className = `message ${message.role}`;

    const author = document.createElement("strong");
    author.textContent = getAuthorLabel(message.role);

    const body = document.createElement("p");
    body.textContent = message.text;

    const time = document.createElement("time");
    time.dateTime = message.createdAt;
    time.textContent = new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(message.createdAt));

    bubble.append(author, body, time);
    chatLog.appendChild(bubble);
  });

  chatLog.scrollTop = chatLog.scrollHeight;
}

function startScheduler() {
  if (scheduler) {
    clearInterval(scheduler);
  }

  scheduler = setInterval(() => {
    if (!state.botActive || state.mode !== "proactive") {
      return;
    }

    if (!state.nextRunAt || Date.now() >= state.nextRunAt) {
      addMessage("bot", createProactiveMessage());
      state.nextRunAt = getNextRunAt();
      saveState();
      render();
    }
  }, 1000);
}

function addMessage(role, text) {
  state.messages = [
    ...state.messages,
    {
      id: crypto.randomUUID(),
      role,
      text,
      createdAt: new Date().toISOString(),
    },
  ].slice(-80);
}

function addSystemMessage(text) {
  addMessage("system", text);
}

function createBotReply(incomingText) {
  const recent = getRecentUserTopic();
  const tone = state.temperature > 0.7 ? "com um toque mais criativo" : "de forma objetiva";
  const contextHint = state.context
    ? `Seguindo o contexto configurado, eu responderia ${tone}:`
    : `Sem contexto definido, eu responderia ${tone}:`;

  if (incomingText.includes("?")) {
    return `${contextHint} entendi sua pergunta sobre "${incomingText}". Posso te ajudar com detalhes, opcoes e proximos passos.`;
  }

  if (recent) {
    return `${contextHint} obrigado pela mensagem. Vou considerar o assunto recente "${recent}" e manter a conversa fluindo.`;
  }

  return `${contextHint} recebi sua mensagem e posso continuar o atendimento pelo WhatsApp.`;
}

function createProactiveMessage() {
  const starters = [
    "Oi, passando para saber se posso ajudar com alguma informacao agora.",
    "Tudo certo por ai? Posso continuar o atendimento quando voce quiser.",
    "Estou por aqui caso queira ver opcoes, tirar duvidas ou agendar um proximo passo.",
  ];

  const contextLine = state.context ? " Mantendo o contexto definido no painel." : "";
  const index = Math.floor(Math.random() * starters.length);
  return starters[index] + contextLine;
}

function getRecentUserTopic() {
  const lastUserMessage = [...state.messages].reverse().find((message) => message.role === "user");
  return lastUserMessage?.text.slice(0, 80) ?? "";
}

function getAuthorLabel(role) {
  if (role === "bot") {
    return "IA";
  }

  if (role === "system") {
    return "Sistema";
  }

  return "Cliente";
}

function getNextRunAt() {
  return Date.now() + state.interval * 60 * 1000;
}

function clamp(value, min, max) {
  if (Number.isNaN(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}
