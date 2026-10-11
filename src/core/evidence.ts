/**
 * Calculation evidence bundle: a self-contained, hash-sealed record of one calculation (request,
 * response, parameter versions with sources, assumptions, trace, engine version) intended to be
 * attached to an advice record in whatever format the law requires (SOA today; any future
 * Client Advice Record). Deterministic: the caller supplies `generatedAt`.
 */
import { canonicalJson } from './canonical.js';
import { sha256Hex } from './sha256.js';
import type { CalculationResponse } from './calculator.js';
import { EVIDENCE_SCHEMA_VERSION } from '../version.js';

export interface EvidenceBundle {
  evidence_schema_version: string;
  generated_at: string;
  response: CalculationResponse;
  hashes: {
    /** SHA-256 of canonical JSON of the validated input. */
    input: string;
    /** SHA-256 of canonical JSON of the full response. */
    response: string;
    /** SHA-256 of canonical JSON of everything above (seal). */
    bundle: string;
  };
}

export function createEvidenceBundle(response: CalculationResponse, generatedAt: string): EvidenceBundle {
  const unsealed = {
    evidence_schema_version: EVIDENCE_SCHEMA_VERSION,
    generated_at: generatedAt,
    response,
    hashes: {
      input: sha256Hex(canonicalJson(response.input)),
      response: sha256Hex(canonicalJson(response)),
    },
  };
  return {
    ...unsealed,
    hashes: { ...unsealed.hashes, bundle: sha256Hex(canonicalJson(unsealed)) },
  };
}

/** Recompute all hashes; true when the bundle has not been altered. */
export function verifyEvidenceBundle(b: EvidenceBundle): boolean {
  const input = sha256Hex(canonicalJson(b.response.input));
  const response = sha256Hex(canonicalJson(b.response));
  const unsealed = {
    evidence_schema_version: b.evidence_schema_version,
    generated_at: b.generated_at,
    response: b.response,
    hashes: { input, response },
  };
  return (
    input === b.hashes.input &&
    response === b.hashes.response &&
    sha256Hex(canonicalJson(unsealed)) === b.hashes.bundle
  );
}
