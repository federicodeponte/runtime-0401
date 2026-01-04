/**
 * EndpointList - Display list of API endpoints with method badges
 */

import Link from 'next/link';
import { EndpointMeta } from '@/lib/contracts';

interface EndpointListProps {
  endpoints: EndpointMeta[];
  baseUrl?: string; // Base URL for links (default: "/demo")
}

// Method badge colors (Linear-style)
const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-700 border-blue-200',
  POST: 'bg-green-100 text-green-700 border-green-200',
  PUT: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  DELETE: 'bg-red-100 text-red-700 border-red-200',
  PATCH: 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function EndpointList({ endpoints, baseUrl = '/demo' }: EndpointListProps) {
  if (endpoints.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No endpoints found in this API
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {endpoints.map((endpoint) => {
        const methodColor = METHOD_COLORS[endpoint.method] || 'bg-gray-100 text-gray-700 border-gray-200';
        const encodedId = encodeURIComponent(endpoint.id);

        return (
          <Link
            key={endpoint.id}
            href={`${baseUrl}/${encodedId}`}
            className="block border rounded-lg p-4 hover:border-gray-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-3">
              {/* Method Badge */}
              <span className={`px-2 py-1 text-xs font-medium rounded border ${methodColor}`}>
                {endpoint.method}
              </span>

              {/* Endpoint Info */}
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm font-medium text-gray-900">
                  {endpoint.path}
                </div>
                {endpoint.summary && (
                  <div className="text-sm text-gray-600 mt-1">
                    {endpoint.summary}
                  </div>
                )}
                {endpoint.description && !endpoint.summary && (
                  <div className="text-sm text-gray-600 mt-1">
                    {endpoint.description}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div className="text-gray-400">
                →
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
