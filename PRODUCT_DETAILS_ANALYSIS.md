# Product Details Modal - Hardcoded vs Database Analysis

## ✅ Data Coming from Database

The following fields are fetched from the database and displayed in ProductDetailsModal:

### From `user_products` table:
- ✅ **Product Name** (`product.name`) - from `product_name`
- ✅ **SKU** (`product.sku`) - generated as `PROD-${product.id}` from `user_products.id`
- ✅ **Materials & Composition** (`product.materials`) - from `materials` (JSONB, formatted as string)
- ✅ **Country of Origin** (`product.origin`) - from `country_of_origin`
- ✅ **Unit Cost** (`product.cost`) - from `unit_cost` (formatted as currency)
- ✅ **Vendor** (`product.vendor`) - from `vendor`
- ✅ **Last Updated** (`product.lastUpdated`) - from `user_product_profiles.updated_at` or `user_product_classification_results.classified_at`

### From `user_product_classification_results` table:
- ✅ **HTS Code** (`product.hts`) - from `hts_classification`
- ✅ **Confidence** (`product.confidence`) - from `confidence` (converted to percentage)
- ✅ **Standard Tariff Rate** (`product.tariffRate`) - from `tariff_rate`
- ✅ **Tariff Amount** (`product.tariffAmount`) - from `tariff_amount`
- ✅ **Total Cost** (`product.totalCost`) - from `total_cost` (or calculated from unit_cost + tariff_amount)
- ✅ **Alternate Classification** (`product.alternateClassification`) - from `alternate_classification` (single value only)

---

## ❌ HARDCODED Data (Not from Database)

### 1. **HTS Code Descriptions** (Lines 48-94)
   - **Chapter descriptions** (e.g., "85 — Electrical machinery and equipment")
   - **Heading descriptions** (e.g., "8518 — Loudspeakers, headphones, microphones")
   - **Subheading descriptions** (e.g., "8518.22 — Multiple loudspeakers, mounted in the same enclosure")
   - **Status:** HARDCODED with conditional logic based on HTS code prefix
   - **TODO:** Should come from `hts_code_lookup` table (doesn't exist yet) or `hts_description` field

### 2. **Classification History** (Lines 188-198)
   - **"Classified by AI Agent"** text - hardcoded
   - **Status:** HARDCODED
   - **TODO:** Should have a field in `user_product_classification_results` for `classifier_type` or `classified_by`

### 3. **Full Classification Reasoning Section** (Lines 200-377)
   All content in this section is HARDCODED:

   #### a. **Classification Decision** (Lines 210-233)
      - Reasoning text: "HTS Code {product.hts} was selected based on..."
      - Chapter descriptions (same as #1 above)
      - **Status:** HARDCODED
      - **TODO:** Should come from `reasoning` or `rationale` field in `user_product_classification_results`

   #### b. **General Rules of Interpretation (GRI)** (Lines 235-261)
      - GRI 1 and GRI 3(a) explanations
      - **Status:** HARDCODED
      - **TODO:** Should come from `gri_rules_applied` field (JSONB array) or `reasoning` field

   #### c. **Material Composition Analysis** (Lines 263-276)
      - Analysis text: "Material composition has been verified..."
      - Uses `product.materials` from DB but analysis text is hardcoded
      - **Status:** HARDCODED (text is hardcoded, data is from DB)
      - **TODO:** Should come from `material_analysis` field or be part of `reasoning`

   #### d. **Country of Origin Impact** (Lines 278-306)
      - Analysis text about country of origin impact
      - "Special tariff programs may apply" - hardcoded
      - Uses `product.origin` and `product.tariffRate` from DB but analysis is hardcoded
      - **Status:** HARDCODED (text is hardcoded, data is from DB)
      - **TODO:** Should come from `origin_analysis` field or be part of `reasoning`

   #### e. **Alternative Classifications Considered** (Lines 308-325)
      - Alternative HTS codes are generated from main HTS (e.g., `{product.hts.substring(0, 4)}.XX.XXXX`)
      - Rejection reasons are hardcoded: "Product characteristics do not match..."
      - **Status:** HARDCODED
      - **TODO:** Should come from `alternate_classifications` field (JSONB array) in `user_product_classification_results` with rejection reasons

   #### f. **Supporting Documentation** (Lines 327-347)
      - List of documents: "Product specification sheet", "Material composition certificate", etc.
      - **Status:** HARDCODED
      - **TODO:** Should come from `user_product_documents` table - fetch actual documents for this product

   #### g. **Compliance Notes** (Lines 349-363)
      - "Customs Validation Notes" text
      - **Status:** HARDCODED
      - **TODO:** Should come from `compliance_notes` field or be configurable

---

## Summary

### Database Fields Used:
- `user_products`: `product_name`, `materials`, `country_of_origin`, `unit_cost`, `vendor`, `id`
- `user_product_classification_results`: `hts_classification`, `confidence`, `tariff_rate`, `tariff_amount`, `total_cost`, `alternate_classification`, `classified_at`
- `user_product_profiles`: `updated_at`

### Missing Database Fields/Tables Needed:
1. ❌ `hts_code_lookup` table (or `hts_description` field) - for HTS code descriptions
2. ❌ `reasoning` or `rationale` field - for classification reasoning text
3. ❌ `gri_rules_applied` field (JSONB) - for GRI rules used
4. ❌ `alternate_classifications` field (JSONB array) - for alternate HTS codes with rejection reasons
5. ❌ `classifier_type` or `classified_by` field - for who/what classified it
6. ❌ `user_product_documents` table query - to fetch actual documents
7. ❌ `compliance_notes` field - for compliance validation notes

### Recommendation:
- Mark all hardcoded sections with visible "HARDCODED" badges in the UI (similar to ExceptionReview)
- Add TODO comments in code indicating what database fields/tables are needed
- Consider fetching from `user_product_documents` table for supporting documentation section

