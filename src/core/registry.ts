/**
 * Effective-dated parameter registry with bitemporal resolution:
 *   - `date`: the date the rule applies to (calculation / effective date), and
 *   - `knowledgeAsAt` (optional): only records knowable on or before that date are considered,
 *     answering "what would this release have computed with what was known then?".
 */
import type { IsoDate } from './dates.js';
import { cmp } from './dates.js';
import type { IdentifiedRecord, ParameterBundle } from './parameters.js';

export class ParameterRegistry {
  private readonly byName = new Map<string, IdentifiedRecord[]>();

  constructor(readonly bundle: ParameterBundle) {
    for (const r of bundle.records) {
      const list = this.byName.get(r.name) ?? [];
      list.push(r);
      this.byName.set(r.name, list);
    }
    for (const list of this.byName.values()) {
      list.sort((a, b) => cmp(a.effective_from, b.effective_from));
    }
  }

  get releaseHash(): string {
    return this.bundle.release.hash;
  }

  get currencyDate(): string {
    return this.bundle.release.currency_date;
  }

  names(): string[] {
    return [...this.byName.keys()].sort();
  }

  history(name: string): readonly IdentifiedRecord[] {
    return this.byName.get(name) ?? [];
  }

  /**
   * The record in force on `date` (effective_from <= date <= effective_to). When several records
   * overlap (e.g. a later-published correction), the one with the latest effective_from wins,
   * then the latest knowledge_date.
   */
  find(name: string, date: IsoDate, knowledgeAsAt?: IsoDate): IdentifiedRecord | undefined {
    const candidates = this.history(name).filter(
      (r) =>
        r.effective_from <= date &&
        (r.effective_to === null || date <= r.effective_to) &&
        (knowledgeAsAt === undefined || r.knowledge_date <= knowledgeAsAt),
    );
    candidates.sort(
      (a, b) => cmp(b.effective_from, a.effective_from) || cmp(b.knowledge_date, a.knowledge_date),
    );
    return candidates[0];
  }
}
