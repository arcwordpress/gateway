# Gateway Record Block

## Overview

The **Gateway Record** block fetches and displays a single record from a Gateway collection. It's designed to work seamlessly with dynamic routing to create detail pages for courses, lessons, posts, or any custom content type.

## Key Features

✅ **Dynamic Route Integration** - Automatically reads record identifiers from URL parameters
✅ **Multiple Lookup Methods** - Find records by ID or slug
✅ **Context Provider** - Child blocks can access all record fields
✅ **Loading States** - Built-in loading, error, and not-found states
✅ **Preview Support** - See record data in the editor (for static mode)
✅ **Flexible Configuration** - Works in both static and dynamic modes

## Usage Examples

### Example 1: Course Detail Page with Dynamic Routing

**Scenario:** Show course details at `/course/web-development`

```
Router Block
└─ Route Block (path="/course/:courseSlug")
   └─ Record Block
      Settings:
      - Collection Slug: "courses"
      - Use Route Parameter: ✅ Yes
      - Route Parameter Name: "courseSlug"
      - Lookup Field: "slug"

      └─ Heading (Bound to record.title)
      └─ Paragraph (Bound to record.description)
      └─ Image (Bound to record.thumbnail)
```

**Result:**
- User visits `/course/web-development`
- Record block fetches course where `slug = "web-development"`
- Child blocks display course data

### Example 2: Static Record Display

**Scenario:** Display a specific course on a landing page

```
Record Block
Settings:
- Collection Slug: "courses"
- Use Route Parameter: ❌ No
- Lookup Field: "slug"
- Record Slug: "featured-course"

└─ Heading (displays course title)
└─ Paragraph (displays course description)
```

### Example 3: Nested Records (Course + Lesson)

**Scenario:** Display lesson details within a course at `/course/:courseSlug/lesson/:lessonSlug`

```
Router Block
└─ Route Block (path="/course/:courseSlug/lesson/:lessonSlug")
   └─ Record Block (Course)
      Settings:
      - Collection Slug: "courses"
      - Route Parameter Name: "courseSlug"
      - Lookup Field: "slug"

      └─ Heading (Course Title)
      └─ Record Block (Lesson)
         Settings:
         - Collection Slug: "lessons"
         - Route Parameter Name: "lessonSlug"
         - Lookup Field: "slug"

         └─ Heading (Lesson Title)
         └─ Paragraph (Lesson Content)
```

## Block Settings

### Basic Settings

| Setting | Description | Default |
|---------|-------------|---------|
| **Collection Slug** | The Gateway collection to fetch from (e.g., "courses", "lessons") | "" |
| **Store Namespace** | Unique namespace for interactivity store | "gateway/record" |

### Lookup Configuration

| Setting | Description | Options | Default |
|---------|-------------|---------|---------|
| **Use Route Parameter** | Get identifier from URL route | Yes/No | Yes |
| **Route Parameter Name** | Which route param to read | Text | "slug" |
| **Lookup Field** | Field to match against | "id" or "slug" | "slug" |

**When "Use Route Parameter" is OFF:**

| Setting | Description |
|---------|-------------|
| **Record ID** | Specific record ID to fetch (when Lookup Field = "id") |
| **Record Slug** | Specific record slug to fetch (when Lookup Field = "slug") |

## How It Works

### Dynamic Mode (Use Route Parameter = Yes)

1. Block initializes on page load
2. Reads route parameter from URL using `getRouteParam()`
3. Fetches collection endpoint info
4. Fetches all records from collection
5. Filters to find matching record by `lookupField`
6. Sets `context.item` for child blocks to access

**Example Flow:**
```
URL: /course/react-basics
Route Pattern: /course/:courseSlug
Route Param: courseSlug = "react-basics"
Lookup Field: "slug"
Result: Finds record where slug === "react-basics"
```

### Static Mode (Use Route Parameter = No)

1. Block initializes on page load
2. Uses configured `recordId` or `recordSlug`
3. Fetches collection and finds matching record
4. Sets `context.item` for child blocks

## Accessing Record Data

Child blocks within a Record block can access the record data through:

### Method 1: Interactivity API Context

```javascript
import { store, getContext } from '@wordpress/interactivity';

store('your-block/store', {
  state: {
    get courseTitle() {
      const context = getContext();
      return context.item?.title;
    }
  }
});
```

### Method 2: Data Binding

```html
<div
  data-wp-interactive="gateway/record"
  data-wp-text="state.record.title"
>
</div>
```

### Method 3: Bound String Block

Use the existing `gateway/bound-string` block:
- Set field to "title", "description", etc.
- Block automatically reads from record context

## Console Logging

The block provides focused console logs for debugging:

