'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

type UserRole = 'student' | 'psychologist';

function getRoleFromStorage(userId: string): UserRole | null {
  try { return localStorage.getItem(`peaclify_role_${userId}`) as UserRole | null; } catch { return null; }
}

export default function DashboardPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.replace('/login'); return; }

        let role: UserRole = 'student';

        // 1. Try Supabase profiles table
        try {
          const { data: profile, error } = await supabase
            .from('profiles').select('role').eq('id', user.id).single();
          if (!error && profile?.role) {
            role = profile.role as UserRole;
          } else {
            throw new Error('no profile');
          }
        } catch {
          // 2. Fallback: localStorage
          const localRole = getRoleFromStorage(user.id);
          if (localRole) role = localRole;
        }

        router.replace(`/dashboard/${role}`);
      } catch {
        router.replace('/dashboard/student');
      } finally {
        setChecking(false);
      }
    }
    checkRole();
  }, [router]);

  if (!checking) return null;

  return (
    <PageTransition>
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-nebula to-ember flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <Loader2 className="absolute -bottom-1 -right-1 w-6 h-6 text-nebula animate-spin" />
          </div>
          <p className="text-slate-400 text-sm">Loading your dashboard...</p>
        </motion.div>
      </div>
    </PageTransition>
  );
}
