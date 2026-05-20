<?php

namespace Gateway\Integrations\Elementor;

if (!defined('ABSPATH')) {
    exit;
}

class ElementorController
{
    public static function init(): void
    {
        add_action('init',                                 [__CLASS__, 'registerExplorerRewriteRules']);
        add_action('elementor/widgets/register',           [__CLASS__, 'registerWidgets']);
        add_action('elementor/preview/enqueue_scripts',    [__CLASS__, 'enqueuePreviewAssets']);
        add_action('elementor/editor/after_enqueue_scripts', [__CLASS__, 'enqueueEditorAssets']);
    }

    /**
     * Called on 'init'. Reads stored Explorer routes and adds a WordPress
     * rewrite rule for each so that deep slug URLs (e.g. /el2/set/group/item/)
     * resolve back to the page that hosts the widget.
     */
    public static function registerExplorerRewriteRules(): void
    {
        $routes = get_option('gateway_explorer_routes', []);
        foreach ($routes as $slug => $page_id) {
            if (!$slug || !$page_id) continue;
            // Match /{slug}/{one-or-more-segments}[/] → serve the host page.
            add_rewrite_rule(
                '^' . preg_quote($slug, '/') . '/(.+?)/?$',
                'index.php?page_id=' . (int) $page_id,
                'top'
            );
        }
    }

    /**
     * Called from Explorer::render() on the first frontend load after a new
     * page/slug is configured. Persists the route and flushes rewrite rules
     * only when something actually changed.
     */
    public static function recordExplorerRoute(string $base_path, int $page_id): void
    {
        $slug = trim($base_path, '/');
        if (!$slug || !$page_id) return;

        $routes = get_option('gateway_explorer_routes', []);

        if (($routes[$slug] ?? null) === $page_id) return; // already registered, nothing to do

        $routes[$slug] = $page_id;
        update_option('gateway_explorer_routes', $routes, false);

        // Add the rule to the live WP_Rewrite instance NOW so that the
        // subsequent flush includes it in the stored rewrite_rules option.
        // (registerExplorerRewriteRules already ran on 'init' but saw an
        // empty option at that point, so the rule wasn't registered yet.)
        add_rewrite_rule(
            '^' . preg_quote($slug, '/') . '/(.+?)/?$',
            'index.php?page_id=' . (int) $page_id,
            'top'
        );

        flush_rewrite_rules(false); // rebuild rules cache; skips .htaccess update
    }

    public static function registerWidgets(\Elementor\Widgets_Manager $manager): void
    {
        require_once __DIR__ . '/Widgets/Grid.php';
        $manager->register(new Widgets\Grid());

        require_once __DIR__ . '/Widgets/Explorer.php';
        $manager->register(new Widgets\Explorer());
    }

    public static function enqueueEditorAssets(): void
    {
        $path = GATEWAY_PATH . 'js/gateway-grid-editor/panel.js';
        $url  = GATEWAY_URL  . 'js/gateway-grid-editor/panel.js';

        if (!file_exists($path)) {
            return;
        }

        wp_enqueue_script(
            'gateway-grid-editor',
            $url,
            ['jquery'],
            md5_file($path),
            true
        );

        wp_localize_script('gateway-grid-editor', 'gatewayGridEditor', [
            'apiRoot' => esc_url_raw(rest_url()),
        ]);
    }

    public static function enqueuePreviewAssets(): void
    {
        $build    = GATEWAY_PATH . 'js/gateway-grid/build/';
        $buildUrl = GATEWAY_URL  . 'js/gateway-grid/build/';

        $scriptPath = $build . 'index.js';
        if (!file_exists($scriptPath)) {
            return;
        }

        $version = md5_file($scriptPath);

        wp_enqueue_script('gateway-grid', $buildUrl . 'index.js', [], $version, true);
        $current_user = wp_get_current_user();
        wp_localize_script('gateway-grid', 'gatewayBd', [
            'apiRoot'          => esc_url_raw(rest_url()),
            'siteUrl'          => esc_url_raw(site_url()),
            'currentUserId'    => get_current_user_id(),
            'currentUserRoles' => array_values((array) $current_user->roles),
            'nonce'            => wp_create_nonce('wp_rest'),
        ]);

        $cssPath = $build . 'index.css';
        if (file_exists($cssPath)) {
            wp_enqueue_style('gateway-grid', $buildUrl . 'index.css', [], $version);
        }
    }
}
