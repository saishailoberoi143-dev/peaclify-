'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace('/login');
      return;
    }
    // Redirect to role-specific dashboard
    router.replace(`/dashboard/${session.role}`);
    setChecking(false);
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
