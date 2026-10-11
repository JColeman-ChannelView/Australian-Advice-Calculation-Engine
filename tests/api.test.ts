/** Integration tests: real HTTP server on an ephemeral port. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { AddressInfo } from 'node:net';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Server } from 'node:http';
import { createApp } from '../src/api/server.js';
import { verifyEvidenceBundle, type EvidenceBundle } from '../src/core/evidence.js';
import { calculators } from '../src/calculators.js';

let server: Server;
let base: string;

beforeAll(async () => {
  const dir = mkdtempSync(join(tmpdir(), 'aace-static-'));
  writeFileSync(join(dir, 'index.html'), '<!doctype html><title>t</title>');
  server = createApp(dir);
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
afterAll(() => new Promise<void>((r) => server.close(() => r())));

const post = (path: string, body: unknown) =>
  fetch(`${base}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

describe('JSON API', () => {
  it('reports health with the parameter release hash', async () => {
    const r = await fetch(`${base}/api/v1/health`);
    expect(r.status).toBe(200);
    const j = (await r.json()) as { parameter_release: { hash: string } };
    expect(j.parameter_release.hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('lists every calculator with a JSON schema', async () => {
    const j = (await (await fetch(`${base}/api/v1/calculators`)).json()) as Array<{ id: string; input_schema: { type?: string } }>;
    expect(j.map((c) => c.id).sort()).toEqual(calculators.map((c) => c.id).sort());
    expect(j.every((c) => c.input_schema && typeof c.input_schema === 'object')).toBe(true);
  });

  it('every calculator example runs (ok or an explicit block) through the API', async () => {
    for (const c of calculators) {
      const r = await post(`/api/v1/calculate/${c.id}`, c.example);
      const j = (await r.json()) as { status: string; issues?: unknown };
      expect([200, 422], `${c.id}: ${JSON.stringify(j.issues)}`).toContain(r.status);
      expect(['ok', 'blocked']).toContain(j.status);
    }
  });

  it('calculates with 200, blocks with 422, rejects with 400', async () => {
    expect((await post('/api/v1/calculate/tax.income_tax', { financial_year: '2026-27', taxable_income: 100000 })).status).toBe(200);
    const blocked = await post('/api/v1/calculate/tax.medicare_levy', { financial_year: '2026-27', taxable_income: 60000 });
    expect(blocked.status).toBe(422);
    expect(((await blocked.json()) as { blocked: Array<{ code: string }> }).blocked[0]!.code).toBe('PARAMETER_MISSING');
    expect((await post('/api/v1/calculate/tax.income_tax', { financial_year: 'nope' })).status).toBe(400);
    expect((await post('/api/v1/calculate/nope.nope', {})).status).toBe(404);
  });

  it('returns a verifiable evidence bundle on request', async () => {
    const r = await post('/api/v1/calculate/centrelink.age_pension?evidence=true', {
      assessment_date: '2026-10-11',
      relationship: 'single',
      homeowner: true,
      dates_of_birth: ['1955-01-01'],
      assessable_assets: 433000,
      financial_assets: 0,
    });
    const b = (await r.json()) as EvidenceBundle;
    expect(b.hashes.bundle).toMatch(/^[0-9a-f]{64}$/);
    expect(verifyEvidenceBundle(b)).toBe(true);
    expect((b.response.result as Record<string, string>).rate_fortnightly_per_person).toBe('937.70');
  });

  it('honours knowledge_as_at', async () => {
    const r = await post('/api/v1/calculate/centrelink.age_pension?knowledge_as_at=2026-09-01', {
      assessment_date: '2026-10-11',
      relationship: 'single',
      homeowner: true,
      dates_of_birth: ['1955-01-01'],
      assessable_assets: 0,
      financial_assets: 0,
    });
    expect(r.status).toBe(422);
  });

  it('filters parameters by name prefix and date', async () => {
    const j = (await (await fetch(`${base}/api/v1/parameters?name=tax.resident_scale&date=2026-10-11`)).json()) as { records: Array<{ effective_from: string }> };
    expect(j.records).toHaveLength(1);
    expect(j.records[0]!.effective_from).toBe('2026-07-01');
  });

  it('serves an OpenAPI 3.1 document covering all calculators', async () => {
    const j = (await (await fetch(`${base}/api/v1/openapi.json`)).json()) as { openapi: string; paths: Record<string, unknown> };
    expect(j.openapi).toBe('3.1.0');
    for (const c of calculators) expect(j.paths[`/api/v1/calculate/${c.id}`]).toBeDefined();
  });

  it('rejects non-JSON bodies, malformed JSON, and path traversal', async () => {
    expect((await fetch(`${base}/api/v1/calculate/tax.income_tax`, { method: 'POST', body: 'x' })).status).toBe(415);
    expect((await fetch(`${base}/api/v1/calculate/tax.income_tax`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })).status).toBe(400);
    const r = await fetch(`${base}/..%2f..%2fpackage.json`);
    expect([403, 200]).toContain(r.status);
    if (r.status === 200) expect(await r.text()).toContain('<!doctype html>'); // SPA fallback, never the file
  });
});
