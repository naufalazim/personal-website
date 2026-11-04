import { LogIn } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { signInWithGitHub } from './actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user?.email === process.env.ADMIN_EMAIL) {
    redirect('/admin');
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-medium tracking-tight">Admin sign in</h1>
      {error && (
        <p className="text-sm text-destructive">
          Sign-in failed. Please try again.
        </p>
      )}
      <form action={signInWithGitHub}>
        <Button type="submit" variant="outline">
          <LogIn className="mr-2 size-4" />
          Sign in with GitHub
        </Button>
      </form>
    </div>
  );
}
