/**
 * Form Model Generation from OpenAPI
 *
 * Converts OpenAPI request schemas into FormModel for auto-generated Run Page forms
 */

import { FormModel, FormField } from '../contracts';

/**
 * Generate a form model from an OpenAPI endpoint specification
 *
 * @param openapi - OpenAPI 3.x JSON object
 * @param endpointId - Endpoint identifier (e.g., "GET /hello", "POST /users")
 * @returns Form model with fields array
 *
 * @example
 * const formModel = generateFormModel(openapi, "POST /users");
 * // Returns: { endpoint_id: "POST /users", fields: [...] }
 */
export function generateFormModel(openapi: unknown, endpointId: string): FormModel {
  const fields: FormField[] = [];

  // Type guards
  if (!openapi || typeof openapi !== 'object') {
    return { endpoint_id: endpointId, fields };
  }

  const spec = openapi as Record<string, unknown>;
  const paths = spec.paths;

  if (!paths || typeof paths !== 'object') {
    return { endpoint_id: endpointId, fields };
  }

  // Parse endpoint ID to extract method and path
  const [method, ...pathParts] = endpointId.split(' ');
  const path = pathParts.join(' '); // Handle paths with spaces

  if (!method || !path) {
    return { endpoint_id: endpointId, fields };
  }

  // Find the operation in the OpenAPI spec
  const pathsObj = paths as Record<string, unknown>;
  const pathItem = pathsObj[path];

  if (!pathItem || typeof pathItem !== 'object') {
    return { endpoint_id: endpointId, fields };
  }

  const pathItemObj = pathItem as Record<string, unknown>;
  const operation = pathItemObj[method.toLowerCase()];

  if (!operation || typeof operation !== 'object') {
    return { endpoint_id: endpointId, fields };
  }

  const operationObj = operation as Record<string, unknown>;

  // Extract query parameters
  const parameters = operationObj.parameters;
  if (parameters && Array.isArray(parameters)) {
    for (const param of parameters) {
      if (!param || typeof param !== 'object') continue;
      const paramObj = param as Record<string, unknown>;

      // Only handle query parameters for now
      if (paramObj.in !== 'query') continue;

      const name = paramObj.name;
      if (typeof name !== 'string') continue;

      const schema = paramObj.schema;
      if (!schema || typeof schema !== 'object') continue;

      const schemaObj = schema as Record<string, unknown>;
      const field = schemaToFormField(name, schemaObj, paramObj.required === true);
      fields.push(field);
    }
  }

  // Extract request body
  const requestBody = operationObj.requestBody;
  if (requestBody && typeof requestBody === 'object') {
    const requestBodyObj = requestBody as Record<string, unknown>;
    const content = requestBodyObj.content;

    if (content && typeof content === 'object') {
      const contentObj = content as Record<string, unknown>;
      const jsonContent = contentObj['application/json'];

      if (jsonContent && typeof jsonContent === 'object') {
        const jsonContentObj = jsonContent as Record<string, unknown>;
        const schema = jsonContentObj.schema;

        if (schema && typeof schema === 'object') {
          const schemaObj = schema as Record<string, unknown>;

          // Check for complex schemas → fallback to JSON editor
          if (isComplexSchema(schemaObj)) {
            fields.push({
              name: 'body',
              label: 'Request Body (JSON)',
              kind: 'json',
              required: requestBodyObj.required === true,
            });
          } else {
            // Simple object schema → individual fields
            const properties = schemaObj.properties;
            const required = Array.isArray(schemaObj.required) ? schemaObj.required : [];

            if (properties && typeof properties === 'object') {
              const propsObj = properties as Record<string, unknown>;

              for (const [propName, propSchema] of Object.entries(propsObj)) {
                if (!propSchema || typeof propSchema !== 'object') continue;

                const propSchemaObj = propSchema as Record<string, unknown>;
                const isRequired = required.includes(propName);
                const field = schemaToFormField(propName, propSchemaObj, isRequired);
                fields.push(field);
              }
            }
          }
        }
      }
    }
  }

  return {
    endpoint_id: endpointId,
    fields
  };
}

/**
 * Check if a schema is complex and should use JSON editor fallback
 */
function isComplexSchema(schema: Record<string, unknown>): boolean {
  // Has oneOf/anyOf/allOf → complex
  if (schema.oneOf || schema.anyOf || schema.allOf) {
    return true;
  }

  // Deep nesting check (depth > 2)
  if (schema.type === 'object' && schema.properties) {
    const props = schema.properties as Record<string, unknown>;
    for (const propSchema of Object.values(props)) {
      if (!propSchema || typeof propSchema !== 'object') continue;
      const propSchemaObj = propSchema as Record<string, unknown>;

      // If property is an object with nested properties → depth 2
      if (propSchemaObj.type === 'object' && propSchemaObj.properties) {
        const nestedProps = propSchemaObj.properties as Record<string, unknown>;
        for (const nestedSchema of Object.values(nestedProps)) {
          if (!nestedSchema || typeof nestedSchema !== 'object') continue;
          const nestedSchemaObj = nestedSchema as Record<string, unknown>;

          // If nested property is also an object → depth 3, too complex
          if (nestedSchemaObj.type === 'object' || nestedSchemaObj.type === 'array') {
            return true;
          }
        }
      }

      // Arrays with complex items
      if (propSchemaObj.type === 'array') {
        const items = propSchemaObj.items;
        if (items && typeof items === 'object') {
          const itemsObj = items as Record<string, unknown>;
          if (itemsObj.type === 'object' && itemsObj.properties) {
            return true; // Array of objects → complex
          }
        }
      }
    }
  }

  return false;
}

/**
 * Convert a JSON Schema to a FormField
 */
function schemaToFormField(
  name: string,
  schema: Record<string, unknown>,
  required: boolean
): FormField {
  const type = schema.type;
  const enumValues = schema.enum;
  const defaultValue = schema.default;
  const description = schema.description;
  const title = schema.title;

  // Determine field kind
  let kind: FormField['kind'] = 'string';
  let options: string[] | undefined;

  if (Array.isArray(enumValues) && enumValues.length > 0) {
    kind = 'enum';
    options = enumValues.map(v => String(v));
  } else if (type === 'boolean') {
    kind = 'boolean';
  } else if (type === 'number' || type === 'integer') {
    kind = 'number';
  } else if (type === 'object' || type === 'array') {
    kind = 'json';
  } else {
    kind = 'string';
  }

  // Generate label
  const label = (typeof description === 'string' && description)
    || (typeof title === 'string' && title)
    || name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const field: FormField = {
    name,
    label,
    kind,
    required,
  };

  if (defaultValue !== undefined) {
    field.defaultValue = defaultValue;
  }

  if (options) {
    field.options = options;
  }

  // Add validation constraints
  if (kind === 'string') {
    if (typeof schema.minLength === 'number') field.minLength = schema.minLength;
    if (typeof schema.maxLength === 'number') field.maxLength = schema.maxLength;
    if (typeof schema.pattern === 'string') field.pattern = schema.pattern;
  }

  if (kind === 'number') {
    if (typeof schema.minimum === 'number') field.minimum = schema.minimum;
    if (typeof schema.maximum === 'number') field.maximum = schema.maximum;
  }

  return field;
}
