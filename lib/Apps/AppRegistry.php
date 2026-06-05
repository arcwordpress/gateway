<?php

namespace Gateway\Apps;

use Gateway\App;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Registry for all Gateway React frontend apps.
 *
 * Apps self-register via App::register() which calls AppRegistry::push().
 * AppRegistry::init() must be called once during plugin bootstrap to wire
 * up all the necessary WordPress hooks.
 *
 * The page template approach:
 *   1. Each registered App is listed as a selectable page template.
 *   2. User creates any WordPress page and assigns that template.
 *   3. On init, AppRegistry finds those pages and adds rewrite rules so
 *      sub-paths (e.g. /kb/getting-started) route to the same page_id.
 *   4. template_include intercepts pages using an App template, returns the
 *      shared shell template, and exposes the active App to the enqueue hook.
 *   5. wp_enqueue_scripts reads the page permalink as the React router basename
 *      and passes it via wp_localize_script so the app knows its base URL
 *      regardless of what slug the user chose.
 */
class AppRegistry
{
    /** @var App[] */
    private static array $apps = [];

    /** Track whether WP hooks have been registered. */
    private static bool $booted = false;

    public static function push(App $app): void
    {
        self::$apps[$app->getKey()] = $app;
    }

    public static function getAll(): array
    {
        return self::$apps;
    }

    public static function get(string $key): ?App
    {
        return self::$apps[$key] ?? null;
    }

    // -------------------------------------------------------------------------
    // Bootstrap — call once from Plugin::init()
    // -------------------------------------------------------------------------

    public static function init(): void
    {
        if (self::$booted) {
            return;
        }
        self::$booted = true;

        add_filter('theme_page_templates', [self::class, 'addPageTemplates']);
        add_action('init',                 [self::class, 'addRewriteRules']);
        add_filter('template_include',     [self::class, 'templateLoader']);
        add_action('wp_enqueue_scripts',   [self::class, 'enqueueAssets']);
        add_action('save_post_page',       [self::class, 'maybeFlusRewriteRules']);
    }

    // -------------------------------------------------------------------------
    // WP hooks
    // -------------------------------------------------------------------------

    /**
     * Expose each registered app as a selectable page template in the editor.
     */
    public static function addPageTemplates(array $templates): array
    {
        foreach (self::$apps as $app) {
            $templates[$app->getTemplateSlug()] = $app->getLabel();
        }
        return $templates;
    }

    /**
     * For every page assigned an App template, add a rewrite rule that routes
     * all sub-paths (e.g. /kb/docs/intro) back to that page_id so WP loads
     * the same page and template_include can intercept.
     *
     * Rules are always re-registered on init (they live in memory, not the DB).
     * A flush — which writes rules to the rewrite_rules option — only happens
     * when the fingerprint of registered apps + assigned pages changes.
     */
    public static function addRewriteRules(): void
    {
        if (empty(self::$apps)) {
            return;
        }

        // Build the current state: app key => [page_id => uri, ...]
        $state = [];
        foreach (self::$apps as $app) {
            foreach (self::getPagesForApp($app) as $page) {
                $uri = get_page_uri($page->ID);
                $state[$app->getKey()][$page->ID] = $uri;

                $escaped = preg_quote($uri, '|');
                add_rewrite_rule('^' . $escaped . '(/[^?]*)?/?$', 'index.php?page_id=' . $page->ID, 'top');
            }
        }

        // Flush only when state has changed since the last flush.
        $fingerprint = md5(serialize($state));
        if (get_option('gateway_app_rewrite_hash') !== $fingerprint) {
            flush_rewrite_rules(false);
            update_option('gateway_app_rewrite_hash', $fingerprint, false);
        }
    }

    /**
     * When the active page uses an App template, return the shared shell
     * template and stash the active App in a global for the enqueue hook.
     */
    public static function templateLoader(string $template): string
    {
        $app = self::detectActiveApp();
        if (!$app) {
            return $template;
        }

        $GLOBALS['gateway_active_app'] = $app;

        $shell = GATEWAY_PATH . 'templates/gateway-app-shell.php';
        if (file_exists($shell)) {
            return $shell;
        }

        return $template;
    }

    /**
     * Enqueue the active App's assets and localize the page permalink as
     * basePath so the React router uses the correct base URL.
     */
    public static function enqueueAssets(): void
    {
        $app = $GLOBALS['gateway_active_app'] ?? null;
        if (!$app instanceof App) {
            return;
        }

        global $post;
        $pageId   = $post->ID ?? 0;
        $permalink = get_permalink($pageId);
        $basePath  = $permalink ? rtrim((string) parse_url($permalink, PHP_URL_PATH), '/') : '';
        $buildDir  = $app->getBuildDirPath();
        $buildUrl  = $app->getBuildUrlPath();
        $handle    = 'gateway-app-' . $app->getKey();

        if (!file_exists($buildDir . 'index.js')) {
            return;
        }

        // Read the asset manifest generated by wp-scripts so WordPress loads
        // the correct script dependencies (react, wp-element, etc.) and uses
        // the content-hash version rather than filemtime.
        $asset = file_exists($buildDir . 'index.asset.php')
            ? require $buildDir . 'index.asset.php'
            : ['dependencies' => [], 'version' => filemtime($buildDir . 'index.js')];

        $deps    = array_merge($asset['dependencies'], $app->getScriptDeps());
        $version = $asset['version'];

        if (file_exists($buildDir . 'index.css')) {
            wp_enqueue_style(
                $handle . '-css',
                $buildUrl . 'index.css',
                [],
                $version
            );
        }

        if (file_exists($buildDir . 'style-index.css')) {
            wp_enqueue_style(
                $handle . '-component-css',
                $buildUrl . 'style-index.css',
                [],
                $version
            );
        }

        wp_enqueue_script(
            $handle,
            $buildUrl . 'index.js',
            $deps,
            $version,
            true
        );

        if ($app->isScriptModule()) {
            add_filter('script_loader_tag', function (string $tag, string $h) use ($handle): string {
                return $h === $handle ? str_replace('<script ', '<script type="module" ', $tag) : $tag;
            }, 10, 2);
        }

        $localizeData = $app->buildLocalizeData($pageId, $basePath);
        wp_localize_script($handle, $app->getLocalizeKey(), $localizeData);
    }

    /**
     * When a page using one of our templates is saved (slug may have changed),
     * invalidate the stored hash so addRewriteRules() flushes on the next init.
     */
    public static function maybeFlusRewriteRules(int $pageId): void
    {
        $template = get_post_meta($pageId, '_wp_page_template', true);
        if ($template && strpos($template, 'gateway-app-') === 0) {
            delete_option('gateway_app_rewrite_hash');
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private static function detectActiveApp(): ?App
    {
        if (!is_page()) {
            return null;
        }

        $templateSlug = get_page_template_slug();

        if (!$templateSlug || strpos($templateSlug, 'gateway-app-') !== 0) {
            return null;
        }

        $key = substr($templateSlug, strlen('gateway-app-'));
        return self::$apps[$key] ?? null;
    }

    /**
     * @return \WP_Post[]
     */
    private static function getPagesForApp(App $app): array
    {
        return get_posts([
            'post_type'   => 'page',
            'post_status' => 'publish',
            'numberposts' => -1,
            'meta_query'  => [
                [
                    'key'   => '_wp_page_template',
                    'value' => $app->getTemplateSlug(),
                ],
            ],
        ]);
    }
}
