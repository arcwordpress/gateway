<?php
/**
 * Gateway Grid Block - Server-side render template
 *
 * @package Gateway
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block default content.
 * @var WP_Block $block      Block instance.
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Get the collection key from block attributes
$collection_key = isset($attributes['collectionKey']) ? $attributes['collectionKey'] : '';

// If no collection is selected, don't render anything
if (empty($collection_key)) {
    return;
}

// Build wrapper attributes
$wrapper_attributes = get_block_wrapper_attributes([
    'class' => 'gateway-grid-block'
]);
?>

<div <?php echo $wrapper_attributes; ?>>
    <?php \Gateway\Grid\Render::grid($collection_key); ?>
</div>
