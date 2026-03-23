import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'juniper-commerce',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
}
