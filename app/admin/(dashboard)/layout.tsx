import Link from 'next/link';
import { Toaster } from '@/components/ui/sonner';
import { SignOutButton } from './sign-out-button';

// Every page under this route group touches the DB (directly or via a
// server action) and must reflect admin edits immediately — never
// statically prerendered at build time, regardless of what any individual
// page.tsx declares.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="my-8">
      <header className="mb-8 flex items-center justify-between border-b pb-4">
        <Link href="/admin" className="font-medium tracking-tight">
          Admin
        </Link>
        <SignOutButton />
      </header>
      {children}
      <Toaster />
    </div>
  );
}
