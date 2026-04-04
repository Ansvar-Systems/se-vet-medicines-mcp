import { buildMeta } from '../metadata.js';
import { SUPPORTED_JURISDICTIONS } from '../jurisdiction.js';

export function handleAbout() {
  return {
    name: 'Sweden Veterinary Medicines MCP',
    description:
      'Swedish veterinary medicine data: authorised products, withdrawal periods, banned substances, ' +
      'prescribing cascade rules, and record-keeping requirements. Covers food-producing and companion ' +
      'animals under Swedish (Lakemedelsverket/Jordbruksverket) and EU regulations.',
    version: '0.1.0',
    jurisdiction: [...SUPPORTED_JURISDICTIONS],
    data_sources: [
      'Lakemedelsverket (Swedish Medical Products Agency)',
      'Jordbruksverket (Swedish Board of Agriculture)',
      'EMA (European Medicines Agency) — Union Product Database',
    ],
    tools_count: 10,
    links: {
      homepage: 'https://ansvar.eu/open-agriculture',
      repository: 'https://github.com/ansvar-systems/se-vet-medicines-mcp',
      mcp_network: 'https://ansvar.ai/mcp',
    },
    _meta: buildMeta(),
  };
}
