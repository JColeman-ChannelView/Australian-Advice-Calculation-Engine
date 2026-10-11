# Verification: centrelink (Age Pension means testing)

Verified 2026-10-11 against primary sources only. Values were read in the in-app browser. WebFetch returned HTTP 403 for guides.dss.gov.au and timed out on servicesaustralia.gov.au. The legislation.gov.au text was read from the Register's own epub HTML for the compilation.

## URLs actually read

| # | URL | Page date |
|---|-----|-----------|
| U1 | https://www.servicesaustralia.gov.au/how-much-age-pension-you-can-get?context=22526 | Page last updated 20 Sep 2026 |
| U2 | https://www.servicesaustralia.gov.au/income-test-for-age-pension?context=22526 | Page last updated 20 Sep 2026 |
| U3 | https://www.servicesaustralia.gov.au/assets-test-for-age-pension?context=22526 | Page last updated 20 Sep 2026 |
| U4 | https://www.servicesaustralia.gov.au/deeming?context=22526 | Page last updated 20 Sep 2026 |
| U5 | https://www.servicesaustralia.gov.au/who-can-get-age-pension?context=22526 | Page last updated 1 Dec 2025 |
| U6 | https://www.servicesaustralia.gov.au/residence-rules-for-age-pension?context=22526 | Page last updated 27 Jul 2026 |
| U7 | https://www.servicesaustralia.gov.au/how-work-bonus-works?context=22561 | Page last updated 14 Feb 2025 |
| U8 | https://www.servicesaustralia.gov.au/how-much-you-can-gift?context=22526 | Page last updated 3 Feb 2025 |
| U9 | https://www.servicesaustralia.gov.au/income-streams?context=22526 | Page last updated 26 May 2026 |
| U10 | https://www.servicesaustralia.gov.au/asset-types?context=22526 (redirected from /assets) | Page last updated 16 Jul 2026 |
| U11 | https://www.servicesaustralia.gov.au/income-test-for-commonwealth-seniors-health-card?context=21966 | Page last updated 20 Sep 2026 |
| U12 | https://guides.dss.gov.au/social-security-guide/5/1/8/10 (Common pension rates) | Last reviewed 21 Sep 2026 |
| U13 | https://guides.dss.gov.au/social-security-guide/5/1/9/10 (Pension supplement, current rates) | Last reviewed 21 Sep 2026 |
| U14 | https://guides.dss.gov.au/social-security-guide/5/1/10/20 (ES, current rates) | Last reviewed 2 Jan 2026 |
| U15 | https://guides.dss.gov.au/social-security-guide/5/2/2/10 (MBR history) | Last reviewed 21 Sep 2026 |
| U16 | https://guides.dss.gov.au/social-security-guide/5/2/8/10 (PS history) | Last reviewed 21 Sep 2026 |
| U17 | https://guides.dss.gov.au/social-security-guide/4/10/3 (Historical pension income and assets limits, Tables 5 and 6) | Last reviewed 1 Jul 2026 |
| U18 | https://guides.dss.gov.au/social-security-guide/4/4/1/10 (Overview of deeming, with rates/thresholds table) | Last reviewed 21 Sep 2026 |
| U19 | https://guides.dss.gov.au/social-security-guide/4/2/3 (Pensions assets test) | Last reviewed 12 Aug 2024 |
| U20 | https://guides.dss.gov.au/social-security-guide/4/2/1/10 (Pensions income test) | Last reviewed 11 May 2026 |
| U21 | https://guides.dss.gov.au/social-security-guide/5/5/1/10 (Sample rate calc) | Last reviewed 20 Mar 2020 |
| U22 | https://guides.dss.gov.au/social-security-guide/8/4/1/50 (Rounding) | Last reviewed 6 Nov 2023 |
| U23 | https://guides.dss.gov.au/social-security-guide/3/12/1 (Pension supplement, qualification & payability) | Last reviewed 21 Sep 2026 |
| U24 | https://www.legislation.gov.au/C2004A04121/latest/text. SSAct 1991 compilation C2026C00449 (C234) of 20 Sep 2026, Volume 3 (epub document_3.html): s1064 Modules A, B, E, G; s1073AB | compilation 20 Sep 2026 |
| U25 | https://www.legislation.gov.au/F2025L00989/latest/text. Social Security (Deeming Threshold Rates) Determination 2025 | as made 25 Aug 2025, repealed |
| U26 | https://www.legislation.gov.au/F2026L00137/asmade/text. Social Security (Deeming Threshold Rates) Determination 2026 | in force 24 Feb 2026 to 19 Sep 2026 |
| U27 | https://www.legislation.gov.au/F2026L00137/latest/interactions (repealed by F2026L01083) | — |
| U28 | https://www.legislation.gov.au/F2026L01083/asmade/text. Social Security (Deeming Threshold Rates) Determination (No. 2) 2026 | registered 21 Aug 2026 |

