<?php
/**
 * PHP Integration Example for GT Data Source Block
 *
 * This shows how to use Collection::prepareStore() to server-side render
 * data into the interactivity store instead of client-side fetching.
 *
 * This approach is FASTER and SIMPLER because:
 * - Data is embedded in the page (no extra HTTP request)
 * - Uses existing Eloquent ORM queries
 * - No loading state needed on initial render
 */

namespace Gateway\Blocks\BlockTypes\DataSource;

/**
 * Example 1: Using prepareStore() in a PHP block render
 *
 * This is the RECOMMENDED approach when you know the collection at render time.
 */
class DataSourceExample extends \Gateway\Block
{
    protected static string $title = 'Data Source Example';

    public static function getName(): string
    {
        return 'gateway/data-source-example';
    }

    public function render(array $attributes, string $content, $block): string
    {
        $collectionSlug = $attributes['collectionSlug'] ?? 'projects';
        $namespace = $attributes['namespace'] ?? 'gateway/data-source';

        // Get the collection class from the registry
        $registry = \Gateway\Plugin::getInstance()->getRegistry();
        $collection = $registry->get($collectionSlug);

        if ($collection) {
            // Prepare the store with server-side data
            // This uses Eloquent ORM - super simple!
            $collection::prepareStore(
                $namespace,
                null, // Optional: pass a query builder to filter
                [
                    'collectionSlug' => $collectionSlug,
                    'searchFields' => ['title', 'slug', 'description']
                ]
            );
        }

        // Render the block template
        ob_start();
        include __DIR__ . '/template.php';
        return ob_get_clean();
    }
}

/**
 * Example 2: Using prepareStore() with custom queries
 *
 * You can filter, sort, and limit the data before sending to the store.
 */
function example_filtered_data_source($attributes)
{
    $namespace = 'gateway/active-projects';

    // Use Eloquent to build a custom query
    $query = \Gateway\Collections\Project::query()
        ->where('status', 'active')
        ->orderBy('created_at', 'desc')
        ->limit(10);

    // Prepare store with the filtered query
    \Gateway\Collections\Project::prepareStore($namespace, $query, [
        'filterApplied' => 'active',
        'maxRecords' => 10
    ]);
}

/**
 * Example 3: Render callback that uses both approaches
 *
 * Server-side data for initial render, client-side for dynamic updates.
 */
function hybrid_render_callback($attributes, $content, $block)
{
    $collectionSlug = $attributes['collectionSlug'] ?? '';
    $namespace = $attributes['namespace'] ?? 'gateway/data-source';

    if ($collectionSlug) {
        $registry = \Gateway\Plugin::getInstance()->getRegistry();
        $collection = $registry->get($collectionSlug);

        if ($collection) {
            // Prepare initial server-side data
            $collection::prepareStore($namespace, null, [
                'collectionSlug' => $collectionSlug,
                'searchQuery' => '',
                'searchFields' => ['title', 'slug'],
                // The view.js actions will still work for client-side updates
            ]);
        }
    }

    // Return the inner blocks content
    return $content;
}

/**
 * Example 4: Register a PHP block that uses data-source pattern
 */
function register_data_source_php_block()
{
    register_block_type('gateway/my-data-block', [
        'api_version' => 3,
        'render_callback' => function($attributes, $content, $block) {
            // Prepare store server-side
            \Gateway\Collections\Project::prepareStore(
                'gateway/my-data',
                \Gateway\Collections\Project::query()->limit(50)
            );

            // Return template with interactivity directives
            return '
                <div
                    data-wp-interactive="gateway/my-data"
                    class="my-data-block"
                >
                    <ul data-wp-bind--hidden="!state.hasRecords">
                        <template data-wp-each--record="state.records">
                            <li data-wp-text="context.record.title"></li>
                        </template>
                    </ul>
                    <div data-wp-bind--hidden="state.hasRecords">
                        No records found
                    </div>
                </div>
            ';
        },
        'supports' => [
            'interactivity' => true
        ]
    ]);
}

/**
 * Key Benefits of prepareStore() approach:
 *
 * 1. NO CLIENT-SIDE FETCH: Data is embedded in page, no extra HTTP request
 * 2. FASTER INITIAL RENDER: No loading state, data is immediately available
 * 3. ELOQUENT POWER: Use all Eloquent query methods (where, orderBy, with, etc.)
 * 4. SEO FRIENDLY: Data is in initial HTML for search engines
 * 5. SIMPLER CODE: No async/await, error handling in one place
 *
 * The view.js I created is still useful for:
 * - Client-side refresh (actions.refresh)
 * - Dynamic filtering (actions.updateSearch)
 * - Sorting (actions.sortBy)
 * - When you need to fetch different collections dynamically
 *
 * BEST PRACTICE:
 * Use prepareStore() for initial data, view.js actions for interactivity!
 */
