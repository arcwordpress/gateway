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

define('GATEWAY_VERSION', '1.3.2');
define('GATEWAY_PATH', plugin_dir_path(__FILE__));
define('GATEWAY_URL', plugin_dir_url(__FILE__));
define('GATEWAY_FILE', __FILE__);
define('GATEWAY_DATA_DIR', WP_CONTENT_DIR . '/gateway');
define('GATEWAY_REQUEST_LOG_DIR', GATEWAY_DATA_DIR . '/requests/logs');

require_once GATEWAY_PATH . 'vendor/autoload.php';
require_once GATEWAY_PATH . 'includes/functions.php';

spl_autoload_register(function ($class) {
    $prefix  = 'Gateway\\';
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
            add_action('admin_notices', [PluginController::class, 'showConnectionNotice']);
            new Endpoints\ConnectionRoute();
            new Migrations\MigrationRoutes();
            Admin\Page::init();
        } else {
            static::bootEloquent();
            $this->init();
        }

        do_action('gateway_loaded');
    }

    private function init()
    {
        new Extensions\ExtensionRoutes();
        new Packages\PackageRoutes();
        Raptor\RaptorController::initEndpoints();
        $this->registry = new Collections\CollectionRegistry();
        $this->packageRegistry = new Packages\PackageRegistry();
        Raptor\Packages\PackageLoader::load();
        $this->fieldTypeRegistry = new Forms\Fields\FieldTypeRegistry();
        new Forms\Fields\FieldTypeRoutes();
        $this->standardRoutes = new Endpoints\StandardRoutes();
        Collections\CoreCollections::register();
        new Collections\CollectionRoutes();
        $this->adminDataRoute = new Endpoints\AdminDataRoute();
        $this->settingsRoute = new Endpoints\SettingsRoute();
        new Endpoints\ConnectionRoute();
        new Endpoints\TestConnectionRoute();
        $this->migrationGeneratorRoute = new Migrations\MigrationGeneratorRoute();
        $this->migrationRunnerRoute = new Migrations\MigrationRunnerRoute();
        new Endpoints\SyncRoute();
        new Migrations\MigrationRoutes();
        new Endpoints\CoreCollectionUserRoute();
        $this->patternRegistry = new Patterns\PatternRegistry();
        Migrations\MigrationHooks::init();
        PluginController::maybeRunMigrations();
        gateway_rest_dispatch_filter();
        Admin\Page::init();
        Admin\Records::init();
        Admin\Builder::init();
        Packages\PackageMenus::init();
        Render\Render::init();
        Raptor\ViewRenderer::init();
        $this->patternRegistry->init();
        Integrations\Gutenberg\BlockRegistry::init();

        do_action('gateway_loaded');
    }

    public function activate()
    {
        if (!is_dir(GATEWAY_DATA_DIR)) {
            mkdir(GATEWAY_DATA_DIR, 0755, true);
        }

        if (!Database\DatabaseConnection::testConnection()) {
            return;
        }
        Migrations\MigrationHooks::runCoreMigrations();
        Collections\CoreCollections::seed();
        flush_rewrite_rules();
    }

    public function deactivate()
    {
        flush_rewrite_rules();
    }

    // --- Public API (called by many lib classes via Plugin::getInstance()) ---

    public function isDbReady(): bool
    {
        return Database\DatabaseController::isDbReady();
    }

    public function getRegistry() { return $this->registry; }
    public function getViewRegistry() { return $this->viewRegistry; }
    public function getPackageRegistry() { return $this->packageRegistry; }
    public function getStandardRoutes() { return $this->standardRoutes; }
    public function getCollectionRoutes() { return $this->collectionRoutes; }
    public function getPatternRegistry() { return $this->patternRegistry; }
    public function getFieldTypeRegistry() { return $this->fieldTypeRegistry; }

    /** @deprecated use Collections\CoreCollections::getMap() */
    public static function getCoreCollectionMap(): array
    {
        return Collections\CoreCollections::getMap();
    }

    /** @deprecated use Collections\CoreCollections::seed() */
    public function seedCollections(): void
    {
        Collections\CoreCollections::seed();
    }

    public static function bootEloquent() { Database\DatabaseConnection::boot(); }
    public static function isSQLiteEnvironment() { return Database\DatabaseConnection::isSQLiteEnvironment(); }
    public static function findSQLiteDatabase() { return Database\DatabaseConnection::findSQLiteDatabase(); }
}

/**
 * DELAYED BOOTSTRAP FOR LICENSING AND CORE
 * Moves licensing client instantiation to 'init' to prevent
 * early get_plugin_data() translation calls.
 */
add_action('init', function () {
    if (!class_exists('SureCart\Licensing\Client')) {
        require_once GATEWAY_PATH . 'licensing/src/Client.php';
    }

    $client = new \SureCart\Licensing\Client('Gateway', 'pt_RomxYGqZkhNpvhHTGwrvMtND', GATEWAY_FILE);
    $opts = get_option('gateway_license_options', []);
    $license_required = (bool) apply_filters('gateway_requires_license', true);
    $has_activation   = !empty($opts['sc_activation_id']);

    if ($license_required && !$has_activation) {
        $client->settings()->add_page([
            'type'               => 'menu',
            'page_title'         => 'Gateway — Activate License',
            'menu_title'         => 'Gateway',
            'capability'         => 'manage_options',
            'menu_slug'          => 'gateway',
            'icon_url'           => 'dashicons-admin-plugins',
            'position'           => 30,
            'activated_redirect' => admin_url('admin.php?page=gateway'),
        ]);
        return;
    }

    Plugin::getInstance()->boot();
    do_action('gateway_plugin_loaded');
}, 5);

do_action('gateway_activated');
