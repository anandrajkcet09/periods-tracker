import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, Heart, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { useAuth } from '@/context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'].includes(
    location.pathname
  );

  const username = profile?.username || user?.user_metadata?.username || 'account';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-slate-100/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blush-500 to-blush-400 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 fill-white/20 stroke-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
              Aura
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-sage-50 text-sage-700 px-1.5 py-0.5 rounded-full border border-sage-200">
                <Shield className="w-2.5 h-2.5" /> 100% Private
              </span>
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={cn(
              "text-sm font-medium transition-colors hover:text-blush-600",
              location.pathname === '/' ? "text-blush-600 font-semibold" : "text-slate-600"
            )}
          >
            Overview
          </Link>
          <Link
            to="/app/dashboard"
            className="text-sm font-medium text-slate-600 hover:text-blush-600 transition-colors"
          >
            App Dashboard
          </Link>
        </nav>

        {/* Auth CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/app/profile">
                <Button variant="outline" size="sm" leftIcon={<User className="w-4 h-4" />}>
                  @{username}
                </Button>
              </Link>
              <Link to="/app/dashboard">
                <Button variant="primary" size="sm">
                  Go to Dashboard →
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => signOut()} leftIcon={<LogOut className="w-4 h-4" />}>
                Logout
              </Button>
            </>
          ) : (
            <>
              {location.pathname !== '/login' && (
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
              )}
              {location.pathname !== '/signup' && (
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Get Started Free
                  </Button>
                </Link>
              )}
              {isAuthPage && (
                <Link to="/app/dashboard">
                  <Button variant="soft" size="sm">
                    Skip to App →
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-100 bg-white px-4 pt-2 pb-6 space-y-3 animate-slide-up">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-blush-600"
          >
            Overview
          </Link>
          <Link
            to="/app/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-blush-600"
          >
            App Dashboard
          </Link>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link to="/app/profile" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" fullWidth size="md" leftIcon={<User className="w-4 h-4" />}>
                    Profile (@{username})
                  </Button>
                </Link>
                <Button variant="ghost" fullWidth size="md" onClick={() => { signOut(); setMobileMenuOpen(false); }}>
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" fullWidth size="md">
                    Log In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" fullWidth size="md">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
