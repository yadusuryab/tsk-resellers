import { requireAuth } from '@/lib/utils/auth';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { UPICheckout } from '@/components/sub-checkout/UPICheckout';

export default async function CheckoutPage() {
  const user = await requireAuth();
  const supabase = await getSupabaseServerClient();
  
  // Check if user already has a pending payment
  const { data: pendingPayment } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // If user is already paid, redirect to account
  if (user.isPaid) {
    redirect('/account');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Complete Your Subscription
          </h1>
          <p className="mt-2 text-gray-600">
            Pay ₹300 to unlock all premium features
          </p>
        </div>

        <div className="mt-8">
          <UPICheckout user={user} existingPayment={pendingPayment} />
        </div>
      </div>
    </div>
  );
}