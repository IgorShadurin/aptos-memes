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

    // In a real implementation, we would fetch real content from the URL
    // For now, we'll generate dummy news text based on the URL domain

    // Extract domain from URL
    let domain = '';
    try {
      const urlObj = new URL(url);
      domain = urlObj.hostname.replace('www.', '');
    } catch (error) {
      // If URL parsing fails, use the input as is
      domain = url.includes('/') ? url.split('/')[2] : url;
    }

    // Generate dummy news text based on domain
    const newsTexts = {
      'aptos.dev':
        'Breaking news: Aptos blockchain reaches 1 million users this month, setting a new record for the fastest growing Layer 1 blockchain. Development activity surges as the ecosystem continues to attract new talent from across the Web3 space.',
      'aptoslabs.com':
        'Aptos Labs announces a $200 million ecosystem fund to support developers building decentralized applications on the Aptos blockchain. The fund will focus on DeFi, NFT, and gaming projects that leverage the Move programming language.',
      'coindesk.com':
        'Crypto market sees record-breaking volume as Bitcoin surges past $80,000 for the first time. Analysts attribute the rally to increased institutional adoption and reduced selling pressure following the halving event.',
      'cointelegraph.com':
        'New regulatory framework for cryptocurrencies announced by global financial authorities. The proposed guidelines aim to protect consumers while fostering innovation in the blockchain industry.',
      default: `Latest news from ${domain}: A groundbreaking development has been announced today that could transform the industry. Experts are calling it a "game-changer" as adoption rates soar and new use cases emerge daily.`,
    };

    // Return text based on domain or default text
    const newsText = newsTexts[domain as keyof typeof newsTexts] || newsTexts.default;

    return NextResponse.json({ newsText });
  } catch (error) {
    console.error('Error fetching news text:', error);
    return NextResponse.json({ error: 'Failed to fetch news text' }, { status: 400 });
  }
}
