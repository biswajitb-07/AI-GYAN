import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { startNewsSyncScheduler } from "./services/newsSyncService.js";

const startServer = async () => {
  await connectDatabase();
  startNewsSyncScheduler();

  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