Not read: DVA ready reckoners and the Services Australia "A guide to Australian Government payments" PDFs (co029-2603). Neither was needed, because U1 publishes the couple figures directly.

## Parameter table

| parameter | value | applies from–to | source URL | short quote | status |
|---|---|---|---|---|---|
| Age Pension age | 67 | current (no end date) | U5 | "Age Pension age is 67 years or older." | VERIFIED |
| Residence requirement | 10 years total Australian residence, at least 5 of them continuous. Exemptions for refugees, some widows and agreement countries | current | U6 | "at least 10 years in total. For at least 5 of these years, there must be no break" | VERIFIED |
| Max basic rate, single | $1,135.40/fn ($29,520.40 p.a.) | 20 Sep 2026 – 19 Mar 2027 | U1, U12, U15 | U1 table: "Maximum basic rate $1,135.40" | VERIFIED |
| Max basic rate, couple each | $855.90/fn ($22,253.40 p.a.) | 20 Sep 2026 – 19 Mar 2027 | U1, U12, U15 | U1: "$855.90" (couple each) | VERIFIED |
| Pension supplement, single | $88.20/fn ($2,293.20 p.a.) | 20 Sep 2026 – 19 Mar 2027 | U1, U13 | U1: "Maximum Pension Supplement $88.20" | VERIFIED |
| Pension supplement, couple each | $66.50/fn ($1,729.00 p.a.) | 20 Sep 2026 – 19 Mar 2027 | U1, U13 | U1: "$66.50" | VERIFIED |
| Energy supplement, single / couple each | $14.10 / $10.60 per fn ($366.60 / $275.60 p.a.); not indexed | fixed (ES current-rates page) | U1, U14 | U14: "ES is not indexed." | VERIFIED |
| Max total rate, single | $1,237.70/fn | 20 Sep 2026 – 19 Mar 2027 | U1, U12 | U1: "Total $1,237.70" | VERIFIED |
| Max total rate, couple each / combined | $933.00 / $1,866.00 per fn | 20 Sep 2026 – 19 Mar 2027 | U1, U12 | U1: "Total … $933.00 $1,866" | VERIFIED (research marked SECONDARY) |
| Max rate, illness-separated couple (each) | $1,237.70/fn (single rate) | 20 Sep 2026 – 19 Mar 2027 | U1, U12 | "Couple apart due to ill health … $1,237.70" | VERIFIED |
| MBR single / couple each, 20 Mar 2026 | $1,100.30 / $829.40 per fn | 20 Mar 2026 – 19 Sep 2026 | U15 | 20/03/2026 row: 28,607.80 / 21,564.40 p.a. ÷ 26 | DERIVED (from VERIFIED annual figures) |
| PS single / couple each, 20 Mar 2026 | $86.50 / $65.20 per fn | 20 Mar 2026 – 19 Sep 2026 | U16 | 20/03/2026 row: 2,249.00 / 1,695.20 p.a. ÷ 26 | DERIVED |
| Max total, 20 Mar 2026 | single $1,200.90 = 1,100.30 + 86.50 + 14.10; couple each $905.20 = 829.40 + 65.20 + 10.60 | 20 Mar 2026 – 19 Sep 2026 | U15, U16, U14 | ES not indexed (U14) | DERIVED (matches research) |
| Max total, 20 Sep 2025 | single $1,178.70 = 1,079.70 + 84.90 + 14.10; couple each $888.50 = 813.90 + 64.00 + 10.60 | 20 Sep 2025 – 19 Mar 2026 | U15 (28,072.20 / 21,161.40), U16 (2,207.40 / 1,664.00) | annual ÷ 26 | DERIVED |
| Transitional rate (2009 transitional pensioners) | single $997.00, couple each $804.40 incl. ES | 20 Sep 2026 – 19 Mar 2027 | U1, U12 | "Total $997.00 $804.40" | VERIFIED (not in research) |
| Income free area, single | $226/fn ($5,876 p.a.) | 1 Jul 2026 – 30 Jun 2027 | U2; U17 Table 6 "01/07/2026 5,876" | "Up to $226 (free area)" | VERIFIED |
| Income free area, couple combined | $396/fn (each member $5,148 p.a. = $198/fn) | 1 Jul 2026 – 30 Jun 2027 | U2; U17 Table 6 | "Up to $396 (free area)" | VERIFIED |
| Income free area, prior year | single $218/fn ($5,668 p.a.); couple each $190/fn ($4,940 p.a.), $380 combined | 1 Jul 2025 – 30 Jun 2026 | U17 Table 6 "01/07/2025 5,668 4,940" | — | DERIVED (÷26 of VERIFIED annual) |
| Income taper, single | 50c per $ over free area | since 20 Sep 2009 | U2, U20, U24 (1064-E10 "Ordinary income excess × 0.5") | "50 cents for each dollar over $226" | VERIFIED |
| Income taper, couple | 25c per $ of combined income over $396, applied to each partner | since 20 Sep 2009 | U2, U20, U24 (1064-E2: combined incomes ÷ 2) | "25 cents for each dollar over $396" | VERIFIED |
| Income cut-off, single | $2,701.40/fn | 20 Sep 2026 – 19 Mar 2027 | U2 | "Single $2,701.40" | VERIFIED |
| Income cut-off, couple together | $4,128.00/fn combined | 20 Sep 2026 – 19 Mar 2027 | U2 | "$4,128.00 combined" | VERIFIED |
| Income cut-off, illness-separated | $5,346.80/fn combined | 20 Sep 2026 – 19 Mar 2027 | U2 | "$5,346.80 combined" | VERIFIED |
| Transitional income cut-offs | single $2,718.50; couple $4,418.00; illness-separated $5,381.00 (40c / 20c tapers) | 20 Sep 2026 – 19 Mar 2027 | U2 | "A transitional rate pensioner - single $2,718.50" | VERIFIED (not in research) |
| Child add-on to income free area | $24.60/fn per child; $12.30 each for a pensioner couple. Applies to transitional-rate pensioners only | current | U2, U20 | "Transitional rate with dependent children" | VERIFIED. CONFLICT with research, which presents it as a general rule |
| Assets full-pension limit, single homeowner | $333,000 | 1 Jul 2026 – 30 Jun 2027 | U3; U17 Table 5 | U3: "Single $333,000 $600,000" | VERIFIED |
| Assets limit, single non-homeowner | $600,000 | 1 Jul 2026 – 30 Jun 2027 | U3; U17 | as above | VERIFIED |
| Assets limit, couple homeowner (combined) | $499,000 | 1 Jul 2026 – 30 Jun 2027 | U3; U17 | "A couple, combined $499,000 $766,000" | VERIFIED |
| Assets limit, couple non-homeowner | $766,000 | 1 Jul 2026 – 30 Jun 2027 | U3; U17 | as above | VERIFIED |
| Assets limit, illness-separated / one partner eligible | $499,000 / $766,000 combined | 1 Jul 2026 – 30 Jun 2027 | U3 | — | VERIFIED |
| Assets limits, prior year | single home 321,500; single non-home 579,500; couple home 481,500; couple non-home 739,500 | 1 Jul 2025 – 30 Jun 2026 (so 20 Mar 2026 used these) | U17 Table 5 "01/07/2025" | — | VERIFIED |
| Assets limits, 2024-25 | 314,000 / 566,000 / 470,000 / 722,000 | 1 Jul 2024 – 30 Jun 2025 | U17 | — | VERIFIED |
| Part-pension asset cut-offs | single home 745,750; single non-home 1,012,750; couple home 1,121,000; couple non-home 1,388,000; illness-separated 1,324,500 / 1,591,500; one partner eligible 1,121,000 / 1,388,000 | 20 Sep 2026 – 19 Mar 2027 | U3 | "From 20 September 2026, part pensions cancel when…" | VERIFIED. All six also reproduced exactly by the legislative formula (see Rounding) |
| Asset cut-offs | single home 733,500; single non-home 1,000,500; couple home 1,102,500; couple non-home 1,369,500 | 1 Jul 2026 – 19 Sep 2026 | formula, U24 | — | DERIVED |
| Asset cut-offs | single home 722,000; single non-home 980,000; couple home 1,085,000; couple non-home 1,343,000 | 20 Mar 2026 – 30 Jun 2026 | formula, U24 | — | DERIVED |
| Transitional asset cut-offs | single 665,500 / 932,500; couple 1,035,500 / 1,302,500; illness-separated 1,164,000 / 1,431,000 | 20 Sep 2026 – 19 Mar 2027 | U3 | — | VERIFIED (not in research) |
| Assets taper | $3/fn per $1,000 (legislated as $19.50 p.a. per complete $250) | since 1 Jan 2017 | U19; U24 1064-G4/G7 | "every $1,000 … reduces … by $3 per fortnight" | VERIFIED |
| Deeming rates | 0.25% / 2.25% | 1 Jul 2024 – 19 Sep 2025 | U18 | table rows 01/07/2024, 01/07/2025 | VERIFIED |
| Deeming rates | 0.75% / 2.75% | 20 Sep 2025 – 19 Mar 2026 | U18; U25 | U25 s6: "below threshold rate … is 0.75 per cent" | VERIFIED |
| Deeming rates | 1.25% / 3.25% | 20 Mar 2026 – 19 Sep 2026 | U18; U26 | U26 s6/s7: "1.25 per cent" / "3.25 per cent" | VERIFIED |
| Deeming rates | 1.75% / 3.75% | from 20 Sep 2026 | U4; U18; U28 | U28 s6: "below threshold rate … is 1.75 per cent" | VERIFIED (research marked SECONDARY) |
| Deeming thresholds | single 64,200; pensioner couple combined 106,200; non-pensioner couple member 53,100 | 1 Jul 2025 – 30 Jun 2026 | U18 | row 01/07/2025 | VERIFIED |
| Deeming thresholds | single 66,800; pensioner couple combined 110,600; non-pensioner couple member 55,300 | 1 Jul 2026 – 30 Jun 2027 | U4; U18 | U4: "The first $66,800 … 1.75%" | VERIFIED |
| Deeming threshold, couple where only one partner is a pensioner | uses the pensioner-couple combined threshold, $110,600 | from 1 Jul 2026 | U4; U18 column header | U4: "couple and at least one of you get a pension" | VERIFIED |
| Work Bonus | $300/fn | current | U7; U24 s1073AA examples | "$300 credit added to your Work Bonus balance each fortnight" | VERIFIED |
| Work Bonus max balance | $11,800 | since 1 Jan 2024 | U7; U24 s1073AB(2) | "would exceed $11,800, that balance is instead taken to be $11,800" | VERIFIED |
| Work Bonus new-claimant starting balance | $4,000 | on or after 1 Jan 2024 | U24 s1073AB(1A) | "unused concession balance of $4,000 on the first day" | VERIFIED |
| Gifting free areas | $10,000 per financial year; $30,000 over 5 financial years (max $10,000 in any one year); same for singles and couples. Excess counts for 5 years | current | U8 | "$10,000 in one financial year" / "$30,000 over 5 financial years" | VERIFIED |
| Lifetime income stream (purchased on/after 1 Jul 2019), income test | 60% of gross payments | from 1 Jul 2019 | U9 | "we'll assess 60% of the gross payments" | VERIFIED |
| Lifetime income stream, assets test | min 60% of purchase price from assessment day; min 30% from "threshold day" (84th birthday or a minimum of 5 years from assessment day) | from 1 Jul 2019 | U9 | "This drops to a minimum of 30% of the purchase price" | VERIFIED. SA wording "either" is ambiguous; confirm in SSAct s1118 / s1099 before coding the later-of rule |
| Principal home | excluded from the assets test, with up to the first 2 hectares of land | current | U10 | "doesn't include your principal home and up to the first 2 hectares" | VERIFIED |
| Account-based pensions deemed | deemed if purchased on/after 1 Jan 2015; pre-2015 products may be grandfathered | from 1 Jan 2015 | U9; U18 | U18: "Since 1 January 2015, the deeming provisions have applied to account-based income streams" | VERIFIED |
| CSHC income limit, single | $105,048 p.a. | from 20 Sep 2026 (reviewed each 20 Sep, CPI) | U11 | "$105,048.00 a year if you're single" | VERIFIED (research: UNVERIFIED) |
| CSHC income limit, couple | $168,076 p.a. combined | from 20 Sep 2026 | U11 | "$168,076.00 a year for couples" | VERIFIED |
| CSHC limit, illness/respite/prison separated | $210,096 p.a. | from 20 Sep 2026 | U11 | — | VERIFIED |
| CSHC child add-on | +$639.60 per child | from 20 Sep 2026 | U11 | "Add $639.60 to these amounts for each child" | VERIFIED |
| CSHC test basis | adjusted taxable income plus deemed income on account-based income streams; no assets test | current | U11 | "There's no assets test." | VERIFIED |
| CSHC limits before 20 Sep 2026 | — | — | — | — | NOT-FOUND |
| Pension Loans Scheme | skipped per task | — | — | — | — |

