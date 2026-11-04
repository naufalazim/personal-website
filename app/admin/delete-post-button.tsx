'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { deletePostAction } from './actions';

export function DeletePostButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    startTransition(async () => {
      const result = await deletePostAction(id);
      if (result && 'error' in result) {
        toast.error(result.error);
        return;
      }
      toast.success('Post deleted.');
      router.refresh();
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={handleDelete}
    >
      Delete
    </Button>
  );
}
