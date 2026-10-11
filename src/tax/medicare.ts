import { z } from 'zod';
import { defineCalculator, type RuleMeta } from '../core/calculator.js';
import type { CalcContext } from '../core/context.js';
import { block } from '../core/errors.js';
import { cents, dec, min, money, toJson, ZERO, type Dec } from '../core/decimal.js';
import { fyStart } from '../core/dates.js';
import { amount, financialYear } from '../core/inputs.js';
import { fmt } from './scale.js';

export const RULE_MEDICARE: RuleMeta = {
  id: 'au.tax.medicare_levy',
  version: '1.0.0',
  legalReference: 'Medicare Levy Act 1986 ss6, 7 (individual low-income reduction); s8 family reduction NOT implemented',
};
export const RULE_MLS_TIER: RuleMeta = {
  id: 'au.tax.mls_tier',
  version: '1.0.0',
  legalReference: 'Medicare Levy Act 1986 ss8B-8G; A New Tax System (Medicare Levy Surcharge—Fringe Benefits) Act 1999',
};

export interface MedicareFamily {
  family_income: Dec;
  dependent_children: number;
}

/**
 * Medicare levy for a full-year resident:
 *   levy = 0 if TI <= lower threshold, else min(2% × TI, 10% × (TI − lower threshold)).
 * The lower threshold is the SAPTO threshold for people entitled to SAPTO.
 * The s8 family reduction is not implemented: if the person has a spouse or dependants and the
 * family income is within the family phase-in range, the calculation is BLOCKED (not guessed).
 * Rounded to cents, half-up (engine convention; the ATO example "Angie" is exact to the cent).
 */
export function medicareLevy(ctx: CalcContext, fy: string, ti: Dec, saptoEligible: boolean, family: MedicareFamily | null): Dec {
  const at = fyStart(fy);
  const rate = ctx.scalar('tax.medicare.levy_rate', at);
  const phaseIn = ctx.scalar('tax.medicare.phase_in_rate', at);
  const lower = ctx.tableValue('tax.medicare.low_income_thresholds', at, saptoEligible ? 'single_sapto_lower' : 'single_lower');
  const full = rate.mul(ti);
  let levy: Dec;
  let working: string;
  if (ti.lte(lower)) {
    levy = ZERO;
    working = `taxable income ${fmt(ti)} ≤ low-income threshold ${fmt(lower)}`;
  } else {
    const shaded = phaseIn.mul(ti.minus(lower));
    levy = min(full, shaded);
    working = `min(${rate.mul(100).toFixed()}% × ${fmt(ti)}, ${phaseIn.mul(100).toFixed()}% × (${fmt(ti)} − ${fmt(lower)}))`;
  }

  if (family && levy.gt(0)) {
    const upperKey = saptoEligible ? 'family_sapto_upper' : 'family_upper';
    const familyUpper = ctx
      .tableValue('tax.medicare.low_income_thresholds', at, upperKey)
      .plus(ctx.tableValue('tax.medicare.low_income_thresholds', at, 'family_child_upper').mul(family.dependent_children));
    if (family.family_income.lte(familyUpper)) {
      block({
        code: 'RULE_NOT_IMPLEMENTED',
        message: `Family income ${fmt(family.family_income)} is within the family phase-in range (≤ ${fmt(familyUpper)}); the Medicare Levy Act s8 family reduction is not implemented in this release (an official ATO family example could not be reproduced).`,
        ruleId: RULE_MEDICARE.id,
      });
    }
    working += `; family income ${fmt(family.family_income)} exceeds family upper threshold ${fmt(familyUpper)}, so no family reduction`;
  }

  const result = cents(levy, 'half_up');
  ctx.step({
    key: 'tax.medicare_levy',
    label: `Medicare levy ${fy}`,
    value: money(result),
    working,
    ruleId: RULE_MEDICARE.id,
  });
  return result;
}

const FamilySchema = z
  .object({
    family_income: amount('Combined taxable income of the person and spouse (AUD)'),
    dependent_children: z.number().int().min(0).max(30).default(0).describe('Number of dependent children'),
  })
  .describe('Supply if the person had a spouse or dependent children');

