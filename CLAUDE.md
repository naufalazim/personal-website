# CLAUDE.md

Guidance for working in this repo. Keep this file in sync as the project evolves — update it when a phase in the migration plan lands, don't let it go stale.

## Stack

- Next.js 16 (App Router), React 19, TypeScript.
- Package manager: **pnpm** — always use `pnpm`, not `npm`/`yarn` (there's a committed `pnpm-lock.yaml`).
- Tailwind CSS v4, configured **CSS-first** (`@import 'tailwindcss'` in `app/global.css`) — there is intentionally no `tailwind.config.js`.
- shadcn/ui installed with the Radix base + Nova (Lucide/Geist) preset. Components live in `components/ui/`. Note the generated `cn()` helper (`lib/utils.ts`) re-exports from the `cn` npm package, not a hand-rolled `clsx`+`tailwind-merge` combo — that's this shadcn CLI generation's convention, not a mistake.
- ESLint uses **flat config** (`eslint.config.mjs`), importing `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript` directly as native flat-config arrays. Do not route this through `@eslint/eslintrc`'s `FlatCompat` — on this ESLint 10 + eslint-config-next 16 combination that throws `Converting circular structure to JSON` because `eslint-plugin-react`'s flat config object is self-referential and the legacy validator can't serialize it for an error message. Import the flat exports directly instead.
- `next lint` **does not exist** in Next.js 16 (removed from the CLI) — the `lint` script runs `eslint .` directly.
- The `middleware.ts` convention was renamed to **`proxy.ts`** in Next.js 16 (same behavior, export a function named `proxy` instead of `middleware`). The root `proxy.ts` here protects `/admin/*` via Supabase session + `ADMIN_EMAIL` allow-list (see `lib/supabase/middleware.ts`).
- `lucide-react`'s current major version dropped brand/logo icons (no `Github`, `Twitter`, etc.) — only generic icons remain. Use a generic icon (e.g. `LogIn`) instead.
- **Node version: 24.x (see `.nvmrc`), not 20.** Vitest 5's worker pool imports `undici` internally, which crashes (`Cannot read properties of undefined (reading 'bind')` in its decompress interceptor) on Node 20 — confirmed fixed by switching to Node 24. Supabase's client libraries also warn Node ≤20 support is being dropped. If `pnpm test` fails with that exact undici error, you're on the wrong Node version — check `node --version` against `.nvmrc`.
- **Never put layout-critical auto-margin centering (`mx-auto`, `max-w-*`) directly on `<body>`.** Radix's dropdown/popover scroll-lock (`data-scroll-locked`) manipulates `<body>`'s `overflow`/`padding` directly when any Radix popover opens. On this codebase, `<body className="max-w-xl mx-4 lg:mx-auto">` had its 424.5px auto-margins converted into 424px of `padding` by the scroll-lock, which combined with `max-width: 576px` left zero space for content — collapsing `<main>` to `width: 0` and wrapping all text to one word per line, for as long as any dropdown/popover was open. Root-caused via a live Playwright reproduction (`npx playwright install chromium` + a throwaway driver script — no browser tool was available in-session), not guesswork; confirmed first with computed-style diffing, then visually. Fixed by moving the centering onto a wrapper `<div>` _inside_ `<body>` (see `app/layout.tsx`), so `<body>` itself has no app-specific width/margin styling for Radix to collide with. If you see content reflow/collapse specifically while a Radix popover is open, check this first before anything else.
- **`ExperienceFlow.tsx`'s description text needs an explicit `dark:` pair, not a single fixed shade.** It previously used `text-neutral-300` unconditionally, which is fine on a dark background but fails WCAG AA (was ~1.4:1) on the light-mode white background. Any text color in this codebase that isn't already a shadcn semantic token (`text-foreground`, `text-muted-foreground`, etc.) needs both a light and `dark:` value — don't assume a single neutral-N shade works in both themes without checking contrast.

## Commands

- `pnpm dev` — dev server.
- `pnpm build` — production build (also runs typecheck).
- `pnpm lint` — ESLint.
- `pnpm format` / `pnpm format:check` — Prettier.
- `pnpm typecheck` — `tsc --noEmit`.
- `pnpm db:generate` — generate a Drizzle migration from `lib/db/schema.ts`.
- `pnpm db:migrate` — apply pending migrations (uses `DIRECT_URL`).
- `pnpm db:studio` — Drizzle Studio.

## Conventions

- Prettier config (`.prettierrc`): single quotes, semicolons, trailing commas (es5), 80-char width. Whole repo was reformatted to this baseline — keep new code matching it rather than reformatting unrelated files in unrelated PRs.
- `tsconfig.json`'s `moduleResolution` is `bundler` (Next.js 16 enforces/auto-corrects this on build if it drifts).

## Blog / CMS architecture

Posts live in Supabase Postgres (`posts` table, `lib/db/schema.ts`), not as files. Data access goes through `lib/posts.ts` (`getPublishedPosts`, `getPostBySlug`, `getAllPostsForAdmin`, `createPost`, `updatePost`, `deletePost`), which Drizzle queries directly via a pooled `postgres.js` connection (`lib/db/index.ts`, using `DATABASE_URL` — the Supabase **transaction pooler**, port 6543). Migrations run against `DIRECT_URL` (port 5432) via `drizzle-kit`.

**Admin auth** (`/admin/*`): Supabase Auth + GitHub OAuth, restricted server-side to one email (`ADMIN_EMAIL` env var). `proxy.ts` gates routes at the edge; `lib/admin.ts`'s `requireAdmin()` re-checks inside every server action in `app/admin/(dashboard)/actions.ts` (defense in depth — never trust the proxy alone). Login flow: `app/admin/login` → `signInWithOAuth` → `app/auth/callback/route.ts` exchanges the code for a session.

The GitHub OAuth App's callback URL must point at **Supabase**, not this app: `https://<project-ref>.supabase.co/auth/v1/callback`. Supabase exchanges the code with GitHub itself, then redirects to this app's `redirectTo` (`/auth/callback`) with its own code for `exchangeCodeForSession`. Also: the GitHub provider has to be explicitly toggled on in Supabase dashboard → Authentication → Providers — it's not on by default, and signing in without it fails with `Unsupported provider: provider is not enabled`.

**Route structure**: dashboard pages (`page.tsx`, `new/`, `[id]/edit/`, `actions.ts`, `post-editor.tsx`, etc.) live under `app/admin/(dashboard)/` — a route group, so the URLs are still `/admin`, `/admin/new`, etc. `app/admin/login/` is deliberately **outside** that group so it does _not_ inherit `(dashboard)/layout.tsx`'s "Admin / Sign out" header shell. `app/admin/login/page.tsx` also checks the session itself and redirects to `/admin` if you're already authenticated as the admin — without that, visiting `/admin/login` while already logged in just shows the login form forever with no way back into the dashboard (this was a real bug, not hypothetical).

**Writing posts**: `/admin` (list) → `/admin/new` or `/admin/[id]/edit`, using the shared `app/admin/(dashboard)/post-editor.tsx` (plain Markdown textarea + `react-markdown` preview, no WYSIWYG — intentional, single-author minimalist CMS). Cover images upload to the Supabase Storage `post-covers` bucket via `uploadCoverImageAction`.

**Critical gotcha — DB-touching pages must be `force-dynamic`:** `app/page.tsx`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, and `app/sitemap.ts` all export `export const dynamic = 'force-dynamic'`. This was not a style choice — without it, `next build`'s static-generation phase makes build-time queries against Supabase that reliably hung for 60s+ per page (reproduced consistently across both Turbopack and webpack, with and without the dev sandbox, while the exact same queries run in under a second from a plain Node script or `next dev`). The root cause was never fully isolated (looks specific to how Next's SSG worker processes handle this particular `postgres.js`/Supabase pooler combination), but `force-dynamic` sidesteps it entirely and is also the architecturally correct choice here: these pages must reflect new/edited posts immediately with no redeploy, so build-time pre-rendering was never the right fit anyway. If you're tempted to add back `generateStaticParams`/ISR for performance later, re-test a full `pnpm build` carefully before committing to it.

Env vars (see `.env.example`): `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, `NEXT_PUBLIC_SITE_URL`.

## Migration status

All 9 phases (0–8) of the 2026 portfolio migration plan are code-complete: tooling, Tailwind v4 + shadcn/ui, theme toggle, DB-backed blog CMS, SEO/perf/UX hardening, Vitest tests, and GitHub Actions CI (`.github/workflows/ci.yml`).

Outstanding manual steps (not something a future session can do from the repo alone):

- Register the GitHub OAuth app in the Supabase dashboard (callback URL must match `app/auth/callback/route.ts`'s deployed path) — admin login won't work until this is done.
- Add the Supabase secrets (`DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`) to the GitHub repo's Actions secrets, or CI's build step will fail.
- First production deploy to Vercel, with the same env vars set there too.
