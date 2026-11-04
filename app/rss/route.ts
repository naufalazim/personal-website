import { baseUrl } from 'app/sitemap';
import { getPublishedPosts } from '@/lib/posts';

export async function GET() {
  const allBlogs = await getPublishedPosts();

  const itemsXml = allBlogs
    .map(
      (post) =>
        `<item>
          <title>${post.metadata.title}</title>
          <link>${baseUrl}/blog/${post.slug}</link>
          <description>${post.metadata.summary || ''}</description>
          <pubDate>${new Date(
            post.metadata.publishedAt
          ).toUTCString()}</pubDate>
        </item>`
    )
    .join('\n');

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
        <title>Naufal Azim</title>
        <link>${baseUrl}</link>
        <description>Naufal Azim's blog RSS feed</description>
        ${itemsXml}
    </channel>
  </rss>`;

  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}
