import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

export interface ValidationResult {
  valid: boolean;
  errors: Array<{ path: string; message: string; value?: unknown }>;
}

export function validateAgainstSchema(data: unknown, schema: object): ValidationResult {
  const validate = ajv.compile(schema);
  const valid = validate(data) as boolean;
  const errors = (validate.errors ?? []).map(e => ({
    path: e.instancePath || '(root)',
    message: e.message ?? 'Validation error',
    value: e.data,
  }));
  return { valid, errors };
}

export function validateResponseShape(
  data: unknown,
  expectedFields: string[]
): ValidationResult {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: [{ path: '(root)', message: 'Response must be an object' }] };
  }
  const obj = data as Record<string, unknown>;
  const errors = expectedFields
    .filter(f => !(f in obj))
    .map(f => ({ path: f, message: `Missing required field: ${f}` }));
  return { valid: errors.length === 0, errors };
}
