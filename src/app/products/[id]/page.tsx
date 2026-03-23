import { notFound } from 'next/navigation';
import { getProducts, getProductVariants, getInventoryItems } from '@/lib/onx-client';
import { ProductDetail } from '@/components/storefront/ProductDetail';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const { items: products } = await getProducts();
  const product = products.find(p => p.id === id);
  if (!product) notFound();

  const { items: variants } = await getProductVariants({ productId: product.id });

  const allSkus = variants.map(v => v.sku);
  const inventoryPromises = allSkus.map(sku => getInventoryItems({ sku }));
  const inventoryResults = await Promise.all(inventoryPromises);
  const inventory = inventoryResults.flatMap(r => r.items);

  return <ProductDetail product={product} variants={variants} inventory={inventory} />;
}
