import { requireAdmin } from '@/lib/utils/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export default async function DebugPage() {
  const user = await requireAdmin();
  const supabase = await getSupabaseServerClient();
  
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Admin Debug Info</h1>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
        {JSON.stringify({ user, userData }, null, 2)}
      </pre>
    </div>
  );
}