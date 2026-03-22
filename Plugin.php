<?php
/**
 * Plugin Name: Gateway
 * Description: Gateway plugin
 * Version: 1.2.1-rc4
 * Author: ARCWP
 * Author URI: https://arcwp.ca
 * Text Domain: gateway
 */

namespace Gateway;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('GATEWAY_VERSION', '1.2.1-rc4');
define('GATEWAY_PATH', plugin_dir_path(__FILE__));
define('GATEWAY_URL', plugin_dir_url(__FILE__));
define('GATEWAY_FILE', __FILE__);
define('GATEWAY_DATA_DIR', WP_CONTENT_DIR . '/gateway');
define('GATEWAY_REQUEST_LOG_DIR', GATEWAY_DATA_DIR . '/requests/logs');

require_once GATEWAY_PATH . 'vendor/autoload.php';
require_once GATEWAY_PATH . 'includes/functions.php';

// Register SPL autoloader for Gateway classes
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
    private $testConnectionRoute;
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

    private function __construct()
    {
        $this->registry = new CollectionRegistry();
        $this->viewRegistry = new Views\ViewRegistry();
        $this->facetRegistry = new Views\Facets\FacetRegistry();
        $this->packageRegistry = new Package\PackageRegistry();
        $this->fieldTypeRegistry = new Forms\Fields\FieldTypeRegistry();
        $this->standardRoutes = new Endpoints\StandardRoutes();
        new Collections\CollectionRoutes();
        new Views\ViewRoutes();
        $this->adminDataRoute = new Endpoints\AdminDataRoute();
        $this->settingsRoute = new Endpoints\SettingsRoute();
        $this->testConnectionRoute = new Endpoints\TestConnectionRoute();
        $this->migrationGeneratorRoute = new Endpoints\MigrationGeneratorRoute();
        $this->migrationRunnerRoute = new Endpoints\MigrationRunnerRoute();
        new Endpoints\CoreCollectionUserRoute();
        $this->mazeRoutes = new Maze\WorkflowRoutes();
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
        new Blocks\BlockRoutes();
        new Blocks\JsonBlock\JsonBlockRoutes();
        // Defer FieldTypeRoutes to onInit to avoid early initialization issues
        $this->patternRegistry = new Patterns\PatternRegistry();

        // Initialize migration hooks
        Database\MigrationHooks::init();

        $this->init();
    }

    /**
     * Initialize the plugin
     */
    private function init()
    {
        // Register activation and deactivation hooks early (must be during plugin load)
        register_activation_hook(GATEWAY_FILE, [$this, 'activate']);
        register_deactivation_hook(GATEWAY_FILE, [$this, 'deactivate']);

        // Boot Eloquent before running migrations so that migrateFromOptions()
        // can use Eloquent models (e.g. GatewaySettingsCollection::find()).
        $this->bootEloquent();

        // Re-run core migrations whenever the plugin version changes.
        // register_activation_hook only fires on manual (de)activate, not on updates,
        // so schema changes added after the initial install would never be applied.
        // dbDelta() is idempotent — it only adds missing columns/keys, never drops them.
        $this->maybeRunMigrations();

        // Show admin notice when DB connection failed at activation and migrations are pending.
        add_action('admin_notices', [$this, 'showConnectionNotice']);

        // Hook for any initialization that needs to happen on 'init'
        add_action('init', [$this, 'onInit']);

        // Initialize admin pages
        Admin\Page::init();
        Admin\Records::init();
        Admin\Builder::init(); // Builder now runs the Raptor app
        Package\PackageMenus::init();

        // Initialize front-end forms
        Forms\Render::init();
        Forms\Shortcode::init();

        // Initialize experimental rendering system
        Render\Render::init();

        // Initialize stable view shortcode registry: [gateway_view key="..."]
        Views\Render\Shortcode\Shortcode::init();

        // Initialize front-end views with Interactivity API
        Raptor\ViewRenderer::init();

        // Initialize front-end filters
        Filters\Render::init();

        // Initialize Gutenberg blocks
        Gutenberg\BlockRegistry::init();

        // Initialize dynamic blocks (programmatic registration and asset enqueuing)
        Blocks\BlockInit::init();

        // Initialize JSON-only block registration (schema/blocks/types/*.json)
        Blocks\JsonBlock\JsonBlockRegistrar::init();

        // Initialize block bindings for collections
        Blocks\BlockBindings::init();

        // Initialize block patterns
        $this->patternRegistry->init();

        // Initialize app page template and SPA routing
        AppTemplate::init();

        // Register internal gateway collections, then core WP collections.
        add_action('gateway_loaded', [$this, 'registerCollections']);

        // Seed block type and collection user tables after registration.
        add_action('gateway_loaded', [$this, 'seedBlockTypes'], 20);
        add_action('gateway_loaded', [$this, 'seedCollections'], 20);

    }

    public function onInit()
    {
        // Initialize FieldTypeRoutes here after full plugin initialization
        new Forms\Fields\FieldTypeRoutes();
        do_action('gateway_loaded');
    }

    /**
     * Core WP table collection map, keyed by collection key.
     *
     * @return array<string, class-string>
     */
    public static function getCoreCollectionMap(): array
    {
        return [
            'wp_post'              => Collections\WP\Post::class,
            'wp_user'              => Collections\WP\User::class,
            'wp_comment'           => Collections\WP\Comment::class,
            'wp_option'            => Collections\WP\Option::class,
            'wp_postmeta'          => Collections\WP\PostMeta::class,
            'wp_usermeta'          => Collections\WP\UserMeta::class,
            'wp_commentmeta'       => Collections\WP\CommentMeta::class,
            'wp_term'              => Collections\WP\Term::class,
            'wp_term_taxonomy'     => Collections\WP\TermTaxonomy::class,
            'wp_term_relationship' => Collections\WP\TermRelationship::class,
            'wp_termmeta'          => Collections\WP\TermMeta::class,
            'wp_link'              => Collections\WP\Link::class,
        ];
    }

    /**
     * Register internal Gateway collections and core WP collections.
     *
     * Internal collections (BlockTypeUser, CollectionUser) are always
     * registered — they are structural and required by the plugin.
     *
     * Core WP collections are only registered when their active flag is true
     * in the CollectionUser table (defaults to true when no row exists).
     */
    public function registerCollections()
    {
        // Always register internal structural collections first.
        Collections\Gateway\BlockTypeUser::register();
        Collections\Gateway\CollectionUser::register();
        Collections\GatewaySettingsCollection::register();

        // Register core WP collections, gated by CollectionUser active flag.
        foreach (self::getCoreCollectionMap() as $key => $class) {
            if (Collections\Gateway\CollectionUser::isActive($key)) {
                $class::register();
            }
        }
    }

    /**
     * Seed the gateway_block_type_users table.
     *
     * Enumerates block types from all three registration systems and inserts
     * a row with active = 1 for any slug not yet recorded. Existing rows
     * (including user-set active = 0) are never overwritten.
     */
    public function seedBlockTypes()
    {
        // 1. Gutenberg / React blocks (react/block-types/build/blocks/*/block.json)
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

        // 2. PHP-class blocks (registered via BlockInit::registerInternalBlocks)
        foreach (Blocks\BlockRegistry::instance()->getAll() as $block) {
            Collections\Gateway\BlockTypeUser::seedOne(
                $block::getName(),
                $block::getTitle(),
                'php'
            );
        }

        // 3. JSON schema blocks (schema/blocks/types/*.json)
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

    /**
     * Seed the gateway_collection_users table.
     *
     * Inserts a row with active = 1 for each core WP collection key that
     * does not yet have a record. Existing rows are never overwritten.
     */
    public function seedCollections()
    {
        foreach (array_keys(self::getCoreCollectionMap()) as $key) {
            Collections\Gateway\CollectionUser::seedOne($key);
        }
    }

    /**
     * Object registry getters.
     **/

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

    /**
     * Boot Eloquent ORM
     */
    public static function bootEloquent()
    {
        Database\DatabaseConnection::boot();
    }

    /**
     * Detect if WordPress is using SQLite
     *
     * @return bool
     */
    public static function isSQLiteEnvironment()
    {
        return Database\DatabaseConnection::isSQLiteEnvironment();
    }

    /**
     * Find SQLite database file path
     *
     * @return string Path to SQLite database
     */
    public static function findSQLiteDatabase()
    {
        return Database\DatabaseConnection::findSQLiteDatabase();
    }

    /**
     * Run core migrations if the stored schema version differs from the current
     * plugin version.  Called on every request but exits immediately when the
     * version matches, so the overhead is a single get_option() call.
     */
    private function maybeRunMigrations(): void
    {
        $stored = get_option('gateway_schema_version', '');
        if ($stored === GATEWAY_VERSION) {
            return;
        }

        // Don't attempt migrations if the DB connection is unavailable (e.g. wrong port).
        // gateway_schema_version is intentionally left unset so the next request retries
        // automatically once the port is corrected in Gateway Settings.
        if (!Database\DatabaseConnection::testConnection()) {
            return;
        }

        $success = Database\MigrationHooks::runCoreMigrations();

        if (!$success) {
            // Connection is reachable but tables could not be created — flag for notice.
            set_transient('gateway_tables_missing', true, DAY_IN_SECONDS);
            return;
        }

        delete_transient('gateway_migrations_pending');
        delete_transient('gateway_tables_missing');
        update_option('gateway_schema_version', GATEWAY_VERSION, false);
    }

    /**
     * Plugin activation
     */
    public function activate()
    {
        // If the database connection is unavailable (e.g. non-standard port in Local WP),
        // skip migrations and defer them. An admin notice will guide the user to fix the
        // port in Gateway Settings; reloading any admin page will then retry automatically.
        if (!Database\DatabaseConnection::testConnection()) {
            set_transient('gateway_migrations_pending', true, DAY_IN_SECONDS);
            return;
        }

        // Connection is healthy — clear any stale deferral flags and run migrations first.
        // The gateway_settings table is created here, so autoConfigureDatabase() must
        // run after this point (it writes to that table via Eloquent).
        delete_transient('gateway_migrations_pending');
        $success = Database\MigrationHooks::runCoreMigrations();

        if (!$success) {
            // Connection is reachable but tables couldn't be created (e.g. Eloquent and
            // $wpdb are pointing to different DB files). Show the "run migrations" notice.
            set_transient('gateway_tables_missing', true, DAY_IN_SECONDS);
            return;
        }

        delete_transient('gateway_tables_missing');

        // Auto-configure database driver (table now exists).
        try {
            $this->autoConfigureDatabase();
        } catch (\Exception $e) {
            error_log('Gateway: autoConfigureDatabase failed during activation: ' . $e->getMessage());
        }

        // Create directories for request log tracking
        if (!is_dir(GATEWAY_DATA_DIR)) {
            mkdir(GATEWAY_DATA_DIR, 0755, true);
        }
        if (!is_dir(GATEWAY_REQUEST_LOG_DIR)) {
            mkdir(GATEWAY_REQUEST_LOG_DIR, 0755, true);
        }

        // Flush rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Show admin notices for two degraded-mode scenarios:
     *
     * 1. gateway_migrations_pending — DB connection unavailable (wrong port, unreachable host).
     *    Set by activate() / cleared by maybeRunMigrations() once the connection comes back.
     *
     * 2. gateway_tables_missing — connection is fine but core tables could not be created
     *    (e.g. Eloquent and $wpdb targeting different files, dbDelta failure, etc.).
     *    Set by activate() / maybeRunMigrations() on failure; cleared on the next successful run.
     */
    public function showConnectionNotice(): void
    {
        if (!current_user_can('manage_options')) {
            return;
        }

        $settings_url = admin_url('admin.php?page=gateway-settings');

        if (get_transient('gateway_migrations_pending')) {
            echo '<div class="notice notice-warning"><p>'
                . '<strong>Gateway:</strong> The database connection failed — migrations have not run yet. '
                . 'Please configure the correct connection port in '
                . '<a href="' . esc_url($settings_url) . '">Gateway Settings</a>. '
                . 'Migrations will run automatically once the connection is restored.'
                . '</p></div>';
        }

        if (get_transient('gateway_tables_missing')) {
            echo '<div class="notice notice-warning"><p>'
                . '<strong>Gateway:</strong> Core database tables are missing. '
                . 'Please visit <a href="' . esc_url($settings_url) . '">Gateway Settings</a> '
                . 'to run core migrations.'
                . '</p></div>';
        }
    }

    /**
     * Auto-configure database driver based on environment detection.
     * Called during activation, after runCoreMigrations() has created the gateway_settings table.
     */
    private function autoConfigureDatabase()
    {
        $is_sqlite   = self::isSQLiteEnvironment();
        $driver      = $is_sqlite ? 'sqlite' : 'mysql';
        $sqlite_path = $is_sqlite ? self::findSQLiteDatabase() : '';

        $settings = Collections\GatewaySettingsCollection::find(1);

        if (!$settings) {
            // Fresh install — create the singleton settings row.
            Collections\GatewaySettingsCollection::create([
                'id'                    => 1,
                'db_driver'             => $driver,
                'connection_port'       => '',
                'sqlite_path'           => $sqlite_path,
                'anthropic_api_key'     => '',
                'has_anthropic_key'     => false,
                'is_sqlite_environment' => $is_sqlite,
            ]);
        } else {
            // Row may already exist (e.g. from migrateFromOptions).
            // Correct the driver if our detection disagrees (handles fresh SQLite installs
            // where migrateFromOptions defaulted to 'mysql' because no wp_options existed).
            if ($settings->db_driver !== $driver) {
                $settings->db_driver = $driver;
                if ($is_sqlite && empty($settings->sqlite_path)) {
                    $settings->sqlite_path = $sqlite_path;
                }
                $settings->is_sqlite_environment = $is_sqlite;
                $settings->save();
            }
        }
    }

    /**
     * Plugin deactivation
     */
    public function deactivate()
    {
        flush_rewrite_rules();
    }
}

// Initialize plugin
Plugin::getInstance();

/**
 * Action: gateway_plugin_loaded
 *
 * Fires immediately after the Gateway plugin has fully loaded.
 * This is the EARLIEST hook available for extensions that need to run
 * setup before WordPress 'init'.
 *
 * Extensions should use this hook with plugins_loaded for timing-safe initialization:
 *
 *     add_action('plugins_loaded', function() {
 *         if (!class_exists('\Gateway\Plugin')) {
 *             return;
 *         }
 *         // Your early initialization here
 *     }, 0);
 *
 * Or hook directly into gateway_plugin_loaded for post-Gateway setup:
 *
 *     add_action('gateway_plugin_loaded', function() {
 *         // Gateway is guaranteed to be loaded here
 *     });
 *
 * For collection registration, use the later 'gateway_loaded' hook instead,
 * which fires on WordPress 'init'.
 */
do_action('gateway_plugin_loaded');
