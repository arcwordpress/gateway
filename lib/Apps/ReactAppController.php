<?php

namespace Gateway\Apps;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Mounts a React SPA at any WordPress front-end path.
 *
 * Handles rewrite rules, query vars, template loading, and asset
 * enqueueing so consumers can focus on building the app rather than
 * wiring up WordPress boilerplate.
 *
 * Usage:
 *   \Gateway\Apps\ReactAppController::register([
 *       'basePath'     => 'documentation',
 *       'buildDir'     => MY_PLUGIN_PATH . 'apps/docs/dist',
 *       'buildUrl'     => MY_PLUGIN_URL  . 'apps/docs/dist',
 *       'templateFile' => MY_PLUGIN_PATH . 'templates/app-shell.php',
 *       'localizeData' => fn() => [
 *           'apiUrl' => rest_url('gateway/v1'),
 *           'nonce'  => wp_create_nonce('wp_rest'),
 *       ],
 *   ]);
 *
 * Config keys:
 *   basePath     (required) URL path segment, e.g. 'documentation'. Supports
 *                nested paths such as 'my-plugin/docs'.
 *   buildDir     (required) Absolute filesystem path to the compiled build directory.
 *   buildUrl     (required) Public URL to the compiled build directory.
 *   templateFile (required) Absolute path to the PHP template that renders the app shell.
 *   scriptHandle (optional) WordPress script handle. Defaults to 'gateway-app-{slug}'.
 *   queryVar     (optional) WordPress query var name. Defaults to 'gateway_app_{slug}'.
 *   localizeKey  (optional) JS global name for wp_localize_script. Defaults to 'gatewayAppData'.
 *   localizeData (optional) Array or callable returning an array passed to wp_localize_script.
 *   scriptDeps   (optional) WordPress script dependencies array. Defaults to [].
 *   scriptModule (optional) Add type="module" to the script tag. Defaults to true.
 */
class ReactAppController {

    private string $basePath;
    private string $buildDir;
    private string $buildUrl;
    private string $templateFile;
    private string $scriptHandle;
    private string $queryVar;
    private string $localizeKey;
    private mixed  $localizeData;
    private array  $scriptDeps;
    private bool   $scriptModule;

    public function __construct(array $config) {
        $this->basePath     = trim($config['basePath'], '/');
        $this->buildDir     = rtrim($config['buildDir'], '/') . '/';
        $this->buildUrl     = rtrim($config['buildUrl'], '/') . '/';
        $this->templateFile = $config['templateFile'];

        $slug               = preg_replace('/[^a-z0-9]+/', '-', strtolower($this->basePath));
        $this->scriptHandle = $config['scriptHandle'] ?? 'gateway-app-' . $slug;
        $this->queryVar     = $config['queryVar']     ?? 'gateway_app_' . str_replace('-', '_', $slug);
        $this->localizeKey  = $config['localizeKey']  ?? 'gatewayAppData';
        $this->localizeData = $config['localizeData'] ?? null;
        $this->scriptDeps   = $config['scriptDeps']   ?? [];
        $this->scriptModule = $config['scriptModule'] ?? true;
    }

    public static function register(array $config): self {
        $instance = new self($config);
        add_action('init',               [$instance, 'addRewriteRules']);
        add_filter('query_vars',         [$instance, 'addQueryVars']);
        add_filter('template_include',   [$instance, 'templateLoader']);
        add_action('wp_enqueue_scripts', [$instance, 'enqueueAssets']);
        return $instance;
    }

    public function addRewriteRules(): void {
        $escaped = preg_quote($this->basePath, '|');
        $pattern = '^' . $escaped . '(/.*)?/?$';

        add_rewrite_rule($pattern, 'index.php?' . $this->queryVar . '=$matches[1]', 'top');
        add_rewrite_tag('%' . $this->queryVar . '%', '(.*)');

        $rules = get_option('rewrite_rules');
        if (!isset($rules[$pattern])) {
            flush_rewrite_rules(false);
        }
    }

    public function addQueryVars(array $vars): array {
        $vars[] = $this->queryVar;
        return $vars;
    }

    public function templateLoader(string $template): string {
        if (false !== get_query_var($this->queryVar, false)) {
            if (file_exists($this->templateFile)) {
                return $this->templateFile;
            }
        }
        return $template;
    }

    public function enqueueAssets(): void {
        if (false === get_query_var($this->queryVar, false)) {
            return;
        }

        if (!file_exists($this->buildDir . 'index.js')) {
            return;
        }

        if (file_exists($this->buildDir . 'index.css')) {
            wp_enqueue_style(
                $this->scriptHandle . '-css',
                $this->buildUrl . 'index.css',
                [],
                filemtime($this->buildDir . 'index.css')
            );
        }

        if (file_exists($this->buildDir . 'style-index.css')) {
            wp_enqueue_style(
                $this->scriptHandle . '-component-css',
                $this->buildUrl . 'style-index.css',
                [],
                filemtime($this->buildDir . 'style-index.css')
            );
        }

        wp_enqueue_script(
            $this->scriptHandle,
            $this->buildUrl . 'index.js',
            $this->scriptDeps,
            filemtime($this->buildDir . 'index.js'),
            true
        );

        if ($this->scriptModule) {
            $handle = $this->scriptHandle;
            add_filter('script_loader_tag', function (string $tag, string $h) use ($handle): string {
                if ($h === $handle) {
                    return str_replace('<script ', '<script type="module" ', $tag);
                }
                return $tag;
            }, 10, 2);
        }

        if ($this->localizeData !== null) {
            $data = is_callable($this->localizeData) ? ($this->localizeData)() : $this->localizeData;
            wp_localize_script($this->scriptHandle, $this->localizeKey, $data);
        }
    }
}
