"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import Brand from "../utils/brand";
import { Button } from "../ui/button";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  IconSearch, IconShoppingBag, IconX, IconHome,
  IconPackage, IconMenu, IconTruckDelivery, IconUser,
  IconLogout, IconCreditCard, IconShield,
} from "@tabler/icons-react";
import MarqueeStrip from "../sections/marquee-strip";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const HIDE_SEARCH_PATHS = [
  "/checkout", "/cart", "/subscription-checkout", "/payment-success",
  "/orders", "/account", "/wishlist", "/product", "/products",
  "/term", "/contact", "/track-order", "/order", "/privacy", "/admin",
];

const HIDE_MARQUEE_PATHS = [
  "/checkout", "/cart", "/subscription-checkout", "/payment-success",
  "/orders", "/account", "/wishlist", "/product", "/products",
  "/term", "/contact", "/track-order", "/order", "/privacy", "/admin",
];

const PLACEHOLDERS = [
  "Search products...", "Find watches", "Explore gadgets",
  "Shop fashion", "Discover trends",
];

// Mobile: header = 56px (h-14). Desktop: header = 64px (h-16). Marquee = 36px.
function getSpacerHeight(isScrolled: boolean, showMarquee: boolean, isMobile: boolean) {
  const headerH = isMobile ? 56 : 64;
  const marqueeH = showMarquee && !isScrolled ? 36 : 0;
  return headerH + marqueeH;
}

