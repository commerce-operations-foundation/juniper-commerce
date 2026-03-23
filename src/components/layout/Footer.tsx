import Link from 'next/link';
import { Mountain } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 text-white mb-3">
              <Mountain className="w-5 h-5 text-teal-400" />
              <span className="font-bold">Juniper Commerce</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Reference implementation of the onX standard. Built by the Commerce Operations Foundation.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Store</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Cart</Link></li>
              <li><Link href="/orders" className="hover:text-white transition-colors">Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin</Link></li>
              <li><Link href="/conformance" className="hover:text-white transition-colors">Conformance</Link></li>
              <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Developers</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://github.com/commerce-operations-foundation/mcp-reference-server" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
              <li><a href="https://commerceopsfoundation.org" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">COF Website</a></li>
              <li><a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">MCP Protocol</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs">&copy; {new Date().getFullYear()} Juniper Commerce &middot; Built on the onX Standard</p>
          <p className="text-xs">Commerce Operations Foundation &middot; MIT License</p>
        </div>
      </div>
    </footer>
  );
}
