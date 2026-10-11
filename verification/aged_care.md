# Verification: aged_care (residential care, 1 November 2025 arrangements)

Verified 2026-10-11 against primary sources only. Domain owner: verification agent `aged_care`.

## Sources actually read

| # | URL | Last updated / version | How read |
|---|-----|------------------------|----------|
| S1 | https://www.health.gov.au/our-work/residential-aged-care/charging/fees/scenarios2025 | Date last updated 18 May 2026; states rates "were current on 20 March 2026" | browser, full text |
| S2 | https://www.health.gov.au/resources/publications/schedule-of-fees-and-charges-for-residential-care (redirect target of `.../schedule-of-fees-and-charges-for-residential-and-home-care`) | Publication date September 2026 | browser |
| S3 | Schedule from 20 September 2026: https://www.health.gov.au/sites/default/files/2026-09/schedule_of_fees_and_charges_for_residential_care_20_september_2026.docx | "Schedule of fees and charges for residential care from 20 September 2026" | in-browser fetch, text of word/document.xml read in memory (nothing saved to disk) |
| S4 | Schedule from 1 July 2026: https://www.health.gov.au/sites/default/files/2026-07/schedule_of_fees_and_charges_for_residential_care_1_july_2026_v2_0.docx | "from 1 July 2026" (v2) | same |
| S5 | Schedule from 20 March 2026: https://www.health.gov.au/sites/default/files/2026-03/schedule_of_fees_and_charges_for_residential_care_-_20_march_2026.docx | "from 20 March 2026" | same |
| S6 | Schedule from 1 January 2026: https://www.health.gov.au/sites/default/files/2025-12/schedule-of-fees-and-charges-for-residential-care.docx | "from 1 January 2026" | same |
| S7 | Schedule from 1 November 2025: https://www.health.gov.au/sites/default/files/2025-11/schedule-of-fees-and-charges-for-residential-care.docx | "from 1 November 2025" | same |
| S8 | https://www.health.gov.au/our-work/residential-aged-care/charging/means-tested-fees | 19 December 2025 | browser |
| S9 | https://www.health.gov.au/our-work/residential-aged-care/charging/basic-daily-fee | 10 April 2026 | browser |
| S10 | https://www.health.gov.au/our-work/residential-aged-care/charging/rad-and-rac-retention | 16 February 2026 | browser |
| S11 | https://www.health.gov.au/our-work/residential-aged-care/charging/maximum-accommodation-payment-amounts | 26 June 2026 | browser |
| S12 | https://www.health.gov.au/our-work/residential-aged-care/charging/fee-and-accommodation-arrangements | 23 February 2026 | browser |
| S13 | https://www.health.gov.au/our-work/residential-aged-care/charging/means-assessment | 2 October 2026 | browser |
| S14 | https://www.health.gov.au/resources/publications/guide-to-aged-care-law/chapter-4-funding-aged-care-services/contributions-in-residential-care | 28 October 2025 | browser |
| S15 | https://www.health.gov.au/resources/publications/guide-to-aged-care-law/chapter-4-funding-aged-care-services/means-testing | 28 October 2025 | browser |
| S16 | https://www.myagedcare.gov.au/aged-care-home-costs-and-fees | no date shown; quotes 20 Sep 2026 rates | browser |
| S17 | Aged Care Act 2024, Compilation No. 2 (C2026C00301, compilation date 1 July 2026): https://www.legislation.gov.au/C2024A00104/2026-07-01/2026-07-01/text/original/epub/OEBPS/document_1/document_1.html (versions page https://www.legislation.gov.au/C2024A00104/latest/versions) | in force from 1 Jul 2026 (C01 C2025C00589 covered 1 Nov 2025 to 30 Jun 2026) | browser, text search |
| S18 | Aged Care Rules 2025 (F2025L01173) Compilation No. 10 (F2026C00802, 1 Aug 2026 to 19 Sep 2026): `.../F2025L01173/2026-08-01/2026-08-01/text/original/epub/OEBPS/document_{1,2}/...html` | 1 Aug 2026 | browser, text search |
| S19 | Aged Care Rules 2025 Compilation No. 11 (F2026C00970, 20 Sep 2026 to 30 Sep 2026): `.../F2025L01173/2026-09-20/2026-09-20/text/original/epub/OEBPS/document_{1,2}/...html`; versions page https://www.legislation.gov.au/F2025L01173/latest/versions | 20 Sep 2026. A 1 Oct 2026 compilation is listed, but its epub returned 404 | browser, text search |
| S20 | https://www.myagedcare.gov.au/support-at-home-costs-and-contributions | page exists (title "Support at Home costs and contributions"). Content not read, as instructed | link + HTTP 200 check |

