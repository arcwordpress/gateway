<?php
/**
 * Gateway Form Block - Server-side render template
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

// Get the optional record ID
$record_id = isset($attributes['recordId']) ? $attributes['recordId'] : null;

// Build wrapper attributes
$wrapper_attributes = get_block_wrapper_attributes([
    'class' => 'gateway-form-block'
]);
?>

<div <?php echo $wrapper_attributes; ?>>
    <?php \Gateway\Forms\Render::form($collection_key, $record_id); ?>
</div>
