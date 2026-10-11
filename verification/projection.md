# Verification: projection domain

Verified 2026-10-11 against primary sources only. Values are recorded as read. Quotes are kept under 15 words.

## URLs read

| URL | What it is | Last updated / version shown |
|---|---|---|
| https://www.legislation.gov.au/F2022L00895/latest/text | ASIC Corporations (Superannuation Calculators and Retirement Estimates) Instrument 2022/603. Compiled text read in the register's document viewer. | Compilation No. 1 (F2024C00852), compilation date 11/09/2024. Includes amendments up to ASIC Corporations (Amendment) Instrument 2024/733 (F2024L01117). The register shows no later compilation. |
| https://www.legislation.gov.au/F2026L00271/latest/text | ASIC Corporations (Generic Calculators) Instrument 2026/41. As-made text read in the register's document viewer. | F2026L00271, dated 18 March 2026 on the register. The instrument is signed "Date 17 March 2026" (Kate Metz, ASIC delegate). |
| https://www.asic.gov.au/about-asic/news-centre/news-items/asic-updates-superannuation-forecasts-relief-instrument/ | ASIC news item on the change from 4% to 3.7% | No date shown |
| https://www.asic.gov.au/regulatory-resources/find-a-document/regulatory-guides/rg-276-superannuation-forecasts-calculators-and-retirement-estimates | RG 276 landing page | "Issued 13 September 2024". The PDF filename contains 20260402. |
| https://moneysmart.gov.au/how-super-works/superannuation-calculator | MoneySmart superannuation calculator and its assumptions | "Last updated: 2 July 2026" |
| https://moneysmart.gov.au/retirement-income-sources/account-based-pension-calculator (redirected from /retirement-income/account-based-pension-calculator) | MoneySmart account-based pension calculator and its assumptions | "Last updated: 2 July 2026" |
| https://aga.gov.au/publications/life-tables | AGA list of Australian Life Tables editions | No last-updated date. Release dates are listed. |
| https://aga.gov.au/publications/life-tables/australian-life-tables-2020-22 | Australian Life Tables 2020-22 | Release date 12 December 2024 |

Not used: the ATO minimum pension factors, which another agent covers.

## Parameter table

### A. ASIC Corporations (Superannuation Calculators and Retirement Estimates) Instrument 2022/603 (F2022L00895)

