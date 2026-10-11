# Verified coverage

How each domain's parameters and fixtures were checked. All verification was against primary
sources on 2026-10-11; the evidence with URLs and short locators is in `verification/<domain>.md`.
The generated register `docs/PARAMETERS.md` lists every record with its status.

## Sources by domain

| Domain | Primary sources read |
|---|---|
| Tax | ATO rates pages (resident, foreign), new-legislation pages (tax cuts, WATO, CGT/negative gearing), Medicare levy reduction (individual, family), MLS thresholds, study-loan thresholds, LITO, SAPTO, income tests, Division 293; Income Tax Rates Act 1986 (Compilation 66); Medicare Levy Act 1986 (Compilation 53); Tax Reform No. 1 Act 2026 |
| Super | ATO key super rates sub-pages (caps, SG, TBC, payments from super, government contributions, Div 296, ETP), cap pages, MCB, Div 296 method, LISTO, co-contribution, downsizer, spouse, FHSS; SIS Regulations 1994 Sch 7 (Compilation 159); Co-contribution Act 2003; Building a Stronger and Fairer Super System Act 2026 |
| Centrelink | Services Australia Age Pension pages (rates, income test, assets test, deeming, eligibility, residence, Work Bonus, gifting, income streams, assets, CSHC); DSS Social Security Guide (rates history, limits history, deeming, assets test, income test, rounding); Social Security Act 1991 (20 Sep 2026 compilation); Deeming Threshold Rates Determinations 2025, 2026, (No. 2) 2026 |
| Aged care | health.gov.au fee scenarios and fee pages; Schedules of Fees and Charges (1 Nov 2025, 1 Jan, 20 Mar, 1 Jul, 20 Sep 2026); Aged Care Act 2024 (ss235, 277–279, 305, 308, 319); Aged Care Rules 2025 (Compilations 10, 11); myagedcare.gov.au |
| Projection | ASIC Instruments 2022/603 (Compilation 1) and 2026/41 (full text); RG 276 landing page; MoneySmart superannuation and account-based pension calculators; AGA Australian Life Tables page |

## Research Appendix B fixtures

| Fixture | Outcome | Engine test |
|---|---|---|
| TAX-001 … TAX-010 | All accepted (TAX-001/002 incomes are stated, not inferred) | `tests/golden/tax.yaml` |
| SUP-001, 002, 004, 005, 006, PRJ-002 | Accepted | `tests/golden/super.yaml` |
| SUP-003 | **Rejected**: SISR rounding gives 6,220 (3,110 with the 2019-20 halving, matching the ATO) | corrected case + official Thomas case |
| SUP-007 | **Rejected**: proportion rounded to 2 dp → 14,998.50 | corrected case |
| SUP-008 | **Rejected**: statutory 3.333c taper and 5c round-up → 250.05 | corrected case |
| CL-001 … CL-008 | Accepted; CL-004 rule corrected to SSA 1064-G7 (complete $250 units) | `tests/golden/centrelink.yaml` |
| AC-001 … AC-005 | Accepted for the 20 Mar – 19 Sep 2026 rate set; effective-dated variants added | `tests/golden/aged_care.yaml` |
| PRJ-001, DEBT-001, DEBT-002, INS-001 … INS-005 | Accepted | `tests/golden/projection_insurance_debt.yaml` |
| PRJ-003 | Not runnable: needs an oracle capture of MoneySmart (deferred) | — |

## Additional official examples used as golden tests

ATO: HELP Barry; SAPTO José, Keith, Vanh; Medicare Angie; Division 293 Jan; minimum pension Robert
and Thomas; quarterly maximum SG amounts. health.gov.au: Sakura, Raj, Julie and the Julie-and-Raj
couple scenarios, including full means-tested-amount reconstruction and DAP conversions. Services
Australia: all six published Age Pension asset cut-offs and all three income cut-offs reproduced
exactly.

## Identity checks (`tests/identities.test.ts`)

These identities are checked:
- published resident and foreign-resident bases;
- SAPTO cut-out = shade-out + max ÷ 0.125;
- HELP band bases;
- LITO continuity;
- Medicare phase-in limits = 1.25 × lower thresholds;
- NCC = 4 × CC, and the bring-forward thresholds and amounts derived from TBC and NCC (2024-25 to 2026-27);
- MCB formula;
- co-contribution higher threshold = lower + 15,000;
- LISTO 2027-28 cap = threshold × SG × 15%;
- spouse offset maximum;
- Age Pension maximum-rate totals;
- free areas = annual ÷ 26;
- aged-care basic daily fee = ⌊85% × basic pension ÷ 364⌋ and asset free area = 2.25 × basic pension (to the nearest $500) for each rate window;
- bitemporal resolution.

## Honest status

Verified means "read on a primary government or legislative page by a verification agent and
recorded with a locator". It is not legal certification. Values marked `derived` are exact
arithmetic from verified values (for example foreign-resident 2026-27 from the Act's Pt II wording,
or 20 March 2026 fortnightly rates from DSS annual figures). Before production use, a licensee
should repeat the oracle-parity checks the research recommends (ATO simple tax calculator,
Services Australia estimators, health.gov.au fee estimator, MoneySmart).
