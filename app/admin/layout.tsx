import { requireAuth } from '@/lib/utils/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServerClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('is_admin, is_paid, trial_end, name')
    .eq('id', user.id)
    .single();

  if (!userData?.is_admin) {
    redirect('/account');
  }

  const fullUser = {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || userData?.name || 'Admin',
    isAdmin: userData.is_admin,
    isPaid: userData.is_paid,
    trialEnd: userData.trial_end,
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader user={fullUser} />
      <div className="flex">
        <AdminSidebar />
        {/* pb-16 md:pb-0 clears the mobile bottom nav */}
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}