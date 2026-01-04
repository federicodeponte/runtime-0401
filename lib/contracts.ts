/**
 * Core Contracts - Execution Layer v0
 *
 * These types define the two sacred contracts:
 * 1. OpenAPI In - Standard OpenAPI 3.x JSON (user uploads)
 * 2. RunEnvelope Out - Standardized run result (always same shape)
 */

// ============================================================================
// RunEnvelope - The Output Contract
// ============================================================================

/**
 * Standardized result envelope from runner execution
 * Used by UI rendering, share pages, and run history
 * Never changes between runner implementations (local → Modal)
 */
export interface RunEnvelope {
  // Identity
  run_id: string;
  status: "success" | "error" | "timeout";
  duration_ms: number;

  // HTTP Response
  http_status: number;
  content_type: string;

  // Content (pick one based on content_type)
  json?: unknown;                // If content_type is application/json (validated at runtime)
  text_preview?: string;         // First 10KB of non-JSON response

  // Artifacts
  artifacts: ArtifactRef[];

  // Metadata
  warnings: string[];            // Non-fatal issues
  redactions_applied: boolean;   // Were secrets redacted?

  // Error Info (if status != "success")
  error_class?: ErrorClass;      // Machine-readable error type
  error_message?: string;        // Human-friendly error
  suggested_fix?: string;        // Actionable next step
}

/**
 * Reference to a file artifact created during run
 * Files are collected from /artifacts directory
 */
export interface ArtifactRef {
  name: string;      // File name
  size: number;      // Bytes
  mime: string;      // MIME type
  url: string;       // Download URL (signed or local path)
}

// ============================================================================
// OpenAPI Types - The Input Contract
// ============================================================================

/**
 * Endpoint metadata extracted from OpenAPI spec
 * Used for endpoint listing and navigation
 */
export interface EndpointMeta {
  id: string;           // Format: "GET /path" or "POST /users"
  method: string;       // HTTP method (GET, POST, PUT, DELETE, etc.)
  path: string;         // Endpoint path (/hello, /users/{id}, etc.)
  summary?: string;     // Short description
  description?: string; // Longer description
}

// ============================================================================
// Form Generation Types
// ============================================================================

/**
 * Form model generated from OpenAPI request schema
 * Drives the auto-generated Run Page forms
 */
export interface FormModel {
  endpoint_id: string;  // Which endpoint this form is for
  fields: FormField[];  // Form fields generated from schema
}

/**
 * Individual form field definition
 * Maps JSON Schema types to UI input types
 */
export interface FormField {
  name: string;         // Field name (query param or body property)
  label: string;        // Display label (from description or title)
  kind: "string" | "number" | "boolean" | "enum" | "json";
  required: boolean;    // Is this field required?
  defaultValue?: unknown;   // Default value from schema (validated at runtime)
  options?: string[];   // For enum kind - dropdown options

  // Validation constraints (from JSON Schema)
  minLength?: number;   // For string kind
  maxLength?: number;   // For string kind
  pattern?: string;     // Regex pattern for string validation
  minimum?: number;     // For number kind
  maximum?: number;     // For number kind
}

// ============================================================================
// Error Classes (v0 subset)
// ============================================================================

/**
 * Machine-readable error classifications
 * Used in RunEnvelope.error_class
 */
export type ErrorClass =
  | "IMPORT_ERROR"           // Failed to import FastAPI app
  | "ENTRYPOINT_NOT_FOUND"  // Couldn't find app object
  | "ENDPOINT_NOT_FOUND"    // Endpoint not in OpenAPI spec
  | "VALIDATION_ERROR"      // Invalid inputs
  | "RUNTIME_ERROR"         // Uncaught exception in user code
  | "TIMEOUT"               // Exceeded execution time limit
  | "NETWORK_ERROR"         // Outbound request failed
  | "UNKNOWN";              // Unclassified error
