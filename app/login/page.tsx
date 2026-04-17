'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Loader2,
  GraduationCap, Stethoscope, Sparkles, CheckCircle, KeyRound,
} from 'lucide-react';

const PSYCH_ACCESS_CODE = '12345';

type AuthMode = 'login' | 'signup';
type UserRole = 'student' | 'psychologist';

// Save role to localStorage as a reliable fallback
function saveRoleLocally(userId: string, role: UserRole) {
  try { localStorage.setItem(`peaclify_role_${userId}`, role); } catch {}
}
function getRoleLocally(userId: string): UserRole | null {
  try { return localStorage.getItem(`peaclify_role_${userId}`) as UserRole | null; } catch { return null; }
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');

    // Gate: psychologist access code check
    if (role === 'psychologist' && accessCode !== PSYCH_ACCESS_CODE) {
      setError('Invalid psychologist access code. Please enter the correct code to continue.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;

        if (data.user) {
          // Save role locally FIRST as reliable fallback
          saveRoleLocally(data.user.id, role);

          // Try to save to Supabase (only id and role — no email column)
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              role,
              created_at: new Date().toISOString(),
            });
          } catch (profileErr) {
            console.warn('Profile upsert failed (using local fallback):', profileErr);
          }

          setSuccess('Account created! Check your email to verify, then log in.');
          setMode('login');
        }

      } else {
        // Sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        if (data.user) {
          let userRole: UserRole = 'student';

          // 1. Try Supabase profiles table
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', data.user.id)
              .single();

            if (!profileError && profile?.role) {
              userRole = profile.role as UserRole;
            } else {
              throw new Error('Profile fetch failed');
            }
          } catch {
            // 2. Fallback: check localStorage
            const localRole = getRoleLocally(data.user.id);
            if (localRole) {
              userRole = localRole;
            } else {
              // 3. Fallback: use role selected in UI (for current session)
              userRole = role;
            }
          }

          // Save locally for future logins too
          saveRoleLocally(data.user.id, userRole);

          router.push(`/dashboard/${userRole}`);
          router.refresh();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      // Make "Failed to fetch" human readable
      if (msg.includes('fetch') || msg.includes('network') || msg.includes('placeholder')) {
        setError('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-nebula/20 via-slate-900 to-ember/10" />
        <div className="absolute top-20 left-20 w-64 h-64 bg-nebula/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-ember/15 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-nebula to-ember flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-nebula/30">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-black text-white mb-4">
            Your mind deserves <span className="glow-text">peace.</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            Peaclify connects students with support through AI-powered emotional intelligence and real counselor care.
          </p>
          <div className="space-y-3 text-left">
            {[
              '🧠 AI-powered emotional support, 24/7',
              '📊 Mood tracking & wellness analytics',
              '👨‍⚕️ Direct connection to campus psychologists',
              '🔒 100% anonymous & private',
            ].map(item => (
              <div key={item} className="flex items-center gap-3 glass px-4 py-3 rounded-xl">
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-slate-950/80">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-1">
              {mode === 'login' ? 'Welcome back 👋' : 'Create your account'}
            </h1>
            <p className="text-slate-400">
              {mode === 'login' ? 'Sign in to your Peaclify portal' : 'Join the Peaclify community'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-1 glass p-1 rounded-xl mb-6">
            {(['login', 'signup'] as AuthMode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize
                  ${mode === m ? 'bg-gradient-to-r from-nebula to-violet-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Role Selector — always visible */}
          <div className="mb-6">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-3">
              {mode === 'login' ? 'My role is...' : 'I am signing up as...'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setRole('student')}
                className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2
                  ${role === 'student' ? 'border-nebula bg-nebula/10 shadow-lg shadow-nebula/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all
                  ${role === 'student' ? 'bg-nebula/30' : 'bg-white/5'}`}>
                  <GraduationCap className={`w-5 h-5 ${role === 'student' ? 'text-nebula' : 'text-slate-400'}`} />
                </div>
                <span className={`text-sm font-semibold ${role === 'student' ? 'text-white' : 'text-slate-400'}`}>Student</span>
                {role === 'student' && <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-nebula" />}
              </button>

              <button onClick={() => setRole('psychologist')}
                className={`relative p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2
                  ${role === 'psychologist' ? 'border-ember bg-ember/10 shadow-lg shadow-ember/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all
                  ${role === 'psychologist' ? 'bg-ember/30' : 'bg-white/5'}`}>
                  <Stethoscope className={`w-5 h-5 ${role === 'psychologist' ? 'text-ember' : 'text-slate-400'}`} />
                </div>
                <span className={`text-sm font-semibold ${role === 'psychologist' ? 'text-white' : 'text-slate-400'}`}>Psychologist</span>
                {role === 'psychologist' && <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-ember" />}
              </button>
            </div>
            {mode === 'login' && (
              <p className="text-[10px] text-slate-600 mt-2 text-center">
                Select your role so we can show the right portal if lookup fails.
              </p>
            )}

            {/* Psychologist Access Code */}
            <AnimatePresence>
              {role === 'psychologist' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ember" />
                    <input
                      type="password"
                      value={accessCode}
                      onChange={e => setAccessCode(e.target.value)}
                      placeholder="Psychologist access code"
                      className="w-full bg-ember/5 text-white placeholder-slate-500 text-sm rounded-xl border border-ember/30 pl-11 pr-4 py-3.5 outline-none focus:border-ember/60 focus:ring-1 focus:ring-ember/20 transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1.5 pl-1">
                    🔐 Required for psychologist access. Contact admin if you don&apos;t have a code.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email address" required
                className="w-full bg-white/5 text-white placeholder-slate-500 text-sm rounded-xl border border-white/10 pl-11 pr-4 py-3.5 outline-none focus:border-nebula/50 focus:ring-1 focus:ring-nebula/20 transition-all" />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type={showPassword ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)} placeholder="Password" required minLength={6}
                className="w-full bg-white/5 text-white placeholder-slate-500 text-sm rounded-xl border border-white/10 pl-11 pr-11 py-3.5 outline-none focus:border-nebula/50 focus:ring-1 focus:ring-nebula/20 transition-all" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-sm text-red-400 bg-red-400/10 rounded-xl px-4 py-3 border border-red-400/20">
                  ⚠ {error}
                </motion.p>
              )}
              {success && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-sm text-emerald-400 bg-emerald-400/10 rounded-xl px-4 py-3 border border-emerald-400/20">
                  ✅ {success}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white text-sm transition-all shadow-lg disabled:opacity-60
                ${role === 'psychologist'
                  ? 'bg-gradient-to-r from-ember to-orange-500 shadow-ember/20 hover:shadow-ember/40'
                  : 'bg-gradient-to-r from-nebula to-violet-500 shadow-nebula/20 hover:shadow-nebula/40'
                }`}>
              {loading
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>
              }
            </motion.button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className={`font-semibold hover:underline ${role === 'psychologist' ? 'text-ember' : 'text-nebula'}`}>
              {mode === 'login' ? 'Sign up free' : 'Log in'}
            </button>
          </p>
          <p className="text-center text-[10px] text-slate-600 mt-3">🔒 Your data is encrypted and never shared.</p>
        </motion.div>
      </div>
    </div>
  );
}
