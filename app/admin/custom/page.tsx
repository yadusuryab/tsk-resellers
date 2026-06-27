import { getSupabaseServerClient } from '@/lib/supabase/server';
import { sanityClient } from '@/lib/sanity';
import {
  IconUsers,
  IconShoppingBag,
  IconCurrencyRupee,
  IconClock,
  IconCheck,
  IconBan,
  IconTrendingUp,
} from '@tabler/icons-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

async function getDashboardStats() {
  const supabase = await getSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: userData } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user?.id)
    .single();

  if (!userData?.is_admin) throw new Error('Unauthorized');

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const [
    totalUsersResult,
    paidUsersResult,
    bannedUsersResult,
    activeTrialsResult,
    pendingPaymentsResult,
    revenueData,
    recentUsersResult,
  ] = await Promise.all([
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('is_paid', true),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('is_banned', true),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('is_paid', false).gt('trial_end', new Date().toISOString()),
    supabaseAdmin.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('payments').select('amount').eq('status', 'verified'),
    supabaseAdmin.from('users').select('*').order('created_at', { ascending: false }).limit(5),
  ]);

  const paymentRevenue = revenueData.data?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;

  const totalOrders = await sanityClient.fetch(`count(*[_type == "order"])`);
  const orders = await sanityClient.fetch(`*[_type == "order"] { totalAmount }`);
  const orderRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

  const recentOrders = await sanityClient.fetch(`
    *[_type == "order"] | order(orderedAt desc)[0...5] {
      _id, customerName, totalAmount, orderStatus, orderedAt, resellerEmail
    }
  `);

  return {
    totalUsers: totalUsersResult.count || 0,
    totalOrders,
    totalRevenue: paymentRevenue + orderRevenue,
    pendingPayments: pendingPaymentsResult.count || 0,
    paidUsers: paidUsersResult.count || 0,
    bannedUsers: bannedUsersResult.count || 0,
    activeTrials: activeTrialsResult.count || 0,
    recentOrders,
    recentUsers: recentUsersResult.data || [],
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: IconUsers, color: 'bg-blue-500', link: '/admin/custom/users' },
    { title: 'Total Orders', value: stats.totalOrders, icon: IconShoppingBag, color: 'bg-green-500', link: '/admin/custom/orders' },
    { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IconCurrencyRupee, color: 'bg-purple-500', link: '/admin/custom/orders' },
    { title: 'Pending Payments', value: stats.pendingPayments, icon: IconClock, color: 'bg-yellow-500', link: '/admin/custom/payments' },
    { title: 'Paid Users', value: stats.paidUsers, icon: IconCheck, color: 'bg-emerald-500', link: '/admin/custom/users?filter=paid' },
    { title: 'Banned Users', value: stats.bannedUsers, icon: IconBan, color: 'bg-red-500', link: '/admin/custom/users?filter=banned' },
    { title: 'Active Trials', value: stats.activeTrials, icon: IconTrendingUp, color: 'bg-orange-500', link: '/admin/custom/users?filter=trial' },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground font-semibold tracking-tight mt-1 text-sm md:text-base">
          Welcome back, Admin
        </p>
      </div>

      {/* Stats Grid — 2 cols on mobile, 3 on md, 4 on xl */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.link}
              className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className={`${stat.color} p-1.5 md:p-2 rounded-lg`}>
                  <Icon size={18} className="text-white" />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">{stat.title}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity — stacked on mobile, side-by-side on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-sm md:text-base">Recent Orders</h2>
              <Link href="/admin/custom/orders" className="text-xs md:text-sm text-blue-600 hover:text-blue-700">
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentOrders.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500 text-sm">No orders found</div>
            ) : (
              stats.recentOrders.map((order: any) => (
                <Link
                  key={order._id}
                  href={`/admin/custom/orders/${order._id}`}
                  className="block px-4 md:px-6 py-3 md:py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{order.customerName}</p>
                      <p className="text-xs text-gray-500 truncate">{order.resellerEmail}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-gray-900 text-sm">₹{order.totalAmount?.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.orderedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-sm md:text-base">Recent Users</h2>
              <Link href="/admin/custom/users" className="text-xs md:text-sm text-blue-600 hover:text-blue-700">
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentUsers.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500 text-sm">No users found</div>
            ) : (
              stats.recentUsers.map((user: any) => (
                <Link
                  key={user.id}
                  href={`/admin/custom/users/${user.id}`}
                  className="block px-4 md:px-6 py-3 md:py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="shrink-0">
                      {user.is_paid && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Paid</span>
                      )}
                      {user.is_banned && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Banned</span>
                      )}
                      {!user.is_paid && !user.is_banned && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Trial</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}