'use client';
/* eslint-disable no-unused-vars */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
    'Breaking news: Aptos blockchain reaches 1 million users this month, setting a new record for the fastest growing Layer 1 blockchain. Development activity surges as the ecosystem continues to attract new talent from across the Web3 space.'
  );

  /**
   * Handle the generate button click
   */
  const handleGenerate = async () => {
    await onGenerate(newsText);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Generate Meme from News</DialogTitle>
          <DialogDescription>
            Enter or edit news text below to generate a creative meme.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
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
