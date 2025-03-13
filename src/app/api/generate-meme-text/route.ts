import { NextResponse } from 'next/server';

/**
 * Generates dummy meme text for different text positions
 * @returns Response with generated text for top and bottom positions
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

  // Additional texts for templates with more than 2 text areas
  const additionalTexts = ['Plot twist:', 'Meanwhile:', 'Also me:', 'The client:', 'The designer:'];

  // Randomly select text for top and bottom
  const topText = topTexts[Math.floor(Math.random() * topTexts.length)];
  const bottomText = bottomTexts[Math.floor(Math.random() * bottomTexts.length)];

  // Return basic text elements that can be used in different ways by the client
  return NextResponse.json({
    topText,
    bottomText,
    additionalTexts: [
      additionalTexts[Math.floor(Math.random() * additionalTexts.length)],
      additionalTexts[Math.floor(Math.random() * additionalTexts.length)],
    ],
  });
}
