<?php
/**
 * Server-side render for the Gateway Grid Breakdance element.
 *
 * Breakdance calls this file when %%SSR%% appears in html.twig.
 * Available variables:
 *   $properties            - element properties set in the builder
 *   $parentPropertiesData  - parent element properties (unused here)
 */

if (!defined('ABSPATH')) {
    exit;
}

$collection   = isset($properties['content']['collection'])   ? sanitize_text_field((string) $properties['content']['collection']) : '';
$show_filters = isset($properties['content']['show_filters']) ? (bool) $properties['content']['show_filters'] : true;
$per_page     = isset($properties['content']['per_page'])     ? max(1, (int) $properties['content']['per_page']) : 20;

if (empty($collection)) {
    echo '<p class="gateway-breakdance-grid__placeholder">'
        . esc_html__('Gateway Grid: enter a Collection key in the element settings.', 'gateway')
        . '</p>';
    return;
}

// ---------------------------------------------------------------------------
// Enqueue the compiled grid app
// ---------------------------------------------------------------------------

$build_path = GATEWAY_PATH . 'react/apps/grid/build/';
$build_url  = GATEWAY_URL  . 'react/apps/grid/build/';
$asset_file = $build_path . 'index.asset.php';
$asset      = file_exists($asset_file)
    ? require $asset_file
    : ['dependencies' => [], 'version' => GATEWAY_VERSION];

if (!wp_script_is('gateway-grid-app', 'registered')) {
    wp_register_script(
        'gateway-grid-app',
        $build_url . 'index.js',
        $asset['dependencies'],
        $asset['version'],
        true
    );
}
wp_enqueue_script('gateway-grid-app');

foreach (['style-index.css' => 'gateway-grid-app-style', 'index.css' => 'gateway-grid-app'] as $file => $handle) {
    if (file_exists($build_path . $file) && !wp_style_is($handle, 'registered')) {
        wp_register_style($handle, $build_url . $file, [], $asset['version']);
    }
    if (wp_style_is($handle, 'registered')) {
        wp_enqueue_style($handle);
    }
}

// ---------------------------------------------------------------------------
// Render the mount point — [data-gateway-grid] targets AppGrid in index.js
// ---------------------------------------------------------------------------

$config = wp_json_encode([
    'showFilters' => $show_filters,
    'perPage'     => $per_page,
]);

echo '<div'
    . ' data-gateway-grid=""'
    . ' data-schema="'  . esc_attr($collection) . '"'
    . ' data-config="'  . esc_attr($config)      . '"'
    . '></div>';
