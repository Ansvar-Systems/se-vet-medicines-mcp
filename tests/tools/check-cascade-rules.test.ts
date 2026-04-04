import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { type Database } from '../../src/db.js';
import { handleCheckCascadeRules } from '../../src/tools/check-cascade-rules.js';
import { createSeededDatabase } from '../helpers/seed-db.js';
import { existsSync, unlinkSync } from 'fs';

const TEST_DB = 'tests/test-cascade-rules.db';

describe('check_cascade_rules', () => {
  let db: Database;

  beforeAll(() => {
    db = createSeededDatabase(TEST_DB);
  });

  afterAll(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it('returns cascade hierarchy for a species', () => {
    const result = handleCheckCascadeRules(db, { species: 'cattle' }) as any;
    expect(result).toBeDefined();
    expect(result.cascade_hierarchy).toBeDefined();
    expect(result.cascade_hierarchy.length).toBeGreaterThan(0);
  });

  it('cascade steps are ordered', () => {
    const result = handleCheckCascadeRules(db, { species: 'cattle' }) as any;
    const steps = result.cascade_hierarchy.map((s: any) => s.step);
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i]).toBeGreaterThan(steps[i - 1]);
    }
  });

  it('includes default withdrawal periods for later steps', () => {
    const result = handleCheckCascadeRules(db, { species: 'cattle' }) as any;
    const step2 = result.cascade_hierarchy.find((s: any) => s.step === 2);
    expect(step2).toBeDefined();
    expect(step2.default_withdrawal.meat_days).toBe(28);
    expect(step2.default_withdrawal.milk_days).toBe(7);
  });

  it('includes guidance and warning text', () => {
    const result = handleCheckCascadeRules(db, { species: 'cattle' }) as any;
    expect(result.guidance).toBeDefined();
    expect(result.warning).toBeDefined();
  });

  it('rejects unsupported jurisdiction', () => {
    const result = handleCheckCascadeRules(db, { species: 'cattle', jurisdiction: 'XX' });
    expect(result).toHaveProperty('error');
  });
});
