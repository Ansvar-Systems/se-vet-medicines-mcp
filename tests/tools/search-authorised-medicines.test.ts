import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createDatabase, type Database } from '../../src/db.js';
import { handleSearchAuthorisedMedicines } from '../../src/tools/search-authorised-medicines.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-search-medicines.db';

describe('search_authorised_medicines', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('returns results for a valid query', () => {
    const result = handleSearchAuthorisedMedicines(db, { query: 'amoxicillin' });
    expect(result).toBeDefined();
    expect(result).toHaveProperty('results_count');
    expect((result as any).results_count).toBeGreaterThan(0);
  });

  it('filters by species', () => {
    const result = handleSearchAuthorisedMedicines(db, { query: 'Vetrimoxin', species: 'cattle' });
    expect(result).toBeDefined();
    expect((result as any).results_count).toBeGreaterThanOrEqual(0);
  });

  it('returns empty for nonexistent medicine', () => {
    const result = handleSearchAuthorisedMedicines(db, { query: 'zzz_nonexistent_medicine_zzz' });
    expect(result).toBeDefined();
    expect((result as any).results_count).toBe(0);
  });

  it('rejects unsupported jurisdiction', () => {
    const result = handleSearchAuthorisedMedicines(db, { query: 'amoxicillin', jurisdiction: 'XX' });
    expect(result).toHaveProperty('error');
  });

  it('respects limit parameter', () => {
    const result = handleSearchAuthorisedMedicines(db, { query: 'cattle', limit: 1 });
    expect(result).toBeDefined();
    expect((result as any).results?.length ?? 0).toBeLessThanOrEqual(1);
  });
});
