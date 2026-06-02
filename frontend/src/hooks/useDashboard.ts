"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { BotConfig, Conversation } from "@/types/dashboard";

const initialConfig: BotConfig = {
  phone: "",
  managerPhone: "",
  context: "",
  intervalMinutes: 10,
  temperature: 0.6,
  mode: "reactive",
  active: false,
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useDashboard() {
  const [config, setConfig] = useState(initialConfig);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [testPhone, setTestPhone] = useState("+5511999999999");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");

  async function loadConversations(selectId?: number) {
    const data = await api<Conversation[]>("/conversations");
    setConversations(data);

    const id = selectId ?? selectedConversation?.id;

    if (id) {
      const conversation = await api<Conversation>(`/conversations/${id}`);
      setSelectedConversation(conversation);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const [configData, conversationsData] = await Promise.all([
          api<BotConfig>("/config"),
          api<Conversation[]>("/conversations"),
        ]);

        setConfig(configData);
        setConversations(conversationsData);
      } catch (error) {
        setNotice(getErrorMessage(error, "Erro ao carregar dados."));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function saveConfig(event: FormEvent) {
    event.preventDefault();

    try {
      const data = await api<BotConfig>("/config", {
        method: "POST",
        body: JSON.stringify({
          phone: config.phone,
          managerPhone: config.managerPhone,
          context: config.context,
          interval: config.intervalMinutes,
          temperature: config.temperature,
          mode: config.mode,
        }),
      });

      setConfig(data);
      setNotice("Configuracoes salvas.");
    } catch (error) {
      setNotice(getErrorMessage(error, "Erro ao salvar."));
    }
  }

  async function toggleBot() {
    try {
      const data = await api<BotConfig>("/toggle", { method: "POST" });
      setConfig(data);
      setNotice(data.active ? "Bot ativado." : "Bot pausado.");
    } catch (error) {
      setNotice(getErrorMessage(error, "Erro ao alterar status."));
    }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();

    if (!message.trim() || !testPhone.trim()) return;

    setSending(true);

    try {
      const result = await api<{ conversation: Conversation }>(
        "/incoming-message",
        {
          method: "POST",
          body: JSON.stringify({
            phone: testPhone,
            name: "Cliente teste",
            text: message,
          }),
        },
      );

      setMessage("");
      await loadConversations(result.conversation.id);
    } catch (error) {
      setNotice(getErrorMessage(error, "Erro ao enviar mensagem."));
    } finally {
      setSending(false);
    }
  }

  async function openConversation(id: number) {
    try {
      const conversation = await api<Conversation>(`/conversations/${id}`);
      setSelectedConversation(conversation);
      setTestPhone(conversation.contact.phone);
    } catch (error) {
      setNotice(getErrorMessage(error, "Erro ao abrir conversa."));
    }
  }

  async function resolveConversation() {
    if (!selectedConversation) return;

    try {
      await api(`/conversations/${selectedConversation.id}/resolve`, {
        method: "POST",
      });

      await loadConversations(selectedConversation.id);
      setNotice("Atendimento marcado como resolvido.");
    } catch (error) {
      setNotice(getErrorMessage(error, "Erro ao resolver atendimento."));
    }
  }

  return {
    config,
    conversations,
    selectedConversation,
    testPhone,
    message,
    loading,
    sending,
    notice,
    setConfig,
    setTestPhone,
    setMessage,
    setNotice,
    saveConfig,
    toggleBot,
    sendMessage,
    openConversation,
    resolveConversation,
  };
}
