import { getPublishedPosts } from '@/lib/posts';

export const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const posts = await getPublishedPosts();
  const blogs = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const routes = ['', '/blog'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }));

  return [...routes, ...blogs];
}
