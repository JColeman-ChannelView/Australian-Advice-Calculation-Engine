# Known limitations register

Engine version 0.1.0. Each calculator also lists its limitations in its response and in
`docs/CALCULATORS.md`. Open source questions are in `docs/SOURCE-QUESTIONS.md`.

## Calculations that block (by design) in this release

| Area | Why | Unblock by |
|---|---|---|
| Medicare levy 2026-27 (and personal tax summary 2026-27) | Low-income thresholds not yet published | Add the thresholds when legislated/published |
| Medicare family reduction (s8) | ATO family example could not be reproduced | Verify the s8 method and add golden tests |
| LITO 2027-28; SAPTO 2024-25 and 2027-28; personal summary 2027-28 | Not verified for those years | Verify against ITAA97 s61-115 / ATO SAPTO thresholds |
| Super caps, TBC, Div 296 thresholds 2027-28 | Indexed values not yet published | February/January indexation announcements |
| Lump sums with an untaxed element between preservation age and 59 | Low rate cap ordering not verified (no-one is in this age band from 1 July 2024) | Verify ITAA97 s301-B ordering |
| Super-projection default deflators after 30 June 2027 | ASIC Instrument 2022/603 repealed 1 July 2027 | Add remade instrument defaults; user-supplied rates work meanwhile |
| Age Pension before 20 Sep 2025; deeming thresholds before 1 July 2025; CSHC before 20 Sep 2026; aged care before 1 Nov 2025 or after 19 Mar 2027 | Outside the verified parameter windows | Add verified historical/future records |
| Aged care residents on pre-2014 / 1 July 2014 arrangements; HCP "no worse off" cohort | Not modelled | Implement the grandfathered fee rules |
| Transitional-rate pensioners; inside an existing bring-forward period; small (<$200) lump sums; negative Div 296 earnings | Not modelled | Implement and test |

## Engine conventions (no primary rounding rule found)

| Item | Convention |
|---|---|
| Income tax, LITO, Medicare levy, HELP, Division 293, SG, spouse offset, Div 296 tax | Rounded to cents, half-up |
| Aged care means-tested amount | Each band product rounded to cents half-up; each daily component (income, asset) rounded **down** to the cent. Reproduces every official health.gov.au scenario (Q12) |
| Deemed income | Unrounded internally; outputs rounded to cents half-up |
| Projections | Annual steps from the calculation date; contributions, fees, insurance and withdrawals mid-year (MoneySmart convention); percentage fees on the mid-year balance; future legislative values held at today's levels except the SG schedule; SIS minimum drawdown enforced |
| Insurance needs | Annuity-due (payments at the start of each year); default indexation 2.5% (ASIC 2026/41 rate used as a convention); discount rate is user-supplied |
| Loans | Periodic rate = annual ÷ periods per year; interest on (balance − offset) at period end |

**Knowledge dates.** Each record's `knowledge_date` (used by `knowledge_as_at` queries) is the
publication or assent date where the evidence shows it, otherwise a conservative date no later than
the value took effect. As-known-at reproductions are therefore indicative, not an audited
publication history.

Rounding rules that **are** sourced and implemented: SAPTO rounds up to the whole dollar;
minimum pension to the nearest $10 (exact $5 up); MCB down to $10; co-contribution up to 5 cents
with a $20 minimum; LISTO to the nearest cent with a $10 minimum; Age Pension assets test in
complete $250 units with the instalment to the nearest cent and a $1 minimum; Division 296
proportions to 2 decimal places; basic daily fee down to the cent.

## Inputs the user must determine

Taxable, rebate, repayment, Division 293, MLS and co-contribution income; net labour income;
assessable income and assets for the Age Pension and the aged-care means test (including
classification of financial assets); super lump-sum components; Div 296 attributed earnings;
eligibility facts (SAPTO, co-contribution, LISTO, CSHC, residence). The engine applies rules to
these; it does not reproduce agency assessments.

## Out of scope

Capital gains tax (including the 1 July 2027 indexation and 30% minimum tax), negative-gearing
quarantining, state stamp duty and land tax, depreciation, part-year residency, minors' income,
Support at Home contributions, DVA-specific rules, rent assistance, product fees, premiums and
research data. There are no stochastic projections and no life tables (AGA data not retrieved).

## Hosting

The reference server has no authentication or rate limiting. The research's legal framing
(ASIC generic-calculator and super-calculator relief conditions; ACL; negligence) applies to
whoever deploys the engine to consumers. Get Australian legal advice before offering a hosted
service.
