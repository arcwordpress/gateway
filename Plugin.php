<?php
/**
 * Plugin Name: Gateway
 * Description: Gateway plugin
 * Version: 1.3.1
 * Requires at least: 6.9
 * Requires PHP: 7.4
 * Author: ARCWP
 * Author URI: https://arcwp.ca
 * Text Domain: gateway
 */

namespace Gateway;

if (!defined('ABSPATH')) {
    exit;
}

define('GATEWAY_VERSION', '1.3.1');
define('GATEWAY_PATH', plugin_dir_path(__FILE__));
define('GATEWAY_URL', plugin_dir_url(__FILE__));
define('GATEWAY_FILE', __FILE__);
define('GATEWAY_DATA_DIR', WP_CONTENT_DIR . '/gateway');
define('GATEWAY_REQUEST_LOG_DIR', GATEWAY_DATA_DIR . '/requests/logs');

require_once GATEWAY_PATH . 'vendor/autoload.php';
require_once GATEWAY_PATH . 'includes/functions.php';

spl_autoload_register(function ($class) {
    $prefix = 'Gateway\\';
    $base_dir = GATEWAY_PATH . 'lib/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

class Plugin
{
    private static $instance = null;
    private $registry;
    private $packageRegistry;
    private $fieldTypeRegistry;
    private $standardRoutes;
    private $collectionRoutes;
    private $adminDataRoute;
    private $settingsRoute;
    private $migrationGeneratorRoute;
    private $migrationRunnerRoute;
    private $mazeRoutes;
    private $patternRegistry;
    private $viewRegistry;
    private $facetRegistry;
    private $dbConnection = false;

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() 
    {
    }

    public function boot()
    {
        $connection_ok = get_transient('gateway_connection_ok');

        if ($connection_ok === false || $connection_ok === '0') {
            $this->dbConnection = Database\DatabaseConnection::testConnection();
            if ($this->dbConnection) {
                set_transient('gateway_connection_ok', '1', 30 * MINUTE_IN_SECONDS);
            } else {
                set_transient('gateway_connection_ok', '0', MINUTE_IN_SECONDS);
            }
        } else {
            $this->dbConnection = true;
        }

        if (!$this->dbConnection) {
            error_log('Gateway: Database connection failed. Plugin loading in degraded mode.');
            add_action('admin_notices', [$this, 'showConnectionNotice']);
            new Endpoints\ConnectionRoute();
            Admin\Page::init();
        } else {
            $this->bootEloquent();
            $this->init();
        }

        do_action('gateway_loaded');
    }

    private function init()
    {
        new Extensions\ExtensionRoutes();
        $this->raptorEndpoints();
        $this->registry = new CollectionRegistry();
        $this->packageRegistry = new Package\PackageRegistry();
        Packages\PackageLoader::load();
        $this->fieldTypeRegistry = new Forms\Fields\FieldTypeRegistry();
        new Forms\Fields\FieldTypeRoutes();
        $this->standardRoutes = new Endpoints\StandardRoutes();
        new Collections\CollectionRoutes();
        $this->adminDataRoute = new Endpoints\AdminDataRoute();
        $this->settingsRoute = new Endpoints\SettingsRoute();
        new Endpoints\ConnectionRoute();
        new Endpoints\TestConnectionRoute();
        $this->migrationGeneratorRoute = new Endpoints\MigrationGeneratorRoute();
        $this->migrationRunnerRoute = new Endpoints\MigrationRunnerRoute();
        new Endpoints\CoreCollectionUserRoute();
        new Blocks\BlockRoutes();
        new Blocks\JsonBlock\JsonBlockRoutes();
        $this->patternRegistry = new Patterns\PatternRegistry();
        Database\MigrationHooks::init();
        $this->maybeRunMigrations();
        gateway_rest_dispatch_filter();
        Admin\Page::init();
        Admin\Records::init();
        Admin\Builder::init();
        Package\PackageMenus::init();
        Forms\Render::init();
        Forms\Shortcode::init();
        Render\Render::init();
        Grids\Shortcode::init();
        Raptor\ViewRenderer::init();
        Filters\Render::init();
        Gutenberg\BlockRegistry::init();
        Blocks\BlockInit::init();
        Blocks\JsonBlock\JsonBlockRegistrar::init();
        Blocks\BlockBindings::init();
        Integrations\Breakdance\Breakdance::init();
        $this->patternRegistry->init();
        AppTemplate::init();

        add_action('gateway_loaded', [$this, 'registerCollections']);
        add_action('gateway_loaded', [$this, 'seedBlockTypes'], 20);
        add_action('gateway_loaded', [$this, 'seedCollections'], 20);
        
    }

    public function raptorEndpoints() 
    {
        new Raptor\Endpoints\ExtensionCrudRoutes();
        new Raptor\Endpoints\ExtensionRoutes();
        new Raptor\Endpoints\CollectionRoutes();
        new Raptor\Endpoints\FieldListRoutes();
        new Raptor\Endpoints\FieldRoutes();
        new Raptor\Endpoints\FormListRoutes();
        new Raptor\Endpoints\FormRoutes();
        new Raptor\Endpoints\ViewListRoutes();
        new Raptor\Endpoints\ViewRoutes();
        new Raptor\Endpoints\ViewRenderRoutes();
        new Raptor\Endpoints\FacetRoutes();
        new Raptor\Endpoints\UserLayoutRoutes();
        new Raptor\Endpoints\PackageRoutes();
        new Raptor\Endpoints\RelationshipRoutes();
    }

    public function seedBlockTypes()
    {
        $gutenbergDir = GATEWAY_PATH . 'react/block-types/build/blocks';
        if (is_dir($gutenbergDir)) {
            foreach (glob($gutenbergDir . '/*/block.json') ?: [] as $jsonPath) {
                $meta = json_decode(file_get_contents($jsonPath), true);
                if (!empty($meta['name'])) {
                    Collections\Gateway\BlockTypeUser::seedOne(
                        $meta['name'],
                        $meta['title'] ?? $meta['name'],
                        'gutenberg'
                    );
                }
            }
        }

        foreach (Blocks\BlockRegistry::instance()->getAll() as $block) {
            Collections\Gateway\BlockTypeUser::seedOne(
                $block::getName(),
                $block::getTitle(),
                'php'
            );
        }

        foreach (Blocks\JsonBlock\JsonBlockLoader::getAll() as $definition) {
            if (!empty($definition['name'])) {
                Collections\Gateway\BlockTypeUser::seedOne(
                    $definition['name'],
                    $definition['title'] ?? $definition['name'],
                    'json'
                );
            }
        }
    }

    public function registerCollections(): void
    {
        $map = self::getCoreCollectionMap();
        foreach ($map as $key => $class) {
            if (Collections\Gateway\CollectionUser::isActive($key)) {
                $class::register();
            }
        }
    }

    public static function getCoreCollectionMap(): array
    {
        return [
            'wp_post'               => Collections\WP\Post::class,
            'wp_postmeta'           => Collections\WP\PostMeta::class,
            'wp_user'               => Collections\WP\User::class,
            'wp_usermeta'           => Collections\WP\UserMeta::class,
            'wp_comment'            => Collections\WP\Comment::class,
            'wp_commentmeta'        => Collections\WP\CommentMeta::class,
            'wp_term'               => Collections\WP\Term::class,
            'wp_termmeta'           => Collections\WP\TermMeta::class,
            'wp_term_taxonomy'      => Collections\WP\TermTaxonomy::class,
            'wp_term_relationship'  => Collections\WP\TermRelationship::class,
            'wp_option'             => Collections\WP\Option::class,
            'wp_link'               => Collections\WP\Link::class,
        ];
    }

    public function seedCollections()
    {
        foreach (array_keys(self::getCoreCollectionMap()) as $key) {
            Collections\Gateway\CollectionUser::seedOne($key);
        }
    }

    public function getRegistry() { return $this->registry; }
    public function getViewRegistry() { return $this->viewRegistry; }
    public function getPackageRegistry() { return $this->packageRegistry; }
    public function getStandardRoutes() { return $this->standardRoutes; }
    public function getCollectionRoutes() { return $this->collectionRoutes; }
    public function getPatternRegistry() { return $this->patternRegistry; }
    public function getFieldTypeRegistry() { return $this->fieldTypeRegistry; }

    public static function bootEloquent() { Database\DatabaseConnection::boot(); }
    public static function isSQLiteEnvironment() { return Database\DatabaseConnection::isSQLiteEnvironment(); }
    public static function findSQLiteDatabase() { return Database\DatabaseConnection::findSQLiteDatabase(); }

    private function maybeRunMigrations(): void
    {
        $stored_version  = get_option('gateway_tables_schema', '');
        $current_version = GATEWAY_VERSION;
        if ($stored_version === $current_version && $this->coreTablesExist()) {
            set_transient('gateway_tables_installed', true, DAY_IN_SECONDS);
            return;
        }

        $success = Database\MigrationHooks::runCoreMigrations();

        if ($success && $this->coreTablesExist()) {
            update_option('gateway_tables_schema', $current_version, false);
            set_transient('gateway_tables_installed', true, DAY_IN_SECONDS);
        } else {
            set_transient('gateway_tables_installed', false, DAY_IN_SECONDS);
        }
    }

    private function coreTablesExist(): bool
    {
        try {
            $capsule = Database\DatabaseConnection::getCapsule();
            if ($capsule === null) {
                return false;
            }

            $schema = $capsule->getConnection()->getSchemaBuilder();
            if (!$schema || !is_object($schema)) {
                return false;
            }

            return $schema->hasTable('gateway_settings') && 
                   $schema->hasTable('gateway_raptor_extension') && 
                   $schema->hasTable('gateway_raptor_package');
            
        } catch (\Exception $e) {
            return false;
        }
    }

    public function activate()
    {
        if (!Database\DatabaseConnection::testConnection()) { return; }
        Database\MigrationHooks::runCoreMigrations();
        if (!is_dir(GATEWAY_DATA_DIR)) { mkdir(GATEWAY_DATA_DIR, 0755, true); }
        flush_rewrite_rules();
    }

    public function showConnectionNotice(): void
    {
        $settings_url = admin_url('admin.php?page=gateway#/settings/connection');
        echo '<div class="notice notice-error"><p>'
            . '<strong>Gateway:</strong> Cannot connect to the database. '
            . '<a href="' . esc_url($settings_url) . '">Open Gateway Settings</a> '
            . 'to restore the connection.'
            . '</p></div>';
    }

    public function deactivate() { flush_rewrite_rules(); }
}

/**
 * DELAYED BOOTSTRAP FOR LICENSING AND CORE
 * This moves licensing client instantiation to 'init' to prevent 
 * early get_plugin_data() translation calls.
 */
add_action('init', function() {
    // 1. Core Licensing Check
    if ( ! class_exists( 'SureCart\Licensing\Client' ) ) {
        require_once GATEWAY_PATH . 'licensing/src/Client.php';
    }
    
    $client = new \SureCart\Licensing\Client( 'Gateway', 'pt_RomxYGqZkhNpvhHTGwrvMtND', GATEWAY_FILE );
    $opts = get_option( 'gateway_license_options', [] );
    $license_required = (bool) apply_filters( 'gateway_requires_license', true );
    $has_activation = !empty( $opts['sc_activation_id'] );

    if ( $license_required && !$has_activation ) {
        // Fallback only when this copy requires licensing and it's not activated.
        $client->settings()->add_page([
            'type'               => 'menu',
            'page_title'         => 'Gateway — Activate License',
            'menu_title'         => 'Gateway',
            'capability'         => 'manage_options',
            'menu_slug'          => 'gateway',
            'icon_url'           => 'dashicons-admin-plugins',
            'position'           => 30,
            'activated_redirect' => admin_url( 'admin.php?page=gateway' ),
        ]);
        return;
    }

    // 2. Boot the Main Plugin Logic
    Plugin::getInstance()->boot();
    
    // 3. Signal that Gateway is fully ready
    do_action('gateway_plugin_loaded');
    
}, 5);

// A. Signal that Gateway is activated.
do_action('gateway_activated');