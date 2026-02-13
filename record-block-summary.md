# Gateway/Record Block - Summary

## ✅ What Was Created

### Block Files
All files created in `/react/block-types/src/blocks/record/`:

1. **block.json** - Block configuration with attributes and context providers
2. **index.js** - Editor component with settings panel and preview
3. **view.js** - Frontend interactivity with data fetching logic
4. **editor.css** - Editor styling
5. **style.css** - Frontend styling
6. **README.md** - Complete usage documentation

### Documentation Files
1. **record-block-analysis.md** - Comprehensive technical analysis
2. **record-block-summary.md** - This summary

## 🔍 Key Findings from Analysis

### 1. **No Native Slug-Based Fetching**

**Discovery:** The Gateway API only supports fetching by ID:
```javascript
// ✅ Exists
fetchRecord(namespace, route, id)  // GET /gateway/v1/courses/123

// ❌ Doesn't exist
fetchRecordBySlug(namespace, route, slug)  // Would be: GET /gateway/v1/courses?slug=web-dev
```

**Solution Implemented:** Client-side filtering
```javascript
// Fetch all records
const items = await fetch(endpoint);
// Filter to find by slug
const record = items.find(item => item.slug === targetSlug);
```

**Future Enhancement:** Add server-side query parameter support in backend.

### 2. **Router Integration Works Perfectly**

The global router helpers make dynamic routing seamless:
```javascript
import { getRouteParam } from '../router/view.js';

// In /course/web-development, where route is /course/:courseSlug
const courseSlug = getRouteParam('courseSlug');  // "web-development"
```

This is **exactly what was needed** for the `/course/:slug` use case!

### 3. **Data Package Structure**

The React hooks in `/react/packages/data/` are designed for:
- React components (not Interactivity API)
- CollectionProvider context
- Multiple record fetching

Our Record block uses:
- WordPress Interactivity API instead
- Direct fetch() calls
- Single record focus

### 4. **Collection API Structure**

Collections follow this pattern:
```javascript
// 1. Get collection info
GET /wp-json/gateway/v1/collections/{slug}
Returns: { routes: { endpoint: "/wp-json/gateway/v1/courses" }, fields: {...} }

// 2. Fetch records from endpoint
GET /wp-json/gateway/v1/courses
Returns: { success: true, data: { items: [...] } }
```

## 🎯 How the Record Block Works

### Dynamic Mode (Primary Use Case)

**Scenario:** User visits `/course/gutenberg-editing`

```
1. Route matches: /course/:courseSlug
2. Router sets: currentParams.courseSlug = "gutenberg-editing"
3. Record block initializes
4. Reads: getRouteParam('courseSlug') → "gutenberg-editing"
5. Fetches collection: "courses"
6. Filters: items.find(item => item.slug === "gutenberg-editing")
7. Sets: context.record = { id: 5, slug: "gutenberg-editing", title: "...", ... }
8. Child blocks access: context.record.title, context.record.description, etc.
```

### Static Mode

**Scenario:** Fixed course display

```
1. Block configured with: recordSlug="featured-course", useRouteParam=false
2. Fetches collection: "courses"
3. Filters: items.find(item => item.slug === "featured-course")
4. Sets: context.record = {...}
5. Child blocks render record data
```

## 📦 Block Features

### Settings Panel

| Setting | Purpose | Options |
|---------|---------|---------|
| Collection Slug | Which collection to fetch from | Text input |
| Use Route Parameter | Get slug from URL? | Toggle (default: Yes) |
| Route Parameter Name | Which param to read | Text (default: "slug") |
| Lookup Field | Match by ID or slug? | Select: "id" or "slug" |
| Record ID/Slug | Static identifier | Text input (when useRouteParam=false) |

### State Exposed to Child Blocks

```javascript
context = {
  record: { id, slug, title, ... },  // The fetched record
  loading: false,                     // Loading state
  error: null,                        // Error message
  notFound: false,                    // True if record not found
}
```

### Console Logging

Focused, emoji-tagged logs for easy debugging:
- `🔍` - Fetching record
- `✅` - Record loaded
- `❌` - Record not found

## 🚀 Usage Example: Course Detail Pages

### Complete Setup

```
Router Block
├─ Route (path="/courses")
│  └─ Data Source (collection="courses")
│     └─ Data Loop
│        └─ Route Link (path="/course/:slug")
│
└─ Route (path="/course/:courseSlug")
   └─ Record Block ← New!
      Settings:
      - Collection: "courses"
      - Use Route Param: Yes
      - Route Param Name: "courseSlug"
      - Lookup Field: "slug"

      └─ Heading (displays record.title)
      └─ Paragraph (displays record.description)
      └─ Image (displays record.thumbnail)
```

**Result:**
- `/courses` → Lists all courses
- `/course/web-development` → Shows web-development course details
- `/course/react-basics` → Shows react-basics course details

## 🔧 Technical Decisions

### Why Client-Side Filtering?

**Pros:**
- Works immediately without backend changes
- Uses existing collection endpoints
- Simple implementation

**Cons:**
- Fetches all records (performance concern for large collections)
- Client-side processing

**When to Optimize:**
- Collections with >100 records
- Frequent page loads
- Mobile performance critical

**How to Optimize (Future):**
1. Add backend query parameter support
2. Implement caching layer
3. Use pagination endpoints

### Why Not Use React Data Hooks?

The existing hooks (`useRecord`, `useCollectionRecords`) are designed for:
- React component tree
- CollectionProvider context
- Admin UI / forms

