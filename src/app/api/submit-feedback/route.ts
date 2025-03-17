import { NextResponse } from 'next/server';

/**
 * Maximum allowed feedback length
 */
const MAX_FEEDBACK_LENGTH = 2000;

/**
 * Get the client IP address from request headers
 * @param request - The incoming request object
 * @returns Client IP address or 'unknown' if not found
 */
function getClientIp(request: Request): string {
  // Get IP from various headers (proxies often set x-forwarded-for)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, the first one is the client
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * API route to send feedback to Telegram
 * @param request - The incoming request object
 * @returns Response with success or error message
 */
export async function POST(request: Request) {
  try {
    // Get the Telegram token and chat ID from environment variables
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_TARGET_USER_ID;

    // Check if Telegram configuration is available
    if (!telegramToken || !telegramChatId) {
      console.error('Telegram configuration is missing');
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    // Get client IP address
    const clientIp = getClientIp(request);

    // Parse the request body
    const body = await request.json();
    const { email, feedback } = body;

    // Validate the feedback text
    if (!feedback || typeof feedback !== 'string') {
      return NextResponse.json({ error: 'Feedback text is required' }, { status: 400 });
    }

    // Check feedback length
    if (feedback.length > MAX_FEEDBACK_LENGTH) {
      return NextResponse.json(
        { error: `Feedback text must be ${MAX_FEEDBACK_LENGTH} characters or less` },
        { status: 400 }
      );
    }

    // Prepare the message to send to Telegram
    // Using markdown to format the message with bold project name
    let message = `*[Memezzz.com]*\n\n${feedback}`;

    // Add email if provided
    if (email) {
      message += `\n\nFrom: ${email}`;
    }

    // Add IP address
    message += `\nIP Address: ${clientIp}`;

    // Send message to Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${telegramToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    );

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json();
      console.error('Telegram API error:', errorData);
      return NextResponse.json({ error: 'Failed to send feedback' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending feedback to Telegram:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
