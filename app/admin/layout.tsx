import Link from 'next/link';
import { Toaster } from '@/components/ui/sonner';
import { SignOutButton } from './sign-out-button';

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
