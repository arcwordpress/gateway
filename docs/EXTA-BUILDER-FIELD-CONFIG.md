# Exta Builder — Field Type Configuration Reference

How type-specific configuration options are exposed in the Exta Builder field editor.
Use this document as a debugging reference and as a source of truth for the current `$fields` definitions.

---

## How It Works

Each PHP field type class (extending `\Gateway\Field`) carries a `$fields` array. That array is
serialised into the REST API response at `GET /wp-json/gateway/v1/field-types` and consumed by
the Exta Builder React app, which renders an input for every entry when the user selects that
field type.

### Data Flow

```
PHP FieldType::$fields
  → REST API  /wp-json/gateway/v1/field-types
    → FieldTypesContext (fetches once on mount, builds map keyed by type)
      → FieldEditor  reads selectedFieldTypeConfig.fields
        → FieldConfigInput  renders the correct control per field.type
          → onUpdate  writes value back to the collection JSON via resolveUpdate()
```

### Key Files

| File | Role |
|------|------|
| `lib/Forms/Fields/FieldTypes/*.php` | Defines `$fields` per field type |
| `lib/Field.php` | Base class; `getFields()` serialises `$fields` to the API |
| `react/apps/exta/src/context/FieldTypesContext.js` | Fetches `/field-types`, builds `fieldTypeMap` |
| `react/apps/exta/src/hooks/useFieldTypeRegistry.js` | Exposes context via hook |
| `react/apps/exta/src/components/FieldEditor.js` | Renders the field editor panel, iterates `$fields` |

### Input Types

`$fields` entries support three `type` values, each rendered differently by `FieldConfigInput`:

| type | Control rendered | Stored value |
|------|-----------------|--------------|
| `text` (default) | `<input type="text">` | string |
| `boolean` | `<select>` Yes / No | `true` / `false` |
| `array` | `<textarea>` one item per line | JS array of strings |

### Dot-Notation Names

When a field config must land at a nested path on the stored object (e.g. `relation.endpoint`)
the `name` uses dot notation. `resolveUpdate()` in `FieldEditor.js` walks the path and merges
only the affected key, leaving sibling keys intact.

---

## $fields Reference — All 28 Field Types

### button-group

| name | label | type | default |
|------|-------|------|---------|
| `options` | Options | array | — |
| `default` | Default Value | text | — |

### checkbox

| name | label | type | default |
|------|-------|------|---------|
| `default` | Default Value | boolean | `false` |

### color-picker

| name | label | type | default |
|------|-------|------|---------|
| `default` | Default Color | text | `#000000` |
| `showSwatches` | Show Swatches | boolean | `true` |
| `swatches` | Swatch Colors | array | — |

### date-picker

| name | label | type | default |
|------|-------|------|---------|
| `dateFormat` | Date Format | text | `MM/dd/yyyy` |
| `placeholder` | Placeholder | text | `Select a date` |
| `minDate` | Minimum Date | text | — |
| `maxDate` | Maximum Date | text | — |

### datetime-picker

| name | label | type | default |
|------|-------|------|---------|
| `dateTimeFormat` | Date/Time Format | text | `MM/dd/yyyy h:mm aa` |
| `timeIntervals` | Time Intervals (min) | text | `15` |
| `placeholder` | Placeholder | text | `Select a date and time` |
| `minDate` | Minimum Date | text | — |
| `maxDate` | Maximum Date | text | — |

### email

| name | label | type | default |
|------|-------|------|---------|
| `placeholder` | Placeholder | text | `you@example.com` |

### file

| name | label | type | default |
|------|-------|------|---------|
| `allowedTypes` | Allowed Types | text | — |
| `buttonText` | Button Text | text | `Select File` |
| `mediaTitle` | Media Library Title | text | `Select File` |
| `mediaButtonText` | Media Library Button | text | `Use this file` |

### gallery

| name | label | type | default |
|------|-------|------|---------|
| `maxImages` | Max Images | text | — |
| `thumbnailSize` | Thumbnail Size | text | `thumbnail` |
| `buttonText` | Button Text | text | `Add Images` |
| `mediaTitle` | Media Library Title | text | `Select Images` |
| `mediaButtonText` | Media Library Button | text | `Add to gallery` |

### hidden