// ── User dropdown ─────────────────────────────────────────────────────────────
function UserMenu({ user, onLogout, isAdmin }: { user: User; onLogout: () => void; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const menuItems = [
    { href: "/account", icon: <IconUser size={16} />, label: "My Account" },
    { href: "/orders", icon: <IconPackage size={16} />, label: "My Orders" },
    { href: "/pricing", icon: <IconCreditCard size={16} />, label: "Subscription" },
    { href: "/track-order", icon: <IconTruckDelivery size={16} />, label: "Track Order" },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="User menu"
        className="relative flex items-center justify-center w-10 h-10 rounded-xl text-black border border-transparent hover:bg-black hover:text-white hover:border-black transition-all duration-200"
      >
        <IconUser size={20} />
        {isAdmin && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-black rounded-full border-2 border-white" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-black/10 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-black truncate">
                {user.user_metadata?.name || user.email?.split("@")[0] || "User"}
              </p>
              {isAdmin && (
                <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded-full font-medium">Admin</span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
          </div>

          {isAdmin && (
            <div className="py-1 border-b border-gray-100">
              <Link
                href="/admin/custom"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
              >
                <IconShield size={16} /> Admin Panel
              </Link>
            </div>
          )}

          <div className="py-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-400">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-1">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-black hover:bg-gray-100 transition-colors"
            >
              <IconLogout size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Auth buttons ──────────────────────────────────────────────────────────────
function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <Link href="/login">
        <Button variant="ghost" size="sm" className="text-sm font-medium text-black hover:bg-gray-100">
          Sign In
        </Button>
      </Link>
      <Link href="/signup">
        <Button size="sm" className="text-sm font-medium bg-black text-white hover:bg-gray-800">
          Sign Up
        </Button>
      </Link>
    </div>
  );
}

// ── Mobile drawer ─────────────────────────────────────────────────────────────
function MobileMenu({
  open, onClose, pathname, user, isAdmin, onLogout,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  user: User | null;
  isAdmin: boolean;
  onLogout: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const navLinks = [
    { href: "/", label: "Home", icon: <IconHome size={18} /> },
    { href: "/products", label: "All Products", icon: <IconPackage size={18} /> },
    { href: "/cart", label: "Cart", icon: <IconShoppingBag size={18} /> },
    { href: "/track-order", label: "Track Order", icon: <IconTruckDelivery size={18} /> },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] md:hidden"
      style={{ pointerEvents: open ? "auto" : "none", visibility: open ? "visible" : "hidden" }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0 }}
        onClick={onClose}
      />

      <div
        className="absolute top-0 left-0 h-full w-[82vw] max-w-[320px] bg-white flex flex-col border-r border-gray-200 transition-transform duration-300 ease-out"
        style={{ transform: open ? "translateX(0)" : "translateX(-100%)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <Link href="/" onClick={onClose}><Brand /></Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all duration-200"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 pt-5 pb-4 border-b border-gray-100">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                  <IconUser size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-black truncate">
                      {user.user_metadata?.name || user.email?.split("@")[0]}
                    </p>
                    {isAdmin && (
                      <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded-full font-medium">Admin</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={onClose}>
                  <Button variant="outline" className="w-full border-black text-black hover:bg-black hover:text-white">Sign In</Button>
                </Link>
                <Link href="/signup" onClick={onClose}>
                  <Button className="w-full bg-black text-white hover:bg-gray-800">Create Account</Button>
                </Link>
              </div>
            )}
          </div>

          <nav className="px-4 py-4">
            {isAdmin && (
              <Link
                href="/admin/custom"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-3 rounded-xl mb-3 bg-black text-white font-medium text-sm"
              >
                <IconShield size={18} /> Admin Panel
              </Link>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl mb-1 text-sm transition-all duration-200 ${
                  pathname === link.href
                    ? "bg-black text-white font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className={pathname === link.href ? "text-white" : "text-gray-400"}>{link.icon}</span>
                {link.label}
              </Link>
            ))}

            {user && (
              <>
                <Link href="/account" onClick={onClose} className="flex items-center gap-3 px-3 py-3 rounded-xl mb-1 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  <IconUser size={18} className="text-gray-400" /> My Account
                </Link>
                <Link href="/orders" onClick={onClose} className="flex items-center gap-3 px-3 py-3 rounded-xl mb-1 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  <IconPackage size={18} className="text-gray-400" /> My Orders
                </Link>
                <button
                  onClick={() => { onClose(); onLogout(); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-black hover:bg-gray-100 transition-colors font-medium"
                >
                  <IconLogout size={18} className="text-gray-500" /> Sign Out
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-[11px] text-gray-400 text-center font-medium tracking-wide">
            {process.env.NEXT_PUBLIC_APP_NAME}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Header ───────────────────────────────────────────────────────────────
function HeaderInner() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const shouldHideSearch = HIDE_SEARCH_PATHS.some((p) => pathname.startsWith(p));
  const shouldHideMarquee = HIDE_MARQUEE_PATHS.some((p) => pathname.startsWith(p));
  const showMarquee = !shouldHideMarquee;

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auth
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          const { data }: any = await supabase.from("users").select("is_admin").eq("id", user.id).single();
          setIsAdmin(data?.is_admin || false);
        }
      } finally {
        setAuthLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const { data }: any = await supabase.from("users").select("is_admin").eq("id", u.id).single();
        setIsAdmin(data?.is_admin || false);
      } else {
        setIsAdmin(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Rotating placeholder
  useEffect(() => {
    if (shouldHideSearch) return;
    const id = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(id);
  }, [shouldHideSearch]);

  // Auto-focus search input
  useEffect(() => {
    if (isSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [isSearchOpen]);

  // Close search on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!searchInputRef.current?.closest(".search-area")?.contains(target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    window.location.href = "/";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("q", encodeURIComponent(searchQuery.trim()));
    setSearchQuery("");
    setIsSearchOpen(false);
    router.push(`/products?${params}`);
  };

  const desktopNavLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
    { href: "/track-order", label: "Track Order" },
  ];

  const spacerHeight = 54;

  return (
    <>
      <MobileMenu
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        pathname={pathname}
        user={user}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />

      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 overflow-x-hidden w-full">
        {/* Marquee */}
        {showMarquee && (
          <div
            className="overflow-hidden transition-all duration-500 bg-black"
            style={{ maxHeight: isScrolled ? "0px" : "36px", opacity: isScrolled ? 0 : 1 }}
          >
            <MarqueeStrip />
          </div>
        )}

        {/* ── Mobile row ── */}
        <div className="md:hidden flex items-center h-14 px-3 gap-2 w-full min-w-0">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
            className="flex items-center justify-center w-10 h-10 rounded-xl text-black hover:bg-gray-100 transition-colors"
          >
            <IconMenu size={22} />
          </button>

          <div className="flex-1 flex justify-center">
            <Link href="/" className="hover:opacity-70 transition-opacity">
              <Brand />
            </Link>
          </div>

          <div className="flex items-center gap-1">
            {!shouldHideSearch && (
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
                className="flex items-center justify-center w-10 h-10 rounded-xl text-black hover:bg-gray-100 transition-colors"
              >
                <IconSearch size={20} />
              </button>
            )}
            <Link href="/cart" aria-label="Cart">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl text-black hover:bg-gray-100 transition-colors">
                <IconShoppingBag size={21} />
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile search overlay */}
        {!shouldHideSearch && isSearchOpen && (
          <div className="md:hidden absolute inset-x-0 top-0 h-14 flex items-center px-3 gap-2 bg-white z-10 search-area">
            <form
              onSubmit={handleSearch}
              className="flex-1 flex items-center h-9 border border-black rounded-xl bg-white px-3 gap-2 ring-2 ring-black/5"
            >
              <IconSearch size={15} className="flex-shrink-0 text-gray-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={PLACEHOLDERS[placeholderIndex]}
                className="flex-1 min-w-0 text-sm focus:outline-none bg-transparent placeholder-gray-400 text-black"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-black transition-colors">
                  <IconX size={14} />
                </button>
              )}
            </form>
            <button
              onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
              className="text-sm font-semibold text-black hover:text-gray-600 transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── Desktop row ── */}
        <div className="hidden md:flex items-center gap-2 px-4 lg:px-8 h-16 w-full min-w-0">
          <Link href="/" className="flex-shrink-0 hover:opacity-70 transition-opacity mr-1">
            <Brand />
          </Link>

          <nav className="flex items-center gap-1 flex-shrink-0">
            {desktopNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[13px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap ${
                  pathname === link.href
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-black"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin/custom"
                className="text-[13px] font-medium px-3 py-1.5 rounded-lg text-black hover:bg-gray-100 transition-all duration-200 flex items-center gap-1.5 border border-gray-200"
              >
                <IconShield size={14} /> Admin
              </Link>
            )}
          </nav>

          <div className="flex-1" />

          {/* Desktop search */}
          {!shouldHideSearch && (
            <form
              onSubmit={handleSearch}
              className={`search-area flex items-center gap-2 h-9 rounded-xl px-3 border transition-all duration-300 ${
                isSearchOpen
                  ? "border-black ring-2 ring-black/10 bg-white w-56"
                  : "border-gray-200 bg-gray-50 w-9"
              }`}
            >
              <button
                type={isSearchOpen ? "submit" : "button"}
                onClick={() => !isSearchOpen && setIsSearchOpen(true)}
                className="flex-shrink-0 text-gray-600 hover:text-black transition-colors"
                aria-label="Search"
              >
                <IconSearch size={17} />
              </button>
              {isSearchOpen && (
                <>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={PLACEHOLDERS[placeholderIndex]}
                    className="text-sm focus:outline-none bg-transparent placeholder-gray-400 text-black flex-1 min-w-0"
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-black transition-colors flex-shrink-0">
                      <IconX size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                    className="text-xs font-semibold text-black hover:text-gray-600 transition-colors whitespace-nowrap ml-1 flex-shrink-0"
                  >
                    Cancel
                  </button>
                </>
              )}
            </form>
          )}

          {/* Auth */}
          {!authLoading && (
            user
              ? <UserMenu user={user} onLogout={handleLogout} isAdmin={isAdmin} />
              : <AuthButtons />
          )}

          {/* Cart */}
          <Link href="/cart" aria-label="Cart">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl text-black hover:bg-black hover:text-white border border-transparent hover:border-black transition-all duration-200">
              <IconShoppingBag size={21} />
            </span>
          </Link>
        </div>
      </header>

      {/* Spacer: dynamically matches exact header height including marquee */}
      <div
        className="transition-all duration-500 shrink-0"
        style={{ height: `${spacerHeight}px` }}
      />
    </>
  );
}

function HeaderFallback() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="px-4 h-14 md:h-16 flex items-center justify-between">
        <Link href="/"><Brand /></Link>
        <Link href="/cart">
          <Button variant="ghost" size="icon" className="text-black hover:bg-gray-100">
            <IconShoppingBag size={20} />
          </Button>
        </Link>
      </div>
    </header>
  );
}

export default function Header() {
  return (
    <Suspense fallback={<HeaderFallback />}>
      <HeaderInner />
    </Suspense>
  );
}