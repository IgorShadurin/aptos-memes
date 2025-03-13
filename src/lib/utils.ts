import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names with tailwind-merge
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Decodes a Base64 encoded string
 * @param base64 - Base64 encoded string
 * @returns Decoded string or null if invalid Base64
 */
export function decodeBase64(base64: string): string | null {
  try {
    return atob(base64);
  } catch (error) {
    console.error('Invalid Base64 string:', error);
    return null;
  }
}

/**
 * Validates if a string is a valid URL
 * @param url - URL string to validate
 * @returns Boolean indicating if the URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}
