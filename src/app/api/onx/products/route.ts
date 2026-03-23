import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getProductVariants } from '@/lib/onx-client';

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const includeVariants = params.get('includeVariants') === 'true';
    const { items, total } = await getProducts({
      status: params.get('status') ?? undefined,
      limit: parseInt(params.get('limit') ?? '50'),
      offset: parseInt(params.get('offset') ?? '0'),
    });

    if (includeVariants) {
      const itemsWithVariants = await Promise.all(items.map(async p => {
        const { items: variants } = await getProductVariants({ productId: p.id });
        return { ...p, variants };
      }));
      return NextResponse.json({ items: itemsWithVariants, total });
    }

    return NextResponse.json({ items, total });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