## Appendix B fixture checks

All checks use the 20 Sep 2026 rates and 1 Jul 2026 limits unless stated. The legislative method (U24) works annually: MPR p.a. = fortnightly × 26 (single 32,180.20; couple each 24,258.00). Income reduction = 0.5 × (annual income − annual free area). Assets reduction = floor(excess / 250) × 19.5 p.a. Fortnightly instalment = annual ÷ 364 × 14, rounded to the nearest cent.

- **CL-001 ACCEPT.** 226 + 1,237.70 / 0.5 = 226 + 2,475.40 = **2,701.40**, which equals the cut-off published on U2. Replace the fixture source with U2 (it currently cites the DSP page).
- **CL-002 ACCEPT.** 396 + 933.00 / 0.25 = 396 + 3,732.00 = **4,128.00**, which equals U2.
- **CL-003 ACCEPT.** Per-person method (1064-G2 halves combined assets; per-person limit 249,500): 24,258.00 / 19.5 = 1,244 units exactly. 1,244 × 250 = 311,000 per person, or 622,000 combined. 499,000 + 622,000 = **1,121,000**, which equals U3. Replace the source: it currently cites AustralianSuper, which is secondary. Use U3.
- **CL-004 ACCEPT, rule corrected.** The pure formula gives 333,000 + 1,237.70 / 3 × 1,000 = 745,566.67. The published figure is 745,750 (U3). The difference is not an inferred "round up to $250". It comes from SSAct 1064-G4/G7: the reduction is assets excess × 19.5 / 250 p.a., and any part of the excess that is not a multiple of $250 is disregarded. Nil rate needs floor(excess / 250) × 19.5 ≥ 32,180.20, so floor ≥ 1,650.27, so 1,651 units, so excess 412,750. Cut-off = **745,750**, the lowest asset value at which the rate is nil. At 745,500 the rate is still (32,180.20 − 1,650 × 19.5) / 26 = $0.20/fn. That is paid as $1.00 because of the instalment minimum rule (U22). Set `rule` to "SSAct 1064-G7: disregard part of excess not a multiple of $250; cut-off = smallest assets with nil rate".
- **CL-005 ACCEPT.** Uses VERIFIED rates of 1.75% / 3.75% from 20 Sep 2026 (U28) and the single threshold of $66,800 (U4, U18). 66,800 × 0.0175 = 1,169.00, and 83,200 × 0.0375 = 3,120.00. Total = **4,289.00 p.a.** (164.96/fn). Replace the source: Lincoln Wealth is secondary. Use U4 and U28.
- **CL-006 ACCEPT.** 1,237.70 − 0.5 × (326 − 226) = **1,187.70**. Annual check: 32,180.20 − 0.5 × (8,476 − 5,876) = 30,880.20, and 30,880.20 / 26 = 1,187.70.
- **CL-007 ACCEPT, with the official rounding rule applied.** Excess = 433,000 − 333,000 = 100,000, which is a multiple of 250 so nothing is disregarded. 400 × 19.5 = 7,800 p.a. 32,180.20 − 7,800 = 24,380.20, and 24,380.20 / 26 = **937.70**. Fix the source/date mismatch: co029-2603.pdf is the March 2026 guide, but the fixture uses the 1 Jul 2026 limit and the 20 Sep 2026 rate. Cite U3 and U1.
- **CL-008 ACCEPT, with the official rounding rule applied. The case study is from a secondary source (CFS).** Excess = 734,500 − 333,000 = 401,500, and floor(401,500 / 250) = 1,606. 1,606 × 19.5 = 31,317.00 p.a. 32,180.20 − 31,317.00 = 863.20 p.a., and 863.20 / 26 = **$33.20/fn**. Eligible: yes, since 734,500 < 745,750. Before 20 Sep 2026 (MPR 1,200.90 → 31,223.40 p.a.) the rate is nil, because 31,317 > 31,223.40 and the 1 Jul to 19 Sep 2026 cut-off is 733,500. That is consistent with "eligible after 20 Sep 2026". The fixture's scenario facts come from a secondary source, but the rate is derived only from VERIFIED parameters, so it can stay as an engine-derived fixture.