Our block uses:
- WordPress Interactivity API (different paradigm)
- Frontend display (not admin)
- Global context (not provider-based)

### Integration with Router Params

The block leverages the **global router params** feature we just added:
```javascript
// router/view.js exports:
export function getRouteParam(key) {
  return routerInstance?.currentParams?.[key];
}

// record/view.js imports:
import { getRouteParam } from '../router/view.js';
```

This is why the router changes were critical first!

## 📋 Testing Checklist

To test the `/course/:slug` route:

### Step 1: Create the Route Structure
1. Add Router block
2. Add Route block inside with path: `/course/:courseSlug`
3. Add Record block inside Route

### Step 2: Configure Record Block
- Collection Slug: `courses`
- Use Route Parameter: `✅ Yes`
- Route Parameter Name: `courseSlug`
- Lookup Field: `slug`

### Step 3: Add Display Blocks
Inside Record block, add:
- Heading (bind to record.title)
- Paragraph (bind to record.description)
- Or use Bound String blocks

### Step 4: Test Navigation
1. Navigate to: `/course/web-development`
2. Check console for: `[Record] ✅ Record loaded`
3. Verify course details display
4. Try different course slugs

### Step 5: Test Not Found
1. Navigate to: `/course/nonexistent-course`
2. Check console for: `[Record] ❌ Record not found`
3. Verify `context.notFound = true`

## 🐛 Potential Issues & Solutions

### Issue 1: Record Not Found
**Symptoms:** Console shows "Record not found"
**Causes:**
- Collection has no record with that slug
- Slug in URL doesn't match record slug exactly
- Using wrong lookupField (id vs slug)

**Solutions:**
- Verify collection has records
- Check slug spelling and case sensitivity
- Verify lookupField setting

### Issue 2: Route Param Not Found
**Symptoms:** Console shows "Route param not found"
**Causes:**
- Route parameter name doesn't match route pattern
- Not inside a Route block with dynamic param

**Solutions:**
- Check route pattern: `/course/:courseSlug` ← param is "courseSlug"
- Verify Record block is child of Route block
- Ensure Router helpers are working (check earlier router logs)

### Issue 3: Performance with Large Collections
**Symptoms:** Slow page loads, API timeouts
**Causes:**
- Collection has thousands of records
- Fetching all records to filter one

**Solutions:**
- Implement server-side filtering (backend enhancement)
- Add pagination to collection endpoint
- Use caching layer
- Consider using record ID if available in URL

## 🔮 Future Enhancements

### Priority 1: Server-Side Filtering
Add backend support for query parameters:
```php
// In collection endpoint
if (isset($_GET['slug'])) {
    $items = array_filter($items, fn($item) => $item['slug'] === $_GET['slug']);
}
```

Then update view.js:
```javascript
// Instead of fetching all
const response = await fetch(endpoint);

// Fetch filtered
const response = await fetch(`${endpoint}?${lookupField}=${lookupValue}`);
```

### Priority 2: Caching
```javascript
const recordCache = {};
const cacheKey = `${collectionSlug}:${lookupField}:${lookupValue}`;

if (recordCache[cacheKey]) {
    context.record = recordCache[cacheKey];
} else {
    // Fetch and cache
    recordCache[cacheKey] = record;
}
```

### Priority 3: Related Records
Enable fetching related records:
```javascript
// Course has many lessons
const course = context.record;
const lessons = await fetchRecords('gateway/v1', 'lessons', {
    filter: { course_id: course.id }
});
```

### Priority 4: Computed Fields
Allow defining computed/derived fields:
```javascript
state: {
    get fullTitle() {
        const record = getContext().record;
        return `${record.title} - ${record.subtitle}`;
    }
}
```

## 🎉 Success Criteria

The block is successful if:
- ✅ Routes like `/course/gutenberg-editing` automatically load the correct course
- ✅ Child blocks can easily access `record.title`, `record.description`, etc.
- ✅ Loading/error states are handled gracefully
- ✅ Console logs make debugging easy
- ✅ Works with any Gateway collection (courses, lessons, posts, etc.)
- ✅ No code changes needed for different collections

## 📚 Related Files

**Router Block:**
- `/react/block-types/src/blocks/router/view.js` - Provides `getRouteParam()`
- `/react/block-types/src/blocks/router/DYNAMIC_ROUTES.md` - Router documentation

**Data Source Block:**
- `/react/block-types/src/blocks/data-source/view.js` - Reference for collection fetching
- Used for **multiple records**, Record block is for **single record**

**Data Package:**
- `/react/packages/data/src/hooks/useRecord.js` - React hook (not used by block)
- `/react/packages/data/src/services/collectionApi.js` - API client (not used by block)

## 🏁 Next Steps

1. **Build the block:**
   ```bash
   cd /home/user/gateway/react/block-types
   npm run build
   ```

2. **Test with courses:**
   - Create a course collection
   - Set up `/course/:courseSlug` route
   - Add Record block
   - Navigate to course URLs

3. **Verify integration:**
   - Check console logs
   - Test with multiple courses
   - Test not-found case
   - Verify child blocks access data

4. **Consider optimizations:**
   - Evaluate performance with actual data
   - Add server-side filtering if needed
   - Implement caching if route changes frequent

## 📞 Support

For issues or questions:
1. Check console logs (look for `[Record]` logs)
2. Review README.md in blocks/record/
3. Check router integration (look for `[Router]` logs)
4. Verify collection API endpoint works directly

Happy course building! 🚀
