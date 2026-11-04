import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <section className="flex flex-col gap-4">
      <Skeleton className="h-40 w-40 rounded-full" />
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </section>
  );
}
