/**
 * Core Domain Types - Execution Layer v0
 *
 * These represent the entities stored in /data directory as JSON files.
 * In v0, we use file-based storage (no database).
 *
 * Storage structure:
 * - /data/projects.json → Project[]
 * - /data/versions/{version_id}.json → Version
 * - /data/runs/{run_id}.json → Run
 * - /data/shares.json → Share[]
 */

import { RunEnvelope } from './contracts';

// ============================================================================
// Core Domain Entities
// ============================================================================

/**
 * Project - Top-level container
 * A project represents one FastAPI application
 */
export interface Project {
  id: string;                    // Unique project ID (UUID)
  name: string;                  // User-provided name
  created_at: string;            // ISO 8601 timestamp
  latest_version_id?: string;    // Most recent version (for quick access)
}

/**
 * OpenAPI 3.x Spec Structure
 * Minimal type for the fields we actually use
 */
export interface OpenAPISpec {
  openapi: string;               // Version string (e.g., "3.0.0", "3.1.0")
  info: {
    title: string;
    version: string;
  };
  paths: Record<string, Record<string, unknown>>;  // paths["/hello"]["get"] = operation object
  [key: string]: unknown;        // Allow additional OpenAPI fields
}

/**
 * Version - Immutable snapshot of app code + OpenAPI spec
 * Each upload creates a new version
 */
export interface Version {
  id: string;                    // Unique version ID (UUID)
  project_id: string;            // Parent project
  created_at: string;            // ISO 8601 timestamp

  // OpenAPI spec (parsed)
  openapi_spec: OpenAPISpec;     // Full OpenAPI 3.x JSON

  // Code storage
  code_archive_path: string;     // Path to .zip file in /data/code/
  entrypoint: string;            // Python module path (e.g., "main:app")
}

/**
 * Run inputs structure
 * Maps form field names to their submitted values
 */
export interface RunInputs {
  query?: Record<string, string | number | boolean>;    // Query parameters
  path?: Record<string, string | number>;                // Path parameters
  body?: unknown;                                        // Request body (validated against schema)
  headers?: Record<string, string>;                      // Custom headers
}

/**
 * Run - Single execution of an endpoint
 * Created when user clicks "Run" on a Run Page
 */
export interface Run {
  id: string;                    // Unique run ID (UUID)
  version_id: string;            // Which version was executed
  endpoint_id: string;           // Which endpoint (e.g., "GET /hello")

  // Inputs
  inputs: RunInputs;             // Structured form values

  // Result
  result: RunEnvelope;           // Standardized execution result

  // Metadata
  created_at: string;            // ISO 8601 timestamp
  created_by: string;            // User ID or "anonymous"
}

/**
 * Share - Public Run Page configuration
 * Enables sharing a specific endpoint as a public form
 */
export interface Share {
  id: string;                    // Unique share ID (UUID)
  version_id: string;            // Which version to run
  endpoint_id: string;           // Which endpoint to expose
  enabled: boolean;              // Can be disabled without deleting
  created_at: string;            // ISO 8601 timestamp
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Project with enriched data (for UI display)
 * Joins project + latest version metadata
 */
export interface ProjectWithVersion extends Project {
  latest_version?: {
    id: string;
    created_at: string;
    endpoint_count: number;
  };
}

/**
 * Run history item (for UI display)
 * Simplified run data for list views
 */
export interface RunHistoryItem {
  id: string;
  endpoint_id: string;
  status: "success" | "error" | "timeout";
  duration_ms: number;
  created_at: string;
}
