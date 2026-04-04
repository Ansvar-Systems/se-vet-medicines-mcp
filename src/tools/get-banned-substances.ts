import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface BannedArgs {
  species?: string;
  production_type?: string;
  jurisdiction?: string;
}

export function handleGetBannedSubstances(db: Database, args: BannedArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const conditions: string[] = ['jurisdiction = ?'];
  const params: unknown[] = [jv.jurisdiction];

  if (args.species) {
    conditions.push('(applies_to IS NULL OR applies_to LIKE ? OR applies_to = ?)');
    params.push(`%${args.species}%`, 'all food-producing animals');
  }
  if (args.production_type) {
    conditions.push('(applies_to IS NULL OR applies_to LIKE ?)');
    params.push(`%${args.production_type}%`);
  }

  const substances = db.all<{
    substance: string; category: string; applies_to: string; regulation_ref: string;
  }>(
    `SELECT substance, category, applies_to, regulation_ref
     FROM banned_substances WHERE ${conditions.join(' AND ')} ORDER BY category, substance`,
    params
  );

  return {
    species_filter: args.species ?? 'all',
    production_type_filter: args.production_type ?? 'all',
    jurisdiction: jv.jurisdiction,
    total_banned: substances.length,
    substances: substances.map(s => ({
      substance: s.substance,
      category: s.category,
      applies_to: s.applies_to,
      regulation_ref: s.regulation_ref,
    })),
    warning: 'These substances are prohibited for use in food-producing animals under EU and Swedish regulations. Detection of residues in food products triggers mandatory reporting and product recall.',
    _meta: buildMeta({
      source_url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:31996L0022',
    }),
  };
}
