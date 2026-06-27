'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconDashboard,
  IconPackage,
  IconCategory,
  IconShoppingBag,
  IconUsers,
  IconCreditCard,
  IconSettings,
  IconBan,
  IconPhoto,
  IconStar,
  IconChevronRight,
} from '@tabler/icons-react';

const menuItems = [
  { href: '/admin/custom', label: 'Dashboard', icon: IconDashboard },
  { href: '/admin/custom/orders', label: 'Orders', icon: IconShoppingBag },
  { href: '/admin/custom/products', label: 'Products', icon: IconPackage },
  { href: '/admin/custom/categories', label: 'Categories', icon: IconCategory },
  { href: '/admin/custom/users', label: 'Users', icon: IconUsers },
  { href: '/admin/custom/payments', label: 'Payments', icon: IconCreditCard },
  { href: '/admin/custom/banners', label: 'Banners', icon: IconPhoto },
  { href: '/admin/custom/reviews', label: 'Reviews', icon: IconStar },
  { href: '/admin/custom/banned', label: 'Banned Users', icon: IconBan },
  { href: '/admin/custom/settings', label: 'Settings', icon: IconSettings },
];

// Items shown in mobile bottom nav (most important ones)
const mobileNavItems = menuItems.slice(0, 5);

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/admin/custom'
      ? pathname === href
      : pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0 shrink-0">
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span>{item.label}</span>
                </div>
                {active && <IconChevronRight size={16} />}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex items-center justify-around px-2 h-16 safe-area-pb">
        {mobileNavItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors min-w-0 ${
                active ? 'text-primary' : 'text-gray-500'
              }`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium truncate leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* "More" drawer trigger — links to settings as fallback */}
        <Link
          href="/admin/custom/settings"
          className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors min-w-0 ${
            ['/admin/custom/banners', '/admin/custom/reviews', '/admin/custom/banned', '/admin/custom/settings'].some(
              (h) => isActive(h)
            )
              ? 'text-primary'
              : 'text-gray-500'
          }`}
        >
          <IconSettings size={22} />
          <span className="text-[10px] font-medium truncate leading-tight">More</span>
        </Link>
      </nav>
    </>
  );
} 