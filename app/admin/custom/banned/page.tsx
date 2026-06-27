import { getCurrentUser } from '@/lib/utils/auth';
import { redirect } from 'next/navigation';

export default async function BannedPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  if (!user.isBanned) {
    redirect('/account');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Banned</h1>
        <p className="text-gray-600 mb-4">
          Your account has been banned. Please contact support for more information.
        </p>
        
        {user.banReason && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-gray-700">Reason:</p>
            <p className="text-sm text-gray-600">{user.banReason}</p>
          </div>
        )}
        
        <a
          href="mailto:support@example.com"
          className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}