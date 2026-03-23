import { NextRequest, NextResponse } from 'next/server';
import { getCustomers } from '@/lib/onx-client';

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const { items, total } = await getCustomers({
      email: params.get('email') ?? undefined,
      type: params.get('type') ?? undefined,
    });
    return NextResponse.json({ items, total });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
