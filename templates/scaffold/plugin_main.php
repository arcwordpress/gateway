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
        
        // Register collections when Gateway is loaded
        add_action('gateway_loaded', [$this, 'register_collections']);
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
     * Activation hook callback
     */
    public function activate() {
        // TODO: Run migrations
        // TODO: Set up initial data
    }
}

// Self-initialize the plugin
Plugin::instance();