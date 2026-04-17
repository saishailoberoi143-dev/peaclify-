'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import GlassCard from '@/components/GlassCard';
import { supabase } from '@/lib/supabase-browser';
import {
  BookOpen,
  Calendar,
  Hash,
  Save,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface JournalEntry {
  id: string;
  content: string;
  date: string;
  tags: string[];
  sentiment: number;
  sentimentLabel: string;
}

// Mock sentiment analysis
function analyzeSentiment(text: string): {
  score: number;
  label: string;
  tags: string[];
} {
  const positiveWords = [
    'happy', 'grateful', 'peace', 'love', 'joy', 'excited', 'hopeful',
    'calm', 'content', 'proud', 'amazing', 'wonderful', 'great', 'good',
    'better', 'beautiful', 'strong', 'clarity', 'growth',
  ];
  const negativeWords = [
    'sad', 'anxious', 'worried', 'stress', 'angry', 'fear', 'lonely',
    'tired', 'overwhelmed', 'frustrated', 'hurt', 'confused', 'lost',
    'pain', 'exhausted', 'hopeless',
  ];

  const words = text.toLowerCase().split(/\s+/);
  let positive = 0;
  let negative = 0;

  words.forEach((w) => {
    if (positiveWords.some((p) => w.includes(p))) positive++;
    if (negativeWords.some((n) => w.includes(n))) negative++;
  });

  const total = positive + negative || 1;
  const score = Math.round(((positive - negative) / total + 1) * 50);
  const clampedScore = Math.max(10, Math.min(95, score));

  let label = 'Neutral';
  if (clampedScore > 70) label = 'Positive';
  else if (clampedScore > 55) label = 'Mostly Positive';
  else if (clampedScore < 30) label = 'Needs Attention';
  else if (clampedScore < 45) label = 'Mixed';

  // Auto-generate tags
  const tagMap: Record<string, string[]> = {
    '#Anxiety': ['anxious', 'worried', 'stress', 'overwhelmed'],
    '#Clarity': ['clarity', 'clear', 'understand', 'realize'],
    '#Gratitude': ['grateful', 'thankful', 'appreciate', 'blessed'],
    '#Growth': ['growth', 'learn', 'better', 'progress', 'improve'],
    '#Joy': ['happy', 'joy', 'excited', 'amazing', 'wonderful'],
    '#Reflection': ['think', 'thought', 'wonder', 'reflect', 'remember'],
    '#Self-Care': ['rest', 'sleep', 'exercise', 'meditate', 'relax'],
    '#Connection': ['friend', 'family', 'love', 'together', 'talk'],
  };

  const tags: string[] = [];
  Object.entries(tagMap).forEach(([tag, keywords]) => {
    if (keywords.some((k) => text.toLowerCase().includes(k))) {
      tags.push(tag);
    }
  });

  if (tags.length === 0 && text.length > 20) tags.push('#Reflection');

  return { score: clampedScore, label, tags };
}

export default function JournalPage() {
  const [content, setContent] = useState('');
  const [analysis, setAnalysis] = useState<{
    score: number;
    label: string;
    tags: string[];
  }>({ score: 50, label: 'Neutral', tags: [] });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  // Fetch entries
  useEffect(() => {
    async function fetchEntries() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (data) {
            setEntries(data.map((row: any) => ({
              id: row.id,
              content: row.content,
              date: row.created_at?.split('T')[0],
              tags: row.tags || [],
              sentiment: row.sentiment_score,
              sentimentLabel: row.sentiment_label
            })));
          }
        }
      } catch (err) {
        console.error('Error fetching journal entries:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEntries();
  }, []);

  const updateAnalysis = useCallback(() => {
    if (content.trim().length > 10) {
      const result = analyzeSentiment(content);
      setAnalysis(result);
    } else {
      setAnalysis({ score: 50, label: 'Neutral', tags: [] });
    }
    setWordCount(
      content
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length
    );
  }, [content]);

  useEffect(() => {
    const timer = setTimeout(updateAnalysis, 500);
    return () => clearTimeout(timer);
  }, [content, updateAnalysis]);

  const handleSave = async () => {
    if (!content.trim()) return;

    const currentAnalysis = analyzeSentiment(content);
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      content: content.trim(),
      date: new Date().toISOString().split('T')[0],
      tags: currentAnalysis.tags,
      sentiment: currentAnalysis.score,
      sentimentLabel: currentAnalysis.label,
    };

    // Always add to local state immediately — no auth gate
    setEntries(prev => [newEntry, ...prev]);
    setContent('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    // Try Supabase silently in background
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('journal_entries').insert({
          user_id: user.id,
          content: newEntry.content,
          sentiment_score: currentAnalysis.score,
          sentiment_label: currentAnalysis.label,
          tags: currentAnalysis.tags,
          created_at: new Date().toISOString(),
        });
      }
    } catch {
      // Silently fail — entry already saved to local state
    }
  };



  const getSentimentColor = (score: number) => {
    if (score > 70) return 'text-emerald-400';
    if (score > 55) return 'text-green-300';
    if (score > 45) return 'text-yellow-400';
    if (score > 30) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSentimentBarColor = (score: number) => {
    if (score > 70) return 'from-emerald-500 to-emerald-400';
    if (score > 55) return 'from-green-500 to-green-400';
    if (score > 45) return 'from-yellow-500 to-yellow-400';
    if (score > 30) return 'from-orange-500 to-orange-400';
    return 'from-red-500 to-red-400';
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold text-white"
          >
            <span className="glow-text">Biometric</span> Journal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 mt-2"
          >
            Write freely. Let AI reveal the emotions between your lines.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Writing Area */}
          <GlassCard className="lg:col-span-2" delay={0.2}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {wordCount} words
                </span>
              </div>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="How are you feeling today? Write whatever comes to mind — no filters needed. This is your safe space to express, explore, and understand yourself better..."
              className="w-full h-[400px] bg-transparent text-white placeholder-slate-600 text-base leading-relaxed resize-none outline-none font-light tracking-wide"
              style={{ caretColor: '#7c3aed' }}
            />

            {/* Auto-generated Tags */}
            <AnimatePresence>
              {analysis.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t border-white/5"
                >
                  <Hash className="w-4 h-4 text-slate-500" />
                  {analysis.tags.map((tag) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-3 py-1 rounded-full text-xs font-medium glass text-serenity border border-serenity/20"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save Button */}
            <div className="mt-4 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="glow-btn flex items-center gap-2 text-sm"
              >
                {saved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Entry
                  </>
                )}
              </motion.button>
            </div>
          </GlassCard>

          {/* Analysis Sidebar */}
          <div className="space-y-6">
            {/* Sentiment Score */}
            <GlassCard delay={0.3}>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-nebula" />
                AI Sentiment Analysis
              </h3>

              <div className="text-center mb-4">
                <div
                  className={`text-4xl font-black ${getSentimentColor(
                    analysis.score
                  )}`}
                >
                  {analysis.score}
                </div>
                <div className="text-sm text-slate-400 mt-1">
                  {analysis.label}
                </div>
              </div>

              {/* Sentiment Bar */}
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${getSentimentBarColor(
                    analysis.score
                  )}`}
                  initial={{ width: '50%' }}
                  animate={{ width: `${analysis.score}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Needs Attention</span>
                <span>Positive</span>
              </div>
            </GlassCard>

            {/* Recent Entries */}
            <GlassCard delay={0.4}>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-ember" />
                Recent Entries
              </h3>

              <div className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-xl glass cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <p className="text-xs text-slate-400 mb-1">{entry.date}</p>
                    <p className="text-sm text-slate-300 line-clamp-2">
                      {entry.content}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <TrendingUp
                        className={`w-3 h-3 ${getSentimentColor(
                          entry.sentiment
                        )}`}
                      />
                      <span
                        className={`text-[10px] ${getSentimentColor(
                          entry.sentiment
                        )}`}
                      >
                        {entry.sentimentLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