## Discrepancies vs research

1. **Assets test module.** The research says "Module F"; the correct module is **Module G**. In SSAct s1064 (Pension Rate Calculator A), the assets test is Module G (1064-G1 to G7), Module E is the income test, and Module F is DSP-only ordinary income.
2. **Asset-reduction granularity (CL-004).** The research infers that published cut-offs are "rounded up to the next $250". In fact the legislation computes the reduction as excess × $19.50 / $250 p.a., disregarding any part of the excess that is not a multiple of $250 (1064-G7). The DSS Guide says to "Round the result DOWN to a whole number" (U19). The published cut-offs are just the lowest asset value giving a nil rate. The engine must implement floor(excess / 250) × 19.5 annually, not a $250 band on the cut-off. The ±$250 tolerance in the research's test plan is unnecessary for assets: all six published 20 Sep 2026 cut-offs reproduce exactly.
3. **Couples and illness-separated couples work per person.** 1064-G2 attributes 50% of combined assets to each partner, and each is tested against a per-person limit (Table G-1 items 2–3, which also apply to illness-separated couples). Combined with the floor rule, this produces 1,324,500 / 1,591,500 for illness-separated couples. A combined-excess calculation would wrongly give 1,324,250. The research formula `3 × (assets − limit)/1000` on combined figures does not capture this.
4. **Child add-on ($24.60 / $12.30).** The research presents it as a general income-test rule. Services Australia (U2) lists it only under "Transitional rate with dependent children". DSS 4.2.1.10 (U20) says the additional free area for children was abolished from 20 Sep 2009 for the standard rules.
5. **Couple maximum rate $933.00.** The research marked it SECONDARY-ONLY (austax.tools). It is now VERIFIED on Services Australia (U1) and DSS 5.1.8.10 (U12). The full breakdown is VERIFIED: couple each MBR 855.90 + PS 66.50 + ES 10.60.
6. **Single breakdown.** The research cites "DVA and secondary sources". It is now VERIFIED on U1: 1,135.40 + 88.20 + 14.10.
7. **Asset limits for 2026-27.** The research marked them SECONDARY (Challenger). They are now VERIFIED on U3 and DSS 4.10.3 (U17).
8. **Asset cut-offs for 20 Sep 2026.** The research marked them SECONDARY (AustralianSuper). They are now VERIFIED on U3.
9. **Deeming rates from 20 Sep 2026.** The research marked them SECONDARY (Lincoln Wealth). They are now VERIFIED on U4, U18 and legislative instrument F2026L01083 (U28). The research's instrument name "Social Security (Deeming Rates) determination" is wrong: the correct title is **Social Security (Deeming Threshold Rates) Determination (No. 2) 2026**, made under SSAct s1082. The earlier instruments are F2026L00137 (1.25/3.25% from 20 Mar 2026) and F2025L00989 (0.75/2.75% from 20 Sep 2025).
10. **Deeming thresholds.** The research gives the source as the "people outside Australia" page and SSAct s1081. They are now VERIFIED on U4 and U18. The research omits the non-pensioner couple member threshold: $55,300 from 1 Jul 2026 and $53,100 from 1 Jul 2025.
11. **Income free area history.** The research note "Sep 2025: 218 / 380" is mis-dated. Those values applied from **1 Jul 2025** (DSS Table 6: 5,668 / 4,940 p.a.). Free areas change on 1 July, not 20 September.
12. **CSHC.** The research says "thresholds not captured". They are now VERIFIED (U11): $105,048 single, $168,076 couple, $210,096 separated, plus $639.60 per child, indexed each 20 September.
13. **Lifetime income stream asset step-down.** The research says "not captured". It is now VERIFIED at the Services Australia level (U9): 60% of purchase price, falling to 30% at threshold day.
14. **Transitional-rate pensioners.** The research does not mention them. Separate maximum rates, tapers (40c / 20c) and cut-offs exist (U1, U2, U3).
15. **Fixture sources.** CL-001 cites the DSP page, CL-003 AustralianSuper, CL-004 Challenger, CL-005 Lincoln Wealth, CL-008 CFS. All but CL-008's scenario can now cite primary pages.
16. **Pension rate legal basis.** The legal rate is a **daily rate = annual ÷ 364**. Fortnightly figures are "for information only" (1064-A1). This is consistent with the research's annual/26 use.

