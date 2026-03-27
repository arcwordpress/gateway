<?php

namespace Gateway\Integrations\Breakdance;

if (!defined('ABSPATH')) {
    exit;
}

class Breakdance
{
    public static function init(): void
    {
        add_action('breakdance_loaded', function () {
            if (!function_exists('\Breakdance\ElementStudio\registerElementForEditing')) {
                return;
            }

            require_once __DIR__ . '/Elements/GatewayView/element.php';
        }, 9);
    }
}
