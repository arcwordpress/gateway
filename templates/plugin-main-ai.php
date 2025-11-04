<?php
/**
 * Plugin Name:       Gateway AI Assistant
 * Description:       AI-powered generator for Gateway extensions (Projects)
 * Version:           1.0.0
 * Author:            Your Name
 * License:           GPL-2.0+
 * Text Domain:       gateway-ai
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// -------------------------------------------------------------------
// 1. CONSTANTS (user-editable via UI or wp-config)
define( 'GATEWAY_AI_VERSION',      '1.0.0' );
define( 'GATEWAY_AI_DIR',         plugin_dir_path( __FILE__ ) );
define( 'GATEWAY_AI_URL',         plugin_dir_url( __FILE__ ) );
define( 'GATEWAY_PROJECTS_ROOT', WP_CONTENT_DIR . '/gateway-projects' );

// -------------------------------------------------------------------
// 2. BOOTSTRAP
require_once GATEWAY_AI_DIR . 'includes/class-gateway-ai.php';
Gateway_AI::instance();

// -------------------------------------------------------------------
// 3. ACTIVATION / DEACTIVATION
register_activation_hook( __FILE__, [ 'Gateway_AI', 'activate' ] );
register_deactivation_hook( __FILE__, [ 'Gateway_AI', 'deactivate' ] );