Not retrieved (NOT-FOUND): servicesaustralia.gov.au aged care means pages (`/aged-care-home-costs` returned 404; `/income-and-assets-thresholds-for-aged-care-home-costs` returned an error page). WebFetch timed out on health.gov.au. The Schedule PDFs were not read: opening the 20 Sep 2026 PDF triggered a browser download prompt, which I did not retry. I read the official Word versions of the same schedules instead.

## Parameter table

Effective-date sets for the 1 November 2025 arrangements (all S3 to S7 values are under the heading "Rates for 1 November 2025 fee and accommodation arrangements"):
- **P-Nov25**: 1 Nov 2025 to 19 Mar 2026 (S7; S6 at 1 Jan 2026 is identical except MPIR)
- **P-Mar26**: 20 Mar 2026 to 19 Sep 2026 (S5; S4 at 1 Jul 2026 changes income thresholds, fourth asset threshold, max RAD and MPIR only)
- **P-Sep26**: from 20 Sep 2026 (S3; matches Rules Comp. 11, S19)

### Resident fees and caps

| parameter | value | applies from–to | source URL | short quote | status |
|---|---|---|---|---|---|
| Basic daily fee rule | 85% of single basic age pension, rounded down to cent | from 1 Nov 2025 | S17 s 277(2)(b); S9; S14 | "rounding down to the nearest cent the amount equal to 85% of the basic age pension amount" | VERIFIED (no Rules under s 277(2)(a) found by text search of S19) |
| Basic daily fee | $65.55 | 1 Nov 2025 – 19 Mar 2026 | S7, S6 | "Basic daily fee 1 \| $65.55" | VERIFIED |
| Basic daily fee | $66.80 | 20 Mar 2026 – 19 Sep 2026 | S5, S4, S1 | "basic daily fee of $66.80 per day" (S1) | VERIFIED |
| Basic daily fee | $68.93 | from 20 Sep 2026 | S3, S16 | "maximum basic daily fee is $68.93 per day, or $25,159.45 per year" (S16) | VERIFIED |
| Max hotelling supplement / max hotelling contribution | $22.15 | 1 Nov 2025 – current (unchanged at 20 Mar & 20 Sep 2026) | S3–S7; S18/S19 Rules s 230-5; S1; S16 | "the amount of hotelling supplement is $22.15" (Rules 230-5) | VERIFIED |
| Maximum accommodation supplement (MAS) | $70.94 | 1 Nov 2025 – 19 Mar 2026 | S7, S6 | "Maximum accommodation supplement amount – $70.94 per day" | VERIFIED |
| MAS | $72.30 | 20 Mar 2026 – 19 Sep 2026 | S5, S4, S1, S18 Rules 230-10 | "newly built home or a significantly refurbished home—$72.30" (Rules) | VERIFIED |
| MAS | $73.73 | from 20 Sep 2026 | S3, S19 Rules 230-10 | "Maximum accommodation supplement amount – $73.73 per day" | VERIFIED |
| Accommodation supplement, home not newly built/refurbished | $47.15 | 1 Aug 2026 compilation (P-Mar26) | S18 Rules 230-10 | "not a newly built home or a significantly refurbished home—$47.15" | VERIFIED (not needed for the MAS) |
| NCCC daily cap (max non-clinical care contribution) | $105.30 | 1 Nov 2025 – 19 Mar 2026 | S7, S6 | "Daily cap \| $105.30" | VERIFIED |
| NCCC daily cap | $107.32 | 20 Mar 2026 – 19 Sep 2026 | S5, S4, S1, S18 Rules 279-5 | "For the purposes of subsection 279(3) of the Act, the amount is $107.32" | VERIFIED |
| NCCC daily cap | $109.45 | from 20 Sep 2026 | S3, S16, S19 Rules 279-5 | "the amount is $109.45" | VERIFIED |
| NCCC lifetime cap | $135,318.69 | 1 Nov 2025 – 19 Mar 2026 | S7, S6 | "Lifetime cap 3 \| $135,318.69" | VERIFIED |
| NCCC lifetime cap | $137,917.01 | 20 Mar 2026 – 19 Sep 2026 | S5, S4, S18 Rules 7-20 | "unless paragraph (b) applies—$137,917.01" | VERIFIED; S1 prints $137,910.01, see CONFLICT row |
| NCCC lifetime cap (scenarios page) | $137,910.01 | as at 20 Mar 2026 | S1 | "reach the lifetime cap dollar amount ($137,910.01)" | CONFLICT: Schedule S5/S4 and Rules 7-20 both say $137,917.01. S1 is probably a typo |
| NCCC lifetime cap | $140,652.80 | from 20 Sep 2026 | S3, S16, S19 Rules 7-20 | "unless paragraph (b) applies—$140,652.80" | VERIFIED |
| NCCC 4-year cap | 1,460 days (not necessarily consecutive) | from 1 Nov 2025 | S18/S19 Rules 279-10; Act s 279(4); S8 | "the number of days is 1,460" | VERIFIED |
| Lifetime cap rule | cap in effect when reached applies; Support at Home / HCP income-tested fees count to the $ cap but not to the 4 years | from 1 Nov 2025 | S8; S1 | "amount current at the time the resident reaches the cap" (S8) | VERIFIED |
| Hotelling/NCCC zero classes | dependent child, former POW, informed >6 months after start day, etc. | from 1 Nov 2025 | S19 Rules 280-5; S14 | "individuals who have one or more dependent children" | VERIFIED |
| Hotelling/NCCC zero if < $1 | Guide says the department can set them to zero "if the contribution would be less than $1" | from 1 Nov 2025 | S14 | "if the contribution would be less than $1" | VERIFIED in the Guide only; I could not find the matching Rules text for the 2025 class (the Rules "less than $1" provisions found apply to the pre-2014/post-2014 classes) |

