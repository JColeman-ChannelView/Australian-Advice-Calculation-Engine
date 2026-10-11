import { z } from 'zod';
import { defineCalculator, type RuleMeta } from '../core/calculator.js';
import { cents, dec, max, money, ONE, toJson, ZERO, type Dec } from '../core/decimal.js';
import { amount, isoDate, rate } from '../core/inputs.js';
import { fmt } from '../tax/scale.js';

export const RULE_NEEDS: RuleMeta = {
  id: 'au.insurance.needs_based',
  version: '1.0.0',
  legalReference: 'Convention — no Commonwealth statute or ASIC instrument prescribes an insurance-needs method',
};
export const RULE_MULTIPLE: RuleMeta = {
  id: 'au.insurance.income_multiple',
  version: '1.0.0',
  legalReference: 'Convention — income multiple k is a heuristic, not law',
};

/**
 * Present value of a level stream indexed at g and discounted at d, paid at the START of each
 * year (annuity-due convention), for n whole years beginning `deferYears` from now:
 *   PV = Σ_{t=defer}^{defer+n−1} CF × (1+g)^t / (1+d)^t
 */
export function pvStream(cf: Dec, years: number, g: Dec, d: Dec, deferYears = 0): Dec {
  let pv = ZERO;
  for (let t = deferYears; t < deferYears + years; t++) {
    pv = pv.plus(cf.mul(ONE.plus(g).pow(t)).div(ONE.plus(d).pow(t)));
  }
  return pv;
}

const Stream = z.object({
  label: z.string().max(80).default('Ongoing cost'),
  annual_amount: amount('Annual amount in today’s dollars (AUD)'),
  years: z.number().int().min(0).max(80).describe('Number of years paid'),
  start_in_years: z.number().int().min(0).max(80).default(0).describe('Years from now until the first payment'),
});

const NeedsInput = z.object({
  calculation_date: isoDate('Date of the calculation (selects the default indexation rate)'),
  cover_type: z.enum(['life', 'tpd', 'trauma']).default('life').describe('Cover being analysed (labels only; the method is the same)'),
  debts_to_repay: amount('Debts to repay immediately (AUD)').default('0'),
  immediate_costs: amount('Funeral, medical, home modification and other immediate costs (AUD)').default('0'),
  emergency_reserve: amount('Emergency or contingency reserve (AUD)').default('0'),
  income_replacement: z
    .object({
      annual_amount: amount('Annual income to replace in today’s dollars (AUD)'),
      years: z.number().int().min(0).max(60).describe('Years of income to replace'),
    })
    .optional(),
  other_streams: z.array(Stream).max(20).default([]).describe('Dependants’ education, care and other ongoing costs'),
  indexation_rate: rate('Indexation of ongoing amounts p.a. (default: 2.5%, the ASIC generic-calculator inflation rate)').optional(),
  discount_rate: rate('Discount rate p.a. for present values (user choice; no prescribed default)'),
  liquid_assets: amount('Liquid assets available to meet needs (AUD)').default('0'),
  existing_cover: amount('Existing cover of this type, including through super (AUD)').default('0'),
  other_offsets: amount('Other amounts available (e.g. super death benefit not counted above) (AUD)').default('0'),
});