## Rounding / formula rules (primary quotes)

- **Assets reduction (SSAct 1064-G4, Table G-2).** Reduction per year = "Assets excess × 19.5 / 250", for single and partnered alike.
- **Assets excess (SSAct 1064-G7).** "disregard any part of the excess that is not a multiple of $250."
- **DSS Guide 4.2.3 (U19), step 4.** "Divide the assets excess by 250. Round the result DOWN to a whole number. Multiply the whole number by 19.5." The taper equals $3/fn per $1,000 ("From 1 January 2017").
- **Couples' assets (1064-G2).** Each partner's assets are "taken to be 50% of the sum" of both partners' assets.
- **Income reduction (1064-E10).** "Ordinary income excess × 0.5", where each partner's income is (combined ÷ 2) under 1064-E2. No rounding or granularity rule applies to the income excess (none found in Module E).
- **Overall rate (1064-A1).** "The rate of pension is a daily rate … dividing the annual rate … by 364 (fortnightly rates are provided for information only)." Step 11 takes the lower of the income-reduced and assets-reduced rates ("or the income reduced rate if the rates are equal").
- **Instalment rounding (DSS 8.4.1.50, SS(Admin) Act s54).** Instalments are "rounded to the nearest cent", with 0.5c or more rounded up. An instalment "greater than nil, but less than $1.00 is rounded up to $1.00."
- **Order of reduction (DSS 3.12.1).** "The minimum pension supplement amount is the last to reduce". There is no floor at the minimum pension supplement.
- **Deeming.** The below and above threshold rates are set under SSAct s1082 by legislative instrument (U25, U26, U28). Thresholds are indexed each 1 July (U18). No rounding rule for deemed income was found on the pages read.
- **Pension supplement / energy supplement.** The daily rate is the annual amount ÷ 364 (U13, U14). Annual amounts ÷ 26 give the published fortnightly figures exactly.

