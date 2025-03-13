'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { decodeBase64, isValidUrl } from '@/lib/utils';

/**
 * SponsoredMemePage component displays a meme with a sponsored message and source link
 * @returns JSX element with sponsored meme information
 */
export default function SponsoredMemePage() {
  const searchParams = useSearchParams();
  const [decodedUrl, setDecodedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get the Base64 encoded URL from the 'url' query parameter
    const encodedUrl = searchParams.get('url');

    if (!encodedUrl) {
      setError('No URL parameter provided');
      return;
    }

    // Decode the Base64 URL
    const decoded = decodeBase64(encodedUrl);

    if (!decoded) {
      setError('Invalid Base64 encoded URL');
      return;
    }

    // Validate the decoded URL
    if (!isValidUrl(decoded)) {
      setError('Invalid URL format after decoding');
      return;
    }

    setDecodedUrl(decoded);
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-slate-900 dark:text-white">
          This meme is sponsored by the Crypto Foundation
        </h1>

        {error ? (
          <div className="text-red-500 text-center my-4 p-4 bg-red-50 dark:bg-red-900/20 rounded">
            {error}
          </div>
        ) : (
          <>
            <p className="text-lg md:text-xl text-center mb-4 text-slate-600 dark:text-slate-300">
              The original source is:
            </p>

            {decodedUrl && (
              <div className="flex justify-center">
                <Link
                  href={decodedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline break-all text-center"
                >
                  {decodedUrl}
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
