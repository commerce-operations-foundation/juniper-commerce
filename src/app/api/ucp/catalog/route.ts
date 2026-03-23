import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getProductVariants, getInventoryItems } from '@/lib/onx-client';

export async function GET(req: NextRequest) {
  return handleCatalog(req);
}

export async function POST(req: NextRequest) {
  return handleCatalog(req);
}

async function handleCatalog(req: NextRequest) {
  try {
    let params: Record<string, string> = {};
    if (req.method === 'GET') {
      req.nextUrl.searchParams.forEach((v, k) => { params[k] = v; });
    } else {
      params = await req.json().catch(() => ({}));
    }

    const limit = Math.min(parseInt(params.limit ?? '20'), 100);
    const offset = parseInt(params.offset ?? '0');

    const { items: products } = await getProducts({ status: 'active', limit: 100 });

    // Filter by query or category
    let filtered = products;
    if (params.query) {
      const q = params.query.toLowerCase();
      filtered = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (params.category) {
      filtered = filtered.filter(p =>
        p.categories?.some(c => c.toLowerCase().includes(params.category.toLowerCase()))
      );
    }

    // Build UCP response with variant and inventory data
    const ucpItems = await Promise.all(
      filtered.slice(offset, offset + limit).map(async (product) => {
        const { items: variants } = await getProductVariants({ productId: product.id });
        const firstVariant = variants[0];
        const basePrice = firstVariant?.price ?? 0;

        // Get inventory
        const ucpVariants = await Promise.all(variants.map(async (v) => {
          const { items: inv } = await getInventoryItems({ sku: v.sku });
          const totalAvailable = inv.reduce((s, i) => s + i.available, 0);
          return {
            sku: v.sku,
            title: v.title ?? v.sku,
            price: v.price ?? 0,
            available: totalAvailable > 0,
            options: Object.fromEntries((v.selectedOptions ?? []).map(o => [o.name, o.value])),
          };
        }));

        const totalAvailable = ucpVariants.some(v => v.available);

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: basePrice,
          currency: firstVariant?.currency ?? 'USD',
          category: product.categories?.[0],
          imageUrl: product.imageURLs?.[0],
          available: totalAvailable,
          variants: ucpVariants,
          tags: product.tags,
        };
      })
    );

    return NextResponse.json({
      items: ucpItems,
      total: filtered.length,
      offset,
      limit,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Catalog query failed', details: String(err) }, { status: 500 });
  }
}
