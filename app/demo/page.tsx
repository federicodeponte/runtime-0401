/**
 * Demo Mode - Endpoint Explorer
 *
 * Lists endpoints from local OpenAPI fixture
 */

import EndpointList from '@/components/EndpointList';
import { listEndpoints } from '@/lib/openapi/listEndpoints';
import openApiSpec from './openapi.json';

export default function DemoPage() {
  const endpoints = listEndpoints(openApiSpec);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Demo API Explorer
          </h1>
          <p className="text-gray-600">
            Try out endpoints with auto-generated forms
          </p>
        </div>

        {/* Endpoint List */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Available Endpoints
          </h2>
          <EndpointList endpoints={endpoints} />
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <strong>Demo Mode:</strong> All runs are mocked client-side. No actual API calls are made.
        </div>
      </div>
    </div>
  );
}
