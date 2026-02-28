import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import './mobile.css';

import { auth } from '@/auth';
import { SessionProvider } from '@/components/providers/session-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Newcastle Sunday Club',
  description: 'Private vehicle storage & events — Newcastle, CA',
  openGraph: {
    title: 'Newcastle Sunday Club',
    description: 'Private vehicle storage & events',
    type: 'website',
  },
  robots: {
    index: false, // private — don't index
    follow: false,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
