'use client';
/* eslint-disable no-unused-vars */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

/**
 * Props for the NewsModal component
 */
interface NewsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (newsText: string) => Promise<void>;
  isLoading: boolean;
}

/**
 * Modal component for generating memes from news text
 */
export function NewsModal({ open, onOpenChange, onGenerate, isLoading }: NewsModalProps) {
  const [newsText, setNewsText] = useState<string>(
    'When your code finally works but you have no idea why 🤔'
  );
  const [newsUrl, setNewsUrl] = useState<string>('');
  const [fetchLoading, setFetchLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /**
   * Handle the generate button click
   */
  const handleGenerate = async () => {
    await onGenerate(newsText);
    onOpenChange(false);
  };

  /**
   * Fetch news text from the provided URL
   */
  const fetchNewsText = async () => {
    if (!newsUrl.trim()) {
      setFetchError('Please enter a URL');
      return;
    }

    setFetchLoading(true);
    setFetchError(null);

    try {
      const response = await fetch('/api/fetch-news-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: newsUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch news text');
      }

      const data = await response.json();

      if (data.newsText) {
        setNewsText(data.newsText);
      } else if (data.error) {
        setFetchError(data.error);
      }
    } catch (error) {
      setFetchError('Error fetching news text. Please try again.');
      console.error('Error fetching news text:', error);
    } finally {
      setFetchLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Generate Meme from News</DialogTitle>
          <DialogDescription>
            Enter a URL to fetch news text or edit the text directly below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Input
              value={newsUrl}
              onChange={(e) => setNewsUrl(e.target.value)}
              placeholder="Enter news URL (e.g., aptos.dev, coindesk.com)"
              className="flex-1"
              disabled={fetchLoading}
            />
            <Button onClick={fetchNewsText} disabled={fetchLoading || !newsUrl.trim()}>
              {fetchLoading ? 'Fetching...' : 'Fetch'}
            </Button>
          </div>

          {fetchError && <p className="text-sm text-red-500">{fetchError}</p>}

          <div className="text-center text-sm font-medium text-indigo-500">
            ✨ OR type whatever you want to see on your meme! 🤪
          </div>

          <Textarea
            value={newsText}
            onChange={(e) => setNewsText(e.target.value)}
            placeholder="Enter news text here..."
            className="min-h-[150px]"
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isLoading || !newsText.trim()}>
            {isLoading ? 'Generating...' : 'Generate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
