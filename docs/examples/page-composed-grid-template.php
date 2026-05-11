<?php
/**
 * Template Name: Composed Grid Demo
 *
 * Drop this file into your active theme (e.g. /wp-content/themes/your-theme/).
 * Then create a page in WP Admin and assign it the "Composed Grid Demo" template.
 *
 * The collection key to display is read from the ?schema= query-string so you
 * can test different collections without editing the file, e.g.:
 *   https://yoursite.com/composed-grid-demo/?schema=events
 *
 * The Gateway plugin must be active and the React app must have been built:
 *   cd wp-content/plugins/gateway/react
 *   npm run build:composed-grid
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/* ──────────────────────────────────────────────────────────────
 * 1.  Enqueue the composed-grid React bundle + its styles
 * ────────────────────────────────────────────────────────────── */

$build_path = WP_PLUGIN_DIR . '/gateway/react/apps/composed-grid/build/';
$build_url  = WP_PLUGIN_URL . '/gateway/react/apps/composed-grid/build/';

$asset_file = $build_path . 'index.asset.php';
$asset      = file_exists( $asset_file )
    ? require $asset_file
    : [ 'dependencies' => [ 'wp-element' ], 'version' => '1.0.0' ];

// Main JS bundle
wp_enqueue_script(
    'gateway-composed-grid',
    $build_url . 'index.js',
    $asset['dependencies'],
    $asset['version'],
    true          // load in footer
);

// Pass WP REST nonce so collectionApi can authenticate
wp_localize_script( 'gateway-composed-grid', 'wpApiSettings', [
    'root'  => esc_url_raw( rest_url() ),
    'nonce' => wp_create_nonce( 'wp_rest' ),
] );

// Design tokens (shared with the rest of Gateway)
if ( file_exists( WP_PLUGIN_DIR . '/gateway/react/packages/tokens.css' ) ) {
    wp_enqueue_style(
        'gateway-tokens',
        WP_PLUGIN_URL . '/gateway/react/packages/tokens.css',
        [],
        defined( 'GATEWAY_VERSION' ) ? GATEWAY_VERSION : '1.0.0'
    );
}

// Compiled component styles (Tailwind / grid layout CSS)
if ( file_exists( $build_path . 'style-index.css' ) ) {
    wp_enqueue_style(
        'gateway-composed-grid-style',
        $build_url . 'style-index.css',
        [ 'gateway-tokens' ],
        $asset['version']
    );
}

// Any additional CSS webpack extracted into index.css
if ( file_exists( $build_path . 'index.css' ) ) {
    wp_enqueue_style(
        'gateway-composed-grid-index',
        $build_url . 'index.css',
        [ 'gateway-composed-grid-style' ],
        $asset['version']
    );
}

/* ──────────────────────────────────────────────────────────────
 * 2.  Resolve which collection to display
 * ────────────────────────────────────────────────────────────── */

$schema = isset( $_GET['schema'] )
    ? sanitize_text_field( wp_unslash( $_GET['schema'] ) )
    : '';

/* ──────────────────────────────────────────────────────────────
 * 3.  Render the page
 * ────────────────────────────────────────────────────────────── */

get_header(); ?>

<main id="composed-grid-page" class="composed-grid-page" style="padding: 2rem;">

    <h1><?php the_title(); ?></h1>

    <?php if ( empty( $schema ) ) : ?>

        <p>
            No collection key provided. Append <code>?schema=your-collection-key</code>
            to the URL, for example:<br>
            <code><?php echo esc_url( add_query_arg( 'schema', 'events', get_permalink() ) ); ?></code>
        </p>

    <?php else : ?>

        <?php
        /*
         * The React app mounts on every [data-composed-grid] element and reads
         * the data-schema attribute for the collection key.
         */
        printf(
            '<div data-composed-grid data-schema="%s"></div>',
            esc_attr( $schema )
        );
        ?>

    <?php endif; ?>

</main>

<?php get_footer();
