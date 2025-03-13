import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import MemeGrid from '@/components/MemeGrid';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="w-[180px] flex justify-center">
          <Image src="/logo.png" alt="Meme My News Logo" width={180} height={38} priority />
        </div>
        <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome to Meme My News
        </h2>
        <p className="mt-3 text-xl text-gray-600 dark:text-gray-400">
          Turn the latest headlines into hilarious memes with our easy-to-use meme generator
        </p>
        <div className="mt-8">
          <Link href="/meme-creator" passHref>
            <Button size="lg">Create Memes</Button>
          </Link>
        </div>
      </div>

      {/* Popular Meme Templates Section */}
      <div className="flex-1 w-full max-w-6xl px-4 py-8 mx-auto">
        <h3 className="mb-6 text-2xl font-bold">Popular Meme Templates</h3>
        <MemeGrid />
      </div>

      {/* Footer */}
      <footer className="w-full p-4 text-center text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} Meme My News. All rights reserved.
      </footer>
    </div>
  );
}
