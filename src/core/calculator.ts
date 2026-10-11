/**
 * Calculator contract and runner. Every public calculation is a `CalculatorDef`: a validated input
 * schema, declared rule metadata, documented limitations and a pure `run` function. The runner
 * turns any outcome (ok, blocked, invalid input) into a stable, versioned response.
 */
import { z } from 'zod';
import { BlockedCalculation, type BlockReason } from './errors.js';
import { CalcContext, type Assumption, type ContextOptions, type ParameterUse, type TraceStep } from './context.js';
import type { ParameterRegistry } from './registry.js';
import { ENGINE_NAME, ENGINE_VERSION, RESPONSE_SCHEMA_VERSION } from '../version.js';

export type Domain =
  | 'tax'
  | 'super'
  | 'centrelink'
  | 'projection'
  | 'aged_care'
  | 'insurance'
  | 'debt';

export interface RuleMeta {
  /** Stable rule id, e.g. "au.tax.resident_scale". */
  id: string;
  /** Rule implementation version; bump when the rule's logic changes. */
  version: string;
  /** Act / instrument and section, or "convention" / "mathematics". */
  legalReference: string;
}

export interface CalculatorDef<S extends z.ZodType = z.ZodType, O = unknown> {
  id: string;
  title: string;
  domain: Domain;
  summary: string;
  input: S;
  rules: RuleMeta[];
  limitations: string[];
  /** Example request body shown in docs and the web UI. */
  example: z.input<S>;
  run(input: z.output<S>, ctx: CalcContext): O;
}

export interface InputIssue {
  path: string;
  message: string;
}

export interface CalculationResponse<O = unknown> {
  schema_version: string;
  engine: { name: string; version: string };
  parameter_release: { hash: string; currency_date: string };
  calculator: { id: string; title: string; domain: Domain };
  status: 'ok' | 'blocked' | 'invalid';
  input: unknown;
  result?: O;
  blocked?: BlockReason[];
  issues?: InputIssue[];
  trace: TraceStep[];
  parameters: ParameterUse[];
  assumptions: Assumption[];
  warnings: string[];
  limitations: string[];
  rules: RuleMeta[];
  disclaimer: string;
}

export const DISCLAIMER =
  'Reference calculation only, not financial product advice. Not endorsed by the ATO, ASIC, ' +
  'Services Australia, the Department of Health or any Commonwealth agency. Results depend on ' +
  'the inputs, the stated assumptions and the parameter release shown; users who provide advice ' +
  'remain responsible for validating outputs.';

export function defineCalculator<S extends z.ZodType, O>(def: CalculatorDef<S, O>): CalculatorDef<S, O> {
  return def;
}

export function runCalculator<S extends z.ZodType, O>(
  def: CalculatorDef<S, O>,
  rawInput: unknown,
  registry: ParameterRegistry,
  options: ContextOptions = {},
): CalculationResponse<O> {
  const ctx = new CalcContext(registry, options);
  const header = {
    schema_version: RESPONSE_SCHEMA_VERSION,
    engine: { name: ENGINE_NAME, version: ENGINE_VERSION },
    parameter_release: { hash: registry.releaseHash, currency_date: registry.currencyDate },
    calculator: { id: def.id, title: def.title, domain: def.domain },
    rules: def.rules,
    limitations: def.limitations,
    disclaimer: DISCLAIMER,
  };

  const parsed = def.input.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ...header,
      status: 'invalid',
      input: rawInput,
      issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      trace: [],
      parameters: [],
      assumptions: [],
      warnings: [],
    };
  }

  const finish = () => ({
    trace: ctx.trace,
    parameters: [...ctx.used.values()],
    assumptions: ctx.assumptions,
    warnings: ctx.warnings,
  });

  try {
    const result = def.run(parsed.data, ctx);
    return { ...header, status: 'ok', input: parsed.data, result, ...finish() };
  } catch (e) {
    if (e instanceof BlockedCalculation) {
      return { ...header, status: 'blocked', input: parsed.data, blocked: e.reasons, ...finish() };
    }
    throw e;
  }
}