| parameter | value | applies from–to | source URL | short quote | status |
|---|---|---|---|---|---|
| Exact title | "ASIC Corporations (Superannuation Calculators and Retirement Estimates) Instrument 2022/603" | n/a | legislation.gov.au F2022L00895 | s1 "This is the ASIC Corporations (Superannuation Calculators and Retirement Estimates) Instrument 2022/603" | VERIFIED |
| Commencement | 01/07/2022 (registered 30/06/2022) | from 2022-07-01 | F2022L00895, Endnote 3 | Legislation history: "30/06/2022 (see F2022L00895) … 01/07/2022" | VERIFIED |
| Amendment 2024/733 | Registered 10/09/2024, commenced 11/09/2024. It substituted paragraphs (a) and (b) of the "present value" definition. | from 2024-09-11 | F2022L00895, Endnotes 3 and 4 | "s 4 par (a) of the def of present value … rs 2024/733" | VERIFIED |
| Repeal date | Repealed on 1 July 2027 | in force to 2027-07-01 | F2022L00895 s8 | s8 "This instrument is repealed on 1 July 2027." | VERIFIED |
| Default nominal wage inflation (pre-retirement deflator r) | 0.037 | Either 0.037 or 0.04 from 2024-09-11 to 2024-12-31. 0.037 only from 2025-01-01. Before 2024-09-11 the rate was 4% (per the Note). | F2022L00895 s4, def "present value", paras (a) and (b), r(i)–(ii) | "if this formula is used on or after 1 January 2025—0.037" | VERIFIED |
| Basis for 3.7% | 2023 Intergenerational Report long-term nominal wage growth. The previous 4% came from the 2021 IGR. | — | s4, Note to r | "long-term forecast of nominal wage growth in the Government's 2023 Intergenerational Report" | VERIFIED |
| Default CPI (post-retirement deflator s) | 0.025 | 2022-07-01 to 2027-07-01 | s4, def "present value", paras (b) and (c) | "s is 0.025 or such other assumed inflation rate" | VERIFIED |
| Basis for 2.5% | Mid-point of the RBA CPI target range | — | s4, Note to s | "mid-point of the Reserve Bank of Australia's target range" | VERIFIED |
| Present-value formula, before the assumed retirement age | PV = C / (1+r)^n. n = "years and part years" from the present date to the payment date. | — | s4, def "present value" para (a) | "n is the number of years and part years" | VERIFIED |
| Present-value formula, at or after retirement, person not yet retired | PV = C / [(1+r)^a × (1+s)^b]. a runs from the present date to the assumed retirement age. b runs from the assumed retirement age to the payment date (0 if paid at retirement). | — | s4 para (b) | "b is the number of years and part years between the assumed retirement age" | VERIFIED |
| Present-value formula, person already at the assumed retirement age | PV = C / (1+s)^b | — | s4 para (c) | "where the person has already reached the assumed retirement age" | VERIFIED |
| Requirement to show present value | A superannuation calculator or retirement estimate must show the present value and say that it is the present value | — | s7(1)(f)(iv) | "a clear and prominent statement setting out the present value" | VERIFIED |
| Default retirement age ("assumed retirement age") | 67 if the person is under 67 or their age is unknown. If 67 or over, the age at their next birthday. If the user entered an age, the greater of that age and preservation age (if known). If the person is known to be in retirement phase, their current age. | 2022-07-01 to 2027-07-01 | s4, def "assumed retirement age" | "if the age of the person is less than 67 years … 67 years of age" | VERIFIED |
| Calculator must use the assumed retirement age | Applies if the calculator uses a retirement age | — | s7(1)(a)(i) | "if the calculator uses a retirement age for the user—the assumed retirement age" | VERIFIED |
| Drawdown / longevity ("assumed drawdown period") | Starts at the assumed retirement age, or at the calculation date if already in retirement phase. Ends on, or within 12 months before, the later of age 92 and 5 years after the start. | 2022-07-01 to 2027-07-01 | s4, def "assumed drawdown period" (a)(i)–(ii), (b)(i)–(ii) | "the person reaching 92 years of age" | VERIFIED |
| Calculator must use the drawdown period | Applies if the calculator uses a drawdown period. Uses the assumed drawdown period or one the user entered. | — | s7(1)(a)(ii) | "the assumed drawdown period or a drawdown period inputted by the user" | VERIFIED |
| Drawdown assumptions (retirement estimates) | Without Age Pension: present value of each annual payment is constant and the account reaches zero at the end of the period. With Age Pension: present value of (income plus Age Pension) is maximised and constant, and the account reaches zero at or before the end. | — | s4, def "drawdown assumptions" (a), (b) | "results in the member's account being drawn down to zero" | VERIFIED |
| Default Age Pension assumptions (retirement estimates) | Has a partner. Couple jointly owns the home. Partner has the same lump sum. No other assets or income. Member gets half of the couple's pension. | — | s4, def "default age pension assumptions" (a)–(e); "drawdown assumptions" (b)(iii) | "the member and their partner jointly own their own home" | VERIFIED |
| Statutory assumptions | Include tax rates, minimum drawdown rules and the SG rate | — | s4, def "statutory assumption" and Note | "minimum drawdown rules for payments of superannuation pensions" | VERIFIED |
| Investment return, fee and insurance assumptions | None prescribed. Defaults must be "reasonable", and the provider must explain why. Users must be able to change every assumption except statutory and drawdown-manner assumptions. | — | s7(1)(e), (g), (d)(i) | "are reasonable for the purpose of working out the calculation or estimate" | VERIFIED (no numeric default exists) |
| Record keeping | Keep a functioning copy for 7 years from when the calculator or estimate is **last** made available | — | s7(1)(i) | "for 7 years from when the superannuation calculator or retirement estimate is last made available" | VERIFIED |
| Retirement-estimate eligibility | Balance of at least $6,000. Member for the year to the estimate date. Contribution within the last 16 months. Not a TRIS. Not a defined benefit. | — | s6(2)(a)–(f) | "equal to or greater than $6000 at the date of the estimate" | VERIFIED |