### Initialization
```
[Record] 🔍 Init callback called
[Record] Initial context: { collectionSlug: "courses", ... }
```

### Fetching
```
[Record] 🔍 Fetching record: {
  collection: "courses",
  lookupField: "slug",
  lookupValue: "web-development",
  source: "route param"
}
```

### Success
```
[Record] ✅ Record loaded: {
  id: 123,
  slug: "web-development",
  title: "Web Development Fundamentals"
}
```

### Not Found
```
[Record] ❌ Record not found: slug = "nonexistent-course"
```

## State Management

The block exposes these state properties:

| State | Type | Description |
|-------|------|-------------|
| `record` | Object\|null | The fetched record data |
| `loading` | boolean | True while fetching |
| `error` | string\|null | Error message if fetch failed |
| `notFound` | boolean | True if record not found |
| `hasRecord` | boolean | True if record exists |

## Testing Checklist

### Test 1: Dynamic Route with Slug
- [ ] Create Router with route `/course/:courseSlug`
- [ ] Add Record block inside route
- [ ] Configure: collection="courses", useRouteParam=true, routeParam="courseSlug"
- [ ] Navigate to `/course/test-course`
- [ ] Verify console shows "Record loaded"
- [ ] Verify child blocks display record data

### Test 2: Dynamic Route with ID
- [ ] Create route `/course/:courseId`
- [ ] Configure: lookupField="id", routeParam="courseId"
- [ ] Navigate to `/course/123`
- [ ] Verify record with id=123 loads

### Test 3: Static Record
- [ ] Add Record block (no router)
- [ ] Configure: useRouteParam=false, recordSlug="specific-course"
- [ ] Verify record loads on page load
- [ ] Verify preview shows in editor

### Test 4: Not Found
- [ ] Navigate to `/course/nonexistent-slug`
- [ ] Verify console shows "Record not found"
- [ ] Verify `context.notFound = true`

### Test 5: Nested Records
- [ ] Create route with 2 params: `/course/:courseSlug/lesson/:lessonSlug`
- [ ] Nest two Record blocks
- [ ] Verify both records load correctly

## Current Limitations

### 1. **No Server-Side Filtering**
Currently fetches all records from collection and filters client-side. For large collections, this may have performance implications.

**Future Enhancement:** Add server-side query parameter support:
```javascript
const response = await fetch(`${endpoint}?slug=${slug}`);
```

### 2. **No Caching**
Re-fetches record on every route change.

**Future Enhancement:** Add caching layer to avoid redundant API calls.

### 3. **Limited Lookup Fields**
Currently supports only `id` and `slug`.

**Future Enhancement:** Allow any field as lookup key.

## API Requirements

### Collection Must Have:
- Valid endpoint registered in collection definition
- Records must have `id` field
- Records should have `slug` field (if using slug-based lookups)

### Collection API Response Format:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "slug": "web-development",
        "title": "Web Development",
        // ... other fields
      }
    ]
  }
}
```

Or flat array:
```json
[
  { "id": 1, "slug": "web-development", ... }
]
```

## Integration with Router

The Record block uses the global router helpers:

```javascript
import { getRouteParam } from '../router/view.js';

const courseSlug = getRouteParam('courseSlug');
```

This works because the router stores params globally in `routerInstance.currentParams`.

## Troubleshooting

### Record Not Loading

**Check:**
1. Collection slug is correct
2. Collection has valid endpoint
3. Route parameter name matches route definition
4. Record exists with matching slug/id
5. Check browser console for errors

### Preview Not Showing in Editor

**Causes:**
- "Use Route Parameter" is enabled (preview only works in static mode)
- No record ID/slug specified
- Collection or record doesn't exist

### Child Blocks Not Showing Data

**Check:**
1. Child blocks are inside Record block
2. Child blocks are reading from correct context
3. Field names match actual record fields
4. Record has loaded (check console logs)

## Example: Complete Course Detail Page

```
Page: /courses

Router Block
├─ Route Block (path="/")
│  └─ Heading: "All Courses"
│  └─ Data Source Block (collection="courses")
│     └─ Data Loop Block
│        └─ Route Link (path="/course/:slug")
│           └─ Bound String (field="title")
│
└─ Route Block (path="/course/:courseSlug")
   └─ Record Block
      Settings:
      - Collection: "courses"
      - Use Route Param: Yes
      - Route Param Name: "courseSlug"
      - Lookup Field: "slug"

      └─ Heading
         └─ Bound String (field="title")

      └─ Paragraph
         └─ Bound String (field="description")

      └─ Image
         └─ Dynamic Image (field="thumbnail")

      └─ Data Source Block (collection="lessons")
         └─ Data Loop Block (filter by course_id)
            └─ Lesson Item...
```

This creates a complete course listing + detail page setup!
