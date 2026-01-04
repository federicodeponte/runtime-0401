# Core Contracts - Execution Layer v0

These are the **two sacred contracts** that never change between implementations.

## Contract 1: OpenAPI In

**Source:** User uploads/pastes OpenAPI 3.x JSON

**Used for:**
- Generating endpoint list
- Generating form fields
- Validating request structure

**Minimum required structure:**
```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "API Name",
    "version": "1.0.0"
  },
  "paths": {
    "/endpoint-path": {
      "get|post|put|delete": {
        "summary": "Endpoint description",
        "description": "Longer description",
        "parameters": [
          {
            "name": "param_name",
            "in": "query|path|header",
            "required": true,
            "schema": {
              "type": "string|number|boolean",
              "default": "value",
              "enum": ["option1", "option2"]
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["field1"],
                "properties": {
                  "field1": {
                    "type": "string|number|boolean",
                    "description": "Field description"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

**Supported features (v0):**
- ✅ Query parameters
- ✅ Path parameters (basic)
- ✅ Request body (application/json)
- ✅ Primitive types (string, number, integer, boolean)
- ✅ Enums (rendered as dropdowns)
- ✅ Required/optional fields
- ✅ Default values
- ⚠️ Nested objects (depth ≤ 2, else fallback to JSON editor)
- ❌ oneOf/anyOf/allOf (fallback to JSON editor)
- ❌ File uploads (not yet)
- ❌ Response schemas (not used for form generation)

---

## Contract 2: RunEnvelope Out

**Source:** Runner execution (local Python or Modal)

**Used by:**
- UI result rendering
- Run history
- Share pages
- Debugging

**TypeScript Definition:**
```typescript
interface RunEnvelope {
  // Identity
  run_id: string;
  status: "success" | "error" | "timeout";
  duration_ms: number;

  // HTTP Response
  http_status: number;
  content_type: string;

  // Content (pick based on content_type)
  json?: any;                    // If content_type is application/json
  text_preview?: string;         // First 10KB of non-JSON response

  // Artifacts
  artifacts: ArtifactRef[];

  // Metadata
  warnings: string[];            // Non-fatal issues
  redactions_applied: boolean;   // Were secrets redacted?

  // Error Info (if status != "success")
  error_class?: string;          // Machine-readable error type
  error_message?: string;        // Human-friendly error
  suggested_fix?: string;        // Actionable next step
}

interface ArtifactRef {
  name: string;      // File name
  size: number;      // Bytes
  mime: string;      // MIME type
  url: string;       // Download URL (signed or local path)
}
```

**Status Values:**

| Status | Meaning | Error Fields Required |
|--------|---------|----------------------|
| success | Endpoint executed successfully | ❌ |
| error | Runtime error or exception | ✅ error_class, error_message, suggested_fix |
| timeout | Execution exceeded time limit | ✅ error_class="TIMEOUT", error_message |

**Error Classes (v0 subset):**

```typescript
type ErrorClass =
  | "IMPORT_ERROR"           // Failed to import FastAPI app
  | "ENTRYPOINT_NOT_FOUND"  // Couldn't find app object
  | "ENDPOINT_NOT_FOUND"    // Endpoint not in OpenAPI spec
  | "VALIDATION_ERROR"      // Invalid inputs
  | "RUNTIME_ERROR"         // Uncaught exception in user code
  | "TIMEOUT"               // Exceeded execution time limit
  | "NETWORK_ERROR"         // Outbound request failed
  | "UNKNOWN"               // Unclassified error
