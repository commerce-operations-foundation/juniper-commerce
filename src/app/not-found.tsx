import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h2>
      <p className="text-gray-500 mb-8">The page you are looking for does not exist.</p>
      <div className="flex gap-3 justify-center">
        <Link href="/" className="inline-flex items-center gap-2 bg-gray-900 text-white hover:bg-gray-800 font-semibold px-6 py-3 rounded-lg transition-colors">
          Go Home
        </Link>
        <Link href="/products" className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 hover:border-gray-400 font-semibold px-6 py-3 rounded-lg transition-colors">
          Browse Products
        </Link>
      </div>
    </div>
  );
}
