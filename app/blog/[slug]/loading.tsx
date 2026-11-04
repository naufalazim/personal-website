import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <section>
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="mt-2 mb-8 h-4 w-32" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </section>
  );
}
