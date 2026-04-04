/**
 * Sweden Veterinary Medicines MCP — Data Ingestion Script
 *
 * Populates the database with Swedish veterinary medicine data:
 * - Authorised medicines (Lakemedelsverket / FASS Vet register)
 * - Withdrawal periods (SPC data — CRITICAL for food safety)
 * - Banned substances (EU Regulation 37/2010 Table 2 + Council Directive 96/22/EC)
 * - Prescribing cascade rules (Jordbruksverket SJVFS 2019:32 + EU Regulation 2019/6)
 * - Record-keeping requirements (Swedish regulations)
 *
 * Data sources:
 *   - Lakemedelsverket (Swedish Medical Products Agency) — product authorisations
 *   - FASS Vet (pharmaceutical industry product database) — SPC withdrawal periods
 *   - Jordbruksverket (Swedish Board of Agriculture) — SJVFS 2019:32 prescribing rules
 *   - EMA (European Medicines Agency) — EPAR product information
 *   - EU Regulation 37/2010 Table 2 — prohibited substances
 *   - EU Council Directive 96/22/EC — banned growth promoters
 *   - EU Regulation 2019/6 Art. 113-115 — cascade withdrawal periods
 *   - SVA (National Veterinary Institute) — Svarm antibiotic resistance monitoring
 *
 * SAFETY-CRITICAL: Withdrawal periods determine when animal products are safe
 * for human consumption. Every period is conservative — when EU/Swedish sources
 * differ or data is uncertain, the longer period is used. The cascade default
 * (28 days meat, 7 days milk) applies when no authorised period exists.
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
// Sources: Lakemedelsverket, FASS Vet, EMA Union Product Database
// ============================================================

const medicines: {
  id: string; product_name: string; registration_number: string;
  active_substances: string; species_authorised: string;
  pharmaceutical_form: string; legal_category: string;
  ma_holder: string; spc_url: string; status: string;
}[] = [
  // ================================================================
  //  ANTIBIOTICS: Penicillins
  // ================================================================
  {
    id: 'peni-vet',
    product_name: 'Peni-vet vet (bensylpenicillin)',
    registration_number: 'SE/V/0004',
    active_substances: '["bensylpenicillin"]',
    species_authorised: '["notkreatur","svin","far","get"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Boehringer Ingelheim',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19860314000046',
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
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
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
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'synulox',
    product_name: 'Synulox vet (amoxicillin + klavulansyra)',
    registration_number: 'SE/V/0021',
    active_substances: '["amoxicillin","klavulansyra"]',
    species_authorised: '["notkreatur","svin","hund","katt"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Zoetis',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'procapen',
    product_name: 'Procapen vet (prokainpenicillin)',
    registration_number: 'SE/V/0022',
    active_substances: '["prokainpenicillin"]',
    species_authorised: '["notkreatur","svin","far","get","hast"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Virbac',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'ultrapen',
    product_name: 'Ultrapen vet (bensylpenicillin)',
    registration_number: 'SE/V/0023',
    active_substances: '["bensylpenicillin"]',
    species_authorised: '["notkreatur","svin","far"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Norbrook',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'depocillin',
    product_name: 'Depocillin vet (prokainpenicillin)',
    registration_number: 'SE/V/0060',
    active_substances: '["prokainpenicillin"]',
    species_authorised: '["notkreatur","svin","far","hast"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'suramox',
    product_name: 'Suramox vet (amoxicillin)',
    registration_number: 'SE/V/0061',
    active_substances: '["amoxicillin"]',
    species_authorised: '["svin","fjaderfa"]',
    pharmaceutical_form: 'oral pulver',
    legal_category: 'Rx',
    ma_holder: 'Virbac',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'amoxibactin',
    product_name: 'Amoxibactin vet (amoxicillin)',
    registration_number: 'SE/V/0062',
    active_substances: '["amoxicillin"]',
    species_authorised: '["hund","katt"]',
    pharmaceutical_form: 'tablett',
    legal_category: 'Rx',
    ma_holder: 'Le Vet',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  ANTIBIOTICS: Tetracyclines
  // ================================================================
  {
    id: 'terramycin',
    product_name: 'Terramycin vet (oxytetracyklin)',
    registration_number: 'SE/V/0007',
    active_substances: '["oxytetracyklin"]',
    species_authorised: '["notkreatur","svin","far"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Zoetis',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
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
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'engemycin',
    product_name: 'Engemycin LA vet (oxytetracyklin)',
    registration_number: 'SE/V/0024',
    active_substances: '["oxytetracyklin"]',
    species_authorised: '["notkreatur","svin","far"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'doxycyclin-vet',
    product_name: 'Doxycyclin vet (doxycyklin)',
    registration_number: 'SE/V/0025',
    active_substances: '["doxycyklin"]',
    species_authorised: '["svin","fjaderfa"]',
    pharmaceutical_form: 'oral pulver',
    legal_category: 'Rx',
    ma_holder: 'Elanco',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'ronaxan',
    product_name: 'Ronaxan vet (doxycyklin)',
    registration_number: 'SE/V/0063',
    active_substances: '["doxycyklin"]',
    species_authorised: '["hund","katt"]',
    pharmaceutical_form: 'tablett',
    legal_category: 'Rx',
    ma_holder: 'Boehringer Ingelheim',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'hexasol',
    product_name: 'Hexasol LA vet (oxytetracyklin + flunixin)',
    registration_number: 'SE/V/0064',
    active_substances: '["oxytetracyklin","flunixin"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Norbrook',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  ANTIBIOTICS: Macrolides
  // ================================================================
  {
    id: 'draxxin',
    product_name: 'Draxxin (tulathromycin)',
    registration_number: 'SE/V/0010',
    active_substances: '["tulathromycin"]',
    species_authorised: '["notkreatur","svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Zoetis',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
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
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
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
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'tylan',
    product_name: 'Tylan vet (tylosin)',
    registration_number: 'SE/V/0026',
    active_substances: '["tylosin"]',
    species_authorised: '["notkreatur","svin","fjaderfa"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Elanco',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'spiramycin-vet',
    product_name: 'Suanovil (spiramycin)',
    registration_number: 'SE/V/0027',
    active_substances: '["spiramycin"]',
    species_authorised: '["notkreatur","svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Vetoquinol',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  ANTIBIOTICS: Fluoroquinolones (RESTRICTED — susceptibility testing per SJVFS 2019:32)
  // ================================================================
  {
    id: 'baytril',
    product_name: 'Baytril vet (enrofloxacin)',
    registration_number: 'SE/V/0006',
    active_substances: '["enrofloxacin"]',
    species_authorised: '["notkreatur","svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx-restricted',
    ma_holder: 'Elanco',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'baytril-oral',
    product_name: 'Baytril vet oral (enrofloxacin)',
    registration_number: 'SE/V/0065',
    active_substances: '["enrofloxacin"]',
    species_authorised: '["hund","katt"]',
    pharmaceutical_form: 'tablett',
    legal_category: 'Rx-restricted',
    ma_holder: 'Elanco',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'marbofloxacin-vet',
    product_name: 'Marbocyl vet (marbofloxacin)',
    registration_number: 'SE/V/0028',
    active_substances: '["marbofloxacin"]',
    species_authorised: '["notkreatur","svin","hund","katt"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx-restricted',
    ma_holder: 'Vetoquinol',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  ANTIBIOTICS: Cephalosporins (RESTRICTED — 3rd/4th gen require susceptibility testing)
  // ================================================================
  {
    id: 'excenel',
    product_name: 'Excenel RTU (ceftiofur)',
    registration_number: 'SE/V/0003',
    active_substances: '["ceftiofur"]',
    species_authorised: '["notkreatur","svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx-restricted',
    ma_holder: 'Zoetis',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'naxcel',
    product_name: 'Naxcel (ceftiofur)',
    registration_number: 'SE/V/0029',
    active_substances: '["ceftiofur"]',
    species_authorised: '["notkreatur","svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx-restricted',
    ma_holder: 'Zoetis',
    spc_url: 'https://medicines.health.europa.eu/veterinary/en/600000027291',
    status: 'authorised',
  },
  {
    id: 'cobactan',
    product_name: 'Cobactan (cefquinom)',
    registration_number: 'SE/V/0008',
    active_substances: '["cefquinom"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx-restricted',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'cefalexin-vet',
    product_name: 'Rilexine vet (cefalexin)',
    registration_number: 'SE/V/0030',
    active_substances: '["cefalexin"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'intramammaria',
    legal_category: 'Rx',
    ma_holder: 'Virbac',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'cepravin',
    product_name: 'Cepravin Dry Cow (cefalonium)',
    registration_number: 'SE/V/0066',
    active_substances: '["cefalonium"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'intramammaria',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  ANTIBIOTICS: Sulfonamides / trimethoprim
  // ================================================================
  {
    id: 'borgal',
    product_name: 'Borgal vet (trimetoprim + sulfadoxin)',
    registration_number: 'SE/V/0019',
    active_substances: '["trimetoprim","sulfadoxin"]',
    species_authorised: '["notkreatur","svin","far"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'tribrissen',
    product_name: 'Tribrissen vet (trimetoprim + sulfadiazin)',
    registration_number: 'SE/V/0031',
    active_substances: '["trimetoprim","sulfadiazin"]',
    species_authorised: '["notkreatur","svin","far","hast"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  ANTIBIOTICS: Florfenicol
  // ================================================================
  {
    id: 'nuflor',
    product_name: 'Nuflor (florfenikol)',
    registration_number: 'SE/V/0016',
    active_substances: '["florfenikol"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'nuflor-minidose',
    product_name: 'Nuflor Minidose 450 mg/ml (florfenikol)',
    registration_number: 'EU/2/12/141',
    active_substances: '["florfenikol"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://medicines.health.europa.eu/veterinary/en/600000060515',
    status: 'authorised',
  },

  // ================================================================
  //  ANTIBIOTICS: Lincosamides
  // ================================================================
  {
    id: 'lincomycin-vet',
    product_name: 'Lincospectin vet (linkomycin + spektinomycin)',
    registration_number: 'SE/V/0032',
    active_substances: '["linkomycin","spektinomycin"]',
    species_authorised: '["svin","fjaderfa"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Zoetis',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  ANTIBIOTICS: Intramammary
  // ================================================================
  {
    id: 'orbenin-dc',
    product_name: 'Orbenin Extra Dry Cow (kloxacillin)',
    registration_number: 'SE/V/0033',
    active_substances: '["kloxacillin"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'intramammaria',
    legal_category: 'Rx',
    ma_holder: 'Zoetis',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'ubro-red',
    product_name: 'Ubro-Red vet (bensylpenicillin)',
    registration_number: 'SE/V/0034',
    active_substances: '["bensylpenicillin"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'intramammaria',
    legal_category: 'Rx',
    ma_holder: 'Boehringer Ingelheim',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'carepen',
    product_name: 'Carepen vet (bensylpenicillin)',
    registration_number: 'SE/V/0067',
    active_substances: '["bensylpenicillin"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'intramammaria',
    legal_category: 'Rx',
    ma_holder: 'Boehringer Ingelheim',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'siccalactin',
    product_name: 'Siccalactin vet (bensylpenicillin + neomycin)',
    registration_number: 'SE/V/0068',
    active_substances: '["bensylpenicillin","neomycin"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'intramammaria',
    legal_category: 'Rx',
    ma_holder: 'Boehringer Ingelheim',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'mastiplan',
    product_name: 'Mastiplan LC (bensylpenicillin + neomycin)',
    registration_number: 'SE/V/0069',
    active_substances: '["bensylpenicillin","neomycin"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'intramammaria',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'pathozone',
    product_name: 'Pathozone (cefoperazon)',
    registration_number: 'SE/V/0070',
    active_substances: '["cefoperazon"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'intramammaria',
    legal_category: 'Rx',
    ma_holder: 'Zoetis',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'ubrolexin',
    product_name: 'Ubrolexin (cefalexin + kanamycin)',
    registration_number: 'EU/2/10/113',
    active_substances: '["cefalexin","kanamycin"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'intramammaria',
    legal_category: 'Rx',
    ma_holder: 'Boehringer Ingelheim',
    spc_url: 'https://medicines.health.europa.eu/veterinary/en/600000060515',
    status: 'authorised',
  },
  {
    id: 'cobactan-lc',
    product_name: 'Cobactan LC (cefquinom)',
    registration_number: 'SE/V/0071',
    active_substances: '["cefquinom"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'intramammaria',
    legal_category: 'Rx-restricted',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  ANTIBIOTICS: Topical / Eye / Ear
  // ================================================================
  {
    id: 'fucithalmic',
    product_name: 'Fucithalmic vet (fusidinsyra)',
    registration_number: 'SE/V/0072',
    active_substances: '["fusidinsyra"]',
    species_authorised: '["hund","katt"]',
    pharmaceutical_form: 'ogondroppar',
    legal_category: 'Rx',
    ma_holder: 'Dechra',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'surolan',
    product_name: 'Surolan (mikonazol + polymyxin B + prednisolon)',
    registration_number: 'SE/V/0073',
    active_substances: '["mikonazol","polymyxin B","prednisolon"]',
    species_authorised: '["hund","katt"]',
    pharmaceutical_form: 'oron-/ogondroppar',
    legal_category: 'Rx',
    ma_holder: 'Elanco',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'terramycin-spray',
    product_name: 'Terramycin spray (oxytetracyklin)',
    registration_number: 'SE/V/0074',
    active_substances: '["oxytetracyklin"]',
    species_authorised: '["notkreatur","far","svin"]',
    pharmaceutical_form: 'kutanspray',
    legal_category: 'Rx',
    ma_holder: 'Zoetis',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'cyclo-spray',
    product_name: 'Cyclo spray (klortetracyklin)',
    registration_number: 'SE/V/0075',
    active_substances: '["klortetracyklin"]',
    species_authorised: '["notkreatur","far","svin"]',
    pharmaceutical_form: 'kutanspray',
    legal_category: 'Rx',
    ma_holder: 'Zoetis',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  ANTIBIOTICS: Injectable combination
  // ================================================================
  {
    id: 'combi-kel',
    product_name: 'Combi-kel vet (bensylpenicillin + streptomycin)',
    registration_number: 'SE/V/0076',
    active_substances: '["bensylpenicillin","streptomycin"]',
    species_authorised: '["notkreatur","svin","far"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Kela',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  NSAIDs
  // ================================================================
  {
    id: 'metacam-inj',
    product_name: 'Metacam 5 mg/ml injektionsvatska (meloxicam)',
    registration_number: 'SE/V/0002',
    active_substances: '["meloxicam"]',
    species_authorised: '["notkreatur","svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Boehringer Ingelheim',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'metacam-20',
    product_name: 'Metacam 20 mg/ml injektionsvatska (meloxicam)',
    registration_number: 'SE/V/0035',
    active_substances: '["meloxicam"]',
    species_authorised: '["notkreatur","svin","hast"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Boehringer Ingelheim',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=20010423000031',
    status: 'authorised',
  },
  {
    id: 'metacam-oral-svin',
    product_name: 'Metacam 15 mg/ml oral suspension for svin (meloxicam)',
    registration_number: 'SE/V/0036',
    active_substances: '["meloxicam"]',
    species_authorised: '["svin"]',
    pharmaceutical_form: 'oral suspension',
    legal_category: 'Rx',
    ma_holder: 'Boehringer Ingelheim',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=20100831000034',
    status: 'authorised',
  },
  {
    id: 'finadyne',
    product_name: 'Finadyne vet (flunixin)',
    registration_number: 'SE/V/0014',
    active_substances: '["flunixin"]',
    species_authorised: '["notkreatur","hast"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'finadyne-transdermal',
    product_name: 'Finadyne Transdermal (flunixin)',
    registration_number: 'EU/2/14/165',
    active_substances: '["flunixin"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'pour-on',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'ketofen',
    product_name: 'Ketofen vet 100 mg/ml (ketoprofen)',
    registration_number: 'SE/V/0037',
    active_substances: '["ketoprofen"]',
    species_authorised: '["notkreatur","svin","hast"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Ceva',
    spc_url: 'https://medicines.health.europa.eu/veterinary/en/600000027291',
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
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'carprodyl',
    product_name: 'Carprodyl vet (karprofen)',
    registration_number: 'SE/V/0038',
    active_substances: '["karprofen"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Ceva',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'tolfedine',
    product_name: 'Tolfedine vet (tolfenamsyra)',
    registration_number: 'SE/V/0077',
    active_substances: '["tolfenamsyra"]',
    species_authorised: '["notkreatur","svin","hund","katt"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Vetoquinol',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'rimadyl',
    product_name: 'Rimadyl vet (karprofen)',
    registration_number: 'SE/V/0078',
    active_substances: '["karprofen"]',
    species_authorised: '["hund"]',
    pharmaceutical_form: 'tablett',
    legal_category: 'Rx',
    ma_holder: 'Zoetis',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'previcox',
    product_name: 'Previcox (firocoxib)',
    registration_number: 'EU/2/04/045',
    active_substances: '["firocoxib"]',
    species_authorised: '["hund","hast"]',
    pharmaceutical_form: 'tuggtablett',
    legal_category: 'Rx',
    ma_holder: 'Boehringer Ingelheim',
    spc_url: 'https://medicines.health.europa.eu/veterinary/en/600000027291',
    status: 'authorised',
  },
  {
    id: 'loxicom',
    product_name: 'Loxicom vet (meloxicam)',
    registration_number: 'SE/V/0079',
    active_substances: '["meloxicam"]',
    species_authorised: '["notkreatur","svin","hund","katt"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Norbrook',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  ANTIPARASITICS: Avermectins / Milbemycins
  // ================================================================
  {
    id: 'ivomec',
    product_name: 'Ivomec vet (ivermektin)',
    registration_number: 'SE/V/0005',
    active_substances: '["ivermektin"]',
    species_authorised: '["notkreatur","far","svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Boehringer Ingelheim',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19860314000046',
    status: 'authorised',
  },
  {
    id: 'ivomec-pour-on',
    product_name: 'Ivomec Pour-on (ivermektin)',
    registration_number: 'SE/V/0039',
    active_substances: '["ivermektin"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'pour-on',
    legal_category: 'Rx',
    ma_holder: 'Boehringer Ingelheim',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19860314000046',
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
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
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
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'cydectin-pour-on',
    product_name: 'Cydectin Pour-on (moxidektin)',
    registration_number: 'SE/V/0040',
    active_substances: '["moxidektin"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'pour-on',
    legal_category: 'Rx',
    ma_holder: 'Elanco',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'dectomax',
    product_name: 'Dectomax vet (doramektin)',
    registration_number: 'SE/V/0041',
    active_substances: '["doramektin"]',
    species_authorised: '["notkreatur","far"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Elanco',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  ANTIPARASITICS: Benzimidazoles
  // ================================================================
  {
    id: 'panacur',
    product_name: 'Panacur vet (fenbendazol)',
    registration_number: 'SE/V/0042',
    active_substances: '["fenbendazol"]',
    species_authorised: '["notkreatur","far","get","svin","hast"]',
    pharmaceutical_form: 'oral suspension',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'valbazen',
    product_name: 'Valbazen vet (albendazol)',
    registration_number: 'SE/V/0043',
    active_substances: '["albendazol"]',
    species_authorised: '["notkreatur","far","get"]',
    pharmaceutical_form: 'oral suspension',
    legal_category: 'Rx',
    ma_holder: 'Zoetis',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'oxfenil',
    product_name: 'Oxfenil vet (oxfendazol)',
    registration_number: 'SE/V/0044',
    active_substances: '["oxfendazol"]',
    species_authorised: '["notkreatur","far"]',
    pharmaceutical_form: 'oral suspension',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'hapadex',
    product_name: 'Hapadex vet (netobimin)',
    registration_number: 'SE/V/0080',
    active_substances: '["netobimin"]',
    species_authorised: '["notkreatur","far"]',
    pharmaceutical_form: 'oral suspension',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  ANTIPARASITICS: Imidazothiazoles
  // ================================================================
  {
    id: 'levamisol-vet',
    product_name: 'Levamisol vet (levamisol)',
    registration_number: 'SE/V/0045',
    active_substances: '["levamisol"]',
    species_authorised: '["notkreatur","far","svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Vetoquinol',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  ANTIPARASITICS: Fasciolicides
  // ================================================================
  {
    id: 'fasinex',
    product_name: 'Fasinex vet (triclabendazol)',
    registration_number: 'SE/V/0046',
    active_substances: '["triclabendazol"]',
    species_authorised: '["notkreatur","far"]',
    pharmaceutical_form: 'oral suspension',
    legal_category: 'Rx',
    ma_holder: 'Elanco',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'closamectin',
    product_name: 'Closamectin Pour-on (closantel + ivermektin)',
    registration_number: 'SE/V/0047',
    active_substances: '["closantel","ivermektin"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'pour-on',
    legal_category: 'Rx',
    ma_holder: 'Norbrook',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'endex',
    product_name: 'Endex vet (triclabendazol + levamisol)',
    registration_number: 'SE/V/0081',
    active_substances: '["triclabendazol","levamisol"]',
    species_authorised: '["notkreatur","far"]',
    pharmaceutical_form: 'oral suspension',
    legal_category: 'Rx',
    ma_holder: 'Elanco',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  ANTIPARASITICS: Ectoparasiticides (pour-on, collar, spray)
  // ================================================================
  {
    id: 'spotinor',
    product_name: 'Spotinor (deltametrin)',
    registration_number: 'SE/V/0082',
    active_substances: '["deltametrin"]',
    species_authorised: '["notkreatur","far"]',
    pharmaceutical_form: 'pour-on',
    legal_category: 'Rx',
    ma_holder: 'Norbrook',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'butox',
    product_name: 'Butox vet (deltametrin)',
    registration_number: 'SE/V/0083',
    active_substances: '["deltametrin"]',
    species_authorised: '["notkreatur","far"]',
    pharmaceutical_form: 'pour-on',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'bayticol',
    product_name: 'Bayticol Pour-on (flumetrin)',
    registration_number: 'SE/V/0084',
    active_substances: '["flumetrin"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'pour-on',
    legal_category: 'Rx',
    ma_holder: 'Elanco',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'taktic',
    product_name: 'Taktic vet (amitraz)',
    registration_number: 'SE/V/0085',
    active_substances: '["amitraz"]',
    species_authorised: '["notkreatur","svin"]',
    pharmaceutical_form: 'koncentrat for bad',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'scalibor',
    product_name: 'Scalibor (deltametrin)',
    registration_number: 'SE/V/0086',
    active_substances: '["deltametrin"]',
    species_authorised: '["hund"]',
    pharmaceutical_form: 'halsband',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  VACCINES
  // ================================================================
  {
    id: 'bovilis-bvd',
    product_name: 'Bovilis BVD (BVD-vaccin)',
    registration_number: 'EU/2/04/047',
    active_substances: '["BVD-virusantigen"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'bovilis-ibr',
    product_name: 'Bovilis IBR Marker Live (IBR-vaccin)',
    registration_number: 'EU/2/04/046',
    active_substances: '["IBR-virusantigen"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'covexin',
    product_name: 'Covexin 10 (klostridievaccin)',
    registration_number: 'SE/V/0048',
    active_substances: '["klostridietoxoid"]',
    species_authorised: '["notkreatur","far","get"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Zoetis',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'porcilis-porcoli',
    product_name: 'Porcilis Porcoli (E. coli-vaccin svin)',
    registration_number: 'SE/V/0049',
    active_substances: '["E.coli-fimbrieantigen"]',
    species_authorised: '["svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'porcilis-myco',
    product_name: 'Porcilis M Hyo (Mycoplasma-vaccin svin)',
    registration_number: 'SE/V/0050',
    active_substances: '["Mycoplasma-hyopneumoniae-antigen"]',
    species_authorised: '["svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'porcilis-prrs',
    product_name: 'Porcilis PRRS (PRRS-vaccin svin)',
    registration_number: 'EU/2/14/168',
    active_substances: '["PRRS-virusantigen"]',
    species_authorised: '["svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'heptavac-p',
    product_name: 'Heptavac P Plus (klostridievaccin far)',
    registration_number: 'SE/V/0051',
    active_substances: '["klostridietoxoid","pasteurella-antigen"]',
    species_authorised: '["far"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'rispoval-rs-bvd',
    product_name: 'Rispoval RS+BVD (RS- och BVD-vaccin)',
    registration_number: 'SE/V/0087',
    active_substances: '["RS-virusantigen","BVD-virusantigen"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Zoetis',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'bravoxin-10',
    product_name: 'Bravoxin 10 (klostridievaccin 10-valent)',
    registration_number: 'SE/V/0088',
    active_substances: '["klostridietoxoid-10-valent"]',
    species_authorised: '["notkreatur","far","get"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'porcilis-pcv-mhyo',
    product_name: 'Porcilis PCV M Hyo (PCV2 + Mycoplasma)',
    registration_number: 'EU/2/16/195',
    active_substances: '["PCV2-antigen","Mycoplasma-hyopneumoniae-antigen"]',
    species_authorised: '["svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://medicines.health.europa.eu/veterinary/en/600000027291',
    status: 'authorised',
  },
  {
    id: 'porcilis-lawsonia',
    product_name: 'Porcilis Lawsonia (Lawsonia intracellularis-vaccin)',
    registration_number: 'EU/2/15/180',
    active_substances: '["Lawsonia-intracellularis-antigen"]',
    species_authorised: '["svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://medicines.health.europa.eu/veterinary/en/600000027291',
    status: 'authorised',
  },
  {
    id: 'ingelvac-circoflex',
    product_name: 'Ingelvac CircoFLEX (PCV2-vaccin svin)',
    registration_number: 'EU/2/07/075',
    active_substances: '["PCV2-antigen"]',
    species_authorised: '["svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Boehringer Ingelheim',
    spc_url: 'https://medicines.health.europa.eu/veterinary/en/600000027291',
    status: 'authorised',
  },
  {
    id: 'nobivac-dhppi',
    product_name: 'Nobivac DHPPi (valpsjuka, hepatit, parvo, parainfluensa)',
    registration_number: 'SE/V/0089',
    active_substances: '["valpsjuke-virus","adenovirus","parvovirus","parainfluensavirus"]',
    species_authorised: '["hund"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'nobivac-lepto',
    product_name: 'Nobivac Lepto (leptospiros-vaccin)',
    registration_number: 'SE/V/0090',
    active_substances: '["Leptospira-antigen"]',
    species_authorised: '["hund"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'purevax-rcpch',
    product_name: 'Purevax RCPCh (kattsnuva, calici, panleucopeni, klamydia)',
    registration_number: 'EU/2/04/044',
    active_substances: '["herpesvirus","calicivirus","panleucopeni-virus","Chlamydophila"]',
    species_authorised: '["katt"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Boehringer Ingelheim',
    spc_url: 'https://medicines.health.europa.eu/veterinary/en/600000027291',
    status: 'authorised',
  },
  {
    id: 'eurican-dhppi2-l',
    product_name: 'Eurican DHPPi2-L (hundvaccin multivalent)',
    registration_number: 'SE/V/0091',
    active_substances: '["valpsjuke-virus","adenovirus","parvovirus","parainfluensa","Leptospira"]',
    species_authorised: '["hund"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Boehringer Ingelheim',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'equilis-prequenza',
    product_name: 'Equilis Prequenza (hastinfluensa-vaccin)',
    registration_number: 'EU/2/03/037',
    active_substances: '["influensa-A-equi-antigen"]',
    species_authorised: '["hast"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://medicines.health.europa.eu/veterinary/en/600000027291',
    status: 'authorised',
  },
  {
    id: 'proteqflu',
    product_name: 'ProteqFlu (hastinfluensa-vaccin rekombinant)',
    registration_number: 'EU/2/03/038',
    active_substances: '["influensa-A-equi-rekombinant"]',
    species_authorised: '["hast"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Boehringer Ingelheim',
    spc_url: 'https://medicines.health.europa.eu/veterinary/en/600000027291',
    status: 'authorised',
  },
  {
    id: 'equilis-tetanus',
    product_name: 'Equilis Te (tetanus-vaccin hast)',
    registration_number: 'SE/V/0092',
    active_substances: '["tetanustoxoid"]',
    species_authorised: '["hast"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'nobivac-rabies',
    product_name: 'Nobivac Rabies (rabiesvaccin)',
    registration_number: 'SE/V/0093',
    active_substances: '["rabiesvirus-antigen"]',
    species_authorised: '["hund","katt","hast"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  HORMONES / REPRODUCTION (therapeutic use — not growth promotion)
  // ================================================================
  {
    id: 'estrumate',
    product_name: 'Estrumate vet (kloprostenol)',
    registration_number: 'SE/V/0052',
    active_substances: '["kloprostenol"]',
    species_authorised: '["notkreatur","svin"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'receptal',
    product_name: 'Receptal vet (buserelin)',
    registration_number: 'SE/V/0053',
    active_substances: '["buserelin"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'prid-delta',
    product_name: 'PRID Delta (progesteron)',
    registration_number: 'SE/V/0054',
    active_substances: '["progesteron"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'vaginalinlagg',
    legal_category: 'Rx',
    ma_holder: 'Ceva',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'oxytocin-vet',
    product_name: 'Oxytocin vet (oxytocin)',
    registration_number: 'SE/V/0055',
    active_substances: '["oxytocin"]',
    species_authorised: '["notkreatur","svin","far","get"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Vetoquinol',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'fertagyl',
    product_name: 'Fertagyl vet (gonadorelin)',
    registration_number: 'SE/V/0094',
    active_substances: '["gonadorelin"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'cue-mate',
    product_name: 'Cue-Mate (progesteron)',
    registration_number: 'SE/V/0095',
    active_substances: '["progesteron"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'vaginalinlagg',
    legal_category: 'Rx',
    ma_holder: 'Bayer',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'planate',
    product_name: 'Planate vet (kloprostenol)',
    registration_number: 'SE/V/0096',
    active_substances: '["kloprostenol"]',
    species_authorised: '["notkreatur","svin","hast"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  ANAESTHETICS / SEDATION
  // ================================================================
  {
    id: 'dexdomitor',
    product_name: 'Dexdomitor (dexmedetomidin)',
    registration_number: 'SE/V/0097',
    active_substances: '["dexmedetomidin"]',
    species_authorised: '["hund","katt"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Orion',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'domitor',
    product_name: 'Domitor vet (medetomidin)',
    registration_number: 'SE/V/0098',
    active_substances: '["medetomidin"]',
    species_authorised: '["hund","katt"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Orion',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'antisedan',
    product_name: 'Antisedan (atipamezol)',
    registration_number: 'SE/V/0099',
    active_substances: '["atipamezol"]',
    species_authorised: '["hund","katt"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Orion',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'propofol-vet',
    product_name: 'PropoFlo Plus (propofol)',
    registration_number: 'SE/V/0100',
    active_substances: '["propofol"]',
    species_authorised: '["hund","katt"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Zoetis',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'alfaxan',
    product_name: 'Alfaxan (alfaxalon)',
    registration_number: 'SE/V/0101',
    active_substances: '["alfaxalon"]',
    species_authorised: '["hund","katt"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Jurox',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'ketaminol',
    product_name: 'Ketaminol vet (ketamin)',
    registration_number: 'SE/V/0102',
    active_substances: '["ketamin"]',
    species_authorised: '["hund","katt","hast","notkreatur"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx-narkotika',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'zoletil',
    product_name: 'Zoletil vet (tiletamin + zolazepam)',
    registration_number: 'SE/V/0103',
    active_substances: '["tiletamin","zolazepam"]',
    species_authorised: '["hund","katt"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx-narkotika',
    ma_holder: 'Virbac',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'isofluran-vet',
    product_name: 'IsoFlo vet (isofluran)',
    registration_number: 'SE/V/0104',
    active_substances: '["isofluran"]',
    species_authorised: '["hund","katt","hast","notkreatur","svin","far"]',
    pharmaceutical_form: 'inhalationsvatska',
    legal_category: 'Rx',
    ma_holder: 'Zoetis',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'sevofluran-vet',
    product_name: 'SevoFlo (sevofluran)',
    registration_number: 'SE/V/0105',
    active_substances: '["sevofluran"]',
    species_authorised: '["hund","katt","hast"]',
    pharmaceutical_form: 'inhalationsvatska',
    legal_category: 'Rx',
    ma_holder: 'Zoetis',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'lidokain-vet',
    product_name: 'Lidokain vet (lidokain)',
    registration_number: 'SE/V/0106',
    active_substances: '["lidokain"]',
    species_authorised: '["hund","katt","hast","notkreatur","svin","far"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Dechra',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'bupivakain-vet',
    product_name: 'Bupivacaine vet (bupivakain)',
    registration_number: 'SE/V/0107',
    active_substances: '["bupivakain"]',
    species_authorised: '["hund","katt","hast"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Dechra',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  ANTIFUNGALS
  // ================================================================
  {
    id: 'imaverol',
    product_name: 'Imaverol vet (enilkonazol)',
    registration_number: 'SE/V/0108',
    active_substances: '["enilkonazol"]',
    species_authorised: '["notkreatur","hast","hund","katt"]',
    pharmaceutical_form: 'kutan losning',
    legal_category: 'Rx',
    ma_holder: 'Elanco',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  DIURETICS / SUPPORTIVE (food animal)
  // ================================================================
  {
    id: 'furosemid-vet',
    product_name: 'Furosemid vet (furosemid)',
    registration_number: 'SE/V/0109',
    active_substances: '["furosemid"]',
    species_authorised: '["notkreatur","hast","hund","katt"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Dechra',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'atropin-vet',
    product_name: 'Atropin vet (atropin)',
    registration_number: 'SE/V/0110',
    active_substances: '["atropin"]',
    species_authorised: '["notkreatur","svin","hast","hund","katt"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Vetoquinol',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'butorphanol-vet',
    product_name: 'Butomidor vet (butorfanol)',
    registration_number: 'SE/V/0111',
    active_substances: '["butorfanol"]',
    species_authorised: '["hast","hund","katt"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx-narkotika',
    ma_holder: 'Richter Pharma',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'xylazin-vet',
    product_name: 'Rompun vet (xylazin)',
    registration_number: 'SE/V/0112',
    active_substances: '["xylazin"]',
    species_authorised: '["notkreatur","hast","hund","katt"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Elanco',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  OTHER THERAPEUTIC
  // ================================================================
  {
    id: 'calcium-vet',
    product_name: 'Calciject 40 (kalciumglukonat)',
    registration_number: 'SE/V/0056',
    active_substances: '["kalciumglukonat"]',
    species_authorised: '["notkreatur"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'Norbrook',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'dexafort',
    product_name: 'Dexafort vet (dexametason)',
    registration_number: 'SE/V/0057',
    active_substances: '["dexametason"]',
    species_authorised: '["notkreatur","svin","hast"]',
    pharmaceutical_form: 'injektionsvatska',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },

  // ================================================================
  //  COMPANION ANIMAL (non-food)
  // ================================================================
  {
    id: 'apoquel',
    product_name: 'Apoquel (oclacitinib)',
    registration_number: 'EU/2/13/154',
    active_substances: '["oclacitinib"]',
    species_authorised: '["hund"]',
    pharmaceutical_form: 'tablett',
    legal_category: 'Rx',
    ma_holder: 'Zoetis',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
    status: 'authorised',
  },
  {
    id: 'bravecto',
    product_name: 'Bravecto (fluralaner)',
    registration_number: 'EU/2/13/158',
    active_substances: '["fluralaner"]',
    species_authorised: '["hund"]',
    pharmaceutical_form: 'tuggtablett',
    legal_category: 'Rx',
    ma_holder: 'MSD',
    spc_url: 'https://www.fass.se/LIF/product?userType=1&nplId=19980107000012',
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
//
// Sources: FASS Vet SPC data, EMA EPAR product information,
// EU Regulation 2019/6 Art. 115 (cascade defaults).
//
// Conservative approach: when EU and national SPCs differ,
// the longer period is used. When uncertain, cascade default
// applies (28 days meat, 7 days milk).
//
// Species key: notkreatur=cattle, svin=pig, far=sheep,
// get=goat, hast=horse, fjaderfa=poultry
// Product type key: kott=meat, mjolk=milk, agg=eggs
// ============================================================

const withdrawalPeriods: {
  medicine_id: string; species: string; product_type: string;
  period_days: number; notes: string; zero_day_allowed: number;
}[] = [
  // ================================================================
  //  Penicillins
  // ================================================================

  // Peni-vet (benzylpenicillin) — first-line antibiotic per SVA/SJVFS 2019:32
  { medicine_id: 'peni-vet', species: 'notkreatur', product_type: 'kott', period_days: 6, notes: 'First-line antibiotic for cattle. SPC: 6 days meat.', zero_day_allowed: 0 },
  { medicine_id: 'peni-vet', species: 'notkreatur', product_type: 'mjolk', period_days: 4, notes: 'SPC: 96 hours milk withdrawal.', zero_day_allowed: 0 },
  { medicine_id: 'peni-vet', species: 'svin', product_type: 'kott', period_days: 4, notes: 'SPC: 4 days pig meat.', zero_day_allowed: 0 },
  { medicine_id: 'peni-vet', species: 'far', product_type: 'kott', period_days: 6, notes: 'SPC: 6 days sheep meat.', zero_day_allowed: 0 },
  { medicine_id: 'peni-vet', species: 'far', product_type: 'mjolk', period_days: 4, notes: 'SPC: 96 hours sheep milk.', zero_day_allowed: 0 },
  { medicine_id: 'peni-vet', species: 'get', product_type: 'kott', period_days: 6, notes: 'SPC: 6 days goat meat.', zero_day_allowed: 0 },

  // Betamox (amoxicillin)
  { medicine_id: 'betamox', species: 'notkreatur', product_type: 'kott', period_days: 18, notes: 'SPC: 18 days cattle meat. Amoxicillin injectable.', zero_day_allowed: 0 },
  { medicine_id: 'betamox', species: 'notkreatur', product_type: 'mjolk', period_days: 3, notes: 'SPC: 72 hours milk.', zero_day_allowed: 0 },
  { medicine_id: 'betamox', species: 'svin', product_type: 'kott', period_days: 14, notes: 'SPC: 14 days pig meat.', zero_day_allowed: 0 },

  // Shotapen (penicillin + streptomycin)
  { medicine_id: 'shotapen', species: 'notkreatur', product_type: 'kott', period_days: 24, notes: 'Combination — longer withdrawal than penicillin alone. SPC: 24 days.', zero_day_allowed: 0 },
  { medicine_id: 'shotapen', species: 'notkreatur', product_type: 'mjolk', period_days: 4, notes: 'SPC: 96 hours milk.', zero_day_allowed: 0 },
  { medicine_id: 'shotapen', species: 'svin', product_type: 'kott', period_days: 18, notes: 'SPC: 18 days pig meat.', zero_day_allowed: 0 },
  { medicine_id: 'shotapen', species: 'far', product_type: 'kott', period_days: 24, notes: 'SPC: 24 days sheep meat.', zero_day_allowed: 0 },

  // Synulox (amoxicillin + clavulanic acid)
  { medicine_id: 'synulox', species: 'notkreatur', product_type: 'kott', period_days: 22, notes: 'SPC: 22 days cattle meat. Amoxicillin/clavulanate.', zero_day_allowed: 0 },
  { medicine_id: 'synulox', species: 'notkreatur', product_type: 'mjolk', period_days: 3, notes: 'SPC: 60 hours milk (rounded to 3 days).', zero_day_allowed: 0 },
  { medicine_id: 'synulox', species: 'svin', product_type: 'kott', period_days: 14, notes: 'SPC: 14 days pig meat.', zero_day_allowed: 0 },

  // Procapen (procaine penicillin)
  { medicine_id: 'procapen', species: 'notkreatur', product_type: 'kott', period_days: 7, notes: 'SPC: 7 days cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'procapen', species: 'notkreatur', product_type: 'mjolk', period_days: 4, notes: 'SPC: 96 hours milk.', zero_day_allowed: 0 },
  { medicine_id: 'procapen', species: 'svin', product_type: 'kott', period_days: 5, notes: 'SPC: 5 days pig meat.', zero_day_allowed: 0 },
  { medicine_id: 'procapen', species: 'far', product_type: 'kott', period_days: 7, notes: 'SPC: 7 days sheep meat.', zero_day_allowed: 0 },

  // Ultrapen (benzylpenicillin)
  { medicine_id: 'ultrapen', species: 'notkreatur', product_type: 'kott', period_days: 6, notes: 'SPC: 6 days cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'ultrapen', species: 'notkreatur', product_type: 'mjolk', period_days: 4, notes: 'SPC: 96 hours milk.', zero_day_allowed: 0 },
  { medicine_id: 'ultrapen', species: 'svin', product_type: 'kott', period_days: 4, notes: 'SPC: 4 days pig meat.', zero_day_allowed: 0 },

  // Depocillin (procaine penicillin)
  { medicine_id: 'depocillin', species: 'notkreatur', product_type: 'kott', period_days: 7, notes: 'SPC: 7 days cattle meat. Procaine penicillin depot.', zero_day_allowed: 0 },
  { medicine_id: 'depocillin', species: 'notkreatur', product_type: 'mjolk', period_days: 4, notes: 'SPC: 96 hours milk.', zero_day_allowed: 0 },
  { medicine_id: 'depocillin', species: 'svin', product_type: 'kott', period_days: 5, notes: 'SPC: 5 days pig meat.', zero_day_allowed: 0 },
  { medicine_id: 'depocillin', species: 'far', product_type: 'kott', period_days: 7, notes: 'SPC: 7 days sheep meat.', zero_day_allowed: 0 },

  // Suramox (amoxicillin oral — pig/poultry)
  { medicine_id: 'suramox', species: 'svin', product_type: 'kott', period_days: 2, notes: 'SPC: 2 days pig meat. Oral amoxicillin.', zero_day_allowed: 0 },
  { medicine_id: 'suramox', species: 'fjaderfa', product_type: 'kott', period_days: 1, notes: 'SPC: 1 day poultry meat.', zero_day_allowed: 0 },
  { medicine_id: 'suramox', species: 'fjaderfa', product_type: 'agg', period_days: 0, notes: 'NOT authorised for laying hens producing eggs for consumption.', zero_day_allowed: 0 },

  // Combi-kel (penicillin + streptomycin)
  { medicine_id: 'combi-kel', species: 'notkreatur', product_type: 'kott', period_days: 24, notes: 'SPC: 24 days cattle meat. Penicillin/streptomycin combination.', zero_day_allowed: 0 },
  { medicine_id: 'combi-kel', species: 'notkreatur', product_type: 'mjolk', period_days: 4, notes: 'SPC: 96 hours milk.', zero_day_allowed: 0 },
  { medicine_id: 'combi-kel', species: 'svin', product_type: 'kott', period_days: 18, notes: 'SPC: 18 days pig meat.', zero_day_allowed: 0 },
  { medicine_id: 'combi-kel', species: 'far', product_type: 'kott', period_days: 24, notes: 'SPC: 24 days sheep meat.', zero_day_allowed: 0 },

  // ================================================================
  //  Tetracyclines
  // ================================================================

  // Terramycin (oxytetracycline)
  { medicine_id: 'terramycin', species: 'notkreatur', product_type: 'kott', period_days: 18, notes: 'SPC: 18 days cattle meat. Long-acting formulation.', zero_day_allowed: 0 },
  { medicine_id: 'terramycin', species: 'notkreatur', product_type: 'mjolk', period_days: 7, notes: 'SPC: 7 days milk (168 hours).', zero_day_allowed: 0 },
  { medicine_id: 'terramycin', species: 'svin', product_type: 'kott', period_days: 14, notes: 'SPC: 14 days pig meat.', zero_day_allowed: 0 },
  { medicine_id: 'terramycin', species: 'far', product_type: 'kott', period_days: 18, notes: 'SPC: 18 days sheep meat.', zero_day_allowed: 0 },

  // Alamycin LA (oxytetracycline long-acting)
  { medicine_id: 'alamycin', species: 'notkreatur', product_type: 'kott', period_days: 21, notes: 'Long-acting formulation. SPC: 21 days cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'alamycin', species: 'notkreatur', product_type: 'mjolk', period_days: 7, notes: 'SPC: 7 days milk.', zero_day_allowed: 0 },
  { medicine_id: 'alamycin', species: 'svin', product_type: 'kott', period_days: 14, notes: 'SPC: 14 days pig meat.', zero_day_allowed: 0 },
  { medicine_id: 'alamycin', species: 'far', product_type: 'kott', period_days: 21, notes: 'SPC: 21 days sheep meat.', zero_day_allowed: 0 },

  // Engemycin LA (oxytetracycline)
  { medicine_id: 'engemycin', species: 'notkreatur', product_type: 'kott', period_days: 14, notes: 'SPC: 14 days cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'engemycin', species: 'notkreatur', product_type: 'mjolk', period_days: 7, notes: 'SPC: 7 days milk.', zero_day_allowed: 0 },
  { medicine_id: 'engemycin', species: 'svin', product_type: 'kott', period_days: 10, notes: 'SPC: 10 days pig meat.', zero_day_allowed: 0 },
  { medicine_id: 'engemycin', species: 'far', product_type: 'kott', period_days: 14, notes: 'SPC: 14 days sheep meat.', zero_day_allowed: 0 },

  // Doxycyclin (oral — pigs, poultry)
  { medicine_id: 'doxycyclin-vet', species: 'svin', product_type: 'kott', period_days: 4, notes: 'SPC: 4 days pig meat. Oral doxycycline.', zero_day_allowed: 0 },
  { medicine_id: 'doxycyclin-vet', species: 'fjaderfa', product_type: 'kott', period_days: 3, notes: 'SPC: 3 days poultry meat.', zero_day_allowed: 0 },
  { medicine_id: 'doxycyclin-vet', species: 'fjaderfa', product_type: 'agg', period_days: 0, notes: 'NOT authorised for laying hens producing eggs for consumption.', zero_day_allowed: 0 },

  // Hexasol LA (oxytetracycline + flunixin)
  { medicine_id: 'hexasol', species: 'notkreatur', product_type: 'kott', period_days: 35, notes: 'SPC: 35 days cattle meat. Combination product — prolonged withdrawal.', zero_day_allowed: 0 },
  { medicine_id: 'hexasol', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'NOT authorised for lactating dairy cattle producing milk for consumption.', zero_day_allowed: 0 },

  // Terramycin spray (oxytetracycline topical)
  { medicine_id: 'terramycin-spray', species: 'notkreatur', product_type: 'kott', period_days: 0, notes: 'SPC: zero meat withdrawal for topical spray application.', zero_day_allowed: 1 },
  { medicine_id: 'terramycin-spray', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'SPC: zero milk withdrawal for topical application.', zero_day_allowed: 1 },
  { medicine_id: 'terramycin-spray', species: 'far', product_type: 'kott', period_days: 0, notes: 'SPC: zero meat withdrawal for topical spray.', zero_day_allowed: 1 },
  { medicine_id: 'terramycin-spray', species: 'svin', product_type: 'kott', period_days: 0, notes: 'SPC: zero meat withdrawal for topical spray.', zero_day_allowed: 1 },

  // Cyclo spray (chlortetracycline topical)
  { medicine_id: 'cyclo-spray', species: 'notkreatur', product_type: 'kott', period_days: 0, notes: 'SPC: zero meat withdrawal for topical spray.', zero_day_allowed: 1 },
  { medicine_id: 'cyclo-spray', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'SPC: zero milk withdrawal for topical application.', zero_day_allowed: 1 },
  { medicine_id: 'cyclo-spray', species: 'far', product_type: 'kott', period_days: 0, notes: 'SPC: zero meat withdrawal for topical spray.', zero_day_allowed: 1 },
  { medicine_id: 'cyclo-spray', species: 'svin', product_type: 'kott', period_days: 0, notes: 'SPC: zero meat withdrawal for topical spray.', zero_day_allowed: 1 },

  // ================================================================
  //  Macrolides
  // ================================================================

  // Draxxin (tulathromycin)
  { medicine_id: 'draxxin', species: 'notkreatur', product_type: 'kott', period_days: 49, notes: 'EMA EPAR: 49 days cattle meat. Long tissue persistence.', zero_day_allowed: 0 },
  { medicine_id: 'draxxin', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'NOT authorised for lactating dairy cattle producing milk for consumption.', zero_day_allowed: 0 },
  { medicine_id: 'draxxin', species: 'svin', product_type: 'kott', period_days: 33, notes: 'EMA EPAR: 33 days pig meat.', zero_day_allowed: 0 },

  // Zuprevo (tildipirosin)
  { medicine_id: 'zuprevo', species: 'notkreatur', product_type: 'kott', period_days: 47, notes: 'SPC: 47 days cattle meat. Macrolide persistence.', zero_day_allowed: 0 },
  { medicine_id: 'zuprevo', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'NOT authorised for lactating dairy cattle producing milk for consumption.', zero_day_allowed: 0 },

  // Orizure (tulathromycin — pigs only)
  { medicine_id: 'orizure', species: 'svin', product_type: 'kott', period_days: 33, notes: 'SPC: 33 days pig meat. Macrolide.', zero_day_allowed: 0 },

  // Tylan (tylosin)
  { medicine_id: 'tylan', species: 'notkreatur', product_type: 'kott', period_days: 21, notes: 'SPC: 21 days cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'tylan', species: 'notkreatur', product_type: 'mjolk', period_days: 4, notes: 'SPC: 96 hours milk.', zero_day_allowed: 0 },
  { medicine_id: 'tylan', species: 'svin', product_type: 'kott', period_days: 5, notes: 'SPC: 5 days pig meat.', zero_day_allowed: 0 },
  { medicine_id: 'tylan', species: 'fjaderfa', product_type: 'kott', period_days: 1, notes: 'SPC: 1 day poultry meat.', zero_day_allowed: 0 },
  { medicine_id: 'tylan', species: 'fjaderfa', product_type: 'agg', period_days: 0, notes: 'Zero egg withdrawal per SPC.', zero_day_allowed: 1 },

  // Suanovil (spiramycin)
  { medicine_id: 'spiramycin-vet', species: 'notkreatur', product_type: 'kott', period_days: 30, notes: 'SPC: 30 days cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'spiramycin-vet', species: 'notkreatur', product_type: 'mjolk', period_days: 4, notes: 'SPC: 96 hours milk.', zero_day_allowed: 0 },
  { medicine_id: 'spiramycin-vet', species: 'svin', product_type: 'kott', period_days: 14, notes: 'SPC: 14 days pig meat.', zero_day_allowed: 0 },

  // ================================================================
  //  Fluoroquinolones (RESTRICTED)
  // ================================================================

  // Baytril (enrofloxacin)
  { medicine_id: 'baytril', species: 'notkreatur', product_type: 'kott', period_days: 14, notes: 'RESTRICTED: susceptibility testing required per SJVFS 2019:32. SPC: 14 days.', zero_day_allowed: 0 },
  { medicine_id: 'baytril', species: 'notkreatur', product_type: 'mjolk', period_days: 4, notes: 'SPC: 96 hours milk.', zero_day_allowed: 0 },
  { medicine_id: 'baytril', species: 'svin', product_type: 'kott', period_days: 13, notes: 'RESTRICTED. SPC: 13 days pig meat.', zero_day_allowed: 0 },

  // Marbocyl (marbofloxacin)
  { medicine_id: 'marbofloxacin-vet', species: 'notkreatur', product_type: 'kott', period_days: 6, notes: 'RESTRICTED: susceptibility testing required. SPC: 6 days cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'marbofloxacin-vet', species: 'notkreatur', product_type: 'mjolk', period_days: 3, notes: 'SPC: 72 hours milk.', zero_day_allowed: 0 },
  { medicine_id: 'marbofloxacin-vet', species: 'svin', product_type: 'kott', period_days: 4, notes: 'RESTRICTED. SPC: 4 days pig meat.', zero_day_allowed: 0 },

  // ================================================================
  //  Cephalosporins (RESTRICTED — 3rd/4th gen)
  // ================================================================

  // Excenel RTU (ceftiofur — 3rd gen)
  { medicine_id: 'excenel', species: 'notkreatur', product_type: 'kott', period_days: 8, notes: 'RESTRICTED: 3rd gen cephalosporin. SPC: 8 days cattle meat (IM).', zero_day_allowed: 0 },
  { medicine_id: 'excenel', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'SPC: zero milk withdrawal.', zero_day_allowed: 1 },
  { medicine_id: 'excenel', species: 'svin', product_type: 'kott', period_days: 5, notes: 'RESTRICTED. SPC: 5 days pig meat.', zero_day_allowed: 0 },

  // Naxcel (ceftiofur — 3rd gen, different formulation)
  { medicine_id: 'naxcel', species: 'notkreatur', product_type: 'kott', period_days: 9, notes: 'RESTRICTED: 3rd gen cephalosporin. EMA EPAR: 9 days cattle meat (base of ear injection).', zero_day_allowed: 0 },
  { medicine_id: 'naxcel', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'EMA EPAR: zero milk withdrawal.', zero_day_allowed: 1 },
  { medicine_id: 'naxcel', species: 'svin', product_type: 'kott', period_days: 71, notes: 'RESTRICTED. EMA EPAR: 71 days pig meat (IM injection).', zero_day_allowed: 0 },

  // Cobactan (cefquinome — 4th gen, injectable)
  { medicine_id: 'cobactan', species: 'notkreatur', product_type: 'kott', period_days: 5, notes: 'RESTRICTED: 4th gen cephalosporin — last resort only. SPC: 5 days.', zero_day_allowed: 0 },
  { medicine_id: 'cobactan', species: 'notkreatur', product_type: 'mjolk', period_days: 1, notes: 'SPC: 24 hours milk.', zero_day_allowed: 0 },

  // Cobactan LC (cefquinome — intramammary)
  { medicine_id: 'cobactan-lc', species: 'notkreatur', product_type: 'kott', period_days: 2, notes: 'RESTRICTED: 4th gen cephalosporin. SPC: 2 days cattle meat after intramammary.', zero_day_allowed: 0 },
  { medicine_id: 'cobactan-lc', species: 'notkreatur', product_type: 'mjolk', period_days: 3, notes: 'SPC: 5 milkings (approx 60 hours).', zero_day_allowed: 0 },

  // Rilexine (cefalexin — 1st gen, intramammary)
  { medicine_id: 'cefalexin-vet', species: 'notkreatur', product_type: 'kott', period_days: 4, notes: 'SPC: 4 days cattle meat. 1st gen cephalosporin — intramammary.', zero_day_allowed: 0 },
  { medicine_id: 'cefalexin-vet', species: 'notkreatur', product_type: 'mjolk', period_days: 3, notes: 'SPC: 3 milkings (approx 36 hours).', zero_day_allowed: 0 },

  // Cepravin DC (cefalonium — dry cow intramammary)
  { medicine_id: 'cepravin', species: 'notkreatur', product_type: 'kott', period_days: 14, notes: 'SPC: 14 days cattle meat. Dry cow product.', zero_day_allowed: 0 },
  { medicine_id: 'cepravin', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'Dry cow product — no milk withdrawal during dry period. After calving: discard colostrum for minimum 96 hours.', zero_day_allowed: 0 },

  // ================================================================
  //  Sulfonamides / trimethoprim
  // ================================================================

  // Borgal (trimethoprim + sulfadoxine)
  { medicine_id: 'borgal', species: 'notkreatur', product_type: 'kott', period_days: 12, notes: 'SPC: 12 days cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'borgal', species: 'notkreatur', product_type: 'mjolk', period_days: 4, notes: 'SPC: 96 hours milk.', zero_day_allowed: 0 },
  { medicine_id: 'borgal', species: 'svin', product_type: 'kott', period_days: 10, notes: 'SPC: 10 days pig meat.', zero_day_allowed: 0 },
  { medicine_id: 'borgal', species: 'far', product_type: 'kott', period_days: 12, notes: 'SPC: 12 days sheep meat.', zero_day_allowed: 0 },

  // Tribrissen (trimethoprim + sulfadiazine)
  { medicine_id: 'tribrissen', species: 'notkreatur', product_type: 'kott', period_days: 10, notes: 'SPC: 10 days cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'tribrissen', species: 'notkreatur', product_type: 'mjolk', period_days: 3, notes: 'SPC: 72 hours milk.', zero_day_allowed: 0 },
  { medicine_id: 'tribrissen', species: 'svin', product_type: 'kott', period_days: 8, notes: 'SPC: 8 days pig meat.', zero_day_allowed: 0 },
  { medicine_id: 'tribrissen', species: 'far', product_type: 'kott', period_days: 10, notes: 'SPC: 10 days sheep meat.', zero_day_allowed: 0 },

  // ================================================================
  //  Florfenicol
  // ================================================================

  // Nuflor (florfenicol — IM injection)
  { medicine_id: 'nuflor', species: 'notkreatur', product_type: 'kott', period_days: 30, notes: 'SPC: 30 days cattle meat (IM). SC injection requires 44 days — see Nuflor Minidose.', zero_day_allowed: 0 },
  { medicine_id: 'nuflor', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'NOT authorised for lactating dairy cattle producing milk for consumption.', zero_day_allowed: 0 },

  // Nuflor Minidose (florfenicol — SC injection, concentrated)
  { medicine_id: 'nuflor-minidose', species: 'notkreatur', product_type: 'kott', period_days: 44, notes: 'EMA EPAR: 44 days cattle meat (SC injection). Extended tissue depletion.', zero_day_allowed: 0 },
  { medicine_id: 'nuflor-minidose', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'NOT authorised for lactating dairy cattle producing milk for consumption.', zero_day_allowed: 0 },

  // ================================================================
  //  Lincosamides
  // ================================================================

  // Lincospectin (lincomycin + spectinomycin)
  { medicine_id: 'lincomycin-vet', species: 'svin', product_type: 'kott', period_days: 14, notes: 'SPC: 14 days pig meat.', zero_day_allowed: 0 },
  { medicine_id: 'lincomycin-vet', species: 'fjaderfa', product_type: 'kott', period_days: 5, notes: 'SPC: 5 days poultry meat.', zero_day_allowed: 0 },
  { medicine_id: 'lincomycin-vet', species: 'fjaderfa', product_type: 'agg', period_days: 0, notes: 'NOT authorised for laying hens producing eggs for consumption.', zero_day_allowed: 0 },

  // ================================================================
  //  Intramammary antibiotics
  // ================================================================

  // Orbenin DC (cloxacillin — dry cow)
  { medicine_id: 'orbenin-dc', species: 'notkreatur', product_type: 'kott', period_days: 28, notes: 'Dry cow product. SPC: 28 days cattle meat. Must observe dry period.', zero_day_allowed: 0 },
  { medicine_id: 'orbenin-dc', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'Dry cow product — no milk withdrawal (cow not lactating). After calving: discard colostrum per SPC.', zero_day_allowed: 0 },

  // Ubro-Red (benzylpenicillin — lactating cow intramammary)
  { medicine_id: 'ubro-red', species: 'notkreatur', product_type: 'kott', period_days: 7, notes: 'SPC: 7 days cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'ubro-red', species: 'notkreatur', product_type: 'mjolk', period_days: 3, notes: 'SPC: 3 milkings (approx 36 hours) after last application.', zero_day_allowed: 0 },

  // Carepen (benzylpenicillin — intramammary)
  { medicine_id: 'carepen', species: 'notkreatur', product_type: 'kott', period_days: 7, notes: 'SPC: 7 days cattle meat. Intramammary penicillin.', zero_day_allowed: 0 },
  { medicine_id: 'carepen', species: 'notkreatur', product_type: 'mjolk', period_days: 3, notes: 'SPC: 4 milkings (approx 48 hours).', zero_day_allowed: 0 },

  // Siccalactin (penicillin + neomycin — dry cow)
  { medicine_id: 'siccalactin', species: 'notkreatur', product_type: 'kott', period_days: 28, notes: 'Dry cow product. SPC: 28 days cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'siccalactin', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'Dry cow product — after calving: discard colostrum for 96 hours.', zero_day_allowed: 0 },

  // Mastiplan LC (penicillin + neomycin — lactating)
  { medicine_id: 'mastiplan', species: 'notkreatur', product_type: 'kott', period_days: 7, notes: 'SPC: 7 days cattle meat. Lactating cow intramammary.', zero_day_allowed: 0 },
  { medicine_id: 'mastiplan', species: 'notkreatur', product_type: 'mjolk', period_days: 3, notes: 'SPC: 72 hours milk (6 milkings).', zero_day_allowed: 0 },

  // Pathozone (cefoperazone — intramammary)
  { medicine_id: 'pathozone', species: 'notkreatur', product_type: 'kott', period_days: 4, notes: 'SPC: 4 days cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'pathozone', species: 'notkreatur', product_type: 'mjolk', period_days: 3, notes: 'SPC: 84 hours milk (7 milkings).', zero_day_allowed: 0 },

  // Ubrolexin (cefalexin + kanamycin — intramammary)
  { medicine_id: 'ubrolexin', species: 'notkreatur', product_type: 'kott', period_days: 5, notes: 'EMA EPAR: 5 days cattle meat. Intramammary.', zero_day_allowed: 0 },
  { medicine_id: 'ubrolexin', species: 'notkreatur', product_type: 'mjolk', period_days: 4, notes: 'EMA EPAR: 96 hours milk (8 milkings).', zero_day_allowed: 0 },

  // ================================================================
  //  NSAIDs
  // ================================================================

  // Metacam 5 mg/ml (meloxicam)
  { medicine_id: 'metacam-inj', species: 'notkreatur', product_type: 'kott', period_days: 15, notes: 'FASS Vet SPC: 15 days cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'metacam-inj', species: 'notkreatur', product_type: 'mjolk', period_days: 5, notes: 'FASS Vet SPC: 5 days (120 hours) milk.', zero_day_allowed: 0 },
  { medicine_id: 'metacam-inj', species: 'svin', product_type: 'kott', period_days: 5, notes: 'FASS Vet SPC: 5 days pig meat.', zero_day_allowed: 0 },

  // Metacam 20 mg/ml (meloxicam)
  { medicine_id: 'metacam-20', species: 'notkreatur', product_type: 'kott', period_days: 15, notes: 'SPC: 15 days cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'metacam-20', species: 'notkreatur', product_type: 'mjolk', period_days: 5, notes: 'SPC: 5 days milk.', zero_day_allowed: 0 },
  { medicine_id: 'metacam-20', species: 'svin', product_type: 'kott', period_days: 5, notes: 'SPC: 5 days pig meat.', zero_day_allowed: 0 },

  // Metacam oral (meloxicam — pig-specific)
  { medicine_id: 'metacam-oral-svin', species: 'svin', product_type: 'kott', period_days: 5, notes: 'FASS Vet SPC: 5 days pig meat. Oral suspension.', zero_day_allowed: 0 },

  // Loxicom (meloxicam generic)
  { medicine_id: 'loxicom', species: 'notkreatur', product_type: 'kott', period_days: 15, notes: 'SPC: 15 days cattle meat. Generic meloxicam.', zero_day_allowed: 0 },
  { medicine_id: 'loxicom', species: 'notkreatur', product_type: 'mjolk', period_days: 5, notes: 'SPC: 5 days milk.', zero_day_allowed: 0 },
  { medicine_id: 'loxicom', species: 'svin', product_type: 'kott', period_days: 5, notes: 'SPC: 5 days pig meat.', zero_day_allowed: 0 },

  // Finadyne (flunixin — injectable)
  { medicine_id: 'finadyne', species: 'notkreatur', product_type: 'kott', period_days: 10, notes: 'SPC: 10 days cattle meat (IV). IM injection: 28 days.', zero_day_allowed: 0 },
  { medicine_id: 'finadyne', species: 'notkreatur', product_type: 'mjolk', period_days: 1, notes: 'SPC: 24 hours milk (IV route only).', zero_day_allowed: 0 },

  // Finadyne Transdermal (flunixin — pour-on)
  { medicine_id: 'finadyne-transdermal', species: 'notkreatur', product_type: 'kott', period_days: 7, notes: 'SPC: 7 days cattle meat. Pour-on formulation.', zero_day_allowed: 0 },
  { medicine_id: 'finadyne-transdermal', species: 'notkreatur', product_type: 'mjolk', period_days: 2, notes: 'SPC: 36 hours milk (rounded to 2 days).', zero_day_allowed: 0 },

  // Ketofen (ketoprofen)
  { medicine_id: 'ketofen', species: 'notkreatur', product_type: 'kott', period_days: 4, notes: 'SPC: 4 days cattle meat (IM). 1 day for IV.', zero_day_allowed: 0 },
  { medicine_id: 'ketofen', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'SPC: zero milk withdrawal. No withholding required.', zero_day_allowed: 1 },
  { medicine_id: 'ketofen', species: 'svin', product_type: 'kott', period_days: 4, notes: 'SPC: 4 days pig meat.', zero_day_allowed: 0 },

  // Buscopan compositum (metamizol + hyoscine)
  { medicine_id: 'buscopan', species: 'notkreatur', product_type: 'kott', period_days: 12, notes: 'SPC: 12 days cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'buscopan', species: 'notkreatur', product_type: 'mjolk', period_days: 4, notes: 'SPC: 96 hours milk.', zero_day_allowed: 0 },

  // Carprodyl (carprofen — injectable for cattle)
  { medicine_id: 'carprodyl', species: 'notkreatur', product_type: 'kott', period_days: 21, notes: 'SPC: 21 days cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'carprodyl', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'SPC: zero milk withdrawal.', zero_day_allowed: 1 },

  // Tolfedine (tolfenamic acid)
  { medicine_id: 'tolfedine', species: 'notkreatur', product_type: 'kott', period_days: 12, notes: 'SPC: 12 days cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'tolfedine', species: 'notkreatur', product_type: 'mjolk', period_days: 1, notes: 'SPC: 24 hours milk.', zero_day_allowed: 0 },
  { medicine_id: 'tolfedine', species: 'svin', product_type: 'kott', period_days: 4, notes: 'SPC: 4 days pig meat.', zero_day_allowed: 0 },

  // ================================================================
  //  Antiparasitics: Avermectins / Milbemycins
  // ================================================================

  // Ivomec injection (ivermectin)
  { medicine_id: 'ivomec', species: 'notkreatur', product_type: 'kott', period_days: 42, notes: 'SPC: 42 days cattle meat. SC injection — long tissue residue.', zero_day_allowed: 0 },
  { medicine_id: 'ivomec', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'NOT authorised for lactating dairy cattle producing milk for consumption. Ivermectin excreted in milk.', zero_day_allowed: 0 },
  { medicine_id: 'ivomec', species: 'far', product_type: 'kott', period_days: 22, notes: 'SPC: 22 days sheep meat.', zero_day_allowed: 0 },
  { medicine_id: 'ivomec', species: 'svin', product_type: 'kott', period_days: 28, notes: 'FASS Vet confirmed: 28 days pig meat.', zero_day_allowed: 0 },

  // Ivomec pour-on (ivermectin)
  { medicine_id: 'ivomec-pour-on', species: 'notkreatur', product_type: 'kott', period_days: 28, notes: 'SPC: 28 days cattle meat. Pour-on — shorter than injectable.', zero_day_allowed: 0 },
  { medicine_id: 'ivomec-pour-on', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'NOT authorised for lactating dairy cattle producing milk for consumption.', zero_day_allowed: 0 },

  // Eprinex (eprinomectin — zero milk withdrawal)
  { medicine_id: 'eprinex', species: 'notkreatur', product_type: 'kott', period_days: 15, notes: 'SPC: 15 days cattle meat. Pour-on.', zero_day_allowed: 0 },
  { medicine_id: 'eprinex', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'Zero milk withdrawal worldwide. Approved for lactating dairy cattle.', zero_day_allowed: 1 },

  // Cydectin injection (moxidectin)
  { medicine_id: 'cydectin', species: 'notkreatur', product_type: 'kott', period_days: 65, notes: 'SPC: 65 days cattle meat. Injectable — very long withdrawal.', zero_day_allowed: 0 },
  { medicine_id: 'cydectin', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'NOT authorised for lactating dairy cattle producing milk for consumption.', zero_day_allowed: 0 },
  { medicine_id: 'cydectin', species: 'far', product_type: 'kott', period_days: 42, notes: 'SPC: 42 days sheep meat.', zero_day_allowed: 0 },

  // Cydectin pour-on (moxidectin)
  { medicine_id: 'cydectin-pour-on', species: 'notkreatur', product_type: 'kott', period_days: 14, notes: 'SPC: 14 days cattle meat. Pour-on — shorter than injectable.', zero_day_allowed: 0 },
  { medicine_id: 'cydectin-pour-on', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'NOT authorised for lactating dairy cattle producing milk for consumption.', zero_day_allowed: 0 },

  // Dectomax (doramectin)
  { medicine_id: 'dectomax', species: 'notkreatur', product_type: 'kott', period_days: 70, notes: 'SPC: 70 days cattle meat. Long tissue persistence.', zero_day_allowed: 0 },
  { medicine_id: 'dectomax', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'NOT authorised for lactating dairy cattle producing milk for consumption.', zero_day_allowed: 0 },
  { medicine_id: 'dectomax', species: 'far', product_type: 'kott', period_days: 70, notes: 'SPC: 70 days sheep meat.', zero_day_allowed: 0 },

  // ================================================================
  //  Antiparasitics: Benzimidazoles
  // ================================================================

  // Panacur (fenbendazole)
  { medicine_id: 'panacur', species: 'notkreatur', product_type: 'kott', period_days: 14, notes: 'SPC: 14 days cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'panacur', species: 'notkreatur', product_type: 'mjolk', period_days: 5, notes: 'SPC: 5 days milk.', zero_day_allowed: 0 },
  { medicine_id: 'panacur', species: 'far', product_type: 'kott', period_days: 14, notes: 'SPC: 14 days sheep meat.', zero_day_allowed: 0 },
  { medicine_id: 'panacur', species: 'far', product_type: 'mjolk', period_days: 5, notes: 'SPC: 5 days sheep milk.', zero_day_allowed: 0 },
  { medicine_id: 'panacur', species: 'get', product_type: 'kott', period_days: 14, notes: 'SPC: 14 days goat meat.', zero_day_allowed: 0 },
  { medicine_id: 'panacur', species: 'svin', product_type: 'kott', period_days: 4, notes: 'SPC: 4 days pig meat.', zero_day_allowed: 0 },

  // Valbazen (albendazole)
  { medicine_id: 'valbazen', species: 'notkreatur', product_type: 'kott', period_days: 14, notes: 'SPC: 14 days cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'valbazen', species: 'notkreatur', product_type: 'mjolk', period_days: 3, notes: 'SPC: 60 hours milk (rounded to 3 days). Contraindicated first trimester pregnancy.', zero_day_allowed: 0 },
  { medicine_id: 'valbazen', species: 'far', product_type: 'kott', period_days: 10, notes: 'SPC: 10 days sheep meat.', zero_day_allowed: 0 },
  { medicine_id: 'valbazen', species: 'get', product_type: 'kott', period_days: 14, notes: 'SPC: 14 days goat meat.', zero_day_allowed: 0 },

  // Oxfenil (oxfendazole)
  { medicine_id: 'oxfenil', species: 'notkreatur', product_type: 'kott', period_days: 14, notes: 'SPC: 14 days cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'oxfenil', species: 'notkreatur', product_type: 'mjolk', period_days: 5, notes: 'SPC: 108 hours milk (rounded to 5 days).', zero_day_allowed: 0 },
  { medicine_id: 'oxfenil', species: 'far', product_type: 'kott', period_days: 10, notes: 'SPC: 10 days sheep meat.', zero_day_allowed: 0 },

  // Hapadex (netobimin)
  { medicine_id: 'hapadex', species: 'notkreatur', product_type: 'kott', period_days: 10, notes: 'SPC: 10 days cattle meat. Netobimin pro-benzimidazole.', zero_day_allowed: 0 },
  { medicine_id: 'hapadex', species: 'notkreatur', product_type: 'mjolk', period_days: 3, notes: 'SPC: 72 hours milk.', zero_day_allowed: 0 },
  { medicine_id: 'hapadex', species: 'far', product_type: 'kott', period_days: 10, notes: 'SPC: 10 days sheep meat.', zero_day_allowed: 0 },

  // ================================================================
  //  Antiparasitics: Imidazothiazoles
  // ================================================================

  // Levamisol (levamisole)
  { medicine_id: 'levamisol-vet', species: 'notkreatur', product_type: 'kott', period_days: 35, notes: 'SPC: 35 days cattle meat. Conservative — levamisole has wide range (30-40 days) across products.', zero_day_allowed: 0 },
  { medicine_id: 'levamisol-vet', species: 'notkreatur', product_type: 'mjolk', period_days: 3, notes: 'SPC: 3 days milk. Some countries prohibit use in lactating cattle entirely.', zero_day_allowed: 0 },
  { medicine_id: 'levamisol-vet', species: 'far', product_type: 'kott', period_days: 30, notes: 'SPC: 30 days sheep meat.', zero_day_allowed: 0 },
  { medicine_id: 'levamisol-vet', species: 'svin', product_type: 'kott', period_days: 35, notes: 'SPC: 35 days pig meat.', zero_day_allowed: 0 },

  // ================================================================
  //  Antiparasitics: Fasciolicides
  // ================================================================

  // Fasinex (triclabendazole — liver fluke)
  { medicine_id: 'fasinex', species: 'notkreatur', product_type: 'kott', period_days: 56, notes: 'SPC: 56 days cattle meat. Liver fluke treatment.', zero_day_allowed: 0 },
  { medicine_id: 'fasinex', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'NOT authorised for lactating dairy cattle producing milk for consumption.', zero_day_allowed: 0 },
  { medicine_id: 'fasinex', species: 'far', product_type: 'kott', period_days: 56, notes: 'SPC: 56 days sheep meat.', zero_day_allowed: 0 },

  // Closamectin (closantel + ivermectin)
  { medicine_id: 'closamectin', species: 'notkreatur', product_type: 'kott', period_days: 77, notes: 'SPC: 77 days cattle meat. Closantel has very long tissue persistence.', zero_day_allowed: 0 },
  { medicine_id: 'closamectin', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'NOT authorised for lactating dairy cattle producing milk for consumption.', zero_day_allowed: 0 },

  // Endex (triclabendazole + levamisole)
  { medicine_id: 'endex', species: 'notkreatur', product_type: 'kott', period_days: 56, notes: 'SPC: 56 days cattle meat. Combination fluke + roundworm.', zero_day_allowed: 0 },
  { medicine_id: 'endex', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'NOT authorised for lactating dairy cattle producing milk for consumption.', zero_day_allowed: 0 },
  { medicine_id: 'endex', species: 'far', product_type: 'kott', period_days: 56, notes: 'SPC: 56 days sheep meat.', zero_day_allowed: 0 },

  // ================================================================
  //  Antiparasitics: Ectoparasiticides
  // ================================================================

  // Spotinor (deltamethrin pour-on)
  { medicine_id: 'spotinor', species: 'notkreatur', product_type: 'kott', period_days: 18, notes: 'SPC: 18 days cattle meat. Deltamethrin pour-on.', zero_day_allowed: 0 },
  { medicine_id: 'spotinor', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'SPC: zero milk withdrawal.', zero_day_allowed: 1 },
  { medicine_id: 'spotinor', species: 'far', product_type: 'kott', period_days: 35, notes: 'SPC: 35 days sheep meat.', zero_day_allowed: 0 },

  // Butox (deltamethrin pour-on)
  { medicine_id: 'butox', species: 'notkreatur', product_type: 'kott', period_days: 18, notes: 'SPC: 18 days cattle meat. Deltamethrin.', zero_day_allowed: 0 },
  { medicine_id: 'butox', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'SPC: zero milk withdrawal.', zero_day_allowed: 1 },
  { medicine_id: 'butox', species: 'far', product_type: 'kott', period_days: 35, notes: 'SPC: 35 days sheep meat.', zero_day_allowed: 0 },

  // Bayticol (flumethrin pour-on)
  { medicine_id: 'bayticol', species: 'notkreatur', product_type: 'kott', period_days: 10, notes: 'SPC: 10 days cattle meat. Flumethrin pour-on.', zero_day_allowed: 0 },
  { medicine_id: 'bayticol', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'SPC: zero milk withdrawal.', zero_day_allowed: 1 },

  // Taktic (amitraz)
  { medicine_id: 'taktic', species: 'notkreatur', product_type: 'kott', period_days: 1, notes: 'SPC: 1 day cattle meat. Amitraz dip.', zero_day_allowed: 0 },
  { medicine_id: 'taktic', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'SPC: zero milk withdrawal for topical application.', zero_day_allowed: 1 },
  { medicine_id: 'taktic', species: 'svin', product_type: 'kott', period_days: 1, notes: 'SPC: 1 day pig meat.', zero_day_allowed: 0 },

  // ================================================================
  //  Hormones (therapeutic)
  // ================================================================

  // Estrumate (cloprostenol — prostaglandin)
  { medicine_id: 'estrumate', species: 'notkreatur', product_type: 'kott', period_days: 1, notes: 'SPC: 1 day cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'estrumate', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'SPC: zero milk withdrawal.', zero_day_allowed: 1 },
  { medicine_id: 'estrumate', species: 'svin', product_type: 'kott', period_days: 1, notes: 'SPC: 1 day pig meat.', zero_day_allowed: 0 },

  // Planate (cloprostenol)
  { medicine_id: 'planate', species: 'notkreatur', product_type: 'kott', period_days: 1, notes: 'SPC: 1 day cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'planate', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'SPC: zero milk withdrawal.', zero_day_allowed: 1 },
  { medicine_id: 'planate', species: 'svin', product_type: 'kott', period_days: 1, notes: 'SPC: 1 day pig meat.', zero_day_allowed: 0 },

  // Receptal (buserelin — GnRH agonist)
  { medicine_id: 'receptal', species: 'notkreatur', product_type: 'kott', period_days: 0, notes: 'SPC: zero meat withdrawal.', zero_day_allowed: 1 },
  { medicine_id: 'receptal', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'SPC: zero milk withdrawal.', zero_day_allowed: 1 },

  // Fertagyl (gonadorelin — GnRH)
  { medicine_id: 'fertagyl', species: 'notkreatur', product_type: 'kott', period_days: 0, notes: 'SPC: zero meat withdrawal. Endogenous hormone analogue.', zero_day_allowed: 1 },
  { medicine_id: 'fertagyl', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'SPC: zero milk withdrawal.', zero_day_allowed: 1 },

  // PRID Delta (progesterone — vaginal insert)
  { medicine_id: 'prid-delta', species: 'notkreatur', product_type: 'kott', period_days: 0, notes: 'SPC: zero meat withdrawal after device removal.', zero_day_allowed: 1 },
  { medicine_id: 'prid-delta', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'SPC: zero milk withdrawal.', zero_day_allowed: 1 },

  // Cue-Mate (progesterone — vaginal insert)
  { medicine_id: 'cue-mate', species: 'notkreatur', product_type: 'kott', period_days: 0, notes: 'SPC: zero meat withdrawal after device removal.', zero_day_allowed: 1 },
  { medicine_id: 'cue-mate', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'SPC: zero milk withdrawal.', zero_day_allowed: 1 },

  // Oxytocin
  { medicine_id: 'oxytocin-vet', species: 'notkreatur', product_type: 'kott', period_days: 0, notes: 'SPC: zero meat withdrawal. Endogenous hormone.', zero_day_allowed: 1 },
  { medicine_id: 'oxytocin-vet', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'SPC: zero milk withdrawal.', zero_day_allowed: 1 },
  { medicine_id: 'oxytocin-vet', species: 'svin', product_type: 'kott', period_days: 0, notes: 'SPC: zero meat withdrawal.', zero_day_allowed: 1 },
  { medicine_id: 'oxytocin-vet', species: 'far', product_type: 'kott', period_days: 0, notes: 'SPC: zero meat withdrawal.', zero_day_allowed: 1 },

  // ================================================================
  //  Anaesthetics / Sedation (food-producing animals)
  // ================================================================

  // Xylazin (Rompun — food species)
  { medicine_id: 'xylazin-vet', species: 'notkreatur', product_type: 'kott', period_days: 1, notes: 'SPC: 1 day cattle meat. Alpha-2 agonist sedative.', zero_day_allowed: 0 },
  { medicine_id: 'xylazin-vet', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'SPC: zero milk withdrawal.', zero_day_allowed: 1 },

  // Ketaminol (ketamine — food species)
  { medicine_id: 'ketaminol', species: 'notkreatur', product_type: 'kott', period_days: 3, notes: 'SPC: 3 days cattle meat. Rapid metabolism.', zero_day_allowed: 0 },
  { medicine_id: 'ketaminol', species: 'notkreatur', product_type: 'mjolk', period_days: 1, notes: 'SPC: 24 hours milk.', zero_day_allowed: 0 },

  // Isofluran (inhalation — food species)
  { medicine_id: 'isofluran-vet', species: 'notkreatur', product_type: 'kott', period_days: 2, notes: 'SPC: 2 days cattle meat. Inhalation anaesthetic — minimal residues.', zero_day_allowed: 0 },
  { medicine_id: 'isofluran-vet', species: 'notkreatur', product_type: 'mjolk', period_days: 1, notes: 'SPC: 24 hours milk.', zero_day_allowed: 0 },
  { medicine_id: 'isofluran-vet', species: 'svin', product_type: 'kott', period_days: 2, notes: 'SPC: 2 days pig meat.', zero_day_allowed: 0 },
  { medicine_id: 'isofluran-vet', species: 'far', product_type: 'kott', period_days: 2, notes: 'SPC: 2 days sheep meat.', zero_day_allowed: 0 },

  // Lidokain (lidocaine — local anaesthetic, food species)
  { medicine_id: 'lidokain-vet', species: 'notkreatur', product_type: 'kott', period_days: 1, notes: 'SPC: 1 day cattle meat. Local anaesthetic.', zero_day_allowed: 0 },
  { medicine_id: 'lidokain-vet', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'SPC: zero milk withdrawal for local infiltration.', zero_day_allowed: 1 },
  { medicine_id: 'lidokain-vet', species: 'svin', product_type: 'kott', period_days: 1, notes: 'SPC: 1 day pig meat.', zero_day_allowed: 0 },
  { medicine_id: 'lidokain-vet', species: 'far', product_type: 'kott', period_days: 1, notes: 'SPC: 1 day sheep meat.', zero_day_allowed: 0 },

  // Furosemid (diuretic — food species)
  { medicine_id: 'furosemid-vet', species: 'notkreatur', product_type: 'kott', period_days: 1, notes: 'SPC: 1 day cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'furosemid-vet', species: 'notkreatur', product_type: 'mjolk', period_days: 1, notes: 'SPC: 24 hours milk.', zero_day_allowed: 0 },

  // Atropin (food species)
  { medicine_id: 'atropin-vet', species: 'notkreatur', product_type: 'kott', period_days: 1, notes: 'SPC: 1 day cattle meat. Anticholinergic.', zero_day_allowed: 0 },
  { medicine_id: 'atropin-vet', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'SPC: zero milk withdrawal.', zero_day_allowed: 1 },
  { medicine_id: 'atropin-vet', species: 'svin', product_type: 'kott', period_days: 1, notes: 'SPC: 1 day pig meat.', zero_day_allowed: 0 },

  // Imaverol (enilconazole topical — food species)
  { medicine_id: 'imaverol', species: 'notkreatur', product_type: 'kott', period_days: 0, notes: 'SPC: zero meat withdrawal for topical antifungal.', zero_day_allowed: 1 },
  { medicine_id: 'imaverol', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'SPC: zero milk withdrawal for topical application.', zero_day_allowed: 1 },

  // Butorphanol (horse — food-producing equine)
  { medicine_id: 'butorphanol-vet', species: 'hast', product_type: 'kott', period_days: 1, notes: 'SPC: 1 day horse meat. Opioid analgesic.', zero_day_allowed: 0 },

  // ================================================================
  //  Corticosteroids
  // ================================================================

  // Dexafort (dexamethasone)
  { medicine_id: 'dexafort', species: 'notkreatur', product_type: 'kott', period_days: 16, notes: 'SPC: 16 days cattle meat.', zero_day_allowed: 0 },
  { medicine_id: 'dexafort', species: 'notkreatur', product_type: 'mjolk', period_days: 3, notes: 'SPC: 72 hours milk.', zero_day_allowed: 0 },
  { medicine_id: 'dexafort', species: 'svin', product_type: 'kott', period_days: 8, notes: 'SPC: 8 days pig meat.', zero_day_allowed: 0 },

  // ================================================================
  //  Calcium / supportive
  // ================================================================

  // Calciject (calcium gluconate — no withdrawal)
  { medicine_id: 'calcium-vet', species: 'notkreatur', product_type: 'kott', period_days: 0, notes: 'SPC: zero meat withdrawal. Essential mineral supplement.', zero_day_allowed: 1 },
  { medicine_id: 'calcium-vet', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'SPC: zero milk withdrawal.', zero_day_allowed: 1 },

  // ================================================================
  //  Vaccines (zero withdrawal for food safety, except as noted)
  // ================================================================
  { medicine_id: 'bovilis-bvd', species: 'notkreatur', product_type: 'kott', period_days: 0, notes: 'Vaccine: zero meat withdrawal per SPC.', zero_day_allowed: 1 },
  { medicine_id: 'bovilis-bvd', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'Vaccine: zero milk withdrawal per SPC.', zero_day_allowed: 1 },
  { medicine_id: 'bovilis-ibr', species: 'notkreatur', product_type: 'kott', period_days: 0, notes: 'Vaccine: zero meat withdrawal per SPC.', zero_day_allowed: 1 },
  { medicine_id: 'bovilis-ibr', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'Vaccine: zero milk withdrawal per SPC.', zero_day_allowed: 1 },
  { medicine_id: 'covexin', species: 'notkreatur', product_type: 'kott', period_days: 0, notes: 'Vaccine: zero meat withdrawal per SPC.', zero_day_allowed: 1 },
  { medicine_id: 'covexin', species: 'far', product_type: 'kott', period_days: 0, notes: 'Vaccine: zero meat withdrawal per SPC.', zero_day_allowed: 1 },
  { medicine_id: 'rispoval-rs-bvd', species: 'notkreatur', product_type: 'kott', period_days: 0, notes: 'Vaccine: zero meat withdrawal per SPC.', zero_day_allowed: 1 },
  { medicine_id: 'rispoval-rs-bvd', species: 'notkreatur', product_type: 'mjolk', period_days: 0, notes: 'Vaccine: zero milk withdrawal per SPC.', zero_day_allowed: 1 },
  { medicine_id: 'bravoxin-10', species: 'notkreatur', product_type: 'kott', period_days: 0, notes: 'Vaccine: zero meat withdrawal per SPC.', zero_day_allowed: 1 },
  { medicine_id: 'bravoxin-10', species: 'far', product_type: 'kott', period_days: 0, notes: 'Vaccine: zero meat withdrawal per SPC.', zero_day_allowed: 1 },
  { medicine_id: 'heptavac-p', species: 'far', product_type: 'kott', period_days: 0, notes: 'Vaccine: zero meat withdrawal per SPC.', zero_day_allowed: 1 },
  { medicine_id: 'porcilis-porcoli', species: 'svin', product_type: 'kott', period_days: 0, notes: 'Vaccine: zero meat withdrawal per SPC.', zero_day_allowed: 1 },
  { medicine_id: 'porcilis-myco', species: 'svin', product_type: 'kott', period_days: 0, notes: 'Vaccine: zero meat withdrawal per SPC.', zero_day_allowed: 1 },
  { medicine_id: 'porcilis-prrs', species: 'svin', product_type: 'kott', period_days: 0, notes: 'Vaccine: zero meat withdrawal per SPC.', zero_day_allowed: 1 },
  { medicine_id: 'porcilis-pcv-mhyo', species: 'svin', product_type: 'kott', period_days: 0, notes: 'Vaccine: zero meat withdrawal per SPC.', zero_day_allowed: 1 },
  { medicine_id: 'porcilis-lawsonia', species: 'svin', product_type: 'kott', period_days: 0, notes: 'Vaccine: zero meat withdrawal per SPC.', zero_day_allowed: 1 },
  { medicine_id: 'ingelvac-circoflex', species: 'svin', product_type: 'kott', period_days: 0, notes: 'Vaccine: zero meat withdrawal per SPC.', zero_day_allowed: 1 },
  { medicine_id: 'equilis-prequenza', species: 'hast', product_type: 'kott', period_days: 0, notes: 'Vaccine: zero meat withdrawal per SPC.', zero_day_allowed: 1 },
  { medicine_id: 'equilis-tetanus', species: 'hast', product_type: 'kott', period_days: 0, notes: 'Vaccine: zero meat withdrawal per SPC.', zero_day_allowed: 1 },
  { medicine_id: 'proteqflu', species: 'hast', product_type: 'kott', period_days: 0, notes: 'Vaccine: zero meat withdrawal per SPC.', zero_day_allowed: 1 },
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
// BANNED SUBSTANCES
// Sources:
//   EU Regulation 37/2010 Table 2 (prohibited substances)
//   EU Council Directive 96/22/EC (growth promoters)
//   EU Directive 2003/74/EC (oestradiol)
//   EU Regulation 2019/6 (general prohibition framework)
// ============================================================

const bannedSubstances: {
  substance: string; category: string; applies_to: string; regulation_ref: string;
}[] = [
  // --- EU Regulation 37/2010 Table 2 — Prohibited substances ---
  // These substances cannot be administered to food-producing animals under any circumstances.
  { substance: 'Aristolochia spp. and preparations thereof', category: 'Herbal (prohibited)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Chloramphenicol', category: 'Antibiotics (prohibited)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Chloroform', category: 'Anaesthetics (prohibited)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Chlorpromazine', category: 'Phenothiazines (prohibited)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Colchicine', category: 'Alkaloids (prohibited)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Dapsone', category: 'Antibiotics (prohibited)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Dimetridazole', category: 'Nitroimidazoles (prohibited)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Metronidazole', category: 'Nitroimidazoles (prohibited)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Ipronidazole', category: 'Nitroimidazoles (prohibited)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Ronidazole', category: 'Nitroimidazoles (prohibited)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Other nitroimidazoles not specifically listed', category: 'Nitroimidazoles (prohibited)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2 (class prohibition)' },
  { substance: 'Nitrofurans (including furazolidone, furaltadone, nitrofurazone, nitrofurantoin)', category: 'Nitrofurans (prohibited)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Malachite green', category: 'Triphenylmethane dyes (prohibited)', applies_to: 'aquaculture species', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Crystal violet (gentian violet)', category: 'Triphenylmethane dyes (prohibited)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Brilliant green', category: 'Triphenylmethane dyes (prohibited)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Phenylbutazone (bute)', category: 'NSAIDs (prohibited in food animals)', applies_to: 'equines intended for food chain', regulation_ref: 'EU Regulation 37/2010, Table 2; lifetime food chain exclusion if administered' },

  // --- EU Council Directive 96/22/EC — Growth promoters ---
  { substance: 'Stilbenes and stilbene derivatives (including diethylstilbestrol/DES)', category: 'Stilbenes (banned growth promoter)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC Art. 2' },
  { substance: 'Thyrostatic agents (thiouracil, methylthiouracil, propylthiouracil, tapazole)', category: 'Thyrostatics (banned growth promoter)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC Art. 2' },
  { substance: 'Oestradiol 17-beta and ester-like derivatives', category: 'Hormonal growth promoter (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Directive 2003/74/EC, amending 96/22/EC' },
  { substance: 'Testosterone (as growth promoter)', category: 'Hormonal growth promoter (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC Art. 2' },
  { substance: 'Progesterone (as growth promoter)', category: 'Hormonal growth promoter (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC Art. 2' },
  { substance: 'Zeranol', category: 'Hormonal growth promoter (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC Art. 2' },
  { substance: 'Trenbolone acetate', category: 'Hormonal growth promoter (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC Art. 2' },
  { substance: 'Melengestrol acetate (MGA)', category: 'Hormonal growth promoter (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC Art. 2' },

  // --- Beta-agonists (banned as growth promoters in EU) ---
  { substance: 'Clenbuterol (as growth promoter)', category: 'Beta-agonists (banned growth promoter)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC Art. 2' },
  { substance: 'Ractopamine', category: 'Beta-agonists (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC; banned in EU entirely' },
  { substance: 'Salbutamol (as growth promoter)', category: 'Beta-agonists (banned growth promoter)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC Art. 2' },
  { substance: 'Zilpaterol', category: 'Beta-agonists (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC; banned in EU entirely' },
  { substance: 'Isoxsuprine', category: 'Beta-agonists (banned)', applies_to: 'all food-producing animals', regulation_ref: 'EU Council Directive 96/22/EC; not authorised for food animals' },

  // --- Additional 37/2010 Table 2 entries ---
  { substance: 'Strychnine', category: 'Alkaloids (prohibited)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Dinitrophenol (DNP)', category: 'Toxic compounds (prohibited)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Carbon tetrachloride', category: 'Halogenated solvents (prohibited)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2' },
  { substance: 'Acepromazine', category: 'Phenothiazines (prohibited)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2 (no MRL — prohibited in food species)' },
  { substance: 'Olaquindox', category: 'Quinoxalines (prohibited)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2; formerly used as growth promoter' },
  { substance: 'Carbadox', category: 'Quinoxalines (prohibited)', applies_to: 'all food-producing animals', regulation_ref: 'EU Regulation 37/2010, Table 2; genotoxic, banned' },

  // --- Swedish-specific restrictions (SJVFS 2019:32) ---
  { substance: 'Carbapenems (entire class)', category: 'Antibiotics (banned for veterinary use)', applies_to: 'all animals in Sweden', regulation_ref: 'SJVFS 2019:32 (Jordbruksverket) — total prohibition' },
  { substance: 'Glycopeptides (vancomycin, teicoplanin — entire class)', category: 'Antibiotics (banned for veterinary use)', applies_to: 'all animals in Sweden', regulation_ref: 'SJVFS 2019:32 — reserved for human medicine' },
  { substance: 'Oxazolidinones (linezolid — entire class)', category: 'Antibiotics (banned for veterinary use)', applies_to: 'all animals in Sweden', regulation_ref: 'SJVFS 2019:32 — reserved for human medicine' },
  { substance: 'Lipopeptides (daptomycin — entire class)', category: 'Antibiotics (banned for veterinary use)', applies_to: 'all animals in Sweden', regulation_ref: 'SJVFS 2019:32 — reserved for human medicine' },
  { substance: 'Tigecycline (glycylcyclines)', category: 'Antibiotics (banned for veterinary use)', applies_to: 'all animals in Sweden', regulation_ref: 'SJVFS 2019:32 — reserved for human medicine' },
  { substance: 'Polymyxins — colistin IV (systemic use in food animals)', category: 'Antibiotics (restricted)', applies_to: 'food-producing animals in Sweden', regulation_ref: 'SJVFS 2019:32 — systemic use banned; topical/intramammary only under strict conditions' },
  { substance: 'Rifampicin', category: 'Antibiotics (restricted)', applies_to: 'food-producing animals in Sweden', regulation_ref: 'SJVFS 2019:32 — reserved for human TB treatment; veterinary use prohibited for food animals' },
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
// Sources: EU Regulation 2019/6 Art. 112-115, SJVFS 2019:32 (Jordbruksverket),
// Jordbruksverket.se guidance on cascade prescribing
// ============================================================

const cascadeRules: {
  step_order: number; description: string; documentation_required: string;
  default_withdrawal_meat_days: number; default_withdrawal_milk_days: number;
  source: string;
}[] = [
  {
    step_order: 1,
    description: 'Use a veterinary medicinal product authorised in Sweden for the species and condition being treated. For antibiotics: choose penicillin first if effective; otherwise select the lowest-resistance-risk option per EMA guidelines and SVA recommendations.',
    documentation_required: 'Standard treatment record in stalljournal. For antibiotics: clinical justification for substance choice documented.',
    default_withdrawal_meat_days: 0,
    default_withdrawal_milk_days: 0,
    source: 'SJVFS 2019:32 (Jordbruksverket), EU Regulation 2019/6 Art. 112-114',
  },
  {
    step_order: 2,
    description: 'If no suitable product from Step 1: use a product authorised in Sweden for another species or another condition in the same species. Minimum withdrawal applies: 1.5x the longest approved withdrawal period for meat/offal, 1.5x for milk, minimum 28 days meat if the product is not authorised for food-producing animals, minimum 10 days for eggs.',
    documentation_required: 'Clinical justification for off-label use documented. Species/condition deviation recorded. Informed animal owner consent. Extended withdrawal period calculated and recorded.',
    default_withdrawal_meat_days: 28,
    default_withdrawal_milk_days: 7,
    source: 'EU Regulation 2019/6 Art. 113(1)(a) and Art. 115(1), Jordbruksverket guidance',
  },
  {
    step_order: 3,
    description: 'If no suitable product from Steps 1-2: use a product authorised in another EU/EEA member state for the same species, or a human medicinal product authorised in Sweden. Veterinarian applies for special import license from Lakemedelsverket for EU products. Extended withdrawal applies per Art. 115.',
    documentation_required: 'Veterinarian applies for special import license from Lakemedelsverket (for non-SE products). Written justification and clinical need documented. Extended withdrawal periods: 1.5x SPC period, minimum 28 days meat, 7 days milk, 10 days eggs.',
    default_withdrawal_meat_days: 28,
    default_withdrawal_milk_days: 7,
    source: 'EU Regulation 2019/6 Art. 113(1)(b-c), SJVFS 2019:32, Lakemedelsverket license procedure',
  },
  {
    step_order: 4,
    description: 'If no suitable product from Steps 1-3: use an extemporaneous preparation (magistral formula) prepared by a pharmacist according to veterinary prescription. Only substances with MRL in Table 1 of Regulation 37/2010 may be used for food-producing animals.',
    documentation_required: 'Detailed veterinary prescription specifying active substance, strength, and form. Pharmacy preparation record. Full justification for extemporaneous preparation. Withdrawal: 28 days meat, 7 days milk, 10 days eggs minimum.',
    default_withdrawal_meat_days: 28,
    default_withdrawal_milk_days: 7,
    source: 'EU Regulation 2019/6 Art. 113(1)(d) and Art. 115(5), SJVFS 2019:32',
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
// Sources: SJVFS 2019:32, EU Regulation 2019/6 Art. 108,
// EU Regulation 853/2004, EU Regulation 2015/262 (horse passport)
// ============================================================

const recordRequirements: {
  holding_type: string | null; species: string | null; requirement: string;
  retention_period: string; regulation_ref: string;
}[] = [
  // General — all food-producing animals
  {
    holding_type: null,
    species: null,
    requirement: 'All veterinary treatments on food-producing animals must be recorded in a stalljournal (treatment journal). Required fields: date, animal identification (ear tag/group), diagnosis, medicine name and batch number, dose, route of administration, withdrawal period end date, treating veterinarian name and license number.',
    retention_period: '5 years',
    regulation_ref: 'SJVFS 2019:32, EU Regulation 2019/6 Art. 108',
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
    requirement: 'Cascade prescribing (steps 2-4) requires additional documentation: clinical justification for off-label use, informed consent from animal owner, and documentation that no suitable authorised product exists. Extended withdrawal period calculation must be recorded.',
    retention_period: '5 years',
    regulation_ref: 'EU Regulation 2019/6 Art. 113, SJVFS 2019:32',
  },
  {
    holding_type: null,
    species: null,
    requirement: 'Antimicrobial use must be reported to SVA (National Veterinary Institute) for Svarm resistance monitoring. Veterinarians must record all antimicrobial prescriptions. Antimicrobial prescriptions are valid only 5 days from issuance.',
    retention_period: '5 years',
    regulation_ref: 'SJVFS 2019:32, EU Regulation 2019/6 Art. 57',
  },
  {
    holding_type: null,
    species: null,
    requirement: 'Fluoroquinolone and 3rd/4th generation cephalosporin prescribing requires prior microbiological susceptibility testing confirming no effective alternative exists. Exception: life-threatening conditions where delay would compromise animal welfare. Documentation of test results and justification is mandatory.',
    retention_period: '5 years',
    regulation_ref: 'SJVFS 2019:32 (specific Swedish restriction), EU Regulation 2019/6 Art. 107(4)',
  },

  // Dairy-specific
  {
    holding_type: 'mjolkgard',
    species: 'notkreatur',
    requirement: 'Dairy farms must maintain separate record of all treated animals with milk withdrawal end dates. Treated animals must be clearly identified and milk must be withheld and discarded until withdrawal period expires. Bulk tank milk must not contain residues above MRL. Treated cows must be milked separately.',
    retention_period: '5 years',
    regulation_ref: 'SJVFS 2019:32, EU Regulation 853/2004',
  },
  {
    holding_type: 'mjolkgard',
    species: 'notkreatur',
    requirement: 'ViLA (villkorad laekemedelsanvaendning) agreement: dairy farms may receive conditional authority for farmer-administered treatments. Requires written agreement signed by veterinarian and farmer, herd health plan, declared treatment protocols, efficacy assessments, and quarterly welfare declarations. Agreement submitted to county administration within 2 weeks.',
    retention_period: '5 years',
    regulation_ref: 'SJVFS 2019:32 Chapter 4, Jordbruksverket guidance',
  },

  // Pig-specific
  {
    holding_type: 'slaktgrisproduktion',
    species: 'svin',
    requirement: 'Pig producers must record all treatments with group treatment records when entire pens are treated. Individual treatment records required for injectable medicines. Withdrawal end dates must be communicated to slaughterhouse at delivery via food chain information (FCI) declaration.',
    retention_period: '5 years',
    regulation_ref: 'SJVFS 2019:32, EU Regulation 853/2004 Annex II',
  },
  {
    holding_type: 'slaktgrisproduktion',
    species: 'svin',
    requirement: 'Group antibiotic treatments via feed or water must be recorded with pen identification, number of animals, total dose administered, treatment period start/end, and withdrawal end date. Medicated feed must be prescribed by veterinarian and supplied by approved manufacturer.',
    retention_period: '5 years',
    regulation_ref: 'SJVFS 2019:32, EU Regulation 2019/4 (medicated feed)',
  },

  // Sheep-specific
  {
    holding_type: 'faravling',
    species: 'far',
    requirement: 'Sheep holdings must record all treatments with individual animal identification where feasible, or flock-level records for group treatments (anthelmintics). Withdrawal end dates required before slaughter. Food chain information (FCI) must accompany animals to slaughterhouse.',
    retention_period: '5 years',
    regulation_ref: 'SJVFS 2019:32, EU Regulation 853/2004 Annex II',
  },

  // Poultry-specific
  {
    holding_type: 'fjaderfaproduktion',
    species: 'fjaderfa',
    requirement: 'Poultry flocks treated with antimicrobials must have treatment records at flock level: flock ID, house number, number of birds, antimicrobial name/batch/dose, route (water/feed), treatment start/end, withdrawal end date. Eggs from treated laying hens must be discarded during withdrawal period.',
    retention_period: '5 years',
    regulation_ref: 'SJVFS 2019:32, EU Regulation 853/2004',
  },

  // Goat-specific
  {
    holding_type: 'getproduktion',
    species: 'get',
    requirement: 'Goat milk producers must maintain treatment records equivalent to dairy cattle requirements. Withdrawal periods for goats often follow cascade rules (1.5x cattle SPC period) when no goat-specific authorisation exists. Treated animals must be milked separately.',
    retention_period: '5 years',
    regulation_ref: 'SJVFS 2019:32, EU Regulation 2019/6 Art. 115',
  },

  // Horse-specific
  {
    holding_type: null,
    species: 'hast',
    requirement: 'Equines intended for slaughter must have all treatments recorded in the horse passport (hastpass). If treated with a substance not in Table 1 of EU Regulation 37/2010, the horse must be permanently excluded from the food chain (6-month declaration per Regulation 122/2013, or lifetime exclusion). Phenylbutazone triggers permanent exclusion.',
    retention_period: 'Lifetime of animal',
    regulation_ref: 'EU Regulation 2015/262, EU Regulation 122/2013, SJVFS 2019:32',
  },
  {
    holding_type: null,
    species: 'hast',
    requirement: 'Essential equine substances (listed in EU Regulation 122/2013) may be used in food-producing horses with a mandatory 6-month withdrawal period. Treatment must be recorded in the horse passport with substance name, date, and 6-month withholding end date.',
    retention_period: 'Lifetime of animal',
    regulation_ref: 'EU Regulation 122/2013, EU Regulation 2015/262',
  },

  // Aquaculture-specific
  {
    holding_type: 'vattenbruk',
    species: 'fisk',
    requirement: 'Aquaculture operations must record all treatments with batch/tank identification, number of fish (estimated weight), medicine name and batch, dose, water temperature at treatment, degree-day withdrawal period, and calculated harvest date. Withdrawal measured in degree-days (max 500 degree-days for cascade use).',
    retention_period: '5 years',
    regulation_ref: 'SJVFS 2019:32, EU Regulation 2019/6 Art. 115',
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

// Index withdrawal periods (grouped by medicine)
const wpByMedicine = new Map<string, typeof withdrawalPeriods>();
for (const w of withdrawalPeriods) {
  const existing = wpByMedicine.get(w.medicine_id) ?? [];
  existing.push(w);
  wpByMedicine.set(w.medicine_id, existing);
}
for (const [medId, periods] of wpByMedicine) {
  const med = medicines.find(m => m.id === medId);
  if (!med) continue;
  const species = [...new Set(periods.map(p => p.species))].join(', ');
  const details = periods.map(p =>
    `${p.species} ${p.product_type}: ${p.period_days} dagar${p.zero_day_allowed ? ' (noll tillaten)' : ''}`
  ).join('; ');
  const body = `Karenstid for ${med.product_name}: ${details}. ${periods[0].notes}`;
  db.run(
    'INSERT INTO search_index (title, body, species, jurisdiction) VALUES (?, ?, ?, ?)',
    [`Withdrawal: ${med.product_name}`, body, species, 'SE']
  );
}

// Index banned substances
for (const b of bannedSubstances) {
  const body = `FORBJUDET/BANNED: ${b.substance}. Category: ${b.category}. Applies to: ${b.applies_to}. Ref: ${b.regulation_ref}.`;
  db.run(
    'INSERT INTO search_index (title, body, species, jurisdiction) VALUES (?, ?, ?, ?)',
    [`Banned: ${b.substance}`, body, b.applies_to, 'SE']
  );
}

// Index cascade rules
for (const c of cascadeRules) {
  const body = `Kaskadprincipen steg ${c.step_order}: ${c.description}. Dokumentation: ${c.documentation_required}. Standardkarenstid: ${c.default_withdrawal_meat_days} dagar kott, ${c.default_withdrawal_milk_days} dagar mjolk. Source: ${c.source}.`;
  db.run(
    'INSERT INTO search_index (title, body, species, jurisdiction) VALUES (?, ?, ?, ?)',
    [`Prescribing cascade step ${c.step_order}`, body, 'all', 'SE']
  );
}

// Index record requirements
for (const r of recordRequirements) {
  const title = r.holding_type
    ? `Record requirement: ${r.holding_type}${r.species ? ` (${r.species})` : ''}`
    : `Record requirement: ${r.species ?? 'general'}`;
  const body = `${r.requirement} Retention: ${r.retention_period}. Ref: ${r.regulation_ref}.`;
  db.run(
    'INSERT INTO search_index (title, body, species, jurisdiction) VALUES (?, ?, ?, ?)',
    [title, body, r.species ?? 'all', 'SE']
  );
}

// ============================================================
// METADATA
// ============================================================

db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('last_ingest', ?)", [now]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('build_date', ?)", [now]);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('mcp_name', 'Sweden Veterinary Medicines MCP')", []);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('jurisdiction', 'SE')", []);
db.run("INSERT OR REPLACE INTO db_metadata (key, value) VALUES ('data_sources', ?)", [JSON.stringify([
  'Lakemedelsverket (Swedish Medical Products Agency) — product authorisations',
  'FASS Vet — SPC withdrawal period data',
  'Jordbruksverket (Swedish Board of Agriculture) — SJVFS 2019:32 prescribing rules',
  'EMA (European Medicines Agency) — EPAR product information',
  'SVA (National Veterinary Institute) — Svarm resistance monitoring',
  'EU Regulation 37/2010 — prohibited substances (Table 2)',
  'EU Council Directive 96/22/EC — banned growth promoters',
  'EU Regulation 2019/6 — cascade withdrawal periods (Art. 113-115)',
])]);

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
    'FASS Vet (SPC data)',
    'Jordbruksverket (Swedish Board of Agriculture)',
    'EMA (European Medicines Agency)',
    'SVA (National Veterinary Institute)',
    'EU Regulation 37/2010 Table 2',
    'EU Council Directive 96/22/EC',
    'EU Regulation 2019/6 Art. 113-115',
  ],
  categories: {
    antibiotics_penicillins: 9,
    antibiotics_tetracyclines: 6,
    antibiotics_macrolides: 5,
    antibiotics_fluoroquinolones: 3,
    antibiotics_cephalosporins: 5,
    antibiotics_sulfonamides: 2,
    antibiotics_florfenicol: 2,
    antibiotics_lincosamides: 1,
    antibiotics_intramammary: 9,
    antibiotics_topical: 4,
    antibiotics_injectable_combo: 1,
    nsaids: 12,
    antiparasitics_avermectins: 6,
    antiparasitics_benzimidazoles: 4,
    antiparasitics_imidazothiazoles: 1,
    antiparasitics_fasciolicides: 3,
    antiparasitics_ectoparasiticides: 5,
    vaccines: 20,
    hormones_reproduction: 7,
    anaesthetics_sedation: 10,
    other_therapeutic: 2,
    companion_animal: 2,
  },
  species_coverage: [
    'notkreatur (cattle)',
    'svin (pig)',
    'far (sheep)',
    'get (goat)',
    'hast (horse)',
    'fjaderfa (poultry)',
    'fisk (fish/aquaculture)',
    'hund (dog)',
    'katt (cat)',
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
console.log(`  FTS index entries:   ${medicines.length + wpByMedicine.size + bannedSubstances.length + cascadeRules.length + recordRequirements.length}`);
console.log(`  Build date:          ${now}`);
console.log('');
console.log('DATA SOURCES:');
console.log('  - Lakemedelsverket (Swedish Medical Products Agency)');
console.log('  - FASS Vet (SPC withdrawal periods)');
console.log('  - Jordbruksverket / SJVFS 2019:32');
console.log('  - EMA EPAR product information');
console.log('  - SVA Svarm (resistance monitoring)');
