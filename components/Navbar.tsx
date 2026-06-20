"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "./ui/button";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-rose-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">TK</span>
            </div>
            <span className="text-xl font-bold text-rose-800">TailorKart</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/catalog" className="text-stone-600 hover:text-rose-600 transition-colors text-sm font-medium">
              Catalog
            </Link>
            {session && (
              <Link href="/orders" className="text-stone-600 hover:text-rose-600 transition-colors text-sm font-medium">
                My Orders
              </Link>
            )}
            {session?.user?.role === "ADMIN" && (
              <Link href="/admin" className="text-stone-600 hover:text-rose-600 transition-colors text-sm font-medium">
                Admin
              </Link>
            )}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-stone-600">
                  Hello, {session.user?.name?.split(" ")[0]}
                </span>
                <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-stone-600 hover:text-rose-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-rose-100 space-y-3">
            <Link href="/catalog" className="block text-stone-600 hover:text-rose-600 text-sm font-medium py-1" onClick={() => setMenuOpen(false)}>
              Catalog
            </Link>
            {session && (
              <Link href="/orders" className="block text-stone-600 hover:text-rose-600 text-sm font-medium py-1" onClick={() => setMenuOpen(false)}>
                My Orders
              </Link>
            )}
            {session?.user?.role === "ADMIN" && (
              <Link href="/admin" className="block text-stone-600 hover:text-rose-600 text-sm font-medium py-1" onClick={() => setMenuOpen(false)}>
                Admin
              </Link>
            )}
            <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
              {session ? (
                <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign Out
                </Button>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setMenuOpen(false)}>
                    <Button size="sm" className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
