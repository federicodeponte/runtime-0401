/**
 * OpenAPI Endpoint Listing
 *
 * Extracts endpoint metadata from OpenAPI 3.x specs
 */

import { EndpointMeta } from './types';

/**
 * Valid HTTP methods we recognize in OpenAPI specs
 */
const HTTP_METHODS = new Set([
  'get',
  'post',
  'put',
  'delete',
  'patch',
  'options',
  'head',
  'trace'
]);

/**
 * Extract all endpoints from an OpenAPI 3.x specification
 *
 * @param openapi - OpenAPI 3.x JSON object
 * @returns Array of endpoint metadata
 *
 * @example
 * const endpoints = listEndpoints({
 *   openapi: "3.0.0",
 *   paths: {
 *     "/hello": {
 *       get: { summary: "Say hello" }
 *     }
 *   }
 * });
 * // Returns: [{ id: "GET /hello", method: "GET", path: "/hello", summary: "Say hello" }]
 */
export function listEndpoints(openapi: unknown): EndpointMeta[] {
  const endpoints: EndpointMeta[] = [];

  // Type guard: ensure openapi is an object with paths
  if (!openapi || typeof openapi !== 'object') {
    return endpoints;
  }

  const spec = openapi as Record<string, unknown>;
  const paths = spec.paths;

  if (!paths || typeof paths !== 'object') {
    return endpoints;
  }

  // Iterate through each path
  for (const [path, pathItem] of Object.entries(paths)) {
    if (!pathItem || typeof pathItem !== 'object') {
      continue;
    }

    const pathObj = pathItem as Record<string, unknown>;

    // Iterate through each method in the path
    for (const [method, operation] of Object.entries(pathObj)) {
      // Skip non-HTTP method keys (parameters, servers, etc.)
      if (!HTTP_METHODS.has(method.toLowerCase())) {
        continue;
      }

      // Extract operation details
      const operationObj = (operation && typeof operation === 'object')
        ? operation as Record<string, unknown>
        : {};

      const summary = typeof operationObj.summary === 'string'
        ? operationObj.summary
        : undefined;

      const description = typeof operationObj.description === 'string'
        ? operationObj.description
        : undefined;

      // Create endpoint metadata
      endpoints.push({
        id: `${method.toUpperCase()} ${path}`,
        method: method.toUpperCase(),
        path,
        summary,
        description
      });
    }
  }

  return endpoints;
}
