import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type Database } from '../../src/db.js';
import { handleGetBannedSubstances } from '../../src/tools/get-banned-substances.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-banned-substances.db';

describe('get_banned_substances', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('returns all banned substances', () => {
    const result = handleGetBannedSubstances(db, {}) as any;
    expect(result).toBeDefined();
    expect(result.total_banned).toBeGreaterThan(0);
    expect(result.substances.length).toBeGreaterThan(0);
  });

  it('each substance has required fields', () => {
    const result = handleGetBannedSubstances(db, {}) as any;
    for (const s of result.substances) {
      expect(s).toHaveProperty('substance');
      expect(s).toHaveProperty('category');
      expect(s).toHaveProperty('regulation_ref');
    }
  });

  it('filters by species', () => {
    const result = handleGetBannedSubstances(db, { species: 'cattle' }) as any;
    expect(result.total_banned).toBeGreaterThan(0);
  });

  it('includes warning text', () => {
    const result = handleGetBannedSubstances(db, {}) as any;
    expect(result.warning).toBeDefined();
    expect(result.warning).toContain('prohibited');
  });

  it('rejects unsupported jurisdiction', () => {
    const result = handleGetBannedSubstances(db, { jurisdiction: 'XX' });
    expect(result).toHaveProperty('error');
  });
});
