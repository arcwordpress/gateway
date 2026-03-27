<?php
/**
 * Plugin Name: Gateway
 * Description: Gateway plugin
 * Version: 1.2.1-rc5
 * Author: ARCWP
 * Author URI: https://arcwp.ca
 * Text Domain: gateway
 */

namespace Gateway;

if (!defined('ABSPATH')) {
    exit;
}

define('GATEWAY_VERSION', '1.2.1-rc5');
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

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private $dbConnection = false;

    private function __construct()
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
            error_log('Gateway: Database connection failed in constructor. Plugin will load in degraded mode.');
            add_action('admin_notices', [$this, 'showConnectionNotice']);
            $this->raptorEndpoints();
            new Endpoints\ConnectionRoute();
            Admin\Page::init();
        } else {
            $this->bootEloquent();
            $this->init();
        }

    }

    private function init()
    {

        error_log('INIT running at 103');

        $this->raptorEndpoints();
        $this->registry = new CollectionRegistry();
        $this->viewRegistry = new Views\ViewRegistry();
        $this->facetRegistry = new Views\Facets\FacetRegistry();
        $this->packageRegistry = new Package\PackageRegistry();
        $this->fieldTypeRegistry = new Forms\Fields\FieldTypeRegistry();
        new Forms\Fields\FieldTypeRoutes();
        $this->standardRoutes = new Endpoints\StandardRoutes();
        new Collections\CollectionRoutes();
        new Views\ViewRoutes();
        $this->adminDataRoute = new Endpoints\AdminDataRoute();
        $this->settingsRoute = new Endpoints\SettingsRoute();
        new Endpoints\ConnectionRoute();
        new Endpoints\TestConnectionRoute();
        $this->migrationGeneratorRoute = new Endpoints\MigrationGeneratorRoute();
        $this->migrationRunnerRoute = new Endpoints\MigrationRunnerRoute();
        new Endpoints\CoreCollectionUserRoute();
        $this->mazeRoutes = new Maze\WorkflowRoutes();
        
        
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
        Views\Render\Shortcode\Shortcode::init();
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

        add_action('init', function () {
            do_action('gateway_loaded');
        }, 5);

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
            'wp_post'              => Collections\WP\Post::class,
            'wp_postmeta'          => Collections\WP\PostMeta::class,
            'wp_user'              => Collections\WP\User::class,
            'wp_usermeta'          => Collections\WP\UserMeta::class,
            'wp_comment'           => Collections\WP\Comment::class,
            'wp_commentmeta'       => Collections\WP\CommentMeta::class,
            'wp_term'              => Collections\WP\Term::class,
            'wp_termmeta'          => Collections\WP\TermMeta::class,
            'wp_term_taxonomy'     => Collections\WP\TermTaxonomy::class,
            'wp_term_relationship' => Collections\WP\TermRelationship::class,
            'wp_option'            => Collections\WP\Option::class,
            'wp_link'              => Collections\WP\Link::class,
        ];
    }

    public function seedCollections()
    {
        foreach (array_keys(self::getCoreCollectionMap()) as $key) {
            Collections\Gateway\CollectionUser::seedOne($key);
        }
    }

    public function getRegistry()
    {
        return $this->registry;
    }

    public function getViewRegistry()
    {
        return $this->viewRegistry;
    }

    public function getFacetRegistry(): Views\Facets\FacetRegistry
    {
        return $this->facetRegistry;
    }

    public function getPackageRegistry()
    {
        return $this->packageRegistry;
    }

    public function getStandardRoutes()
    {
        return $this->standardRoutes;
    }

    public function getCollectionRoutes()
    {
        return $this->collectionRoutes;
    }

    public function getPatternRegistry()
    {
        return $this->patternRegistry;
    }

    public function getFieldTypeRegistry()
    {
        return $this->fieldTypeRegistry;
    }

    public static function bootEloquent()
    {
        Database\DatabaseConnection::boot();
    }

    public static function isSQLiteEnvironment()
    {
        return Database\DatabaseConnection::isSQLiteEnvironment();
    }

    public static function findSQLiteDatabase()
    {
        return Database\DatabaseConnection::findSQLiteDatabase();
    }

    private function maybeRunMigrations(): void
    {
        $stored_version  = get_option('gateway_tables_schema', '');
        $current_version = GATEWAY_VERSION;

        error_log("[Gateway] maybeRunMigrations: stored_version={$stored_version}, current_version={$current_version}");

        if ($stored_version === $current_version && $this->coreTablesExist()) {
            error_log("[Gateway] maybeRunMigrations: Schema up to date and tables exist. Setting transient and returning.");
            set_transient('gateway_tables_installed', true, DAY_IN_SECONDS);
            return;
        }

        error_log("[Gateway] maybeRunMigrations: Running migrations...");
        $success = Database\MigrationHooks::runCoreMigrations();

        if (!$success) {
            error_log("[Gateway] maybeRunMigrations: runCoreMigrations() returned false.");
        }
        if (!$this->coreTablesExist()) {
            error_log("[Gateway] maybeRunMigrations: coreTablesExist() returned false.");
        }
        if ($success && $this->coreTablesExist()) {
            error_log("[Gateway] maybeRunMigrations: Migration succeeded and tables exist. Updating schema version and setting transient.");
            update_option('gateway_tables_schema', $current_version, false);
            set_transient('gateway_tables_installed', true, DAY_IN_SECONDS);
        } else {
            error_log("[Gateway] maybeRunMigrations: Migration failed or tables missing. Setting transient to false.");
            set_transient('gateway_tables_installed', false, DAY_IN_SECONDS);
        }
    }

    private function coreTablesExist(): bool
    {
        try {
            $capsule = Database\DatabaseConnection::getCapsule();
            if ($capsule === null) {
                error_log('NO CAPSULE AT 305');
                return false;
            }

            $schema = $capsule->getConnection()->getSchemaBuilder();
            if (!$schema || !is_object($schema)) {
                error_log('[Gateway] Schema builder is not valid.');
                return false;
            }

            $settings_table  = 'gateway_settings';
            $extension_table = 'gateway_raptor_extension';


            $has_settings = $schema->hasTable($settings_table);
            $has_extension = $schema->hasTable($extension_table);

            error_log("[Gateway] Checking table: {$settings_table} exists? " . ($has_settings ? 'YES' : 'NO'));
            error_log("[Gateway] Checking table: {$extension_table} exists? " . ($has_extension ? 'YES' : 'NO'));

            return $has_settings && $has_extension;
        } catch (\Exception $e) {
            error_log('[Gateway] Exception in coreTablesExist: ' . $e->getMessage());
            return false;
        }
    }

    public function activate()
    {
        if (!Database\DatabaseConnection::testConnection()) {

            return;
        }

        $success = Database\MigrationHooks::runCoreMigrations();

        if (!$success) {
            set_transient('gateway_tables_missing', true, DAY_IN_SECONDS);
            return;
        }

        try {
            $this->createDatabaseSettingsIfMissing();
        } catch (\Exception $e) {
            error_log('Gateway: createDatabaseSettingsIfMissing failed during activation: ' . $e->getMessage());
        }

        if (!is_dir(GATEWAY_DATA_DIR)) {
            mkdir(GATEWAY_DATA_DIR, 0755, true);
        }
        if (!is_dir(GATEWAY_REQUEST_LOG_DIR)) {
            mkdir(GATEWAY_REQUEST_LOG_DIR, 0755, true);
        }

        flush_rewrite_rules();
    }

    public function showConnectionNotice(): void
    {
        $settings_url = admin_url('admin.php?page=gateway#/settings/connection');
        echo '<div class="notice notice-error"><p>'
            . '<strong>Gateway:</strong> Cannot connect to the database. '
            . '<a href="' . esc_url($settings_url) . '">Open Gateway Settings</a> '
            . 'to enter the correct connection details. '
            . 'Migrations will run automatically once the connection is restored.'
            . '</p></div>';
        return;        
    }

    public function showMigrationNotice(): void 
    {
        if (get_transient('gateway_tables_missing')) {
            echo '<div class="notice notice-warning"><p>'
                . '<strong>Gateway:</strong> Database tables are missing . '
                . '<a href="' . esc_url($settings_url) . '">Open Gateway Settings</a> '
                . 'to fix the connection. Tables will be created automatically once the correct database is connected.'
                . '</p></div>';
        }
    }

    private function createDatabaseSettingsIfMissing()
    {
        $is_sqlite   = self::isSQLiteEnvironment();
        $driver      = $is_sqlite ? 'sqlite' : 'mysql';
        $sqlite_path = $is_sqlite ? self::findSQLiteDatabase() : '';

        $settings = Collections\GatewaySettingsCollection::find(1);

        if (!$settings) {
            Collections\GatewaySettingsCollection::create([
                'id'                    => 1,
                'sqlite_path'           => $sqlite_path,
                'anthropic_api_key'     => '',
                'has_anthropic_key'     => false,
                'is_sqlite_environment' => $is_sqlite,
            ]);
        }
    }

    public function deactivate()
    {
        flush_rewrite_rules();
    }
}

Plugin::getInstance();

do_action('gateway_plugin_loaded');