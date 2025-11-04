<?php
/**
 * Plugin Name: Gateway
 * Description: Gateway plugin
 * Version: 1.1.2
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
define('GATEWAY_VERSION', '1.1.2');
define('GATEWAY_PATH', plugin_dir_path(__FILE__));
define('GATEWAY_URL', plugin_dir_url(__FILE__));
define('GATEWAY_FILE', __FILE__);

require_once GATEWAY_PATH . 'vendor/autoload.php';

// Register SPL autoloader for Gateway classes
spl_autoload_register(function ($class) {
    $prefix = 'Gateway\\';
    $base_dir = GATEWAY_PATH . 'includes/';

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
    private $standardRoutes;
    private $collectionRoutes;
    private $adminDataRoute;
    private $settingsRoute;
    private $testConnectionRoute;
    private $migrationGeneratorRoute;

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
        $this->standardRoutes = new Endpoints\StandardRoutes();
        $this->collectionRoutes = new CollectionRoutes();
        $this->adminDataRoute = new Endpoints\AdminDataRoute();
        $this->settingsRoute = new Endpoints\SettingsRoute();
        $this->testConnectionRoute = new Endpoints\TestConnectionRoute();
        $this->migrationGeneratorRoute = new Endpoints\MigrationGeneratorRoute();
        $this->init();
    }

    /**
     * Initialize the plugin
     */
    private function init()
    {
        // Boot Eloquent on plugins_loaded
        add_action('plugins_loaded', [__CLASS__, 'bootEloquent']);

        // Register activation and deactivation hooks
        register_activation_hook(GATEWAY_FILE, [$this, 'activate']);
        register_deactivation_hook(GATEWAY_FILE, [$this, 'deactivate']);

        // Hook for any initialization that needs to happen on 'init'
        add_action('init', [$this, 'onInit']);

        // Initialize admin pages
        Admin\Page::init();
        Admin\CollectionMenus::init();

        // Initialize front-end forms
        Forms\Render::init();
        Forms\Shortcode::init();

        // Initialize front-end grids
        Grid\Render::init();

        // Initialize front-end filters
        Filters\Render::init();

        // Initialize Gutenberg blocks
        Gutenberg\BlockRegistry::init();

    }

    public function onInit()
    {
        do_action('gateway_loaded');
    }

    public function getRegistry()
    {
        return $this->registry;
    }

    public function getStandardRoutes()
    {
        return $this->standardRoutes;
    }

    public function getCollectionRoutes()
    {
        return $this->collectionRoutes;
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
        // Run database migrations
        Database\DatabaseMigration::run();

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
