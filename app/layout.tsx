import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import AuroraBackground from '@/components/AuroraBackground';
import SmartBanner from '@/components/SmartBanner';
import EmergencyHelp from '@/components/EmergencyHelp';

export const metadata: Metadata = {
  title: 'Peaclify — Find Your Peace',
  description:
    'A premium mental health & wellness companion for young adults. AI-powered chats, biometric journaling, and a community that truly understands.',
  keywords: ['mental health', 'wellness', 'AI companion', 'journaling', 'mindfulness'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <AuroraBackground />
        <Navbar />
        <SmartBanner />
        <main className="relative z-10 min-h-screen pt-20">
          {children}
        </main>
        <EmergencyHelp />
      </body>
    </html>
  );
}
