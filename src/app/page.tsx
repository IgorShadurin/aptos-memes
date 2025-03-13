import Link from 'next/link';
import { Button } from '@/components/ui/button';
import MemeGrid from '@/components/MemeGrid';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Welcome to Meme My News
        </h1>
        <p className="mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-400">
          Turn the latest headlines into hilarious memes with our easy-to-use meme generator
        </p>
        <div className="mt-8">
          <Link href="/meme-creator" passHref>
            <Button size="lg">Create Memes</Button>
          </Link>
        </div>
      </div>

      {/* Popular Meme Templates Section */}
      <div className="w-full max-w-6xl px-4 py-8 mx-auto">
        <h2 className="mb-6 text-2xl font-bold">Popular Meme Templates</h2>
        <MemeGrid />
      </div>
    </>
  );
}
