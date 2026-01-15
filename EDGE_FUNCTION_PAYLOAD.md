# Edge Function Payload Analysis

## What Frontend Sends to Edge Function

When clicking "Classify Product", the frontend sends:

### Location: `src/lib/supabaseFunctions.ts` (line 62-68)

```javascript
supabase.functions.invoke('python-proxy', {
  body: {
    product_description: productDescription,  // Combined text from all fields
    user_id: userId,
    confidence_threshold: threshold,  // From user metadata or default 0.75
  },
});
```

### What `productDescription` Contains:

Built in `src/components/ClassificationView.tsx` (lines 117-137):

```javascript
let productDescriptionText = query;  // Main product name/description

// Additional fields concatenated:
if (productDescription) {
  productDescriptionText += `. ${productDescription}`;
}
if (originCountry) {
  productDescriptionText += `. Country of origin: ${originCountry}`;
}
if (materials.length > 0) {
  const materialsText = materials.map(m => `${m.material} (${m.percentage}%)`).join(', ');
  productDescriptionText += `. Materials: ${materialsText}`;
}
if (unitCost) {
  productDescriptionText += `. Unit cost: ${unitCost}`;
}
if (vendor) {
  productDescriptionText += `. Vendor: ${vendor}`;
}
if (sku) {
  productDescriptionText += `. SKU: ${sku}`;
}
```

**Example payload:**
```json
{
  "product_description": "Wireless Bluetooth Speaker. High quality audio device. Country of origin: China. Materials: ABS Plastic (60%), Lithium Battery (30%), Metal (10%). Unit cost: $12.50. Vendor: TechSupply Co. SKU: WBS-001",
  "user_id": "uuid-here",
  "confidence_threshold": 0.75
}
```

---

## What Edge Function Expects

### Location: `supabase/edge-function-python-proxy.ts` (line 82-84)

The edge function expects:
```javascript
const action = body?.action as Action;  // "preprocess" | "parse" | "rules" | "rulings"
if (!action) {
  return corsResponse("Missing action", 400);
}
```

**Expected payload:**
```json
{
  "action": "preprocess" | "parse" | "rules" | "rulings",
  // ... other fields based on action
}
```

---

## ❌ MISMATCH ISSUE

**Problem:** The frontend sends:
- `product_description`
- `user_id`
- `confidence_threshold`

But the edge function expects:
- `action` (required)
- Other fields based on action

**Result:** Edge function returns `400 "Missing action"` error.

---

## Current Flow

1. **Frontend** (`ClassificationView.tsx`):
   - Builds `productDescriptionText` from all input fields
   - Calls `classifyProduct(productDescriptionText, user.id)`

2. **Frontend Service** (`supabaseFunctions.ts`):
   - Gets confidence threshold from user metadata
   - Calls edge function with: `{ product_description, user_id, confidence_threshold }`

3. **Edge Function** (`python-proxy.ts`):
   - Expects `action` field
   - Returns 400 error because `action` is missing
   - Never reaches Python backend

---

## What Should Happen

The edge function needs to be updated to handle the unified classification flow, OR the frontend needs to send an `action` field.

**Option 1:** Update edge function to handle classification without `action`:
```typescript
// If no action, assume it's a classification request
if (!action && body.product_description) {
  // Forward to Python classification endpoint
  path = "/classify";  // or whatever the Python endpoint is
}
```

**Option 2:** Frontend sends action:
```javascript
body: {
  action: "classify",  // Add this
  product_description: productDescription,
  user_id: userId,
  confidence_threshold: threshold,
}
```

---

## Summary

**Sent to Edge Function:**
- ✅ `product_description` (string) - Combined text from all fields
- ✅ `user_id` (string) - User UUID
- ✅ `confidence_threshold` (number) - Default 0.75 or from user metadata
- ❌ `action` (MISSING) - Edge function requires this

**Edge Function Expects:**
- ✅ `action` (required) - "preprocess" | "parse" | "rules" | "rulings"
- ❌ `product_description` (not handled in current flow)
- ❌ `user_id` (not handled in current flow)
- ❌ `confidence_threshold` (not handled in current flow)

