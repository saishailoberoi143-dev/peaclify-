// Centralized auth helpers for Peaclify
// Manages local session state across the entire app

export type UserRole = 'student' | 'psychologist';

export interface UserSession {
  email: string;
  role: UserRole;
  loggedIn: boolean;
}

export interface UserProfile {
  email: string;
  role: UserRole;
  name: string;
  age: string;
  gender: string;
  university: string;
  phone: string;
  bio: string;
  joinedAt: string;
}

const SESSION_KEY = 'peaclify_session';
const PROFILE_KEY_PREFIX = 'peaclify_profile_';

// ===== SESSION MANAGEMENT =====

export function getSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as UserSession;
    if (session.loggedIn && session.email) return session;
    return null;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return getSession() !== null;
}

export function setSession(email: string, role: UserRole): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email, role, loggedIn: true }));
  } catch {}
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

// ===== PROFILE MANAGEMENT =====

function profileKey(email: string): string {
  return `${PROFILE_KEY_PREFIX}${email}`;
}

export function getProfile(email?: string): UserProfile | null {
  try {
    const session = getSession();
    const userEmail = email || session?.email;
    if (!userEmail) return null;

    const raw = localStorage.getItem(profileKey(userEmail));
    if (!raw) {
      // Return a default profile if none exists
      return {
        email: userEmail,
        role: session?.role || 'student',
        name: '',
        age: '',
        gender: '',
        university: '',
        phone: '',
        bio: '',
        joinedAt: new Date().toISOString(),
      };
    }
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(profileKey(profile.email), JSON.stringify(profile));
  } catch {}
}

export function logout(): void {
  clearSession();
  // Don't clear profile data — user should see it when they log back in
}
