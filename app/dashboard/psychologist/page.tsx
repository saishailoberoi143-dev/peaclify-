'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import PageTransition from '@/components/PageTransition';
import GlassCard from '@/components/GlassCard';
import { supabase } from '@/lib/supabase-browser';
import {
  Activity, Users, Heart, Brain, Shield, Eye, Calendar,
  MessageCircle, TrendingUp, AlertTriangle, Send, Star,
  Clock, CheckCircle, XCircle, ChevronRight, Stethoscope,
} from 'lucide-react';

/* ─── Static Seed Data ─── */
const wellnessTrend = [
  { week: 'W1', avgMood: 6.2, sessions: 120 },
  { week: 'W2', avgMood: 6.5, sessions: 145 },
  { week: 'W3', avgMood: 6.8, sessions: 167 },
  { week: 'W4', avgMood: 7.1, sessions: 189 },
  { week: 'W5', avgMood: 6.9, sessions: 178 },
  { week: 'W6', avgMood: 7.3, sessions: 201 },
];

const topConcerns = [
  { topic: 'Academic Stress', mentions: 234, trend: '+12%' },
  { topic: 'Anxiety', mentions: 189, trend: '+5%' },
  { topic: 'Loneliness', mentions: 145, trend: '-8%' },
  { topic: 'Sleep Issues', mentions: 112, trend: '+2%' },
];

const pieColors = ['#22c55e', '#7c3aed', '#fbbf24', '#ff6b35', '#ef4444'];

const defaultMoodCounts = [
  { mood: 'Great', count: 145 }, { mood: 'Good', count: 312 },
  { mood: 'Neutral', count: 189 }, { mood: 'Low', count: 87 },
  { mood: 'Crisis', count: 12 },
];

/* ─── Mock students for demo ─── */
const MOCK_STUDENTS = [
  { id: 's1', name: 'Ananya S.', uid: 'ananya', progress: 74, status: 'online', lastMood: 4, concern: 'Exam stress' },
  { id: 's2', name: 'Raj K.', uid: 'raj', progress: 52, status: 'offline', lastMood: 2, concern: 'Loneliness' },
  { id: 's3', name: 'Meera P.', uid: 'meera', progress: 88, status: 'online', lastMood: 5, concern: 'General anxiety' },
  { id: 's4', name: 'Arun T.', uid: 'arun', progress: 35, status: 'offline', lastMood: 1, concern: 'Sleep issues' },
];

const MOCK_MEETINGS = [
  { id: 'm1', student: 'Ananya S.', time: 'Today at 2:00 PM', type: 'Follow-up', status: 'upcoming' },
  { id: 'm2', student: 'Raj K.', time: 'Today at 4:30 PM', type: 'Initial Assessment', status: 'upcoming' },
  { id: 'm3', student: 'Meera P.', time: 'Yesterday at 11 AM', type: 'Session', status: 'done' },
  { id: 'm4', student: 'Arun T.', time: 'Tomorrow at 10 AM', type: 'Crisis Check-in', status: 'upcoming' },
];

const MOCK_CHAT: Record<string, { role: 'psych' | 'student'; text: string }[]> = {
  s1: [{ role: 'student', text: 'Hi, I\'m really struggling with my upcoming exams.' }, { role: 'psych', text: 'I understand, Ananya. Let\'s talk through it.' }],
  s3: [{ role: 'student', text: 'I feel better this week, thank you!' }, { role: 'psych', text: 'That\'s wonderful to hear, Meera. Keep it up 💜' }],
};

