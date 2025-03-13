import { Suspense } from 'react';
import MemeCreator from '@/components/MemeCreator';

/**
 * Loading component for Suspense
 */
function MemeCreatorLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-xl">Loading meme creator...</div>
    </div>
  );
}

/**
 * Meme Creator page component
 */
export default function MemeCreatorPage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<MemeCreatorLoading />}>
        <MemeCreator />
      </Suspense>
    </main>
  );
}
