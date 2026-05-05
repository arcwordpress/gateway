<?php
/**
 * Plugin Name: {{PROJECT_NAME}}
 * Description: A Gateway extension project.
 * Version: 1.0.0
 * Author: Gateway
 * Text Domain: {{PROJECT_SLUG}}
 */

namespace {{NAMESPACE}};

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Global constants — guard against redefinition when the file is included
// more than once (e.g. Windows path-separator differences + activate_plugin).
defined('{{CONSTANT_PREFIX}}_VERSION') || define('{{CONSTANT_PREFIX}}_VERSION', '1.0.0');
defined('{{CONSTANT_PREFIX}}_DIR')     || define('{{CONSTANT_PREFIX}}_DIR',     plugin_dir_path(__FILE__));
defined('{{CONSTANT_PREFIX}}_URL')     || define('{{CONSTANT_PREFIX}}_URL',     plugin_dir_url(__FILE__));

// Register SPL autoloader FIRST, before the class is used
spl_autoload_register(function($class) {
    // Only autoload classes in this namespace
    $namespace = '{{NAMESPACE}}\\';
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
 * Main plugin class for {{PROJECT_NAME}}
 */
if (!class_exists('{{NAMESPACE}}\\Plugin')) :
class Plugin {

    /**
     * Singleton instance
     */
    private static $instance = null;

    /**
     * Get singleton instance
     */
    public static function instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor - initialize the plugin
     */
    private function __construct() {
        $this->init();
    }

    /**
     * Initialize plugin
     */
    private function init() {
        // Bail if Gateway is not running — gateway_core_active() is provided
        // by Gateway's functions.php and returns false when the plugin is inactive.
        if (!function_exists('gateway_core_active') || !gateway_core_active()) {
            return;
        }

        // Register packages, collections and views when Gateway is loaded
        add_action('gateway_loaded', [$this, 'register_packages']);
        add_action('gateway_loaded', [$this, 'register_collections']);
        add_action('gateway_loaded', [$this, 'register_views']);
    }

    /**
     * Register all packages from lib/Packages directory
     */
    public function register_packages() {
        $packages_dir = plugin_dir_path(__FILE__) . 'lib/Packages';

        if (!is_dir($packages_dir)) {
            return;
        }

        foreach (glob($packages_dir . '/*.php') as $file) {
            $filename   = basename($file, '.php');
            $class_name = '{{NAMESPACE}}\\Packages\\' . $filename;

            if (class_exists($class_name) && method_exists($class_name, 'register')) {
                (new $class_name())->register();
            }
        }
    }

    /**
     * Register all collections from lib/Collections directory
     */
    public function register_collections() {
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
            $class_name = '{{NAMESPACE}}\\Collections\\' . $filename;
            
            // Check if class exists, has register method, and is toggled on
            if (class_exists($class_name) && method_exists($class_name, 'register')) {
                if (!isset($class_name::$registered) || $class_name::$registered) {
                    $class_name::register();
                }
            }
        }
    }
    
    /**
     * Register all views from lib/Views directory
     */
    public function register_views() {
        $views_dir = plugin_dir_path(__FILE__) . 'lib/Views';

        if (!is_dir($views_dir)) {
            return;
        }

        foreach (glob($views_dir . '/*.php') as $file) {
            $filename   = basename($file, '.php');
            $class_name = '{{NAMESPACE}}\\Views\\' . $filename;

            if (class_exists($class_name) && method_exists($class_name, 'register')) {
                $class_name::register();
            }
        }
    }

}
endif; // class_exists guard

/**
 * Bootstrap: only initialise when Gateway itself has loaded.
 *
 * 'gateway_plugin_loaded' is fired by Gateway at the very end of its own
 * plugin file (Plugin.php). Hooking here means:
 *   - If Gateway is inactive this action never fires → extension stays dormant.
 *   - If Gateway is active we are guaranteed its autoloader and core classes
 *     are available before our init() runs.
 *
 * Do NOT call Plugin::instance() unconditionally or on plugins_loaded — that
 * would run before Gateway is ready and requires a fragile class_exists guard.
 */
if (!defined('{{CONSTANT_PREFIX}}_BOOTSTRAP_REGISTERED')) {
    define('{{CONSTANT_PREFIX}}_BOOTSTRAP_REGISTERED', true);
    add_action('gateway_plugin_loaded', function() {
        Plugin::instance();
    }, 10);
}