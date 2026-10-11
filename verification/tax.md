# Verification — domain `tax`

Verified 2026-10-11 against primary sources only. Already verified by the orchestrator (not redone here): the ATO "Tax rates – Australian resident" page (last updated 13 Aug 2026). It shows the 2024-25 and 2025-26 scales (16/30/37/45%, bases 4,288 / 31,288 / 51,638) and the 2026-27 scale (15%, bases 4,020 / 31,020 / 51,370). That page has no 2027-28 table.

## URLs read

| # | URL | Last updated / version |
|---|-----|------------------------|
| U1 | https://www.ato.gov.au/about-ato/new-legislation/in-detail/individuals/personal-income-tax-new-tax-cuts-for-every-australian-taxpayer | Last updated 13 May 2026 (QC104015) |
| U2 | https://www.legislation.gov.au/C2004A03348/latest/text (Income Tax Rates Act 1986) | Compilation No. 66, compilation date 1 July 2026, includes amendments up to Act No. 50, 2026 |
| U3 | https://www.ato.gov.au/tax-rates-and-codes/tax-rates-foreign-residents | Last updated 1 June 2026 |
| U4 | https://www.ato.gov.au/individuals-and-families/medicare-and-private-health-insurance/medicare-levy/medicare-levy-reduction/medicare-levy-reduction-for-low-income-earners | Last updated 30 June 2026 (QC27031) |
| U5 | https://www.ato.gov.au/individuals-and-families/medicare-and-private-health-insurance/medicare-levy/medicare-levy-reduction/medicare-levy-reduction-family-income | Last updated 30 June 2026 (QC27032) |
| U6 | https://www.legislation.gov.au/C2004A03351/latest/text (Medicare Levy Act 1986) | Compilation No. 53, compilation date 1 July 2026, includes amendments up to Act No. 58, 2026 |
| U7 | https://www.ato.gov.au/individuals-and-families/your-tax-return/instructions-to-complete-your-tax-return/mytax-instructions/2025/medicare-and-private-health-insurance/medicare-levy-reduction-or-exemption | myTax 2025 (no date shown) |
| U8 | https://www.ato.gov.au/individuals-and-families/medicare-and-private-health-insurance/medicare-levy-surcharge/medicare-levy-surcharge-income-thresholds-and-rates | Last updated 22 June 2026 (QC49961) |
| U9 | https://www.ato.gov.au/tax-rates-and-codes/study-and-training-support-loans-rates-and-repayment-thresholds | Last updated 30 June 2026 (QC16176) |
| U10 | https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/tax-offsets/low-income-tax-offset | Last updated 8 June 2026 (QC105020) |
| U11 | https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/tax-offsets/seniors-and-pensioners-tax-offset | Last updated 2 October 2026 |
| U12 | https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/income-tests | Last updated 8 June 2026 |
| U13 | https://www.ato.gov.au/about-ato/new-legislation/in-detail/individuals/working-australians-tax-offset | Published 23 July 2026 (QC107797) |
| U14 | https://www.ato.gov.au/individuals-and-families/super-for-individuals-and-families/super/growing-and-keeping-track-of-your-super/caps-limits-and-tax-on-super-contributions/division-293-tax-on-concessional-contributions-by-high-income-earners | Last updated 24 August 2026 |
| U15 | https://www.ato.gov.au/about-ato/new-legislation/in-detail/individuals/tax-reform-boosting-home-ownership-reforming-negative-gearing-and-capital-gains-tax | Last updated 29 June 2026 (QC107304) |
| U16 | https://www.legislation.gov.au/C2026A00049/asmade/text (Treasury Laws Amendment (Tax Reform No. 1) Act 2026, No. 49, 2026) | As made; assented 26 June 2026 |
| U17 | legislation.gov.au title search for "Tax Reform No. 1" | Act No. 49, 2026 (C2026A00049) and Income Tax Rates Amendment (Tax Reform No. 1) Act 2026, No. 50, 2026 (C2026A00050), both registered 26/06/2026 |

Notes: the low-and-middle-income-offsets page (LMITO, 2018-19 to 2021-22) was also opened but is not relevant here. The ATO content-API URL for SAPTO (`/api/public/content/0-307bd737-...`) did not render, so the SAPTO values come from U1 and U11.

