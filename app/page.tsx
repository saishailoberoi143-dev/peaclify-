'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import GlassCard from '@/components/GlassCard';
import PageTransition from '@/components/PageTransition';
import SplineScene from '@/components/SplineScene';
import {
  Brain,
  Heart,
  MessageCircle,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Companion',
    description:
      'Deep conversations with an AI that truly understands your emotional landscape.',
    gradient: 'from-nebula to-pulse',
  },
  {
    icon: Heart,
    title: 'Biometric Journal',
    description:
      'Write freely. Our AI reads between the lines and reveals your emotional patterns.',
    gradient: 'from-ember to-warmth',
  },
  {
    icon: Users,
    title: 'Echo Wall',
    description:
      'Anonymous community space where your voice echoes and finds resonance with others.',
    gradient: 'from-aura to-pulse',
  },
  {
    icon: TrendingUp,
    title: 'Pulse Dashboard',
    description:
      'Visualize your wellness journey with beautiful biometric-style analytics.',
    gradient: 'from-serenity to-nebula',
  },
];

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '2M+', label: 'Conversations' },
  { value: '98%', label: 'Felt Heard' },
  { value: '4.9★', label: 'App Rating' },
];

export default function HomePage() {
  return (
    <PageTransition>
      <div className="relative">
        {/* ======== HERO SECTION ======== */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
          {/* Spline 3D Background (with error boundary fallback) */}
          <div className="absolute inset-0 z-0">
            <SplineScene />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-void/40 via-void/60 to-void/90 pointer-events-none" />
          </div>

          <div className="relative z-10 text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
            >
              <Sparkles className="w-4 h-4 text-ember" />
              <span className="text-sm text-slate-300">
                Your mental health matters
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6"
            >
              <span className="text-white">Find Your</span>
              <br />
              <span className="glow-text">Peace</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              A premium AI-powered companion that listens deeply, tracks your
              emotional pulse, and connects you with a community that truly
              understands.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/chat">
                <button className="glow-btn flex items-center gap-2 text-lg px-8 py-4">
                  <Sparkles className="w-5 h-5" />
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="glass px-8 py-4 text-white font-medium rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-ember" />
                  Explore Dashboard
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-white/60"
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </section>

        {/* ======== FEATURES SECTION ======== */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Everything you need to{' '}
                <span className="glow-text">feel better</span>
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Four powerful tools designed to support your mental wellness
                journey, all in one beautiful place.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, i) => (
                <GlassCard key={feature.title} delay={i * 0.1}>
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* ======== STATS SECTION ======== */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="glass-strong p-8 sm:p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl sm:text-4xl font-black glow-text mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ======== CTA BOTTOM ======== */}
        <section className="py-24 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Shield className="w-12 h-12 text-nebula mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Your safe space awaits
              </h2>
              <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                Everything you share is private. No judgments, no data selling,
                just genuine support for your wellbeing.
              </p>
              <Link href="/chat">
                <button className="glow-btn text-lg px-10 py-4 flex items-center gap-2 mx-auto">
                  <MessageCircle className="w-5 h-5" />
                  Talk to Peaclify
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-white/5">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-nebula" />
              <span className="font-semibold text-white">Peaclify</span>
            </div>
            <p className="text-sm text-slate-500">
              © 2024 Peaclify. Built with 💜 for your peace of mind.
            </p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
