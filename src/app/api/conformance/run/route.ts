import { NextRequest, NextResponse } from 'next/server';
import { runConformanceTests } from '@/lib/conformance/runner';

export async function POST(req: NextRequest) {
  try {
    const { endpoint } = await req.json();
    if (!endpoint) {
      return NextResponse.json({ error: 'endpoint is required' }, { status: 400 });
    }
    const report = await runConformanceTests(endpoint);
    return NextResponse.json(report);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
