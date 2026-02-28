import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Newcastle Sunday Club',
  description: 'Private vehicle storage & events — Newcastle, CA',
  openGraph: {
    title: 'Newcastle Sunday Club',
    description: 'Private vehicle storage & events',
    type: 'website',
  },
  robots: {
    index: false,  // private — don't index
    follow: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
