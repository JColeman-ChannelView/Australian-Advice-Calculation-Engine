/**
 * Balance-over-age line chart: nominal vs today's dollars (two series, palette slots 1–2,
 * validated light and dark). Legend + direct end labels, crosshair tooltip, recessive grid;
 * the full year table below is the table view.
 */
import { useMemo, useRef, useState } from 'react';

interface Row {
  age: number;
  phase: string;
  closing_balance: string;
  closing_balance_today_dollars: string;
}

const W = 760;
const H = 300;
const M = { top: 16, right: 120, bottom: 36, left: 64 };

function niceMax(v: number): number {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}

function compactMoney(v: number): string {
  if (v >= 1e6) return `$${(v / 1e6).toFixed(v >= 1e7 ? 0 : 1)}m`;
  if (v >= 1e3) return `$${Math.round(v / 1e3)}k`;
  return `$${Math.round(v)}`;
}

const fullMoney = (v: number) => `$${Math.round(v).toLocaleString('en-AU')}`;

export function ProjectionChart({ rows, retirementAge }: { rows: Row[]; retirementAge: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const data = useMemo(() => rows.map((r) => ({ age: r.age + 1, nominal: Number(r.closing_balance), real: Number(r.closing_balance_today_dollars) })), [rows]);
  if (data.length < 2) return null;
  const x0 = data[0]!.age;
  const x1 = data[data.length - 1]!.age;
  const yMax = niceMax(Math.max(...data.map((d) => Math.max(d.nominal, d.real))));
  const iw = W - M.left - M.right;
  const ih = H - M.top - M.bottom;
  const sx = (a: number) => M.left + ((a - x0) / Math.max(1, x1 - x0)) * iw;
  const sy = (v: number) => M.top + ih - (v / yMax) * ih;
  const path = (k: 'nominal' | 'real') => data.map((d, i) => `${i ? 'L' : 'M'}${sx(d.age).toFixed(1)},${sy(d[k]).toFixed(1)}`).join('');
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * yMax);
  const step = Math.max(1, Math.ceil((x1 - x0) / 8));
  const xTicks: number[] = [];
  for (let a = x0; a <= x1; a += step) xTicks.push(a);
  const last = data[data.length - 1]!;
  const labelNom = sy(last.nominal);
  let labelReal = sy(last.real);
  if (Math.abs(labelNom - labelReal) < 14) labelReal = labelNom + (labelReal >= labelNom ? 14 : -14);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const age = x0 + ((px - M.left) / iw) * (x1 - x0);
    const idx = Math.round(age - x0);
    setHover(idx >= 0 && idx < data.length ? idx : null);
  };
  const h = hover !== null ? data[hover] : null;

  return (
    <figure className="viz-root chart" aria-label="Projected super balance by age">
      <figcaption className="chart-head">
        <span className="chart-title">Projected balance by age</span>
        <span className="legend" role="list">
          <span role="listitem"><i className="sw s1" /> Nominal dollars</span>
          <span role="listitem"><i className="sw s2" /> Today&rsquo;s dollars</span>
        </span>
      </figcaption>
      <div className="chart-wrap">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="img" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={M.left} x2={M.left + iw} y1={sy(t)} y2={sy(t)} className="grid" />
              <text x={M.left - 8} y={sy(t)} className="tick" textAnchor="end" dominantBaseline="middle">
                {compactMoney(t)}
              </text>
            </g>
          ))}
          {xTicks.map((a) => (
            <text key={a} x={sx(a)} y={M.top + ih + 20} className="tick" textAnchor="middle">
              {a}
            </text>
          ))}
          <text x={M.left + iw / 2} y={H - 4} className="axis-label" textAnchor="middle">
            Age
          </text>
          {retirementAge > x0 && retirementAge < x1 && (
            <g>
              <line x1={sx(retirementAge)} x2={sx(retirementAge)} y1={M.top} y2={M.top + ih} className="marker" />
              <text x={sx(retirementAge) + 4} y={M.top + 10} className="tick">
                Retire at {retirementAge}
              </text>
            </g>
          )}
          <path d={path('nominal')} className="line s1" />
          <path d={path('real')} className="line s2" />
          <text x={sx(last.age) + 8} y={labelNom} className="end-label" dominantBaseline="middle">
            {compactMoney(last.nominal)} nominal
          </text>
          <text x={sx(last.age) + 8} y={labelReal} className="end-label" dominantBaseline="middle">
            {compactMoney(last.real)} today
          </text>
          {h && (
            <g pointerEvents="none">
              <line x1={sx(h.age)} x2={sx(h.age)} y1={M.top} y2={M.top + ih} className="crosshair" />
              <circle cx={sx(h.age)} cy={sy(h.nominal)} r={5} className="dot s1" />
              <circle cx={sx(h.age)} cy={sy(h.real)} r={5} className="dot s2" />
            </g>
          )}
          <rect x={M.left} y={M.top} width={iw} height={ih} fill="transparent" />
        </svg>
        {h && (
          <div className="tooltip" style={{ left: `${(sx(h.age) / W) * 100}%` }} role="status">
            <strong>End of age {h.age - 1} year</strong>
            <span><i className="sw s1" /> {fullMoney(h.nominal)}</span>
            <span><i className="sw s2" /> {fullMoney(h.real)}</span>
          </div>
        )}
      </div>
    </figure>
  );
}
