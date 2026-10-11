/**
 * Blocking. The engine never invents a result: when a rule or parameter needed for a calculation
 * is missing, unverified, secondary-only, in conflict, or outside its validity window, the
 * calculation is BLOCKED with machine-readable reasons instead of returning a number.
 */

export type BlockCode =
  | 'PARAMETER_MISSING' // no record covers the requested date
  | 'PARAMETER_UNVERIFIED' // record exists but is not verified against a primary source
  | 'PARAMETER_CONFLICT' // primary sources disagree
  | 'PARAMETER_NOT_ENACTED' // announced / exposure draft only
  | 'RULE_NOT_IMPLEMENTED' // the rule variant needed is outside the engine's scope
  | 'OUT_OF_SCOPE'; // inputs describe a case the engine deliberately does not model

export interface BlockReason {
  code: BlockCode;
  message: string;
  parameter?: string;
  date?: string;
  ruleId?: string;
}

export class BlockedCalculation extends Error {
  readonly reasons: BlockReason[];
  constructor(reasons: BlockReason[]) {
    super(reasons.map((r) => `${r.code}: ${r.message}`).join('; '));
    this.name = 'BlockedCalculation';
    this.reasons = reasons;
  }
}

export function block(reason: BlockReason): never {
  throw new BlockedCalculation([reason]);
}
