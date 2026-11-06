import { and, desc, eq, ne } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { db } from '@/lib/db';
import { posts, type NewPost, type Post } from '@/lib/db/schema';

// Tag invalidated by admin writes (see `revalidateBlog` in
// app/admin/(dashboard)/actions.ts) so published edits show up immediately
// without waiting out the revalidate window below.
const POSTS_CACHE_TAG = 'posts';

export type BlogPostMeta = {
  slug: string;
  metadata: {
    title: string;
    publishedAt: string;
    summary: string;
    image?: string;
  };
};

export type BlogPost = BlogPostMeta & { content: string };

function toBlogPostMeta(
  post: Omit<Post, 'content'>
): BlogPostMeta {
  return {
    slug: post.slug,
    metadata: {
      title: post.title,
      publishedAt: (post.publishedAt ?? post.createdAt).toISOString(),
      summary: post.excerpt ?? '',
      image: post.coverImage ?? undefined,
    },
  };
}

// Cached: this backs the homepage, /blog, /rss, and /sitemap.xml, all of
// which were hitting the DB on every single request. Pages stay
// `force-dynamic` (see CLAUDE.md on why) — only the query result is
// cached, invalidated instantly on publish/edit/delete via revalidateTag,
// with `revalidate` below as a ceiling in case that ever gets missed.
// Deliberately excludes `content` — nothing in the list/feed/sitemap
// callers reads post bodies, only `getPostBySlug` (the detail page) does.
export const getPublishedPosts = unstable_cache(
  async (limit?: number): Promise<BlogPostMeta[]> => {
    const query = db
      .select({
        slug: posts.slug,
        title: posts.title,
        excerpt: posts.excerpt,
        coverImage: posts.coverImage,
        publishedAt: posts.publishedAt,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .where(eq(posts.status, 'published'))
      .orderBy(desc(posts.publishedAt));

    const rows = limit ? await query.limit(limit) : await query;
    return rows.map(toBlogPostMeta);
  },
  ['published-posts'],
  { tags: [POSTS_CACHE_TAG], revalidate: 60 }
);

// Also wrapped in React's per-request `cache()`: app/blog/[slug]/page.tsx
// calls this from both `generateMetadata` and the page body. Without this,
// those are two independent calls that each wait on the DB connection —
// unstable_cache only dedupes once a result has actually been cached, so
// on a cold/retrying connection both calls queue for the same connection.
export const getPostBySlug = cache(
  unstable_cache(
    async (slug: string): Promise<BlogPost | undefined> => {
      const [row] = await db
        .select()
        .from(posts)
        .where(and(eq(posts.slug, slug), eq(posts.status, 'published')))
        .limit(1);

      return row ? { ...toBlogPostMeta(row), content: row.content } : undefined;
    },
    ['post-by-slug'],
    { tags: [POSTS_CACHE_TAG], revalidate: 60 }
  )
);

// The admin list only renders title/status/date, never the body — select
// just those columns instead of pulling every post's full `content`.
export async function getAllPostsForAdmin() {
  return db
    .select({
      id: posts.id,
      title: posts.title,
      status: posts.status,
      publishedAt: posts.publishedAt,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .orderBy(desc(posts.createdAt))
    .limit(100);
}

export async function getPostById(id: string): Promise<Post | undefined> {
  const [row] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return row;
}

export async function createPost(data: NewPost): Promise<Post> {
  const [row] = await db.insert(posts).values(data).returning();
  return row;
}

export async function updatePost(
  id: string,
  data: Partial<NewPost>
): Promise<Post> {
  const [row] = await db
    .update(posts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(posts.id, id))
    .returning();
  return row;
}

export async function deletePost(id: string): Promise<void> {
  await db.delete(posts).where(eq(posts.id, id));
}

export async function isSlugTaken(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const rows = await db
    .select({ id: posts.id })
    .from(posts)
    .where(
      excludeId
        ? and(eq(posts.slug, slug), ne(posts.id, excludeId))
        : eq(posts.slug, slug)
    )
    .limit(1);

  return rows.length > 0;
}