### B. ASIC Corporations (Generic Calculators) Instrument 2026/41 (F2026L00271)

| parameter | value | applies from–to | source URL | short quote | status |
|---|---|---|---|---|---|
| Made (signed) | 17 March 2026 | — | F2026L00271, preamble | "Date 17 March 2026" | VERIFIED |
| Registration | 18 March 2026 (date shown on the register entry) | — | F2026L00271 register page | "F2026L00271 18 March 2026" | VERIFIED |
| Commencement rule | The day after registration | — | s2 | "commences on the day after it is registered" | VERIFIED |
| Commencement date | 19 March 2026 | from 2026-03-19 | s2 plus register date | 18 March 2026 + 1 day | DERIVED |
| Repeal / end of relief | Repealed at the start of 1 April 2031 | to 2031-04-01 | s9 | "This instrument is repealed at the start of 1 April 2031." | VERIFIED |
| Predecessor repealed | 2016/207, repealed in full | from 2026-03-19 | Schedule 1 item 1 | "Repeal the instrument." | VERIFIED |
| Default inflation rate (r) in present value | 0.025 | 2026-03-19 to 2031-04-01 | s6, def "present value" | "r is 0.025 or such other assumed inflation rate" | VERIFIED |
| Basis for 2.5% | RBA target mid-point "over the cycle" | — | s6, Note | "mid-point of the Reserve Bank of Australia's target range for inflation over the cycle" | VERIFIED |
| Present-value formula variables | C = future amount. n = years and part years to payment. r as above. The formula itself is an image and did not render as text, so its exact form was not read. | — | s6 | "n is the number of years and part years" | VERIFIED (variables only; formula NOT-FOUND as text) |
| Present-value formula (follow-up 2026-10-11, orchestrator) | PV = C / (1 + r)^n. The register's epub (https://www.legislation.gov.au/F2026L00271/asmade/2026-03-18/text/original/epub/OEBPS/document_1/document_1.html) gives the formula image (image.002.png, the only formula in the instrument) the alt text "start fraction C over open round bracket 1 plus r close bracket to the power of n end fraction" | 2026-03-19 to 2031-04-01 | F2026L00271 epub, s6 | alt text quoted | VERIFIED (resolves the NOT-FOUND above) |
| When present value must be shown | Only for estimates of an amount payable 2 or more years in the future | — | s8(1)(e)(iv) | "payable at a future time of 2 or more years" | VERIFIED |
| Exclusion: superannuation | "Financial calculator" excludes superannuation calculators. A superannuation calculator is anything relating to a superannuation product or an RSA product. | — | s5; s6 defs "financial calculator", "superannuation calculator" | "other than a superannuation calculator" | VERIFIED |
| Relief limbs | (a) no AFS licence needed (s911A(1)). (b) Licensees are exempt from Divisions 2, 3 and 4 of Part 7.7. | — | s7(1)(a)–(b) | "Divisions 2, 3 and 4 of Part 7.7 of the Act" | VERIFIED |
| Breach exclusion | Relief is lost once 30 days pass after the provider knew of, or was reckless about, a non-immaterial unnotified breach | — | s7(2) | "30 days have elapsed" | VERIFIED |
| Conditions | No product promotion. Users can change non-statutory defaults. Defaults reasonable and explained. Purpose, limitations and assumptions stated. Present value shown. Not-advice warning. Results printable or storable. | — | s8(1)(a)–(g), s8(2) | "does not advertise or promote a specific financial product" | VERIFIED |
| Record keeping | 7 years from when the calculator is **first** made available | — | s8(1)(g) | "keeps a copy of the financial calculator for 7 years from when it is first made available" | VERIFIED |
| Definition of "assumptions" | Factors the user may change | — | s6 | "the factors (which may be changed by the user)" | VERIFIED |

### C. MoneySmart superannuation calculator (Last updated 2 July 2026)

