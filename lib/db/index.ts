import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

type Db = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  __dbClient?: ReturnType<typeof postgres>;
};

function createDb(): Db {
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

  const client =
    globalForDb.__dbClient ??
    postgres(process.env.DATABASE_URL, {
      prepare: false,
      max: 1,
      connect_timeout: 5,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
      ssl: 'require',
      queue_timeout: 10,
      backoff: (attempt) => Math.min(attempt * 0.5, 3),
      connection: {
        statement_timeout: 10_000,
      },
    });

  if (process.env.NODE_ENV !== 'production') {
    globalForDb.__dbClient = client;
  }

  return drizzle(client, { schema });
}

let dbInstance: Db | undefined;

// Lazy: `next build` imports every route module to read config exports,
// which transitively evaluates this file — a module-scope throw crashed
// the build for any route touching the DB. Deferring to first use keeps
// the build independent of DB config.
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    dbInstance ??= createDb();
    const value = Reflect.get(dbInstance, prop);
    return typeof value === 'function' ? value.bind(dbInstance) : value;
  },
});
