import { config as loadEnv } from "dotenv";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

loadEnv({ path: resolve(__dirname, "../../../../.env") });

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET || "aura-arena-dev-secret",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
};
