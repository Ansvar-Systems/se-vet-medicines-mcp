import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface WithdrawalArgs {
  medicine_id: string;
  species: string;
  product_type?: string;
  jurisdiction?: string;
}

export function handleGetWithdrawalPeriod(db: Database, args: WithdrawalArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  // Verify medicine exists
  const medicine = db.get<{ id: string; product_name: string; active_substances: string }>(
    'SELECT id, product_name, active_substances FROM medicines WHERE id = ? AND jurisdiction = ?',
    [args.medicine_id, jv.jurisdiction]
  );

  if (!medicine) {
    return {
      error: 'not_found',
      message: `Medicine '${args.medicine_id}' not found. Use search_authorised_medicines to find valid IDs.`,
    };
  }

  // Build query for withdrawal periods
  const conditions: string[] = ['medicine_id = ?', 'jurisdiction = ?', 'LOWER(species) = LOWER(?)'];
  const params: unknown[] = [args.medicine_id, jv.jurisdiction, args.species];

  if (args.product_type) {
    conditions.push('LOWER(product_type) = LOWER(?)');
    params.push(args.product_type);
  }

  const periods = db.all<{
    species: string; product_type: string; period_days: number;
    notes: string; zero_day_allowed: number;
  }>(
    `SELECT species, product_type, period_days, notes, zero_day_allowed
     FROM withdrawal_periods WHERE ${conditions.join(' AND ')}`,
    params
  );

  if (periods.length === 0) {
    // Check if any withdrawal period exists for this medicine at all
    const anyPeriod = db.all<{ species: string; product_type: string }>(
      'SELECT DISTINCT species, product_type FROM withdrawal_periods WHERE medicine_id = ? AND jurisdiction = ?',
      [args.medicine_id, jv.jurisdiction]
    );

    return {
      error: 'no_withdrawal_data',
      message: `No withdrawal period found for '${medicine.product_name}' in species '${args.species}'${args.product_type ? ` for product type '${args.product_type}'` : ''}.`,
      available_combinations: anyPeriod,
      warning: 'If no authorised withdrawal period exists, the prescribing cascade default withdrawal periods apply (28 days meat, 7 days milk). Always verify with Lakemedelsverket SPC.',
    };
  }

  return {
    medicine_id: args.medicine_id,
    product_name: medicine.product_name,
    active_substances: JSON.parse(medicine.active_substances || '[]'),
    species: args.species,
    jurisdiction: jv.jurisdiction,
    withdrawal_periods: periods.map(p => ({
      product_type: p.product_type,
      period_days: p.period_days,
      zero_day_allowed: p.zero_day_allowed === 1,
      notes: p.notes,
    })),
    warning: 'Withdrawal periods are critical for food safety. Always verify against the current SPC before treating food-producing animals.',
    _meta: buildMeta(),
  };
}