### Means-tested amount (MTA): Aged Care Act 2024 s 319(1), quoted from S17

- Income: Steps 1–7. Above the total assessable income free area, up to the first threshold: "50% of that excess, divided by 364". 0% between the first and second thresholds, 50% between the second and third, 0% between the third and fourth, and 50% above the fourth. All divided by 364.
- Assets: Steps 8–14. "17.5% of the excess, divided by 364" between the asset free area and the first threshold. 0% between the first and second, "7.8% of the excess above the second asset threshold" up to the third, 0% between the third and fourth, and "7.8% of the excess above the fourth asset threshold". All divided by 364.
- "The daily means tested amount is the sum of the per day income tested amount and the per day asset tested amount."
- s 319(2): income free area = sum of points 1064-B1, 1064-BA4 and 1064-E4 of the SSA Pension Rate Calculator A. s 319(3): asset free area = "2.25 times the basic age pension amount" unless Rules provide otherwise. s 319(4): thresholds prescribed by the Rules (Rules s 319-5).
- The **17.5% / 1% / 2%** tiers belong only to the **post-2014 residential contribution class** (grandfathered 1 July 2014 fee arrangements), Rules s 319-20(3) (S18). Step 4: "1% of the excess" above the first asset threshold. Step 5: "2% of the excess" above the second (post-2014) asset threshold. The post-2014 income test is 50% above the income free area with no tiers (s 319-20(2)). These tiers do NOT apply to the 1 Nov 2025 arrangements.

| parameter | P-Nov25 (1 Nov 2025 – 19 Mar 2026) | P-Mar26 (20 Mar – 30 Jun 2026) | 1 Jul 2026 – 19 Sep 2026 | P-Sep26 (from 20 Sep 2026) | source | status |
|---|---|---|---|---|---|---|
| Income free area, single | $34,762.00 | $35,313.20 | $35,521.20 | $36,454.60 | S7/S5/S4/S3; S1 (Mar26); S16 (Sep26) | VERIFIED |
| Income free area, illness-separated couple (each) | $34,034.00 | $34,585.20 | $34,793.20 | $35,726.60 | same | VERIFIED |
| First income threshold, single / couple | $86,406.32 / $85,678.32 | $87,947.60 / $87,219.60 | $88,155.60 / $87,427.60 | $90,130.04 / $89,402.04 | same; Rules 319-5(2) S18/S19 | VERIFIED |
| Second income threshold | $101,105.00 | $101,105.00 | $101,105.00 | $105,048.00 | same; Rules 319-5(3) | VERIFIED |
| Third income threshold | $117,230.20 | $117,230.20 | $117,230.20 | $121,173.20 | same; Rules 319-5(4) | VERIFIED |
| Fourth income threshold, single / couple | $139,048.00 / $136,136.00 | $141,252.80 / $138,340.80 | $142,084.80 / $139,172.80 | $145,818.40 / $142,906.40 | same; Rules 319-5(5) | VERIFIED |
| Asset free area | $63,000.00 | $64,500.00 | $64,500.00 | $66,500.00 | same | VERIFIED |
| First asset threshold (= home exemption cap) | $210,555.20 | $214,884.00 | $214,884.00 | $219,858.40 | same; Rules 319-5(6) | VERIFIED |
| Second asset threshold (2025 arrangements) | $252,000.00 | $258,000.00 | $258,000.00 | $266,000.00 | same; Rules 319-5(7)(b) | VERIFIED |
| Third asset threshold | $355,366.66 | $361,366.66 | $361,366.66 | $369,366.66 | same; Rules 319-5(8) | VERIFIED |
| Fourth asset threshold | $532,055.20 | $536,384.00 | $547,884.00 | $552,858.40 | same; Rules 319-5(9) | VERIFIED |
| Second asset threshold, post-2014 class only | (not extracted) | $515,652.00 | $515,652.00 | $526,575.20 | S5/S4/S3 post-2014 section; Rules 319-5(7)(a) | VERIFIED |
| Income taper | 50% | | | | Act s 319(1) Steps 3–7 | VERIFIED |
| Asset tapers | 17.5% (AFA→T1), 0%, 7.8% (T2→T3), 0%, 7.8% (>T4) | | | | Act s 319(1) Steps 10–14 | VERIFIED |
| Daily divisor | 364 | | | | Act s 319(1) | VERIFIED |

