import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import { ftsSearch, type Database } from '../db.js';

interface SearchArgs {
  query: string;
  species?: string;
  pharmaceutical_form?: string;
  active_substance?: string;
  jurisdiction?: string;
  limit?: number;
}

export function handleSearchAuthorisedMedicines(db: Database, args: SearchArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const limit = Math.min(args.limit ?? 20, 50);

  // Try FTS first
  let ftsResults = ftsSearch(db, args.query, limit);

  // Apply post-filters on FTS results
  if (args.species) {
    ftsResults = ftsResults.filter(r =>
      r.species.toLowerCase().includes(args.species!.toLowerCase())
    );
  }

  // If FTS returned results, map them
  if (ftsResults.length > 0) {
    return {
      query: args.query,
      jurisdiction: jv.jurisdiction,
      results_count: ftsResults.length,
      results: ftsResults.map(r => ({
        title: r.title,
        body: r.body,
        species: r.species,
        relevance_rank: r.rank,
      })),
      _meta: buildMeta(),
    };
  }

  // Fall back to direct SQL search on medicines table
  const conditions: string[] = ['jurisdiction = ?'];
  const params: unknown[] = [jv.jurisdiction];

  conditions.push('(product_name LIKE ? OR active_substances LIKE ?)');
  params.push(`%${args.query}%`, `%${args.query}%`);

  if (args.species) {
    conditions.push('species_authorised LIKE ?');
    params.push(`%${args.species}%`);
  }
  if (args.pharmaceutical_form) {
    conditions.push('pharmaceutical_form LIKE ?');
    params.push(`%${args.pharmaceutical_form}%`);
  }
  if (args.active_substance) {
    conditions.push('active_substances LIKE ?');
    params.push(`%${args.active_substance}%`);
  }

  params.push(limit);

  const medicines = db.all<{
    id: string; product_name: string; registration_number: string;
    active_substances: string; species_authorised: string;
    pharmaceutical_form: string; legal_category: string;
    ma_holder: string; status: string;
  }>(
    `SELECT id, product_name, registration_number, active_substances, species_authorised,
            pharmaceutical_form, legal_category, ma_holder, status
     FROM medicines WHERE ${conditions.join(' AND ')} LIMIT ?`,
    params
  );

  return {
    query: args.query,
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
    _meta: buildMeta(),
  };
}
