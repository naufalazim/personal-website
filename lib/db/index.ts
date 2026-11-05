import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (
  process.env.NODE_ENV === 'production' &&
  (process.env.DATABASE_URL?.includes('localhost') ||
    process.env.DATABASE_URL?.includes('127.0.0.1'))
) {
  throw new Error(
    'DATABASE_URL points at localhost in a production environment. Set it to the hosted Supabase pooler URL (see .env.example).'
  );
}

const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,
  max: 1,
  connect_timeout: 10,
  idle_timeout: 20,
});

export const db = drizzle(client, { schema });
