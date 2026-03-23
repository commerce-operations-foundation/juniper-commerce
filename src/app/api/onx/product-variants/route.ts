import { NextRequest, NextResponse } from 'next/server';
import { getProductVariants } from '@/lib/onx-client';

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const { items, total } = await getProductVariants({
      productId: params.get('productId') ?? undefined,
      sku: params.get('sku') ?? undefined,
    });
    return NextResponse.json({ items, total });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
