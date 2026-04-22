'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSession, logout, type UserSession } from '@/lib/auth';
import {
  Sparkles,
  LayoutDashboard,
  MessageCircle,
  BookOpen,
  Globe,
  Menu,
  X,
  LogIn,
  Settings,
  LogOut,
  User,
} from 'lucide-react';

const baseLinks = [
  { href: '/', label: 'Home', icon: Sparkles },
  { href: '/dashboard', label: 'Pulse', icon: LayoutDashboard },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/wall', label: 'Echo Wall', icon: Globe },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Check session on mount & on route change
  useEffect(() => {
    setSession(getSession());
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setSession(null);
    setShowProfileMenu(false);
    router.push('/login');
  };

  // Build nav links — show login or profile based on session
  const navLinks = session
    ? [...baseLinks, { href: '/settings', label: 'Settings', icon: Settings }]
    : [...baseLinks, { href: '/login', label: 'Login', icon: LogIn }];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-strong mt-4 px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-nebula to-ember flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-nebula to-ember opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-500" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Peaclify
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-xl bg-white/10 border border-white/10"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}

            {/* Profile Avatar (when logged in) */}
            {session && (
              <div className="relative ml-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-nebula to-ember flex items-center justify-center text-white font-bold text-sm hover:shadow-lg hover:shadow-nebula/20 transition-shadow"
                  title={session.email}
                >
                  {session.email.charAt(0).toUpperCase()}
                </motion.button>

                {/* Dropdown */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 glass-strong p-2 space-y-1"
                    >
                      <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm text-white font-medium truncate">{session.email}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block ${
                          session.role === 'psychologist'
                            ? 'bg-ember/20 text-ember border border-ember/30'
                            : 'bg-nebula/20 text-nebula border border-nebula/30'
                        }`}>
                          {session.role === 'psychologist' ? '🩺 Psychologist' : '🎓 Student'}
                        </span>
                      </div>

                      <Link
                        href="/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>

                      <div className="border-t border-white/10 pt-1 mt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden glass-strong mt-2 p-4 space-y-1"
            >
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}

              {/* Mobile: User info + Logout */}
              {session && (
                <div className="border-t border-white/10 mt-2 pt-2">
                  <div className="px-4 py-2">
                    <p className="text-xs text-slate-500">Signed in as</p>
                    <p className="text-sm text-white truncate">{session.email}</p>
                  </div>
                  <button
                    onClick={() => { setMobileOpen(false); handleLogout(); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
