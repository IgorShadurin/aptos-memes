import OpenAI from 'openai';

/**
 * Configuration interface for AI services
 */
interface AiServiceConfig {
  /**
   * OpenAI API key
   */
  apiKey: string;

  /**
   * Model to use for completion (defaults to gpt-4o-mini)
   */
  model?: string;

  /**
   * Temperature for completion (default: 0.7)
   */
  temperature?: number;

  /**
   * Maximum number of tokens in the completion response (default: 1000)
   */
  maxTokens?: number;
}

/**
 * Response interface for meme generation
 */
export interface MemeGenerationResponse {
  /**
   * Top text of the meme
   */
  topText: string;

  /**
   * Bottom text of the meme
   */
  bottomText: string;

  /**
   * Additional texts that can be used for more complex meme templates
   */
  additionalTexts: string[];

  /**
   * Whether the response generation was successful
   */
  success: boolean;

  /**
   * Error message if generation failed
   */
  error?: string;
}

/**
 * Service class for interacting with OpenAI's API to generate meme text
 */
export class AiService {
  private openai!: OpenAI;
  private model: string = 'gpt-4o-mini';
  private temperature: number = 0.7;
  private maxTokens: number = 1000;
  private initialized: boolean;

  /**
   * Creates a new instance of the AI service
   * @param config - Configuration for the service
   */
  constructor(config?: AiServiceConfig) {
    this.initialized = false;

    if (!config?.apiKey) {
      console.warn(
        'No API key provided. AI service will not be initialized until setApiKey is called.'
      );
      return;
    }

    this.initializeService(config);
  }

  /**
   * Initialize the OpenAI service with the provided configuration
   * @param config - Configuration for the service
   */
  private initializeService(config: AiServiceConfig): void {
    if (!config.apiKey) {
      throw new Error('API key is required for AI service');
    }

    this.openai = new OpenAI({
      apiKey: config.apiKey,
    });

    this.model = config.model || 'gpt-4o-mini';
    this.temperature = config.temperature || 0.7;
    this.maxTokens = config.maxTokens || 1000;
    this.initialized = true;
  }

  /**
   * Set the API key for the service
   * @param apiKey - OpenAI API key
   */
  setApiKey(apiKey: string): void {
    if (!apiKey) {
      throw new Error('API key cannot be empty');
    }

    this.initializeService({ apiKey });
  }

  /**
   * Generate meme text based on news content and template context
   * @param newsText - The news article text or headline
   * @param templateName - Name of the meme template being used
   * @param maxCharacters - Maximum number of characters for each text (default: 20)
   * @param templateContext - Optional additional context about the template
   * @returns Generated meme text content
   */
  async generateMemeText(
    newsText: string,
    templateName: string,
    maxCharacters = 20,
    templateContext?: string
  ): Promise<MemeGenerationResponse> {
    // Default error response
    const errorResponse: MemeGenerationResponse = {
      topText: '',
      bottomText: '',
      additionalTexts: [],
      success: false,
      error: 'Failed to generate meme text',
    };

    // Check if service is initialized
    if (!this.initialized) {
      errorResponse.error = 'AI service not initialized. API key may be missing.';
      return errorResponse;
    }

    try {
      // Create system prompt to guide the AI
      const systemPrompt = `You are an expert fun meme creator. 
Your task is to create funny and witty text for a meme based on a news headline or article.
The meme will use the "${templateName}" ${templateContext}.

You should generate:
1. A top text (caption that appears at the top of the meme)
2. A bottom text (caption that appears at the bottom of the meme)
3. Two additional text pieces that could be used in more complex meme templates

Guidelines:
- Be clever, witty, and humorous
- CRITICAL: ALL text must be MAXIMUM ${maxCharacters} CHARACTERS for each phrase. This is a hard limit.
- Make every character count with abbreviations if needed
- Avoid offensive, inappropriate, or political content
- Reference internet culture, tech trends, and meme formats when relevant
- The text should clearly relate to the news content provided
- Focus on making the meme both funny and relevant to the news
- Don't use emojis or special characters

Format your response as a JSON object with these exact keys: topText, bottomText, additionalTexts (an array of 2 strings).
Do not include any explanation or additional content outside the JSON object.

REMINDER: Each text string MUST BE ${maxCharacters} CHARACTERS OR LESS. Longer responses will be rejected.`;

      // User prompt is simply the news text
      const userPrompt = `Create a meme based on this news: "${newsText}"`;

      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        response_format: { type: 'json_object' }, // Ensure we get a JSON response
      });

      // Extract the content from the response
      const content = completion.choices[0]?.message?.content;

      if (!content) {
        return errorResponse;
      }

      try {
        // Parse the JSON response
        const parsed = JSON.parse(content) as MemeGenerationResponse;

        // Ensure we have the required fields
        if (!parsed.topText || !parsed.bottomText || !Array.isArray(parsed.additionalTexts)) {
          errorResponse.error = 'Invalid response format from AI service';
          return errorResponse;
        }

        // Enforce the character limit using the maxCharacters parameter
        if (
          parsed.topText.length > maxCharacters ||
          parsed.bottomText.length > maxCharacters ||
          parsed.additionalTexts.some((text) => text.length > maxCharacters)
        ) {
          // Truncate all texts to the maximum length specified by maxCharacters
          return {
            topText: parsed.topText.substring(0, maxCharacters),
            bottomText: parsed.bottomText.substring(0, maxCharacters),
            additionalTexts: parsed.additionalTexts.map((text) => text.substring(0, maxCharacters)),
            success: true,
          };
        }

        // Return the successful response
        return {
          ...parsed,
          success: true,
        };
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        errorResponse.error = 'Failed to parse AI response';
        return errorResponse;
      }
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      return errorResponse;
    }
  }
}

// Create a singleton instance of the service
export const aiService = new AiService();
