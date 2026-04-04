import { createDatabase, type Database } from '../../src/db.js';

export function createSeededDatabase(dbPath: string): Database {
  const db = createDatabase(dbPath);

  // Medicines
  db.run(
    `INSERT INTO medicines (id, product_name, registration_number, active_substances, species_authorised, pharmaceutical_form, legal_category, ma_holder, spc_url, status, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['vet-se-001', 'Vetrimoxin', 'SE-VET-001', JSON.stringify(['amoxicillin']), JSON.stringify(['cattle', 'pig']), 'solution for injection', 'POM-V', 'Ceva', 'https://lakemedelsverket.se/spc/vet-se-001', 'authorised', 'SE']
  );
  db.run(
    `INSERT INTO medicines (id, product_name, registration_number, active_substances, species_authorised, pharmaceutical_form, legal_category, ma_holder, spc_url, status, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['vet-se-002', 'Baytril', 'SE-VET-002', JSON.stringify(['enrofloxacin']), JSON.stringify(['cattle', 'pig', 'poultry']), 'oral solution', 'POM-V', 'Elanco', 'https://lakemedelsverket.se/spc/vet-se-002', 'authorised', 'SE']
  );
  db.run(
    `INSERT INTO medicines (id, product_name, registration_number, active_substances, species_authorised, pharmaceutical_form, legal_category, ma_holder, spc_url, status, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['vet-se-003', 'Metacam', 'SE-VET-003', JSON.stringify(['meloxicam']), JSON.stringify(['cattle', 'pig', 'horse']), 'solution for injection', 'POM-V', 'Boehringer Ingelheim', 'https://lakemedelsverket.se/spc/vet-se-003', 'authorised', 'SE']
  );

  // Withdrawal periods
  db.run(
    `INSERT INTO withdrawal_periods (medicine_id, species, product_type, period_days, notes, zero_day_allowed, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['vet-se-001', 'cattle', 'meat', 15, 'Standard withdrawal for cattle meat', 0, 'SE']
  );
  db.run(
    `INSERT INTO withdrawal_periods (medicine_id, species, product_type, period_days, notes, zero_day_allowed, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['vet-se-001', 'cattle', 'milk', 3, 'Short withdrawal for milk', 0, 'SE']
  );
  db.run(
    `INSERT INTO withdrawal_periods (medicine_id, species, product_type, period_days, notes, zero_day_allowed, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['vet-se-001', 'pig', 'meat', 10, 'Standard withdrawal for pig meat', 0, 'SE']
  );

  // Banned substances
  db.run(
    `INSERT INTO banned_substances (substance, category, applies_to, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?)`,
    ['chloramphenicol', 'antimicrobial', 'all food-producing animals', 'Regulation (EU) 37/2010', 'SE']
  );
  db.run(
    `INSERT INTO banned_substances (substance, category, applies_to, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?)`,
    ['metronidazole', 'antiprotozoal', 'all food-producing animals', 'Regulation (EU) 37/2010', 'SE']
  );
  db.run(
    `INSERT INTO banned_substances (substance, category, applies_to, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?)`,
    ['diethylstilbestrol', 'hormone', 'cattle', 'Directive 96/22/EC', 'SE']
  );

  // Cascade rules
  db.run(
    `INSERT INTO cascade_rules (step_order, description, documentation_required, default_withdrawal_meat_days, default_withdrawal_milk_days, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [1, 'Use a product authorised in Sweden for the species and condition', 'Standard treatment record', null, null, 'SJVFS 2019:25', 'SE']
  );
  db.run(
    `INSERT INTO cascade_rules (step_order, description, documentation_required, default_withdrawal_meat_days, default_withdrawal_milk_days, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [2, 'Use a product authorised in Sweden for another species or condition', 'Veterinary justification required', 28, 7, 'SJVFS 2019:25', 'SE']
  );
  db.run(
    `INSERT INTO cascade_rules (step_order, description, documentation_required, default_withdrawal_meat_days, default_withdrawal_milk_days, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [3, 'Use a product authorised in another EU member state', 'Special import licence + vet justification', 28, 7, 'SJVFS 2019:25', 'SE']
  );

  // Record requirements
  db.run(
    `INSERT INTO record_requirements (holding_type, species, requirement, retention_period, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['dairy', 'cattle', 'Record date, medicine, dose, withdrawal period, animal ID for all treatments', '5 years', 'SJVFS 2019:25', 'SE']
  );
  db.run(
    `INSERT INTO record_requirements (holding_type, species, requirement, retention_period, regulation_ref, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['pig farm', 'pig', 'Treatment register with batch ID, medicine, diagnosis, veterinarian', '5 years', 'SJVFS 2019:25', 'SE']
  );

  // FTS5 search index
  db.run(
    `INSERT INTO search_index (title, body, species, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Vetrimoxin amoxicillin', 'Vetrimoxin contains amoxicillin. Authorised for cattle and pig. Solution for injection.', 'cattle pig', 'SE']
  );
  db.run(
    `INSERT INTO search_index (title, body, species, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Baytril enrofloxacin', 'Baytril contains enrofloxacin. Authorised for cattle, pig, and poultry. Oral solution.', 'cattle pig poultry', 'SE']
  );
  db.run(
    `INSERT INTO search_index (title, body, species, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Metacam meloxicam', 'Metacam contains meloxicam. Authorised for cattle, pig, and horse. Anti-inflammatory.', 'cattle pig horse', 'SE']
  );

  return db;
}
