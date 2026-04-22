// Echo Wall persistence layer using localStorage
// Posts are stored globally so ALL users can see the same wall
// This is a shared community wall — not user-scoped

export interface WallPost {
  id: string;
  content: string;
  emoji: string;
  likes: number;
  replies: number;
  created_at: string;
  color: string;
  likedBy: string[]; // emails of users who liked
  isRecovery: boolean;
}

const WALL_STORAGE_KEY = 'peaclify_echo_wall';

// Seed posts shown when wall is empty
const SEED_POSTS: Omit<WallPost, 'color'>[] = [
  {
    id: 'seed_1',
    content: '"The storm will pass. It always does." Needed to hear my own words today.',
    emoji: '🌊',
    likes: 47,
    replies: 12,
    created_at: new Date(Date.now() - 2 * 60000).toISOString(),
    likedBy: [],
    isRecovery: false,
  },
  {
    id: 'seed_2',
    content: 'Day 30 of therapy and I finally cried in session. Feels like unlocking a door I forgot existed.',
    emoji: '🔓',
    likes: 128,
    replies: 34,
    created_at: new Date(Date.now() - 8 * 60000).toISOString(),
    likedBy: [],
    isRecovery: true,
  },
  {
    id: 'seed_3',
    content: 'Small win: I went outside today. Just sat on the porch for 10 minutes. It counts.',
    emoji: '☀️',
    likes: 256,
    replies: 45,
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    likedBy: [],
    isRecovery: false,
  },
  {
    id: 'seed_4',
    content: "Reminder: You don't always need to be productive. Sometimes existing is enough.",
    emoji: '🌙',
    likes: 312,
    replies: 28,
    created_at: new Date(Date.now() - 22 * 60000).toISOString(),
    likedBy: [],
    isRecovery: false,
  },
  {
    id: 'seed_5',
    content: 'Started a gratitude journal today. First entry: grateful for this anonymous space where I can just be.',
    emoji: '📝',
    likes: 89,
    replies: 16,
    created_at: new Date(Date.now() - 35 * 60000).toISOString(),
    likedBy: [],
    isRecovery: false,
  },
  {
    id: 'seed_6',
    content: 'My anxiety said "what if everything goes wrong?" and I replied "what if everything goes right?" for the first time.',
    emoji: '💪',
    likes: 445,
    replies: 67,
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
    likedBy: [],
    isRecovery: true,
  },
];

const GRADIENT_COLORS = [
  'from-nebula/20 to-nebula/5',
  'from-ember/20 to-ember/5',
  'from-warmth/20 to-warmth/5',
  'from-serenity/20 to-serenity/5',
  'from-aura/20 to-aura/5',
  'from-pulse/20 to-pulse/5',
];

function assignColor(index: number): string {
  return GRADIENT_COLORS[index % GRADIENT_COLORS.length];
}

// Get current user email for tracking likes
function getCurrentUserEmail(): string {
  try {
    const session = localStorage.getItem('peaclify_session');
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed.email) return parsed.email;
    }
  } catch {}
  return '_anonymous';
}

// Get all wall posts (shared across all users)
export function getWallPosts(): WallPost[] {
  try {
    const raw = localStorage.getItem(WALL_STORAGE_KEY);
    if (!raw) {
      // First time: seed with initial posts
      const seeded = SEED_POSTS.map((p, i) => ({ ...p, color: assignColor(i) }));
      saveWallPosts(seeded);
      return seeded;
    }
    const posts: WallPost[] = JSON.parse(raw);
    return posts.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch {
    return [];
  }
}

// Add a new post to the wall
export function addWallPost(content: string, emoji: string, isRecovery: boolean): WallPost {
  const posts = getWallPosts();
  const newPost: WallPost = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    content: content.trim(),
    emoji,
    likes: 0,
    replies: 0,
    created_at: new Date().toISOString(),
    color: assignColor(posts.length),
    likedBy: [],
    isRecovery,
  };
  posts.unshift(newPost);
  saveWallPosts(posts);
  return newPost;
}

// Toggle like on a post (per-user)
export function toggleLikePost(postId: string): WallPost | null {
  const email = getCurrentUserEmail();
  const posts = getWallPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;

  if (post.likedBy.includes(email)) {
    // Unlike
    post.likedBy = post.likedBy.filter((e) => e !== email);
    post.likes = Math.max(0, post.likes - 1);
  } else {
    // Like
    post.likedBy.push(email);
    post.likes += 1;
  }

  saveWallPosts(posts);
  return post;
}

// Check if current user has liked a post
export function hasUserLikedPost(post: WallPost): boolean {
  const email = getCurrentUserEmail();
  return post.likedBy.includes(email);
}

// Delete a post (if needed in the future)
export function deleteWallPost(postId: string): void {
  const posts = getWallPosts().filter((p) => p.id !== postId);
  saveWallPosts(posts);
}

// --- Internal ---
function saveWallPosts(posts: WallPost[]): void {
  try {
    // Keep max 200 posts to avoid quota issues
    const trimmed = posts.slice(0, 200);
    localStorage.setItem(WALL_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Failed to save wall posts:', e);
  }
}
