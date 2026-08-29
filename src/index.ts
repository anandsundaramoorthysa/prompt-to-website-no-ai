/** Public API surface, bundled for tests and the CLI. No vscode import. */
export { parse } from './parser/parse.js';
export { buildPlan } from './compose/plan.js';
export { compose, vendorFiles } from './compose/compose.js';
export { applyAxes } from './compose/axes.js';
export { normalise, writeAll, planWrites } from './write/writer.js';
export { resolveSession } from './refine/resolve.js';
export { parseMutation, applyMutation, DEFAULT_AXES } from './refine/mutate.js';
export {
  newSession, migrate, addStep, toggleStep, removeStep, moveStep,
  SESSION_SCHEMA_VERSION
} from './refine/session.js';
export { CORPUS } from './generated/corpus.js';
export type { Intent, Plan, Stack, TokenPreset } from './types.js';

/* Coverage harness only: lets scripts/audit-coverage.mjs render every block
   without duplicating the template and token logic. Not part of the public API. */
export { render as __renderForCoverage } from './compose/template.js';
export { renderTokens as __renderTokensForCoverage } from './compose/tokens.js';
