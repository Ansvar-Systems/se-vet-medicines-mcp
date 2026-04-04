import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface MedicineDetailsArgs {
  medicine_id: string;
  jurisdiction?: string;
}

export function handleGetMedicineDetails(db: Database, args: MedicineDetailsArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const medicine = db.get<{
    id: string; product_name: string; registration_number: string;
    active_substances: string; species_authorised: string;
    pharmaceutical_form: string; legal_category: string;
    ma_holder: string; spc_url: string; status: string;
    jurisdiction: string;
  }>(
    'SELECT * FROM medicines WHERE id = ? AND jurisdiction = ?',
    [args.medicine_id, jv.jurisdiction]
  );

  if (!medicine) {
    return {
      error: 'not_found',
      message: `Medicine '${args.medicine_id}' not found. Use search_authorised_medicines to find valid IDs.`,
    };
  }

  // Fetch associated withdrawal periods
  const withdrawals = db.all<{
    species: string; product_type: string; period_days: number;
    notes: string; zero_day_allowed: number;
  }>(
    'SELECT species, product_type, period_days, notes, zero_day_allowed FROM withdrawal_periods WHERE medicine_id = ? AND jurisdiction = ?',
    [args.medicine_id, jv.jurisdiction]
  );

  return {
    id: medicine.id,
    product_name: medicine.product_name,
    registration_number: medicine.registration_number,
    active_substances: JSON.parse(medicine.active_substances || '[]'),
    species_authorised: JSON.parse(medicine.species_authorised || '[]'),
    pharmaceutical_form: medicine.pharmaceutical_form,
    legal_category: medicine.legal_category,
    ma_holder: medicine.ma_holder,
    spc_url: medicine.spc_url,
    status: medicine.status,
    jurisdiction: medicine.jurisdiction,
    withdrawal_periods: withdrawals.map(w => ({
      species: w.species,
      product_type: w.product_type,
      period_days: w.period_days,
      notes: w.notes,
      zero_day_allowed: w.zero_day_allowed === 1,
    })),
    _meta: buildMeta({
      source_url: medicine.spc_url || 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta',
    }),
  };
}
