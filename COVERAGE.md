# Coverage

## What Is Included

- **Authorised veterinary medicines** -- Product names, registration numbers, active substances, authorised species, pharmaceutical forms, legal categories, marketing authorisation holders
- **Withdrawal periods** -- Species-specific withdrawal periods for meat, milk, eggs, and honey; zero-day withdrawal flags
- **Banned substances** -- Prohibited substances for food-producing animals with category, species applicability, and regulation references
- **Prescribing cascade rules** -- Step-by-step cascade hierarchy with default withdrawal periods and documentation requirements
- **Record-keeping requirements** -- Medicine record obligations by holding type and species, including retention periods and regulatory references
- **Full-text search** -- Tiered FTS5 search across medicines, active substances, and species (phrase, AND, prefix, stemmed, OR, LIKE fallback)

## Jurisdictions

| Code | Country | Status |
|------|---------|--------|
| SE | Sweden | Supported |

## Data Sources

| Source | Authority | Coverage |
|--------|-----------|----------|
| Lakemedelsverket | Swedish Medical Products Agency | Authorised veterinary medicines, SPCs, withdrawal periods |
| Jordbruksverket | Swedish Board of Agriculture | Prescribing cascade, record requirements, banned substances |
| EMA Union Product Database | European Medicines Agency | Centrally authorised veterinary medicines valid in Sweden |

## What Is NOT Included

- **Companion animal medicines** -- Focus is food-producing animals (cattle, pigs, poultry, sheep, goats, fish)
- **Human medicines** -- Veterinary products only
- **Real-time SPC updates** -- Data is a snapshot; always verify against current SPC from Lakemedelsverket
- **Dosage calculations** -- This provides regulatory data, not clinical dosing advice
- **Antimicrobial resistance data** -- Not included; see Swedres-Svarm for Swedish AMR surveillance
- **Other Nordic countries** -- Sweden only; Denmark (VetStat), Norway (NFSA), Finland (Fimea) are not covered

## Known Gaps

1. Medicine register depends on Lakemedelsverket publication schedule -- quarterly updates
2. Some centrally authorised EU products may have Swedish-specific conditions not yet captured
3. FTS5 search quality varies with query phrasing -- use Swedish product names or active substance names for best results
4. Cascade rule documentation requirements are summarised, not verbatim regulatory text

## Data Freshness

Run `check_data_freshness` to see when data was last updated. Staleness threshold is 90 days. Manual refresh: `gh workflow run ingest.yml`.
