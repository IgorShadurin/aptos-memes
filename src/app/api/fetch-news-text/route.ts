import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles POST requests to fetch news text from a provided URL
 * @param request - The incoming request containing the URL to fetch news from
 * @returns Response with generated news text
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body from the request
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    console.log(`Fetching news from URL: ${url}`);

    // Fetch content from the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Meme-My-News/1.0 News Content Extractor',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
    }

    // Get the text content from the response
    const htmlContent = await response.text();

    // Extract text content and remove HTML tags
    const textContent = stripHtmlTags(htmlContent);

    // Trim and clean up the text
    const cleanText = textContent
      .replace(/\s+/g, ' ') // Replace multiple whitespaces with a single space
      .trim();

    return NextResponse.json({ newsText: cleanText });
  } catch (error) {
    console.error('Error fetching news text:', error);
    return NextResponse.json({ error: 'Failed to fetch news text' }, { status: 400 });
  }
}

/**
 * Strips HTML tags from the provided HTML content
 * @param html - The HTML content to strip tags from
 * @returns Clean text without HTML tags
 */
function stripHtmlTags(html: string): string {
  // Create a fallback implementation that works in Node.js environment
  // This is a simple regex-based approach to strip HTML tags
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove style tags
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'"); // Replace &#39; with '
}
