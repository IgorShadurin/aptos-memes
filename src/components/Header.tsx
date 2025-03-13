'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

/**
 * Header component for site-wide navigation
 * Appears on all pages and is responsive for mobile devices
 * Enhanced for better visibility and aesthetics
 */
export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full shadow-md bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white relative">
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-yellow-300 via-white to-yellow-300 shimmer-border"></div>
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative transition-transform duration-300 group-hover:scale-110">
              <Image
                src="/logo.png"
                alt="Meme My News Logo"
                width={32}
                height={32}
                priority
                className="drop-shadow-md"
              />
            </div>
            <span className="font-extrabold text-lg text-white hidden sm:inline-block drop-shadow-sm">
              Meme My News
            </span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex md:items-center md:gap-4">
          <Link href="/meme-creator">
            <Button
              size="sm"
              className="bg-white text-purple-700 hover:bg-yellow-300 hover:text-purple-800 font-bold transition-all duration-300 shadow-md rounded-full px-4"
            >
              🎨 Create Meme
            </Button>
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden -m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white hover:bg-white/20"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-indigo-700 backdrop-blur-sm">
          <div className="space-y-1 px-4 py-3 border-t border-indigo-500">
            <div className="px-3">
              <Link href="/meme-creator" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-white text-purple-700 hover:bg-yellow-300 hover:text-purple-800 font-bold rounded-full">
                  🎨 Create Meme
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
