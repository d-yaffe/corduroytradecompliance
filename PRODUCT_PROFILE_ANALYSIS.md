# Product Profile Pages - Hardcoded vs Database Analysis

## Three Views:
1. **ProductProfile.tsx** - Main page with product list and selected product details panel
2. **ProductDetailsModal.tsx** - "View Full Details" modal
3. **AddProductModal.tsx** - "Edit Product" modal

---

## 1. ProductProfile.tsx (Selected Product Panel - Right Side)

### ✅ FROM DATABASE:
- **Product Name** - from `user_products.product_name`
- **SKU** - generated from `user_products.id` (PROD-{id})
- **HTS Code** - from `user_product_classification_results.hts_classification`
- **Confidence** - from `user_product_classification_results.confidence`
- **Last Updated** - from `user_product_profiles.updated_at` or `user_product_classification_results.classified_at`
- **Materials** - from `user_products.materials` (JSONB)
- **Country of Origin** - from `user_products.country_of_origin`
- **Unit Cost** - from `user_products.unit_cost` or `user_product_classification_results.unit_cost`
- **Vendor** - from `user_products.vendor`
- **Tariff Rate** - from `user_product_classification_results.tariff_rate`
- **Tariff Amount** - from `user_product_classification_results.tariff_amount`
- **Total Cost** - from `user_product_classification_results.total_cost`
- **Alternate Classification** - from `user_product_classification_results.alternate_classification`

### ❌ HARDCODED:
1. **HTS Chapter/Heading/Subheading Descriptions** (lines 485-532)
   - Chapter descriptions (e.g., "85 — Electrical machinery and equipment")
   - Heading descriptions (e.g., "8518 — Loudspeakers, headphones, microphones")
   - Subheading descriptions (e.g., "8518.22 — Multiple loudspeakers...")
   - **Status:** Hardcoded with conditional logic
   - **TODO:** Should come from `hts_code_lookup` table or `hts_description` field

2. **"Classified by AI Agent" text** (line 621)
   - **Status:** Hardcoded
   - **TODO:** Should come from `classifier_type` or `classified_by` field in `user_product_classification_results`

---

## 2. ProductDetailsModal.tsx ("View Full Details" Modal)

### ✅ FROM DATABASE:
- Product Name, SKU, Description
- HTS Code, Confidence, Last Updated
- Materials, Origin, Cost, Vendor
- Tariff Rate, Tariff Amount, Total Cost, Alternate Classification
- **Documents** - from `user_product_documents` table (NOW FETCHED FROM DB)

### ❌ HARDCODED:
1. **HTS Chapter/Heading/Subheading Descriptions** - Same as ProductProfile
2. **"Classified by AI Agent" text** - Same as ProductProfile
3. **Full Classification Reasoning Section** - Entire section hardcoded:
   - Classification Decision reasoning
   - GRI rules explanations
   - Material Composition Analysis text
   - Country of Origin Impact text
   - Alternative Classifications Considered (generated, not from DB)
   - Compliance Notes text

---

## 3. AddProductModal.tsx ("Edit Product" Modal)

### ✅ FROM DATABASE (when editing):
- Product Name, SKU, Description
- Materials, Origin, Cost, Vendor
- HTS Code, Confidence (when editing existing product)

### ❌ HARDCODED:
1. **AI Classification Simulation** (lines 29-43)
   - `handleClassify()` function simulates classification with hardcoded values:
     - HTS: '8517.62.0050'
     - Confidence: 96
     - Description: 'Machines for the reception...'
     - Tariff: '0% (Free)'
   - **Status:** Hardcoded simulation
   - **TODO:** Should call actual `classifyProduct()` API from `supabaseFunctions.ts`

2. **Country Dropdown List** (lines 163-172)
   - Hardcoded list: China, Mexico, Canada, Vietnam, India, South Korea, Japan, Germany, United States
   - **Status:** Hardcoded
   - **TODO:** Should fetch from database or use a country API/library

3. **Classification Result Display** (lines 220-244)
   - Shows hardcoded classification values from simulation
   - **Status:** Hardcoded (depends on #1)

---

## Summary

### Database Fields Used:
- ✅ `user_products`: `product_name`, `product_description`, `country_of_origin`, `materials`, `unit_cost`, `vendor`
- ✅ `user_product_classification_results`: `hts_classification`, `alternate_classification`, `confidence`, `tariff_rate`, `tariff_amount`, `total_cost`, `classified_at`
- ✅ `user_product_profiles`: `updated_at`
- ✅ `user_product_documents`: `document_type`, `file_name`, `file_type`, `file_url`, `uploaded_at` (NOW FETCHED)

### Missing Database Fields/Tables:
1. ❌ `hts_code_lookup` table - for HTS descriptions
2. ❌ `classifier_type` or `classified_by` field - for who/what classified
3. ❌ `reasoning` or `rationale` field - for classification reasoning
4. ❌ `alternate_classifications` (JSONB array) - for multiple alternates with full data
5. ❌ Countries table - for country dropdown

### Critical Issues:
1. **AddProductModal** - Classification is completely simulated/hardcoded, not calling real API
2. **Country dropdown** - Hardcoded list instead of dynamic
3. **HTS descriptions** - Hardcoded in all three views
4. **Classification reasoning** - Entire section hardcoded in ProductDetailsModal

