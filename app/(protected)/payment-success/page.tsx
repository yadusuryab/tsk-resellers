import { requireAuth } from '@/lib/utils/auth';
import Link from 'next/link';

export default async function PaymentSuccessPage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Payment Submitted Successfully!
        </h2>
        
        <p className="mt-2 text-gray-600">
          Your payment is being verified. This usually takes 1-2 hours.
        </p>

        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="font-medium text-gray-900">What happens next?</h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-left text-sm text-gray-600">
            <li>Our team will verify your payment</li>
            <li>Once verified, your account will be activated</li>
            <li>You'll receive full access to all premium features</li>
            <li>You can check your status on the account page</li>
          </ol>
        </div>

        <div className="mt-6 space-y-3">
          <Link
            href="/account"
            className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Go to Account
          </Link>
          <Link
            href="/"
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Return to Home
          </Link>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Need help? Contact support at support@yourbusiness.com
        </p>
      </div>
    </div>
  );
}