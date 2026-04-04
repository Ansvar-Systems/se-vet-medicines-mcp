import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type Database } from '../../src/db.js';
import { handleGetMedicineDetails } from '../../src/tools/get-medicine-details.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-medicine-details.db';

describe('get_medicine_details', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('returns details for a valid medicine ID', () => {
    const result = handleGetMedicineDetails(db, { medicine_id: 'vet-se-001' });
    expect(result).toBeDefined();
    expect((result as any).product_name).toBe('Vetrimoxin');
    expect((result as any).registration_number).toBe('SE-VET-001');
    expect((result as any).active_substances).toContain('amoxicillin');
    expect((result as any).species_authorised).toContain('cattle');
  });

  it('includes withdrawal periods', () => {
    const result = handleGetMedicineDetails(db, { medicine_id: 'vet-se-001' }) as any;
    expect(result.withdrawal_periods).toBeDefined();
    expect(result.withdrawal_periods.length).toBeGreaterThan(0);
    expect(result.withdrawal_periods[0]).toHaveProperty('period_days');
  });

  it('returns error for nonexistent medicine', () => {
    const result = handleGetMedicineDetails(db, { medicine_id: 'nonexistent' });
    expect(result).toHaveProperty('error', 'not_found');
  });

  it('rejects unsupported jurisdiction', () => {
    const result = handleGetMedicineDetails(db, { medicine_id: 'vet-se-001', jurisdiction: 'XX' });
    expect(result).toHaveProperty('error');
  });
});
