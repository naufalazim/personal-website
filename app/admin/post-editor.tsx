'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  createPostAction,
  updatePostAction,
  uploadCoverImageAction,
} from './actions';
import type { Post } from '@/lib/db/schema';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function PostEditor({
  mode,
  post,
}: {
  mode: 'create' | 'edit';
  post?: Post;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(post?.title ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [content, setContent] = useState(post?.content ?? '');
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? '');

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  async function handleCoverUpload(file: File) {
    setIsUploading(true);
    const formData = new FormData();
    formData.set('file', file);
    const result = await uploadCoverImageAction(formData);
    setIsUploading(false);

    if ('error' in result) {
      toast.error(result.error);
      return;
    }
    setCoverImage(result.url);
  }

  function handleSubmit(formData: FormData, status: 'draft' | 'published') {
    formData.set('status', status);
    formData.set('coverImage', coverImage);

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createPostAction(formData)
          : await updatePostAction(post!.id, formData);

      if (result && 'error' in result) {
        toast.error(result.error);
        return;
      }
      router.push('/admin');
    });
  }

  return (
    <form className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          defaultValue={post?.excerpt ?? ''}
          rows={2}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          name="tags"
          defaultValue={post?.tags?.join(', ') ?? ''}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="cover">Cover image</Label>
        <input
          ref={fileInputRef}
          id="cover"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleCoverUpload(file);
          }}
        />
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? 'Uploading…' : 'Upload image'}
          </Button>
          {coverImage && (
            <Image
              src={coverImage}
              alt="Cover preview"
              width={80}
              height={45}
              className="rounded-md border object-cover"
            />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Content (Markdown)</Label>
        <Tabs defaultValue="write">
          <TabsList>
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="write">
            <Textarea
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              className="font-mono text-sm"
              required
            />
          </TabsContent>
          <TabsContent value="preview">
            <div className="prose min-h-40 rounded-md border px-4 py-3">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || '*Nothing to preview yet.*'}
              </ReactMarkdown>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={(e) => {
            const formData = new FormData(e.currentTarget.form!);
            handleSubmit(formData, 'draft');
          }}
        >
          Save draft
        </Button>
        <Button
          type="button"
          disabled={isPending}
          onClick={(e) => {
            const formData = new FormData(e.currentTarget.form!);
            handleSubmit(formData, 'published');
          }}
        >
          Publish
        </Button>
      </div>
    </form>
  );
}