## Summary

- The Age Pension maximum rates are VERIFIED on Services Australia and the DSS Guide.
  - From 20 Sep 2026: single $1,237.70 (1,135.40 + 88.20 + 14.10); couple each $933.00 (855.90 + 66.50 + 10.60).
  - The 20 Mar 2026 totals (1,200.90 / 905.20) are DERIVED exactly from the DSS historical tables.
- The income test is VERIFIED: free areas $226 / $396 from 1 Jul 2026, tapers 50c / 25c, and cut-offs $2,701.40 / $4,128.00 / $5,346.80. The child add-on applies to transitional-rate pensioners only, which conflicts with the research.
- The assets test is VERIFIED.
  - Limits from 1 Jul 2026: 333,000 / 600,000 / 499,000 / 766,000. The 1 Jul 2025 limits were 321,500 / 579,500 / 481,500 / 739,500.
  - Cut-offs from 20 Sep 2026: 745,750 / 1,012,750 / 1,121,000 / 1,388,000 / 1,324,500 / 1,591,500.
- **Critical rounding finding.** SSAct 1064-G7 disregards any part of the assets excess that is not a multiple of $250, and the reduction is $19.50 p.a. per complete $250 (Module G, not F). This reproduces every published cut-off exactly, including 745,750 versus the formula's 745,566.67. Couples are tested per person on 50% of combined assets.
- Deeming is VERIFIED down to the legislative instruments: 0.75 / 2.75% (20 Sep 2025), 1.25 / 3.25% (20 Mar 2026), 1.75 / 3.75% (20 Sep 2026). Thresholds are 64,200 / 106,200 / 53,100 from 1 Jul 2025 and 66,800 / 110,600 / 55,300 from 1 Jul 2026.
- Work Bonus ($300, $11,800, $4,000 start), gifting ($10k / $30k), the lifetime income stream rules (60% income; 60% / 30% assets), the principal home exemption and ABP deeming from 1 Jan 2015 are all VERIFIED. CSHC is now VERIFIED: $105,048 / $168,076 / $210,096 plus $639.60 per child, from 20 Sep 2026.
- Rate rounding: the legal rate is daily (annual ÷ 364), and instalments are rounded to the nearest cent with a $1.00 minimum (SS(Admin) Act s54).
- Fixtures CL-001 to CL-008 are all ACCEPT. CL-004's rule must be changed from "inferred $250 round-up" to the 1064-G7 rule. CL-008's scenario remains secondary-sourced, but its $33.20 rate is derived from verified parameters.