| parameter | value | applies from–to | source URL | short quote | status |
|---|---|---|---|---|---|
| Inflation defaults | CPI of 2.5% plus a further 1.2% for rising living standards (3.7% combined, additive) | current (page dated 2026-07-02) | moneysmart super calculator | "A further 1.2% each year due to the cost of rising community living standards" | VERIFIED (combined 3.7% is DERIVED: 2.5 + 1.2) |
| Results basis | Today's dollars | current | same | "Results are shown in today's dollars" | VERIFIED |
| Default insurance premium | $599 a year, charged mid-year, indexed with inflation | current | same | "$599 will be charged mid-year on average" | VERIFIED |
| Administration fees | Dollar fees are charged mid-year and indexed with inflation. Percentage fees are charged mid-year. | current | same | "dollar per annum administration fees will be charged mid-year on average" | VERIFIED |
| Cash-flow timing | All income and outgoings mid-year. Government co-contributions at year end. | current | same | "apart from Government co-contributions which we assume are received at the end" | VERIFIED |
| Return basis | Net of tax and net of investment fees | current | same | "returns are net of tax and net of investment fees" | VERIFIED |
| Default returns (% p.a.) | Cash 3.7. Conservative 4.9. Moderate 5.7. Balanced 6.1. Growth 6.4. High Growth 6.8. Source: WTW Global Asset Model outlook, June 2026. | current | same | "Cash 3.7% Conservative 4.9% Moderate 5.7% Balanced 6.1%" | VERIFIED |
| Result timing | Balance shown at 1 July after reaching the age shown | current | same | "Your projected super balance is shown at 1 July" | VERIFIED |
| Default retirement age | 67. This appears only in page script (`ageR: 67`), not in the documented assumptions. The input range is 60–75. | current | same | "ageR: 67" | VERIFIED (page source) |
| Employer contribution | 12% of ordinary time earnings | current | same | "an amount equal to 12% of your ordinary time earnings" | VERIFIED |
| Contributions tax | 15% on employer and salary-sacrifice contributions | current | same | "15% tax is deducted from your employer contributions" | VERIFIED |
| Concessional cap (cross-reference only) | $32,500 at 1 July 2026 | FY2026-27 | same | "At 1 July 2026, the concessional contribution cap is $32,500" | VERIFIED (secondary to the ATO, which another agent covers) |
| Transfer balance cap (cross-reference only) | $2,100,000 at 1 July 2026, CPI-indexed in $100,000 steps | FY2026-27 | same | "transfer balance cap is $2,100,000 at 1 July 2026" | VERIFIED (cross-reference) |

### D. MoneySmart account-based pension calculator (Last updated 2 July 2026)

| parameter | value | applies from–to | source URL | short quote | status |
|---|---|---|---|---|---|
| CPI default | 2.5% | current | moneysmart ABP calculator | "CPI inflation of 2.5% each year" | VERIFIED |
| Wage inflation default | 3.7% | current | same | "Wage Inflation of 3.7% each year" | VERIFIED |
| Two-stage deflator | Wage inflation up to retirement, CPI in retirement. CPI drives retirement income and the today's-dollar adjustment. | current | same | "Wage Inflation assumption is used for the period up to retirement" | VERIFIED |
| Fee indexation | Wage inflation inflates dollar administration and adviser fees. The admin-fee paragraph instead says "increase with inflation", so the page is internally inconsistent. | current | same | "Wage Inflation is used to inflate: $ per annum Administration Fees and Advisor Fees" | VERIFIED (note the inconsistency) |
| Fee timing | Dollar and percentage fees are charged mid-year | current | same | "administration fees are charged mid-year on average" | VERIFIED |
| Return basis | Gross of tax, net of investment fees | current | same | "returns are gross of tax and net of investment fees" | VERIFIED |
| Default returns (% p.a.) | Cash 4.3. Conservative 5.6. Moderate 6.3. Balanced 6.7. Growth 6.9. High Growth 7.2. | current | same | "Cash 4.3% Conservative 5.6% Moderate 6.3% Balanced 6.7%" | VERIFIED |
| Minimum drawdown | Applied every year, which can raise income in some years | current | same | "applies the minimum drawdown rules annually" | VERIFIED |
| Result timing | Balance shown at 1 July after reaching the age shown | current | same | "projected account-based pension balance is shown at 1 July" | VERIFIED |
| Age Pension / tax | Age Pension and other investments excluded. No tax allowance. | current | same | "Income from the Government age pension … is not included" | VERIFIED |
| Life-expectancy assumption | None stated | — | same | — | NOT-FOUND (not on the page) |