### Ordering logic (hotelling contribution and NCCC)

| parameter | value | applies | source | short quote | status |
|---|---|---|---|---|---|
| Hotelling contribution | if MTA > MAS: min(MTA − MAS, max hotelling supplement); else 0. Means not disclosed: max hotelling supplement | from 1 Nov 2025 | S17 s 278(1)–(2); S1 | "the lesser of: (a) the daily means tested amount minus the maximum accommodation supplement amount" | VERIFIED |
| NCCC | Step 2 = MAS + **max hotelling supplement**. If MTA > Step 2: min(MTA − Step 2, max NCCC); else 0. Zero after 1,460 days or once the lifetime cap is exceeded. MND: max NCCC | from 1 Nov 2025 | S17 s 279(1),(2),(4),(5) | "the lesser of: (a) the daily means tested amount minus the result of Step 2" | VERIFIED |
| Person-centred subsidy reduction | same formula as hotelling (min(MTA − MAS, max HS)) | from 1 Nov 2025 | S17 s 235(1) | "the lesser of the following: (a) the Step 2 amount; (b) the maximum hotelling supplement amount" | VERIFIED |
| MAS definition | highest accommodation supplement amount prescribed for the day | | S17 s 235(3) | "the highest of the amounts prescribed by the rules" | VERIFIED |
| Low means / accommodation | MTA < MAS: low means (accommodation contribution). MTA > MAS: pays agreed room price | | S1 | "greater than the maximum accommodation supplement ($72.30), so she is not eligible" | VERIFIED |
| Daily accommodation contribution (DAC) | lower of MTA, accommodation supplement for the day, and room price expressed as a DAP | | S1 (Julie) | "she will pay the lower of" | VERIFIED |
| Full government payment of accommodation | income < IFA and assets < AFA ($36,454.60 / $66,500.00 at Sep 2026) | | S16 | "If you have income below $36,454.60 and assets below $66,500.00" | VERIFIED |
| Max resident contribution | BDF + compensation payment fee + hotelling + NCCC | | S17 s 277(1); S14 | "Add the hotelling contribution (if any)" | VERIFIED |

### Accommodation (RAD/DAP)

