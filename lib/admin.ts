import { createClient } from '@/lib/supabase/server';

export async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user?.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Unauthorized');
  }

  return data.user;
}
