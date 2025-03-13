import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles POST requests for generating meme text based on template information
 * @param request - The incoming request containing meme template info
 * @returns Response with generated text for different text areas
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body from the request
    const body = await request.json();

    // Extract template information from the request
    // Note: We're not using user-entered phrases, just template info
    const { templateId, templateName } = body;

    console.log(`Generating text for template: ${templateName} (${templateId})`);

    // This is a dummy implementation that returns static text
    // In a real implementation, this would use the template info to call an AI service
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
    const additionalTexts = [
      'Plot twist:',
      'Meanwhile:',
      'Also me:',
      'The client:',
      'The designer:',
    ];

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
  } catch (error) {
    console.error('Error processing meme text generation:', error);
    return NextResponse.json({ error: 'Failed to generate meme text' }, { status: 400 });
  }
}