| parameter | value | applies from–to | source | short quote | status |
|---|---|---|---|---|---|
| Maximum accommodation payment amount (max RAD without IHACPA approval) | $550,000 | 1 Jul 2014 – 31 Dec 2024 | S11 | table | VERIFIED |
| same | $750,000 | 1 Jan 2025 – 30 Jun 2025 | S11 | table | VERIFIED |
| same | $758,627 | 1 Jul 2025 – 30 Jun 2026 | S11; S7, S6, S5 | "Maximum refundable accommodation deposit … $758,627" | VERIFIED |
| same | $789,686 | 1 Jul 2026 – 30 Jun 2027 | S11; S4, S3 | "From 1 July 2026, the maximum accommodation payment amount is $789,686" | VERIFIED |
| Indexation of max accommodation payment | annually 1 July, CPI | | S11 | "indexed annually on 1 July, in line with the Consumer Price Index" | VERIFIED |
| MPIR | 7.61% | 1 Oct – 31 Dec 2025 | S7 | "from 1 October 2025 – 31 December 2025 \| 7.61%" | VERIFIED |
| MPIR | 7.65% | 1 Jan – 31 Mar 2026 | S6; used in S1 | "from 1 January 2026 – 31 March 2026 \| 7.65%" | VERIFIED |
| MPIR | 7.96% | 1 Apr – 30 Jun 2026 | S5 | "from 1 April 2026 – 30 June 2026 \| 7.96%" | VERIFIED |
| MPIR | 8.43% | 1 Jul – 30 Sep 2026 | S4, S3 | "from 1 July 2026 – 30 September 2026" | VERIFIED |
| MPIR (current) | 8.51% | 1 Oct – 31 Dec 2026 | S3 | "from 1 October 2026 – 31 December 2026 … 8.51%" | VERIFIED |
| MPIR application rule | MPIR on the day the room price was agreed. Low-means: MPIR at date of entry | | S3 note 4; S1 | "use the MPIR current on the day the room price was agreed" | VERIFIED |
| DAP formula | DAP = (agreed room price − RAD paid) × MPIR / 365 | | S1 | "= RAD × MPIR / 365" | VERIFIED |
| Base Interest Rate | 2.75% from 1 Oct 2025; 3.25% from 1 Apr 2026; 3.75% from 1 Oct 2026 | | S7/S5/S3 | table | VERIFIED |
| DAP index numbers | 1.00 (20 Sep 2025), 1.02 (20 Mar 2026), 1.04 (20 Sep 2026). Indexed 20 Mar and 20 Sep; first indexation 20 Mar 2026 | | S3, S7; S1 | "The first round of DAP indexation will occur on 20 March 2026" (S7) | VERIFIED |
| RAD/RAC retention | 2% p.a., daily on balance, for 5 years from the day the refundable deposit was first paid; deducted at least once per 3 months and no more than once a month | 1 Nov 2025 arrangements (and some 1 July 2014 fee-arrangement entrants after 31 Oct 2025) | S17 s 308(1)–(4); S10 | "calculated at a rate of 2 per cent per annum: (a) on a daily basis" | VERIFIED |
| Retention daily formula | balance × 2% / 365 | | S10 | "multiply the RAD or RAC balance by 2% then divide by 365" | VERIFIED |
| Minimum permissible asset level | $63,000 (Nov25), $64,500 (Mar26/Jul26), $66,500 (Sep26) | | S7/S5/S3; Act s 305(2) | "rounding to the nearest $500.00 (rounding $250.00 upwards)" | VERIFIED |

### Grandfathering (pre-1 November 2025 residents)

| parameter | value | source | short quote | status |
|---|---|---|---|---|
| Residents in care on or before 31 Oct 2025 | keep existing fees and accommodation costs unless they opt in to the 1 Nov 2025 arrangements (opt-in is irreversible) | S16; S12; S14 | "your current resident fees and accommodation costs will stay the same" (S16) | VERIFIED |
| Entered 1 Jul 2014 – 31 Oct 2025 | stay on 1 July 2014 fee arrangements (means tested care fee with annual and lifetime caps) if in care on 1 Nov 2025 or exited for no more than 28 days | S12; S13 | "Means tested fees for residents on the 1 July 2014 fee arrangements did not change" (S13) | VERIFIED |
| Pre-1 July 2014 entrants | stay on pre-1 July 2014 arrangements (income tested fee); can opt in to the 2025 arrangements only | S12; S8 | "can opt in to the 1 November 2025 fee arrangements" | VERIFIED |
| "No worse off" cohort | people approved for or receiving a Home Care Package on 12 Sep 2024 who enter on or after 1 Nov 2025 go onto the 1 July 2014 fee arrangements | S12; S16 | "were approved for or receiving a Home Care Package on 12 September 2024" | VERIFIED |
| Legal basis | Rules s 275A-5: Div 2 Pt 3 Ch 4 of the Act (resident contribution) does not apply to the pre-2014 or post-2014 residential contribution classes | S18 | "not to apply to transitional cohorts" | VERIFIED |
| Post-2014 means tested care fee caps | annual $35,238.11 / lifetime $84,571.66 (Nov25); $35,910.43 / $86,185.23 (Mar26, Jul26); $37,055.98 / $88,934.57 (Sep26) | S7/S5/S4/S3; S16 | "Annual cap \| $37,055.98" | VERIFIED |
| Post-2014 MTCF daily max | $403.80 (from 1 Oct 2025); $370.39 (from 1 Apr 2026); $372.03 (from 1 Jul 2026); $380.46 (from 1 Oct 2026) | S7/S5/S4/S3 | table | VERIFIED |

### Support at Home

| parameter | value | source | status |
|---|---|---|---|
| Primary page for Support at Home contributions | https://www.myagedcare.gov.au/support-at-home-costs-and-contributions (also a fee estimator at https://www.myagedcare.gov.au/support-at-home-fee-estimator) | S16 links, S20 | VERIFIED (exists; content not read, as instructed) |

