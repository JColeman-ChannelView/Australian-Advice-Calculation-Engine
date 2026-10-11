/** The parameter release shipped with this engine version (built from parameters/*.yaml). */
import bundleJson from './generated/parameters.json' with { type: 'json' };
import type { ParameterBundle } from './core/parameters.js';
import { ParameterRegistry } from './core/registry.js';

export const bundledParameters = bundleJson as unknown as ParameterBundle;

let cached: ParameterRegistry | undefined;

export function defaultRegistry(): ParameterRegistry {
  cached ??= new ParameterRegistry(bundledParameters);
  return cached;
}
