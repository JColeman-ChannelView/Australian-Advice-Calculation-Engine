/**
 * Renders a form from a calculator's JSON Schema (generated from its zod input schema), so the UI
 * never drifts from the engine's validation. Amounts and rates are kept as typed strings and passed
 * to the engine unchanged (the engine parses them as decimals).
 */
import { useId } from 'react';
import { humanize } from './format';

export type JsonSchema = {
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: unknown[];
  anyOf?: JsonSchema[];
  default?: unknown;
  description?: string;
  format?: string;
  minimum?: number;
  maximum?: number;
  maxItems?: number;
  minItems?: number;
  'x-kind'?: string;
};

type Value = unknown;
const FY_OPTIONS = ['2019-20', '2020-21', '2021-22', '2022-23', '2023-24', '2024-25', '2025-26', '2026-27', '2027-28'];

function kindOf(s: JsonSchema): string {
  if (s['x-kind']) return s['x-kind'];
  if (s.enum) return 'enum';
  if (s.format === 'date') return 'date';
  const t = Array.isArray(s.type) ? s.type[0] : s.type;
  return t ?? 'unknown';
}

function emptyFor(s: JsonSchema): Value {
  const k = kindOf(s);
  if (k === 'object') {
    const o: Record<string, Value> = {};
    for (const r of s.required ?? []) if (s.properties?.[r]) o[r] = emptyFor(s.properties[r]!);
    return o;
  }
  if (k === 'array') return [];
  if (k === 'boolean') return false;
  if (k === 'enum') return s.enum?.[0];
  if (k === 'integer' || k === 'number') return s.default ?? s.minimum ?? 0;
  return '';
}

interface FieldProps {
  name: string;
  schema: JsonSchema;
  value: Value;
  required: boolean;
  onChange: (v: Value | undefined) => void;
  testId: string;
}

function Field({ name, schema, value, required, onChange, testId }: FieldProps) {
  const id = useId();
  const kind = kindOf(schema);
  const label = humanize(name);
  const help = schema.description;
  const placeholder = schema.default !== undefined ? `default ${String(schema.default)}` : required ? '' : 'optional';

  if (kind === 'object') {
    const present = value !== undefined && value !== null;
    return (
      <fieldset className="fs" data-testid={testId}>
        <legend>
          {!required && (
            <input type="checkbox" checked={present} aria-label={`Include ${label}`} onChange={(e) => onChange(e.target.checked ? emptyFor(schema) : undefined)} />
          )}{' '}
          {label}
        </legend>
        {help && <p className="help">{help}</p>}
        {present && <ObjectFields schema={schema} value={value as Record<string, Value>} onChange={onChange} testPrefix={testId} />}
      </fieldset>
    );
  }

  if (kind === 'array') {
    const arr = Array.isArray(value) ? value : [];
    const item = schema.items ?? {};
    const max = schema.maxItems ?? 20;
    return (
      <fieldset className="fs" data-testid={testId}>
        <legend>{label}</legend>
        {help && <p className="help">{help}</p>}
        {arr.map((v, i) => (
          <div className="array-row" key={i}>
            <div className="array-item">
              <Field name={`${name.replace(/s$/, '')} ${i + 1}`} schema={item} value={v} required onChange={(nv) => onChange(arr.map((x, j) => (j === i ? nv : x)))} testId={`${testId}.${i}`} />
            </div>
            <button type="button" className="btn ghost small" onClick={() => onChange(arr.filter((_, j) => j !== i))} aria-label={`Remove ${label} ${i + 1}`}>
              Remove
            </button>
          </div>
        ))}
        {arr.length < max && (
          <button type="button" className="btn ghost small" onClick={() => onChange([...arr, emptyFor(item)])}>
            + Add
          </button>
        )}
      </fieldset>
    );
  }

  let control: React.ReactNode;
  if (kind === 'boolean') {
    return (
      <div className="field check">
        <label htmlFor={id}>
          <input id={id} type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} data-testid={testId} />
          <span>{label}</span>
        </label>
        {help && <p className="help">{help}</p>}
      </div>
    );
  } else if (kind === 'enum') {
    control = (
      <select id={id} value={String(value ?? '')} onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)} data-testid={testId}>
        {!required && <option value="">{placeholder || '—'}</option>}
        {(schema.enum ?? []).map((o) => (
          <option key={String(o)} value={String(o)}>
            {humanize(String(o))}
          </option>
        ))}
      </select>
    );
  } else if (kind === 'financial-year') {
    control = (
      <select id={id} value={String(value ?? '')} onChange={(e) => onChange(e.target.value || undefined)} data-testid={testId}>
        {!required && <option value="">—</option>}
        {FY_OPTIONS.map((fy) => (
          <option key={fy} value={fy}>
            {fy}
          </option>
        ))}
      </select>
    );
  } else if (kind === 'date') {
    control = <input id={id} type="date" value={String(value ?? '')} onChange={(e) => onChange(e.target.value || undefined)} data-testid={testId} />;
  } else if (kind === 'integer' || kind === 'number') {
    control = (
      <input
        id={id}
        type="number"
        step={kind === 'integer' ? 1 : 'any'}
        min={schema.minimum}
        max={schema.maximum}
        value={value === undefined || value === null ? '' : String(value)}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        data-testid={testId}
      />
    );
  } else {
    // amount / rate / signed-amount / plain string: keep the typed text
    const isRate = kind === 'rate';
    control = (
      <div className={isRate ? 'affix rate' : kind === 'amount' || kind === 'signed-amount' ? 'affix money' : ''}>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value === undefined || value === null ? '' : String(value)}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value.trim() === '' ? undefined : e.target.value.replace(/[,\s$]/g, ''))}
          data-testid={testId}
        />
      </div>
    );
  }
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && <span className="req" aria-hidden="true"> *</span>}
        {kind === 'rate' && <span className="unit"> (fraction, e.g. 0.05 = 5%)</span>}
      </label>
      {control}
      {help && <p className="help">{help}</p>}
    </div>
  );
}

export function ObjectFields({ schema, value, onChange, testPrefix }: { schema: JsonSchema; value: Record<string, Value>; onChange: (v: Record<string, Value>) => void; testPrefix: string }) {
  const req = new Set(schema.required ?? []);
  return (
    <div className="fields">
      {Object.entries(schema.properties ?? {}).map(([k, s]) => (
        <Field
          key={k}
          name={k}
          schema={s}
          value={value?.[k]}
          required={req.has(k) && s.default === undefined}
          testId={`${testPrefix}.${k}`}
          onChange={(nv) => {
            const next = { ...value };
            if (nv === undefined) delete next[k];
            else next[k] = nv;
            onChange(next);
          }}
        />
      ))}
    </div>
  );
}