### E. Australian Government Actuary: Australian Life Tables

| parameter | value | applies from–to | source URL | short quote | status |
|---|---|---|---|---|---|
| Latest edition | Australian Life Tables 2020-22 | released 2024-12-12 | aga.gov.au/publications/life-tables/australian-life-tables-2020-22 | "Release Date 12 December 2024" | VERIFIED |
| Publication cycle | Every 5 years, from 3 years of data centred on each Census year | — | same | "released every 5 years, based on 3 years' information" | VERIFIED |
| Data format | Excel downloads: Australian Life Tables (29KB), All tables (154KB), Historical mortality rates and life expectancies (74KB), Improvement factors (17KB). The report is also offered as PDF and DOCX. Nothing was downloaded. | — | same | "Tables: Excel" | VERIFIED |
| Life expectancy at birth, 2021 | Males 81.3. Females 85.3. | 2021 | same | "81.3 years and 85.3 years in 2021 for males and females" | VERIFIED |
| Life expectancy at age 65 | Not shown on the page. It is only in the Excel files, which were not downloaded. | — | same | — | NOT-FOUND |
| Earlier editions | 2015-17 (2019-12-05), 2010-12 (2014-12-10), 2005-07 (2009-11-27), 2000-02 (2004-06-25), 1995-97 (1999-08-01) | — | aga.gov.au/publications/life-tables | — | VERIFIED |

## Appendix B fixture checks

**PRJ-001: wage deflator over 30 years. ACCEPT.**
- Basis: Instrument 2022/603 s4, "present value" para (a). PV = C/(1+r)^n, with r = 0.037 (VERIFIED, on or after 1 Jan 2025), n = 30, C = 1,000,000.
- 1.037^30 = 2.974148791109190… (40-digit Decimal).
- 1,000,000 / 2.974148791109190 = **336,230.656…**, so $336,230.66, or $336,231 to the dollar.
- The expected value is 336,230 with tolerance 10. The difference is 0.66, which is within tolerance. ACCEPT.
- Suggest tightening the fixture to 336,230.66 (tolerance 0.01).

**DEBT-001: principal-and-interest repayment. ACCEPT.**
- i = 0.06/12 = 0.005 and n = 360.
- 1.005^360 = 6.022575212263216…
- Payment = 500,000 × 0.005 × 6.022575212263216 / (6.022575212263216 − 1) = **2,997.7526…**, which rounds to **$2,997.75**.
- Matches the expected 2,997.75. ACCEPT.

**DEBT-002: offset interest. ACCEPT.**
- Interest = (500,000 − 50,000) × 0.06/12 = 450,000 × 0.005 = **$2,250.00**.
- Matches the expected value. Without the offset it would be $2,500.00. ACCEPT.

**INS-001: PV with zero growth and zero discount. ACCEPT.** With g = d = 0 each payment's present value equals its face value, so 50,000 × 10 = **500,000**.

**INS-002: existing cover offsets need. ACCEPT.** 1,000,000 − 400,000 − 100,000 = **500,000**.

**INS-003: need is monotonic in income. ACCEPT (property).** Under the multiple method (k = 10): 800,000 at income 80,000 is no more than 900,000 at income 90,000, so need does not decrease. Any linear needs method with a non-negative income coefficient satisfies this.

**INS-004: shortfall floored at zero. ACCEPT.** max(0, 300,000 − 500,000) = **0**.

**INS-005: multiple method. ACCEPT.** 100,000 × 10 = **1,000,000**. k = 10 is a convention, not a primary-source value.

**PRJ-002 and PRJ-003 (not assigned; noted only).**
- PRJ-002 is BLOCKED here: it depends on the ATO minimum-drawdown factor, which another agent is verifying. If the 65–74 factor is confirmed at 5%, then 500,000 × 0.05 = 25,000.
- PRJ-003 is an oracle capture and cannot be checked from documents.