/* ─── Component ─── */
export default function PsychologistDashboard() {
  const [tab, setTab] = useState<'overview' | 'meetings' | 'students' | 'chat'>('overview');
  const [moodCounts, setMoodCounts] = useState(defaultMoodCounts);
  const [briefs, setBriefs] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState(MOCK_STUDENTS[0]);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState(MOCK_CHAT);
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [remarkInput, setRemarkInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory, selectedStudent]);

  useEffect(() => {
    async function load() {
      try {
        const { data: logs } = await supabase.from('mood_logs').select('score');
        if (logs && logs.length > 0) {
          const c = [0, 0, 0, 0, 0];
          logs.forEach((l: any) => { if (l.score >= 1 && l.score <= 5) c[l.score - 1]++; });
          setMoodCounts([
            { mood: 'Great', count: c[4] }, { mood: 'Good', count: c[3] },
            { mood: 'Neutral', count: c[2] }, { mood: 'Low', count: c[1] },
            { mood: 'Crisis', count: c[0] },
          ]);
        }
        const { data: b } = await supabase.from('briefs').select('*').order('created_at', { ascending: false }).limit(5);
        if (b) setBriefs(b);
      } catch { /* fallback to mock */ }
    }
    load();
  }, []);

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const sid = selectedStudent.id;
    setChatHistory(prev => ({
      ...prev,
      [sid]: [...(prev[sid] || []), { role: 'psych', text: chatInput.trim() }],
    }));
    setChatInput('');
  };

  const saveRemark = () => {
    if (!remarkInput.trim()) return;
    setRemarks(prev => ({ ...prev, [selectedStudent.id]: remarkInput.trim() }));
    setRemarkInput('');
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'meetings', label: 'Meetings', icon: Calendar },
    { key: 'students', label: 'Students', icon: Users },
    { key: 'chat', label: 'Live Chat', icon: MessageCircle },
  ] as const;

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-start sm:items-center justify-between mb-6 flex-col sm:flex-row gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Stethoscope className="w-8 h-8 text-ember" />
              Psychologist <span className="glow-text">Portal</span>
            </h1>
            <p className="text-slate-400 mt-1 flex items-center gap-2 text-sm">
              <Shield className="w-3.5 h-3.5" /> Aggregated data — FERPA compliant
            </p>
          </div>
          <div className="flex items-center gap-2 glass px-3 py-2 rounded-xl text-xs text-slate-400">
            <Eye className="w-4 h-4" /> Professional View
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-1 glass p-1 rounded-xl mb-8 w-fit">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${tab === t.key ? 'bg-gradient-to-r from-ember/80 to-orange-500/80 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        <AnimatePresence mode="wait">
          {tab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Active Students', value: '745', sub: '+23% this month', icon: Users, g: 'from-nebula to-violet-500' },
                  { label: 'Avg Wellness', value: '7.1/10', sub: '+0.4 last week', icon: Heart, g: 'from-ember to-orange-400' },
                  { label: 'Sessions Today', value: '4', sub: '2 remaining', icon: Calendar, g: 'from-serenity to-cyan-400' },
                  { label: 'Alerts', value: '3', sub: 'Patterns flagged', icon: AlertTriangle, g: 'from-red-500 to-ember' },
                ].map((c, i) => (
                  <GlassCard key={c.label} delay={i * 0.05} className="relative overflow-hidden">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">{c.label}</p>
                        <p className="text-2xl font-bold text-white">{c.value}</p>
                        <p className="text-xs text-emerald-400 mt-1">{c.sub}</p>
                      </div>
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.g} flex items-center justify-center`}>
                        <c.icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <GlassCard className="lg:col-span-2" delay={0.2}>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4 text-nebula" /> Campus Wellness Trend
                  </h3>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={wellnessTrend}>
                        <defs>
                          <linearGradient id="moodG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="week" stroke="#475569" fontSize={11} />
                        <YAxis stroke="#475569" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,15,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }} />
                        <Area type="monotone" dataKey="avgMood" stroke="#7c3aed" strokeWidth={2} fill="url(#moodG)" name="Avg Mood" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                <GlassCard delay={0.3}>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
                    <Heart className="w-4 h-4 text-ember" /> Mood Distribution
                  </h3>
                  <div className="h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={moodCounts} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="count">
                          {moodCounts.map((_, idx) => <Cell key={idx} fill={pieColors[idx]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,15,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1">
                    {moodCounts.map((item, i) => (
                      <div key={item.mood} className="flex justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: pieColors[i] }} />
                          <span className="text-slate-300">{item.mood}</span>
                        </span>
                        <span className="text-slate-500">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Concerns + Briefs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard delay={0.4}>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
                    <Brain className="w-4 h-4 text-nebula" /> Trending Concerns
                  </h3>
                  <div className="space-y-2">
                    {topConcerns.map((c, i) => (
                      <div key={c.topic} className="flex items-center justify-between p-3 rounded-xl glass hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-600 font-bold text-sm w-5">{i + 1}</span>
                          <span className="text-slate-200 text-sm">{c.topic}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">{c.mentions}</span>
                          <span className={`text-xs font-semibold ${c.trend.startsWith('+') ? 'text-red-400' : 'text-emerald-400'}`}>{c.trend}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard delay={0.5}>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-aura" /> Recent Student Briefs
                  </h3>
                  <div className="space-y-3">
                    {briefs.length > 0 ? briefs.map(b => (
                      <div key={b.id} className="p-3 rounded-xl glass bg-white/[0.02]">
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] font-mono text-slate-500">ID: {b.user_id?.slice(0, 8)}...</span>
                          <span className="text-[10px] text-slate-500">{new Date(b.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-300 italic leading-relaxed">&quot;{b.summary}&quot;</p>
                      </div>
                    )) : (
                      <p className="text-sm text-slate-500 text-center py-4">No briefs yet. Students can send them via the Book page.</p>
                    )}
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {/* ── MEETINGS TAB ── */}
          {tab === 'meetings' && (
            <motion.div key="meetings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <GlassCard>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                  <Calendar className="w-5 h-5 text-ember" /> Scheduled Meetings
                </h3>
                <div className="space-y-4">
                  {MOCK_MEETINGS.map(m => (
                    <div key={m.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all
                      ${m.status === 'upcoming' ? 'border-ember/20 bg-ember/5' : 'border-white/5 bg-white/[0.02] opacity-60'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                          ${m.status === 'upcoming' ? 'bg-ember/20' : 'bg-white/5'}`}>
                          {m.status === 'upcoming'
                            ? <Clock className="w-5 h-5 text-ember" />
                            : <CheckCircle className="w-5 h-5 text-emerald-400" />}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{m.student}</p>
                          <p className="text-slate-400 text-xs">{m.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-300 text-sm">{m.time}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                          ${m.status === 'upcoming' ? 'bg-ember/20 text-ember' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {m.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* ── STUDENTS TAB ── */}
          {tab === 'students' && (
            <motion.div key="students" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {MOCK_STUDENTS.map(s => (
                  <GlassCard key={s.id} className="cursor-pointer hover:border-ember/30 transition-all border border-white/5"
                    onClick={() => { setSelectedStudent(s); setTab('chat'); }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nebula to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                        {s.name.charAt(0)}
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full
                        ${s.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                        ● {s.status}
                      </span>
                    </div>
                    <p className="text-white font-semibold text-sm mb-1">{s.name}</p>
                    <p className="text-slate-500 text-xs mb-3">{s.concern}</p>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Progress</span>
                        <span className={s.progress > 70 ? 'text-emerald-400' : s.progress > 40 ? 'text-yellow-400' : 'text-red-400'}>
                          {s.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all
                          ${s.progress > 70 ? 'bg-emerald-400' : s.progress > 40 ? 'bg-yellow-400' : 'bg-red-400'}`}
                          style={{ width: `${s.progress}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Last mood: {'⭐'.repeat(s.lastMood)}</span>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </div>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── CHAT TAB ── */}
          {tab === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Student list sidebar */}
                <GlassCard>
                  <h3 className="text-sm font-semibold text-white mb-4">Students</h3>
                  <div className="space-y-2">
                    {MOCK_STUDENTS.map(s => (
                      <button key={s.id} onClick={() => setSelectedStudent(s)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left
                          ${selectedStudent.id === s.id ? 'bg-ember/10 border border-ember/30' : 'hover:bg-white/5 border border-transparent'}`}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nebula to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {s.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">{s.name}</p>
                          <p className="text-xs text-slate-500 truncate">{s.concern}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full shrink-0 ${s.status === 'online' ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </GlassCard>

                {/* Chat + Remarks */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <GlassCard className="flex flex-col">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-nebula to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                        {selectedStudent.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{selectedStudent.name}</p>
                        <p className="text-xs text-slate-500">{selectedStudent.concern} · Progress: {selectedStudent.progress}%</p>
                      </div>
                      <span className={`ml-auto text-[10px] font-semibold px-2 py-1 rounded-full
                        ${selectedStudent.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                        ● {selectedStudent.status}
                      </span>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto max-h-64 space-y-3 mb-4 pr-1">
                      {(chatHistory[selectedStudent.id] || []).length === 0
                        ? <p className="text-center text-sm text-slate-500 py-8">No messages yet. Start the conversation.</p>
                        : (chatHistory[selectedStudent.id] || []).map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'psych' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm
                              ${msg.role === 'psych'
                                ? 'bg-gradient-to-r from-ember/80 to-orange-500/70 text-white rounded-br-sm'
                                : 'bg-white/10 text-slate-200 rounded-bl-sm'}`}>
                              {msg.text}
                            </div>
                          </div>
                        ))
                      }
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="flex gap-2">
                      <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendChat()}
                        placeholder={selectedStudent.status === 'online' ? 'Type a message...' : 'Student is offline — message will be delivered later'}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-ember/40 transition-all" />
                      <button onClick={sendChat}
                        className="w-10 h-10 bg-gradient-to-br from-ember to-orange-500 rounded-xl flex items-center justify-center hover:scale-105 transition-transform">
                        <Send className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </GlassCard>

                  {/* Clinical Remarks */}
                  <GlassCard>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-yellow-400" /> Clinical Remarks for {selectedStudent.name}
                    </h3>
                    {remarks[selectedStudent.id] && (
                      <div className="mb-3 p-3 rounded-xl bg-yellow-400/5 border border-yellow-400/20 text-xs text-yellow-200 italic leading-relaxed">
                        &quot;{remarks[selectedStudent.id]}&quot;
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input value={remarkInput} onChange={e => setRemarkInput(e.target.value)}
                        placeholder="Add a clinical note or remark..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-yellow-400/30 transition-all" />
                      <button onClick={saveRemark}
                        className="px-4 py-2.5 bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 text-sm rounded-xl hover:bg-yellow-400/30 transition-all font-semibold">
                        Save
                      </button>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