### Services Australia

| parameter | status |
|---|---|
| Services Australia aged care means test pages (MTA calculation, thresholds) | NOT-FOUND (URLs tried returned 404 or an error). The values are covered by S3–S7, S17 and S19 instead |

## Fee scenarios on scenarios2025 (S1)

The page says: "The rates and thresholds used in these scenarios were current on 20 March 2026." Parameters used: BDF $66.80, MAS $72.30, max hotelling $22.15, NCCC cap $107.32, lifetime cap printed as $137,910.01, single IFA $35,313.20 / couple $34,585.20, AFA $64,500, thresholds per the P-Mar26 column, home exemption cap $214,884, MPIR 7.65% (that is the 1 Jan – 31 Mar 2026 MPIR, so it is consistent with a room price agreed 20–31 Mar 2026). This is **parameter set P-Mar26**.

| Scenario | Inputs | Income tested / asset tested (per day) | MTA | Hotelling | NCCC | Accommodation | BDF |
|---|---|---|---|---|---|---|---|
| Full pensioner – Mario | income $32,000, assets $15,000, renter | below IFA / below AFA | 0 (not stated as a number) | 0 | 0 | Government pays full accommodation | $66.80 |
| Self-funded retiree – Sakura | income $52,000; home $960,000 capped at $214,884 + $340,000 = $554,884 | $22.92 / $98.41 | **$121.33** | **$22.15** (121.33 − 72.30 = 49.03 > 22.15) | **$26.88** (121.33 − 94.45) | Room price RAD $650,000 = DAP $136.23 (650,000 × 7.65%/365). Partial RAD $250,000, so DAP $83.84 | $66.80 |
| Part pensioner – Julie (Raj at home, protected person) | income $44,000, assets $78,000 | $12.93 / $6.49 | **$19.42** | **0** (19.42 − 72.30 < 0) | **0** | Low means. DAC $19.42 (government pays 72.30 − 19.42 = $52.88). Room price RAD $440,000 / DAP $92.22. With partial RAC $40,000: equivalent $8.38/day, reduced DAC $11.04 | $66.80 |
| Part pensioner – Raj (home counted at $214,884) | income $44,000, assets $78,000 + $214,884 = $292,884 | $12.93 / $79.77 | **$92.70** | **$20.40** (92.70 − 72.30) | **0** (hotelling < $22.15) | Not low means. RAD $450,000 = DAP $94.32. Partial RAD $100,000, so DAP $73.36 | $66.80 |
| Couple – keep home, Raj pays DAP, Julie DAC | Julie's assets rise to $292,884 | as Raj | $92.70 (Julie) | $20.40 ("means tested contributions of $20.40") | 0 | Julie's DAC rises to $72.30 (lower of 92.70, 72.30, 92.22) | — |
| Couple – sell home ($600,000), Raj DAP, Julie DAC | each has assets $378,000 | $12.93 / $94.45 | **$107.38** | **$22.15** (107.38 − 72.30 = 35.08 > 22.15) | **$12.93** (107.38 − 94.45) | Julie's DAC $72.30. Raj's DAP stays $94.32 | — |
| Couple – sell home, Raj pays RAD $450,000, Julie DAC | each has assets $378,000 (RAD is an assessable asset) | — | $107.38 | (means tested contributions $35.08) | (same as above) | Julie's DAC $72.30 | — |

The page reports "means tested contributions" of $35.08 = hotelling $22.15 + NCCC $12.93.

## Appendix B fixture checks

All five fixtures use the P-Mar26 parameter set (MAS $72.30, max hotelling $22.15, NCCC cap $107.32; valid 20 Mar 2026 – 19 Sep 2026, and unchanged by the 1 Jul 2026 schedule). Formulas from Act s 278 / s 279.

- **AC-001 (Sakura, MTA 121.33)**: ACCEPT. hotelling = min(22.15, 121.33 − 72.30 = 49.03) = 22.15. NCCC = min(107.32, 121.33 − (72.30 + 22.15) = 26.88) = 26.88. Matches S1.
- **AC-002 (Raj, MTA 92.70)**: ACCEPT. hotelling = min(22.15, 92.70 − 72.30 = 20.40) = 20.40. NCCC: 92.70 ≤ 94.45, so 0. Matches S1.
- **AC-003 (Julie, MTA 19.42)**: ACCEPT. 19.42 ≤ 72.30, so hotelling 0 and NCCC 0. Matches S1.
- **AC-004 (MTA 107.38)**: ACCEPT. hotelling = min(22.15, 35.08) = 22.15. NCCC = min(107.32, 107.38 − 94.45 = 12.93) = 12.93. Matches S1. The fixture's source reference "scenario (fourth)" should read **"Couple – Julie and Raj (sell family home)"**.
- **AC-005 (MTA 250.00)**: ACCEPT (DERIVED, not on S1). hotelling = 22.15. NCCC = min(107.32, 250 − 94.45 = 155.55) = **107.32**. This holds only for 20 Mar 2026 – 19 Sep 2026. Fixtures must be effective-dated:

