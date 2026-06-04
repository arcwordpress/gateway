<?php
/**
 * Plugin Name: Waypoint
 * Description: Multi-set documentation management for WordPress. Extends Gateway.
 * Version: 1.2.0-rc1
 * Author: ARCWP
 */

namespace Waypoint;

if (!defined('ABSPATH')) {
    exit;
}

defined('WAYPOINT_VERSION') || define('WAYPOINT_VERSION', '1.2.0-rc1');
defined('WAYPOINT_PATH')    || define('WAYPOINT_PATH',    plugin_dir_path(__FILE__));
defined('WAYPOINT_URL')     || define('WAYPOINT_URL',     plugin_dir_url(__FILE__));
defined('WAYPOINT_FILE')    || define('WAYPOINT_FILE',    __FILE__);

spl_autoload_register(function ($class) {
    $namespace = 'Waypoint\\';
    if (strpos($class, $namespace) !== 0) {
        return;
    }
    $file = plugin_dir_path(__FILE__) . 'lib/' . str_replace('\\', '/', substr($class, strlen($namespace))) . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});

if (!class_exists('Waypoint\\Plugin')) :
class Plugin {

    private static $instance = null;

    public static function instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        register_activation_hook(WAYPOINT_FILE, [$this, 'activate']);
        add_action('plugins_loaded', [$this, 'init'], 5);
    }

    public function init() {
        $this->register_apps();

        if (!function_exists('gateway_core_active') || !gateway_core_active()) {
            return;
        }

        add_action('gateway_loaded', [$this, 'register_extension'],   5);
        add_action('gateway_loaded',   [$this, 'register_migrations'],   8);
        add_action('gateway_loaded',   [$this, 'register_packages'],    10);
        add_action('gateway_loaded',   [$this, 'register_collections'], 10);
    }

    public function activate() {
        flush_rewrite_rules();
    }

    public function register_apps() {
        $apps_dir = plugin_dir_path(__FILE__) . 'lib/Apps';
        if (!is_dir($apps_dir)) {
            return;
        }
        foreach (glob($apps_dir . '/*.php') as $file) {
            require_once $file;
            $class_name = 'Waypoint\\Apps\\' . basename($file, '.php');
            if (class_exists($class_name) && method_exists($class_name, 'register')) {
                $class_name::register();
            }
        }
    }

    public function register_extension() {
        Extension::register();
    }

    public function register_migrations() {
        $migrations_dir = plugin_dir_path(__FILE__) . 'lib/Migrations';
        if (!is_dir($migrations_dir)) {
            return;
        }
        foreach (glob($migrations_dir . '/*.php') as $file) {
            require_once $file;
            $class_name = 'Waypoint\\Migrations\\' . basename($file, '.php');
            if (class_exists($class_name) && method_exists($class_name, 'register')) {
                $class_name::register();
            }
        }
    }

    public function register_packages() {
        $packages_dir = plugin_dir_path(__FILE__) . 'lib/Packages';
        if (!is_dir($packages_dir)) {
            return;
        }
        foreach (glob($packages_dir . '/*.php') as $file) {
            require_once $file;
            $class_name = 'Waypoint\\Packages\\' . basename($file, '.php');
            if (class_exists($class_name) && method_exists($class_name, 'register')) {
                $class_name::register();
            }
        }
    }

    public function register_collections() {
        $collections_dir = plugin_dir_path(__FILE__) . 'lib/Collections';
        if (!is_dir($collections_dir)) {
            return;
        }
        foreach (glob($collections_dir . '/*.php') as $file) {
            require_once $file;
            $class_name = 'Waypoint\\Collections\\' . basename($file, '.php');
            if (class_exists($class_name) && method_exists($class_name, 'register')) {
                $class_name::register();
            }
        }
    }


}
endif;

Plugin::instance();
