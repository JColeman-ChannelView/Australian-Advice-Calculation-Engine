# CLAUDE.md — working notes for agents

Clean-room, Apache-2.0 reference engine for Australian advice calculations (tax, super, Age Pension,
aged care, projections, insurance needs, loans). **Read `PROGRESS.md` first** — it is the live
checklist, coverage map and next-action list.

## Non-negotiables
- **Correctness over breadth.** A value is usable only if `verification: verified|derived` and legal
  status enacted/instrument/administrative/convention (`src/core/parameters.ts#isUsable`). Anything
  else must make the calculation return `status: "blocked"` — never invent or estimate a number.
- **Primary sources only** for verification (ato.gov.au, servicesaustralia.gov.au, dss.gov.au,
  dva.gov.au, health.gov.au, legislation.gov.au, asic.gov.au, moneysmart.gov.au, aga.gov.au).
  Evidence lives in `verification/*.md`; open questions in `docs/SOURCE-QUESTIONS.md`.
- **Clean room.** Do not consult or paste vendor (advice software) documentation, screenshots or
  code. Do not copy AGPL code (OpenFisca, PolicyEngine). Government values are re-derived from the
  primary source and cited per record.
- **Never claim** advice-grade, regulatory compliance or agency endorsement.
- Do not push or merge without the user's approval. Commit locally in small tested increments.

## Architecture
- `parameters/*.yaml` — effective-dated parameter records (schema in `src/core/parameters.ts`).
  `npm run params` validates them (provenance, overlaps) and writes `src/generated/parameters.json`
  (hashed release) + `docs/PARAMETERS.md`. YAML: quote any value containing `: ` inside flow maps;
  merge keys (`<<: *anchor`) are enabled.
- `src/core/` — decimal (decimal.js clone, explicit rounding modes), dates/FY helpers, registry
  (bitemporal: effective date + optional knowledge date), `CalcContext` (the only way rules read
  parameters; records trace/params/assumptions), calculator contract + runner, evidence bundles
  (canonical JSON + in-house SHA-256).
- `src/<domain>/` — pure rule functions + `defineCalculator` definitions; register new calculators
  in `src/calculators.ts`.
- `src/api/` — dependency-free Node HTTP JSON API (+ OpenAPI from zod schemas); `web/` — Vite/React UI
  that runs the same engine in the browser.
- Tests: `tests/*.test.ts` (Vitest), `tests/golden/*.yaml` (official/derived/identity/blocking cases;
  every case records `checked:`), property tests with fast-check, Playwright smoke tests in `smoke/`.

## Commands
`npm test` · `npm run typecheck` · `npm run build` · `npm run smoke` · `npm run verify` (all) ·
`npm run dev:web` · `npm run dev:api` · `npm start` (built API + UI on port 8787).

## Conventions
- Every rounding call names its mode. Where no official rule exists, round to cents half-up and say
  "engine convention" in the rule's doc comment and docs/KNOWN-LIMITATIONS.md.
- FY parameters resolve at `fyStart(fy)` (1 July). Windows are inclusive (`effective_to` = last day).
- Shell: the Bash heredoc tool sometimes fails on long scripts — prefer the Write tool for files.
