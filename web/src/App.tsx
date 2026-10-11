import { useEffect, useMemo, useState } from 'react';
import { calculators, getCalculator } from '../../src/calculators';
import { runCalculator, type CalculationResponse, type CalculatorDef, type Domain } from '../../src/core/calculator';
import { createEvidenceBundle } from '../../src/core/evidence';
import { defaultRegistry } from '../../src/params';
import { inputJsonSchema } from '../../src/api/openapi';
import { ObjectFields, type JsonSchema } from './SchemaForm';
import { ResultView } from './ResultView';
import { ParameterRegister } from './ParameterRegister';
import { downloadJson } from './format';

const DOMAINS: Array<{ id: Domain; label: string }> = [
  { id: 'tax', label: 'Personal tax' },
  { id: 'super', label: 'Superannuation' },
  { id: 'centrelink', label: 'Age Pension & Centrelink' },
  { id: 'projection', label: 'Projections' },
  { id: 'aged_care', label: 'Residential aged care' },
  { id: 'insurance', label: 'Insurance needs' },
  { id: 'debt', label: 'Loans & offset' },
];

function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash || `#/calc/${calculators[0]!.id}`);
  useEffect(() => {
    const on = () => setHash(window.location.hash || `#/calc/${calculators[0]!.id}`);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash;
}

function CalculatorPanel({ def }: { def: CalculatorDef }) {
  const schema = useMemo(() => inputJsonSchema(def) as JsonSchema, [def]);
  const [value, setValue] = useState<Record<string, unknown>>(() => structuredClone(def.example as Record<string, unknown>));
  const [knowledge, setKnowledge] = useState('');
  const [response, setResponse] = useState<CalculationResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const calculate = (input: unknown = value) => {
    const res = runCalculator(def, input, defaultRegistry(), knowledge ? { knowledgeAsAt: knowledge } : {});
    setResponse(res);
  };
  useEffect(() => {
    calculate(def.example);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestJson = JSON.stringify(value, null, 2);
  return (
    <div className="calc">
      <header className="calc-head">
        <p className="eyebrow">{DOMAINS.find((d) => d.id === def.domain)?.label}</p>
        <h2 data-testid="calc-title">{def.title}</h2>
        <p className="muted">{def.summary}</p>
      </header>
      <div className="calc-body">
        <form
          className="panel form"
          onSubmit={(e) => {
            e.preventDefault();
            calculate();
          }}
          data-testid="calc-form"
        >
          <ObjectFields schema={schema} value={value} onChange={setValue} testPrefix="in" />
          <details className="sub">
            <summary>Advanced</summary>
            <div className="field">
              <label htmlFor="knowledge">Use only parameters known on or before</label>
              <input id="knowledge" type="date" value={knowledge} onChange={(e) => setKnowledge(e.target.value)} />
              <p className="help">Reproduces what this release would have calculated with the information published by that date.</p>
            </div>
          </details>
          <div className="actions">
            <button type="submit" className="btn primary" data-testid="calculate">Calculate</button>
            <button type="button" className="btn ghost" onClick={() => { const ex = structuredClone(def.example as Record<string, unknown>); setValue(ex); calculate(ex); }}>
              Reset to example
            </button>
          </div>
          <div className="actions">
            <button
              type="button"
              className="btn ghost small"
              disabled={!response || response.status === 'invalid'}
              onClick={() => response && downloadJson(`${def.id}-evidence-${new Date().toISOString().slice(0, 10)}.json`, createEvidenceBundle(response, new Date().toISOString()))}
              data-testid="download-evidence"
            >
              Download evidence bundle
            </button>
            <button
              type="button"
              className="btn ghost small"
              onClick={() => {
                void navigator.clipboard?.writeText(`curl -s -X POST http://127.0.0.1:8787/api/v1/calculate/${def.id} -H 'Content-Type: application/json' -d '${JSON.stringify(value)}'`);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? 'Copied' : 'Copy API request'}
            </button>
          </div>
          <details className="sub">
            <summary>Request JSON</summary>
            <pre className="mono small">{requestJson}</pre>
          </details>
        </form>
        <div className="result-col">{response && <ResultView response={response} />}</div>
      </div>
    </div>
  );
}

function About() {
  return (
    <section className="panel prose">
      <h2>About this engine</h2>
      <p>
        A clean-room, open-source (Apache-2.0) <strong>reference</strong> implementation of Australian tax, superannuation, Age Pension, residential aged care,
        projection, insurance-needs and loan calculations. Every rate and threshold is an effective-dated parameter cited to a primary government or legislative
        source; each result carries its working, the parameters and sources used, its assumptions and a hash-sealed evidence bundle.
      </p>
      <h3>What it is not</h3>
      <ul>
        <li>It is not financial product advice and makes no recommendation.</li>
        <li>It is not endorsed by the ATO, ASIC, Services Australia, the Department of Social Services, the Department of Health, Disability and Ageing, or any Commonwealth agency.</li>
        <li>It does not claim regulatory compliance or fitness for advice. Licensees remain responsible for validating outputs.</li>
      </ul>
      <h3>When it refuses to calculate</h3>
      <p>
        If a needed rule or value is unverified, only available from secondary sources, in conflict, not yet published (for example 2026-27 Medicare low-income
        thresholds or 2027-28 SAPTO thresholds) or out of scope, the result is <em>Blocked</em> with the reason. The engine never estimates a missing value.
      </p>
      <h3>Not covered</h3>
      <p>
        Capital gains tax (including the 1 July 2027 reforms), negative gearing quarantining, state taxes, depreciation, Support at Home, grandfathered aged-care
        arrangements, part-year residency, product fees, premiums and research data.
      </p>
    </section>
  );
}

export function App() {
  const hash = useHashRoute();
  const [navOpen, setNavOpen] = useState(false);
  const calcId = hash.startsWith('#/calc/') ? hash.slice('#/calc/'.length) : null;
  const def = calcId ? getCalculator(calcId) : undefined;
  useEffect(() => setNavOpen(false), [hash]);
  return (
    <div className="app">
      <header className="topbar">
        <button className="btn ghost nav-toggle" aria-expanded={navOpen} aria-controls="nav" onClick={() => setNavOpen((v) => !v)}>
          Menu
        </button>
        <a className="brand" href={`#/calc/${calculators[0]!.id}`}>
          <span className="logo" aria-hidden="true" />
          Advice Calculation Engine <span className="tag">reference</span>
        </a>
        <span className="muted small topbar-note">Not financial advice · open source · sources cited</span>
      </header>
      <div className="layout">
        <nav id="nav" className={`nav ${navOpen ? 'open' : ''}`} aria-label="Calculators">
          {DOMAINS.map((d) => (
            <div key={d.id} className="nav-group">
              <h3>{d.label}</h3>
              <ul>
                {calculators
                  .filter((c) => c.domain === d.id)
                  .map((c) => (
                    <li key={c.id}>
                      <a href={`#/calc/${c.id}`} aria-current={c.id === calcId ? 'page' : undefined} data-testid={`nav-${c.id}`}>
                        {c.title}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
          <div className="nav-group">
            <h3>Reference</h3>
            <ul>
              <li><a href="#/parameters" aria-current={hash === '#/parameters' ? 'page' : undefined} data-testid="nav-parameters">Parameters &amp; sources</a></li>
              <li><a href="#/about" aria-current={hash === '#/about' ? 'page' : undefined}>About &amp; limitations</a></li>
            </ul>
          </div>
        </nav>
        <main className="main">
          {def ? <CalculatorPanel key={def.id} def={def} /> : hash === '#/parameters' ? <ParameterRegister /> : hash === '#/about' ? <About /> : <p className="panel">Not found.</p>}
        </main>
      </div>
    </div>
  );
}
