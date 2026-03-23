import { NextRequest, NextResponse } from 'next/server';
import { getInventoryItems } from '@/lib/onx-client';

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const { items, total } = await getInventoryItems({
      sku: params.get('sku') ?? undefined,
      locationId: params.get('locationId') ?? undefined,
    });
    return NextResponse.json({ items, total });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
