# Gateway/Record Block - Analysis & Design

## Overview
Create a single-record fetching block that integrates with dynamic routing to display individual course/lesson/post details.

## Current Data Fetching Infrastructure

### 1. **Data Package (`/react/packages/data/`)**

#### Available API Functions (`collectionApi.js`):
```javascript
// Fetch single record by ID
fetchRecord(namespace, route, id, options)
// Returns: Promise<Object>
// Example: fetchRecord('gateway/v1', 'courses', 123)
```

**Finding:** ❌ **No native slug-based fetching exists**
- Only supports fetching by numeric ID
- API endpoint: `GET /gateway/v1/courses/123`

#### React Hook (`useRecord.js`):
```javascript
const { record, loading, error, update, remove } = useRecord(recordId);
```

**Limitation:** Designed for React/CollectionProvider context, not Interactivity API

### 2. **data-source Block** (Multiple Records)

**How it works:**
1. Fetches collection info: `/wp-json/gateway/v1/collections/{slug}`
2. Gets endpoint from collection info
3. Fetches all records from endpoint
4. Stores in context as `items` array
5. Child blocks access via `context.items`

**Key Pattern:**
```javascript
// view.js
const collectionInfo = await fetch(`/wp-json/gateway/v1/collections/${collectionSlug}`);
const endpoint = collectionInfo.routes?.endpoint;
const response = await fetch(endpoint);
context.items = response.data?.items || [];
```

## Design: gateway/record Block

### Core Requirements

1. **Fetch single record** (not array)
2. **Support dynamic routing** - read slug/id from route params
3. **Support static mode** - manually specify record id/slug
4. **Set context** for child blocks to access record fields
5. **Handle loading/error states**

### Lookup Strategies

Since there's no native slug-based API endpoint, we have **two approaches**:

#### **Option A: Fetch All + Filter by Slug** (Recommended for MVP)
```javascript
// Fetch all records from collection
const response = await fetch(endpoint);
const items = response.data?.items || [];

// Filter to find record by slug
const record = items.find(item => item.slug === targetSlug);
```

**Pros:**
- Works immediately without backend changes
- Simple to implement
- Utilizes existing collection endpoints

**Cons:**
- Fetches all records (performance concern for large collections)
- Client-side filtering

#### **Option B: API Query Parameter** (Future Enhancement)
```javascript
// Use query params to filter server-side
const response = await fetch(`${endpoint}?slug=${targetSlug}`);
const record = response.data?.items?.[0];
```

**Requires:** Backend support for query filtering (may already exist)

**Pros:**
- Server-side filtering
- Only fetches needed record
- Better performance

**Cons:**
- Need to verify backend support
- May require API enhancements

### Block Attributes

```json
{
  "collectionSlug": {
    "type": "string",
    "default": ""
  },
  "recordId": {
    "type": "string",
    "default": ""
  },
  "recordSlug": {
    "type": "string",
    "default": ""
  },
  "lookupField": {
    "type": "string",
    "default": "id",
    "enum": ["id", "slug"]
  },
  "useRouteParam": {
    "type": "boolean",
    "default": true
  },
  "routeParamName": {
    "type": "string",
    "default": "slug"
  },
  "namespace": {
    "type": "string",
    "default": "gateway/record"
  }
}
```

### Context Schema

```javascript
{
  collectionSlug: "courses",
  record: {
    id: 1,
    slug: "web-development",
    title: "Web Development Fundamentals",
    // ... all record fields
  },
  loading: false,
  error: null,
  notFound: false
}
```

### Usage Examples

#### Example 1: Dynamic Route with Slug
```
Router Block
└─ Route Block (path="/course/:courseSlug")
   └─ Record Block
      - collectionSlug: "courses"
      - useRouteParam: true
      - routeParamName: "courseSlug"
      - lookupField: "slug"
      └─ Bound String (field: "title")
      └─ Bound String (field: "description")
```

