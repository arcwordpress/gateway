# Testing Dynamic Routes

## Overview

The router now supports **global access to route parameters** from any block, even outside the router context.

## Quick Test: `/course/:courseSlug`

### 1. Create a Route with Dynamic Param

In the WordPress editor:
1. Add a **Router** block
2. Inside it, add a **Route** block
3. Set the route path to: `/course/:courseSlug`
4. Add some content inside the route (e.g., a heading, paragraph)

### 2. Test Navigation

Navigate to a course URL, for example:
- `/course/web-development`
- `/course/gutenberg-editing`
- `/course/react-basics`

### 3. Check Console Output

You should see:
```
[Router] 🎯 Dynamic route matched: {
  pattern: "/course/:courseSlug",
  path: "/course/web-development",
  params: { courseSlug: "web-development" }
}
```

### 4. Access Params from ANY Block

#### Method 1: Via Router Store State (Global Access)
```javascript
import { store, getContext } from '@wordpress/interactivity';

store('your-block/store', {
  state: {
    get currentCourse() {
      // Access from anywhere - even outside router!
      const routerState = getStore('gateway/router')?.state;
      return routerState?.params?.courseSlug;
    }
  }
});
```

#### Method 2: Via Global Helper Functions
```javascript
import { getRouteParams, getRouteParam } from '../router/view.js';

store('your-block/store', {
  state: {
    get courseSlug() {
      return getRouteParam('courseSlug');
    },

    get allParams() {
      return getRouteParams();
    }
  }
});
```

#### Method 3: Direct in Template
```html
<div
  data-wp-interactive="gateway/router"
  data-wp-text="state.params.courseSlug"
>
  <!-- Will display: web-development -->
</div>
```

## Multiple Parameters

### Example: `/course/:courseSlug/lesson/:lessonId`

```javascript
// Navigate to: /course/react-basics/lesson/intro-to-hooks

const params = getRouteParams();
// Returns: { courseSlug: "react-basics", lessonId: "intro-to-hooks" }

const courseSlug = getRouteParam('courseSlug'); // "react-basics"
const lessonId = getRouteParam('lessonId');     // "intro-to-hooks"
```

Console output:
```
[Router] 🎯 Dynamic route matched: {
  pattern: "/course/:courseSlug/lesson/:lessonId",
  path: "/course/react-basics/lesson/intro-to-hooks",
  params: { courseSlug: "react-basics", lessonId: "intro-to-hooks" }
}
```

## Naming Convention

Follow **React Router v6** conventions:

✅ **Correct (camelCase):**
- `:courseSlug`
- `:userId`
- `:postId`
- `:categoryName`

❌ **Incorrect:**
- `:course-slug` (kebab-case doesn't work in JS)
- `:CourseSlug` (PascalCase not standard)

## Testing Checklist

- [ ] Create route with pattern `/course/:courseSlug`
- [ ] Navigate to `/course/test-course`
- [ ] Check console for "🎯 Dynamic route matched" log
- [ ] Verify params object contains `courseSlug: "test-course"`
- [ ] Access params from a block OUTSIDE the router
- [ ] Test browser back/forward buttons (should see "⬅️ Back/forward navigation params")
- [ ] Test with multiple params (e.g., `/course/:courseSlug/lesson/:lessonId`)

## Benefits

✅ Works from **any block** (nav, breadcrumbs, sidebar, etc.)
✅ No need to be inside router context
✅ Global singleton pattern (similar to React Router)
✅ Type-safe param access
✅ Supports unlimited dynamic segments

## Console Logs for Debugging

The router now has **focused logging** for dynamic routes:

- `🎯 Dynamic route matched` - When a route with params is matched
- `🎯 Route params` - After successful navigation with params
- `⬅️ Back/forward navigation params` - When using browser navigation with params

All other verbose logging has been removed for clarity.