## Discrepancies vs research

1. **Title of 2022/603.** The research body uses "ASIC (Superannuation Calculators and Retirement Estimates) Instrument 2022/603". The registered title is "ASIC **Corporations** (Superannuation Calculators and Retirement Estimates) Instrument 2022/603".
2. **Drawdown horizon (body B5).** The research cites the 2021 draft's "a period of 25 years" and says the final wording was not verified. The final instrument (s4 "assumed drawdown period") runs to **age 92**, or 5 years after the start if later, ending on or within 12 months before that point. Treat the 25-year figure as superseded. **CONFLICT with the research; the primary text governs.**
3. **Default retirement age.** The research gives a flat 67, sourced from CSC (a secondary source). The primary definition is conditional: 67 if under 67 or age unknown; the age at next birthday if 67 or over; for user-entered ages, the greater of the input and preservation age; current age if in retirement phase. The value 67 is now VERIFIED from a primary source, but the engine needs all of these branches.
4. **Appendix A `asic_default_cpi`.**
   - The research says no primary ASIC quote was retrieved. It is now VERIFIED in 2022/603 s4 "present value" paras (b) and (c), so the source_url should change to legislation.gov.au F2022L00895.
   - effective_from is given as 2023-01-01, but the instrument commenced on **2022-07-01** (Endnote 3).
   - The same effective_from issue applies to `default_retirement_age`.
   - No primary text read supports 2023-01-01. RG 276's landing page shows no transition dates. The full RG 276 PDF was not read.
5. **Appendix A `asic_default_wage_inflation`.**
   - Value and dates are confirmed, but the transition window is more precise than the research states. Either 0.037 or 0.04 was allowed only from **11 Sep 2024** (when 2024/733 commenced) to 31 Dec 2024.
   - Before 11 Sep 2024 the default was 4%.
   - For historical recalculation, use 0.04 for 2022-07-01 to 2024-09-10, either rate for 2024-09-11 to 2024-12-31, and 0.037 from 2025-01-01.
6. **Repeal wording.** 2022/603 s8 says "repealed **on** 1 July 2027". 2026/41 s9 says "repealed **at the start of** 1 April 2031". Appendix A uses effective_to 2027-07-01 and 2031-04-01, which is consistent if effective_to is treated as exclusive.
7. **"Made" date of 2026/41.** The research summary (line 8) says "made 18 March 2026". The instrument is signed **17 March 2026**. 18 March 2026 is the register date. The body's statement "registered on 18 March 2026 and commenced on 19 March 2026" is consistent with s2.
8. **Appendix A `generic_calculator_inflation`.** It cites a 2016 media release with the note "verify carried into 2026/41". This is now VERIFIED: 2026/41 s6 sets r = 0.025. Note the new wording "over the cycle", and that present value is only required for amounts payable 2 or more years ahead (s8(1)(e)(iv)).
9. **Section numbering in 2026/41.** The research refers to "subsection 5(2)", which was the 2016/207 numbering from CS 34. In 2026/41 the exemption is s7(1), the breach exclusion is s7(2), the conditions are s8, and the definitions are s6. The simplified exclusion no longer has the "full particulars" wording.
10. **Record-keeping difference.** 2026/41 requires 7 years from when the calculator is **first** made available. 2022/603 requires 7 years from when it is **last** made available. The research does not mention this.
11. **MoneySmart superannuation calculator deflator.**
    - The research (line 337) describes a "wage deflator before retirement" for this calculator.
    - The page does not state a wage-inflation figure. It states 2.5% CPI plus "a further 1.2%" for rising living standards, which is 3.7% combined (additive).
    - Appendix A cites this page as the source for asic_default_cpi as the "post-retirement deflator". The page does not describe 2.5% as post-retirement only.
    - Only the account-based pension calculator documents the two-stage deflator explicitly.
