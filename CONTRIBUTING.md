# Contributing

## Clean-room affirmation (required)

Every commit must carry a Developer Certificate of Origin sign-off (`git commit -s`). By signing off
you also affirm that, for the contribution:

1. You have not consulted documentation, help centres, screenshots, training material or source code
   of proprietary financial-advice software.
2. You have not copied code from AGPL-licensed projects (e.g. OpenFisca, PolicyEngine). Their
   parameter values may be used only as cross-checks after re-deriving them from the primary source.
3. If you used an AI coding assistant, you did not prompt it with any material in (1) or (2).

## Parameter changes

A pull request that adds or changes a parameter must:

- cite a **primary** source (`sources[].primary: true`) with URL, accessed date and a short locator;
  secondary sources may be listed but cannot make a record `verified`;
- state the instrument (Act/section, legislative instrument, determination);
- set `verification` honestly (`verified`, `derived` with the derivation in `notes`, or
  `secondary`/`unverified`/`conflict`, which block calculations);
- pass `npm run params` (schema, provenance and overlap checks) and `npm test`, including an
  identity or golden test where the source publishes a worked example;
- be reviewed by a domain code owner. No record may be merged as `verified` without a primary source.

## Rules (code)

- Pure functions only; read parameters exclusively through `CalcContext`.
- Name every rounding mode. If no official rule exists, use cents half-up and document it as an
  engine convention.
- Add a golden case (`tests/golden/*.yaml`) for every official worked example you rely on, with
  `checked:` recording who verified it and where.
- Prefer blocking (`status: blocked`) to approximating.

## Release checklist

Indexation events: 1 July (tax year, caps, TBC, thresholds, HELP), 20 March and 20 September
(pension rates, aged-care amounts), February (AWOTE caps), May Budget, ad hoc deeming changes.
For each: update parameters with sources, run `npm run verify`, review the diff of
`docs/PARAMETERS.md`, update `docs/SOURCE-QUESTIONS.md` and `PROGRESS.md`.
