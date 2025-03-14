import Link from 'next/link';
import { Button } from '@/components/ui/button';
import MemeGrid from '@/components/MemeGrid';
import { HiSparkles } from 'react-icons/hi';
import { HiCurrencyDollar, HiNewspaper, HiQrcode } from 'react-icons/hi';

export default function Home() {
  return (
    <>
      {/* Hero Section with Animation */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600/90 via-pink-600/90 to-orange-600/90 text-white">
        <div className="absolute inset-0 bg-grid-white/10 bg-grid-8 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.05),rgba(255,255,255,0.4))]"></div>
        <div className="container mx-auto flex flex-col items-center justify-center px-6 sm:px-4 py-16 text-center relative z-10">
          <div className="animate-bounce-slow mb-6">
            <HiSparkles className="h-12 w-12 text-yellow-300" />
          </div>
          <h1 className="font-extrabold tracking-tight text-4xl sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 animate-gradient-x drop-shadow-[0_3px_3px_rgba(0,0,0,0.8)]">
            Aptos Meme Factory
          </h1>
          <p className="mt-6 max-w-2xl text-xl md:text-2xl font-medium text-white drop-shadow-md">
            Where blockchain meets meme-magic! 🚀
          </p>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-4xl">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 flex flex-col items-center hover:bg-white/20 transition-all transform hover:scale-105">
              <HiNewspaper className="h-10 w-10 text-yellow-300 mb-3" />
              <h3 className="font-bold text-xl">Memeify the News</h3>
              <p className="text-sm mt-2">
                Turn boring headlines into LOL-worthy memes! Why read news when you can laugh at it?
                😂
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 flex flex-col items-center hover:bg-white/20 transition-all transform hover:scale-105">
              <HiCurrencyDollar className="h-10 w-10 text-yellow-300 mb-3" />
              <h3 className="font-bold text-xl">NFTify & Earn</h3>
              <p className="text-sm mt-2">
                Your meme genius → Aptos NFTs → Actual money! Who said being funny doesn&apos;t pay?
                💰
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 flex flex-col items-center hover:bg-white/20 transition-all transform hover:scale-105">
              <HiQrcode className="h-10 w-10 text-yellow-300 mb-3" />
              <h3 className="font-bold text-xl">Sponsor QR Cha-Ching!</h3>
              <p className="text-sm mt-2">
                Slap sponsor QR codes on your viral memes and watch the coins roll in! Ka-ching! 🤑
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link href="/meme-creator" passHref>
              <Button
                size="lg"
                className="bg-white text-purple-700 hover:bg-yellow-300 hover:text-purple-800 font-bold transition-all duration-300 shadow-md rounded-full px-8 py-4 text-lg"
              >
                🎨 Create Meme Magic Now!
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Popular Meme Templates Section */}
      <div className="w-full py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/50 to-blue-100/50 dark:from-indigo-900/20 dark:to-blue-900/20 skew-y-1"></div>
        <div className="container mx-auto px-6 sm:px-4 relative z-10">
          <h2 className="mb-10 text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-700">
            Popular Memes
          </h2>
          <MemeGrid />
        </div>
      </div>
    </>
  );
}
