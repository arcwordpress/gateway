# Front-End Form Rendering

This document provides comprehensive documentation on rendering Gateway forms on the front-end of WordPress sites.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Usage Methods](#usage-methods)
  - [Shortcode](#shortcode)
  - [Gutenberg Block](#gutenberg-block)
  - [PHP Function](#php-function)
- [Options & Attributes](#options--attributes)
- [How It Works](#how-it-works)
- [Field Types](#field-types)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

---

## Overview

Gateway provides a powerful front-end form rendering system that allows you to display interactive forms on your WordPress site. These forms are built using React and automatically integrate with your Gateway collections, providing:

- Automatic form generation from collection schemas
- 30+ field types with validation
- Create and edit functionality
- REST API integration
- Responsive, accessible design

---

## Setup

### Prerequisites

Before using front-end forms, ensure the following:

1. **Initialize Form Classes** - Add to `Plugin.php` in the `init()` method:

```php
// Initialize front-end forms
Forms\Render::init();
Forms\Shortcode::init();
```

2. **Build the Form App** - The React form app must be compiled:

```bash
cd react/apps/form
npm install
npm run build
```

This creates the necessary build files in `react/apps/form/build/`.

---

## Usage Methods

There are three ways to render forms on the front-end:

### Shortcode

The simplest method for content editors.

**Basic Usage:**
```
[blueprint_form schema="support"]
```

**With Record ID (Edit Mode):**
```
[blueprint_form schema="support" record_id="123"]
```

**With Custom Styling:**
```
[blueprint_form schema="support" class="my-custom-form" id="support-form"]
```

### Gutenberg Block

Available in the block editor under the "Widgets" category.

**Block Name:** `arc-blueprint/form`

**Attributes:**
- Schema (required)
- Record ID (optional)
- Additional CSS class(es) (optional)

### PHP Function

For programmatic rendering in templates.

**Basic Usage:**
```php
\Gateway\Forms\Render::form('support');
```

**With Record ID:**
```php
\Gateway\Forms\Render::form('support', 123);
```

**With Custom Attributes:**
```php
\Gateway\Forms\Render::form('support', null, [
    'class' => 'my-form-wrapper custom-styling',
    'id' => 'contact-form',
    'data-custom' => 'value'
]);
```

---

## Options & Attributes

### Shortcode Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `schema` | string | Yes | The collection key/schema name (e.g., "support", "contact", "leads") |
| `record_id` | integer | No | Record ID for editing existing records. If provided, form loads in edit mode |
| `class` | string | No | Custom CSS class(es) to add to the form container |
| `id` | string | No | Custom HTML ID for the form container |

### PHP Function Parameters

**`Render::form($schema, $record_id, $attributes)`**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `$schema` | string | Yes | The collection key/schema name |
| `$record_id` | integer/null | No | Record ID for edit mode (default: `null`) |
| `$attributes` | array | No | Associative array of HTML attributes (default: `[]`) |

**Example Attributes Array:**
```php
[
    'class' => 'custom-class another-class',
    'id' => 'my-form',
    'data-tracking' => 'form-123',
    'data-custom' => 'value'
]
```

### Gutenberg Block Attributes

| Attribute | Field Type | Description |
|-----------|------------|-------------|
| `schema` | String | Collection schema name (required) |
| `recordId` | String | Record ID for editing |
| `className` | String | Additional CSS classes |

---

## How It Works

### Rendering Process

1. **HTML Element Creation** - A container `<div>` is rendered with data attributes:
   ```html
   <div data-blueprint-form data-schema="support" data-record-id="123"></div>
   ```

2. **Script Enqueuing** - The React form app is automatically enqueued in the footer:
   - JavaScript: `react/apps/form/build/index.js`
   - CSS: `react/apps/form/build/index.css`
   - WordPress REST API settings are localized

3. **React Initialization** - The form app scans for all `[data-blueprint-form]` elements and:
   - Fetches the collection schema from `/wp-json/gateway/v1/collections/{schema}`
   - Renders appropriate field types based on collection configuration
   - Sets up form validation using Zod schemas
   - Handles form submission to the collection's endpoint

### Form Modes

**Create Mode (default):**
- No `record_id` provided
- Form starts empty
- Submits to `POST /wp-json/gateway/v1/{collection-endpoint}`
- Form resets after successful submission

**Edit Mode:**
- `record_id` is provided
- Fetches existing record data via `GET /wp-json/gateway/v1/{collection-endpoint}/{id}`
- Pre-populates form fields
- Submits to `PUT /wp-json/gateway/v1/{collection-endpoint}/{id}`
- Shows "Update Record" instead of "Create Record"

### Data Attributes

The following data attributes are automatically added to the container:

| Attribute | Purpose |
|-----------|---------|
| `data-blueprint-form` | Identifies the element as a form container |
| `data-schema` | Specifies which collection schema to use |
| `data-record-id` | (Optional) Specifies record ID for edit mode |

**Note:** The JavaScript looks for `data-collection` attribute in `index.js:9`, but the PHP renders `data-schema`. This appears to be a potential bug that needs investigation.

---

## Field Types

Forms automatically render the appropriate field type based on your collection's field configuration. See [FIELD-TYPES.md](./FIELD-TYPES.md) for complete documentation on the 30+ available field types.

### Automatic Field Type Detection

The form builder automatically selects field types based on:

1. **Explicit Configuration** - `type` property in field config
2. **Casts** - Data type casting in collection definition
3. **Field Name** - Convention-based detection (e.g., "email", "password", "date")

**Examples:**

```php
// In your collection definition
protected $fillable = ['name', 'email', 'message', 'priority'];

protected $fields = [
    'email' => [
        'type' => 'email',
        'label' => 'Email Address',
        'required' => true,
    ],
    'priority' => [
        'type' => 'select',
        'label' => 'Priority Level',
        'choices' => ['low' => 'Low', 'medium' => 'Medium', 'high' => 'High'],
    ],
    'message' => [
        'type' => 'textarea',
        'label' => 'Your Message',
        'required' => true,
    ]
];
```

---

## Examples

### Example 1: Simple Contact Form

**Collection Setup:**
```php
class Contact extends Model
{
    protected $fillable = ['name', 'email', 'message'];

    protected $fields = [
        'name' => ['required' => true, 'label' => 'Your Name'],
        'email' => ['type' => 'email', 'required' => true],
        'message' => ['type' => 'textarea', 'required' => true],
    ];
}
```

**Usage:**
```
[blueprint_form schema="contact"]
```

### Example 2: Support Ticket Form

**Template File (page-support.php):**
```php
<?php get_header(); ?>

<main class="support-page">
    <h1>Submit a Support Request</h1>

    <div class="support-form-wrapper">
        <?php \Gateway\Forms\Render::form('support', null, [
            'class' => 'support-form',
            'id' => 'support-ticket-form'
        ]); ?>
    </div>
</main>

<?php get_footer(); ?>
```

### Example 3: Edit User Profile

**Page Template:**
```php
<?php
// Get current user
$user_id = get_current_user_id();
if (!$user_id) {
    wp_redirect(wp_login_url());
    exit;
}

get_header();
?>

<div class="user-profile">
    <h2>Edit Your Profile</h2>
    <?php
    // Assuming you have a 'user_profiles' collection linked to WP users
    \Gateway\Forms\Render::form('user_profiles', $user_id);
    ?>
</div>

<?php get_footer(); ?>
```

### Example 4: Custom Styled Form

**Shortcode with Custom Classes:**
```
[blueprint_form schema="newsletter" class="newsletter-signup dark-theme shadow-lg"]
```

**Additional CSS:**
```css
.newsletter-signup {
    max-width: 500px;
    margin: 0 auto;
}

.newsletter-signup.dark-theme {
    background: #1a1a1a;
    padding: 2rem;
    border-radius: 8px;
}
```

### Example 5: Multi-Step Form Wrapper

**Advanced Template Usage:**
```php
<div class="multi-step-form-container">
    <div class="form-step active" data-step="1">
        <h3>Step 1: Basic Information</h3>
        <?php \Gateway\Forms\Render::form('application_basic'); ?>
    </div>

    <div class="form-step" data-step="2">
        <h3>Step 2: Additional Details</h3>
        <?php \Gateway\Forms\Render::form('application_details'); ?>
    </div>
</div>
```

---

## Troubleshooting

### Form Not Appearing

**Possible Causes:**

1. **Form app not built**
   - Check if `react/apps/form/build/` directory exists
   - Run `cd react/apps/form && npm run build`

2. **Classes not initialized**
   - Verify `Forms\Render::init()` and `Forms\Shortcode::init()` are called in `Plugin.php`

3. **Collection not found**
   - Ensure the collection schema name is correct
   - Check collection is registered with Gateway
   - Verify REST API endpoint: `/wp-json/gateway/v1/collections/{schema}`

### Form Shows Error Message

**"Collection not found"**
- Schema name is incorrect or collection not registered
- Check collection registration in your code

**"No endpoint available"**
- Collection doesn't have a proper routes configuration
- Ensure collection has `$routes` property defined

**"No fillable fields"**
- Collection's `$fillable` array is empty
- Add fields to the `$fillable` property

### Script/Style Not Loading

**Check:**
1. Build files exist in `react/apps/form/build/`
2. File permissions are correct
3. WordPress can access the build directory
4. No JavaScript errors in browser console
5. REST API is accessible

### Data Attribute Mismatch

**Known Issue:** The form JavaScript looks for `data-collection` (index.js:9) but PHP renders `data-schema` (Render.php:24). This needs to be fixed for the form to work properly.

**Temporary Fix:** Manually update one to match the other:
- Change `data-schema` to `data-collection` in `Render.php:24`, OR
- Change `data-collection` to `data-schema` in `react/apps/form/src/index.js:9`

### Form Submits But No Data Saved

**Check:**
1. REST API nonce is valid
2. User has permission to create/edit records
3. Collection's `$fillable` array includes all form fields
4. Check browser Network tab for API errors
5. Verify endpoint accepts the data format

### Styling Issues

The form uses Tailwind CSS classes. If styling looks broken:
1. Ensure form CSS is loading (`gateway-forms` stylesheet)
2. Check for CSS conflicts with theme
3. Add custom CSS to override default styles
4. Use the `class` attribute to add custom wrapper classes

---

## API Reference

### Collection Requirements

For a collection to work with front-end forms:

```php
class MyCollection extends Model
{
    // Required: Define which fields can be filled
    protected $fillable = ['field1', 'field2', 'field3'];

    // Optional: Configure field types and validation
    protected $fields = [
        'field1' => [
            'type' => 'text',
            'label' => 'Field Label',
            'required' => true,
            'placeholder' => 'Enter value...',
            'helpText' => 'Additional help text'
        ],
        // ... more fields
    ];

    // Optional: Define data type casts
    protected $casts = [
        'date_field' => 'datetime',
        'is_active' => 'boolean',
        'count' => 'integer'
    ];

    // Optional: Routes configuration
    protected $routes = [
        'endpoint' => 'my-collection'
    ];
}
```

### JavaScript Events

The form app doesn't currently expose custom events, but you can monitor:

**Fetch Events:**
- Collection fetch: `GET /wp-json/gateway/v1/collections/{schema}`
- Record fetch (edit mode): `GET /wp-json/gateway/v1/{endpoint}/{id}`

**Submit Events:**
- Create: `POST /wp-json/gateway/v1/{endpoint}`
- Update: `PUT /wp-json/gateway/v1/{endpoint}/{id}`

### WordPress Filters & Actions

Currently no WordPress filters/actions are exposed by the form rendering system. Forms are rendered directly without modification hooks.

**Potential Enhancement:** Add filters for:
- Form container attributes
- Script/style dependencies
- Form rendering output

---

## Related Documentation

- [Field Types Reference](./FIELD-TYPES.md) - Complete guide to all 30+ field types
- [Authentication](./AUTHENTICATION.md) - REST API authentication details
- [Release Notes](./RELEASE.md) - Version history and changes

---

## Additional Notes

### Performance Considerations

- Scripts are only enqueued when a form is rendered on the page
- Multiple forms on one page share the same script instance
- Forms lazy-load collection data via REST API

### Security

- All submissions use WordPress REST API nonce authentication
- Field validation occurs both client-side (Zod) and server-side
- Collection `$fillable` property controls which fields can be saved
- User permissions are respected via REST API endpoints

### Browser Support

The form app uses modern JavaScript (React 18) and requires:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- No IE11 support

### Customization

You can customize form appearance by:
1. Adding custom CSS classes via the `class` attribute
2. Overriding Tailwind classes in your theme
3. Modifying the form app source in `react/apps/form/src/`
4. Creating custom field type components

### Future Enhancements

Potential features to consider:
- Custom success/error callbacks
- Form submission hooks
- AJAX loading states
- Custom button text
- Multi-step form support
- Conditional field logic
- File upload progress indicators
