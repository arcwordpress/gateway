<?php

namespace Gateway\Raptor;

use Gateway\Raptor\Collections\RaptorView;
use Gateway\Raptor\Collections\RaptorCollection;

if (!defined('ABSPATH')) {
    exit;
}

class ViewRenderer
{
    /**
     * Initialize view rendering system
     */
    public static function init()
    {
        add_shortcode('gateway_view', [__CLASS__, 'renderViewShortcode']);
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueueScripts']);
        add_action('wp_enqueue_scripts', [__CLASS__, 'enqueueStyles']);
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueueAdminScripts']);
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueueStyles']);
    }

    /**
     * Enqueue Interactivity API scripts in admin for preview
     */
    public static function enqueueAdminScripts()
    {
        // Only load on Raptor admin pages
        $screen = get_current_screen();
        if (!$screen || strpos($screen->id, 'gateway') === false) {
            return;
        }

        // Enqueue the view store for admin preview
        $storePath = dirname(__FILE__) . '/store/view-store.js';
        $storeUrl = plugins_url('store/view-store.js', __FILE__);

        if (file_exists($storePath)) {
            wp_register_script_module(
                'gateway-view-store',
                $storeUrl,
                ['@wordpress/interactivity'],
                filemtime($storePath)
            );
            wp_enqueue_script_module('gateway-view-store');
        }
    }

    /**
     * Enqueue view styles
     */
    public static function enqueueStyles()
    {
        $stylePath = dirname(__FILE__) . '/store/view-styles.css';
        $styleUrl = plugins_url('store/view-styles.css', __FILE__);

        if (file_exists($stylePath)) {
            wp_enqueue_style(
                'gateway-view-styles',
                $styleUrl,
                [],
                filemtime($stylePath),
                'all'
            );
        }
    }

    /**
     * Register and enqueue Interactivity API store for views
     */
    public static function enqueueScripts()
    {
        $storePath = dirname(__FILE__) . '/store/view-store.js';
        $storeUrl = plugins_url('store/view-store.js', __FILE__);

        if (file_exists($storePath)) {
            wp_register_script_module(
                'gateway-view-store',
                $storeUrl,
                ['@wordpress/interactivity'],
                filemtime($storePath)
            );
            wp_enqueue_script_module('gateway-view-store');
        }
    }

    /**
     * Shortcode handler: [gateway_view key="view-key"]
     *
     * @param array $atts Shortcode attributes
     * @return string Rendered HTML
     */
    public static function renderViewShortcode($atts)
    {
        $atts = shortcode_atts([
            'key' => '',
        ], $atts);

        if (empty($atts['key'])) {
            return '<p>Error: View key is required</p>';
        }

        $view = RaptorView::where('view_key', $atts['key'])->first();

        if (!$view) {
            return '<p>Error: View not found</p>';
        }

        return self::renderView($view);
    }

    /**
     * Render a view with Interactivity API directives
     *
     * @param RaptorView $view The view to render
     * @return string HTML markup with data-wp-* directives
     */
    public static function renderView(RaptorView $view): string
    {
        $viewKey = $view->view_key;
        $namespace = 'gateway/view-' . $viewKey;

        // Load the view's collection to get admin data
        $view->load('viewList.collection');
        $collection = $view->viewList?->collection ?? null;

        if (!$collection) {
            return '<p>Error: View collection not found</p>';
        }

        // Prepare initial state
        $apiRoute = '';
        $adminData = get_option('gateway_admin_data', []);
        
        if (isset($adminData['collections'])) {
            foreach ($adminData['collections'] as $collData) {
                if ($collData['key'] === $collection->collection_key) {
                    $getManyRoute = null;
                    foreach ($collData['routes'] as $route) {
                        if ($route['type'] === 'get_many') {
                            $getManyRoute = $route['route'];
                            break;
                        }
                    }
                    if ($getManyRoute) {
                        $apiRoute = rest_url($getManyRoute);
                    }
                    break;
                }
            }
        }

        // Output interactivity state
        wp_interactivity_state($namespace, [
            'apiRoute' => $apiRoute,
            'records' => [],
            'isLoading' => false,
            'error' => null,
            'columns' => $view->columns ?? [],
            'perPage' => $view->per_page ?? 10,
            'currentPage' => 1,
            'totalPages' => 1,
        ]);

        // Generate markup with directives
        $columns = $view->columns ?? [];
        $title = esc_html($view->title);

        ob_start();
        ?>
        <div data-wp-interactive="<?php echo esc_attr($namespace); ?>" data-wp-init="actions.loadRecords">
            <div class="gateway-view-container">
                <header class="gateway-view-header">
                    <h2><?php echo $title; ?></h2>
                </header>

                <div data-wp-show="!state.isLoading && !state.error && state.records.length > 0">
                    <table class="gateway-view-table">
                        <thead>
                            <tr>
                                <?php foreach ($columns as $column): ?>
                                    <th><?php echo esc_html($column); ?></th>
                                <?php endforeach; ?>
                            </tr>
                        </thead>
                        <tbody>
                            <template data-wp-each="state.records">
                                <tr>
                                    <?php foreach ($columns as $column): ?>
                                        <td data-wp-text="context.item.<?php echo esc_attr($column); ?>"></td>
                                    <?php endforeach; ?>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>

                <div data-wp-show="state.isLoading" class="gateway-view-loading">
                    Loading...
                </div>

                <div data-wp-show="state.error" class="gateway-view-error">
                    <p data-wp-text="state.error"></p>
                </div>

                <div data-wp-show="!state.isLoading && state.records.length === 0 && !state.error" class="gateway-view-empty">
                    <p>No records found</p>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Generate view markup for use in React (editor preview)
     *
     * @param RaptorView $view The view to render
     * @param array $records Sample records to display
     * @return string HTML markup
     */
    public static function renderViewPreview(RaptorView $view, array $records = []): string
    {
        $columns = $view->columns ?? [];
        $title = esc_html($view->title);

        ob_start();
        ?>
        <div class="gateway-view-preview">
            <table class="gateway-view-table">
                <thead>
                    <tr>
                        <?php foreach ($columns as $column): ?>
                            <th><?php echo esc_html($column); ?></th>
                        <?php endforeach; ?>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($records)): ?>
                        <tr>
                            <?php foreach ($columns as $column): ?>
                                <td>—</td>
                            <?php endforeach; ?>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($records as $record): ?>
                            <tr>
                                <?php foreach ($columns as $column): ?>
                                    <td><?php echo esc_html($record[$column] ?? '—'); ?></td>
                                <?php endforeach; ?>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
        <?php
        return ob_get_clean();
    }
}