| name | label | type | default |
|------|-------|------|---------|
| `value` | Static Value | text | — |

### image

| name | label | type | default |
|------|-------|------|---------|
| `imageSize` | Image Size | text | `medium` |
| `previewHeight` | Preview Height | text | `200px` |
| `buttonText` | Button Text | text | `Select Image` |
| `mediaTitle` | Media Library Title | text | `Select Image` |
| `mediaButtonText` | Media Library Button | text | `Use this image` |

### link

| name | label | type | default |
|------|-------|------|---------|
| `urlPlaceholder` | URL Placeholder | text | `https://` |
| `titlePlaceholder` | Title Placeholder | text | `Link text` |
| `requireTitle` | Require Title | boolean | `false` |
| `enableTarget` | Enable Target | boolean | `false` |
| `addButtonText` | Add Button Text | text | `Add Link` |

### markdown

| name | label | type | default |
|------|-------|------|---------|
| `placeholder` | Placeholder | text | `Write markdown...` |
| `minHeight` | Min Height | text | — |
| `maxHeight` | Max Height | text | — |

### number

| name | label | type | default |
|------|-------|------|---------|
| `min` | Minimum Value | text | — |
| `max` | Maximum Value | text | — |
| `step` | Step | text | `any` |
| `placeholder` | Placeholder | text | — |

### oembed

| name | label | type | default |
|------|-------|------|---------|
| `placeholder` | Placeholder | text | `Paste a URL to embed...` |

### password

| name | label | type | default |
|------|-------|------|---------|
| `placeholder` | Placeholder | text | `Enter password` |
| `autoComplete` | Autocomplete | text | `current-password` |

### post-object

| name | label | type | default |
|------|-------|------|---------|
| `postType` | Post Type | text | `post` |
| `placeholder` | Placeholder | text | `Search for a post...` |
| `resultsPerPage` | Results Per Page | text | `20` |
| `postStatus` | Post Status | text | `publish` |

### radio

| name | label | type | default |
|------|-------|------|---------|
| `options` | Options | array | — |
| `layout` | Layout | text | `vertical` |
| `default` | Default Value | text | — |

### range

| name | label | type | default |
|------|-------|------|---------|
| `min` | Minimum | text | `0` |
| `max` | Maximum | text | `100` |
| `step` | Step | text | `1` |
| `prepend` | Prepend Text | text | — |
| `append` | Append Text | text | — |
| `showMinMax` | Show Min/Max | boolean | `true` |

### readonly

| name | label | type | default |
|------|-------|------|---------|
| `value` | Static Value | text | — |
| `default` | Default Value | text | — |

### relation

Uses dot-notation names so values are written into the nested `relation` object the
React component expects (`config.relation.endpoint`, etc.).

| name | label | type | default |
|------|-------|------|---------|
| `relation.endpoint` | API Endpoint | text | — |
| `relation.labelField` | Label Field | text | `title` |
| `relation.valueField` | Value Field | text | `id` |
| `relation.placeholder` | Placeholder | text | `Select an option...` |

### select

| name | label | type | default |
|------|-------|------|---------|
| `options` | Options | array | — |
| `placeholder` | Placeholder | text | `Select an option` |

### slug

| name | label | type | default |
|------|-------|------|---------|
| `watchField` | Watch Field | text | `title` |
| `prefix` | URL Prefix | text | — |
| `placeholder` | Placeholder | text | — |

### text

| name | label | type | default |
|------|-------|------|---------|
| `placeholder` | Placeholder | text | — |
| `default` | Default Value | text | — |

### textarea

| name | label | type | default |
|------|-------|------|---------|
| `placeholder` | Placeholder | text | — |
| `rows` | Rows | text | `5` |
| `default` | Default Value | text | — |

### time-picker

| name | label | type | default |
|------|-------|------|---------|
| `placeholder` | Placeholder | text | — |
| `timeIntervals` | Time Intervals (min) | text | `15` |
| `timeFormat` | Time Format | text | `h:mm aa` |
| `dateFormat` | Display Format | text | `h:mm aa` |

### url

| name | label | type | default |
|------|-------|------|---------|
| `placeholder` | Placeholder | text | `https://example.com` |
| `default` | Default Value | text | — |

### user

