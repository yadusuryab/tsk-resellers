import { getCurrentUser } from '@/lib/utils/auth';
import Link from 'next/link';

export default async function PricingPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Choose the plan that's right for you
        </p>
      </div>

      <div className="mt-16 flex justify-center">
        <div className="w-full max-w-md">
          {/* Free Trial */}
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-8">
            <h3 className="text-xl font-semibold text-gray-900">30-Day Free Trial</h3>
            <p className="mt-4 text-sm text-gray-600">
              Try all features free for 30 days. No credit card required.
            </p>
            <p className="mt-8">
              <span className="text-4xl font-bold tracking-tight text-gray-900">₹0</span>
              <span className="text-sm font-medium text-gray-600">/month</span>
            </p>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-2">Full access for 30 days</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-2">No commitment</span>
              </li>
            </ul>
            {!user ? (
              <Link
                href="/signup"
                className="mt-8 block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
              >
                Start Free Trial
              </Link>
            ) : user.isPaid ? (
              <div className="mt-8 block w-full rounded-lg bg-green-100 px-4 py-2 text-center text-sm font-medium text-green-800">
                ✓ You're already a paid member
              </div>
            ) : (
              <div className="mt-8 block w-full rounded-lg bg-gray-100 px-4 py-2 text-center text-sm font-medium text-gray-600">
                Trial Active
              </div>
            )}
          </div>

          {/* Premium Plan */}
          <div className="rounded-2xl border-2 border-blue-600 bg-white p-8">
            <div className="absolute -mt-12 ml-32 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
              PREMIUM
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Premium Plan</h3>
            <p className="mt-4 text-sm text-gray-600">
              Full access to all features with priority support.
            </p>
            <p className="mt-8">
              <span className="text-4xl font-bold tracking-tight text-gray-900">₹300</span>
              <span className="text-sm font-medium text-gray-600"> one-time</span>
            </p>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-2">Everything in Free Trial</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-2">Lifetime access</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-2">Priority support</span>
              </li>
            </ul>
            {user ? (
              user.isPaid ? (
                <div className="mt-8 block w-full rounded-lg bg-green-100 px-4 py-2 text-center text-sm font-medium text-green-800">
                  ✓ You're a premium member
                </div>
              ) : (
                <Link
                  href="/subscription-checkout"
                  className="mt-8 block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
                >
                  Upgrade Now
                </Link>
              )
            ) : (
              <Link
                href="/signup"
                className="mt-8 block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
              >
                Sign Up & Upgrade
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}