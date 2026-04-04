import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type Database } from '../../src/db.js';
import { handleSearchByActiveSubstance } from '../../src/tools/search-by-active-substance.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-active-substance.db';

describe('search_by_active_substance', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('finds medicines containing the active substance', () => {
    const result = handleSearchByActiveSubstance(db, { active_substance: 'amoxicillin' }) as any;
    expect(result).toBeDefined();
    expect(result.results_count).toBeGreaterThan(0);
    expect(result.results[0].product_name).toBe('Vetrimoxin');
  });

  it('filters by species', () => {
    const result = handleSearchByActiveSubstance(db, { active_substance: 'enrofloxacin', species: 'poultry' }) as any;
    expect(result.results_count).toBeGreaterThan(0);
  });

  it('returns empty for nonexistent substance', () => {
    const result = handleSearchByActiveSubstance(db, { active_substance: 'zzz_nonexistent_zzz' }) as any;
    expect(result.results_count).toBe(0);
  });

  it('flags banned substance matches', () => {
    // chloramphenicol is in banned_substances table
    const result = handleSearchByActiveSubstance(db, { active_substance: 'chloramphenicol' }) as any;
    expect(result.banned_substance_matches).toBeDefined();
    expect(result.banned_substance_matches.length).toBeGreaterThan(0);
  });

  it('rejects unsupported jurisdiction', () => {
    const result = handleSearchByActiveSubstance(db, { active_substance: 'amoxicillin', jurisdiction: 'XX' });
    expect(result).toHaveProperty('error');
  });
});
