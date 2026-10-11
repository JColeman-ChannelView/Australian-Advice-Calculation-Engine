# Source questions, conflicts and research corrections

Register of discrepancies found while independently verifying the research corpus
(`Deep-research/…(as at 11 October 2026).md`) against primary sources on 2026-10-11. Evidence for
each item is in `verification/<domain>.md`. Status: **OPEN** (blocks or limits a calculation),
**RESOLVED** (primary source settles it), **CORRECTED** (research value was wrong; engine uses the
primary value).

## Research corrections (engine uses the primary value)

| # | Domain | Research said | Primary source says | Status |
|---|---|---|---|---|
| C1 | super | SUP-003 minimum pension (Thomas) = 6,215 | SISR Sch 7 cl 5 rounds to nearest $10 → 6,220 (3,110 with 2019-20 50% reduction, which the ATO also states) | CORRECTED |
| C2 | super | SUP-007 Div 296 = 15,000 | ATO method rounds the proportion to 2 dp (33.33%) → 14,998.50 | CORRECTED |
| C3 | super | SUP-008 co-contribution = 250 (taper 500/15,000) | Statute: $500 less 3.333c per $ → 250.025, ATO rounds up to 5c → 250.05; $20 minimum | CORRECTED |
| C4 | centrelink | CL-004 asset cut-off "rounded up to $250 (inferred)" | SSA 1991 s1064-G7: disregard any part of the excess that is not a multiple of $250; yearly reduction = excess × 19.5/250 (DSS Guide 4.2.3 rounds down). Reproduces all six published cut-offs | CORRECTED |
| C5 | centrelink | Child add-on $24.60 / $12.30 to the free area applies generally | Applies only to transitional-rate pensioners | CORRECTED |
| C6 | centrelink | Free areas $218/$380 "Sep 2025" | Those applied from 1 July 2025 | CORRECTED |
| C7 | centrelink | Deeming instrument "Social Security (Deeming Rates) determination" | Social Security (Deeming Threshold Rates) Determination (No. 2) 2026, F2026L01083 | CORRECTED |
| C8 | centrelink | Assets test is "Module F" | Module G of s1064 | CORRECTED |
| C9 | projection | ASIC drawdown horizon "25 years" (2021 draft) | 2022/603 s4 "assumed drawdown period": to age 92 (or 5 years if later) | CORRECTED |
| C10 | projection | asic CPI and retirement-age effective_from 2023-01-01 | Instrument commenced 2022-07-01 | CORRECTED |
| C11 | projection | 2026/41 made 18 March 2026 | Signed 17 March 2026; registered 18 March; commenced 19 March | CORRECTED |
| C12 | aged care | MAS 72.30 / NCCC cap 107.32 effective 1 Nov 2025 | Those are the 20 Mar 2026 values; 1 Nov 2025: 70.94 / 105.30; 20 Sep 2026: 73.73 / 109.45 | CORRECTED |
| C13 | aged care | NCCC cap $101.16 among candidates | Not in any primary schedule | CORRECTED |
| C14 | aged care | AC-004 labelled "scenario (fourth)" | "Couple – Julie and Raj (sell family home)" | CORRECTED |
| C15 | tax | TAX-001/002 incomes "inferred" | Incomes are stated in the ATO examples | CORRECTED |
| C16 | tax | Medicare 2025-26 low-income thresholds secondary, "may not be law" | Medicare Levy Act Compilation 53 (Act No. 58 of 2026) — law | RESOLVED |
| C17 | tax | MLS 2026-27 thresholds secondary-only | Verified on ATO QC49961 | RESOLVED |
| C18 | tax | Foreign-resident 2026-27 applicability unconfirmed | ITRA Sch 7 Pt II applies "2024-25 or a later year" with the 2nd/3rd resident rates | RESOLVED (derived) |
| C19 | super | Concessional cap conflict ($27,500 vs $30,000 for 2024-26) | Every readable ATO page says $30,000; $27,500 was 2021-24. The print page claimed to conflict could not be opened | RESOLVED (use $30,000) |
| C20 | super | Bring-forward age test conflict ("at any time in FY" vs "age on 1 July") | Logically equivalent: under 75 at any time in the FY ⇔ under 75 on 1 July | RESOLVED |

