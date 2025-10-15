<?php
/**
 * Plugin Name: Gateway
 * Description: Gateway plugin
 * Version: 1.0.0
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
define('GATEWAY_VERSION', '1.0.0');
define('GATEWAY_PATH', plugin_dir_path(__FILE__));
define('GATEWAY_URL', plugin_dir_url(__FILE__));
define('GATEWAY_FILE', __FILE__);

class Plugin
{
    /**
     * Register SPL autoloader
     */
    private static function autoload()
    {
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
    }

    /**
     * Initialize the plugin
     */
    public static function init()
    {
        // Check for required vendor autoload
        if (!file_exists(GATEWAY_PATH . 'vendor/autoload.php')) {
            add_action('admin_notices', [__CLASS__, 'missingDependenciesNotice']);
            return;
        }

        require_once GATEWAY_PATH . 'vendor/autoload.php';

        // Register autoloader
        self::autoload();

        // Boot Eloquent on plugins_loaded
        add_action('plugins_loaded', [__CLASS__, 'bootEloquent']);

        // Register activation hook
        register_activation_hook(GATEWAY_FILE, [__CLASS__, 'activate']);

        // Initialize admin page
        Admin\Page::init();
    }

    /**
     * Display missing dependencies notice
     */
    public static function missingDependenciesNotice()
    {
        echo '<div class="notice notice-error"><p>';
        echo '<strong>' . esc_html__('Gateway Error:', 'gateway') . '</strong> ';
        echo esc_html__('Required dependencies are missing. Please run composer install.', 'gateway');
        echo '</p></div>';
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
    public static function activate()
    {
        // Run database migrations
        Database\DatabaseMigration::run();
    }
}

// Self-initialize
Plugin::init();