| name | label | type | default |
|------|-------|------|---------|
| `placeholder` | Search Placeholder | text | `Search for a user...` |
| `role` | Restrict by Role | text | — |
| `multiple` | Allow Multiple | boolean | `false` |

### wysiwyg

| name | label | type | default |
|------|-------|------|---------|
| `placeholder` | Placeholder | text | `Start typing...` |
| `default` | Default Value | text | — |

---

## Proposed UI Improvements — Grouped / Tabbed Configuration

Right now `FieldEditor.js` iterates `$fields` as a flat list. For field types with many options
(e.g. range, gallery, relation) this will become unwieldy. ACF solves this with tabs.

### Why a single `group` string is not enough

Adding `'group' => 'appearance'` to each `$fields` entry would let the renderer sort inputs
into tabs. That is necessary but not sufficient:

1. **Tab label and order cannot come from the field entry itself** — the first field seen would
   define the tab label, making order fragile. A separate group registry is cleaner.

2. **Layout per group** — some groups want a 2-column grid (appearance options), others a
   full-width stack (content/wysiwyg options). A per-field `group` string carries no layout hint.

3. **Collapsible sub-sections within a tab** — you might want "Advanced" to be a collapsible
   section inside an existing tab rather than its own tab. A flat `group` value can't express
   parent/child hierarchy.

4. **Conditional visibility** — some inputs should only appear when another input has a
   certain value (e.g. `swatches` array should only be visible when `showSwatches` is `true`).
   This is a field-level concern, not a group-level concern, and needs its own key.

5. **Width / column span** — in a multi-column tab, individual fields may want to be full-width
   (`span: 2`) while others sit in a half-width column. This is layout metadata that belongs
   on the field entry, not the group.

### Proposed schema

**PHP class — add a `$groups` definition array alongside `$fields`:**

```php
protected $groups = [
    [
        'id'    => 'general',
        'label' => 'General',
        'order' => 1,
    ],
    [
        'id'     => 'appearance',
        'label'  => 'Appearance',
        'order'  => 2,
        'layout' => 'grid',   // 'stack' (default) | 'grid'
    ],
    [
        'id'          => 'advanced',
        'label'       => 'Advanced',
        'order'       => 3,
        'collapsible' => true,
        'collapsed'   => true,  // collapsed by default
    ],
];
```

**Each `$fields` entry gains optional layout keys:**

```php
[
    'name'      => 'showSwatches',
    'label'     => 'Show Swatches',
    'type'      => 'boolean',
    'group'     => 'appearance',      // maps to $groups[*].id
    'span'      => 'full',            // 'half' (default in grid) | 'full'
    'condition' => null,              // see below
],
[
    'name'      => 'swatches',
    'label'     => 'Swatch Colors',
    'type'      => 'array',
    'group'     => 'appearance',
    'span'      => 'full',
    'condition' => [                  // only render when showSwatches === true
        'field'    => 'showSwatches',
        'operator' => '==',           // == | != | in | not_in
        'value'    => true,
    ],
],
```

**Renderer change (FieldEditor.js):**

```
1. Group $fields entries by their `group` key (ungrouped → implicit 'general').
2. Sort groups by their `$groups[].order` value.
3. Render a tab bar; one tab per group.
4. Within each tab:
   a. Apply grid or stack layout based on group.layout.
   b. Evaluate each field's `condition` against the current field object values
      and skip rendering if the condition is not met.
   c. Pass `span` as a CSS class to FieldConfigInput for column sizing.
```

### What the base class serialises

`Field::getFields()` would need to also expose the `$groups` array in the API response so the
React app has all the tab metadata without hard-coding it. The REST response shape would become:

```json
{
  "type": "color-picker",
  "fields": [ ... ],
  "groups": [
    { "id": "general",    "label": "General",    "order": 1 },
    { "id": "appearance", "label": "Appearance", "order": 2, "layout": "grid" }
  ]
}
```

Fields without a `group` key default to the first group (lowest `order`) or an implicit
"General" tab that is always present.

### Migration path

Because `$groups` and the new per-field keys (`group`, `span`, `condition`) are purely additive,
all 28 existing `$fields` definitions continue to work as flat lists with no changes. The renderer
can fall back to the current flat-list layout when no `$groups` are defined.
