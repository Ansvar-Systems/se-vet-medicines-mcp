import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface SubstanceSearchArgs {
  active_substance: string;
  species?: string;
  jurisdiction?: string;
}

export function handleSearchByActiveSubstance(db: Database, args: SubstanceSearchArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const conditions: string[] = ['jurisdiction = ?', 'active_substances LIKE ?'];
  const params: unknown[] = [jv.jurisdiction, `%${args.active_substance}%`];

  if (args.species) {
    conditions.push('species_authorised LIKE ?');
    params.push(`%${args.species}%`);
  }

  const medicines = db.all<{
    id: string; product_name: string; registration_number: string;
    active_substances: string; species_authorised: string;
    pharmaceutical_form: string; legal_category: string;
    ma_holder: string; status: string;
  }>(
    `SELECT id, product_name, registration_number, active_substances, species_authorised,
            pharmaceutical_form, legal_category, ma_holder, status
     FROM medicines WHERE ${conditions.join(' AND ')}`,
    params
  );

  // Also check if substance is banned
  const bans = db.all<{
    substance: string; category: string; applies_to: string; regulation_ref: string;
  }>(
    'SELECT substance, category, applies_to, regulation_ref FROM banned_substances WHERE LOWER(substance) LIKE LOWER(?) AND jurisdiction = ?',
    [`%${args.active_substance}%`, jv.jurisdiction]
  );

  return {
    active_substance: args.active_substance,
    species_filter: args.species ?? 'all',
    jurisdiction: jv.jurisdiction,
    results_count: medicines.length,
    results: medicines.map(m => ({
      id: m.id,
      product_name: m.product_name,
      registration_number: m.registration_number,
      active_substances: JSON.parse(m.active_substances || '[]'),
      species_authorised: JSON.parse(m.species_authorised || '[]'),
      pharmaceutical_form: m.pharmaceutical_form,
      legal_category: m.legal_category,
      ma_holder: m.ma_holder,
      status: m.status,
    })),
    banned_substance_matches: bans.length > 0 ? bans.map(b => ({
      substance: b.substance,
      category: b.category,
      applies_to: b.applies_to,
      regulation_ref: b.regulation_ref,
      warning: 'This substance is BANNED for use in food-producing animals.',
    })) : [],
    _meta: buildMeta(),
  };
}
