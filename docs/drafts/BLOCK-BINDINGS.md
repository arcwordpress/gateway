# Block Bindings - Dynamic Data Binding

Gateway provides automatic block binding support for all registered collections, allowing you to dynamically bind WordPress block attributes to collection data without writing custom code.

## Overview

Block bindings (introduced in WordPress 6.5) allow you to connect block attributes to dynamic data sources. Gateway automatically registers a block binding source for each collection in the registry, making it easy to display dynamic content in your WordPress blocks.

## Automatic Registration

Every collection registered with Gateway automatically gets a corresponding block binding source with the naming pattern:

```
gateway/{collection-key}
```

For example:
- `gateway/posts` for WordPress posts
- `gateway/users` for WordPress users
- `gateway/gateway_projects` for Gateway projects
- `gateway/tickets` for a custom tickets collection

## Using Block Bindings in the Block Editor

### Method 1: Using the Block Bindings UI (WordPress 6.5+)

1. Add a block that supports bindings (e.g., Paragraph, Heading, Image, Button)
2. Select the block in the editor
3. In the block settings sidebar, look for the "Bindings" panel
4. Click "Add binding" for the attribute you want to bind (e.g., "content" for paragraphs)
5. Choose the Gateway source (e.g., "Gateway: Project")
6. Specify the field name in the binding settings

### Method 2: Using Block Markup

You can also define bindings directly in block markup using the `metadata` attribute:

```html
<!-- wp:paragraph {
    "metadata": {
        "bindings": {
            "content": {
                "source": "gateway/gateway_projects",
                "args": {
                    "field": "title",
                    "id": 123
                }
            }
        }
    }
} -->
<p>This will be replaced with the project title</p>
<!-- /wp:paragraph -->
```

## Binding Arguments

### Field Selection

Specify which field from the collection record to display:

```json
{
    "bindings": {
        "content": {
            "source": "gateway/tickets",
            "args": {
                "field": "status"
            }
        }
    }
}
```

### Record ID

You can specify the record ID in several ways:

#### 1. Direct ID in Binding Args

```json
{
    "bindings": {
        "content": {
            "source": "gateway/users",
            "args": {
                "field": "display_name",
                "id": 42
            }
        }
    }
}
```

#### 2. From Block Context

Bindings automatically inherit context from parent blocks. This is particularly useful with Query Loop blocks:

```html
<!-- wp:query -->
<div class="wp-block-query">
    <!-- wp:post-template -->
        <!-- wp:paragraph {
            "metadata": {
                "bindings": {
                    "content": {
                        "source": "gateway/posts",
                        "args": {
                            "field": "post_title"
                        }
                    }
                }
            }
        } -->
        <p></p>
        <!-- /wp:paragraph -->
    <!-- /wp:post-template -->
</div>
<!-- /wp:query -->
```

#### 3. Custom Context Provider

You can create custom blocks that provide context to child blocks:

```php
// In your custom block's render callback
$block_content = sprintf(
    '<div %s>%s</div>',
    get_block_wrapper_attributes([
        'data-wp-context' => wp_json_encode([
            'gateway/tickets/id' => $ticket_id
        ])
    ]),
    $content
);
```

## Common Use Cases

### 1. Display User Information

Bind to WordPress user data:

```html
<!-- wp:paragraph {
    "metadata": {
        "bindings": {
            "content": {
                "source": "gateway/users",
                "args": {
                    "field": "display_name",
                    "id": 1
                }
            }
        }
    }
} -->
<p>User name will appear here</p>
<!-- /wp:paragraph -->
```

### 2. Display Custom Collection Data

Bind to any custom collection:

```html
<!-- wp:heading {
    "metadata": {
        "bindings": {
            "content": {
                "source": "gateway/gateway_projects",
                "args": {
                    "field": "title",
                    "id": 5
                }
            }
        }
    }
} -->
<h2>Project title will appear here</h2>
<!-- /wp:heading -->
```

### 3. Dynamic Images

Bind image blocks to collection fields containing URLs:

```html
<!-- wp:image {
    "metadata": {
        "bindings": {
            "url": {
                "source": "gateway/products",
                "args": {
                    "field": "image_url",
                    "id": 10
                }
            },
            "alt": {
                "source": "gateway/products",
                "args": {
                    "field": "title",
                    "id": 10
                }
            }
        }
    }
} -->
<figure class="wp-block-image"><img alt=""/></figure>
<!-- /wp:image -->
```

### 4. Dynamic Links

Bind button or link URLs to collection data:

```html
<!-- wp:button {
    "metadata": {
        "bindings": {
            "url": {
                "source": "gateway/gateway_projects",
                "args": {
                    "field": "project_url",
                    "id": 3
                }
            },
            "text": {
                "source": "gateway/gateway_projects",
                "args": {
                    "field": "title",
                    "id": 3
                }
            }
        }
    }
} -->
<div class="wp-block-button">
    <a class="wp-block-button__link">View Project</a>
</div>
<!-- /wp:button -->
```

## Available Collections and Fields

To see all available collections and their fields, you can use the `getAvailableSources()` method programmatically:

```php
$sources = \Gateway\Blocks\BlockBindings::getAvailableSources();
print_r($sources);
```

This will return an array of all registered binding sources with their available fields:

```php
[
    'gateway/posts' => [
        'label' => 'Gateway: Post',
        'collection_key' => 'posts',
        'collection_class' => 'Gateway\Collections\WP\Post',
        'fields' => ['ID', 'post_title', 'post_content', 'post_status', ...]
    ],
    'gateway/users' => [
        'label' => 'Gateway: User',
        'collection_key' => 'users',
        'collection_class' => 'Gateway\Collections\WP\User',
        'fields' => ['ID', 'user_login', 'user_email', 'display_name', ...]
    ],
    // ... more collections
]
```

