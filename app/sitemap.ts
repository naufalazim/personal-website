import { getPublishedPosts } from '@/lib/posts';
import { baseUrl } from '@/lib/site';

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
