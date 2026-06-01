import "dotenv/config";
import { createApp } from "./app";
import { ensureConfig } from "./services/config.service";
import { startScheduler } from "./services/scheduler.service";

const PORT = Number(process.env.PORT || 3000);
const app = createApp();

app.listen(PORT, async () => {
  await ensureConfig();
  startScheduler();
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
