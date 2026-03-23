'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export default function ApiDocsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js';
    script.onload = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css';
      document.head.appendChild(link);

      // @ts-expect-error global swagger
      window.SwaggerUIBundle({
        url: '/openapi.yaml',
        dom_id: '#swagger-container',
        presets: [
          // @ts-expect-error global swagger
          window.SwaggerUIBundle.presets.apis,
        ],
        layout: 'BaseLayout',
        deepLinking: true,
        defaultModelsExpandDepth: 2,
      });
      setLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
            <p className="text-sm text-gray-500">onX REST API — OpenAPI 3.1 specification</p>
          </div>
        </div>
        <Link href="/docs" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Docs
        </Link>
      </div>

      {!loaded && (
        <div className="flex items-center justify-center h-96 text-gray-400 text-sm bg-white border border-gray-200 rounded-xl">
          Loading API documentation...
        </div>
      )}
      <div id="swagger-container" ref={containerRef} className="bg-white border border-gray-200 rounded-xl overflow-hidden min-h-[600px]" />
    </div>
  );
}
