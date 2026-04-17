'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CheckCircle } from 'lucide-react';

const MOODS = [
  { emoji: '😃', score: 5, label: 'Great' },
  { emoji: '🙂', score: 4, label: 'Good' },
  { emoji: '😐', score: 3, label: 'Okay' },
  { emoji: '😔', score: 2, label: 'Low' },
  { emoji: '😫', score: 1, label: 'Rough' },
];

interface MoodLog { day: string; score: number; }

export default function MoodSelector() {
  const [selected, setSelected] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [chartData, setChartData] = useState<MoodLog[]>([]);

  // Build last-7-days scaffold
  function buildLast7Days(logs: { created_at: string; score: number }[]): MoodLog[] {
    const result: MoodLog[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en', { weekday: 'short' });
      const match = logs.find(l => l.created_at?.startsWith(key));
      result.push({ day: dayLabel, score: match ? match.score : 0 });
    }
    return result;
  }

  useEffect(() => {
    async function fetchLogs() {
      try {
        const { data } = await supabase
          .from('mood_logs')
          .select('score, created_at')
          .order('created_at', { ascending: false })
          .limit(7);
        setChartData(buildLast7Days(data || []));
      } catch {
        // fallback: mock data
        setChartData([
          { day: 'Mon', score: 4 }, { day: 'Tue', score: 3 }, { day: 'Wed', score: 5 },
          { day: 'Thu', score: 2 }, { day: 'Fri', score: 4 }, { day: 'Sat', score: 5 }, { day: 'Sun', score: 3 },
        ]);
      }
    }
    fetchLogs();
  }, [saved]);

  const handleSelect = async (score: number) => {
    setSelected(score);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('mood_logs').insert({ 
          user_id: user.id,
          score, 
          created_at: new Date().toISOString() 
        });
      } else {
        // Fallback for non-logged in users (demo mode)
        await supabase.from('mood_logs').insert({ score, created_at: new Date().toISOString() });
      }
    } catch { /* offline */ }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="glass-card p-6 mb-8">
      <h3 className="text-lg font-semibold text-white mb-1">How are you feeling today?</h3>
      <p className="text-sm text-slate-400 mb-4">Tap an emoji to log your mood</p>

      <div className="flex gap-3 mb-6">
        {MOODS.map(m => (
          <button
            key={m.score}
            onClick={() => handleSelect(m.score)}
            className={`flex flex-col items-center gap-1 flex-1 py-3 rounded-xl border transition-all ${
              selected === m.score
                ? 'border-nebula/60 bg-nebula/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <span className="text-2xl">{m.emoji}</span>
            <span className="text-[10px] text-slate-400">{m.label}</span>
          </button>
        ))}
      </div>

      {saved && (
        <p className="text-xs text-emerald-400 flex items-center gap-1 mb-4">
          <CheckCircle className="w-3 h-3" /> Mood logged!
        </p>
      )}

      <p className="text-xs text-slate-400 mb-3 font-medium">Last 7 Days</p>
      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" stroke="#475569" fontSize={11} />
            <YAxis domain={[0, 5]} stroke="#475569" fontSize={11} ticks={[1,2,3,4,5]} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(10,10,15,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Line type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
