# Vendor Payments Dashboard — Implementation Plan

## Project Goal

Build a frontend dashboard application that:

- Loads and parses large vendor payment CSV datasets
- Normalizes and structures the data
- Supports reactive filtering
- Displays aggregated metrics and charts
- Handles large datasets efficiently
- Provides a clean and responsive UI

Tech stack:

- Vue 3
- TypeScript
- Vuetify
- Pinia
- ApexCharts
- Papa Parse

---

# 1. Install Remaining Dependencies

```bash
npm install vue3-apexcharts pinia
```

If TypeScript complains about missing module definitions:

Create:

```text
src/types/shims.d.ts
```

Example:

```ts
declare module 'vue3-apexcharts'
```

---

# 2. Recommended Folder Structure

```text
src/
  components/
    charts/
      AgencySpendChart.vue
      VendorSpendChart.vue
      CategoryBreakdownChart.vue

    filters/
      DashboardFilters.vue

    stats/
      StatsCards.vue

    tables/
      PaymentsTable.vue

  composables/
    useAggregations.ts
    useFiltering.ts

  services/
    csvService.ts
    normalization.ts

  stores/
    dashboardStore.ts

  types/
    vendorPayment.ts

  views/
    DashboardView.vue
```

---

# 3. Define Core Data Type

## `types/vendorPayment.ts`

```ts
export interface VendorPayment {
  date: Date
  month: number

  agency: string
  agencyCode?: string

  objectCode: string
  category: string

  subObjectCode: string
  subCategory: string

  vendor: string
  amount: number
}
```

---

# 4. Create CSV Parsing Service

## `services/csvService.ts`

Responsibilities:

- Fetch CSV
- Parse CSV
- Normalize rows
- Return typed records

Use Papa Parse configuration:

```ts
{
  header: true,
  worker: true,
  skipEmptyLines: true
}
```

Suggested flow:

```text
fetch csv
   ↓
Papa.parse
   ↓
normalize row
   ↓
return VendorPayment[]
```

---

# 5. Normalize Immediately After Parse

## `services/normalization.ts`

Normalization responsibilities:

- Convert dates → `Date`
- Convert amounts → `number`
- Trim whitespace
- Standardize capitalization
- Remove currency symbols and commas

Example:

```ts
amount: Number(row.Amount.replace(/[$,]/g, ''))
```

This is the:

- parse once
- normalize once

step.

---

# 6. Create Central Store (Pinia)

## `stores/dashboardStore.ts`

Store responsibilities:

### State

```ts
rawPayments: VendorPayment[]
loading: boolean
```

### Filters

```ts
filters:
  agencies: string[]
  vendors: string[]
  categories: string[]
  subcategories: string[]
  months: number[]
```

### Getters / Computed Values

```ts
filteredPayments
totalSpend
totalEntries
groupedAgencyTotals
groupedVendorTotals
```

This becomes the single source of truth for the dashboard.

---

# 7. Build Metadata Sets During Load

Create unique value sets during CSV ingestion.

Examples:

```ts
new Set(payments.map(p => p.agency))
```

Generate:

- Agency options
- Vendor options
- Category options
- Subcategory options

Store them once.

Avoid recomputing them during rendering.

---

# 8. Filtering Strategy

## `useFiltering.ts`

Create a centralized filtering pipeline.

Example:

```ts
filtered = rawPayments.filter(...)
```

Filtering dimensions:

- Agency
- Category
- Subcategory
- Vendor
- Month
- Amount range

Keep filtering logic out of UI components.

---

# 9. Aggregation Strategy

## `useAggregations.ts`

Create reusable aggregation functions.

Examples:

```ts
groupByAgency()
groupByVendor()
groupByCategory()
groupByMonth()
```

Use efficient accumulators:

```ts
totals[agency] ??= 0
totals[agency] += amount
```

Use computed properties for memoization where appropriate.

---

# 10. Dashboard Layout

## `views/DashboardView.vue`

Suggested layout:

```text
--------------------------------
Top Toolbar
--------------------------------
Filter Sidebar | Main Content
               |
               | KPI Cards
               |
               | Charts Grid
               |
               | Data Table
--------------------------------
```

---

# 11. KPI Cards

## `StatsCards.vue`

Reactive KPI cards:

- Total spend
- Total records
- Average payment
- Total vendors
- Total agencies

Use:

- `v-card`
- Responsive grid layout

---

# 12. Filters Component

## `DashboardFilters.vue`

Suggested Vuetify components:

- `v-select`
- `v-autocomplete`
- `v-range-slider`

Suggested filters:

- Agency
- Category
- Subcategory
- Vendor
- Month
- Amount range

Bind filters directly to Pinia store state.

---

# 13. Charts

## Suggested Charts

### Spend By Agency

- Horizontal bar chart

### Spend Over Time

- Line chart

### Category Breakdown

- Donut chart

### Top Vendors

- Bar chart

Guidelines:

- Keep charts simple
- Ensure charts are reactive
- Prioritize readability

---

# 14. Payments Table

## `PaymentsTable.vue`

Avoid rendering the full dataset directly if extremely large.

Options:

- Pagination
- Virtualization

For assignment scope, Vuetify pagination is likely sufficient.

Suggested columns:

- Date
- Agency
- Category
- Vendor
- Amount

---

# 15. Add Loading State

Large CSVs may take time to process.

Add:

- Spinner
- Progress bar
- Loading message

Example:

```text
Loading fiscal records...
```

---

# 16. Add Error Handling

Handle:

- Failed CSV fetch
- Malformed rows
- Invalid amounts
- Missing columns

Keep error messaging simple and readable.

---

# 17. Add CSV Export (Bonus Feature)

Allow exporting the currently filtered dataset.

Suggested flow:

```text
filteredPayments
   ↓
convert to csv
   ↓
download blob
```

This is a strong polish feature for relatively low implementation effort.

---

# 18. Hybrid Data File Strategy

Recommended workflow:

## During Development

Use:

- Local CSV copy

Benefits:

- Faster reloads
- Stable testing
- Avoids CORS issues

## Final Version

Support:

- Remote CSV URL loading
- Local file upload

This demonstrates flexibility and practical UX considerations.

---

# 19. Suggested Development Order

## Phase 1

- CSV loading
- Parsing
- Normalization
- Display raw table

## Phase 2

- Filters
- Filtered table

## Phase 3

- Aggregations
- KPI cards

## Phase 4

- Charts

## Phase 5

- Loading states
- Error handling
- CSV export
- Responsive polish

This phased approach reduces debugging complexity.

---

# 20. Performance Considerations

Recommended strategy:

- Parse once
- Normalize once
- Memoize where appropriate
- Use centralized filtering
- Avoid repeated rescanning of datasets
- Avoid unnecessary rerenders

For assignment scope:

- Raw filtering against the normalized dataset is acceptable
- Full indexing systems are likely unnecessary

---

# 21. Interview Focus Areas

Most likely evaluation criteria:

- Clean organization
- State management
- Clear data flow
- Performance awareness
- Responsive UI
- Readable code
- Component separation
- Handling large datasets gracefully

Likely less important:

- Highly custom chart engineering
- Backend complexity
- Enterprise-scale architecture
- Advanced D3 visualizations

Focus on:

- Clarity
- Responsiveness
- Reliability
- Maintainability

