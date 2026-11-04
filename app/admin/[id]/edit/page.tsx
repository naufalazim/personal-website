import { notFound } from 'next/navigation';
import { getPostById } from '@/lib/posts';
import { PostEditor } from '../../post-editor';

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <div>
      <h1 className="mb-6 text-xl font-medium tracking-tight">Edit post</h1>
      <PostEditor mode="edit" post={post} />
    </div>
  );
}
