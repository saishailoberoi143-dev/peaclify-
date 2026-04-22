'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import {
  getSession,
  getProfile,
  saveProfile,
  logout,
  type UserProfile,
} from '@/lib/auth';
import {
  User,
  Mail,
  Calendar,
  Phone,
  GraduationCap,
  Shield,
  LogOut,
  Save,
  CheckCircle,
  Sparkles,
  Heart,
  Settings as SettingsIcon,
  Pencil,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace('/login');
      return;
    }
    const p = getProfile(session.email);
    if (p) {
      // Ensure joinedAt is set
      if (!p.joinedAt) p.joinedAt = new Date().toISOString();
      setProfile(p);
    }
  }, [router]);

  const handleSave = () => {
    if (!profile) return;
    saveProfile(profile);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const updateField = (key: keyof UserProfile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [key]: value });
  };

  if (!profile) {
    return (
      <PageTransition>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-slate-400">Loading...</div>
        </div>
      </PageTransition>
    );
  }

  const memberSince = new Date(profile.joinedAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white flex items-center gap-3"
            >
              <SettingsIcon className="w-7 h-7 text-nebula" />
              Settings
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 text-sm mt-1"
            >
              Manage your profile and preferences
            </motion.p>
          </div>

          {!editing ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              className="glow-btn flex items-center gap-2 text-sm"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </motion.button>
          )}
        </div>

        {/* Success Banner */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Profile saved successfully!
          </motion.div>
        )}

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-6 mb-6"
        >
          {/* Avatar + Basic Info */}
          <div className="flex items-center gap-5 mb-6 pb-6 border-b border-white/10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-nebula to-ember flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-nebula/20">
              {profile.name
                ? profile.name.charAt(0).toUpperCase()
                : profile.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {profile.name || 'Set your name'}
              </h2>
              <p className="text-sm text-slate-400">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    profile.role === 'psychologist'
                      ? 'bg-ember/20 text-ember border border-ember/30'
                      : 'bg-nebula/20 text-nebula border border-nebula/30'
                  }`}
                >
                  {profile.role === 'psychologist' ? '🩺 Psychologist' : '🎓 Student'}
                </span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Member since {memberSince}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="space-y-5">
            <ProfileField
              icon={<User className="w-4 h-4" />}
              label="Full Name"
              value={profile.name}
              placeholder="Enter your full name"
              editing={editing}
              onChange={(v) => updateField('name', v)}
            />
            <ProfileField
              icon={<Mail className="w-4 h-4" />}
              label="Email"
              value={profile.email}
              placeholder=""
              editing={false}
              onChange={() => {}}
              disabled
            />
            <ProfileField
              icon={<Calendar className="w-4 h-4" />}
              label="Age"
              value={profile.age}
              placeholder="e.g., 20"
              editing={editing}
              onChange={(v) => updateField('age', v)}
              type="number"
            />
            <ProfileField
              icon={<Heart className="w-4 h-4" />}
              label="Gender"
              value={profile.gender}
              placeholder="e.g., Male, Female, Non-binary"
              editing={editing}
              onChange={(v) => updateField('gender', v)}
              selectOptions={['Male', 'Female', 'Non-binary', 'Prefer not to say']}
            />
            <ProfileField
              icon={<GraduationCap className="w-4 h-4" />}
              label="University / Institution"
              value={profile.university}
              placeholder="e.g., Lovely Professional University"
              editing={editing}
              onChange={(v) => updateField('university', v)}
            />
            <ProfileField
              icon={<Phone className="w-4 h-4" />}
              label="Phone Number"
              value={profile.phone}
              placeholder="e.g., +91 98765 43210"
              editing={editing}
              onChange={(v) => updateField('phone', v)}
            />

            {/* Bio */}
            <div>
              <label className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
                <Shield className="w-4 h-4" />
                About Me
              </label>
              {editing ? (
                <textarea
                  value={profile.bio}
                  onChange={(e) => updateField('bio', e.target.value)}
                  placeholder="Write a short bio about yourself..."
                  rows={3}
                  maxLength={300}
                  className="w-full bg-white/5 text-white placeholder-slate-500 text-sm rounded-xl border border-white/10 p-3 resize-none outline-none focus:border-nebula/40 transition-colors"
                />
              ) : (
                <p className="text-sm text-slate-300 bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 min-h-[60px]">
                  {profile.bio || <span className="text-slate-600 italic">No bio set</span>}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-6 border-red-500/10"
        >
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <LogOut className="w-4 h-4 text-red-400" />
            Account
          </h3>

          {!showLogoutConfirm ? (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </motion.button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">Are you sure?</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Yes, Log Out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-sm hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
}

// ===== REUSABLE PROFILE FIELD COMPONENT =====
function ProfileField({
  icon,
  label,
  value,
  placeholder,
  editing,
  onChange,
  disabled,
  type,
  selectOptions,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  placeholder: string;
  editing: boolean;
  onChange: (val: string) => void;
  disabled?: boolean;
  type?: string;
  selectOptions?: string[];
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
        {icon}
        {label}
      </label>
      {editing && !disabled ? (
        selectOptions ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-white/5 text-white text-sm rounded-xl border border-white/10 px-4 py-3 outline-none focus:border-nebula/40 transition-colors appearance-none cursor-pointer"
          >
            <option value="" className="bg-slate-900 text-slate-400">
              Select {label.toLowerCase()}
            </option>
            {selectOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-slate-900">
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type || 'text'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-white/5 text-white placeholder-slate-500 text-sm rounded-xl border border-white/10 px-4 py-3 outline-none focus:border-nebula/40 transition-colors"
          />
        )
      ) : (
        <p
          className={`text-sm rounded-xl px-4 py-3 border ${
            disabled
              ? 'text-slate-500 bg-white/[0.02] border-white/5'
              : 'text-slate-300 bg-white/[0.03] border-white/5'
          }`}
        >
          {value || (
            <span className="text-slate-600 italic">
              {disabled ? value : 'Not set'}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
