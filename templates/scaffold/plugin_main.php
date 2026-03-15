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
class Plugin {
    
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
        $this->define_constants();
        $this->init();
    }
    
    /**
     * Define plugin constants
     */
    private function define_constants() {
        define('{{CONSTANT_PREFIX}}_VERSION', self::VERSION);
        define('{{CONSTANT_PREFIX}}_DIR', plugin_dir_path(__FILE__));
        define('{{CONSTANT_PREFIX}}_URL', plugin_dir_url(__FILE__));
    }
    
    /**
     * Initialize plugin
     */
    private function init() {
        // Register activation hook
        register_activation_hook(__FILE__, [$this, 'activate']);
        
        // Register collections and views when Gateway is loaded
        add_action('gateway_loaded', [$this, 'register_collections']);
        add_action('gateway_loaded', [$this, 'register_views']);
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
            
            // Check if class exists and has register method
            if (class_exists($class_name) && method_exists($class_name, 'register')) {
                $class_name::register();
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

    /**
     * Activation hook callback — creates any registered pages if they don't exist.
     */
    public function activate() {
        $pages_dir = plugin_dir_path(__FILE__) . 'lib/Pages';

        if (!is_dir($pages_dir)) {
            return;
        }

        foreach (glob($pages_dir . '/*.php') as $file) {
            $filename   = basename($file, '.php');
            $class_name = '{{NAMESPACE}}\\Pages\\' . $filename;

            if (class_exists($class_name)) {
                (new $class_name())->create();
            }
        }
    }
}

/**
 * Initialize the plugin with timing-safe Gateway dependency check.
 *
 * We use plugins_loaded (priority 0) to ensure Gateway has had a chance to load first,
 * regardless of plugin loading order. This is more reliable than checking class_exists
 * at the top of the file, which can fail if this extension loads before Gateway.
 *
 * Hooks available for extensions:
 * - 'gateway_plugin_loaded': Fires right after Gateway's plugin file loads (earliest)
 * - 'gateway_loaded': Fires on WordPress 'init' (use for collection registration)
 */
add_action('plugins_loaded', function() {
    // Safety check: ensure Gateway is active
    if (!class_exists('\Gateway\Plugin')) {
        return;
    }

    // Initialize the extension
    Plugin::instance();
}, 0); // Priority 0 to run as early as possible within plugins_loaded