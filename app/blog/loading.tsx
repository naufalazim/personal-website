import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <section>
      <Skeleton className="mb-8 h-8 w-32" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-64" />
          </div>
        ))}
      </div>
    </section>
  );
}
