import { baseUrl } from '@/lib/site';
import { getPublishedPosts } from '@/lib/posts';

// Queries the DB; without this, a bare GET route handler is statically
// cached at build time, same hazard as the pages listed in CLAUDE.md.
export const dynamic = 'force-dynamic';

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
