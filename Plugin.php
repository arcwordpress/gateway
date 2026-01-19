<?php
/**
 * Plugin Name: Gateway
 * Description: Gateway plugin
 * Version: 1.1.10
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
define('GATEWAY_VERSION', '1.1.10');
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

use Gateway\Collections\GatewayProject;

class Plugin
{
    private static $instance = null;
    private $registry;
    private $packageRegistry;
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
        // Boot Eloquent on plugins_loaded
        $this->bootEloquent();

        // Hook for any initialization that needs to happen on 'init'
        add_action('init', [$this, 'onInit']);

        // Initialize admin pages
        Admin\Page::init();
        Admin\Records::init();
        // Admin\Builder::init(); // Removed Builder admin link
        Package\PackageMenus::init();

        // Initialize front-end forms
        Forms\Render::init();
        Forms\Shortcode::init();

        // Initialize front-end grids
        Grid\Render::init();

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

        // Register core collections. 
        add_action('gateway_loaded', [$this, 'registerCollections']);

    }

    public function onInit()
    {
        do_action('gateway_loaded');

        // Register activation and deactivation hooks
        register_activation_hook(GATEWAY_FILE, [$this, 'activate']);
        register_deactivation_hook(GATEWAY_FILE, [$this, 'deactivate']);
    }

    public function registerCollections()
    {
        // Gateway collections
        Collections\GatewayProject::register();

        // WordPress core table collections
        Collections\WP\Post::register();
        Collections\WP\User::register();
        Collections\WP\Comment::register();
        Collections\WP\Option::register();
        Collections\WP\PostMeta::register();
        Collections\WP\UserMeta::register();
        Collections\WP\CommentMeta::register();
        Collections\WP\Term::register();
        Collections\WP\TermTaxonomy::register();
        Collections\WP\TermRelationship::register();
        Collections\WP\TermMeta::register();
        Collections\WP\Link::register();
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

    /**
     * Boot Eloquent ORM
     */
    public static function bootEloquent()
    {
        Database\DatabaseConnection::boot();
    }

    /**
     * Plugin activation
     */
    public function activate()
    {
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

            wp_die(
                $message,
                'Gateway Activation Error',
                ['back_link' => true, 'response' => 500]
            );
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
     * Plugin deactivation
     */
    public function deactivate()
    {
        flush_rewrite_rules();
    }
}

// Initialize plugin
Plugin::getInstance();
