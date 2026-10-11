/**
 * Transport-independent request handling: (method, path, query, body) → (status, JSON body).
 * The HTTP server and the integration tests both use this.
 */
import { calculators, getCalculator } from '../calculators.js';
import { runCalculator } from '../core/calculator.js';
import { createEvidenceBundle } from '../core/evidence.js';
import { isIsoDate } from '../core/dates.js';
import { defaultRegistry } from '../params.js';
import { ENGINE_NAME, ENGINE_VERSION } from '../version.js';
import { inputJsonSchema, openApiDocument } from './openapi.js';

export interface ApiRequest {
  method: string;
  path: string;
  query: URLSearchParams;
  body?: unknown;
  /** Clock injected by the transport so handling stays deterministic in tests. */
  now: () => Date;
}

export interface ApiResponse {
  status: number;
  body: unknown;
}

const err = (status: number, message: string): ApiResponse => ({ status, body: { error: message } });

export function handle(req: ApiRequest): ApiResponse {
  const reg = defaultRegistry();
  const { method, path, query } = req;

  if (method === 'GET' && path === '/api/v1/health') {
    return { status: 200, body: { status: 'ok', engine: { name: ENGINE_NAME, version: ENGINE_VERSION }, parameter_release: reg.bundle.release } };
  }
  if (method === 'GET' && path === '/api/v1/openapi.json') {
    return { status: 200, body: openApiDocument() };
  }
  if (method === 'GET' && path === '/api/v1/calculators') {
    return {
      status: 200,
      body: calculators.map((c) => ({
        id: c.id,
        title: c.title,
        domain: c.domain,
        summary: c.summary,
        rules: c.rules,
        limitations: c.limitations,
        example: c.example,
        input_schema: inputJsonSchema(c),
      })),
    };
  }
  if (method === 'GET' && path === '/api/v1/parameters') {
    const name = query.get('name');
    const date = query.get('date');
    if (date && !isIsoDate(date)) return err(400, 'date must be YYYY-MM-DD');
    let records = reg.bundle.records;
    if (name) records = records.filter((r) => (name.endsWith('.') ? r.name.startsWith(name) : r.name === name));
    if (date) records = records.filter((r) => r.effective_from <= date && (r.effective_to === null || date <= r.effective_to));
    return { status: 200, body: { release: reg.bundle.release, records } };
  }
  const m = /^\/api\/v1\/calculate\/([a-z0-9_.]+)$/.exec(path);
  if (m) {
    if (method !== 'POST') return err(405, 'use POST with a JSON body');
    const def = getCalculator(m[1]!);
    if (!def) return err(404, `unknown calculator "${m[1]}"`);
    const knowledge = query.get('knowledge_as_at');
    if (knowledge && !isIsoDate(knowledge)) return err(400, 'knowledge_as_at must be YYYY-MM-DD');
    const response = runCalculator(def, req.body, reg, knowledge ? { knowledgeAsAt: knowledge } : {});
    const status = response.status === 'ok' ? 200 : response.status === 'blocked' ? 422 : 400;
    const wantEvidence = query.get('evidence') === 'true' || query.get('evidence') === '1';
    return { status, body: wantEvidence ? createEvidenceBundle(response, req.now().toISOString()) : response };
  }
  if (path.startsWith('/api/')) return err(404, 'not found');
  return err(404, 'not found');
}
