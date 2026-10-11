/** Display formatting for engine outputs (engine values are decimal strings; formatting is presentation only). */

const MONEY_RE = /^-?\d+\.\d{2}$/;
const NUM_RE = /^-?\d+(\.\d+)?$/;

const ACRONYMS = new Set(['lito', 'sapto', 'wato', 'help', 'ncc', 'mcb', 'sg', 'tsb', 'tbc', 'mta', 'nccc', 'dap', 'rad', 'rac', 'cshc', 'pv', 'lsbt', 'vlsbt', 'listo', 'mls', 'mpir', 'abp', 'tpd', 'fy', 'cpi', 'ati']);

const MONTHS = new Set(['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']);

export function humanize(key: string): string {
  const words = key
    .replace(/\bpct\b/, '%')
    .split('_')
    .map((w) => (ACRONYMS.has(w) ? w.toUpperCase() : w === 'pa' ? 'p.a.' : MONTHS.has(w) ? w.charAt(0).toUpperCase() + w.slice(1) : w));
  const s = words.join(' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function groupThousands(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatNumberString(s: string, dp?: number): string {
  const neg = s.startsWith('-');
  const abs = neg ? s.slice(1) : s;
  let [i, f] = abs.split('.');
  if (dp !== undefined) {
    const n = Number(abs).toFixed(dp);
    [i, f] = n.split('.');
  }
  return `${neg ? '−' : ''}${groupThousands(i ?? '0')}${f ? `.${f}` : ''}`;
}

export function isRateKey(key: string): boolean {
  return (/(^|_)(rate|factor|taper|mpir)(_|$)/.test(key) || key === 'mpir') && !/_fortnightly|_annual|rate_fortnightly|rate_annual/.test(key);
}

export function formatValue(key: string, v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toString();
  if (typeof v !== 'string') return JSON.stringify(v);
  if (key.endsWith('_pct') && NUM_RE.test(v)) return `${formatNumberString(v)}%`;
  if (isRateKey(key) && NUM_RE.test(v) && Math.abs(Number(v)) < 1) {
    const pct = (Number(v) * 100).toFixed(4).replace(/\.?0+$/, '');
    return `${pct}%`;
  }
  if (MONEY_RE.test(v)) return `$${formatNumberString(v)}`;
  if (NUM_RE.test(v)) return formatNumberString(v);
  return v;
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
