<?php

namespace Gateway\Admin;

if (!defined('ABSPATH')) {
    exit;
}

class Test1
{
    public static function init(): void
    {
        add_action('admin_menu', [__CLASS__, 'registerPage']);
        add_filter('script_loader_tag', [__CLASS__, 'addModuleType'], 10, 3);
    }

    public static function registerPage(): void
    {
        add_menu_page(
            'Test1 Builder',
            'Test1',
            'manage_options',
            'test1',
            [__CLASS__, 'render'],
            'dashicons-welcome-widgets-menus',
            31
        );
    }

    public static function addModuleType(string $tag, string $handle, string $src): string
    {
        if ($handle !== 'gateway-test1') {
            return $tag;
        }
        return '<script type="module" src="' . esc_url($src) . '"></script>' . "\n";
    }

    public static function render(): void
    {
        $url     = GATEWAY_URL . 'js/test1/app.js';
        $version = file_exists(GATEWAY_PATH . 'js/test1/app.js')
            ? md5_file(GATEWAY_PATH . 'js/test1/app.js')
            : GATEWAY_VERSION;

        wp_enqueue_script('gateway-test1', $url, [], $version, true);
        ?>
        <style>
            /* Full-screen canvas layout */
            .gateway-test1-page #wpbody-content { padding: 0 !important; }
            .gateway-test1-page #wpfooter       { display: none; }
            #gw-test1 {
                position: fixed;
                top: 32px;   /* WP admin bar */
                bottom: 0;
                left: 160px; /* default menu width */
                right: 0;
                display: flex;
                flex-direction: column;
                background: #f8fafc;
            }
            .folded #gw-test1 { left: 36px; }
            @media (max-width: 782px) {
                #gw-test1 { top: 46px; left: 0; }
            }
        </style>
        <div id="gw-test1"></div>
        <script>document.body.classList.add('gateway-test1-page');</script>
        <?php
    }
}