12. **MoneySmart account-based pension calculator fee indexation.** The page is internally inconsistent: the admin-fee paragraph says "increase with inflation", while the inflation section says wage inflation inflates admin and adviser fees. The research reports wage inflation without flagging this.
13. **Return assumptions.** The current MoneySmart defaults are dated June 2026 (WTW outlook). Super calculator, net of tax: Cash 3.7, Conservative 4.9, Moderate 5.7, Balanced 6.1, Growth 6.4, High Growth 6.8. Account-based pension calculator, gross of tax: 4.3, 5.6, 6.3, 6.7, 6.9, 7.2. The research gives no figures, so these are additions rather than conflicts.
14. **Australian Life Tables.** The research names the AGA but no edition. The latest is **2020-22, released 12 Dec 2024**. Life expectancy at 65 is not shown on the page, so it is NOT-FOUND without opening the Excel files.

## Rounding / formula rules

- **2022/603 s4 "retirement estimate" (a):** amounts are "specified as amounts in dollars rounded to the nearest three significant figures". This applies to trustee retirement estimates, not explicitly to calculators.
- **2022/603 s4 "present value":** n, a and b are "the number of years and part years", so fractional exponents are intended. The formulas are:
  - before retirement: C/(1+r)^n
  - spanning retirement: C/((1+r)^a (1+s)^b)
  - already retired: C/(1+s)^b
  - r = 0.037 and s = 0.025 unless the user enters other rates.
- **2026/41 s6 "present value":** n is "years and part years" and r = 0.025 unless the user enters another rate. The formula image did not render as text.
- **2022/603 s4 "assumed drawdown period":** ends "on, or within 12 months before" the later of age 92 and 5 years after the start. This tolerance allows annual-step models.
- **2022/603 s4 "drawdown assumptions":** payments are such that the "present value of each annual income payment being constant" and the account is drawn "to zero at the end of the drawdown period".
- **MoneySmart (both calculators):** cash flows are mid-year (super calculator co-contributions at year end), results are shown at 1 July, and the account-based pension calculator applies minimum drawdown annually.

## Summary

- **Instrument 2022/603 is read in full** (Compilation No. 1, 11/09/2024).
  - Wage deflator: r = 0.037 from 1 Jan 2025, with either 0.04 or 0.037 allowed from 11 Sep to 31 Dec 2024.
  - CPI deflator after retirement: s = 0.025.
  - Present-value formulas are in the s4 definition, and the present-value statement requirement is in s7(1)(f)(iv).
  - Default retirement age is 67, with conditional branches. The drawdown period runs to **age 92**, not the draft's 25 years.
  - No numeric return, fee or insurance defaults are prescribed; defaults need only be "reasonable" (s7(1)(e)).
  - Repealed on 1 July 2027 (s8).
- **Instrument 2026/41 is read in full.** It was signed 17 Mar 2026 and registered 18 Mar 2026, and commences the day after registration, which is 19 Mar 2026 (s2). It is repealed at the start of 1 April 2031 (s9). The default inflation rate is 0.025 (s6). It excludes superannuation and RSA calculators (s5, s6). It repeals 2016/207.
- **MoneySmart (both pages updated 2 July 2026)** confirms:
  - $599 insurance premium, charged mid-year and indexed.
  - Fees charged mid-year.
  - Results at 1 July and in today's dollars.
  - Super calculator returns are net of tax; account-based pension returns are gross of tax.
  - The account-based pension calculator uses wage inflation of 3.7% before retirement and CPI of 2.5% after.
  - The super calculator expresses 3.7% as 2.5% CPI plus 1.2% living standards.
- **AGA:** the latest edition is Australian Life Tables 2020-22 (released 12 Dec 2024). Life expectancy at birth in 2021 was 81.3 for males and 85.3 for females. Life expectancy at 65 is not on the page.
- **Fixtures:** all ACCEPT. PRJ-001 = 336,230.66. DEBT-001 = 2,997.75. DEBT-002 = 2,250.00. INS-001 to INS-005 recompute as expected.
- **Corrections needed in the research:** the drawdown horizon; effective_from 2022-07-01, not 2023-01-01; the instrument title; the 2026/41 made date (17 March, not 18 March); and the source URLs, which should now point to legislation.gov.au.
