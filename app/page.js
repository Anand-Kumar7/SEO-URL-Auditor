'use client';

import { useState } from 'react';

export default function AuditorPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAudit = async (e) => {
    e.preventDefault();
    if (!url) return;

    // Reset state before fetching
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/audit?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      // Check the exact consistent JSON response contract
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'An unknown error occurred.');
      }

      setResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
          SEO URL Auditor
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Enter a URL below for instant SEO and performance metrics.
        </p>

        {/* Input Form */}
        <form onSubmit={handleAudit} className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-400 bg-gray-50 text-gray-900 font-medium placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors duration-200 ${
              loading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-md'
            }`}
          >
            {loading ? 'Auditing...' : 'Run Audit'}
          </button>
        </form>

        {/* Prominent Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-left font-medium mb-6">
            <span className="block font-bold mb-1">Audit Failed</span>
            {error}
          </div>
        )}

        {/* Success / Result State */}
        {result && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-inner">
            <h2 className="text-xl font-semibold text-white mb-4 border-b border-slate-700 pb-2">
              Audit Report
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MetricCard label="HTTP Status" value={result.httpStatus} />
              <MetricCard label="Response Time" value={`${result.responseTime} ms`} />
              <MetricCard label="Title" value={result.title || 'N/A'} fullWidth />
              <MetricCard label="Meta Description" value={result.metaDescription || 'N/A'} fullWidth />
              <MetricCard label="H1 Tag Count" value={result.h1Count} />
              <MetricCard label="Images Missing Alt" value={result.imagesMissingAlt} />
              <MetricCard label="Approximate Word Count" value={result.wordCount} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/**
 * Reusable MetricCard Component for the Grid UI
 */
function MetricCard({ label, value, fullWidth = false }) {
  return (
    <div 
      className={`bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-700 flex flex-col justify-center ${
        fullWidth ? 'sm:col-span-2' : ''
      }`}
    >
      <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </span>
      <span className="text-lg text-white font-medium break-words">
        {value}
      </span>
    </div>
  );
}
