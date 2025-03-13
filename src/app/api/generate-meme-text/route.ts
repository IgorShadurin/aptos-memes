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
    const { templateId, templateName, newsText } = body;

    console.log(`Generating text for template: ${templateName} (${templateId})`);

    let topText = '';
    let bottomText = '';
    let additionalTextArray: string[] = [];

    // If news text is provided, generate text based on it
    if (newsText) {
      console.log('Generating from news text:', newsText);

      // Simple algorithm to generate text from news
      // In a real implementation, this would use the news text to call an AI service
      const words = newsText.split(/\s+/);

      // For demo purposes, create somewhat humorous meme text from the news
      if (words.length >= 3) {
        // Take first part for top text
        topText = `When they say "${words.slice(0, 3).join(' ')}..."`;

        // Find interesting words for bottom text
        const interestingWords = words.filter(
          (word: string) =>
            word.length > 5 || /\d+/.test(word) || word.toLowerCase().includes('aptos')
        );

        if (interestingWords.length > 0) {
          const randomWord = interestingWords[Math.floor(Math.random() * interestingWords.length)];
          bottomText = `But nobody understands ${randomWord}`;
        } else {
          bottomText = 'But nobody understands what it means';
        }

        // Additional text if needed
        additionalTextArray = [
          'Tech people be like:',
          `Still waiting for ${words[words.length - 1]}`,
        ];
      } else {
        // Fallback for very short news text
        topText = 'Breaking News';
        bottomText = newsText;
      }
    } else {
      // Original random text generation if no news text provided
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
      topText = topTexts[Math.floor(Math.random() * topTexts.length)];
      bottomText = bottomTexts[Math.floor(Math.random() * bottomTexts.length)];

      additionalTextArray = [
        additionalTexts[Math.floor(Math.random() * additionalTexts.length)],
        additionalTexts[Math.floor(Math.random() * additionalTexts.length)],
      ];
    }

    // Return basic text elements that can be used in different ways by the client
    return NextResponse.json({
      topText,
      bottomText,
      additionalTexts: additionalTextArray,
    });
  } catch (error) {
    console.error('Error processing meme text generation:', error);
    return NextResponse.json({ error: 'Failed to generate meme text' }, { status: 400 });
  }
}
