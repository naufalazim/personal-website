import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

type Db = PostgresJsDatabase<typeof schema>;

// Vercel serverless functions can reuse a warm module across invocations,
// but `next dev`'s Fast Refresh re-evaluates this module on every edit —
// without stashing the client on `globalThis`, each reload opened a new
// connection to the pooler that was never closed.
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
      prepare: false, // required: the transaction pooler doesn't support prepared statements
      max: 1, // one connection per serverless invocation; the pooler fans out across invocations
      connect_timeout: 5, // fail fast on a bad/unreachable host instead of hanging on the request
      idle_timeout: 20,
      max_lifetime: 60 * 30, // recycle connections periodically so the pooler doesn't hold them forever
      ssl: 'require', // the pooler rejects plaintext connections; the DATABASE_URL itself doesn't encode sslmode
      // Both default to unbounded: queue_timeout=0 means a second query (e.g.
      // generateMetadata + page body both calling getPostBySlug) waits
      // forever for this single connection if it's mid-retry, and the
      // default backoff grows exponentially with no cap. Observed in
      // practice: a transient network blip to the pooler turned into a
      // request that hung for over an hour instead of failing in seconds.
      queue_timeout: 10,
      backoff: (attempt) => Math.min(attempt * 0.5, 3),
      connection: {
        statement_timeout: 10_000, // kill a stuck query server-side after 10s
      },
    });

  if (process.env.NODE_ENV !== 'production') {
    globalForDb.__dbClient = client;
  }

  return drizzle(client, { schema });
}

let dbInstance: Db | undefined;

// Lazy on purpose. `next build`'s "Collecting page data" phase imports every
// route module to read its config exports, which transitively evaluates this
// file — so validating env vars at module scope crashed the whole build on
// any route that touches the DB (observed: "Failed to collect page data for
// /sitemap.xml"), even though those routes are `force-dynamic` and never run
// a query at build time. Connecting on first use instead keeps the build
// independent of DB config while still failing loudly at request time.
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    dbInstance ??= createDb();
    const value = Reflect.get(dbInstance, prop);
    return typeof value === 'function' ? value.bind(dbInstance) : value;
  },
});
