'use client';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h1 className="text-6xl font-bold text-gray-200 mb-4">500</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Something Went Wrong</h2>
      <p className="text-gray-500 mb-8">{error.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 bg-gray-900 text-white hover:bg-gray-800 font-semibold px-6 py-3 rounded-lg transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
