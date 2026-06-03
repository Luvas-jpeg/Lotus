-- The default prompt lives in backend/src/ai/prompt.ts.
-- BotConfig.systemPrompt is reserved only for future user overrides.
UPDATE "BotConfig"
SET "systemPrompt" = ''
WHERE "systemPrompt" IS NOT NULL
  AND trim("systemPrompt") <> '';
