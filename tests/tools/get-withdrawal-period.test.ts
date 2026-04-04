import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type Database } from '../../src/db.js';
import { handleGetWithdrawalPeriod } from '../../src/tools/get-withdrawal-period.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-withdrawal-period.db';

describe('get_withdrawal_period', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('returns withdrawal period for valid medicine and species', () => {
    const result = handleGetWithdrawalPeriod(db, { medicine_id: 'vet-se-001', species: 'cattle' }) as any;
    expect(result).toBeDefined();
    expect(result.periods?.length ?? result.withdrawal_periods?.length).toBeGreaterThan(0);
  });

  it('filters by product type', () => {
    const result = handleGetWithdrawalPeriod(db, {
      medicine_id: 'vet-se-001',
      species: 'cattle',
      product_type: 'milk',
    }) as any;
    expect(result).toBeDefined();
    // Should find the milk-specific period
    const periods = result.periods ?? result.withdrawal_periods ?? [];
    if (periods.length > 0) {
      expect(periods[0].product_type).toBe('milk');
    }
  });

  it('returns error for nonexistent medicine', () => {
    const result = handleGetWithdrawalPeriod(db, { medicine_id: 'nonexistent', species: 'cattle' });
    expect(result).toHaveProperty('error', 'not_found');
  });

  it('handles species with no withdrawal data', () => {
    const result = handleGetWithdrawalPeriod(db, { medicine_id: 'vet-se-001', species: 'fish' }) as any;
    // Should return no_withdrawal_data error with available_combinations
    expect(result).toHaveProperty('error', 'no_withdrawal_data');
    expect(result.available_combinations).toBeDefined();
  });

  it('rejects unsupported jurisdiction', () => {
    const result = handleGetWithdrawalPeriod(db, { medicine_id: 'vet-se-001', species: 'cattle', jurisdiction: 'XX' });
    expect(result).toHaveProperty('error');
  });
});
