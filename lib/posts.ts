import { and, desc, eq, ne } from 'drizzle-orm';
import { db } from '@/lib/db';
import { posts, type NewPost, type Post } from '@/lib/db/schema';

export type BlogPost = {
  slug: string;
  content: string;
  metadata: {
    title: string;
    publishedAt: string;
    summary: string;
    image?: string;
  };
};

function toBlogPost(post: Post): BlogPost {
  return {
    slug: post.slug,
    content: post.content,
    metadata: {
      title: post.title,
      publishedAt: (post.publishedAt ?? post.createdAt).toISOString(),
      summary: post.excerpt ?? '',
      image: post.coverImage ?? undefined,
    },
  };
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const rows = await db
    .select()
    .from(posts)
    .where(eq(posts.status, 'published'))
    .orderBy(desc(posts.publishedAt));

  return rows.map(toBlogPost);
}

export async function getPostBySlug(
  slug: string
): Promise<BlogPost | undefined> {
  const [row] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, 'published')))
    .limit(1);

  return row ? toBlogPost(row) : undefined;
}

export async function getAllPostsForAdmin(): Promise<Post[]> {
  return db.select().from(posts).orderBy(desc(posts.createdAt));
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
