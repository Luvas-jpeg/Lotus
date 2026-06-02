export type BotConfig = {
  phone: string;
  managerPhone: string;
  context: string;
  intervalMinutes: number;
  temperature: number;
  mode: "reactive" | "proactive";
  active: boolean;
};

export type Message = {
  id: number;
  role: "user" | "bot" | "system";
  text: string;
  createdAt: string;
};

export type Conversation = {
  id: number;
  status: "bot" | "needs_human" | "resolved";
  contact: {
    name: string | null;
    phone: string;
  };
  messages: Message[];
  updatedAt: string;
};
