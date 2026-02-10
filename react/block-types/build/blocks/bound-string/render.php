<?php
/**
 * Server-side rendering for gateway/bound-string block
 *
 * This block displays bound content from Gateway collections.
 * It's designed to work within the Collection Records loop.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block default content.
 * @var WP_Block $block      Block instance.
 */

$tag_name = $attributes['tagName'] ?? 'span';
$content_value = $attributes['content'] ?? '';
$placeholder = $attributes['placeholder'] ?? '';

// Allowed HTML tags for the wrapper
$allowed_tags = ['span', 'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em'];
if (!in_array($tag_name, $allowed_tags, true)) {
    $tag_name = 'span';
}

// Get wrapper attributes
$wrapper_attributes = get_block_wrapper_attributes([
    'class' => 'wp-block-gateway-bound-string',
]);

// Display content or placeholder
$display_content = !empty($content_value) ? $content_value : $placeholder;

// Output
printf(
    '<%1$s %2$s>%3$s</%1$s>',
    esc_attr($tag_name),
    $wrapper_attributes,
    wp_kses_post($display_content)
);
