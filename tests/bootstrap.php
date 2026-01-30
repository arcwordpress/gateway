<?php
/**
 * PHPUnit bootstrap file for Gateway plugin tests
 */

// Define test environment constants
define('GATEWAY_TESTS', true);
define('ABSPATH', '/tmp/wordpress/');
define('WP_CONTENT_DIR', '/tmp/wordpress/wp-content');
define('WP_PLUGIN_DIR', WP_CONTENT_DIR . '/plugins');
define('GATEWAY_VERSION', '1.1.10');
define('GATEWAY_PATH', dirname(__DIR__) . '/');
define('GATEWAY_URL', 'http://example.com/wp-content/plugins/gateway/');
define('GATEWAY_FILE', GATEWAY_PATH . 'Plugin.php');
define('GATEWAY_DATA_DIR', WP_CONTENT_DIR . '/gateway');
define('GATEWAY_REQUEST_LOG_DIR', GATEWAY_DATA_DIR . '/requests/logs');

// Ensure directories exist for tests
if (!is_dir(WP_PLUGIN_DIR)) {
    mkdir(WP_PLUGIN_DIR, 0777, true);
}

// Load Composer autoloader
require_once GATEWAY_PATH . 'vendor/autoload.php';

// Mock WordPress functions that are used in tests
if (!function_exists('esc_sql')) {
    function esc_sql($data) {
        if (is_array($data)) {
            return array_map('esc_sql', $data);
        }
        return addslashes($data);
    }
}

if (!function_exists('wp_mkdir_p')) {
    function wp_mkdir_p($target) {
        return mkdir($target, 0777, true);
    }
}

if (!function_exists('current_user_can')) {
    function current_user_can($capability) {
        return true; // All capabilities granted in tests
    }
}

if (!function_exists('rest_url')) {
    function rest_url() {
        return 'http://example.com/wp-json/';
    }
}

if (!function_exists('wp_create_nonce')) {
    function wp_create_nonce($action) {
        return 'test_nonce_' . md5($action);
    }
}

if (!function_exists('is_plugin_active')) {
    function is_plugin_active($plugin) {
        return false;
    }
}

if (!function_exists('activate_plugin')) {
    function activate_plugin($plugin) {
        return true;
    }
}

if (!function_exists('is_wp_error')) {
    function is_wp_error($thing) {
        return $thing instanceof WP_Error;
    }
}

if (!function_exists('add_action')) {
    function add_action($tag, $function_to_add, $priority = 10, $accepted_args = 1) {
        return true;
    }
}

if (!function_exists('do_action')) {
    function do_action($tag, ...$arg) {
        return true;
    }
}

if (!function_exists('register_rest_route')) {
    function register_rest_route($namespace, $route, $args = array(), $override = false) {
        return true;
    }
}

// Mock WP_REST_Response
if (!class_exists('WP_REST_Response')) {
    class WP_REST_Response {
        public $data;
        public $status;

        public function __construct($data = null, $status = 200) {
            $this->data = $data;
            $this->status = $status;
        }
    }
}

// Mock WP_Error
if (!class_exists('WP_Error')) {
    class WP_Error {
        public $errors = [];
        public $error_data = [];

        public function __construct($code = '', $message = '', $data = '') {
            if (!empty($code)) {
                $this->errors[$code][] = $message;
                if (!empty($data)) {
                    $this->error_data[$code] = $data;
                }
            }
        }

        public function get_error_message($code = '') {
            if (empty($code)) {
                $code = $this->get_error_code();
            }
            return isset($this->errors[$code][0]) ? $this->errors[$code][0] : '';
        }

        public function get_error_code() {
            $codes = array_keys($this->errors);
            return $codes[0] ?? '';
        }
    }
}

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

echo "Gateway test environment loaded\n";
