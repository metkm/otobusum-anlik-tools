import postgres from "postgres";
import _logger from "pino";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw "DATABASE_URL env variable required";
}

export const logger = _logger({
  transport: {
    target: 'pino-pretty'
  },
})
export const sql = postgres(process.env.DATABASE_URL);
