import { PostEditor } from '../post-editor';

export default function NewPostPage() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-medium tracking-tight">New post</h1>
      <PostEditor mode="create" />
    </div>
  );
}
