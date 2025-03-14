import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service';
import { createErrorResponse, handleApiError } from '@/lib/api-utils';

/**
 * Handles POST requests for generating meme text based on news and template information
 * @param request - The incoming request containing news and meme template info
 * @returns Response with AI-generated text for different text areas
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body from the request
    const body = await request.json();

    // Extract template information and news from the request
    const { templateName, newsText, examples, maxCharacters } = body;

    // Ensure we have the required fields
    if (!templateName || !newsText) {
      return createErrorResponse(
        'Missing required fields',
        'templateName and newsText are required',
        400
      );
    }

    // Initialize AI service with API key from environment variable
    const openAIApiKey = process.env.OPENAI_API_KEY;

    if (!openAIApiKey) {
      return createErrorResponse(
        'OpenAI API key is not configured',
        'Please add OPENAI_API_KEY to your environment variables',
        500
      );
    }

    aiService.setApiKey(openAIApiKey);
    // Generate meme text using AI
    const generatedText = await aiService.generateMemeText(
      newsText,
      templateName,
      Number(maxCharacters),
      'Follow the style of these amazing examples: ' + JSON.stringify(examples)
    );

    // If generation failed, return error
    if (!generatedText.success) {
      return createErrorResponse('Failed to generate meme text', generatedText.error, 500);
    }

    console.log('generatedText', generatedText);

    // Return the generated text
    return NextResponse.json({
      topText: generatedText.topText,
      bottomText: generatedText.bottomText,
      additionalTexts: generatedText.additionalTexts,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
