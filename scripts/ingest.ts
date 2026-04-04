/**
 * Sweden Veterinary Medicines MCP — Data Ingestion Script
 *
 * Populates the database with Swedish veterinary medicine data:
 * - Authorised medicines (Lakemedelsverket register)
 * - Withdrawal periods (SPC data — CRITICAL for food safety)
 * - Banned substances (EU/Swedish regulations)
 * - Prescribing cascade rules (Jordbruksverket)
 * - Record-keeping requirements (Swedish regulations)
 *
 * Usage: npm run ingest
 */

import { createDatabase } from '../src/db.js';
import { mkdirSync, writeFileSync } from 'fs';

mkdirSync('data', { recursive: true });
const db = createDatabase('data/database.db');

const now = new Date().toISOString().split('T')[0];

// ============================================================
// MEDICINES — Swedish authorised veterinary products
// ============================================================

const medicines: {
  id: string; product_name: string; registration_number: string;
  active_substances: string; species_authorised: string;
  pharmaceutical_form: string; legal_category: string;
  ma_holder: string; spc_url: string; status: string;
}[] = [
  {
    id: 'apoquel',
    product_name: 'Apoquel (oclacitinib)',
    registration_number: 'SE/V/0001',
    active_substances: '["oclacitinib"]',
    species_authorised: '["hund"]',
    pharmaceutical_form: 'tablett',
    legal_category: 'Rx',
    ma_holder: 'Zoetis',
    spc_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta?query=apoquel',
    status: 'authorised',
  },
  {
    id: 'metacam-inj',
    product_name: 'Metacam 20 mg/ml injektionsvatska (meloxicam)',
    registration_number: 'SE/V/0002',
    active_substances: '["meloxicam"]',
    species_authorised: '["notkreatur","svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Boehringer Ingelheim',
    spc_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta?query=metacam',
    status: 'authorised',
  },
  {
    id: 'excenel',
    product_name: 'Excenel RTU (ceftiofur)',
    registration_number: 'SE/V/0003',
    active_substances: '["ceftiofur"]',
    species_authorised: '["notkreatur","svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Zoetis',
    spc_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta?query=excenel',
    status: 'authorised',
  },
  {
    id: 'peni-vet',
    product_name: 'Peni-vet vet (bensylpenicillin)',
    registration_number: 'SE/V/0004',
    active_substances: '["bensylpenicillin"]',
    species_authorised: '["notkreatur","svin","far","get"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Boehringer Ingelheim',
    spc_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta?query=peni-vet',
    status: 'authorised',
  },
  {
    id: 'ivomec',
    product_name: 'Ivomec vet (ivermektin)',
    registration_number: 'SE/V/0005',
    active_substances: '["ivermektin"]',
    species_authorised: '["notkreatur","far","svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Boehringer Ingelheim',
    spc_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta?query=ivomec',
    status: 'authorised',
  },
  {
    id: 'baytril',
    product_name: 'Baytril vet (enrofloxacin)',
    registration_number: 'SE/V/0006',
    active_substances: '["enrofloxacin"]',
    species_authorised: '["notkreatur","svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Elanco',
    spc_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta?query=baytril',
    status: 'authorised',
  },
  {
    id: 'terramycin',
    product_name: 'Terramycin vet (oxytetracyklin)',
    registration_number: 'SE/V/0007',
    active_substances: '["oxytetracyklin"]',
    species_authorised: '["notkreatur","svin","far"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Zoetis',
    spc_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta?query=terramycin',
    status: 'authorised',
  },
  {
    id: 'cobactan',
    product_name: 'Cobactan (cefquinom)',
    registration_number: 'SE/V/0008',
    active_substances: '["cefquinom"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta?query=cobactan',
    status: 'authorised',
  },
  {
    id: 'zuprevo',
    product_name: 'Zuprevo (tildipirosin)',
    registration_number: 'SE/V/0009',
    active_substances: '["tildipirosin"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta?query=zuprevo',
    status: 'authorised',
  },
  {
    id: 'draxxin',
    product_name: 'Draxxin (tulathromycin)',
    registration_number: 'SE/V/0010',
    active_substances: '["tulathromycin"]',
    species_authorised: '["notkreatur","svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Zoetis',
    spc_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta?query=draxxin',
    status: 'authorised',
  },
  {
    id: 'eprinex',
    product_name: 'Eprinex Pour-on (eprinomektin)',
    registration_number: 'SE/V/0011',
    active_substances: '["eprinomektin"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'pour-on',
    legal_category: 'Rx',
    ma_holder: 'Boehringer Ingelheim',
    spc_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta?query=eprinex',
    status: 'authorised',
  },
  {
    id: 'cydectin',
    product_name: 'Cydectin (moxidektin)',
    registration_number: 'SE/V/0012',
    active_substances: '["moxidektin"]',
    species_authorised: '["notkreatur","far"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Elanco',
    spc_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta?query=cydectin',
    status: 'authorised',
  },
  {
    id: 'shotapen',
    product_name: 'Shotapen vet (bensylpenicillin + dihydrostreptomycin)',
    registration_number: 'SE/V/0013',
    active_substances: '["bensylpenicillin","dihydrostreptomycin"]',
    species_authorised: '["notkreatur","svin","far"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Virbac',
    spc_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta?query=shotapen',
    status: 'authorised',
  },
  {
    id: 'finadyne',
    product_name: 'Finadyne vet (flunixin)',
    registration_number: 'SE/V/0014',
    active_substances: '["flunixin"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta?query=finadyne',
    status: 'authorised',
  },
  {
    id: 'buscopan',
    product_name: 'Buscopan compositum (metamizol + hyoscinbutylbromid)',
    registration_number: 'SE/V/0015',
    active_substances: '["metamizol","hyoscinbutylbromid"]',
    species_authorised: '["notkreatur","hast"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Boehringer Ingelheim',
    spc_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta?query=buscopan',
    status: 'authorised',
  },
  {
    id: 'nuflor',
    product_name: 'Nuflor (florfenikol)',
    registration_number: 'SE/V/0016',
    active_substances: '["florfenikol"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta?query=nuflor',
    status: 'authorised',
  },
  {
    id: 'alamycin',
    product_name: 'Alamycin LA (oxytetracyklin)',
    registration_number: 'SE/V/0017',
    active_substances: '["oxytetracyklin"]',
    species_authorised: '["notkreatur","svin","far"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Norbrook',
    spc_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta?query=alamycin',
    status: 'authorised',
  },
  {
    id: 'betamox',
    product_name: 'Betamox vet (amoxicillin)',
    registration_number: 'SE/V/0018',
    active_substances: '["amoxicillin"]',
    species_authorised: '["notkreatur","svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Norbrook',
    spc_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta?query=betamox',
    status: 'authorised',
  },
  {
    id: 'borgal',
    product_name: 'Borgal vet (trimetoprim + sulfadoxin)',
    registration_number: 'SE/V/0019',
    active_substances: '["trimetoprim","sulfadoxin"]',
    species_authorised: '["notkreatur","svin","far"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta?query=borgal',
    status: 'authorised',
  },
  {
    id: 'orizure',
    product_name: 'Orizure (tulathromycin)',
    registration_number: 'SE/V/0020',
    active_substances: '["tulathromycin"]',
    species_authorised: '["svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Elanco',
    spc_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta?query=orizure',
    status: 'authorised',
  },
];

