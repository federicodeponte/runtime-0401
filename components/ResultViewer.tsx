'use client';

/**
 * ResultViewer - Display RunEnvelope results
 */

import { useState } from 'react';
import { RunEnvelope } from '@/lib/contracts';

interface ResultViewerProps {
  result: RunEnvelope;
}

export default function ResultViewer({ result }: ResultViewerProps) {
  const [isJsonExpanded, setIsJsonExpanded] = useState(false);

  // Status styling
  const statusColors = {
    success: 'bg-green-100 text-green-700 border-green-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    timeout: 'bg-orange-100 text-orange-700 border-orange-200',
  };

  const statusColor = statusColors[result.status];

  return (
    <div className="border rounded-lg p-4 space-y-4">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-sm font-medium rounded border ${statusColor}`}>
            {result.status.toUpperCase()}
          </span>
          <span className="text-sm text-gray-600">
            HTTP {result.http_status}
          </span>
          <span className="text-sm text-gray-500">
            {result.duration_ms}ms
          </span>
        </div>
      </div>

      {/* Success: Show JSON */}
      {result.status === 'success' && result.json !== undefined && (
        <div>
          <button
            onClick={() => setIsJsonExpanded(!isJsonExpanded)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 mb-2"
          >
            {isJsonExpanded ? '▼' : '▶'} Response JSON
          </button>
          {isJsonExpanded && (
            <pre className="bg-gray-50 border rounded p-3 overflow-x-auto text-sm">
              {JSON.stringify(result.json, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* Success: Show Text Preview */}
      {result.status === 'success' && result.text_preview && result.json === undefined && (
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Response</div>
          <pre className="bg-gray-50 border rounded p-3 overflow-x-auto text-sm">
            {result.text_preview}
          </pre>
        </div>
      )}

      {/* Error: Show Error Message */}
      {result.status === 'error' && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-red-700">Error</div>
          <div className="text-sm text-gray-700">
            {result.error_message || 'An error occurred'}
          </div>
          {result.error_class && (
            <div className="text-xs text-gray-500 font-mono">
              {result.error_class}
            </div>
          )}
          {result.suggested_fix && (
            <div className="text-sm text-blue-600 mt-2">
              💡 {result.suggested_fix}
            </div>
          )}
        </div>
      )}

      {/* Timeout */}
      {result.status === 'timeout' && (
        <div className="text-sm text-gray-700">
          Request timed out after {result.duration_ms}ms
        </div>
      )}

      {/* Warnings */}
      {result.warnings && result.warnings.length > 0 && (
        <div className="space-y-1">
          <div className="text-sm font-medium text-yellow-700">Warnings</div>
          {result.warnings.map((warning, i) => (
            <div key={i} className="text-sm text-gray-700">
              ⚠️ {warning}
            </div>
          ))}
        </div>
      )}

      {/* Artifacts */}
      {result.artifacts && result.artifacts.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Artifacts</div>
          <div className="space-y-1">
            {result.artifacts.map((artifact, i) => (
              <a
                key={i}
                href={artifact.url}
                download={artifact.name}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                📎 {artifact.name} ({(artifact.size / 1024).toFixed(1)} KB)
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Redactions Applied */}
      {result.redactions_applied && (
        <div className="text-xs text-gray-500">
          🔒 Secrets were redacted from this response
        </div>
      )}
    </div>
  );
}
