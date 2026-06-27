import { requireAuth } from '@/lib/utils/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PaymentVerification } from '@/components/admin/PaymentVerification';

export default async function AdminPaymentsPage() {
  const user = await requireAuth();
  const supabase = await getSupabaseServerClient();
  
  // Check if user is admin
  const { data: userData } :any= await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!userData?.is_admin) {
    redirect('/account');
  }

  // Fetch pending payments
  const { data: pendingPayments } = await supabase
    .from('payments')
    .select(`
      *,
      user:users (
        name,
        email,
        phone
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Payment Verification</h1>
      <PaymentVerification payments={pendingPayments || []} />
    </div>
  );
}