**Flow:**
1. User navigates to `/course/web-development`
2. Router extracts `courseSlug = "web-development"`
3. Record block reads from `getRouteParam('courseSlug')`
4. Fetches collection, finds record where `slug === "web-development"`
5. Sets context.record for child blocks

#### Example 2: Static Record by ID
```
Record Block
- collectionSlug: "courses"
- recordId: "123"
- useRouteParam: false
- lookupField: "id"
```

#### Example 3: Multiple Dynamic Params
```
Route (path="/course/:courseSlug/lesson/:lessonSlug")
└─ Record Block (Course)
   - collectionSlug: "courses"
   - routeParamName: "courseSlug"
   └─ Record Block (Lesson)
      - collectionSlug: "lessons"
      - routeParamName: "lessonSlug"
```

## Implementation Plan

### Phase 1: MVP with Client-Side Filtering ✅
1. Create block structure
2. Import router helpers: `getRouteParam()`
3. Fetch collection info
4. Fetch all records
5. Filter by slug or ID client-side
6. Set context for child blocks

### Phase 2: Optimization (Future)
1. Check if API supports query params
2. Add server-side filtering option
3. Add caching to avoid re-fetching
4. Add refresh action

## File Structure

```
/react/block-types/src/blocks/record/
├── block.json          # Block configuration
├── index.js            # Edit component (editor)
├── view.js             # Frontend interactivity
├── editor.css          # Editor styles
└── style.css           # Frontend styles
```

## Key Integration Points

### 1. Router Integration
```javascript
import { getRouteParam } from '../router/view.js';

const paramValue = getRouteParam('courseSlug');
```

### 2. Collection Info API
```javascript
const collectionInfo = await fetch(`/wp-json/gateway/v1/collections/${collectionSlug}`);
const endpoint = collectionInfo.routes?.endpoint;
```

### 3. Record Lookup
```javascript
// Determine lookup value
const lookupValue = useRouteParam
  ? getRouteParam(routeParamName)
  : (lookupField === 'slug' ? recordSlug : recordId);

// Fetch and filter
const response = await fetch(endpoint);
const items = response.data?.items || [];
const record = items.find(item => item[lookupField] === lookupValue);
```

## Testing Strategy

### Test Case 1: Dynamic Route
1. Create Router with route `/course/:courseSlug`
2. Add Record block inside route
3. Configure: collectionSlug="courses", useRouteParam=true
4. Navigate to `/course/test-course`
5. Verify console logs show record fetching
6. Verify child blocks can access `context.record`

### Test Case 2: Static Record
1. Add Record block (no router)
2. Configure: collectionSlug="courses", recordId="1", useRouteParam=false
3. Verify record loads on page load
4. Verify child blocks display record data

### Test Case 3: Not Found
1. Navigate to `/course/nonexistent-slug`
2. Verify `context.notFound = true`
3. Verify error handling displays appropriately

## Console Logging Strategy

Add focused logs similar to router:
```javascript
console.log(`[Record] 🔍 Fetching record:`, {
  collection: collectionSlug,
  lookupField,
  lookupValue,
  source: useRouteParam ? 'route param' : 'static'
});

console.log(`[Record] ✅ Record loaded:`, {
  id: record.id,
  slug: record.slug,
  title: record.title
});

console.log(`[Record] ❌ Record not found:`, {
  lookupField,
  lookupValue
});
```

## Open Questions

1. **Backend Query Support:** Does the Gateway API already support `?slug=X` or `?filter[slug]=X` query params?
2. **Caching:** Should we cache fetched records to avoid re-fetching on route changes?
3. **Field Definitions:** Should we use collection field definitions for validation/type safety?
4. **Nested Records:** How to handle fetching related records (e.g., course has lessons)?

## Next Steps

1. ✅ Complete analysis
2. ⏭️ Create block.json
3. ⏭️ Implement index.js (editor)
4. ⏭️ Implement view.js (frontend)
5. ⏭️ Add styles
6. ⏭️ Test with /course/:courseSlug route
7. ⏭️ Document usage
