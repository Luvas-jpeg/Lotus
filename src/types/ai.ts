export type AiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AiResult = {
  reply: string;
  needsHuman: boolean;
  handoffReason: string | null;
  confidence: number;
};
