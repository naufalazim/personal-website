# naufalazim.com

Personal portfolio and blog, built with Next.js (App Router), React, and TypeScript.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first configuration, no `tailwind.config.js`) + [shadcn/ui](https://ui.shadcn.com/)
- Light/dark/system theme via [next-themes](https://github.com/pacocoursey/next-themes)
- Blog posts stored in Supabase Postgres, queried with [Drizzle ORM](https://orm.drizzle.team/), rendered with `next-mdx-remote`
- Owner-only admin CMS (`/admin`) gated by Supabase Auth (GitHub OAuth, restricted to one email)

## Getting started

Requires Node (see `.nvmrc`) and [pnpm](https://pnpm.io/).

```bash
pnpm install
cp .env.example .env.local   # fill in the values, see below
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See `.env.example` for the full list. You'll need a [Supabase](https://supabase.com) project with:

- A Postgres database (`DATABASE_URL` — transaction pooler, port 6543; `DIRECT_URL` — direct/session connection, port 5432, used only for migrations)
- Auth enabled with the GitHub provider
- A public Storage bucket named `post-covers`

`ADMIN_EMAIL` is the one email allowed into `/admin` — it must match the email on the GitHub account used to sign in there.

## Writing a blog post

1. Go to `/admin` and sign in with GitHub.
2. Click **New post**, write in Markdown (there's a Write/Preview toggle), optionally upload a cover image.
3. **Save draft** keeps it unpublished; **Publish** makes it live immediately — no redeploy needed. The blog list, the post page, the homepage's "Recent posts" section, the sitemap, and the RSS feed are all rendered dynamically straight from the database.

Run `pnpm db:generate` + `pnpm db:migrate` after changing `lib/db/schema.ts`.

## Scripts

| Command             | Description                       |
| ------------------- | --------------------------------- |
| `pnpm dev`          | Start the dev server              |
| `pnpm build`        | Production build                  |
| `pnpm start`        | Run the production build          |
| `pnpm lint`         | Run ESLint                        |
| `pnpm format`       | Format the codebase with Prettier |
| `pnpm format:check` | Check formatting without writing  |
| `pnpm typecheck`    | Run `tsc --noEmit`                |
| `pnpm db:generate`  | Generate a Drizzle migration      |
| `pnpm db:migrate`   | Apply pending migrations          |
| `pnpm db:studio`    | Open Drizzle Studio               |
