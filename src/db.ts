import BetterSqlite3 from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

export interface Database {
  get<T>(sql: string, params?: unknown[]): T | undefined;
  all<T>(sql: string, params?: unknown[]): T[];
  run(sql: string, params?: unknown[]): void;
  close(): void;
  readonly instance: BetterSqlite3.Database;
}

export function createDatabase(dbPath?: string): Database {
  const resolvedPath =
    dbPath ??
    join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'database.db');
  const db = new BetterSqlite3(resolvedPath);

  db.pragma('journal_mode = DELETE');
  db.pragma('foreign_keys = ON');

  initSchema(db);

  return {
    get<T>(sql: string, params: unknown[] = []): T | undefined {
      return db.prepare(sql).get(...params) as T | undefined;
    },
    all<T>(sql: string, params: unknown[] = []): T[] {
      return db.prepare(sql).all(...params) as T[];
    },
    run(sql: string, params: unknown[] = []): void {
      db.prepare(sql).run(...params);
    },
    close(): void {
      db.close();
    },
    get instance() {
      return db;
    },
  };
}

function initSchema(db: BetterSqlite3.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS medicines (
      id TEXT PRIMARY KEY,
      product_name TEXT NOT NULL,
      registration_number TEXT,
      active_substances TEXT,
      species_authorised TEXT,
      pharmaceutical_form TEXT,
      legal_category TEXT,
      ma_holder TEXT,
      spc_url TEXT,
      status TEXT,
      jurisdiction TEXT NOT NULL DEFAULT 'SE'
    );

    CREATE TABLE IF NOT EXISTS withdrawal_periods (
      id INTEGER PRIMARY KEY,
      medicine_id TEXT REFERENCES medicines(id),
      species TEXT NOT NULL,
      product_type TEXT,
      period_days INTEGER NOT NULL,
      notes TEXT,
      zero_day_allowed INTEGER DEFAULT 0,
      jurisdiction TEXT NOT NULL DEFAULT 'SE'
    );

    CREATE TABLE IF NOT EXISTS banned_substances (
      id INTEGER PRIMARY KEY,
      substance TEXT NOT NULL,
      category TEXT,
      applies_to TEXT,
      regulation_ref TEXT,
      jurisdiction TEXT NOT NULL DEFAULT 'SE'
    );

    CREATE TABLE IF NOT EXISTS cascade_rules (
      id INTEGER PRIMARY KEY,
      step_order INTEGER NOT NULL,
      description TEXT NOT NULL,
      documentation_required TEXT,
      default_withdrawal_meat_days INTEGER,
      default_withdrawal_milk_days INTEGER,
      source TEXT,
      jurisdiction TEXT NOT NULL DEFAULT 'SE'
    );

    CREATE TABLE IF NOT EXISTS record_requirements (
      id INTEGER PRIMARY KEY,
      holding_type TEXT,
      species TEXT,
      requirement TEXT NOT NULL,
      retention_period TEXT,
      regulation_ref TEXT,
      jurisdiction TEXT NOT NULL DEFAULT 'SE'
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
      title, body, species, jurisdiction
    );

    CREATE TABLE IF NOT EXISTS db_metadata (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    INSERT OR IGNORE INTO db_metadata (key, value) VALUES ('schema_version', '1.0');
    INSERT OR IGNORE INTO db_metadata (key, value) VALUES ('mcp_name', 'Sweden Veterinary Medicines MCP');
    INSERT OR IGNORE INTO db_metadata (key, value) VALUES ('jurisdiction', 'SE');
  `);
}

const FTS_COLUMNS = ['title', 'body', 'species', 'jurisdiction'];

export function ftsSearch(
  db: Database,
  query: string,
  limit: number = 20
): { title: string; body: string; species: string; jurisdiction: string; rank: number }[] {
  const { results } = tieredFtsSearch(db, 'search_index', FTS_COLUMNS, query, limit);
  return results as { title: string; body: string; species: string; jurisdiction: string; rank: number }[];
}

/**
 * Tiered FTS5 search with automatic fallback.
 * Tiers: exact phrase -> AND -> prefix -> stemmed prefix -> OR -> LIKE
 */
export function tieredFtsSearch(
  db: Database,
  table: string,
  columns: string[],
  query: string,
  limit: number = 20
): { tier: string; results: Record<string, unknown>[] } {
  const sanitized = sanitizeFtsInput(query);
  if (!sanitized.trim()) return { tier: 'empty', results: [] };

  const columnList = columns.join(', ');
  const select = `SELECT ${columnList}, rank FROM ${table}`;
  const order = `ORDER BY rank LIMIT ?`;

  // Tier 1: Exact phrase
  const phrase = `"${sanitized}"`;
  let results = tryFts(db, select, table, order, phrase, limit);
  if (results.length > 0) return { tier: 'phrase', results };

  // Tier 2: AND
  const words = sanitized.split(/\s+/).filter(w => w.length > 1);
  if (words.length > 1) {
    const andQuery = words.join(' AND ');
    results = tryFts(db, select, table, order, andQuery, limit);
    if (results.length > 0) return { tier: 'and', results };
  }

  // Tier 3: Prefix
  const prefixQuery = words.map(w => `${w}*`).join(' AND ');
  results = tryFts(db, select, table, order, prefixQuery, limit);
  if (results.length > 0) return { tier: 'prefix', results };

  // Tier 4: Stemmed prefix
  const stemmed = words.map(w => stemWord(w) + '*');
  const stemmedQuery = stemmed.join(' AND ');
  if (stemmedQuery !== prefixQuery) {
    results = tryFts(db, select, table, order, stemmedQuery, limit);
    if (results.length > 0) return { tier: 'stemmed', results };
  }

  // Tier 5: OR
  if (words.length > 1) {
    const orQuery = words.join(' OR ');
    results = tryFts(db, select, table, order, orQuery, limit);
    if (results.length > 0) return { tier: 'or', results };
  }

  // Tier 6: LIKE fallback — bypasses FTS, searches medicines table with real column names
  const baseCols = ['product_name', 'active_substances', 'species_authorised'];
  const likeConditions = words.map(() =>
    `(${baseCols.map(c => `${c} LIKE ?`).join(' OR ')})`
  ).join(' AND ');
  const likeParams = words.flatMap(w =>
    baseCols.map(() => `%${w}%`)
  );
  try {
    const likeResults = db.all<Record<string, unknown>>(
      `SELECT product_name as title, COALESCE(active_substances, '') as body, COALESCE(species_authorised, '') as species, jurisdiction FROM medicines WHERE ${likeConditions} LIMIT ?`,
      [...likeParams, limit]
    );
    if (likeResults.length > 0) return { tier: 'like', results: likeResults };
  } catch {
    // LIKE fallback failed
  }

  return { tier: 'none', results: [] };
}

function tryFts(
  db: Database, select: string, table: string,
  order: string, matchExpr: string, limit: number
): Record<string, unknown>[] {
  try {
    return db.all(
      `${select} WHERE ${table} MATCH ? ${order}`,
      [matchExpr, limit]
    );
  } catch {
    return [];
  }
}

function sanitizeFtsInput(query: string): string {
  return query
    .replace(/["""'',,<<>>]/g, '"')
    .replace(/[^a-zA-Z0-9\s*"_\-\u00E5\u00E4\u00F6\u00C4\u00C5\u00D6]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stemWord(word: string): string {
  return word
    .replace(/(arna|erna|orna|ade|ande|ingar|ningen|erna|ade)$/i, '')
    .replace(/(ies)$/i, 'y')
    .replace(/(ying|tion|ment|ness|able|ible|ous|ive|ing|ers|ed|es|er|ly|s)$/i, '');
}
