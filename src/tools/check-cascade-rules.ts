import { buildMeta } from '../metadata.js';
import { buildCitation } from '../citation.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface CascadeArgs {
  species: string;
  condition?: string;
  jurisdiction?: string;
}

export function handleCheckCascadeRules(db: Database, args: CascadeArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const rules = db.all<{
    step_order: number; description: string; documentation_required: string;
    default_withdrawal_meat_days: number; default_withdrawal_milk_days: number;
    source: string;
  }>(
    'SELECT step_order, description, documentation_required, default_withdrawal_meat_days, default_withdrawal_milk_days, source FROM cascade_rules WHERE jurisdiction = ? ORDER BY step_order ASC',
    [jv.jurisdiction]
  );

  if (rules.length === 0) {
    return {
      error: 'no_data',
      message: 'No cascade rules found for the specified jurisdiction.',
    };
  }

  return {
    species: args.species,
    condition: args.condition ?? 'unspecified',
    jurisdiction: jv.jurisdiction,
    cascade_hierarchy: rules.map(r => ({
      step: r.step_order,
      description: r.description,
      documentation_required: r.documentation_required,
      default_withdrawal: {
        meat_days: r.default_withdrawal_meat_days,
        milk_days: r.default_withdrawal_milk_days,
      },
      source: r.source,
    })),
    guidance: 'The prescribing cascade must be followed in order. A veterinarian may only move to the next step if no suitable product is available at the current step. When using cascade steps 2-4, extended default withdrawal periods apply unless the product SPC specifies otherwise.',
    warning: 'Cascade prescribing requires veterinary clinical justification and must be documented. Default withdrawal periods (28 days meat, 7 days milk) apply when using products outside their authorised species/indication.',
    _meta: buildMeta({
    _citation: buildCitation(
      `SE Prescribing Cascade: ${args.species}`,
      `Prescribing cascade rules for ${args.species} (${jv.jurisdiction})`,
      'check_cascade_rules',
      { species: args.species, ...(args.condition ? { condition: args.condition } : {}) },
      'https://jordbruksverket.se/djur/djurhalsa',
    ),
      source_url: 'https://jordbruksverket.se/djur/djurhalsa',
    }),
  };
}