DERIVED expected outputs for the same MTA inputs under other parameter sets (for date-sensitivity tests):

| MTA | P-Nov25 (MAS 70.94, cap 105.30) hotelling / NCCC | P-Mar26 (MAS 72.30, cap 107.32) | P-Sep26 (MAS 73.73, cap 109.45) |
|---|---|---|---|
| 121.33 | 22.15 / 28.24 | 22.15 / 26.88 | 22.15 / 25.45 |
| 92.70 | 21.76 / 0 | 20.40 / 0 | 18.97 / 0 |
| 19.42 | 0 / 0 | 0 / 0 | 0 / 0 |
| 107.38 | 22.15 / 14.29 | 22.15 / 12.93 | 22.15 / 11.50 |
| 250.00 | 22.15 / 105.30 | 22.15 / 107.32 | 22.15 / 109.45 |

MTA input check (S1 arithmetic recomputed from P-Mar26 thresholds):
- Sakura income (52,000 − 35,313.20) × 50% / 364 = 22.9214 → 22.92. Assets [17.5% × 150,384 + 7.8% × 103,366.66 + 7.8% × 18,500] / 364 = 35,822.80 / 364 = 98.4143 → 98.41. MTA 121.33.
- Julie / Raj income (44,000 − 34,585.20) × 50% / 364 = 12.9324 → 12.93. Julie assets 13,500 × 17.5% / 364 = 6.4904 → 6.49, so MTA 19.42.
- Raj assets [26,317.20 + 7.8% × 34,884 = 2,720.952] / 364 = 79.7751. The page shows **79.77**, which is consistent only with rounding **down**. Nearest-cent rounding gives 79.78 and MTA 92.71. See the rounding section.
- Couple assets [26,317.20 + 8,062.60] / 364 = 94.45 exactly (using the page's rounded 8,062.60), so MTA 107.38.

## Discrepancies vs research

1. **MAS $72.30 effective date is wrong in Appendix A** (`effective_from: 2025-11-01, effective_to: null`). The primary values are $70.94 (1 Nov 2025 – 19 Mar 2026), $72.30 (20 Mar 2026 – 19 Sep 2026) and $73.73 (from 20 Sep 2026).
2. **NCCC daily cap $107.32** (`effective_from: null`). The primary values are $105.30 (1 Nov 2025 – 19 Mar 2026), $107.32 (20 Mar – 19 Sep 2026) and $109.45 (from 20 Sep 2026; current). The research's "conflict" is resolved as indexation. **$101.16 does not appear in any primary schedule read** (Nov 2025 onward), so it cannot be verified.
3. **NCCC lifetime cap**: $135,318.69 (1 Nov 2025) is confirmed. The research's "$137,917" is exactly **$137,917.01** (20 Mar 2026). The current value **$140,652.80** (from 20 Sep 2026) is missing from the research. The scenarios page itself prints **$137,910.01** (CONFLICT with Schedule and Rules 7-20; treat it as a typo).
4. The **4-year cap** is legally 1,460 days, not necessarily consecutive (Rules 279-10).
5. **Basic daily fee 85% rule**: the research flagged it SECONDARY (The Conversation). It is now VERIFIED in Act s 277(2)(b) ("rounding down to the nearest cent") and on the health.gov.au basic daily fee page. Dollar values: $65.55 / $66.80 / $68.93.
6. **The scenarios page is not "as at 1 Nov 2025"** (research HEALTH-AC title and fixture framing). The page explicitly uses rates current on 20 March 2026. MPIR 7.65% is the 1 Jan – 31 Mar 2026 rate.
7. **The research said the Schedule of Fees and Charges "was not retrieved"**. It has now been retrieved for 1 Nov 2025, 1 Jan 2026, 20 Mar 2026, 1 Jul 2026 and 20 Sep 2026 (full values above).
8. **NCCC formula**: the research's formula (MTA − MAS − *max hotelling supplement*) matches Act s 279 exactly. The scenarios page text says "hotelling contribution ($22.15)", which is numerically the same whenever NCCC > 0.
9. **The 17.5%/1% (and 2%) asset tiers** apply only to the grandfathered post-2014 class (Rules 319-20). The 2025 arrangements use 17.5% / 0 / 7.8% / 0 / 7.8% with four asset thresholds and 50% / 0 / 50% / 0 / 50% income tiers with four income thresholds (Act s 319).
10. **Grandfathering**: the research's statement is broadly correct but incomplete. Pre-1 July 2014 residents stay on pre-2014 arrangements (income tested fee). The "no worse off" Home Care Package cohort (approved or receiving at 12 Sep 2024) entering on or after 1 Nov 2025 goes onto 1 July 2014 fee arrangements. Opt-in to 2025 arrangements is possible and irreversible.
11. **AC-004** source reference "scenario (fourth)" should be "Couple – Julie and Raj (sell family home)".
12. **Hotelling/NCCC are set to zero for some classes** (dependent child, former POW, informed more than 6 months after entry, and others; Rules 280-5). The Guide also mentions a "< $1" zeroing. The engine needs these flags; the research omits them.
13. Max accommodation payment amount: $758,627 (1 Jul 2025 – 30 Jun 2026) and $789,686 (from 1 Jul 2026). Neither is in Appendix A.

## Rounding / formula rules

- Basic daily fee: "rounding down to the nearest cent the amount equal to 85% of the basic age pension amount (worked out on a per day basis)" (Act s 277(2)(b)). Check: $68.93 × 365 = $25,159.45, matching S16.
- Minimum permissible asset value: "rounding to the nearest $500.00 (rounding $250.00 upwards)" of 2.25 × basic age pension (Act s 305(2)).
- MTA: Act s 319 divides annual amounts by **364** and states no rounding rule. The Services Australia rounding rule was not found. Empirically, S1 rounds the income and asset tested amounts separately to cents before summing. The Raj figure (79.7751 → 79.77) shows **rounding down**. All other S1 components are consistent with either rounding down or nearest-cent. Tier products appear rounded to cents first (e.g. 7.8% × 103,366.66 = 8,062.59948 shown as $8,062.60). **Open item**: confirm the Services Australia rounding method before relying on cent-exact MTA outputs.
- DAP / RAC equivalence: RAD × MPIR / **365**, nearest cent. 400,000 × 7.65%/365 = 83.8356 → $83.84; 450,000 → 94.3151 → $94.32.
- Retention: balance × 2% / 365, nearest cent in examples (200,000 → $10.96; 100,000 → $5.48; 90,000 → $4.93) (S10).
- Hotelling/NCCC: computed directly on the cent-rounded MTA. No further rounding is needed.
- Caps: "The cap amount that applies for a resident is the amount current at the time the resident reaches the cap" (S8).
- Indexation: BDF, hotelling supplement, NCCC caps and income/asset thresholds are indexed on 20 March and 20 September. Max accommodation payment is indexed on 1 July (CPI). MPIR is set quarterly. Some income thresholds also moved on 1 July 2026 (S4).

## Summary

- Every core 1 Nov 2025 parameter is VERIFIED against the official Schedules of Fees and Charges (1 Nov 2025, 1 Jan 2026, 20 Mar 2026, 1 Jul 2026, 20 Sep 2026), Aged Care Act 2024 ss 235, 277, 278, 279, 305, 308 and 319, and Aged Care Rules 2025 Compilations 10 and 11.
- Current (from 20 Sep 2026): BDF $68.93, max hotelling $22.15, MAS $73.73, NCCC cap $109.45/day, lifetime cap $140,652.80, 1,460-day cap, MPIR 8.51% (Oct–Dec 2026), max RAD $789,686.
- The scenarios2025 page uses the **20 March 2026** set (MAS $72.30, NCCC cap $107.32, BDF $66.80, MPIR 7.65%), not 1 Nov 2025 values.
- Fixtures AC-001 to AC-005 are all ACCEPTED for the 20 Mar – 19 Sep 2026 window. They must be effective-dated; the table above gives derived outputs for the other windows.
- The ordering logic in the research is exactly Act s 278/279. The 17.5%/1%/2% tiers are post-2014 class only.
- Corrections: the MAS and NCCC effective dates in Appendix A are wrong. $101.16 is not found in any primary schedule read. The scenarios page lifetime cap $137,910.01 is a typo for $137,917.01.
- Open item: the MTA cent-rounding method (S1 implies rounding down) is not stated in primary text found. Services Australia pages could not be retrieved.
- Grandfathering is VERIFIED: pre-1 Nov 2025 residents and the HCP "no worse off" cohort stay on older arrangements unless they opt in. RAD/RAC retention is 2% p.a. daily for 5 years (Act s 308).
