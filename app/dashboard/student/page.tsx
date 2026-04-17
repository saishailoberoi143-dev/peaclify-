'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import PageTransition from '@/components/PageTransition';
import GlassCard from '@/components/GlassCard';
import MoodSelector from '@/components/MoodSelector';
import Link from 'next/link';
import {
  Activity,
  Brain,
  Flame,
  Heart,
  Moon,
  Smile,
  Sun,
  TrendingUp,
  Zap,
  BookOpen,
  MessageCircle,
  CalendarCheck,
} from 'lucide-react';

const moodData7d = [
  { day: 'Mon', mood: 7.2, energy: 6.5, calm: 8.0 },
  { day: 'Tue', mood: 6.8, energy: 7.0, calm: 6.5 },
  { day: 'Wed', mood: 8.1, energy: 8.2, calm: 7.8 },
  { day: 'Thu', mood: 7.5, energy: 6.0, calm: 7.2 },
  { day: 'Fri', mood: 8.5, energy: 8.8, calm: 8.5 },
  { day: 'Sat', mood: 9.0, energy: 9.0, calm: 9.2 },
  { day: 'Sun', mood: 8.2, energy: 7.5, calm: 8.8 },
];

const moodData30d = [
  { day: 'W1', mood: 6.5, energy: 5.8, calm: 6.2 },
  { day: 'W2', mood: 7.0, energy: 6.5, calm: 6.8 },
  { day: 'W3', mood: 7.8, energy: 7.2, calm: 7.5 },
  { day: 'W4', mood: 8.2, energy: 8.0, calm: 8.0 },
];

function generateCalendarData() {
  const data: { date: string; level: number }[] = [];
  const today = new Date();
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toISOString().split('T')[0],
      level: Math.random() > 0.3 ? Math.ceil(Math.random() * 4) : 0,
    });
  }
  return data;
}

const statCards = [
  {
    label: 'Mood Score',
    value: '8.2',
    change: '+12%',
    icon: Smile,
    gradient: 'from-nebula to-serenity',
  },
  {
    label: 'Streak',
    value: '14 days',
    change: 'Personal best!',
    icon: Flame,
    gradient: 'from-ember to-warmth',
  },
  {
    label: 'Energy Level',
    value: '7.5',
    change: '+8%',
    icon: Zap,
    gradient: 'from-pulse to-aura',
  },
  {
    label: 'Sleep Quality',
    value: '8.0',
    change: '+5%',
    icon: Moon,
    gradient: 'from-serenity to-nebula',
  },
];

const levelColors = [
  'bg-white/5',
  'bg-ember/20',
  'bg-ember/40',
  'bg-ember/60',
  'bg-ember/80',
];

export default function StudentDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const calendarData = useMemo(() => generateCalendarData(), []);
  const chartData = timeRange === '7d' ? moodData7d : moodData30d;

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between mb-8 flex-col sm:flex-row gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl font-bold text-white"
            >
              Your <span className="glow-text">Pulse</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 mt-2"
            >
              Track your emotional biometrics and wellness patterns
            </motion.p>
          </div>
          <div className="flex gap-2">
            <Link href="/journal">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass px-4 py-2.5 text-sm text-slate-300 hover:text-white flex items-center gap-2 rounded-xl transition-colors"
              >
                <BookOpen className="w-4 h-4 text-ember" />
                Journal
              </motion.button>
            </Link>
            <Link href="/book">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass px-4 py-2.5 text-sm text-slate-300 hover:text-white flex items-center gap-2 rounded-xl transition-colors"
              >
                <CalendarCheck className="w-4 h-4 text-nebula" />
                Counselor
              </motion.button>
            </Link>
            <Link href="/chat">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glow-btn flex items-center gap-2 text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Chat
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Mood Check-in */}
        <MoodSelector />

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <GlassCard key={card.label} delay={i * 0.1} className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                  <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {card.change}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}
                >
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div
                className={`absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 blur-2xl`}
              />
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mood Chart */}
          <GlassCard className="lg:col-span-2" delay={0.3}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-nebula" />
                  Mood Tracking
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Your emotional trajectory
                </p>
              </div>
              <div className="flex gap-1 glass p-1 rounded-xl">
                <button
                  onClick={() => setTimeRange('7d')}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    timeRange === '7d'
                      ? 'bg-nebula/30 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  7D
                </button>
                <button
                  onClick={() => setTimeRange('30d')}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    timeRange === '30d'
                      ? 'bg-nebula/30 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  30D
                </button>
              </div>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#475569" fontSize={12} />
                  <YAxis stroke="#475569" fontSize={12} domain={[0, 10]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(10,10,15,0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(20px)',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    fill="url(#moodGrad)"
                    dot={{ fill: '#7c3aed', strokeWidth: 0, r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="energy"
                    stroke="#ff6b35"
                    strokeWidth={2}
                    fill="url(#energyGrad)"
                    dot={{ fill: '#ff6b35', strokeWidth: 0, r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="calm"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', strokeWidth: 0, r: 3 }}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-nebula rounded" /> Mood
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-ember rounded" /> Energy
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-aura rounded" style={{ borderTop: '2px dashed' }} /> Calm
              </span>
            </div>
          </GlassCard>

          {/* Consistency Calendar */}
          <GlassCard delay={0.4}>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-ember" />
              Consistency
            </h3>
            <p className="text-sm text-slate-400 mb-4">Last 12 weeks</p>
            <div className="grid grid-cols-12 gap-1">
              {calendarData.map((cell, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.005 }}
                  className={`aspect-square rounded-sm ${levelColors[cell.level]} transition-all hover:scale-150 cursor-pointer`}
                  title={`${cell.date}: Level ${cell.level}`}
                />
              ))}
            </div>
            <div className="flex items-center justify-end gap-1 mt-3 text-xs text-slate-500">
              <span>Less</span>
              {levelColors.map((c, i) => (
                <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
              ))}
              <span>More</span>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-medium text-slate-300">Quick Actions</h4>
              {[
                { icon: Brain, label: 'Log Mood', color: 'text-nebula' },
                { icon: Heart, label: 'Gratitude Entry', color: 'text-ember' },
                { icon: Sun, label: 'Morning Check-in', color: 'text-warmth' },
              ].map((action) => (
                <button
                  key={action.label}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl glass text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  <action.icon className={`w-4 h-4 ${action.color}`} />
                  {action.label}
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </PageTransition>
  );
}
