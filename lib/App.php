<?php

namespace Gateway;

use Gateway\Apps\AppRegistry;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Base class for a Gateway React frontend app.
 *
 * Extend this class to mount a React SPA at a user-controlled WordPress page.
 * The user creates any page in WordPress and assigns the app's page template.
 * Gateway then handles rewrite rules, asset enqueueing, and passes the page's
 * actual permalink as the router base to the React app.
 *
 * Usage:
 *   class MyApp extends \Gateway\App {
 *       protected string $key        = 'my-app';
 *       protected string $label      = 'My App';
 *       protected string $localizeKey = 'myAppData';
 *
 *       protected function getBuildDir(): string {
 *           return MY_PLUGIN_PATH . 'react/apps/my-app/build/';
 *       }
 *       protected function getBuildUrl(): string {
 *           return MY_PLUGIN_URL . 'react/apps/my-app/build/';
 *       }
 *       protected function localizeData(int $pageId, string $basePath): array {
 *           return ['apiUrl' => rest_url('gateway/v1')];
 *       }
 *   }
 *
 *   // In your bootstrap:
 *   MyApp::register();
 *
 * The WordPress page template selector will show the app under its $label.
 * Assign it to any page — that page's slug becomes the router base automatically.
 */
abstract class App
{
    /** @var string Unique key, e.g. 'docs'. Used for template slug and script handles. */
    protected string $key;

    /** @var string Display name shown in the WordPress page template selector. */
    protected string $label = '';

    /** @var string JS global key passed to wp_localize_script. */
    protected string $localizeKey = 'gatewayAppData';

    /** @var array WordPress script dependency handles. */
    protected array $scriptDeps = [];

    /** @var bool Add type="module" attribute to the script tag. */
    protected bool $scriptModule = true;

    /** Absolute filesystem path to the compiled build directory (trailing slash). */
    abstract protected function getBuildDir(): string;

    /** Public URL to the compiled build directory (trailing slash). */
    abstract protected function getBuildUrl(): string;

    /**
     * App-specific data to merge into the localized JS object.
     *
     * The base object always includes: apiUrl, nonce, basePath.
     * Override to add anything extra your app needs.
     */
    protected function localizeData(int $pageId, string $basePath): array
    {
        return [];
    }

    // -------------------------------------------------------------------------
    // Accessors used by AppRegistry
    // -------------------------------------------------------------------------

    public function getKey(): string         { return $this->key; }
    public function getLabel(): string       { return $this->label ?: ucwords(str_replace(['-', '_'], ' ', $this->key)); }
    public function getLocalizeKey(): string { return $this->localizeKey; }
    public function getScriptDeps(): array   { return $this->scriptDeps; }
    public function isScriptModule(): bool   { return $this->scriptModule; }

    /** WordPress page template slug stored in _wp_page_template post meta. */
    public function getTemplateSlug(): string
    {
        return 'gateway-app-' . $this->key;
    }

    /** HTML element ID of the React mount point. */
    public function getMountId(): string
    {
        return 'gateway-app-' . $this->key;
    }

    public function getBuildDirPath(): string { return rtrim($this->getBuildDir(), '/') . '/'; }
    public function getBuildUrlPath(): string  { return rtrim($this->getBuildUrl(), '/') . '/'; }

    /** Merge base data (apiUrl, nonce, basePath) with app-specific data. */
    public function buildLocalizeData(int $pageId, string $basePath): array
    {
        return array_merge(
            [
                'apiUrl'   => rest_url('gateway/v1'),
                'nonce'    => wp_create_nonce('wp_rest'),
                'basePath' => $basePath,
            ],
            $this->localizeData($pageId, $basePath)
        );
    }

    // -------------------------------------------------------------------------
    // Registration
    // -------------------------------------------------------------------------

    public static function register(): void
    {
        AppRegistry::push(new static());
    }
}
