'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin';
import {
  createPost as dbCreatePost,
  deletePost as dbDeletePost,
  getPostById,
  isSlugTaken,
  updatePost as dbUpdatePost,
} from '@/lib/posts';
import { createClient } from '@/lib/supabase/server';
import type { NewPost } from '@/lib/db/schema';

type ActionResult = { error: string } | void;

function parsePostForm(formData: FormData): Omit<NewPost, 'publishedAt'> {
  const title = String(formData.get('title') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim();
  const excerpt = String(formData.get('excerpt') ?? '').trim();
  const content = String(formData.get('content') ?? '');
  const coverImage = String(formData.get('coverImage') ?? '').trim();
  const status = formData.get('status') === 'published' ? 'published' : 'draft';
  const tags = String(formData.get('tags') ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    title,
    slug,
    excerpt: excerpt || null,
    content,
    coverImage: coverImage || null,
    tags,
    status,
  };
}

function revalidateBlog(slug?: string) {
  revalidatePath('/blog');
  revalidatePath('/sitemap.xml');
  revalidatePath('/rss');
  revalidatePath('/');
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function createPostAction(
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const data = parsePostForm(formData);

  if (!data.title || !data.slug || !data.content) {
    return { error: 'Title, slug, and content are required.' };
  }

  if (await isSlugTaken(data.slug)) {
    return { error: `Slug "${data.slug}" is already in use.` };
  }

  const post = await dbCreatePost({
    ...data,
    publishedAt: data.status === 'published' ? new Date() : null,
  });

  revalidateBlog(post.slug);
  redirect('/admin');
}

export async function updatePostAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const existing = await getPostById(id);
  if (!existing) {
    return { error: 'Post not found.' };
  }

  const data = parsePostForm(formData);

  if (!data.title || !data.slug || !data.content) {
    return { error: 'Title, slug, and content are required.' };
  }

  if (data.slug !== existing.slug && (await isSlugTaken(data.slug, id))) {
    return { error: `Slug "${data.slug}" is already in use.` };
  }

  const wasPublished = existing.status === 'published';
  const isNowPublished = data.status === 'published';

  const post = await dbUpdatePost(id, {
    ...data,
    publishedAt:
      isNowPublished && !wasPublished
        ? new Date()
        : (existing.publishedAt ?? (isNowPublished ? new Date() : null)),
  });

  revalidateBlog(existing.slug);
  if (post.slug !== existing.slug) revalidateBlog(post.slug);
  redirect('/admin');
}

export async function deletePostAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const existing = await getPostById(id);
  await dbDeletePost(id);
  revalidateBlog(existing?.slug);
}

export async function uploadCoverImageAction(
  formData: FormData
): Promise<{ url: string } | { error: string }> {
  await requireAdmin();
  const file = formData.get('file');

  if (!(file instanceof File) || file.size === 0) {
    return { error: 'No file provided.' };
  }

  const supabase = await createClient();
  const extension = file.name.split('.').pop() ?? 'jpg';
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from('post-covers')
    .upload(path, file, { contentType: file.type });

  if (error) {
    return { error: `Upload failed: ${error.message}` };
  }

  const { data } = supabase.storage.from('post-covers').getPublicUrl(path);
  return { url: data.publicUrl };
}
