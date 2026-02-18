<?php
/**
 * Plugin Name: Gateway
 * Description: Gateway plugin
 * Version: 1.2.0-rc1
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
define('GATEWAY_VERSION', '1.2.0-rc1');
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
        $this->packageRegistry = new Package\PackageRegistry();
        $this->fieldTypeRegistry = new Forms\Fields\FieldTypeRegistry();
        $this->standardRoutes = new Endpoints\StandardRoutes();
        new Collections\CollectionRoutes();
        $this->adminDataRoute = new Endpoints\AdminDataRoute();
        $this->settingsRoute = new Endpoints\SettingsRoute();
        $this->testConnectionRoute = new Endpoints\TestConnectionRoute();
        $this->migrationGeneratorRoute = new Endpoints\MigrationGeneratorRoute();
        $this->migrationRunnerRoute = new Endpoints\MigrationRunnerRoute();
        $this->mazeRoutes = new Maze\WorkflowRoutes();
        new Exta\Routes();
        new Blocks\BlockRoutes();
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

        // Boot Eloquent on plugins_loaded
        $this->bootEloquent();

        // Hook for any initialization that needs to happen on 'init'
        add_action('init', [$this, 'onInit']);

        // Initialize admin pages
        Admin\Page::init();
        Admin\Records::init();
        Admin\Builder::init(); // Restored Builder admin link
        Package\PackageMenus::init();

        // Initialize front-end forms
        Forms\Render::init();
        Forms\Shortcode::init();

        // Initialize front-end grids
        Grids\Render::init();

        // Initialize front-end filters
        Filters\Render::init();

        // Initialize Gutenberg blocks
        Gutenberg\BlockRegistry::init();

        // Initialize dynamic blocks (programmatic registration and asset enqueuing)
        Blocks\BlockInit::init();

        // Initialize block bindings for collections
        Blocks\BlockBindings::init();

        // Initialize block patterns
        $this->patternRegistry->init();

        // Initialize app page template and SPA routing
        AppTemplate::init();

        // Register core collections.
        add_action('gateway_loaded', [$this, 'registerCollections']);

    }

    public function onInit()
    {
        // Initialize FieldTypeRoutes here after full plugin initialization
        new Forms\Fields\FieldTypeRoutes();
        do_action('gateway_loaded');
    }

    /**
     * Get list of core collections that can be disabled
     *
     * @return array Associative array of collection key => class name
     */
    public static function getCoreCollections()
    {
        return [
            'wp_post' => Collections\WP\Post::class,
            'wp_user' => Collections\WP\User::class,
            'wp_comment' => Collections\WP\Comment::class,
            'wp_option' => Collections\WP\Option::class,
            'wp_postmeta' => Collections\WP\PostMeta::class,
            'wp_usermeta' => Collections\WP\UserMeta::class,
            'wp_commentmeta' => Collections\WP\CommentMeta::class,
            'wp_term' => Collections\WP\Term::class,
            'wp_term_taxonomy' => Collections\WP\TermTaxonomy::class,
            'wp_term_relationship' => Collections\WP\TermRelationship::class,
            'wp_termmeta' => Collections\WP\TermMeta::class,
            'wp_link' => Collections\WP\Link::class,
        ];
    }

    /**
     * Get list of disabled collection keys
     *
     * @return array Array of disabled collection keys
     */
    public static function getDisabledCollections()
    {
        return get_option('gateway_disabled_collections', []);
    }

    public function registerCollections()
    {
        $disabledCollections = self::getDisabledCollections();
        $coreCollections = self::getCoreCollections();

        // Register WordPress core table collections (if not disabled)
        foreach ($coreCollections as $key => $class) {
            if (!in_array($key, $disabledCollections, true)) {
                $class::register();
            }
        }
    }

    /**
     * Object registry getters.
     **/

    public function getRegistry()
    {
        return $this->registry;
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
     * Plugin activation
     */
    public function activate()
    {
        // Auto-configure database driver on first activation
        $this->autoConfigureDatabase();

        // Test database connection before attempting migrations
        // Use testConnection() with the configured timeout from boot()
        if (!Database\DatabaseConnection::testConnection()) {

            $message = 'Gateway plugin activation failed: Unable to connect to database. ';
            $message .= 'Please check your database configuration and try again.';

            // For MySQL, provide additional guidance about port configuration
            if (Database\DatabaseConnection::getDriver() === 'mysql') {
                $message .= '<br><br>';
                $message .= 'If you are using Local WP or another development tool with dynamic database ports, ';
                $message .= 'you may need to configure the connection port in Gateway settings after activation. ';
                $message .= 'Please ensure your database server is running and accessible.';
            }
            
        }

        // Run core migrations via action hook
        Database\MigrationHooks::runCoreMigrations();

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
     * Auto-configure database driver based on environment detection
     */
    private function autoConfigureDatabase()
    {
        $existing_config = get_option('gateway_db_config');

        // Only auto-configure if not already set
        if (empty($existing_config) || !isset($existing_config['driver'])) {
            $is_sqlite = self::isSQLiteEnvironment();

            $default_config = [
                'driver' => $is_sqlite ? 'sqlite' : 'mysql',
            ];

            // Add SQLite-specific configuration
            if ($is_sqlite) {
                $default_config['database'] = self::findSQLiteDatabase();
            }

            update_option('gateway_db_config', $default_config);
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
