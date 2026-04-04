export interface Meta {
  disclaimer: string;
  data_age: string;
  source_url: string;
  copyright: string;
  server: string;
  version: string;
}

const DISCLAIMER =
  'This data is provided for informational purposes only. It does not constitute veterinary ' +
  'medical advice. Withdrawal periods are critical for food safety — always verify against ' +
  'the current SPC (Summary of Product Characteristics) from Lakemedelsverket before making ' +
  'treatment decisions. Incorrect withdrawal periods can lead to food chain contamination. ' +
  'Data sourced from Lakemedelsverket, Jordbruksverket, and EMA publications.';

export function buildMeta(overrides?: Partial<Meta>): Meta {
  return {
    disclaimer: DISCLAIMER,
    data_age: overrides?.data_age ?? 'unknown',
    source_url: overrides?.source_url ?? 'https://www.lakemedelsverket.se/sv/behandling-och-forskrivning/djur',
    copyright: 'Data: Lakemedelsverket, Jordbruksverket, EMA. Server: Apache-2.0 Ansvar Systems.',
    server: 'se-vet-medicines-mcp',
    version: '0.1.0',
    ...overrides,
  };
}
