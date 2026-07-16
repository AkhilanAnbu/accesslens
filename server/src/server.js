import "dotenv/config";
import { createApp } from "./app.js";
import { closeDatabase, connectToDatabase } from "./config/database.js";

const port = Number.parseInt(process.env.PORT, 10) || 3000;

try {
  const database = await connectToDatabase();
  const app = createApp(database);
  const server = app.listen(port, () => {
    console.log(`AccessLens server is running on http://localhost:${port}`);
  });

  async function shutdown(signal) {
    console.log(`Received ${signal}. Closing AccessLens.`);
    server.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
} catch (error) {
  console.error("Unable to start AccessLens:", error.message);
  process.exit(1);
}
