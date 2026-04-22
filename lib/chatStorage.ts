// Chat persistence layer using localStorage
// Each conversation is stored as a separate entry with a unique ID

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string for serialization
  emotions?: {
    emotions: { name: string; score: number }[];
    dominantEmotion: string;
    timestamp: number;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'peaclify_chats';
const ACTIVE_CHAT_KEY = 'peaclify_active_chat';

// Get all chat sessions from localStorage
export function getAllSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const sessions: ChatSession[] = JSON.parse(raw);
    // Sort by most recently updated
    return sessions.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch {
    return [];
  }
}

// Get a specific session by ID
export function getSession(id: string): ChatSession | null {
  const sessions = getAllSessions();
  return sessions.find((s) => s.id === id) || null;
}

// Create a new chat session
export function createSession(): ChatSession {
  const session: ChatSession = {
    id: generateId(),
    title: 'New Chat',
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sessions = getAllSessions();
  sessions.unshift(session);
  saveSessions(sessions);
  setActiveSessionId(session.id);
  return session;
}

// Save/update a session
export function saveSession(session: ChatSession): void {
  const sessions = getAllSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session);
  }
  saveSessions(sessions);
}

// Delete a session
export function deleteSession(id: string): void {
  const sessions = getAllSessions().filter((s) => s.id !== id);
  saveSessions(sessions);

  // If we deleted the active session, clear it
  if (getActiveSessionId() === id) {
    clearActiveSessionId();
  }
}

// Add a message to a session and auto-generate title from first user message
export function addMessageToSession(
  sessionId: string,
  message: ChatMessage
): ChatSession | null {
  const session = getSession(sessionId);
  if (!session) return null;

  session.messages.push(message);
  session.updatedAt = new Date().toISOString();

  // Auto-title from first user message
  if (
    session.title === 'New Chat' &&
    message.role === 'user' &&
    message.content.trim()
  ) {
    session.title = message.content.slice(0, 50) + (message.content.length > 50 ? '…' : '');
  }

  saveSession(session);
  return session;
}

// Get/set the active session ID
export function getActiveSessionId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_CHAT_KEY);
  } catch {
    return null;
  }
}

export function setActiveSessionId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_CHAT_KEY, id);
  } catch {}
}

export function clearActiveSessionId(): void {
  try {
    localStorage.removeItem(ACTIVE_CHAT_KEY);
  } catch {}
}

// Format a relative time string
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// --- Internal helpers ---

function saveSessions(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.warn('Failed to save chat sessions:', e);
    // If quota exceeded, remove oldest sessions
    if (sessions.length > 20) {
      sessions.splice(20);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      } catch {}
    }
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
