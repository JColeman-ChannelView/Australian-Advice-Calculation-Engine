import type { CalculationResponse } from '../../src/core/calculator';
import { formatValue, humanize } from './format';
import { ProjectionChart } from './ProjectionChart';

function isRowArray(v: unknown): v is Array<Record<string, unknown>> {
  return Array.isArray(v) && v.length > 0 && v.every((x) => x && typeof x === 'object' && !Array.isArray(x));
}

function DataTable({ rows, caption }: { rows: Array<Record<string, unknown>>; caption: string }) {
  const cols = Object.keys(rows[0] ?? {});
  return (
    <div className="table-scroll">
      <table className="data">
        <caption>{caption}</caption>
        <thead>
          <tr>{cols.map((c) => <th key={c} scope="col">{humanize(c)}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{cols.map((c) => <td key={c} className={typeof r[c] === 'string' && /^-?\d/.test(String(r[c])) ? 'num' : ''}>{formatValue(c, r[c])}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultFields({ result }: { result: Record<string, unknown> }) {
  const scalars = Object.entries(result).filter(([, v]) => !isRowArray(v) && !(v && typeof v === 'object' && !Array.isArray(v)));
  const objects = Object.entries(result).filter(([, v]) => v && typeof v === 'object' && !Array.isArray(v)) as Array<[string, Record<string, unknown>]>;
  const tables = Object.entries(result).filter(([, v]) => isRowArray(v)) as Array<[string, Array<Record<string, unknown>>]>;
  return (
    <>
      <dl className="kv" data-testid="result">
        {scalars.map(([k, v]) => (
          <div key={k} className="kv-row" data-key={k}>
            <dt>{humanize(k)}</dt>
            <dd>{Array.isArray(v) ? (v.length ? v.join(', ') : '—') : formatValue(k, v)}</dd>
          </div>
        ))}
      </dl>
      {objects.map(([k, o]) => (
        <section key={k} className="sub">
          <h4>{humanize(k)}</h4>
          <ResultFields result={o} />
        </section>
      ))}
      {tables.map(([k, rows]) => (
        <details key={k} className="sub" open={rows.length <= 12}>
          <summary>{humanize(k)} ({rows.length})</summary>
          <DataTable rows={rows} caption={humanize(k)} />
        </details>
      ))}
    </>
  );
}

export function ResultView({ response }: { response: CalculationResponse }) {
  const r = response;
  const result = (r.result ?? {}) as Record<string, unknown>;
  return (
    <section className="result" aria-live="polite" data-testid="result-panel" data-status={r.status}>
      <header className="result-head">
        <span className={`badge status-${r.status}`} data-testid="status">
          {r.status === 'ok' ? '✓ Calculated' : r.status === 'blocked' ? '⛔ Blocked' : '⚠ Invalid input'}
        </span>
        <span className="muted small">
          engine {r.engine.version} · parameters {r.parameter_release.hash.slice(0, 12)} · currency {r.parameter_release.currency_date}
        </span>
      </header>

      {r.status === 'invalid' && (
        <ul className="notice warn" data-testid="issues">
          {r.issues?.map((i, k) => <li key={k}><code>{i.path || '(input)'}</code> {i.message}</li>)}
        </ul>
      )}
      {r.status === 'blocked' && (
        <div className="notice block" data-testid="blocked">
          <p><strong>This calculation was not performed.</strong> The engine will not estimate a result when a rule or parameter is missing, unverified or out of scope.</p>
          <ul>{r.blocked?.map((b, k) => <li key={k}><code>{b.code}</code> {b.message}</li>)}</ul>
        </div>
      )}
      {r.status === 'ok' && (
        <>
          {r.calculator.id === 'projection.super' && Array.isArray(result.rows) && (
            <ProjectionChart rows={result.rows as never} retirementAge={Number(result.retirement_age)} />
          )}
          <ResultFields result={result} />
        </>
      )}

      {r.warnings.length > 0 && (
        <ul className="notice warn">
          {r.warnings.map((w, k) => <li key={k}>{w}</li>)}
        </ul>
      )}

      {r.trace.length > 0 && (
        <details className="sub" open>
          <summary>Working ({r.trace.length} steps)</summary>
          <ol className="trace">
            {r.trace.map((t, k) => (
              <li key={k}>
                <div className="trace-line"><span>{t.label}</span><strong>{formatValue(t.key, t.value)}</strong></div>
                {t.working && <div className="muted small mono">{t.working}</div>}
              </li>
            ))}
          </ol>
        </details>
      )}

      {r.parameters.length > 0 && (
        <details className="sub">
          <summary>Parameters and sources ({r.parameters.length})</summary>
          <ul className="params">
            {r.parameters.map((p) => (
              <li key={p.id}>
                <div><code>{p.name}</code> <span className={`badge v-${p.verification}`}>{p.verification}</span> <span className="muted small">{p.effective_from} → {p.effective_to ?? 'open'}</span></div>
                <div className="small">{p.description}</div>
                <div className="small muted">{p.instrument}</div>
                {p.sources.map((s, k) => (
                  <div key={k} className="small">
                    <a href={s.url} target="_blank" rel="noreferrer noopener">{s.title}</a>
                    {s.locator && <span className="muted"> — {s.locator}</span>}
                    {!s.primary && <span className="badge v-secondary">secondary</span>}
                  </div>
                ))}
              </li>
            ))}
          </ul>
        </details>
      )}

      {r.assumptions.length > 0 && (
        <details className="sub">
          <summary>Assumptions ({r.assumptions.length})</summary>
          <table className="data compact">
            <tbody>
              {r.assumptions.map((a, k) => (
                <tr key={k}><th scope="row">{a.label}</th><td>{formatValue(a.key, a.value)}</td><td className="muted">{a.source === 'user' ? 'your input' : 'default'}{a.basis ? ` — ${a.basis}` : ''}</td></tr>
              ))}
            </tbody>
          </table>
        </details>
      )}

      <details className="sub">
        <summary>Rules and limitations</summary>
        <ul className="small">{r.rules.map((x) => <li key={x.id}><code>{x.id}</code> v{x.version} — {x.legalReference}</li>)}</ul>
        <ul className="small">{r.limitations.map((x, k) => <li key={k}>{x}</li>)}</ul>
      </details>
      <p className="disclaimer small">{r.disclaimer}</p>
    </section>
  );
}
