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

$collection_key = isset($properties['content']['collection'])   ? sanitize_text_field((string) $properties['content']['collection']) : '';
$show_filters   = isset($properties['content']['show_filters']) ? (bool) $properties['content']['show_filters'] : true;
$per_page       = isset($properties['content']['per_page'])     ? max(1, (int) $properties['content']['per_page']) : 20;

// ---------------------------------------------------------------------------
// No collection selected — show picker summary in editor
// ---------------------------------------------------------------------------

if (empty($collection_key)) {
    try {
        $registry    = \Gateway\Plugin::getInstance()->getRegistry();
        $collections = $registry ? $registry->getAll() : [];
        $visible     = array_filter($collections, fn($c) => !method_exists($c, 'isHidden') || !$c->isHidden());
    } catch (\Throwable $e) {
        $visible = [];
    }

    echo '<div class="gateway-breakdance-grid__placeholder">';
    echo '<strong>Gateway Grid</strong> — select a collection in the panel.';
    if (!empty($visible)) {
        echo '<ul style="margin:.5em 0 0;padding-left:1.2em;font-size:.85em">';
        foreach ($visible as $key => $col) {
            $title = method_exists($col, 'getTitle') ? $col->getTitle() : $key;
            echo '<li><code>' . esc_html($key) . '</code> — ' . esc_html($title) . '</li>';
        }
        echo '</ul>';
    }
    echo '</div>';
    return;
}

// ---------------------------------------------------------------------------
// Collection selected — resolve metadata and show a quick summary in editor
// ---------------------------------------------------------------------------

$collection = null;
try {
    $registry   = \Gateway\Plugin::getInstance()->getRegistry();
    $collection = $registry ? $registry->get($collection_key) : null;
} catch (\Throwable $e) {}

if (!$collection) {
    echo '<p class="gateway-breakdance-grid__error">'
        . esc_html(sprintf('Gateway Grid: collection "%s" not found.', $collection_key))
        . '</p>';
    return;
}

// ---------------------------------------------------------------------------
// Enqueue the Preact grid bundle (no WordPress React dependencies)
// ---------------------------------------------------------------------------

$script_path = GATEWAY_PATH . 'js/breakdance-grid/build/index.js';
$script_url  = GATEWAY_URL  . 'js/breakdance-grid/build/index.js';
$version     = file_exists($script_path) ? md5_file($script_path) : GATEWAY_VERSION;

if (!wp_script_is('gateway-bd-grid', 'registered')) {
    wp_register_script('gateway-bd-grid', $script_url, [], $version, true);
    wp_localize_script('gateway-bd-grid', 'gatewayBd', [
        'apiRoot' => esc_url_raw(rest_url()),
    ]);
}
wp_enqueue_script('gateway-bd-grid');

// ---------------------------------------------------------------------------
// Render the mount point
// ---------------------------------------------------------------------------

$config = wp_json_encode([
    'showFilters' => $show_filters,
    'perPage'     => $per_page,
]);

echo '<div'
    . ' data-gateway-grid=""'
    . ' data-schema="'  . esc_attr($collection_key) . '"'
    . ' data-config="'  . esc_attr($config)          . '"'
    . '></div>';
