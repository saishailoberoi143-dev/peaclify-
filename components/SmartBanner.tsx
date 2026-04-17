'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { AlertCircle, Leaf } from 'lucide-react';

export default function SmartBanner() {
  const [msg, setMsg] = useState<{ text: string; type: 'warn' | 'info' } | null>(null);

  useEffect(() => {
    async function check() {
      // Sunday reminder
      if (new Date().getDay() === 0) {
        setMsg({ text: '🌱 New week starting. Set one small wellness goal today.', type: 'info' });
        return;
      }
      // Check last 3 mood_logs
      try {
        const { data } = await supabase
          .from('mood_logs')
          .select('score')
          .order('created_at', { ascending: false })
          .limit(3);
        if (data && data.length === 3 && data.every((m: { score: number }) => m.score < 2)) {
          setMsg({ text: '⚠️ Tough week? A counselor is available at the Happiness Centre today.', type: 'warn' });
        }
      } catch { /* supabase not configured */ }
    }
    check();
  }, []);

  if (!msg) return null;

  return (
    <div className={`w-full px-4 py-2 text-center text-sm flex items-center justify-center gap-2 ${
      msg.type === 'warn'
        ? 'bg-red-500/10 border-b border-red-500/20 text-red-300'
        : 'bg-nebula/10 border-b border-nebula/20 text-slate-300'
    }`}>
      {msg.type === 'warn' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Leaf className="w-4 h-4 shrink-0" />}
      {msg.text}
    </div>
  );
}
