<?php
/**
 * Plugin Name: {{PROJECT_NAME}}
 * Description: A Gateway extension project.
 * Version: 1.0.0
 * Author: Gateway
 * Text Domain: {{PROJECT_SLUG}}
 */

namespace {{NAMESPACE}};

if (!defined('ABSPATH')) {
    exit;
}

defined('{{CONSTANT_PREFIX}}_VERSION') || define('{{CONSTANT_PREFIX}}_VERSION', '1.0.0');
defined('{{CONSTANT_PREFIX}}_DIR')     || define('{{CONSTANT_PREFIX}}_DIR',     plugin_dir_path(__FILE__));
defined('{{CONSTANT_PREFIX}}_URL')     || define('{{CONSTANT_PREFIX}}_URL',     plugin_dir_url(__FILE__));

spl_autoload_register(function ($class) {
    $namespace = '{{NAMESPACE}}\\';
    if (strpos($class, $namespace) !== 0) {
        return;
    }
    $file = plugin_dir_path(__FILE__) . 'lib/' . str_replace('\\', '/', substr($class, strlen($namespace))) . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

if (!class_exists('{{NAMESPACE}}\\Plugin')) :
class Plugin {

    private static $instance = null;

    public static function instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Defer init until all plugins are loaded so gateway_core_active() is
        // available regardless of plugin alphabetical order.
        add_action('plugins_loaded', [$this, 'init'], 5);
    }

    public function init() {
        if (!function_exists('gateway_core_active') || !gateway_core_active()) {
            return;
        }

        add_action('gateway_register', [$this, 'register_extension'], 5);
        add_action('gateway_register', [$this, 'register_packages']);
        add_action('gateway_register', [$this, 'register_collections']);
    }

    public function register_extension() {
        Extension::register();
    }

    public function register_packages() {
        $packages_dir = plugin_dir_path(__FILE__) . 'lib/Packages';
        if (!is_dir($packages_dir)) {
            return;
        }
        foreach (glob($packages_dir . '/*.php') as $file) {
            $class_name = '{{NAMESPACE}}\\Packages\\' . basename($file, '.php');
            if (class_exists($class_name) && method_exists($class_name, 'register')) {
                (new $class_name())->register();
            }
        }
    }

    public function register_collections() {
        $collections_dir = plugin_dir_path(__FILE__) . 'lib/Collections';
        if (!is_dir($collections_dir)) {
            return;
        }
        foreach (glob($collections_dir . '/*.php') as $file) {
            $class_name = '{{NAMESPACE}}\\Collections\\' . basename($file, '.php');
            if (class_exists($class_name) && method_exists($class_name, 'register')) {
                if (!isset($class_name::$registered) || $class_name::$registered) {
                    $class_name::register();
                }
            }
        }
    }

}
endif;

Plugin::instance();
