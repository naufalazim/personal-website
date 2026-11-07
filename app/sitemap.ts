import { getPublishedPosts } from '@/lib/posts';
import { baseUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const routes = ['', '/blog'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }));

  // Degrade to the static routes rather than erroring: a sitemap missing a
  // few posts is far better for crawlers than a 500.
  let blogs: { url: string; lastModified: string }[] = [];
  try {
    const posts = await getPublishedPosts();
    blogs = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.metadata.publishedAt,
    }));
  } catch (error) {
    console.error('sitemap: failed to load posts', error);
  }

  return [...routes, ...blogs];
}
