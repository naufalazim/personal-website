import Link from 'next/link';
import { getAllPostsForAdmin } from '@/lib/posts';
import { formatDate } from '@/app/blog/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DeletePostButton } from './delete-post-button';

export default async function AdminPage() {
  const posts = await getAllPostsForAdmin();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-medium tracking-tight">Posts</h1>
        <Button asChild>
          <Link href="/admin/new">New post</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                No posts yet.
              </TableCell>
            </TableRow>
          )}
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>{post.title}</TableCell>
              <TableCell>
                <Badge
                  variant={post.status === 'published' ? 'default' : 'outline'}
                >
                  {post.status}
                </Badge>
              </TableCell>
              <TableCell>
                {formatDate((post.publishedAt ?? post.createdAt).toISOString())}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/${post.id}/edit`}>Edit</Link>
                </Button>
                <DeletePostButton id={post.id} title={post.title} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
