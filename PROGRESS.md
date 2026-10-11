# PROGRESS — live checklist (update at every commit)

Last updated: 2026-10-11 (session 1). Parameter currency: see `docs/PARAMETERS.md`.
Start here in a fresh session: read `CLAUDE.md`, this file, then `docs/SOURCE-QUESTIONS.md`.

## Implementation checklist (research build order)

- [x] 0. Repo, licence/NOTICE, clean-room CONTRIBUTING, progress files
- [x] 1. Effective-dated parameter registry + provenance schema + release hash + verification gate (bitemporal)
- [x] 1a. Primary-source verification of all domains (`verification/*.md`), discrepancy register (`docs/SOURCE-QUESTIONS.md`)
- [x] 2. Tax: scales 2024-25..2027-28, foreign residents, Medicare levy (individual), MLS tier, HELP, LITO, SAPTO, WATO, Div 293, personal summary
- [x] 3. Super: caps + carry-forward + bring-forward, SG/MCB, preservation age, minimum pension, lump-sum tax, co-contribution, LISTO, spouse offset, Div 296
- [x] 4. Centrelink: deeming, Age Pension (s1064 annual method, G7 units, per-person couples, Work Bonus, instalment rounding), CSHC income test
- [x] 5. Projections: ASIC 2022/603 & 2026/41 present values; deterministic accumulation + drawdown with SISR minimum
- [x] 6. Aged care: s319 MTA, hotelling, NCCC (+ caps), basic daily fee, DAP/MPIR, retention, low-means DAC
- [x] 7. Insurance needs: capital needs (convention) + income multiple
- [x] 8. Debt: repayment, amortisation with offset/extra repayments
- [x] 9. JSON API + OpenAPI 3.1 + evidence bundles + `docs/API.md`
- [x] 10. Web UI (schema-driven forms, working, sources, evidence download, projection chart, parameter register)
- [x] 11. Golden, identity, property/boundary, API integration and Playwright smoke tests
- [x] 12. README run instructions, KNOWN-LIMITATIONS, VERIFIED-COVERAGE, generated CALCULATORS/PARAMETERS docs
- [x] 13. Independent correctness audit: 8 findings fixed with regression tests (see docs/SOURCE-QUESTIONS.md)

## Test status (last run)

`npm test`: 180 Vitest tests passing — 111 golden cases (27 official worked examples, 16 published-figure
identities, 52 derived, 8 structural, 8 blocking) plus identity, property, boundary, API integration and core tests. `npm run smoke`: 10 Playwright tests passing (Edge). `npm run typecheck`
(engine, web, smoke) clean. `npm run build` succeeds (UI bundle ~560 kB, mostly React + zod).

## Blocked / deferred

See `docs/KNOWN-LIMITATIONS.md` (what blocks and why) and `docs/SOURCE-QUESTIONS.md` (Q1–Q15).

## Next actions (prioritised)

1. Add 2026-27 Medicare low-income thresholds when published (unblocks 2026-27 personal tax).
2. Verify LITO 2027-28 (ITAA97 s61-115) and 2027-28 SAPTO thresholds when the ATO publishes them.
3. Verify Medicare family reduction (s8) method against the ATO "Ashton" example; then implement.
4. Resolve Q12 (aged-care MTA rounding) with Services Australia material; resolve Q10 (lifetime income stream asset step-down) and add it to the Age Pension calculator.
5. Oracle-parity runs (ATO simple tax calculator, Services Australia estimator, health.gov.au fee estimator, MoneySmart — PRJ-003) and record results.
6. Add historical parameter windows (pre-2025 pension rates, 2024-25 deeming thresholds, SAPTO 2024-25) if needed.
7. 20 March 2027 release: pension rates, aged-care amounts; 1 July 2027 release: caps, TBC, Div 296 thresholds, 2022/603 replacement defaults.
8. Optional: grandfathered aged-care arrangements, transitional-rate pensioners, CGT once the 2027 instruments are made.

## Session log

- S1 (2026-10-11): scaffold + core; 5 parallel primary-source verification agents; all domains
  implemented in research order with golden tests; API, UI, smoke tests; docs. Research corrections
  recorded (C1–C20). Independent audit agent run at the end.