## WordPress Core Collections

Gateway automatically provides bindings for WordPress core tables:

- **`gateway/posts`** - WordPress posts (all post types)
  - Fields: `ID`, `post_title`, `post_content`, `post_excerpt`, `post_status`, `post_type`, etc.

- **`gateway/users`** - WordPress users
  - Fields: `ID`, `user_login`, `user_email`, `user_nicename`, `display_name`, etc.

- **`gateway/comments`** - WordPress comments
  - Fields: `comment_ID`, `comment_content`, `comment_author`, `comment_author_email`, etc.

- **`gateway/terms`** - WordPress terms
  - Fields: `term_id`, `name`, `slug`, `term_group`, etc.

## Custom Collections

Any custom collection registered with Gateway automatically gets block binding support. For example:

```php
class TicketCollection extends \Gateway\Collection {
    protected $key = 'tickets';
    protected $table = 'gateway_tickets';
    protected $fillable = ['title', 'status', 'priority', 'assigned_to'];
}

TicketCollection::register();
```

This automatically creates the `gateway/tickets` binding source with access to all fillable fields.

## Primary Keys

Block bindings use the collection's primary key (typically `id`) to identify records. If your collection uses a different primary key, it will be automatically detected using Eloquent conventions:

```php
class CustomCollection extends \Gateway\Collection {
    protected $primaryKey = 'custom_id'; // Eloquent will use this
}
```

## Limitations and Considerations

1. **WordPress Version**: Block bindings require WordPress 6.5 or later
2. **Block Support**: Not all blocks support all attributes for binding. Common bindable attributes include:
   - Paragraph, Heading: `content`
   - Image: `url`, `alt`, `title`
   - Button: `url`, `text`
3. **Field Types**: Complex field types (arrays, objects) may need formatting before display
4. **Performance**: Each binding creates a database query. Consider caching strategies for high-traffic sites
5. **Security**: Bindings respect WordPress capabilities and permissions where applicable

## Troubleshooting

### Binding Not Working

1. **Check WordPress Version**: Ensure you're running WordPress 6.5 or later
2. **Verify Collection Registration**: Make sure your collection is properly registered
3. **Check Field Names**: Ensure the field name in your binding matches the actual database column
4. **Verify Record ID**: Confirm the record exists with the specified ID
5. **Review Error Log**: Check your WordPress error log for any binding-related errors

### Field Returns Empty

1. **Check Field Value**: Verify the field has a value in the database
2. **Check Permissions**: Ensure the field is in the collection's fillable array
3. **Test Query**: Try querying the record directly using the collection class

### Context Not Working

1. **Check Parent Block**: Ensure parent blocks are providing the expected context
2. **Verify Context Keys**: Context keys must match the pattern `gateway/{collection-key}/id`
3. **Test with Direct ID**: Try using a direct ID first, then move to context-based IDs

## Advanced Usage

### Creating Custom Context Providers

You can create custom blocks that provide Gateway collection context:

```php
function render_my_custom_block($attributes, $content, $block) {
    $record_id = $attributes['recordId'] ?? null;

    if (!$record_id) {
        return '';
    }

    $context = [
        'gateway/tickets/id' => $record_id
    ];

    $wrapper_attributes = get_block_wrapper_attributes([
        'data-wp-context' => wp_json_encode($context)
    ]);

    return sprintf('<div %s>%s</div>', $wrapper_attributes, $content);
}
```

### Combining with Query Loops

You can use Gateway bindings inside WordPress Query Loop blocks to create powerful dynamic templates:

```html
<!-- wp:query {"queryId":1,"query":{"postType":"post"}} -->
<div class="wp-block-query">
    <!-- wp:post-template -->
        <!-- wp:group -->
        <div class="wp-block-group">
            <!-- Bind to post title -->
            <!-- wp:heading {
                "metadata": {
                    "bindings": {
                        "content": {
                            "source": "gateway/posts",
                            "args": {"field": "post_title"}
                        }
                    }
                }
            } -->
            <h2></h2>
            <!-- /wp:heading -->

            <!-- Bind to post excerpt -->
            <!-- wp:paragraph {
                "metadata": {
                    "bindings": {
                        "content": {
                            "source": "gateway/posts",
                            "args": {"field": "post_excerpt"}
                        }
                    }
                }
            } -->
            <p></p>
            <!-- /wp:paragraph -->
        </div>
        <!-- /wp:group -->
    <!-- /wp:post-template -->
</div>
<!-- /wp:query -->
```

## API Reference

### `BlockBindings::init()`

Initializes the block bindings system. Called automatically by Gateway.

### `BlockBindings::registerBindingSources()`

Registers binding sources for all collections in the registry. Called on the `init` action.

### `BlockBindings::getAvailableSources()`

Returns an array of all available binding sources and their metadata.

**Returns:**
```php
[
    'gateway/{key}' => [
        'label' => string,           // Display label
        'collection_key' => string,  // Collection key
        'collection_class' => string,// Collection class name
        'fields' => array           // Available fields
    ],
    // ...
]
```

## Further Reading

- [WordPress Block Bindings API](https://make.wordpress.org/core/2024/03/06/new-feature-the-block-bindings-api/)
- [Gateway Collection Documentation](COLLECTION-REFERENCE.md)
- [Gateway Field Types](FIELD-TYPES.md)
