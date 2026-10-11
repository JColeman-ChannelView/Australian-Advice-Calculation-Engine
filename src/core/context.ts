/**
 * Calculation context: the only channel through which a rule reads parameters. It enforces the
 * verification gate (unverified / secondary / conflicting / unenacted values block the
 * calculation) and records everything needed for an evidence bundle: parameters used, trace
 * steps, assumptions and warnings. A context is created per calculation, so rules stay pure
 * (deterministic, no I/O) from the caller's point of view.
 */
import { BlockedCalculation, type BlockReason } from './errors.js';
import type { IsoDate } from './dates.js';
import { dec, type Dec } from './decimal.js';
import { isUsable, type IdentifiedRecord } from './parameters.js';
import type { ParameterRegistry } from './registry.js';

export interface TraceStep {
  /** Stable machine key, e.g. "tax.gross". */
  key: string;
  label: string;
  value: string;
  /** Human-readable working, e.g. "4,020 + 0.30 × (100,000 − 45,000)". */
  working?: string;
  ruleId?: string;
  parameters?: string[];
}

export interface Assumption {
  key: string;
  label: string;
  value: string;
  source: 'user' | 'default';
  basis?: string;
}

export interface ParameterUse {
  id: string;
  name: string;
  description: string;
  unit: string;
  value: IdentifiedRecord['value'];
  effective_from: string;
  effective_to: string | null;
  verification: IdentifiedRecord['verification'];
  legal_status: IdentifiedRecord['legal_status'];
  instrument: string;
  sources: IdentifiedRecord['sources'];
  resolved_for: string;
}

export interface ContextOptions {
  /** Only use parameter records knowable on or before this date. */
  knowledgeAsAt?: IsoDate;
}

export class CalcContext {
  readonly used = new Map<string, ParameterUse>();
  readonly trace: TraceStep[] = [];
  readonly assumptions: Assumption[] = [];
  readonly warnings: string[] = [];

  constructor(
    readonly registry: ParameterRegistry,
    readonly options: ContextOptions = {},
  ) {}

  /** Resolve a usable record or block the calculation. */
  record(name: string, date: IsoDate): IdentifiedRecord {
    const r = this.registry.find(name, date, this.options.knowledgeAsAt);
    if (!r) {
      throw new BlockedCalculation([
        {
          code: 'PARAMETER_MISSING',
          message: `No parameter record for "${name}" covers ${date}${
            this.options.knowledgeAsAt ? ` (knowledge as at ${this.options.knowledgeAsAt})` : ''
          }.`,
          parameter: name,
          date,
        },
      ]);
    }
    if (!isUsable(r)) {
      const reason: BlockReason = {
        code:
          r.verification === 'conflict'
            ? 'PARAMETER_CONFLICT'
            : r.verification === 'verified' || r.verification === 'derived'
              ? 'PARAMETER_NOT_ENACTED'
              : 'PARAMETER_UNVERIFIED',
        message: `Parameter "${name}" for ${date} is ${r.verification} / ${r.legal_status}; it cannot be used to produce a result.${
          r.notes ? ` Note: ${r.notes}` : ''
        }`,
        parameter: name,
        date,
      };
      throw new BlockedCalculation([reason]);
    }
    if (!this.used.has(r.id)) {
      this.used.set(r.id, {
        id: r.id,
        name: r.name,
        description: r.description,
        unit: r.unit,
        value: r.value,
        effective_from: r.effective_from,
        effective_to: r.effective_to,
        verification: r.verification,
        legal_status: r.legal_status,
        instrument: r.instrument,
        sources: r.sources,
        resolved_for: date,
      });
    }
    return r;
  }

  scalar(name: string, date: IsoDate): Dec {
    const r = this.record(name, date);
    if (r.kind !== 'scalar') throw new TypeError(`Parameter ${name} is ${r.kind}, expected scalar`);
    return dec(r.value);
  }

  /**
   * For non-essential checks (warnings only): the scalar if a usable record exists, otherwise
   * undefined. Never use this for a value that feeds a result.
   */
  optionalScalar(name: string, date: IsoDate): Dec | undefined {
    try {
      return this.scalar(name, date);
    } catch (e) {
      if (e instanceof BlockedCalculation) return undefined;
      throw e;
    }
  }

  table(name: string, date: IsoDate): Record<string, Dec> {
    const r = this.record(name, date);
    if (r.kind !== 'table') throw new TypeError(`Parameter ${name} is ${r.kind}, expected table`);
    return Object.fromEntries(Object.entries(r.value).map(([k, v]) => [k, dec(v)]));
  }

  tableValue(name: string, date: IsoDate, key: string): Dec {
    const t = this.table(name, date);
    const v = t[key];
    if (v === undefined) {
      throw new BlockedCalculation([
        {
          code: 'PARAMETER_MISSING',
          message: `Parameter "${name}" has no entry "${key}" for ${date}.`,
          parameter: `${name}.${key}`,
          date,
        },
      ]);
    }
    return v;
  }

  brackets(name: string, date: IsoDate): Array<{ over: Dec; rate: Dec }> {
    const r = this.record(name, date);
    if (r.kind !== 'brackets') throw new TypeError(`Parameter ${name} is ${r.kind}, expected brackets`);
    return r.value.map((b) => ({ over: dec(b.over), rate: dec(b.rate) }));
  }

  bands(name: string, date: IsoDate): Array<{ from: Dec; value: Dec }> {
    const r = this.record(name, date);
    if (r.kind !== 'bands') throw new TypeError(`Parameter ${name} is ${r.kind}, expected bands`);
    return r.value.map((b) => ({ from: dec(b.from), value: dec(b.value) }));
  }

  dateBands(name: string, date: IsoDate): Array<{ from: IsoDate; value: Dec }> {
    const r = this.record(name, date);
    if (r.kind !== 'date_bands') throw new TypeError(`Parameter ${name} is ${r.kind}, expected date_bands`);
    return r.value.map((b) => ({ from: b.from, value: dec(b.value) }));
  }

  step(step: TraceStep): void {
    this.trace.push(step);
  }

  assume(a: Assumption): void {
    this.assumptions.push(a);
  }

  warn(message: string): void {
    if (!this.warnings.includes(message)) this.warnings.push(message);
  }
}