console.log(`Inserting ${medicines.length} medicines...`);
const insertMedicine = db.instance.prepare(
  `INSERT OR REPLACE INTO medicines (id, product_name, registration_number, active_substances, species_authorised, pharmaceutical_form, legal_category, ma_holder, spc_url, status, jurisdiction)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SE')`
);
for (const m of medicines) {
  insertMedicine.run(m.id, m.product_name, m.registration_number, m.active_substances, m.species_authorised, m.pharmaceutical_form, m.legal_category, m.ma_holder, m.spc_url, m.status);
}

// ============================================================
// WITHDRAWAL PERIODS — CRITICAL FOR FOOD SAFETY
// ============================================================

const withdrawalPeriods: {
  medicine_id: string; species: string; product_type: string;
  period_days: number; notes: string; zero_day_allowed: number;
}[] = [
  // Metacam (meloxicam) — cattle
  { medicine_id: 'metacam-inj', species: 'notkreatur', product_type: 'kott', period_days: 15, notes: 'SPC-specified withdrawal for cattle meat', zero_day_allowed: 0 },
  { medicine_id: 'metacam-inj', species: 'notkreatur', product_type: 'mjolk', period_days: 5, notes: 'SPC-specified withdrawal for cattle milk', zero_day_allowed: 0 },
  { medicine_id: 'metacam-inj', species: 'svin', product_type: 'kott', period_days: 5, notes: 'SPC-specified withdrawal for pig meat', zero_day_allowed: 0 },

  // Excenel (ceftiofur) — 3rd gen cephalosporin, restricted
  { medicine_id: 'excenel', species: 'notkreatur', product_type: 'kott', period_days: 8, notes: '3rd gen cephalosporin — restricted use, requires justification', zero_day_allowed: 0 },
  { medicine_id: 'excenel', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'Zero withdrawal for milk per SPC', zero_day_allowed: 1 },
  { medicine_id: 'excenel', species: 'svin', product_type: 'kott', period_days: 5, notes: '3rd gen cephalosporin — restricted use', zero_day_allowed: 0 },

  // Peni-vet (benzylpenicillin) — first-line antibiotic
  { medicine_id: 'peni-vet', species: 'notkreatur', product_type: 'kott', period_days: 6, notes: 'First-line antibiotic for cattle', zero_day_allowed: 0 },
  { medicine_id: 'peni-vet', species: 'notkreatur', product_type: 'mjolk', period_days: 4, notes: 'Milk withdrawal 4 days (96 hours)', zero_day_allowed: 0 },
  { medicine_id: 'peni-vet', species: 'svin', product_type: 'kott', period_days: 4, notes: 'First-line antibiotic for pigs', zero_day_allowed: 0 },
  { medicine_id: 'peni-vet', species: 'far', product_type: 'kott', period_days: 6, notes: 'First-line antibiotic for sheep', zero_day_allowed: 0 },

  // Ivomec (ivermectin) — antiparasitic
  { medicine_id: 'ivomec', species: 'notkreatur', product_type: 'kott', period_days: 42, notes: 'Long withdrawal — subcutaneous injection', zero_day_allowed: 0 },
  { medicine_id: 'ivomec', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'NOT authorised for lactating dairy cattle producing milk for human consumption', zero_day_allowed: 0 },
  { medicine_id: 'ivomec', species: 'far', product_type: 'kott', period_days: 22, notes: 'Sheep meat withdrawal', zero_day_allowed: 0 },
  { medicine_id: 'ivomec', species: 'svin', product_type: 'kott', period_days: 28, notes: 'Pig meat withdrawal', zero_day_allowed: 0 },

  // Baytril (enrofloxacin) — fluoroquinolone, restricted
  { medicine_id: 'baytril', species: 'notkreatur', product_type: 'kott', period_days: 14, notes: 'Fluoroquinolone — restricted, requires susceptibility testing before use', zero_day_allowed: 0 },
  { medicine_id: 'baytril', species: 'notkreatur', product_type: 'mjolk', period_days: 4, notes: 'Fluoroquinolone — milk withdrawal', zero_day_allowed: 0 },
  { medicine_id: 'baytril', species: 'svin', product_type: 'kott', period_days: 13, notes: 'Fluoroquinolone — restricted use in pigs', zero_day_allowed: 0 },

  // Terramycin (oxytetracycline)
  { medicine_id: 'terramycin', species: 'notkreatur', product_type: 'kott', period_days: 18, notes: 'Long-acting tetracycline formulation', zero_day_allowed: 0 },
  { medicine_id: 'terramycin', species: 'notkreatur', product_type: 'mjolk', period_days: 7, notes: 'Milk withdrawal 7 days', zero_day_allowed: 0 },
  { medicine_id: 'terramycin', species: 'svin', product_type: 'kott', period_days: 14, notes: 'Pig meat withdrawal', zero_day_allowed: 0 },
  { medicine_id: 'terramycin', species: 'far', product_type: 'kott', period_days: 18, notes: 'Sheep meat withdrawal', zero_day_allowed: 0 },

  // Cobactan (cefquinome) — 4th gen cephalosporin
  { medicine_id: 'cobactan', species: 'notkreatur', product_type: 'kott', period_days: 5, notes: '4th gen cephalosporin — critically important antimicrobial, last resort only', zero_day_allowed: 0 },
  { medicine_id: 'cobactan', species: 'notkreatur', product_type: 'mjolk', period_days: 1, notes: '24 hours milk withdrawal', zero_day_allowed: 0 },

  // Zuprevo (tildipirosin)
  { medicine_id: 'zuprevo', species: 'notkreatur', product_type: 'kott', period_days: 47, notes: 'Long withdrawal due to macrolide persistence in tissue', zero_day_allowed: 0 },

  // Draxxin (tulathromycin) — cattle and pig
  { medicine_id: 'draxxin', species: 'notkreatur', product_type: 'kott', period_days: 49, notes: 'Macrolide — long tissue residue time', zero_day_allowed: 0 },
  { medicine_id: 'draxxin', species: 'svin', product_type: 'kott', period_days: 33, notes: 'Macrolide — pig meat withdrawal', zero_day_allowed: 0 },

  // Eprinex (eprinomectin) — zero milk withdrawal
  { medicine_id: 'eprinex', species: 'notkreatur', product_type: 'kott', period_days: 15, notes: 'Pour-on formulation, meat withdrawal', zero_day_allowed: 0 },
  { medicine_id: 'eprinex', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'Zero milk withdrawal — approved for use in lactating dairy cattle', zero_day_allowed: 1 },

  // Cydectin (moxidectin)
  { medicine_id: 'cydectin', species: 'notkreatur', product_type: 'kott', period_days: 65, notes: 'Long withdrawal for injectable formulation', zero_day_allowed: 0 },
  { medicine_id: 'cydectin', species: 'far', product_type: 'kott', period_days: 42, notes: 'Sheep meat withdrawal', zero_day_allowed: 0 },

  // Shotapen (penicillin + streptomycin)
  { medicine_id: 'shotapen', species: 'notkreatur', product_type: 'kott', period_days: 24, notes: 'Combination product — longer withdrawal than penicillin alone', zero_day_allowed: 0 },
  { medicine_id: 'shotapen', species: 'notkreatur', product_type: 'mjolk', period_days: 4, notes: 'Milk withdrawal 96 hours', zero_day_allowed: 0 },
  { medicine_id: 'shotapen', species: 'svin', product_type: 'kott', period_days: 18, notes: 'Pig meat withdrawal', zero_day_allowed: 0 },

  // Finadyne (flunixin) — NSAID
  { medicine_id: 'finadyne', species: 'notkreatur', product_type: 'kott', period_days: 10, notes: 'NSAID — meat withdrawal', zero_day_allowed: 0 },
  { medicine_id: 'finadyne', species: 'notkreatur', product_type: 'mjolk', period_days: 1, notes: 'NSAID — 24 hours milk withdrawal', zero_day_allowed: 0 },

  // Nuflor (florfenicol)
  { medicine_id: 'nuflor', species: 'notkreatur', product_type: 'kott', period_days: 44, notes: 'Long-acting formulation, extended tissue residue', zero_day_allowed: 0 },
  { medicine_id: 'nuflor', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'NOT authorised for lactating dairy cattle producing milk for human consumption', zero_day_allowed: 0 },

  // Alamycin LA (oxytetracycline long-acting)
  { medicine_id: 'alamycin', species: 'notkreatur', product_type: 'kott', period_days: 21, notes: 'Long-acting oxytetracycline formulation', zero_day_allowed: 0 },
  { medicine_id: 'alamycin', species: 'notkreatur', product_type: 'mjolk', period_days: 7, notes: 'Milk withdrawal 7 days', zero_day_allowed: 0 },
  { medicine_id: 'alamycin', species: 'svin', product_type: 'kott', period_days: 14, notes: 'Pig meat withdrawal', zero_day_allowed: 0 },

  // Betamox (amoxicillin)
  { medicine_id: 'betamox', species: 'notkreatur', product_type: 'kott', period_days: 18, notes: 'Amoxicillin meat withdrawal', zero_day_allowed: 0 },
  { medicine_id: 'betamox', species: 'notkreatur', product_type: 'mjolk', period_days: 3, notes: 'Milk withdrawal 72 hours', zero_day_allowed: 0 },
  { medicine_id: 'betamox', species: 'svin', product_type: 'kott', period_days: 14, notes: 'Pig meat withdrawal', zero_day_allowed: 0 },

  // Borgal (trimethoprim + sulfadoxine)
  { medicine_id: 'borgal', species: 'notkreatur', product_type: 'kott', period_days: 12, notes: 'Sulfonamide combination', zero_day_allowed: 0 },
  { medicine_id: 'borgal', species: 'notkreatur', product_type: 'mjolk', period_days: 4, notes: 'Milk withdrawal 96 hours', zero_day_allowed: 0 },
  { medicine_id: 'borgal', species: 'svin', product_type: 'kott', period_days: 10, notes: 'Pig meat withdrawal', zero_day_allowed: 0 },

  // Orizure (tulathromycin) — pigs only
  { medicine_id: 'orizure', species: 'svin', product_type: 'kott', period_days: 33, notes: 'Macrolide — pig-specific formulation', zero_day_allowed: 0 },
];

