<?php

namespace Gateway\Integrations\Elementor;

if (!defined('ABSPATH')) {
    exit;
}

class ElementorController
{
    public static function init(): void
    {
        add_action('init',                                   [__CLASS__, 'registerExplorerRewriteRules']);
        add_filter('request',                                [__CLASS__, 'handleExplorerRequest']);
        add_action('elementor/document/after_save',          [__CLASS__, 'onDocumentSave'], 10, 2);
        add_action('elementor/widgets/register',             [__CLASS__, 'registerWidgets']);
        add_action('elementor/preview/enqueue_scripts',      [__CLASS__, 'enqueuePreviewAssets']);
        add_action('elementor/editor/after_enqueue_scripts', [__CLASS__, 'enqueueEditorAssets']);
    }

    // ── Routing ───────────────────────────────────────────────────────────────

    /**
     * Runs on 'init'. Adds stored Explorer routes to WP_Rewrite's internal
     * extra_rules_top so they survive any subsequent flush_rewrite_rules() call
     * from this or any other plugin.
     */
    public static function registerExplorerRewriteRules(): void
    {
        $routes = get_option('gateway_explorer_routes', []);
        foreach ($routes as $slug => $page_id) {
            if (!$slug || !$page_id) continue;
            add_rewrite_rule(
                '^' . preg_quote($slug, '/') . '/(.+?)/?$',
                'index.php?page_id=' . (int) $page_id,
                'top'
            );
        }
    }

    /**
     * 'request' filter — fires inside WP::parse_request() before WordPress
     * decides what to load. Acts as the primary, flush-free routing mechanism:
     * if the URL is a sub-path of a registered Explorer page, override the
     * query vars to serve that page directly.
     *
     * This makes sub-path URLs work immediately after the route is first
     * recorded, without waiting for a rewrite-rule flush.
     */
    public static function handleExplorerRequest(array $query_vars): array
    {
        if (is_admin()) return $query_vars;

        $routes = get_option('gateway_explorer_routes', []);
        if (empty($routes)) return $query_vars;

        $request_path = trim(strtok($_SERVER['REQUEST_URI'] ?? '', '?'), '/');
        if (empty($request_path)) return $query_vars;

        foreach ($routes as $slug => $page_id) {
            if (!$slug || !$page_id) continue;
            if ($request_path === $slug) continue; // exact base-page match — let WP handle normally
            if (!str_starts_with($request_path, $slug . '/')) continue;

            // Sub-path of an Explorer page → serve the host page.
            return ['page_id' => (int) $page_id];
        }

        return $query_vars;
    }

    /**
     * Fires after an Elementor document is saved in the editor.
     * If the document contains an Explorer widget, flush rewrite rules so that
     * deep-link URLs work on the next request without manual intervention.
     */
    public static function onDocumentSave(object $document, array $data): void
    {
        $elements = $document->get_elements_data();
        if (!self::elementsContainWidget($elements, 'gateway_explorer')) return;

        $page_id = $document->get_post()->ID;
        $base_path = rtrim(parse_url(get_permalink($page_id) ?: '', PHP_URL_PATH) ?: '', '/');
        if (!$base_path || !$page_id) return;

        self::recordExplorerRoute($base_path, $page_id, true);
    }

    /**
     * Record a slug → page_id mapping and, when the route is new or a flush
     * is forced, register the WP rewrite rule and flush the rules cache.
     *
     * @param bool $force_flush  Always flush even if the route was already stored
     *                           (used from onDocumentSave so each editor save
     *                           triggers a fresh flush).
     */
    public static function recordExplorerRoute(string $base_path, int $page_id, bool $force_flush = false): void
    {
        $slug = trim($base_path, '/');
        if (!$slug || !$page_id) return;

        $routes  = get_option('gateway_explorer_routes', []);
        $changed = ($routes[$slug] ?? null) !== $page_id;

        if ($changed) {
            $routes[$slug] = $page_id;
            update_option('gateway_explorer_routes', $routes, false);
        }

        if ($changed || $force_flush) {
            // Ensure the rule is in WP_Rewrite's live array before flushing.
            add_rewrite_rule(
                '^' . preg_quote($slug, '/') . '/(.+?)/?$',
                'index.php?page_id=' . (int) $page_id,
                'top'
            );
            flush_rewrite_rules(false);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static function elementsContainWidget(array $elements, string $widget_type): bool
    {
        foreach ($elements as $element) {
            if (($element['widgetType'] ?? '') === $widget_type) return true;
            if (!empty($element['elements']) && self::elementsContainWidget($element['elements'], $widget_type)) return true;
        }
        return false;
    }

    // ── Widget registration ───────────────────────────────────────────────────

    public static function registerWidgets(\Elementor\Widgets_Manager $manager): void
    {
        require_once __DIR__ . '/Widgets/Grid.php';
        require_once __DIR__ . '/Widgets/GatewayApp.php';
        require_once __DIR__ . '/Widgets/Explorer.php';
        $manager->register(new Widgets\Grid());
        $manager->register(new Widgets\GatewayApp());
        $manager->register(new Widgets\Explorer());
    }

    // ── Asset enqueueing ──────────────────────────────────────────────────────

    public static function enqueueEditorAssets(): void
    {
        $path = GATEWAY_PATH . 'js/gateway-grid-editor/panel.js';
        $url  = GATEWAY_URL  . 'js/gateway-grid-editor/panel.js';

        if (!file_exists($path)) return;

        wp_enqueue_script('gateway-grid-editor', $url, ['jquery'], md5_file($path), true);
        wp_localize_script('gateway-grid-editor', 'gatewayGridEditor', [
            'apiRoot' => esc_url_raw(rest_url()),
        ]);
    }

    public static function enqueuePreviewAssets(): void
    {
        $build    = GATEWAY_PATH . 'js/gateway-grid/build/';
        $buildUrl = GATEWAY_URL  . 'js/gateway-grid/build/';

        $scriptPath = $build . 'index.js';
        if (!file_exists($scriptPath)) return;

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