export const needsCalculator = defineCalculator({
  id: 'insurance.needs',
  title: 'Insurance needs analysis (capital needs)',
  domain: 'insurance',
  summary: 'Capital-needs method: immediate needs plus present value of income replacement and dependants’ costs, less liquid assets and existing cover.',
  input: NeedsInput,
  rules: [RULE_NEEDS],
  limitations: [
    'This is a configurable convention, not an authoritative or regulator-prescribed method.',
    'Tax on benefits (inside vs outside super, dependant status), Age Pension offsets, mortality/survival weighting and premium affordability are not modelled.',
    'Ongoing amounts are paid at the start of each year (annuity-due).',
  ],
  example: {
    calculation_date: '2026-10-11',
    debts_to_repay: 450000,
    immediate_costs: 20000,
    emergency_reserve: 10000,
    income_replacement: { annual_amount: 60000, years: 15 },
    other_streams: [{ label: 'School fees', annual_amount: 15000, years: 10, start_in_years: 0 }],
    discount_rate: 0.05,
    liquid_assets: 30000,
    existing_cover: 300000,
  },
  run(input, ctx) {
    const g = input.indexation_rate !== undefined ? dec(input.indexation_rate) : ctx.scalar('projection.asic_generic.inflation', input.calculation_date);
    const d = dec(input.discount_rate);
    ctx.assume({ key: 'indexation_rate', label: 'Indexation of ongoing amounts', value: toJson(g), source: input.indexation_rate !== undefined ? 'user' : 'default', basis: 'ASIC Instrument 2026/41 inflation rate used as a convention' });
    ctx.assume({ key: 'discount_rate', label: 'Discount rate', value: toJson(d), source: 'user' });
    const immediate = dec(input.debts_to_repay).plus(dec(input.immediate_costs)).plus(dec(input.emergency_reserve));
    ctx.step({ key: 'insurance.immediate', label: 'Immediate capital needs', value: money(cents(immediate)), working: `${fmt(dec(input.debts_to_repay))} + ${fmt(dec(input.immediate_costs))} + ${fmt(dec(input.emergency_reserve))}`, ruleId: RULE_NEEDS.id });
    let incomePv = ZERO;
    if (input.income_replacement) {
      incomePv = pvStream(dec(input.income_replacement.annual_amount), input.income_replacement.years, g, d);
      ctx.step({ key: 'insurance.income_pv', label: 'PV of income replacement', value: money(cents(incomePv)), working: `${fmt(dec(input.income_replacement.annual_amount))} p.a. for ${input.income_replacement.years} years, indexed ${g.toFixed()}, discounted ${d.toFixed()}`, ruleId: RULE_NEEDS.id });
    }
    let streamsPv = ZERO;
    const streams = input.other_streams.map((s) => {
      const pv = pvStream(dec(s.annual_amount), s.years, g, d, s.start_in_years);
      streamsPv = streamsPv.plus(pv);
      return { label: s.label, present_value: money(cents(pv)) };
    });
    const totalNeed = immediate.plus(incomePv).plus(streamsPv);
    const offsets = dec(input.liquid_assets).plus(dec(input.existing_cover)).plus(dec(input.other_offsets));
    const shortfall = max(0, totalNeed.minus(offsets));
    ctx.step({ key: 'insurance.shortfall', label: 'Cover shortfall', value: money(cents(shortfall)), working: `max(0, need ${fmt(cents(totalNeed))} − offsets ${fmt(offsets)})`, ruleId: RULE_NEEDS.id });
    return {
      cover_type: input.cover_type,
      immediate_needs: money(cents(immediate)),
      income_replacement_pv: money(cents(incomePv)),
      other_streams: streams,
      total_need: money(cents(totalNeed)),
      offsets: money(offsets),
      shortfall: money(cents(shortfall)),
    };
  },
});

const MultipleInput = z.object({
  annual_income: amount('Gross annual income (AUD)'),
  multiple: z.number().min(0).max(30).describe('Income multiple k (convention, e.g. 10)'),
  existing_cover: amount('Existing cover (AUD)').default('0'),
});

export const multipleCalculator = defineCalculator({
  id: 'insurance.multiple',
  title: 'Insurance cover by income multiple',
  domain: 'insurance',
  summary: 'Cover = k × gross income, less existing cover. A rule-of-thumb heuristic only.',
  input: MultipleInput,
  rules: [RULE_MULTIPLE],
  limitations: ['k is a heuristic chosen by the user; it has no regulatory basis.'],
  example: { annual_income: 100000, multiple: 10 },
  run(input, ctx) {
    const cover = dec(input.annual_income).mul(input.multiple);
    const shortfall = max(0, cover.minus(dec(input.existing_cover)));
    ctx.step({ key: 'insurance.multiple', label: 'Cover by multiple', value: money(cents(cover)), working: `${input.multiple} × ${fmt(dec(input.annual_income))}`, ruleId: RULE_MULTIPLE.id });
    return { cover: money(cents(cover)), shortfall: money(cents(shortfall)) };
  },
});