| C21 | projection | 2026/41 present-value formula "not read" (image) | Register epub alt text: C ÷ (1 + r)^n — matches the engine (verified by orchestrator 2026-10-11) | RESOLVED |

## Independent audit (2026-10-11)

An independent review agent compared rules and parameters with the verification evidence and found
8 issues; all were fixed with regression tests: low-means lump-sum DAC reduction (aged care);
SAPTO-entitlement and spouse handling for the Medicare levy in the personal summary; generic PV
formula provenance (resolved by C21); projection minimum-drawdown age on 1 July; retirement age
floored at preservation age; ASIC defaults read only when not supplied; two knowledge dates
corrected; LITO per-year status downgraded to `derived`; golden descriptions corrected. Also: the
Work Bonus now applies only to partners of Age Pension age.

## Open questions (calculations blocked or limited until resolved)

| # | Domain | Question | Effect in engine |
|---|---|---|---|
| Q1 | tax | Medicare levy family reduction (s8) — ATO family example "Ashton" ($92.90) not reproduced | Family phase-in cases **blocked** |
| Q2 | tax | 2026-27 Medicare low-income thresholds not yet published | 2026-27 Medicare levy **blocked** |
| Q3 | tax | 2027-28 SAPTO thresholds not published; LITO page not year-stamped (2027-28 unconfirmed) | 2027-28 SAPTO/LITO/personal summary **blocked** |
| Q4 | tax | CGT from 1 July 2027: "new residential dwelling" and transition apportioning instruments (ss26-160(4), 112-185) not checked | CGT not implemented (deferred) |
| Q5 | tax | No published rounding rule for LITO, Medicare levy, HELP, Div 293 | Engine convention: cents, half-up (documented) |
| Q6 | super | Div 296 regulations (F2026L00726) text not read; earnings attribution | Div 296 takes attributed earnings as **input** |
| Q7 | super | 2027-28 caps, TBC, Div 296 thresholds not yet published | 2027-28 cap calculations **blocked** |
| Q8 | super | TBC increment rule (ITAA97 s294-35) not read | TBC values used as published only |
| Q9 | super | Low rate cap ordering across taxed and untaxed elements | Preservation-age-to-59 lump sums with an untaxed element **blocked** |
| Q10 | centrelink | Lifetime income stream asset step-down: later of age 84 or 5 years? | Lifetime income streams asset assessment not implemented |
| Q11 | centrelink | CSHC limits before 20 Sep 2026 not found | CSHC test uses 20 Sep 2026 values only |
| Q12 | aged care | Means-tested amount cent rounding — Raj scenario only reproduces with rounding down | Engine rounds each MTA component down to the cent (matches all official scenarios); flagged |
| Q13 | aged care | Services Australia means-assessment pages returned 404 | Values taken from the Act, Rules and Schedules of Fees and Charges instead |
| Q14 | projection | 2022/603 repealed 1 July 2027; replacement unknown | Super-projection defaults end 30 June 2027; later calculation dates need user-supplied deflators |
| Q15 | projection | AGA life expectancy at 65 only in Excel downloads (not retrieved) | No life-table data shipped; longevity inputs are user-supplied |

## Agency-page errata noticed (do not affect engine results)

- ATO HELP page: Christina's summation line prints $60,720 (stated TI $60,470); Priya's text cites the 2025-26 threshold $179,286.
- ATO HELP 2024-25 "Branson": 99,736 × 5.5% printed as $5,485.52 (correct $5,485.48).
- ATO Div 296 example "Leanne": shows "× 5%" where the 15% result is printed.
- health.gov.au scenarios page prints lifetime cap $137,910.01; Schedule and Rules 7-20 say $137,917.01.
- MoneySmart account-based pension page is inconsistent on whether admin fees index with wage inflation or CPI.
