<?php
/**
 * Plugin Name: Gateway Extension Scaffold
 * Description: A Gateway extension example demonstrating collections, migrations, and hooks.
 * Version: 1.0.0
 * Author: Gateway
 * Text Domain: gateway-extension-scaffold
 * Requires Plugins: gateway
 */

namespace GatewayExtensionScaffold;

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Register SPL autoloader FIRST, before the class is used
spl_autoload_register(function ($class) {
    // Only autoload classes in this namespace
    $namespace = 'GatewayExtensionScaffold\\';
    if (strpos($class, $namespace) !== 0) {
        return;
    }

    // Remove namespace prefix
    $class_name = substr($class, strlen($namespace));

    // Convert namespace separators to directory separators
    $class_name = str_replace('\\', '/', $class_name);

    // Build file path
    $file = plugin_dir_path(__FILE__) . 'lib/' . $class_name . '.php';

    // Load the file if it exists
    if (file_exists($file)) {
        require_once $file;
    }
});

/**
 * Main plugin class for Gateway Extension Scaffold
 *
 * This plugin demonstrates the standard structure for a Gateway extension:
 * - Uses the `gateway_loaded` hook to register collections
 * - Organizes code in a /lib folder with namespaced classes
 * - Includes a migration system for database table creation
 */
class Plugin
{
    /**
     * Plugin version
     */
    const VERSION = '1.0.0';

    /**
     * Singleton instance
     */
    private static $instance = null;

    /**
     * Get singleton instance
     */
    public static function instance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor - initialize the plugin
     */
    private function __construct()
    {
        $this->define_constants();
        $this->init();
    }

    /**
     * Define plugin constants
     */
    private function define_constants()
    {
        define('GATEWAY_EXTENSION_SCAFFOLD_VERSION', self::VERSION);
        define('GATEWAY_EXTENSION_SCAFFOLD_DIR', plugin_dir_path(__FILE__));
        define('GATEWAY_EXTENSION_SCAFFOLD_URL', plugin_dir_url(__FILE__));
    }

    /**
     * Initialize plugin
     */
    private function init()
    {
        // Bail if Gateway is not running — gateway_core_active() is provided
        // by Gateway's functions.php and returns false when the plugin is inactive.
        if (!function_exists('gateway_core_active') || !gateway_core_active()) {
            return;
        }

        // Register activation hook for running migrations
        register_activation_hook(__FILE__, [$this, 'activate']);

        // Register deactivation hook
        register_deactivation_hook(__FILE__, [$this, 'deactivate']);

        // Register collections when Gateway is loaded
        // This hook is fired by the Gateway plugin after it initializes
        add_action('gateway_loaded', [$this, 'register_collections']);
    }

    /**
     * Register all collections from lib/Collections directory
     *
     * This method is called via the `gateway_loaded` action hook.
     * It scans the Collections directory and registers each collection
     * with the Gateway CollectionRegistry.
     */
    public function register_collections()
    {
        $collections_dir = plugin_dir_path(__FILE__) . 'lib/Collections';

        // Check if Collections directory exists
        if (!is_dir($collections_dir)) {
            return;
        }

        // Get all PHP files in Collections directory
        $collection_files = glob($collections_dir . '/*.php');

        foreach ($collection_files as $file) {
            // Get filename without extension
            $filename = basename($file, '.php');

            // Build fully qualified class name
            $class_name = 'GatewayExtensionScaffold\\Collections\\' . $filename;

            // Check if class exists and has register method
            if (class_exists($class_name) && method_exists($class_name, 'register')) {
                $class_name::register();
            }
        }
    }

    /**
     * Activation hook callback
     *
     * Runs database migrations to create required tables.
     */
    public function activate()
    {
        // Run migrations
        $this->run_migrations();

        // Flush rewrite rules for any custom endpoints
        flush_rewrite_rules();
    }

    /**
     * Deactivation hook callback
     */
    public function deactivate()
    {
        // Flush rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Run all database migrations
     *
     * Scans the Database directory and executes each migration class.
     */
    private function run_migrations()
    {
        $database_dir = plugin_dir_path(__FILE__) . 'lib/Database';

        // Check if Database directory exists
        if (!is_dir($database_dir)) {
            return;
        }

        // Get all PHP files in Database directory
        $migration_files = glob($database_dir . '/*.php');

        foreach ($migration_files as $file) {
            // Get filename without extension
            $filename = basename($file, '.php');

            // Build fully qualified class name
            $class_name = 'GatewayExtensionScaffold\\Database\\' . $filename;

            // Check if class exists and has create method
            if (class_exists($class_name) && method_exists($class_name, 'create')) {
                $class_name::create();
            }
        }
    }
}

// Bootstrap via gateway_plugin_loaded so the extension never initialises
// unless Gateway itself is active and fully loaded.
add_action('gateway_plugin_loaded', function () {
    Plugin::instance();
}, 10);
