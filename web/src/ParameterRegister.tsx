import { useMemo, useState } from 'react';
import { bundledParameters } from '../../src/params';
import { isUsable, type IdentifiedRecord } from '../../src/core/parameters';

function compact(r: IdentifiedRecord): string {
  switch (r.kind) {
    case 'scalar':
      return r.value;
    case 'table':
      return Object.entries(r.value).map(([k, v]) => `${k}: ${v}`).join(' · ');
    case 'brackets':
      return r.value.map((b) => `>${b.over} @ ${b.rate}`).join(' · ');
    case 'bands':
    case 'date_bands':
      return r.value.map((b) => `≥${b.from}: ${b.value}`).join(' · ');
  }
}

export function ParameterRegister() {
  const [q, setQ] = useState('');
  const records = useMemo(() => {
    const s = q.trim().toLowerCase();
    return bundledParameters.records.filter((r) => !s || r.name.includes(s) || r.description.toLowerCase().includes(s));
  }, [q]);
  const rel = bundledParameters.release;
  return (
    <section className="panel" data-testid="register">
      <h2>Parameters and sources</h2>
      <p className="muted">
        Release <code>{rel.hash.slice(0, 16)}…</code> · {rel.record_count} records · currency {rel.currency_date}. A record is usable only when verified against a primary
        government or legislative source (or derived exactly from verified values) and in force; anything else blocks the calculations that need it.
      </p>
      <input className="search" type="search" placeholder="Filter by name or description" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter parameters" />
      <div className="table-scroll">
        <table className="data">
          <thead>
            <tr><th>Parameter</th><th>Effective</th><th>Value</th><th>Status</th><th>Source</th></tr>
          </thead>
          <tbody>
            {records.map((r) => {
              const src = r.sources.find((s) => s.primary) ?? r.sources[0];
              return (
                <tr key={r.id}>
                  <td><code>{r.name}</code><div className="small muted">{r.description}</div></td>
                  <td className="nowrap small">{r.effective_from}<br />→ {r.effective_to ?? 'open'}</td>
                  <td className="small mono wrap">{compact(r)}</td>
                  <td>
                    <span className={`badge v-${r.verification}`}>{r.verification}</span>
                    <div className="small muted">{r.legal_status}{isUsable(r) ? '' : ' · blocked'}</div>
                  </td>
                  <td className="small">{src ? <a href={src.url} target="_blank" rel="noreferrer noopener">{src.title}</a> : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
