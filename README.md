# Advice Calculation Engine (reference)

A clean-room, open-source (**Apache-2.0**) reference engine for Australian personal tax,
superannuation, Age Pension / Centrelink, residential aged care, retirement projections,
insurance-needs and loan calculations, with a JSON API and a web calculator.

Every rate and threshold is an **effective-dated parameter** cited to a primary government or
legislative source. Every result carries its **working**, the **parameters and sources** used, the
**assumptions** applied and a hash-sealed **evidence bundle**. When a needed rule or value is
unverified, secondary-only, in conflict, unpublished or out of scope, the engine returns
**`blocked`** with the reason. It never estimates a missing value.

> **Not financial advice.** This is a reference implementation. It is not endorsed by the ATO,
> ASIC, Services Australia, DSS, the Department of Health, Disability and Ageing or any
> Commonwealth agency, and it makes no claim of regulatory compliance or fitness for advice.
> Licensees remain responsible for validating outputs (see `NOTICE`).

## Quick start

Requires Node.js 20+ (developed on Node 24). Run these from the repository root.

```bash
npm install
```

```bash
npm run build
```

```bash
npm start
```

Open http://127.0.0.1:8787 for the web calculator. The API is at http://127.0.0.1:8787/api/v1
(OpenAPI document: `/api/v1/openapi.json`). Set `PORT`, `HOST` or `CORS_ORIGIN` to change the
defaults.

Development:

```bash
npm run dev:web
```

```bash
npm run dev:api
```

## Verify

```bash
npm run verify
```

This runs the typecheck (engine, web and smoke projects), all Vitest suites (golden, identity,
property, boundary and API integration), the production build and the Playwright browser smoke tests.
The smoke tests use the locally installed Microsoft Edge by default. On machines without Edge,
run `npx playwright install chromium` and set `PW_CHANNEL=chromium`.

Individual steps: `npm test`, `npm run typecheck`, `npm run build`, `npm run smoke`,
`npm run params` (validate and rebuild the parameter release), `npm run docs` (regenerate
`docs/CALCULATORS.md`).

## What is implemented

30 calculators. See `docs/CALCULATORS.md` for each one's rules, limitations and an example.

| Domain | Calculators |
|---|---|
| Tax | resident/foreign scales 2024-25 to 2027-28; Medicare levy (individual low-income phase-in); MLS tier; HELP (marginal method); LITO; SAPTO; WATO (2027-28); Division 293; personal tax summary |
| Super | concessional cap + carry-forward; non-concessional cap + bring-forward; SG and maximum contribution base (quarterly → annual Payday Super); preservation age; minimum pension (SISR Sch 7 with pro-rating, reductions and $10 rounding); lump-sum tax; co-contribution; LISTO (incl. 2027-28 change); spouse offset; Division 296 |
| Centrelink | Age Pension (SSA s1064 annual method: deeming, income test, assets test with complete-$250 units, per-person couples, Work Bonus, instalment rounding); deeming; CSHC income test |
| Projections | ASIC 2022/603 present values (two-stage deflator) and 2026/41 generic deflator; deterministic super accumulation and account-based-pension drawdown |
| Aged care | 1 Nov 2025 arrangements: means-tested amount (Act s319), hotelling contribution, non-clinical care contribution with caps, basic daily fee, DAP/MPIR, RAD retention, low-means accommodation contribution |
| Insurance | capital-needs analysis (convention) and income multiple |
| Debt | P&I / interest-only repayment; amortisation with offset and extra repayments |

## Repository map

| Path | Contents |
|---|---|
| `parameters/*.yaml` | Effective-dated parameter records with sources, verification and legal status |
| `src/core/` | Decimal arithmetic, dates, registry (bitemporal), verification gate, calculator runner, evidence bundles, SHA-256 |
| `src/<domain>/` | Pure rule functions and calculator definitions |
| `src/api/` | Dependency-free HTTP server, handlers, OpenAPI generator |
| `web/` | React + Vite UI running the same engine in the browser |
| `tests/` | Vitest suites; `tests/golden/*.yaml` official/derived/identity/blocking cases |
| `smoke/` | Playwright browser smoke tests |
| `verification/` | Primary-source verification evidence per domain |
| `docs/` | API, parameter register (generated), calculator catalogue (generated), source questions, limitations, coverage |
| `PROGRESS.md` | Live implementation checklist and next actions |

## Licence and clean-room statement

Apache-2.0 (see `LICENSE` and `NOTICE`). Rules were implemented from public government and
legislative sources only. No proprietary advice-software material and no AGPL code was consulted
or copied. Contributors must follow `CONTRIBUTING.md` (DCO sign-off and clean-room affirmation).
