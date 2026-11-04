# naufalazim.com

## This project I used AI Claude to enhance. My first time using AI Claude

Personal portfolio and blog, built with Next.js (App Router), React, and TypeScript.

Live at [naufalazim.com](https://naufalazim.com), deployed on [Vercel](https://vercel.com). Every push to `main` runs [GitHub Actions CI](.github/workflows/ci.yml) (lint, typecheck, test, build) and triggers a Vercel deploy.

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

In **production** (Vercel), set the same variables in Project Settings → Environment Variables. In **CI** (GitHub Actions), set them as repo secrets under Settings → Secrets and variables → Actions — the build step needs them to query Supabase.

## Writing a blog post

1. **Sign in**: go to `https://naufalazim.com/admin` and click **Sign in with GitHub**. You'll be redirected back once Supabase verifies your email matches `ADMIN_EMAIL`.
2. **New post**: from the post list, click **New post**.
3. **Fill in the fields**:
   - **Title** — the slug auto-fills from this (editable afterwards if you want a custom URL).
   - **Excerpt** — short summary shown in the blog list and used as the meta description.
   - **Tags** — comma-separated, optional.
   - **Cover image** — optional, uploads to Supabase Storage.
   - **Content** — Markdown, with a Write/Preview tab to check rendering before publishing.
4. **Save draft** keeps it private (visible only in `/admin`); **Publish** makes it live immediately.
5. Published posts appear right away on `/blog`, the homepage's "Recent posts" section, the individual `/blog/[slug]` page, the sitemap, and the RSS feed — no redeploy needed, since those pages render straight from the database on every request.
6. To edit or delete later, go back to `/admin` and use the **Edit**/**Delete** buttons next to each post.

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
