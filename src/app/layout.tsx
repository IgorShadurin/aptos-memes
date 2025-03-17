import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Header from '@/components/Header';
import { FeedbackButton } from '@/components/FeedbackButton';
import './globals.css';
import React from 'react';
import { Analytics } from '@vercel/analytics/react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Meme News Factory - Create and Share News Memes',
  description:
    'Create, customize, and share hilarious memes from news headlines with our easy-to-use meme generator',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', type: 'image/png' },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-b from-indigo-100 via-pink-50 to-purple-100 dark:from-gray-950 dark:via-indigo-950/30 dark:to-purple-950/50`}
      >
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 relative">
            <div className="absolute inset-0 bg-[url('/background-pattern.svg')] opacity-10 pointer-events-none"></div>
            {children}
          </main>
          <footer className="w-full py-4 px-6 mt-auto text-center text-gray-600 dark:text-gray-400 border-t border-gray-300/50">
            <div className="flex flex-col items-center gap-1">
              <p>© {new Date().getFullYear()} Meme News Factory. All rights reserved.</p>
              <p className="flex items-center gap-1 text-pink-600 dark:text-pink-400 font-medium text-sm">
                Made with <span className="text-red-500 animate-pulse">❤️</span> by meme lovers
              </p>
            </div>
          </footer>
          <FeedbackButton />
          <Analytics />
        </div>
      </body>
    </html>
  );
}