## Parameter table

| parameter | value | applies from–to | source URL | short quote | status |
|---|---|---|---|---|---|
| Tax-free threshold (resident) | $18,200 | current compilation (no end date) | U2 s 3 defs | "tax‑free threshold means $18,200." | VERIFIED |
| 2027-28 resident scale is law | Yes. Sch 7 Pt I table for "2027‑28 year of income or a later year of income" | 2027-28 onward | U2; U1 | U1: "This measure is now law." U2 table heading as quoted | VERIFIED |
| 2027-28 resident bracket 1 | 14% on the part above the tax-free threshold up to $45,000 | 2027-28 onward | U2 | "exceeds the tax‑free threshold but does not exceed $45,000 … 14%" | VERIFIED |
| 2027-28 bracket 2 | 30% on $45,000–$135,000 | 2027-28 onward | U2 | "exceeds $45,000 but does not exceed $135,000 … 30%" | VERIFIED |
| 2027-28 bracket 3 | 37% on $135,000–$190,000 | 2027-28 onward | U2 | "exceeds $135,000 but does not exceed $190,000 … 37%" | VERIFIED |
| 2027-28 bracket 4 | 45% above $190,000 | 2027-28 onward | U2 | "exceeds $190,000 … 45%" | VERIFIED |
| 2027-28 base at $45,000 | $3,752 | 2027-28 | — | 0.14 × (45,000 − 18,200) = 0.14 × 26,800 = 3,752 | DERIVED |
| 2027-28 base at $135,000 | $30,752 | 2027-28 | — | 3,752 + 0.30 × 90,000 = 30,752 | DERIVED |
| 2027-28 base at $190,000 | $51,102 | 2027-28 | — | 30,752 + 0.37 × 55,000 = 51,102 | DERIVED |
| 2024-25/2025-26 and 2026-27 Sch 7 tables (legislative cross-check) | 16% (2024-25 or 2025-26) and 15% (2026-27); other rates 30/37/45 | as stated | U2 | "Tax rates for resident taxpayers for the 2026‑27 year of income" | VERIFIED (matches orchestrator's ATO page) |
| Stages per ATO | 16→15% from 1 Jul 2026; 15→14% from 1 Jul 2027 | — | U1 | "From 1 July 2027, the 15 per cent rate will be reduced further to 14 per cent." | VERIFIED |
| Foreign resident 2024-25 | 0–135,000 @30%; 135,001–190,000 $40,500 + 37%; 190,001+ $60,850 + 45% | 2024-25 | U3 | "$60,850 plus 45c for each $1 over $190,000" | VERIFIED |
| Foreign resident 2025-26 | same as 2024-25 | 2025-26 | U3 | same table | VERIFIED |
| Foreign resident 2026-27 | 30% to $135,000; 37% to $190,000; 45% above (bases 40,500 / 60,850) | 2026-27 | U2 Sch 7 Pt II | "for the 2024‑25 year of income or a later year of income … The second resident personal tax rate" | DERIVED from the Act (Pt II applies the 2nd/3rd resident rates, which are 30%/37% in the 2026-27 table). The ATO foreign-resident page (U3) does not yet show 2026-27. |
| Foreign resident 2027-28 | same as 2026-27 | 2027-28 | U2 | as above (2nd/3rd resident rates in the 2027-28 table are 30%/37%) | DERIVED (not on the ATO page) |
| Foreign residents and the Medicare levy | Not payable | — | U3 | "Foreign residents are not required to pay the Medicare levy." | VERIFIED |
| Medicare levy rate | 2% | current | U6 s 6(1) | "The rate of levy payable by a person upon a taxable income is 2%." | VERIFIED |
| Medicare phase-in rate | 10% of the excess over the threshold, up to the phase-in limit | current | U6 s 7 | "shall not exceed 10% of the amount of the excess" | VERIFIED |
| Medicare low-income single, lower | $28,011 | 2025-26 (and current law) | U4; U6 s 3 "threshold amount" | "in any other case—$28,011" | VERIFIED |
| Medicare low-income single, upper (phase-in limit) | $35,013 | 2025-26 | U4; U6 "phase‑in limit" | "in any other case—$35,013" | VERIFIED |
| Medicare single SAPTO, lower | $44,268 | 2025-26 | U4; U6 | "section 160AAAA … —$44,268" | VERIFIED |
| Medicare single SAPTO, upper | $55,335 | 2025-26 | U4; U6 | "section 160AAAA … —$55,335" | VERIFIED |
| Medicare family, lower | $47,238 | 2025-26 | U5; U6 s 8(5) | "means $47,238 increased by $4,338 for each" | VERIFIED |
| Medicare family, per-child increment (lower) | $4,338 | 2025-26 | U5; U6 s 8(5) | as above | VERIFIED |
| Medicare family SAPTO, lower | $61,623 | 2025-26 | U5; U6 s 8(7) | "each reference to $47,238 were a reference to $61,623" | VERIFIED |
| Medicare family, upper | $59,047 (+$5,423 per child) | 2025-26 | U5 | "The upper income threshold increases by $5,423 for each dependent child." | VERIFIED |
| Medicare family SAPTO, upper | $77,028 | 2025-26 | U5 | "$77,028 if you're entitled to SAPTO" | VERIFIED |
| Are the 2025-26 Medicare thresholds law? | Yes. Medicare Levy Act Compilation 53 (1 Jul 2026) contains them; the last amending Act is Treasury Laws Amendment (Delivering an Efficient and Trusted Tax System) Act 2026 (No. 58, 2026, C2026A00058), assented 30 June 2026, Sch 5 items 2–14 commenced 1 July 2026, application provision Sch 5 item 14 | 2025-26 (ATO pages apply them to 2025-26; I did not read the text of the item 14 application clause) | U6 endnotes; U4 | "Includes amendments: Act No. 58, 2026" | VERIFIED (law); exact application year per ATO |
| Medicare low-income single, lower / upper | $27,222 / $34,027 | 2024-25 | U7 Table 2 | "All other taxpayers $27,222 $34,027" | VERIFIED |
| Medicare single SAPTO lower / upper | $43,020 / $53,775 | 2024-25 | U7 | "$43,020 $53,775*" | VERIFIED |
| Medicare family upper (non-SAPTO / SAPTO / per child) | $57,383 / $74,857 / $5,270 | 2024-25 | U7 Worksheet 2 | "enter $74,857. For all other taxpayers, enter $57,383." | VERIFIED |
| Medicare family lower thresholds | — | 2024-25 | U7 | not shown on the page | NOT-FOUND |
| Medicare low-income thresholds | — | 2026-27 | U4, U5 | ATO pages show 2025-26 only | NOT-FOUND (not yet published) |
| MLS single tiers | Base ≤$101,000; T1 $101,001–118,000; T2 $118,001–158,000; T3 ≥$158,001 | 2025-26 | U8 | "$101,000 or less" | VERIFIED |
| MLS family tiers | Base ≤$202,000; T1 to $236,000; T2 to $316,000; T3 ≥$316,001 | 2025-26 | U8 | "$202,000 or less" | VERIFIED |
| MLS single tiers | Base ≤$105,000; T1 $105,001–123,000; T2 $123,001–164,000; T3 ≥$164,001 | 2026-27 | U8 | "$105,000 or less" | VERIFIED |
| MLS family tiers | Base ≤$210,000; T1 to $246,000; T2 to $328,000; T3 ≥$328,001 | 2026-27 | U8 | "$210,000 or less" | VERIFIED |
| MLS rates | 0% / 1% / 1.25% / 1.5% | 2024-25 to 2026-27 | U8 | "0% 1% 1.25% 1.5%" | VERIFIED |
| MLS family child increment | +$1,500 per MLS dependent child after the first | 2025-26, 2026-27 | U8 | "increased by $1,500 for each MLS dependent child after the first child" | VERIFIED |
| MLS single tiers (2024-25) | ≤97,000 / 113,000 / 151,000 | 2024-25 | U8 | "$97,000 or less" | VERIFIED |
| HELP 2026-27 | Nil to $69,528; 15c per $1 over $69,528 to $129,717; $9,028 + 17c per $1 over $129,717 to $186,050; 10% of total RI from $186,051 | 2026-27 | U9 Table 1 | "$9,028 plus 17c for each $1 over $129,717" | VERIFIED |
| HELP 2025-26 | Nil to $67,000; 15c over $67,000 to $125,000; $8,700 + 17c over $125,000 to $179,285; 10% of total from $179,286 | 2025-26 | U9 Table 2 | "$179,286 and over … 10% of your total repayment income" | VERIFIED |
| HELP marginal method | Applies from 2025-26 | 2025-26 onward | U9 | "From the 2025–26 income year, compulsory repayments are calculated using marginal rates." | VERIFIED |
| HELP 2026-27 base check | Published $9,028; exact 0.15 × 60,189 = 9,028.35 | 2026-27 | — | 0.15 × (129,717 − 69,528) = 9,028.35, published as 9,028 | DERIVED (note: the base is truncated) |
| HELP 2025-26 base check | 0.15 × 58,000 = 8,700 (exact) | 2025-26 | — | — | DERIVED |
| HELP repayment income | TI (excl. FHSS) + RFB + total net investment loss + reportable super contributions + exempt foreign employment income | — | U9 | "reportable fringe benefits (regardless of the exempt status of your employer)" | VERIFIED |
| LITO max | $700 if TI ≤ $37,500 | current (page not year-specific) | U10 | "you will get the maximum offset of $700" | VERIFIED |
| LITO taper 1 | 5c per $1 over $37,500, for $37,501–45,000 | current | U10 | "$700 minus 5 cents for every $1 above $37,500" | VERIFIED |
| LITO taper 2 | $325 − 1.5c per $1 over $45,000, for $45,001–66,667 | current | U10 | "$325 minus 1.5 cents for every $1 above $45,000" | VERIFIED |
| LITO cut-out | $66,667 | current | U10 | "if you earn up to $66,667" | VERIFIED |
| LITO year coverage / 2027-28 change | Page gives no year range and mentions no 2027-28 change | 2024-25..2027-28 | U10 | — | VERIFIED as current parameters; per-year applicability NOT-FOUND (no year stated) |
| LITO non-refundable | Yes | — | U10 | "Any unused amount can't be refunded." | VERIFIED |
| SAPTO single | max $2,230; shade-out $34,919; cut-out $52,759 | 2025-26 | U11 | "Single $2,230 $34,919 $52,759" | VERIFIED |
| SAPTO couple each | $1,602 / $30,994 / $43,810 | 2025-26 | U11 | table | VERIFIED |
| SAPTO illness-separated each | $2,040 / $33,732 / $50,052 | 2025-26 | U11 | table | VERIFIED |
| SAPTO single | $2,230 / $36,034 / $53,874 | 2026-27 | U1 | "Single $2,230 $36,034 $53,874" | VERIFIED |
| SAPTO couple each | $1,602 / $31,847 / $44,663 | 2026-27 | U1 | table | VERIFIED |
| SAPTO illness-separated each | $2,040 / $34,767 / $51,087 | 2026-27 | U1 | table | VERIFIED |
| SAPTO max amounts unchanged 2026-27 | Yes | 2026-27 | U1 | "There will be no changes to the maximum tax offset amounts." | VERIFIED |
| SAPTO taper | 12.5c per $1 of rebate income above the shade-out | — | U11 | "reduces by $0.125 for every dollar your rebate income exceeds" | VERIFIED |
| SAPTO 2027-28 thresholds | ATO publishes none (the 14% rate would change shade-out under the published method) | 2027-28 | U1, U11 | — | NOT-FOUND |
| SAPTO shade-out method (for reference) | Rebate threshold = (max + $445)/lowest rate + $18,200; if that exceeds $37,000, use [(0.3+0.015−lowest)×37,000 + lowest×18,200 + 445 + max (+ spouse unused)] / 0.315; round up | per U11 Example 9 (2025-26) | U11 | "rebate maximum amount – $445; rebate reduction threshold – $37,000; rebate reduction rate – 0.015" (from Income Tax Assessment (1936 Act) Regulations 2025) | VERIFIED as the method; reproduces 2025-26 and 2026-27 shade-outs (see checks below) |
| SAPTO spouse-transfer formula | Unused = A − (B − $6,000) × 0.15 | 2025-26 | U11 | "A − ((B − $6,000) × 0.15)" | VERIFIED |
| Rebate income definition | TI (excl. assessable FHSS released amount) + reportable super contributions + total net investment loss + adjusted fringe benefits total (RFB from s57A-exempt employers × 0.53, plus RFB from non-exempt employers) | — | U12 | "reportable fringe benefits amounts … multiplied by 0.53" | VERIFIED |
| SAPTO income limits (eligibility) 2025-26 | single < $52,759; couple combined < $87,620 (< $43,810 each); illness-separated combined < $100,104 (< $50,052 each) | 2025-26 | U11 | "less than $87,620 (less than $43,810 for each partner)" | VERIFIED |
| WATO amount | Lesser of $250 and basic income tax liability computed as if TI were only net labour income | 2027-28 onward | U16 s 61-160 ITAA97; U13 | "The amount of your *tax offset … is the lesser of: (a) $250" | VERIFIED |
| WATO eligibility | Individual who is an Australian resident at any time in the year; net labour income (labour amounts − labour deductions) exceeds the tax-free threshold | 2027-28 onward | U16 s 61-155; U13 | "exceeds the tax‑free threshold (within the meaning of the Income Tax Rates Act 1986)" | VERIFIED |
| WATO refundable? | No. Non-refundable, not transferable, cannot be carried forward | — | U16 s 63-10 item; U13 | "You cannot get a refund of it, you cannot transfer it and you cannot carry it forward" | VERIFIED |
| WATO law / start | Law: Act No. 49, 2026, assented 26 June 2026; Sch 3 commenced 1 July 2026; applies to assessments for 2027-28 and later | 2027-28 onward | U16 Sch 3 Pt 2 item 4; U13 | "apply in relation to assessments for the 2027‑28 income year and later income years" | VERIFIED |
| Div 293 threshold | $250,000 | current | U14 | "exceed the threshold of $250,000" | VERIFIED |
| Div 293 rate and formula | 15% × lesser of (taxable super contributions, excess of Div 293 income + Div 293 super contributions over $250,000) | current | U14 | "15% of the excess over the threshold or the taxable super contributions, whichever is less" | VERIFIED |
| Div 293 income | MLS income less reportable super contributions (TI + RFB + net financial investment loss + net rental loss + net FTDT amount − zero-rated super lump-sum taxed elements − assessable FHSS amount) | current | U14 | "same income calculation used to determine the Medicare levy surcharge (MLS), disregarding any reportable superannuation contributions" | VERIFIED |
| Div 293 contributions | Concessional contributions, disregarding excess concessional contributions | current | U14 | "disregarding any excess concessional contributions" | VERIFIED |
| CGT/negative gearing reform is law | Yes. Treasury Laws Amendment (Tax Reform No. 1) Act 2026 (No. 49) and Income Tax Rates Amendment (Tax Reform No. 1) Act 2026 (No. 50) | from 1 July 2027 | U15; U16; U17 | U15: "These measures are now law." | VERIFIED |
| CGT discount replaced | 50% discount for individuals, trusts and partnerships replaced by cost-base indexation plus a 30% minimum tax, for gains accruing after 1 July 2027 | from 1 July 2027 | U15 | "replace the 50% CGT discount … with cost base indexation and a 30% minimum tax rate" | VERIFIED (summary) |
| CGT minimum tax rate | 30% of the minimum tax capital gain, less tax otherwise attributable to that gain; rounded down to whole dollars | 2027-28 onward | U16 ITAA97 s 119-10(2); U2 s 12AA | "Step 1. Multiply your *minimum tax capital gain for the income year by 30%." | VERIFIED |
| Minimum tax exemption | Does not apply if the person receives, at any time in the year, a listed payment (Age Pension, JobSeeker, DSP, Carer Payment, Parenting Payment, Youth Allowance, Austudy, Special Benefit, FTB, PLP, DVA service pensions, etc.) | 2027-28 onward | U16 s 119-15 | "Section 119‑10 does not apply to you if you receive, at any time during the income year, a payment" | VERIFIED |
| Transition: deemed sale and reacquisition | Elective deemed sale just before 1 July 2027 at market value, or at an amount from a Ministerial apportioning method | 1 July 2027 | U16 | "the asset's *market value just before 1 July 2027" | VERIFIED (summary) |
| New residential dwellings | The 50% discount continues (s 115-102); trusts and partnerships may choose indexation instead | from 1 July 2027 | U16 | "a discount of at least 50% continues to be available if the CGT event relates to a new residential dwelling" | VERIFIED |
| "New residential dwelling" definition | Set by Ministerial legislative instrument (s 26-160(4)). Whether it has been made: not checked | — | U16 | "The Minister must, by legislative instrument, determine requirements" | VERIFIED that it is delegated; instrument NOT-FOUND |
| Negative gearing | Residential property losses quarantined except: dwellings held before 7.30pm AEST 12 May 2026, new residential dwellings, or Minister-determined purposes; effective from 1 July 2027 per ATO | from 1 July 2027 | U15; U16 | U15: "Properties held at announcement (7:30pm AEST 12 May 2026) will be exempt" | VERIFIED (summary) |

## Appendix B fixture checks

| id | recomputation from VERIFIED values | result |
|---|---|---|
| TAX-001 | HELP 2026-27, RI 86,380: (86,380 − 69,528) × 0.15 = 16,852 × 0.15 = **2,527.80**. The RI is stated in the ATO example, not inferred: the components are TI 60,470 + RFB 5,400 + net investment loss 1,330 + RESC 16,500 + exempt foreign employment income 2,680 = 86,380. The ATO example has a typo: the summation line prints "$60,720" for TI (60,720 would give 86,630), but the TI bullet is $60,470 and the stated total is $86,380. | ACCEPT. Fix `source_example_reference`: the income is stated, not inferred. |
| TAX-002 | HELP 2026-27, RI 254,780 (stated: TI 227,123 + RSC 27,657): 254,780 × 10% = **25,478**. The ATO text wrongly says "above the threshold of $179,286", which is the 2025-26 figure; the 2026-27 figure is $186,051. The result is unaffected. | ACCEPT. Income is stated, not inferred. |
| TAX-003 | 2026-27, TI 100,000: 4,020 + 0.30 × (100,000 − 45,000) = 4,020 + 16,500 = **20,520** | ACCEPT |
| TAX-004 | 2025-26, TI 100,000: 4,288 + 16,500 = **20,788** | ACCEPT |
| TAX-005 | 2026-27: 0.15 × 26,800 = 4,020; 4,020 + 0.30 × 90,000 = 31,020; 31,020 + 0.37 × 55,000 = 51,370 | ACCEPT |
| TAX-006 | 2025-26, TI 18,200: no tax up to the tax-free threshold (Sch 7 item 1 starts above the threshold) = **0** | ACCEPT |
| TAX-007 | Foreign 2025-26, TI 150,000: 40,500 + 0.37 × 15,000 = **46,050** (U3) | ACCEPT |
| TAX-008 | 2027-28, TI 45,000: 0.14 × 26,800 = **3,752** (U2, 2027-28 table, enacted) | ACCEPT. Source should cite the Income Tax Rates Act 1986 Sch 7 (Compilation 66) as well as the ATO page. |
| TAX-009 | 2026-27 single: 36,034 + 2,230/0.125 = 36,034 + 17,840 = **53,874** ✓. Couple each: 31,847 + 1,602/0.125 = 31,847 + 12,816 = **44,663** ✓. (Illness-separated: 34,767 + 16,320 = 51,087 ✓. 2025-26: 34,919 + 17,840 = 52,759; 30,994 + 12,816 = 43,810; 33,732 + 16,320 = 50,052 ✓.) | ACCEPT |
| TAX-010 | Div 293: income 240,000 + LTC 32,500 = 272,500; excess = 22,500; min(32,500, 22,500) × 15% = **3,375** | ACCEPT. The method also reproduces the official ATO Jan example: 240,000 + 15,000 → min(15,000, 5,000) × 15% = 750. |

Additional official ATO worked examples found that could become golden tests:
- HELP 2026-27 "Barry": RI 137,064 (TI 118,450 + RSC 18,614) → 9,028 + 0.17 × 7,347 = 9,028 + 1,248.99 = **10,276.99** (U9).
- Medicare 2025-26 "Angie": TI 29,000, single, no SAPTO → levy **98.90** = 0.10 × (29,000 − 28,011) (U4).
- Division 293 "Jan": 240,000 + 15,000 → **750** (U14).
- SAPTO 2025-26 "José": single, rebate income 39,000 → 2,230 − 0.125 × 4,081 = 1,719.875 → **1,720**. "Keith": couple, 33,650 → 1,602 − 332 = **1,270**. "Vanh": couple, 32,590 → 1,402.50 → **1,403** (U11).
- Caution: Medicare family example "Ashton" (U5), 2025-26, SAPTO, illness-separated, own TI 49,700, spouse 21,700, family 71,400. The ATO gives levy **$92.90**. I could not reconcile this with the simple phase-in formula (which gives 680.56 apportioned, or 543.70 unapportioned). Do not use it as a fixture until the s 8 family-reduction method is fully specified.

## Discrepancies vs research

1. **TAX-001 / TAX-002 "income inferred"**: incorrect. Both examples state the repayment income and its components. The ATO page itself has two errors: the Christina summation line uses $60,720 against a stated TI of $60,470, and the Priya text cites the 2025-26 threshold $179,286. The repayment results 2,527.80 and 25,478 are correct.
2. **Foreign-resident scale "2026-27 applicability to be confirmed"** (Appendix A): Income Tax Rates Act Sch 7 Pt II applies "for the 2024‑25 year of income or a later year of income", using the 2nd/3rd resident rates. So 2026-27 and 2027-28 are 30% / 37% / 45%, with thresholds 135,000 / 190,000. The ATO foreign-resident page (updated 1 Jun 2026) shows only up to 2025-26.
3. **Medicare low-income 2025-26 thresholds**: Appendix A marks them SECONDARY with legal status to verify, and the body (B1 v) says they "may not yet be law". They are now **VERIFIED and law**: Medicare Levy Act Compilation 53 (1 Jul 2026), amended by Act No. 58, 2026 (assented 30 Jun 2026). The values match the research (28,011 / 35,013 / 47,238 / 59,047 / 44,268). Additional verified values: SAPTO upper 55,335; family SAPTO 61,623 / 77,028; per-child 4,338 (lower) and 5,423 (upper).
4. **MLS 2026-27 thresholds (105,000 / 210,000)**: the research had these as secondary only. They are **VERIFIED** on ATO QC49961 (updated 22 Jun 2026). Tiers: single 123,000 / 164,000; family 246,000 / 328,000.
5. **Appendix A `mls_threshold_single_base` source_url** is canstar.com.au, a secondary source. It should be replaced with U8.
6. **Appendix A `medicare_low_income_single_lower` source_url** is btmh.com.au, a secondary source. It should be replaced with U4 / U6.
7. **WATO amount**: the research says "up to $250". The Act says it is the *lesser* of $250 and the basic income tax liability on net labour income alone (s 61-160). Not refundable, transferable or carried forward. Act No. 49, 2026; applies from 2027-28. Consistent with the research, but the formula is more precise than the research states.
8. **CGT**: the research cites a secondary source for the income-support exemption. It is **VERIFIED** in the Act (ITAA97 s 119-15, which lists the payments). The 30% minimum rate is verified in s 119-10 and in ITRA s 12AA. The research says the "new residential dwelling" definition is "not yet made". The Act confirms the definition is delegated to a Ministerial legislative instrument (s 26-160(4)). I did not check whether that instrument has been made. The transition apportioning method (s 112-185) is also a Ministerial instrument.
9. **Negative gearing wording**: the research says "losses on established residential property acquired after 7:30pm AEST 12 May 2026 are quarantined from 1 July 2027". The ATO and the Act frame it as quarantining with exceptions: dwellings held before 7.30pm on 12 May 2026, new residential dwellings, and Minister-determined purposes. Substantively consistent. Note that Sch 2 *commenced* 27 June 2026, while the ATO says the changes apply from 1 July 2027.
10. **Appendix A instrument for the 15%/14% rates** is given as a "2025-26 Budget measure". The operative law is Income Tax Rates Act 1986 Sch 7 (Compilation 66). I did not verify the name of the amending Act from the ITRA endnotes. The Medicare endnotes show Treasury Laws Amendment (More Cost of Living Relief) Act 2025 (No. 28, 2025) as a 2025 amending Act.
11. **SAPTO 2025-26 values** (34,919 / 52,759, etc.) are not in Appendix A. They are verified here and should be added.
12. **SAPTO 2027-28**: the research says thresholds changed from 2026-27, with no statement for 2027-28. The ATO publishes no 2027-28 thresholds. Under the published method, the 14% rate would change the shade-out: for a single, (2,230 + 445)/0.14 + 18,200 = 37,307 > 37,000, so the second-step formula applies. This is NOT verified, so block 2027-28 SAPTO.
13. **LITO**: the page is not year-stamped. The values ($700; 5c over $37,500; $325 − 1.5c over $45,000; cut-out $66,667) are current. No 2027-28 change is announced on the ATO page.
14. Out of scope but noted: the ATO HELP "Branson" 2024-25 example states 99,736 × 5.5% = $5,485.52; the correct arithmetic is $5,485.48 (an ATO arithmetic error).

## Rounding / formula rules

- **SAPTO offset**: "We round up the amount to the nearest whole dollar." (U11) Examples: 1,719.875 → 1,720; 1,402.50 → 1,403. Rebate threshold in the spouse-transfer method: "rounded up to the nearest dollar" (39,911.11 → 39,912).
- **CGT minimum tax gap** (ITAA97 s 119-10(2) step 6): "Round the result down to the nearest whole dollar". ITRA s 12AA uses "in whole dollars" for the minimum tax capital gain and the gap amount.
- **HELP**: ATO examples compute to the cent (2,527.80; 1,248.99 → 10,276.99). No rounding rule is stated. The published band base $9,028 is the truncation of 9,028.35.
- **Medicare low-income**: the example result is to the cent (98.90). The statutory cap is "10% of the amount of the excess" (s 7).
- **Division 293**: "15% of the excess over the threshold or the taxable super contributions, whichever is less" (U14). No rounding rule is stated.
- **Income Tax Rates Act**: averaging formulas use "C is the number of whole dollars in the taxable income" (Sch 7 cl 2–3; specific to that formula).

## Summary

- 2027-28 resident scale is **law**: Income Tax Rates Act 1986 Sch 7 (Compilation 66, 1 Jul 2026) has a table "for the 2027‑28 year of income or a later year of income" with 14% / 30% / 37% / 45% at 18,200 / 45,000 / 135,000 / 190,000. Derived bases: 3,752 / 30,752 / 51,102.
- Foreign-resident rates: 30% to $135k, 37% to $190k, 45% above. VERIFIED on ATO for 2024-25 and 2025-26. For 2026-27 and 2027-28 they are DERIVED from Sch 7 Pt II, which applies from 2024-25 "or a later year".
- Medicare: levy 2% and phase-in 10% are VERIFIED. The 2025-26 low-income thresholds (28,011 / 35,013; SAPTO 44,268 / 55,335; family 47,238 / 59,047 + 4,338 / 5,423 per child; family SAPTO 61,623 / 77,028) are VERIFIED and are law (Act 58 of 2026). 2024-25 single thresholds are verified. 2026-27 low-income thresholds are not published.
- MLS 2025-26 (101k / 118k / 158k; family 202k / 236k / 316k) and 2026-27 (105k / 123k / 164k; family 210k / 246k / 328k) are VERIFIED, with rates 1 / 1.25 / 1.5% and +$1,500 per child after the first.
- HELP 2025-26 and 2026-27 marginal schedules are VERIFIED. The worked-example incomes are stated, not inferred. The ATO page has two text errors that do not affect the results.
- LITO, SAPTO (2025-26 and 2026-27, taper 0.125, round-up rule), WATO (lesser of $250 and the tax on net labour income; non-refundable; Act 49/2026; from 2027-28) and Division 293 are all VERIFIED. 2027-28 SAPTO thresholds are NOT-FOUND, so block them.
- CGT and negative gearing reform is law (Acts 49 and 50 of 2026; 30% minimum tax in s 119-10; income-support exemption in s 119-15). Key definitions (new residential dwelling; transition apportioning method) depend on Ministerial instruments not checked here, so block these calculations.
- All 10 Appendix B fixtures (TAX-001..TAX-010) are ACCEPTED. Metadata fixes are needed for TAX-001/002 ("income inferred" is wrong) and for secondary source URLs in Appendix A.
