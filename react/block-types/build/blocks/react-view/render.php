<?php
/**
 * Server-side rendering for gateway/react-view block.
 *
 * Outputs the mount point for the Gateway React grid app and enqueues the
 * compiled grid app assets.  The grid app's index.js auto-initialises by
 * scanning for [data-gateway-grid] elements, so we just need to output the
 * correct div and make sure the script is loaded.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner block content (unused – no inner blocks).
 * @var WP_Block $block      Block instance.
 */

$collection_key = $attributes['collectionKey'] ?? '';
$show_filters   = $attributes['showFilters']   ?? true;

// Show a helpful placeholder in the editor / preview if unconfigured.
if ( empty( $collection_key ) ) {
    if ( current_user_can( 'edit_posts' ) ) {
        echo '<div class="wp-block-gateway-react-view wp-block-gateway-react-view--empty">'
            . '<p><em>' . esc_html__( 'React View: please select a collection in the block settings.', 'gateway' ) . '</em></p>'
            . '</div>';
    }
    return;
}

// ---------------------------------------------------------------------------
// Enqueue the compiled grid app assets
// ---------------------------------------------------------------------------

$build_path = GATEWAY_PATH . 'react/apps/grid/build/';
$build_url  = GATEWAY_URL  . 'react/apps/grid/build/';
$asset_file = $build_path . 'index.asset.php';
$asset      = file_exists( $asset_file )
    ? require $asset_file
    : [ 'dependencies' => [], 'version' => GATEWAY_VERSION ];

if ( ! wp_script_is( 'gateway-grid-app', 'registered' ) ) {
    wp_register_script(
        'gateway-grid-app',
        $build_url . 'index.js',
        $asset['dependencies'],
        $asset['version'],
        true
    );
}
wp_enqueue_script( 'gateway-grid-app' );

if ( file_exists( $build_path . 'style-index.css' ) && ! wp_style_is( 'gateway-grid-app-style', 'registered' ) ) {
    wp_register_style(
        'gateway-grid-app-style',
        $build_url . 'style-index.css',
        [],
        $asset['version']
    );
}
if ( wp_style_is( 'gateway-grid-app-style', 'registered' ) ) {
    wp_enqueue_style( 'gateway-grid-app-style' );
}

if ( file_exists( $build_path . 'index.css' ) && ! wp_style_is( 'gateway-grid-app', 'registered' ) ) {
    wp_register_style(
        'gateway-grid-app',
        $build_url . 'index.css',
        [],
        $asset['version']
    );
}
if ( wp_style_is( 'gateway-grid-app', 'registered' ) ) {
    wp_enqueue_style( 'gateway-grid-app' );
}

// ---------------------------------------------------------------------------
// Render the mount point
// ---------------------------------------------------------------------------

$config = wp_json_encode( [
    'showFilters' => (bool) $show_filters,
] );

$wrapper_attributes = get_block_wrapper_attributes( [
    'class'            => 'gateway-react-view',
    'data-gateway-grid' => '',
    'data-collection'  => esc_attr( $collection_key ),
    'data-config'      => esc_attr( $config ),
] );

echo '<div ' . $wrapper_attributes . '></div>';
