import postgres from "postgres";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw "DATABASE_URL env variable required";
}

export const sql = postgres(process.env.DATABASE_URL);
