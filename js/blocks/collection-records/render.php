<?php
/**
 * Server-side rendering for gateway/collection-records block
 *
 * This block loops over collection records and provides context to child blocks,
 * enabling block bindings to dynamically fetch data for each record.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block default content.
 * @var WP_Block $block      Block instance.
 */

use Gateway\Plugin;
use Gateway\Blocks\BlockBindings;

// Get block attributes
$collection_key = $attributes['collection'] ?? '';
$limit = $attributes['limit'] ?? 10;
$order_by = $attributes['orderBy'] ?? 'id';
$order = $attributes['order'] ?? 'DESC';
$filters = $attributes['filters'] ?? [];

// Early return if no collection specified
if (empty($collection_key)) {
    if (current_user_can('edit_posts')) {
        echo '<div class="wp-block-gateway-collection-records"><p><em>Please select a collection in the block settings.</em></p></div>';
    }
    return;
}

// Get the collection from registry
$registry = Plugin::getInstance()->getRegistry();
$collection = $registry->get($collection_key);

if (!$collection) {
    if (current_user_can('edit_posts')) {
        echo '<div class="wp-block-gateway-collection-records"><p><em>Collection "' . esc_html($collection_key) . '" not found.</em></p></div>';
    }
    return;
}

// Build the query
try {
    $query = $collection->newQuery();

    // Apply filters
    foreach ($filters as $field => $value) {
        if (!empty($value)) {
            $query->where($field, $value);
        }
    }

    // Apply ordering
    $query->orderBy($order_by, $order);

    // Apply limit
    $query->limit($limit);

    // Execute query
    $records = $query->get();
} catch (\Exception $e) {
    if (current_user_can('edit_posts')) {
        echo '<div class="wp-block-gateway-collection-records"><p><em>Error querying collection: ' . esc_html($e->getMessage()) . '</em></p></div>';
    }
    error_log('Gateway collection-records block error: ' . $e->getMessage());
    return;
}

// Get the primary key name for this collection
$primary_key = $collection->getKeyName();

// Get wrapper attributes
$wrapper_attributes = get_block_wrapper_attributes([
    'class' => 'wp-block-gateway-collection-records',
    'data-collection' => esc_attr($collection_key),
    'data-count' => count($records),
]);

// Start output
echo '<div ' . $wrapper_attributes . '>';

if ($records->isEmpty()) {
    echo '<p class="wp-block-gateway-collection-records__empty">No records found.</p>';
} else {
    // The binding source context key for this collection
    // Must use sanitized key (dashes not underscores) to match registered source
    $sanitized_key = BlockBindings::sanitizeSourceKey($collection_key);
    $context_key = "gateway/{$sanitized_key}/id";

    // Loop over records
    foreach ($records as $record) {
        $record_id = $record->$primary_key;

        // Create a wrapper for this record iteration
        echo '<div class="wp-block-gateway-collection-records__item" data-record-id="' . esc_attr($record_id) . '">';

        // Render inner blocks with modified context
        // We need to render each inner block with the record ID in context
        foreach ($block->inner_blocks as $inner_block) {
            // Clone the context and add our record ID
            $inner_context = $inner_block->context;
            $inner_context[$context_key] = $record_id;

            // Also set postId for WordPress post collections (wp_post)
            // This enables compatibility with core blocks expecting postId
            if ($collection_key === 'wp_post') {
                $inner_context['postId'] = $record_id;
                $inner_context['postType'] = $record->post_type ?? 'post';
            }

            // Create a new WP_Block instance with the modified context
            $block_instance = new WP_Block(
                $inner_block->parsed_block,
                $inner_context
            );

            // Render the block
            echo $block_instance->render();
        }

        echo '</div>';
    }
}

echo '</div>';
