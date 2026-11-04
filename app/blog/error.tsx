'use client';

import { Button } from '@/components/ui/button';

export default function BlogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold tracking-tighter">
        Couldn&apos;t load this post
      </h1>
      <p className="mb-6 text-neutral-600 dark:text-neutral-400">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <Button onClick={reset}>Try again</Button>
    </section>
  );
}
