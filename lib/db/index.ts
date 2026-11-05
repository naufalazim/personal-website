import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Use the Supabase Transaction pooler URL (project Settings > Database > Connection string > "Transaction", port 6543) — not the direct connection (port 5432), which is for drizzle-kit migrations (DIRECT_URL) only.'
  );
}

if (
  process.env.NODE_ENV === 'production' &&
  (process.env.DATABASE_URL.includes('localhost') ||
    process.env.DATABASE_URL.includes('127.0.0.1'))
) {
  throw new Error(
    'DATABASE_URL points at localhost in a production environment. Set it to the hosted Supabase pooler URL (see .env.example).'
  );
}

// Vercel serverless functions can reuse a warm module across invocations,
// but `next dev`'s Fast Refresh re-evaluates this module on every edit —
// without stashing the client on `globalThis`, each reload opened a new
// connection to the pooler that was never closed.
const globalForDb = globalThis as unknown as {
  __dbClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.__dbClient ??
  postgres(process.env.DATABASE_URL, {
    prepare: false, // required: the transaction pooler doesn't support prepared statements
    max: 1, // one connection per serverless invocation; the pooler fans out across invocations
    connect_timeout: 5, // fail fast on a bad/unreachable host instead of hanging on the request
    idle_timeout: 20,
    max_lifetime: 60 * 30, // recycle connections periodically so the pooler doesn't hold them forever
    ssl: 'require', // the pooler rejects plaintext connections; the DATABASE_URL itself doesn't encode sslmode
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__dbClient = client;
}

export const db = drizzle(client, { schema });
