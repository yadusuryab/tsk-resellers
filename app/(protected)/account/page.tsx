import { getCurrentUser } from '@/lib/utils/auth';
import { formatTrialStatus, calculateTrialStatus } from '@/lib/utils/trial';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 0;

export default async function AccountPage() {
  const user = await getCurrentUser();

  // If no user, redirect to login
  if (!user) {
    redirect('/login');
  }

  // If banned, redirect to banned page
  if (user.isBanned) {
    redirect('/banned');
  }

  const trialStatus = calculateTrialStatus(user);
  const statusText = formatTrialStatus(user);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        
        <div className="mt-8 space-y-6">
          {/* Profile Information */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.phone || 'Not provided'}</dd>
              </div>
              {user.isAdmin && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                  <dd className="mt-1">
                    <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      Admin Account
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Admin Quick Access */}
          {user.isAdmin && (
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-6">
              <h2 className="text-xl font-semibold text-purple-900">Admin Access</h2>
              <p className="mt-2 text-sm text-purple-700">
                You have administrator privileges.
              </p>
              <Link
                href="/admin/custom"
                className="mt-4 inline-block rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
              >
                Go to Admin Panel →
              </Link>
            </div>
          )}

          {/* Trial Status - Only show for non-admins */}
          {!user.isAdmin && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-gray-900">Subscription Status</h2>
              
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Current Plan</span>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    user.isPaid 
                      ? 'bg-green-100 text-green-800'
                      : trialStatus.isActive
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {statusText}
                  </span>
                </div>

                {!user.isPaid && trialStatus.isActive && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Trial progress</span>
                      <span>{trialStatus.daysLeft} days remaining</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{
                          width: `${((30 - trialStatus.daysLeft) / 30) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Trial started on {user.trialStart.toLocaleDateString()}
                    </p>
                  </div>
                )}

                {!user.isPaid && !trialStatus.isActive && (
                  <div className="mt-4">
                    <div className="rounded-lg bg-yellow-50 p-4">
                      <p className="text-sm text-yellow-800">
                        Your trial has expired. Upgrade to continue accessing all features.
                      </p>
                      <Link
                        href="/pricing"
                        className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        View Pricing
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Account Actions */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900">Account Actions</h2>
            
            <div className="mt-4 space-y-4">
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Sign out of your account
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}