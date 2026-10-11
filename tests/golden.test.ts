/**
 * Runs every case in tests/golden/*.yaml through the public calculator runner.
 * `expect.result` is matched as a subset of the response result (strings, exact).
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { runCalculator } from '../src/core/calculator.js';
import { getCalculator } from '../src/calculators.js';
import { defaultRegistry } from '../src/params.js';

interface GoldenCase {
  id: string;
  kind: 'official' | 'derived' | 'identity' | 'blocking' | 'structural';
  description: string;
  calculator: string;
  input: unknown;
  options?: { knowledgeAsAt?: string };
  expect: { status: 'ok' | 'blocked' | 'invalid'; result?: Record<string, unknown>; blocked_code?: string };
  source?: string | null;
  checked: string;
}

const dir = join(import.meta.dirname, 'golden');
const files = readdirSync(dir).filter((f) => f.endsWith('.yaml')).sort();

for (const file of files) {
  const doc = parse(readFileSync(join(dir, file), 'utf8')) as { cases: GoldenCase[] };
  describe(`golden: ${file}`, () => {
    for (const c of doc.cases) {
      it(`${c.id} [${c.kind}] ${c.description}`, () => {
        expect(c.checked, 'every golden case records who checked it').toBeTruthy();
        const calc = getCalculator(c.calculator);
        expect(calc, `calculator ${c.calculator} exists`).toBeDefined();
        const res = runCalculator(calc!, c.input, defaultRegistry(), c.options ?? {});
        expect(res.status, JSON.stringify(res.blocked ?? res.issues ?? res.result)).toBe(c.expect.status);
        if (c.expect.result) expect(res.result).toMatchObject(c.expect.result);
        if (c.expect.blocked_code) expect(res.blocked?.map((b) => b.code)).toContain(c.expect.blocked_code);
      });
    }
  });
}
