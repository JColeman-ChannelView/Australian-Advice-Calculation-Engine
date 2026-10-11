/** OpenAPI 3.1 document generated from the calculator catalogue's zod input schemas. */
import { z } from 'zod';
import { calculators } from '../calculators.js';
import { ENGINE_NAME, ENGINE_VERSION } from '../version.js';
import type { CalculatorDef } from '../core/calculator.js';

export function inputJsonSchema(def: CalculatorDef): unknown {
  return z.toJSONSchema(def.input, { io: 'input', unrepresentable: 'any' });
}

export function openApiDocument(): Record<string, unknown> {
  const paths: Record<string, unknown> = {
    '/api/v1/health': { get: { summary: 'Engine and parameter-release identity', responses: { '200': { description: 'OK' } } } },
    '/api/v1/calculators': { get: { summary: 'List calculators with input schemas, rules and limitations', responses: { '200': { description: 'OK' } } } },
    '/api/v1/parameters': {
      get: {
        summary: 'Query parameter records',
        parameters: [
          { name: 'name', in: 'query', schema: { type: 'string' }, description: 'Exact parameter name or prefix ending in "."' },
          { name: 'date', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Only the record in force on this date' },
        ],
        responses: { '200': { description: 'OK' } },
      },
    },
  };
  for (const def of calculators) {
    paths[`/api/v1/calculate/${def.id}`] = {
      post: {
        operationId: def.id.replace(/\./g, '_'),
        summary: def.title,
        description: `${def.summary}\n\nLimitations:\n${def.limitations.map((l) => `- ${l}`).join('\n')}`,
        tags: [def.domain],
        parameters: [
          { name: 'evidence', in: 'query', schema: { type: 'boolean' }, description: 'Return a hash-sealed evidence bundle wrapping the response' },
          { name: 'knowledge_as_at', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Use only parameters knowable on or before this date' },
        ],
        requestBody: { required: true, content: { 'application/json': { schema: inputJsonSchema(def), example: def.example } } },
        responses: {
          '200': { description: 'Calculated (status "ok")', content: { 'application/json': { schema: { $ref: '#/components/schemas/CalculationResponse' } } } },
          '400': { description: 'Invalid input (status "invalid", with issues)' },
          '422': { description: 'Blocked: a required rule or parameter is unverified, missing or out of scope (status "blocked", with reasons)' },
        },
      },
    };
  }
  return {
    openapi: '3.1.0',
    info: {
      title: `${ENGINE_NAME} API`,
      version: ENGINE_VERSION,
      description:
        'Reference calculations for Australian tax, superannuation, Age Pension, aged care, projections, insurance needs and loans. Not financial advice; not endorsed by any Commonwealth agency.',
      license: { name: 'Apache-2.0', identifier: 'Apache-2.0' },
    },
    paths,
    components: {
      schemas: {
        CalculationResponse: {
          type: 'object',
          required: ['schema_version', 'engine', 'parameter_release', 'calculator', 'status', 'trace', 'parameters', 'assumptions', 'warnings', 'limitations', 'rules', 'disclaimer'],
          properties: {
            schema_version: { type: 'string' },
            engine: { type: 'object', properties: { name: { type: 'string' }, version: { type: 'string' } } },
            parameter_release: { type: 'object', properties: { hash: { type: 'string' }, currency_date: { type: 'string' } } },
            calculator: { type: 'object', properties: { id: { type: 'string' }, title: { type: 'string' }, domain: { type: 'string' } } },
            status: { type: 'string', enum: ['ok', 'blocked', 'invalid'] },
            input: {},
            result: { type: 'object', description: 'Calculator-specific; money as decimal strings' },
            blocked: { type: 'array', items: { type: 'object', properties: { code: { type: 'string' }, message: { type: 'string' }, parameter: { type: 'string' } } } },
            issues: { type: 'array', items: { type: 'object', properties: { path: { type: 'string' }, message: { type: 'string' } } } },
            trace: { type: 'array', items: { type: 'object' } },
            parameters: { type: 'array', items: { type: 'object' }, description: 'Every parameter record used, with sources' },
            assumptions: { type: 'array', items: { type: 'object' } },
            warnings: { type: 'array', items: { type: 'string' } },
            limitations: { type: 'array', items: { type: 'string' } },
            rules: { type: 'array', items: { type: 'object' } },
            disclaimer: { type: 'string' },
          },
        },
      },
    },
  };
}
