import type { Metadata } from 'next';
import { Doto } from 'next/font/google';
import { ToastContainer } from 'react-toastify';

import '@/app/globals.css';
import Header from '@/components/header';

const doto = Doto({
  weight: '700',
  variable: '--font-doto',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'easyCFR',
  description: 'Easily navigate the eCFR.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="h-full bg-gray-50" lang="en">
      <body className={`${doto.variable} antialiased h-full bg-gray-50`}>
        <div className="min-h-full">
          <ToastContainer className="text-sm" />

          <Header />

          <main>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