const MedicareInput = z.object({
  financial_year: financialYear(),
  taxable_income: amount('Taxable income (AUD)'),
  sapto_eligible: z.boolean().default(false).describe('Entitled to the seniors and pensioners tax offset (uses SAPTO thresholds)'),
  family: FamilySchema.optional(),
});

export const medicareCalculator = defineCalculator({
  id: 'tax.medicare_levy',
  title: 'Medicare levy (with low-income reduction)',
  domain: 'tax',
  summary: 'Medicare levy at 2% with the individual low-income phase-in for a full-year resident.',
  input: MedicareInput,
  rules: [RULE_MEDICARE],
  limitations: [
    'Family low-income reduction (Medicare Levy Act s8) is not implemented: such cases are blocked, not estimated.',
    'Exemptions (e.g. foreign residents, Defence Force, certain medical categories) and part-year exemptions are not modelled.',
    '2026-27 low-income thresholds had not been published as at the parameter currency date, so 2026-27 calculations block.',
  ],
  example: { financial_year: '2025-26', taxable_income: 29000 },
  run(input, ctx) {
    const family = input.family
      ? { family_income: dec(input.family.family_income), dependent_children: input.family.dependent_children }
      : null;
    const levy = medicareLevy(ctx, input.financial_year, dec(input.taxable_income), input.sapto_eligible, family);
    return { medicare_levy: money(levy) };
  },
});

const MlsInput = z.object({
  financial_year: financialYear(),
  income_for_mls: amount('Income for Medicare levy surcharge purposes (AUD), computed per the ATO definition'),
  family: z.boolean().default(false).describe('Family status for MLS (spouse and/or dependent children)'),
  dependent_children: z.number().int().min(0).max(30).default(0).describe('MLS dependent children'),
  private_hospital_cover: z.boolean().describe('Held an appropriate level of private patient hospital cover for the whole year'),
});

export const mlsTierCalculator = defineCalculator({
  id: 'tax.mls_tier',
  title: 'Medicare levy surcharge tier',
  domain: 'tax',
  summary: 'Determines the Medicare levy surcharge income tier and rate. The surcharge amount itself is not computed.',
  input: MlsInput,
  rules: [RULE_MLS_TIER],
  limitations: [
    'Returns the tier and rate only. The base the rate applies to and part-year cover apportionment are not modelled.',
    'Income for MLS purposes must be computed by the user.',
  ],
  example: { financial_year: '2026-27', income_for_mls: 130000, family: false, dependent_children: 0, private_hospital_cover: false },
  run(input, ctx) {
    const at = fyStart(input.financial_year);
    const name = 'tax.medicare.surcharge_tiers';
    const income = dec(input.income_for_mls);
    const prefix = input.family ? 'family' : 'single';
    let base = ctx.tableValue(name, at, `${prefix}_base_max`);
    let t1 = ctx.tableValue(name, at, `${prefix}_t1_max`);
    let t2 = ctx.tableValue(name, at, `${prefix}_t2_max`);
    if (input.family && input.dependent_children > 1) {
      const inc = ctx.tableValue(name, at, 'family_child_increment').mul(input.dependent_children - 1);
      base = base.plus(inc);
      t1 = t1.plus(inc);
      t2 = t2.plus(inc);
    }
    const tier = income.lte(base) ? 0 : income.lte(t1) ? 1 : income.lte(t2) ? 2 : 3;
    const tierRate = tier === 0 ? ZERO : ctx.tableValue(name, at, `rate_t${tier}`);
    const applies = !input.private_hospital_cover && tier > 0;
    ctx.step({
      key: 'tax.mls_tier',
      label: `MLS tier ${input.financial_year}`,
      value: String(tier),
      working: `income for MLS ${fmt(income)}; thresholds base ≤ ${fmt(base)}, tier 1 ≤ ${fmt(t1)}, tier 2 ≤ ${fmt(t2)}`,
      ruleId: RULE_MLS_TIER.id,
    });
    return {
      tier,
      tier_rate: toJson(tierRate),
      surcharge_applies: applies,
      thresholds: { base_max: toJson(base), tier1_max: toJson(t1), tier2_max: toJson(t2) },
    };
  },
});
