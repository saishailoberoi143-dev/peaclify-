'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import { supabase } from '@/lib/supabase-browser';
import {
  Globe,
  Heart,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  X,
  Clock,
  Loader2,
} from 'lucide-react';

interface Post {
  id: string;
  content: string;
  emoji: string;
  likes: number;
  replies: number;
  created_at: string;
  color: string;
  liked: boolean;
}

const gradientColors = [
  'from-nebula/20 to-nebula/5',
  'from-ember/20 to-ember/5',
  'from-warmth/20 to-warmth/5',
  'from-serenity/20 to-serenity/5',
  'from-aura/20 to-aura/5',
  'from-pulse/20 to-pulse/5',
];

const mockPosts: Post[] = [
  {
    id: '1',
    content: '"The storm will pass. It always does." Needed to hear my own words today.',
    emoji: '🌊',
    likes: 47,
    replies: 12,
    created_at: new Date(Date.now() - 2 * 60000).toISOString(),
    color: 'from-nebula/20 to-nebula/5',
    liked: false,
  },
  {
    id: '2',
    content: 'Day 30 of therapy and I finally cried in session. Feels like unlocking a door I forgot existed.',
    emoji: '🔓',
    likes: 128,
    replies: 34,
    created_at: new Date(Date.now() - 8 * 60000).toISOString(),
    color: 'from-ember/20 to-ember/5',
    liked: false,
  },
  {
    id: '3',
    content: 'Small win: I went outside today. Just sat on the porch for 10 minutes. It counts.',
    emoji: '☀️',
    likes: 256,
    replies: 45,
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    color: 'from-warmth/20 to-warmth/5',
    liked: false,
  },
  {
    id: '4',
    content: "Reminder: You don't always need to be productive. Sometimes existing is enough.",
    emoji: '🌙',
    likes: 312,
    replies: 28,
    created_at: new Date(Date.now() - 22 * 60000).toISOString(),
    color: 'from-serenity/20 to-serenity/5',
    liked: false,
  },
  {
    id: '5',
    content: 'Started a gratitude journal today. First entry: grateful for this anonymous space where I can just be.',
    emoji: '📝',
    likes: 89,
    replies: 16,
    created_at: new Date(Date.now() - 35 * 60000).toISOString(),
    color: 'from-aura/20 to-aura/5',
    liked: false,
  },
  {
    id: '6',
    content: 'My anxiety said "what if everything goes wrong?" and I replied "what if everything goes right?" for the first time.',
    emoji: '💪',
    likes: 445,
    replies: 67,
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
    color: 'from-pulse/20 to-pulse/5',
    liked: false,
  },
];

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function WallPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💜');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [uniFilter, setUniFilter] = useState<'LPU' | 'Global'>('LPU');
  const [isRecovery, setIsRecovery] = useState(false);

  const emojis = ['💜', '🌊', '☀️', '🌙', '🔥', '🌿', '✨', '🫂', '📝', '💪'];

  // Fetch posts from Supabase, fallback to mock data
  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('echo_wall')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data) {
        const mapped: Post[] = data.map((row, i) => ({
          id: row.id?.toString() || i.toString(),
          content: row.content || '',
          emoji: row.emoji || '💜',
          likes: row.likes || 0,
          replies: row.replies || 0,
          created_at: row.created_at || new Date().toISOString(),
          color: gradientColors[i % gradientColors.length],
          liked: false,
        }));
        setPosts(mapped.length > 0 ? mapped : mockPosts);
      } else {
        // No data in table yet, use mock seed posts
        setPosts(mockPosts);
      }
    } catch {
      // Supabase not configured or table doesn't exist — use mock data
      console.log('Using mock data for Echo Wall (Supabase not configured)');
      setPosts(mockPosts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Create masonry columns
  const columns = useMemo(() => {
    const cols: Post[][] = [[], [], []];
    posts.forEach((post, i) => {
      cols[i % 3].push(post);
    });
    return cols;
  }, [posts]);

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handlePost = async () => {
    if (!newContent.trim()) return;
    setPosting(true);

    const newPost: Post = {
      id: Date.now().toString(),
      content: newContent.trim(),
      emoji: selectedEmoji,
      likes: 0,
      replies: 0,
      created_at: new Date().toISOString(),
      color: gradientColors[Math.floor(Math.random() * gradientColors.length)],
      liked: false,
    };

    // Try to insert into Supabase
    try {
      const { data: inserted, error } = await supabase
        .from('echo_wall')
        .insert({
          content: newContent.trim(),
          emoji: selectedEmoji,
          likes: 0,
          replies: 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Use real DB id for the post so it's persistent
      if (inserted) {
        newPost.id = inserted.id?.toString();
      }
    } catch {
      console.log('Added post locally (Supabase insert failed)');
    }

    // Add to local state and re-fetch to sync
    setPosts((prev) => [newPost, ...prev]);
    setNewContent('');
    setSelectedEmoji('💜');
    setShowModal(false);
    setIsRecovery(false);
    setPosting(false);

    // Re-fetch after short delay so DB is consistent
    setTimeout(() => fetchPosts(), 800);
  };

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
              <span className="glow-text">Echo</span> Wall
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 mt-2 flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              Anonymous voices finding resonance
            </motion.p>
          </div>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="glow-btn flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Share Your Echo
          </motion.button>
        </div>

        {/* University Filter */}
        <div className="flex items-center gap-3 mb-6">
          {(['LPU', 'Global'] as const).map(u => (
            <button
              key={u}
              onClick={() => setUniFilter(u)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                uniFilter === u
                  ? 'bg-nebula/20 border-nebula/50 text-white'
                  : 'border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {u === 'LPU' ? '🎓 LPU' : '🌐 Global'}
            </button>
          ))}
          {/* #Exams badge — shows when posts tagged with exams */}
          <span className="ml-auto text-[11px] bg-nebula/15 border border-nebula/30 text-nebula px-3 py-1 rounded-full">
            847 students feeling this ✦ #Exams
          </span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-nebula animate-spin" />
          </div>
        ) : (
          /* Masonry Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="space-y-4">
                {column.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className={`glass-card p-5 relative overflow-hidden group`}
                  >
                    {/* Gradient accent */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${post.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    />

                    <div className="relative z-10">
                      {/* Emoji + Time */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl">{post.emoji}</span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(post.created_at)}
                        </span>
                      </div>

                      {/* Content */}
                      <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-4">
                        {post.content}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-4">
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center gap-1.5 text-xs transition-colors ${
                            post.liked
                              ? 'text-red-400'
                              : 'text-slate-500 hover:text-red-400'
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${post.liked ? 'fill-current' : ''}`}
                          />
                          {post.likes}
                        </motion.button>
                        <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          {post.replies}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Post Creation Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-strong p-6 w-full max-w-lg relative"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-nebula" />
                  Share Your Echo
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Your voice matters. Post anonymously.
                </p>
                {/* Recovery Story toggle */}
                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                  <div className={`w-9 h-5 rounded-full transition-colors ${isRecovery ? 'bg-nebula' : 'bg-white/10'} relative`}>
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isRecovery ? 'translate-x-4' : ''}`} />
                  </div>
                  <input type="checkbox" className="sr-only" checked={isRecovery} onChange={e => setIsRecovery(e.target.checked)} />
                  <span className="text-xs text-slate-300">🌱 Recovery Story</span>
                  {isRecovery && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">Recovery</span>}
                </label>

                {/* Emoji Picker */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {emojis.map((em) => (
                    <motion.button
                      key={em}
                      whileTap={{ scale: 0.8 }}
                      onClick={() => setSelectedEmoji(em)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                        selectedEmoji === em
                          ? 'glass border-nebula/40 scale-110'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      {em}
                    </motion.button>
                  ))}
                </div>

                {/* Text Area */}
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="What's on your mind? Your echo might resonate with someone who needs it..."
                  rows={4}
                  className="w-full bg-white/5 text-white placeholder-slate-500 text-sm rounded-xl border border-white/10 p-4 resize-none outline-none focus:border-nebula/40 transition-colors"
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-500">
                    {newContent.length}/500
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handlePost}
                    disabled={!newContent.trim() || posting}
                    className="glow-btn flex items-center gap-2 text-sm disabled:opacity-40"
                  >
                    {posting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Post Echo
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
