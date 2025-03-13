import { NextResponse } from 'next/server';

/**
 * Generates dummy meme text for top and bottom of the meme
 * @returns Response with generated text
 */
export async function GET() {
  // This is a dummy implementation that returns static text
  // In a real implementation, this would call an AI service
  const topTexts = [
    'When you finally fix that bug',
    'That moment when',
    'Nobody:',
    'Me explaining to my boss',
    'When the code works on first try',
  ];

  const bottomTexts = [
    'But create ten more',
    'And it actually works',
    'Absolutely nobody:',
    'Why we need more time',
    "But you don't know why",
  ];

  // Randomly select text for top and bottom
  const topText = topTexts[Math.floor(Math.random() * topTexts.length)];
  const bottomText = bottomTexts[Math.floor(Math.random() * bottomTexts.length)];

  return NextResponse.json({ topText, bottomText });
}
