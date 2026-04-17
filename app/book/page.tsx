'use client';
import { useState } from 'react';
import PageTransition from '@/components/PageTransition';
import { CalendarCheck, Loader2, CheckCircle, Shield, Brain } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';

export default function BookPage() {
  const [allowSummary, setAllowSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState('');
  const [booked, setBooked] = useState(false);

  const handleBook = async () => {
    setLoading(true);
    try {
      if (allowSummary) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const res = await fetch('/api/brief', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
          });
          const data = await res.json();
          setBrief(data.brief || '');
        }
      }
      setBooked(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <CalendarCheck className="w-8 h-8 text-nebula" />
          Book a Counselor
        </h1>
        <p className="text-slate-400 mb-8">Connect with a professional at the Happiness Centre.</p>

        {!booked ? (
          <div className="glass-card p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {['Monday 10 AM', 'Tuesday 2 PM', 'Wednesday 11 AM', 'Friday 3 PM'].map(slot => (
                <button key={slot} className="border border-white/10 bg-white/5 hover:bg-nebula/10 hover:border-nebula/40 text-slate-300 hover:text-white text-sm py-3 px-4 rounded-xl transition-all">
                  {slot}
                </button>
              ))}
            </div>

            <div className="border-t border-white/10 pt-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={allowSummary}
                    onChange={e => setAllowSummary(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 border-2 border-white/20 rounded peer-checked:bg-nebula peer-checked:border-nebula flex items-center justify-center transition-all">
                    {allowSummary && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-200 font-medium">Allow AI to summarize my last 7 days for the counselor?</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Your data stays private. Only the counselor sees this.
                  </p>
                </div>
              </label>
            </div>

            <button
              onClick={handleBook}
              disabled={loading}
              className="w-full glow-btn flex items-center justify-center gap-2 py-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CalendarCheck className="w-5 h-5" />}
              {loading ? 'Preparing your brief...' : 'Book Counselor'}
            </button>
          </div>
        ) : (
          <div className="glass-card p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-nebula to-ember flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Session Booked!</h2>
            <p className="text-slate-400 text-sm">You&apos;ll receive a confirmation. The counselor is looking forward to meeting you.</p>
            {brief && (
              <div className="text-left bg-white/5 border border-white/10 rounded-xl p-4 mt-4">
                <p className="text-xs text-nebula font-semibold mb-2 flex items-center gap-1">
                  <Brain className="w-3 h-3" /> AI Brief (shared with counselor)
                </p>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{brief}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
