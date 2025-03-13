'use client';

import React, { useEffect } from 'react';

/**
 * Props for the Alert component
 */
interface AlertProps {
  /** Title of the alert */
  title: string;
  /** Message content for the alert */
  message: string;
  /** Whether the alert is visible */
  show: boolean;
  /** Function to call when the alert should be closed */
  onClose: () => void;
  /** Auto-close duration in milliseconds. Set to 0 to disable auto-close. */
  autoCloseDuration?: number;
}

/**
 * A reusable alert component that slides in from the bottom of the screen
 * Can be automatically closed after a specified duration
 */
export function Alert({ title, message, show, onClose, autoCloseDuration = 3000 }: AlertProps) {
  // Auto-close the alert after the specified duration
  useEffect(() => {
    if (show && autoCloseDuration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [show, autoCloseDuration, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-300 md:max-w-md w-[90%]">
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-gray-300">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="p-1 hover:bg-gray-700 rounded-full transition-colors"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}
