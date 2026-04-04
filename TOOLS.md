# Tools Reference

## Meta Tools

### `about`

Get server metadata: name, version, coverage, data sources, and links.

**Parameters:** None

**Returns:** Server name, version, jurisdiction list, data source names, tool count, homepage/repository links.

---

### `list_sources`

List all data sources with authority, URL, license, and freshness info.

**Parameters:** None

**Returns:** Array of 3 sources (Lakemedelsverket, Jordbruksverket, EMA), each with `name`, `authority`, `official_url`, `retrieval_method`, `update_frequency`, `license`, `coverage`, `last_retrieved`.

---

### `check_data_freshness`

Check when data was last ingested, staleness status, and how to trigger a refresh.

**Parameters:** None

**Returns:** `status` (fresh/stale/unknown), `last_ingest`, `build_date`, `schema_version`, `days_since_ingest`, `staleness_threshold_days` (90), `refresh_command`.

---

## Domain Tools

### `search_authorised_medicines`

Search veterinary medicines by name, active substance, species, or pharmaceutical form. Uses tiered FTS5 search with SQL fallback.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Free-text search (product name, active substance, species) |
| `species` | string | No | Filter by authorised species (e.g. "cattle", "pig") |
| `pharmaceutical_form` | string | No | Filter by pharmaceutical form |
| `active_substance` | string | No | Filter by active substance name |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |
| `limit` | number | No | Max results (default: 20, max: 50) |

**Returns:** `results_count`, array of results with `title`, `body`, `species`, `relevance_rank`. Falls back to direct SQL search if FTS returns no results.

**Example:** `{ "query": "amoxicillin cattle" }`

---

### `get_medicine_details`

Get full product details for a specific medicine by ID, including associated withdrawal periods.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `medicine_id` | string | Yes | Medicine ID (from search results) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |

**Returns:** Product name, registration number, active substances (array), species authorised (array), pharmaceutical form, legal category, MA holder, SPC URL, status, jurisdiction, and `withdrawal_periods` array with species, product type, period days, notes, zero-day flag.

**Example:** `{ "medicine_id": "vet-se-001" }`

---

### `get_withdrawal_period`

Get withdrawal period for a specific medicine, species, and product type combination.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `medicine_id` | string | Yes | Medicine ID |
| `species` | string | Yes | Target species (e.g. "cattle", "pig") |
| `product_type` | string | No | Product type (e.g. "meat", "milk") |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |

**Returns:** Medicine name, species, withdrawal periods with `period_days`, `product_type`, `notes`, `zero_day_allowed`. If no specific period found, returns available combinations and cascade default warning (28 days meat, 7 days milk).

**Example:** `{ "medicine_id": "vet-se-001", "species": "cattle", "product_type": "milk" }`

---

### `check_cascade_rules`

Get the prescribing cascade hierarchy. The cascade must be followed in order when no suitable authorised product exists.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `species` | string | Yes | Target species |
| `condition` | string | No | Clinical condition (informational context) |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |

**Returns:** `cascade_hierarchy` array ordered by `step_order`, each with `description`, `documentation_required`, `default_withdrawal` (meat_days, milk_days), `source`. Includes guidance and warning text about cascade prescribing requirements.

**Example:** `{ "species": "cattle", "condition": "mastitis" }`

---

### `get_medicine_record_requirements`

Get medicine record-keeping requirements by species and/or holding type.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `species` | string | No | Filter by species |
| `holding_type` | string | No | Filter by holding type (e.g. "dairy", "beef") |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |

**Returns:** `requirements_count`, array of requirements with `holding_type`, `species`, `requirement`, `retention_period`, `regulation_ref`.

**Example:** `{ "species": "cattle", "holding_type": "dairy" }`

---

### `search_by_active_substance`

Search medicines by active substance name. Also checks if the substance is banned.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `active_substance` | string | Yes | Active substance name or partial match |
| `species` | string | No | Filter by authorised species |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |

**Returns:** `results_count`, medicine results with full product details, plus `banned_substance_matches` if any bans match the queried substance.

**Example:** `{ "active_substance": "enrofloxacin", "species": "cattle" }`

---

### `get_banned_substances`

Get list of banned substances for food-producing animals, optionally filtered by species or production type.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `species` | string | No | Filter by species |
| `production_type` | string | No | Filter by production type |
| `jurisdiction` | string | No | ISO 3166-1 alpha-2 code (default: SE) |

**Returns:** `total_banned`, array of substances with `substance`, `category`, `applies_to`, `regulation_ref`. Includes warning about mandatory reporting on detection.

**Example:** `{ "species": "cattle" }`
