'use client';

import { IconUser, IconLogout, IconShieldFilled } from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

interface AdminHeaderProps {
  user: {
    id: string;
    email?: string;
    name?: string;
    isAdmin?: boolean;
  };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const displayName = user.name || user.email?.split('@')[0] || 'Admin';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 md:px-8 h-14 md:h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <IconShieldFilled size={22} className="text-primary" />
          <span className="font-semibold text-gray-900 text-sm md:text-base">Trendexpert</span>
          <span className="hidden sm:inline text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md font-semibold">
            Admin Panel
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-sm">
              Store
            </Button>
          </Link>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-1.5"
            >
              <IconUser size={17} className="text-primary" />
              {/* Hide name on very small screens */}
              <span className="hidden sm:inline text-sm font-semibold max-w-[120px] truncate">
                {displayName}
              </span>
            </Button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-40">
                  {/* Show name on small screens inside dropdown */}
                  <div className="sm:hidden px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <IconUser size={16} />
                    My Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <IconLogout size={16} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}