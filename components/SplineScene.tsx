'use client';

import { Component, ReactNode, Suspense, lazy, useState } from 'react';
import { motion } from 'framer-motion';

const Spline = lazy(() => import('@splinetool/react-spline'));

// Error boundary for Spline component
class SplineErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('Spline 3D scene failed to load:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Animated fallback background
function AnimatedFallback() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${80 + i * 40}px`,
            height: `${80 + i * 40}px`,
            background: `radial-gradient(circle, ${
              [
                'rgba(124,58,237,0.18)',
                'rgba(255,107,53,0.12)',
                'rgba(59,130,246,0.14)',
                'rgba(6,182,212,0.12)',
                'rgba(167,139,250,0.14)',
                'rgba(251,191,36,0.12)',
              ][i]
            }, transparent 70%)`,
            left: `${10 + i * 14}%`,
            top: `${15 + (i % 3) * 22}%`,
          }}
          animate={{
            y: [0, -35, 0],
            x: [0, i % 2 === 0 ? 25 : -25, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 5 + i * 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default function SplineScene() {
  const [splineError, setSplineError] = useState(false);

  if (splineError) {
    return <AnimatedFallback />;
  }

  return (
    <SplineErrorBoundary fallback={<AnimatedFallback />}>
      <Suspense
        fallback={
          <div className="w-full h-full bg-gradient-to-br from-nebula/10 via-transparent to-ember/10 animate-pulse" />
        }
      >
        <Spline
          scene="https://prod.spline.design/6Wq1Q7nS4Z9S8H-Y/scene.splinecode"
          className="absolute inset-0 w-full h-full"
          onError={() => setSplineError(true)}
        />
      </Suspense>
    </SplineErrorBoundary>
  );
}
