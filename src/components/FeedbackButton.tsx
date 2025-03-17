'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FaCommentDots } from 'react-icons/fa';

/**
 * FeedbackButton component that displays a circular feedback button in the bottom right corner
 * and opens a modal when clicked for users to submit feedback or questions
 * @returns React component
 */
export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handles the feedback form submission
   * @param e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/submit-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          feedback,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        // Reset form after modal closes
        setTimeout(() => {
          setEmail('');
          setFeedback('');
          setSubmitted(false);
        }, 300);
      }, 1500);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg text-xl z-50 bg-pink-600 hover:bg-pink-700 text-white p-0 flex items-center justify-center"
        aria-label="Provide feedback"
      >
        <FaCommentDots size={24} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send us your feedback</DialogTitle>
            <DialogDescription>
              We&apos;d love to hear what you think about our site or answer any questions you might
              have!
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="text-green-500 mb-2 text-5xl">✓</div>
              <h3 className="text-xl font-medium">Thank you for your feedback!</h3>
              <p className="text-gray-500 mt-1">
                We appreciate your thoughts and will review them soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {error && (
                  <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md">
                    {error}
                  </div>
                )}
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email (optional)
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="feedback" className="text-sm font-medium">
                    Your feedback or question <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="feedback"
                    placeholder="Tell us what you think or ask a question..."
                    value={feedback}
                    onChange={(e) => {
                      // Limit to 2000 characters
                      if (e.target.value.length <= 2000) {
                        setFeedback(e.target.value);
                      }
                    }}
                    required
                    className="col-span-3 min-h-[120px]"
                  />
                  <div className="text-xs text-right text-gray-500">
                    {feedback.length}/2000 characters
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!feedback.trim() || isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
