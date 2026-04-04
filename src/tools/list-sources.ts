import { buildMeta } from '../metadata.js';
import type { Database } from '../db.js';

interface Source {
  name: string;
  authority: string;
  official_url: string;
  retrieval_method: string;
  update_frequency: string;
  license: string;
  coverage: string;
  last_retrieved?: string;
}

export function handleListSources(db: Database): { sources: Source[]; _meta: ReturnType<typeof buildMeta> } {
  const lastIngest = db.get<{ value: string }>('SELECT value FROM db_metadata WHERE key = ?', ['last_ingest']);

  const sources: Source[] = [
    {
      name: 'Lakemedelsverket — Veterinary Medicines Register',
      authority: 'Swedish Medical Products Agency (Lakemedelsverket)',
      official_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta',
      retrieval_method: 'MANUAL_EXTRACTION',
      update_frequency: 'quarterly',
      license: 'Swedish public records (offentlighetsprincipen)',
      coverage: 'All veterinary medicines authorised in Sweden: products, active substances, species, withdrawal periods',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Jordbruksverket — Veterinary Prescribing and Record Regulations',
      authority: 'Swedish Board of Agriculture (Jordbruksverket)',
      official_url: 'https://jordbruksverket.se/djur/djurhalsa',
      retrieval_method: 'MANUAL_EXTRACTION',
      update_frequency: 'annual',
      license: 'Swedish public records (offentlighetsprincipen)',
      coverage: 'Prescribing cascade rules, record-keeping requirements, banned substances for food-producing animals',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'EMA — Union Product Database',
      authority: 'European Medicines Agency',
      official_url: 'https://medicines.health.europa.eu/veterinary',
      retrieval_method: 'MANUAL_EXTRACTION',
      update_frequency: 'quarterly',
      license: 'EMA Open Data',
      coverage: 'Centrally authorised veterinary medicines valid across EU member states including Sweden',
      last_retrieved: lastIngest?.value,
    },
  ];

  return {
    sources,
    _meta: buildMeta({ source_url: 'https://www.lakemedelsverket.se/sv/sok-lakemedelsfakta' }),
  };
}
