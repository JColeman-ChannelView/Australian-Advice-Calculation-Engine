/**
 * Builds the parameter release from parameters/*.yaml:
 *   1. parses and validates every record against the schema;
 *   2. enforces provenance rules (verified => a primary source; derived => derivation notes;
 *      no overlapping effective windows for one parameter);
 *   3. writes src/generated/parameters.json with a SHA-256 release hash, and
 *      docs/PARAMETERS.md (a generated coverage register).
 * Exits non-zero on any violation, so tests and builds cannot run on an invalid release.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { ParameterRecord, recordId, isUsable, type IdentifiedRecord, type ParameterBundle } from '../src/core/parameters.js';
import { canonicalJson } from '../src/core/canonical.js';
import { sha256Hex } from '../src/core/sha256.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const paramDir = join(root, 'parameters');

/** YAML numbers become decimal strings; values must never be binary floats in the bundle. */
function stringifyNumbers(v: unknown): unknown {
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) throw new Error(`non-finite number ${v}`);
    const s = String(v);
    if (/e/i.test(s)) throw new Error(`number ${s} would serialise in exponent form; quote it`);
    return s;
  }
  if (Array.isArray(v)) return v.map(stringifyNumbers);
  if (v && typeof v === 'object') {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, stringifyNumbers(x)]));
  }
  return v;
}

const errors: string[] = [];
const records: IdentifiedRecord[] = [];

const files = readdirSync(paramDir)
  .filter((f) => f.endsWith('.yaml'))
  .sort();

for (const file of files) {
  const doc = parse(readFileSync(join(paramDir, file), 'utf8'), { merge: true }) as { records?: unknown[] } | null;
  const list = doc?.records ?? [];
  list.forEach((raw, i) => {
    const r = raw as Record<string, unknown>;
    // Dates written unquoted in YAML parse as strings with the `yaml` package's core schema.
    const candidate = { ...r, value: stringifyNumbers(r.value) };
    const parsed = ParameterRecord.safeParse(candidate);
    if (!parsed.success) {
      errors.push(
        `${file}[${i}] ${String(r.name)}: ${parsed.error.issues
          .map((x) => `${x.path.join('.')}: ${x.message}`)
          .join('; ')}`,
      );
      return;
    }
    const rec = parsed.data;
    const where = `${file}: ${rec.name}@${rec.effective_from}`;
    if (rec.verification === 'verified' && !rec.sources.some((s) => s.primary)) {
      errors.push(`${where}: verified records need at least one primary source`);
    }
    if (rec.verification === 'derived' && !rec.notes) {
      errors.push(`${where}: derived records must state the derivation in notes`);
    }
    if (rec.effective_to !== null && rec.effective_to < rec.effective_from) {
      errors.push(`${where}: effective_to precedes effective_from`);
    }
    if (rec.kind === 'brackets') {
      for (let k = 1; k < rec.value.length; k++) {
        if (Number(rec.value[k]!.over) <= Number(rec.value[k - 1]!.over)) {
          errors.push(`${where}: bracket thresholds must be strictly increasing`);
        }
      }
    }
    records.push({ ...rec, id: recordId(rec) });
  });
}

// Uniqueness and overlap checks per parameter name.
const byName = new Map<string, IdentifiedRecord[]>();
for (const r of records) byName.set(r.name, [...(byName.get(r.name) ?? []), r]);
for (const [name, list] of byName) {
  list.sort((a, b) => (a.effective_from < b.effective_from ? -1 : 1));
  for (let i = 1; i < list.length; i++) {
    const prev = list[i - 1]!;
    const cur = list[i]!;
    if (prev.effective_from === cur.effective_from) {
      errors.push(`${name}: duplicate effective_from ${cur.effective_from}`);
    } else if (prev.effective_to === null || prev.effective_to >= cur.effective_from) {
      errors.push(`${name}: ${prev.id} overlaps ${cur.id}; close the earlier window`);
    }
  }
}

if (errors.length) {
  console.error(`Parameter release INVALID (${errors.length} problem(s)):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

records.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
const hash = sha256Hex(canonicalJson(records));
const currency = records.reduce((m, r) => (r.knowledge_date > m ? r.knowledge_date : m), '0000-00-00');
const bundle: ParameterBundle = {
  release: { hash, record_count: records.length, currency_date: currency },
  records,
};

mkdirSync(join(root, 'src', 'generated'), { recursive: true });
writeFileSync(join(root, 'src', 'generated', 'parameters.json'), `${JSON.stringify(bundle, null, 2)}\n`);

// Generated register for humans.
const fmt = (r: IdentifiedRecord): string => {
  switch (r.kind) {
    case 'scalar':
      return r.value;
    case 'table':
      return Object.entries(r.value)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ');
    case 'brackets':
      return r.value.map((b) => `>${b.over} @ ${b.rate}`).join('; ');
    case 'bands':
      return r.value.map((b) => `≥${b.from}: ${b.value}`).join('; ');
    case 'date_bands':
      return r.value.map((b) => `≥${b.from}: ${b.value}`).join('; ');
  }
};
const lines = [
  '# Parameter register (generated — do not edit)',
  '',
  `Generated by \`npm run params\` from \`parameters/*.yaml\`. Release hash \`${hash}\`; ${records.length} records; currency date ${currency}.`,
  '',
  'A record is **usable** only when verification is `verified` or `derived` AND legal status is enacted/instrument/administrative/convention. Anything else blocks the calculations that need it.',
  '',
  '| Parameter | Effective | Value | Verification | Legal status | Usable | Primary source |',
  '|---|---|---|---|---|---|---|',
  ...records.map((r) => {
    const src = r.sources.find((s) => s.primary) ?? r.sources[0];
    const link = src ? `[${src.title.replace(/\|/g, '/')}](${src.url})` : '—';
    return `| \`${r.name}\` | ${r.effective_from} → ${r.effective_to ?? 'open'} | ${fmt(r).replace(/\|/g, '/')} | ${r.verification} | ${r.legal_status} | ${isUsable(r) ? 'yes' : '**no**'} | ${link} |`;
  }),
  '',
];
writeFileSync(join(root, 'docs', 'PARAMETERS.md'), lines.join('\n'));
console.log(`Parameter release OK: ${records.length} records, hash ${hash.slice(0, 16)}…, currency ${currency}`);
