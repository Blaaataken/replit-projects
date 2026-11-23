import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use postgres-js for better compatibility with Neon serverless
const client = postgres(process.env.DATABASE_URL, {
  prepare: false, // Disable prepared statements for Neon compatibility
  max: 1, // Limit connections for serverless
});

export const db = drizzle({ client, schema });
