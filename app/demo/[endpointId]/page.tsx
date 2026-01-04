'use client';

/**
 * Demo Run Page - Auto-generated form for testing endpoints
 */

import { use, useState } from 'react';
import Link from 'next/link';
import FormRenderer from '@/components/FormRenderer';
import ResultViewer from '@/components/ResultViewer';
import { generateFormModel } from '@/lib/openapi/formModel';
import { RunEnvelope } from '@/lib/contracts';
import openApiSpec from '../openapi.json';

interface PageProps {
  params: Promise<{
    endpointId: string;
  }>;
}

export default function DemoRunPage({ params }: PageProps) {
  const { endpointId } = use(params);
  const decodedEndpointId = decodeURIComponent(endpointId);

  const [result, setResult] = useState<RunEnvelope | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate form model
  const formModel = generateFormModel(openApiSpec, decodedEndpointId);

  // Parse endpoint ID
  const [method, ...pathParts] = decodedEndpointId.split(' ');
  const path = pathParts.join(' ');

  // Mock run execution
  const handleRun = async (values: Record<string, unknown>) => {
    setIsSubmitting(true);
    setResult(null);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Create mocked RunEnvelope
    const mockResult: RunEnvelope = {
      run_id: `demo-${Date.now()}`,
      status: 'success',
      duration_ms: Math.floor(Math.random() * 300) + 50,
      http_status: 200,
      content_type: 'application/json',
      json: {
        demo: 'This is a mocked response',
        endpoint: decodedEndpointId,
        inputs: values,
        timestamp: new Date().toISOString(),
      },
      artifacts: [],
      warnings: [],
      redactions_applied: false,
    };

    setResult(mockResult);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Link */}
        <Link
          href="/demo"
          className="text-sm text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-1"
        >
          ← Back to endpoints
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded border ${
              method === 'GET' ? 'bg-blue-100 text-blue-700 border-blue-200' :
              method === 'POST' ? 'bg-green-100 text-green-700 border-green-200' :
              method === 'PUT' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
              method === 'DELETE' ? 'bg-red-100 text-red-700 border-red-200' :
              'bg-gray-100 text-gray-700 border-gray-200'
            }`}>
              {method}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 font-mono">
              {path}
            </h1>
          </div>
          <p className="text-gray-600">
            Fill in the parameters below and click Run to test this endpoint
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Parameters
          </h2>
          <FormRenderer
            fields={formModel.fields}
            onSubmit={handleRun}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Result
            </h2>
            <ResultViewer result={result} />
          </div>
        )}

        {/* Demo Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <strong>Demo Mode:</strong> This is a mocked response. In production, this would call the actual API endpoint.
        </div>
      </div>
    </div>
  );
}
