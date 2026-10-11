# Source-verification brief (for verification agents)

Today is 2026-10-11. The repository builds a clean-room, Apache-2.0 Australian advice calculation
engine. The research file `Deep-research/Clean-Room ... (as at 11 October 2026).md` (Appendix A
parameters, Appendix B fixtures) is a *secondary* starting point. Your job is to independently
verify values against PRIMARY Australian government / legislative sources.

## Rules

1. Primary sources only count as verification: ato.gov.au, servicesaustralia.gov.au, dss.gov.au
   (incl. guides.dss.gov.au Social Security Guide), dva.gov.au, health.gov.au, myagedcare.gov.au,
   legislation.gov.au, asic.gov.au, moneysmart.gov.au, aga.gov.au, treasury.gov.au, aph.gov.au.
   Anything else (super funds, advisers, calculator sites) is SECONDARY and cannot verify a value.
2. Never guess or fill in from memory. If you cannot read the page, the status is NOT-FOUND.
3. Retrieval: try WebFetch first. ATO returns HTTP 403 to WebFetch and Services Australia often
   times out; for those use the in-app browser tools (`mcp__Claude_Browser__*`). The browser is
   SHARED with other agents: create your own tab with `mcp__Claude_Browser__tabs_create`, pass that
   `tabId` on EVERY browser call (navigate, get_page_text, find), and close it with `tabs_close`
   when finished. Prefer `get_page_text` with a modest `max_chars` and `find` over screenshots.
   ATO pages have a "Print or Download" print view under /api/public/content/... which is fine.
4. Do not download or execute files. Reading a PDF in the browser viewer is fine if it renders as text.
5. Copyright: record values and at most a short (<15 word) quote per value. No long passages.
6. Do not submit forms, accept cookies beyond essential, or sign in anywhere.

## Output

Write your findings to `verification/<domain>.md` (domain given in your task) with:

- A header listing every URL you actually read, with the page's "Last updated" date if shown.
- A table: `parameter | value | applies from–to (FY or date) | source URL | short quote | status`
  where status is one of:
  - `VERIFIED` — value read on a primary page (give URL + quote)
  - `DERIVED` — computed exactly from VERIFIED values (show the arithmetic)
  - `SECONDARY-ONLY` — only seen on non-government pages
  - `CONFLICT` — primary sources disagree, or primary disagrees with the research (give both)
  - `NOT-FOUND` — could not retrieve
- A section "Appendix B fixture checks": for each fixture id assigned to you, recompute it from
  VERIFIED values and say ACCEPT (with arithmetic), REJECT (why, and the corrected value), or
  BLOCKED (missing primary data).
- A section "Discrepancies vs research" listing every difference from Appendix A/B or the body text.
- A section "Rounding / formula rules" quoting any primary-source rounding rules found
  (e.g. "rounded to the nearest cent", "for each $250 or part of $250").
- A final 5-10 line summary.

Your final reply to the orchestrator should be that summary plus the path of the file you wrote.
