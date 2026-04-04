# Sweden Veterinary Medicines MCP

Swedish veterinary medicine data: authorised products, withdrawal periods, banned substances, prescribing cascade rules, and record-keeping requirements. Query Swedish veterinary medicine data through the [Model Context Protocol](https://modelcontextprotocol.io).

> **Data sources:** Lakemedelsverket (Swedish Medical Products Agency), Jordbruksverket (Swedish Board of Agriculture), EMA (European Medicines Agency). Licensed under applicable Swedish open data terms.

## Quick Start

### Claude Desktop / Claude Code

```json
{
  "mcpServers": {
    "se-vet-medicines": {
      "command": "npx",
      "args": ["-y", "@ansvar/se-vet-medicines-mcp"]
    }
  }
}
```

### Streamable HTTP (Docker)

```
https://mcp.ansvar.eu/se-vet-medicines/mcp
```

## Tools

| Tool | Description |
|------|-------------|
| `about` | Get server metadata: name, version, coverage, data sources, and links. |
| `list_sources` | List all data sources with authority, URL, license, and freshness info. |
| `check_data_freshness` | Check when data was last ingested, staleness status, and how to trigger a refresh. |
| `search_authorised_medicines` | Search Swedish authorised veterinary medicines by name, species, substance, or pharmaceutical form. |
| `get_medicine_details` | Get full details for a specific veterinary medicine: substances, species, form, holder, SPC link, and withdrawal periods. |
| `get_withdrawal_period` | Get withdrawal period for a medicine in a specific species and product type. |
| `check_cascade_rules` | Get the Swedish veterinary prescribing cascade hierarchy when no authorised product exists. |
| `get_medicine_record_requirements` | Get record-keeping requirements for veterinary medicine treatments (stalljournal, retention periods). |
| `search_by_active_substance` | Find all medicines containing a specific active substance. Also checks ban status for food-producing animals. |
| `get_banned_substances` | List substances banned for use in food-producing animals under Swedish and EU regulations. |

## Example Queries

- "Vilka veterinarlakemedel ar godkanda for notkreatur i Sverige?" (What veterinary medicines are authorised for cattle in Sweden?)
- "What is the withdrawal period for Metacam in dairy cows?"
- "Vilka substanser ar forbjudna for livsmedelsproducerande djur?" (Which substances are banned for food-producing animals?)
- "Show the prescribing cascade rules for horses in Sweden"

## Stats

| Metric | Value |
|--------|-------|
| Jurisdiction | SE (Sweden) |
| Tools | 10 |
| Transport | stdio + Streamable HTTP |
| License | Apache-2.0 |

## Links

- [Ansvar MCP Network](https://ansvar.eu/open-agriculture)
- [GitHub](https://github.com/ansvar-systems/se-vet-medicines-mcp)
- [All Swedish Agriculture MCPs](https://mcp.ansvar.eu)
