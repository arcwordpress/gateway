<?php

namespace Gateway\Admin;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class FormTestPage
{
    /**
     * Initialize the form test page
     */
    public static function init()
    {
        add_action('admin_menu', [__CLASS__, 'add_submenu_page']);
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueue_form_app']);
    }

    /**
     * Enqueue the React form app
     */
    public static function enqueue_form_app($hook)
    {
        // Only load on our form test page
        if ($hook !== 'gateway_page_gateway-form-test') {
            return;
        }

        $asset_file = GATEWAY_PATH . 'react/apps/form/build/index.asset.php';

        if (!file_exists($asset_file)) {
            return;
        }

        $asset = require $asset_file;
        $build_url = GATEWAY_URL . 'react/apps/form/build/';

        wp_enqueue_script(
            'gateway-form-app',
            $build_url . 'index.js',
            $asset['dependencies'],
            $asset['version'],
            true
        );

        wp_enqueue_style(
            'gateway-form-app',
            $build_url . 'index.css',
            [],
            $asset['version']
        );

        // Localize script with collection key
        wp_localize_script(
            'gateway-form-app',
            'gatewayFormConfig',
            [
                'collectionKey' => 'tests', // TestCollection key
                'recordId' => isset($_GET['record_id']) ? intval($_GET['record_id']) : null,
                'nonce' => wp_create_nonce('wp_rest'),
                'root' => esc_url_raw(rest_url())
            ]
        );
    }

    /**
     * Add submenu page under Gateway
     */
    public static function add_submenu_page()
    {
        add_submenu_page(
            'gateway',                  // Parent slug
            'Form Test',                // Page title
            'Form Test',                // Menu title
            'manage_options',           // Capability
            'gateway-form-test',        // Menu slug
            [__CLASS__, 'render_page']  // Callback
        );
    }

    /**
     * Render the form test page
     */
    public static function render_page()
    {
        ?>
        <div class="wrap">
            <h1>Form Test - Test Collection</h1>
            <p>This form is generated from the TestCollection fields configuration.</p>

            <div
                data-blueprint-form
                data-collection="tests"
                <?php if (isset($_GET['record_id'])): ?>
                    data-record-id="<?php echo esc_attr(intval($_GET['record_id'])); ?>"
                <?php endif; ?>
            ></div>
        </div>
        <?php
    }
}
