/** Catalogue of every public calculator, used by the API, OpenAPI document, web UI and tests. */
import type { CalculatorDef } from './core/calculator.js';
import { incomeTaxCalculator } from './tax/income-tax.js';
import { helpCalculator } from './tax/help.js';
import { medicareCalculator, mlsTierCalculator } from './tax/medicare.js';
import { litoCalculator, saptoCalculator, watoCalculator } from './tax/offsets.js';
import { div293Calculator } from './tax/div293.js';
import { personalTaxCalculator } from './tax/personal.js';
import { concessionalCapCalculator, nonConcessionalCapCalculator } from './super/caps.js';
import { sgCalculator } from './super/sg.js';
import { minimumPensionCalculator, preservationAgeCalculator } from './super/pension.js';
import { lumpSumTaxCalculator } from './super/benefits.js';
import { coContributionCalculator, listoCalculator, spouseOffsetCalculator } from './super/government.js';
import { div296Calculator } from './super/div296.js';
import { deemingCalculator } from './centrelink/deeming.js';
import { agePensionCalculator } from './centrelink/age-pension.js';
import { cshcCalculator } from './centrelink/cshc.js';
import { presentValueCalculator } from './projection/present-value.js';
import { superProjectionCalculator } from './projection/super-projection.js';
import { contributionsFromMtaCalculator, residentialFeesCalculator } from './aged-care/residential.js';
import { multipleCalculator, needsCalculator } from './insurance/needs.js';
import { offsetScheduleCalculator, repaymentCalculator } from './debt/loan.js';

export const calculators: CalculatorDef[] = [
  personalTaxCalculator,
  incomeTaxCalculator,
  medicareCalculator,
  mlsTierCalculator,
  helpCalculator,
  litoCalculator,
  saptoCalculator,
  watoCalculator,
  div293Calculator,
  concessionalCapCalculator,
  nonConcessionalCapCalculator,
  sgCalculator,
  preservationAgeCalculator,
  minimumPensionCalculator,
  lumpSumTaxCalculator,
  coContributionCalculator,
  listoCalculator,
  spouseOffsetCalculator,
  div296Calculator,
  agePensionCalculator,
  deemingCalculator,
  cshcCalculator,
  superProjectionCalculator,
  presentValueCalculator,
  residentialFeesCalculator,
  contributionsFromMtaCalculator,
  needsCalculator,
  multipleCalculator,
  repaymentCalculator,
  offsetScheduleCalculator,
] as unknown as CalculatorDef[];

export function getCalculator(id: string): CalculatorDef | undefined {
  return calculators.find((c) => c.id === id);
}