```

**Content Type Handling:**

| Content-Type | json field | text_preview field | UI Rendering |
|--------------|------------|-------------------|--------------|
| application/json | ✅ Parsed object | ❌ | Pretty JSON viewer |
| text/* | ❌ | ✅ First 10KB | Escaped text + download |
| Other | ❌ | ❌ | Download button only |

**Artifacts:**
- Collected from `/artifacts/**` directory
- Max 50 files, 50MB total (v0 limit)
- Each artifact gets a download URL
- Empty array if no artifacts

**Warnings:**
- Non-fatal issues (e.g., "Import took 12s, consider lazy loading")
- Displayed to user but don't fail run
- Empty array if no warnings

**Redactions:**
- Set to `true` if any secrets were redacted from output
- UI shows warning icon if true
- Prevents accidental secret leakage

---

## Example RunEnvelope Instances

### Success (JSON Response)
```json
{
  "run_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "success",
  "duration_ms": 1234,
  "http_status": 200,
  "content_type": "application/json",
  "json": {
    "message": "Hello, World!",
    "timestamp": "2024-01-04T12:34:56Z"
  },
  "artifacts": [],
  "warnings": [],
  "redactions_applied": false
}
```

### Success (With Artifacts)
```json
{
  "run_id": "550e8400-e29b-41d4-a716-446655440001",
  "status": "success",
  "duration_ms": 3421,
  "http_status": 200,
  "content_type": "application/json",
  "json": {
    "processed": true,
    "items": 150
  },
  "artifacts": [
    {
      "name": "output.csv",
      "size": 2048,
      "mime": "text/csv",
      "url": "/artifacts/550e8400-e29b-41d4-a716-446655440001/output.csv"
    }
  ],
  "warnings": ["Large dataset processed, consider pagination"],
  "redactions_applied": false
}
```

### Error (Import Failed)
```json
{
  "run_id": "550e8400-e29b-41d4-a716-446655440002",
  "status": "error",
  "duration_ms": 523,
  "http_status": 500,
  "content_type": "text/plain",
  "text_preview": "ImportError: No module named 'custom_lib'",
  "artifacts": [],
  "warnings": [],
  "redactions_applied": false,
  "error_class": "IMPORT_ERROR",
  "error_message": "Failed to import your FastAPI app. Missing dependency: custom_lib",
  "suggested_fix": "Add 'custom_lib' to your requirements.txt and re-upload your project"
}
```

### Timeout
```json
{
  "run_id": "550e8400-e29b-41d4-a716-446655440003",
  "status": "timeout",
  "duration_ms": 60000,
  "http_status": 504,
  "content_type": "text/plain",
  "artifacts": [],
  "warnings": [],
  "redactions_applied": false,
  "error_class": "TIMEOUT",
  "error_message": "Execution exceeded 60 second time limit",
  "suggested_fix": "Optimize your endpoint or reduce the workload. Long-running tasks are not supported in v0."
}
```

### Redacted Secrets
```json
{
  "run_id": "550e8400-e29b-41d4-a716-446655440004",
  "status": "success",
  "duration_ms": 892,
  "http_status": 200,
  "content_type": "application/json",
  "json": {
    "api_key": "[REDACTED:API_KEY]",
    "result": "success"
  },
  "artifacts": [],
  "warnings": [],
  "redactions_applied": true
}
```

---

## Contract Validation

**Before rendering UI:**
```typescript
function validateRunEnvelope(envelope: any): envelope is RunEnvelope {
  return (
    typeof envelope.run_id === 'string' &&
    ['success', 'error', 'timeout'].includes(envelope.status) &&
    typeof envelope.duration_ms === 'number' &&
    typeof envelope.http_status === 'number' &&
    typeof envelope.content_type === 'string' &&
    Array.isArray(envelope.artifacts) &&
    Array.isArray(envelope.warnings) &&
    typeof envelope.redactions_applied === 'boolean'
  );
}
```

**Before executing runner:**
```typescript
function validateOpenAPI(openapi: any): boolean {
  return (
    typeof openapi === 'object' &&
    typeof openapi.openapi === 'string' &&
    openapi.openapi.startsWith('3.') &&
    typeof openapi.paths === 'object' &&
    Object.keys(openapi.paths).length > 0
  );
}
```

---

## Why These Contracts Matter

**Stability:**
- UI always receives same shape (easy to render)
- Runner can be swapped (local → Modal) without UI changes
- OpenAPI parsing isolated from execution

**Debuggability:**
- Every run has unique `run_id`
- Error messages are actionable
- Warnings don't break UX

**Security:**
- `redactions_applied` flag signals sensitive data handling
- Error messages are user-safe (no stack traces by default)
- Secrets never in RunEnvelope (injected at runtime only)

**Extensibility:**
- Add new error_class values without breaking UI
- Add new artifact types without changing contract
- Add new warning patterns without UI changes

---

## Migration Path

When upgrading from v0 to production:

**Keep unchanged:**
- ✅ RunEnvelope structure
- ✅ OpenAPI input format
- ✅ Endpoint ID format (`METHOD /path`)

**Can enhance:**
- Add more error_class values
- Add response schema validation
- Add streaming support (new field `stream_url?`)
- Add real-time logs (new field `logs_url?`)
- Encrypt artifacts (change `url` to signed URLs)

**Contract guarantees:**
- Old UI code still works
- Old runner implementations still compatible
- Share links don't break
