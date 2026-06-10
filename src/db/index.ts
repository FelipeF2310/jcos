import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// One connection per serverless instance, no prepared statements — keeps
// Vercel function instances from exhausting Neon's connection limit and
// stays compatible with transaction-mode pooling.
const client = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });

export const db = drizzle(client, { schema });