console.log(`Inserting ${withdrawalPeriods.length} withdrawal periods...`);
const insertWithdrawal = db.instance.prepare(
  `INSERT INTO withdrawal_periods (medicine_id, species, product_type, period_days, notes, zero_day_allowed, jurisdiction)
   VALUES (?, ?, ?, ?, ?, ?, 'SE')`
);
for (const w of withdrawalPeriods) {
  insertWithdrawal.run(w.medicine_id, w.species, w.product_type, w.period_days, w.notes, w.zero_day_allowed);
}

// ============================================================
// BANNED SUBSTANCES — EU Council Directive 96/22/EC + Swedish
// ============================================================

const bannedSubstances: {
  substance: string; category: string; applies_to: string; regulation_ref: string;
}[] = [
  { substance: 'Chloramphenicol', category: 'Antibiotics (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2 (prohibited substances)' },
  { substance: 'Nitrofurans (furazolidone, furaltadone, nitrofurazone, nitrofurantoin)', category: 'Antibiotics (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Metronidazole', category: 'Antibiotics (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Dimetridazole', category: 'Antiprotozoals (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Ronidazole', category: 'Antiprotozoals (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Clenbuterol (as growth promoter)', category: 'Beta-agonists (banned as growth promoter)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC' },
  { substance: 'Ractopamine', category: 'Beta-agonists (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC' },
  { substance: 'Diethylstilbestrol (DES)', category: 'Stilbenes (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC' },
  { substance: 'Stilbenes and stilbene derivatives', category: 'Stilbenes (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC' },
  { substance: 'Thyrostatic agents (thiouracil, methylthiouracil, propylthiouracil)', category: 'Thyrostatics (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC' },
  { substance: 'Oestradiol 17-beta and ester-like derivatives', category: 'Hormones (banned as growth promoter)', applies_to: 'all food-producing animals', regulation_ref: 'EU Directive 2003/74/EC' },
  { substance: 'Testosterone (as growth promoter)', category: 'Hormones (banned as growth promoter)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC' },
  { substance: 'Progesterone (as growth promoter)', category: 'Hormones (banned as growth promoter)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC' },
  { substance: 'Zeranol', category: 'Hormones (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC' },
  { substance: 'Trenbolone', category: 'Hormones (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC' },
  { substance: 'Melengestrol acetate (MGA)', category: 'Hormones (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC' },
  { substance: 'Dapsone', category: 'Antibiotics (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Colchicine', category: 'Other (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Aristolochia spp. and preparations thereof', category: 'Herbal (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Malachite green', category: 'Dyes (banned)', applies_to: 'aquaculture species', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Crystal violet (gentian violet)', category: 'Dyes (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
];

console.log(`Inserting ${bannedSubstances.length} banned substances...`);
const insertBanned = db.instance.prepare(
  `INSERT INTO banned_substances (substance, category, applies_to, regulation_ref, jurisdiction)
   VALUES (?, ?, ?, ?, 'SE')`
);
for (const b of bannedSubstances) {
  insertBanned.run(b.substance, b.category, b.applies_to, b.regulation_ref);
}

// ============================================================
// CASCADE RULES — Swedish prescribing cascade (kaskadprincipen)
// ============================================================

const cascadeRules: {
  step_order: number; description: string; documentation_required: string;
  default_withdrawal_meat_days: number; default_withdrawal_milk_days: number;
  source: string;
}[] = [
  {
    step_order: 1,
    description: 'Use a veterinary medicinal product authorised in Sweden for the species and condition being treated.',
    documentation_required: 'Standard treatment record in stalljournal.',
    default_withdrawal_meat_days: 0,
    default_withdrawal_milk_days: 0,
    source: 'LVFS 2012:15 (Lakemedelsverket), EU Regulation 2019/6 Art. 112-114',
  },
  {
    step_order: 2,
    description: 'If no suitable product from Step 1: use a product authorised in Sweden for another species or another condition in the same species.',
    documentation_required: 'Clinical justification documented. Species/condition deviation recorded. Informed animal owner consent.',
    default_withdrawal_meat_days: 28,
    default_withdrawal_milk_days: 7,
    source: 'EU Regulation 2019/6 Art. 113(1)(a), SJVFS 2019:32 (Jordbruksverket)',
  },
  {
    step_order: 3,
    description: 'If no suitable product from Steps 1-2: use a product authorised in another EU/EEA member state for the same species (cascade import via special license).',
    documentation_required: 'Veterinarian applies for special import license from Lakemedelsverket. Written justification and clinical need documented. Extended withdrawal periods apply.',
    default_withdrawal_meat_days: 28,
    default_withdrawal_milk_days: 7,
    source: 'EU Regulation 2019/6 Art. 113(1)(b), Lakemedelsverket license procedure',
  },
  {
    step_order: 4,
    description: 'If no suitable product from Steps 1-3: use an extemporaneous preparation (magistral formula) prepared by a pharmacist according to veterinary prescription.',
    documentation_required: 'Detailed veterinary prescription. Pharmacy preparation record. Full justification for extemporaneous preparation. Extended withdrawal periods apply.',
    default_withdrawal_meat_days: 28,
    default_withdrawal_milk_days: 7,
    source: 'EU Regulation 2019/6 Art. 113(1)(c), LVFS 2012:15',
  },
];

console.log(`Inserting ${cascadeRules.length} cascade rules...`);
const insertCascade = db.instance.prepare(
  `INSERT INTO cascade_rules (step_order, description, documentation_required, default_withdrawal_meat_days, default_withdrawal_milk_days, source, jurisdiction)
   VALUES (?, ?, ?, ?, ?, ?, 'SE')`
);
for (const c of cascadeRules) {
  insertCascade.run(c.step_order, c.description, c.documentation_required, c.default_withdrawal_meat_days, c.default_withdrawal_milk_days, c.source);
}

// ============================================================
// RECORD REQUIREMENTS — Swedish stalljournal & documentation
// ============================================================

const recordRequirements: {
  holding_type: string | null; species: string | null; requirement: string;
  retention_period: string; regulation_ref: string;
}[] = [
  {
    holding_type: null,
    species: null,
    requirement: 'All veterinary treatments on food-producing animals must be recorded in a stalljournal (treatment journal). Required fields: date, animal identification (ear tag/group), diagnosis, medicine name and batch number, dose, route of administration, withdrawal period end date, treating veterinarian name and license number.',
    retention_period: '5 years',
    regulation_ref: 'SJVFS 2019:32, EU Regulation 2019/6 Art. 108',
  },
  {
    holding_type: 'mjolkgard',
    species: 'notkreatur',
    requirement: 'Dairy farms must maintain separate record of all treated animals with milk withdrawal end dates. Treated animals must be clearly identified and milk must be withheld and discarded until withdrawal period expires. Bulk tank milk must not contain residues above MRL.',
    retention_period: '5 years',
    regulation_ref: 'SJVFS 2019:32, EU Regulation 853/2004',
  },
  {
    holding_type: 'slaktgrisproduktion',
    species: 'svin',
    requirement: 'Pig producers must record all treatments with group treatment records when entire pens are treated. Individual treatment records required for injectable medicines. Withdrawal end dates must be communicated to slaughterhouse at delivery.',
    retention_period: '5 years',
    regulation_ref: 'SJVFS 2019:32',
  },
  {
    holding_type: null,
    species: null,
    requirement: 'Veterinarian must provide written treatment instructions to animal holder including medicine name, dose, duration, route of administration, and withdrawal period. Copy retained by both vet and animal holder.',
    retention_period: '5 years',
    regulation_ref: 'SJVFS 2019:32, LVFS 2012:15',
  },
  {
    holding_type: null,
    species: null,
    requirement: 'Cascade prescribing (steps 2-4) requires additional documentation: clinical justification for off-label use, informed consent from animal owner, and documentation that no suitable authorised product exists.',
    retention_period: '5 years',
    regulation_ref: 'EU Regulation 2019/6 Art. 113, SJVFS 2019:32',
  },
  {
    holding_type: null,
    species: null,
    requirement: 'Antimicrobial use must be reported to SVA (National Veterinary Institute) for resistance monitoring. Veterinarians must record all antimicrobial prescriptions in the national VetStat database.',
    retention_period: '5 years',
    regulation_ref: 'SJVFS 2019:32, EU Regulation 2019/6 Art. 57',
  },
  {
    holding_type: 'faravling',
    species: 'far',
    requirement: 'Sheep holdings must record all treatments with individual animal identification where feasible, or flock-level records for group treatments. Withdrawal end dates required before slaughter.',
    retention_period: '5 years',
    regulation_ref: 'SJVFS 2019:32',
  },
  {
    holding_type: null,
    species: 'hast',
    requirement: 'Equines intended for slaughter must have all treatments recorded in the horse passport (hastpass). If treated with a substance not allowed for food-producing animals, the horse must be permanently excluded from the food chain (6-month declaration or lifetime exclusion).',
    retention_period: 'Lifetime of animal',
    regulation_ref: 'EU Regulation 2015/262, SJVFS 2019:32',
  },
];

console.log(`Inserting ${recordRequirements.length} record requirements...`);
const insertRecord = db.instance.prepare(
  `INSERT INTO record_requirements (holding_type, species, requirement, retention_period, regulation_ref, jurisdiction)
   VALUES (?, ?, ?, ?, ?, 'SE')`
);
for (const r of recordRequirements) {
  insertRecord.run(r.holding_type, r.species, r.requirement, r.retention_period, r.regulation_ref);
}

// ============================================================
// FTS5 SEARCH INDEX
// ============================================================

console.log('Building FTS5 search index...');

// Delete existing index entries
db.run('DELETE FROM search_index');

// Index medicines
for (const m of medicines) {
  const substances = JSON.parse(m.active_substances).join(', ');
  const species = JSON.parse(m.species_authorised).join(', ');
  const body = `${m.product_name}. Active substances: ${substances}. Form: ${m.pharmaceutical_form}. Category: ${m.legal_category}. Holder: ${m.ma_holder}. Reg: ${m.registration_number}.`;
  db.run(
    'INSERT INTO search_index (title, body, species, jurisdiction) VALUES (?, ?, ?, ?)',
    [m.product_name, body, species, 'SE']
  );
}

// Index banned substances
for (const b of bannedSubstances) {
  const body = `BANNED: ${b.substance}. Category: ${b.category}. Applies to: ${b.applies_to}. Ref: ${b.regulation_ref}.`;
  db.run(
    'INSERT INTO search_index (title, body, species, jurisdiction) VALUES (?, ?, ?, ?)',
    [`Banned: ${b.substance}`, body, b.applies_to, 'SE']
  );
}

// Index cascade rules
for (const c of cascadeRules) {
  const body = `Cascade step ${c.step_order}: ${c.description}. Documentation: ${c.documentation_required}. Default withdrawal: ${c.default_withdrawal_meat_days} days meat, ${c.default_withdrawal_milk_days} days milk. Source: ${c.source}.`;
  db.run(
    'INSERT INTO search_index (title, body, species, jurisdiction) VALUES (?, ?, ?, ?)',
    [`Prescribing cascade step ${c.step_order}`, body, 'all', 'SE']
  );
}

// ============================================================
// METADATA
// ============================================================

db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('last_ingest', ?)", [now]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('build_date', ?)", [now]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('mcp_name', 'Sweden Veterinary Medicines MCP')", []);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('jurisdiction', 'SE')", []);

writeFileSync('data/coverage.json', JSON.stringify({
  mcp_name: 'Sweden Veterinary Medicines MCP',
  jurisdiction: 'SE',
  build_date: now,
  medicines_count: medicines.length,
  withdrawal_periods_count: withdrawalPeriods.length,
  banned_substances_count: bannedSubstances.length,
  cascade_rules_count: cascadeRules.length,
  record_requirements_count: recordRequirements.length,
  data_sources: [
    'Lakemedelsverket (Swedish Medical Products Agency)',
    'Jordbruksverket (Swedish Board of Agriculture)',
    'EMA (European Medicines Agency)',
  ],
  status: 'populated',
}, null, 2));

db.close();

console.log('');
console.log('=== Ingestion Complete ===');
console.log(`  Medicines:           ${medicines.length}`);
console.log(`  Withdrawal periods:  ${withdrawalPeriods.length}`);
console.log(`  Banned substances:   ${bannedSubstances.length}`);
console.log(`  Cascade rules:       ${cascadeRules.length}`);
console.log(`  Record requirements: ${recordRequirements.length}`);
console.log(`  Build date:          ${now}`);
console.log('');
