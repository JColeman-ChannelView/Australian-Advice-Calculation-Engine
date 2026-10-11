# JSON API (v1)

Base URL: `http://127.0.0.1:8787/api/v1` (`npm start`). The full machine-readable contract is the
OpenAPI 3.1 document at `GET /api/v1/openapi.json`, generated from the same zod schemas the engine
validates with.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Engine name and version, parameter release `{hash, record_count, currency_date}` |
| GET | `/calculators` | Every calculator: id, title, domain, summary, rules, limitations, example, JSON Schema of its input |
| POST | `/calculate/{id}` | Run a calculator. Body = input JSON. Query: `evidence=true` returns a sealed evidence bundle; `knowledge_as_at=YYYY-MM-DD` uses only parameters knowable by that date |
| GET | `/parameters?name=&date=` | Parameter records; `name` is exact or a prefix ending in `.` (e.g. `tax.`); `date` keeps records in force that day |
| GET | `/openapi.json` | OpenAPI document |

## Status codes

| HTTP | `status` | Meaning |
|---|---|---|
| 200 | `ok` | Calculated |
| 400 | `invalid` | Input failed validation; `issues[]` gives `path` and `message` |
| 422 | `blocked` | A needed rule or parameter is missing, unverified, secondary-only, in conflict, not enacted, or out of scope; `blocked[]` gives `code`, `message`, `parameter` |
| 404 / 405 / 413 / 415 | — | Unknown calculator / wrong method / body over 1 MB / non-JSON body |

Block codes: `PARAMETER_MISSING`, `PARAMETER_UNVERIFIED`, `PARAMETER_CONFLICT`,
`PARAMETER_NOT_ENACTED`, `RULE_NOT_IMPLEMENTED`, `OUT_OF_SCOPE`.

## Conventions

- **Money and rates** are accepted as JSON numbers or decimal strings (`"1234.56"`, `0.05`) and
  returned as decimal strings. Monetary outputs have exactly two decimal places. Rates are fractions
  (0.05 = 5%).
- **Dates** are ISO `YYYY-MM-DD`. **Financial years** are `"2026-27"`.
- Calculations are deterministic and pure: the same input and parameter release always give the
  same output. The evidence bundle's `generated_at` is the only clock-dependent field.

## Response shape (`CalculationResponse`, schema_version "1")

```json
{
  "schema_version": "1",
  "engine": { "name": "au-advice-calc-engine", "version": "0.1.0" },
  "parameter_release": { "hash": "<sha256>", "currency_date": "2026-09-20" },
  "calculator": { "id": "tax.income_tax", "title": "...", "domain": "tax" },
  "status": "ok",
  "input": { "financial_year": "2026-27", "taxable_income": "100000", "residency": "resident" },
  "result": { "income_tax": "20520.00", "marginal_rate": "0.3", "average_rate": "0.2052" },
  "trace": [ { "key": "tax.income_tax", "label": "...", "value": "20520.00", "working": "15% × 26,800 + 30% × 55,000", "ruleId": "au.tax.resident_scale", "parameters": ["tax.resident_scale@2026-07-01"] } ],
  "parameters": [ { "id": "tax.resident_scale@2026-07-01", "value": [...], "verification": "verified", "legal_status": "enacted", "instrument": "...", "sources": [ { "url": "https://www.ato.gov.au/...", "title": "...", "accessed": "2026-10-11", "primary": true } ] } ],
  "assumptions": [],
  "warnings": [],
  "limitations": ["..."],
  "rules": [ { "id": "au.tax.resident_scale", "version": "1.0.0", "legalReference": "Income Tax Rates Act 1986 s12, Sch 7 Pt I" } ],
  "disclaimer": "Reference calculation only, not financial product advice. ..."
}
```

## Evidence bundle (`?evidence=true`)

```json
{
  "evidence_schema_version": "1",
  "generated_at": "2026-10-11T10:00:00.000Z",
  "response": { "...": "CalculationResponse as above" },
  "hashes": { "input": "<sha256>", "response": "<sha256>", "bundle": "<sha256>" }
}
```

Hashes are SHA-256 over canonical JSON (sorted keys). `verifyEvidenceBundle()` in
`src/core/evidence.ts` recomputes them, so a bundle attached to an advice record can be checked
for tampering and reproduced by re-running the same engine version and parameter release.

## Example

```bash
curl -s -X POST "http://127.0.0.1:8787/api/v1/calculate/centrelink.age_pension?evidence=true" -H "Content-Type: application/json" -d "{\"assessment_date\":\"2026-10-11\",\"relationship\":\"single\",\"homeowner\":true,\"dates_of_birth\":[\"1955-01-01\"],\"assessable_assets\":433000,\"financial_assets\":0}"
```

## Library use

```ts
import { runCalculator } from './src/core/calculator.js';
import { getCalculator } from './src/calculators.js';
import { defaultRegistry } from './src/params.js';

const res = runCalculator(getCalculator('tax.help_repayment')!, { financial_year: '2026-27', repayment_income: 86380 }, defaultRegistry());
// res.result.help_repayment === '2527.80'
```

Security note: the reference server binds to 127.0.0.1, limits bodies to 1 MB, sends `nosniff`,
`no-referrer` and `DENY` framing headers, and confines static files to `web/dist`. It has no
authentication or rate limiting. Get Australian legal advice before offering a hosted service.
