import { NextRequest, NextResponse } from 'next/server';

const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_CHAT_REQUESTS = parseInt(process.env.MAX_MESSAGES_PER_SESSION ?? '20', 10);

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
}, 60_000);

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown';
}

function checkRateLimit(key: string, limit: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: limit - 1 };
  }

  entry.count++;
  if (entry.count > limit) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: limit - entry.count };
}

export function middleware(req: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  if (req.nextUrl.pathname === '/api/playground/chat' && req.method === 'POST') {
    const isDemo = (process.env.APP_MODE ?? 'demo') === 'demo';
    if (isDemo) {
      const ip = getClientIp(req);
      const { allowed, remaining } = checkRateLimit(`chat:${ip}`, MAX_CHAT_REQUESTS);

      response.headers.set('X-RateLimit-Limit', String(MAX_CHAT_REQUESTS));
      response.headers.set('X-RateLimit-Remaining', String(remaining));

      if (!allowed) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Try again in a minute or set APP_MODE=full to remove limits.' },
          { status: 429, headers: { 'X-RateLimit-Limit': String(MAX_CHAT_REQUESTS), 'X-RateLimit-Remaining': '0' } }
        );
      }
    }
  }

  if (req.nextUrl.pathname === '/settings') {
    const isDemo = (process.env.APP_MODE ?? 'demo') === 'demo';
    if (isDemo) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/settings',
  ],
};
