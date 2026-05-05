<?php

namespace Gateway\Integrations\Breakdance;

if (!defined('ABSPATH')) {
    exit;
}

class Breakdance
{
    public static function init(): void
    {
        // Breakdance may have the short legacy class name stored in its element
        // registry from a previous plugin version. Register a prepended autoloader
        // so that any attempt to resolve the old name loads the real class instead.
        spl_autoload_register(static function (string $class): void {
            if ($class === 'Gateway\\Integrations\\GatewayView') {
                require_once __DIR__ . '/Elements/GatewayView/element.php';
                class_alias(
                    'Gateway\\Integrations\\Breakdance\\Elements\\GatewayView',
                    'Gateway\\Integrations\\GatewayView'
                );
            }
        }, true, true);

        add_action('breakdance_loaded', function () {
            if (!function_exists('\Breakdance\ElementStudio\registerElementForEditing')) {
                return;
            }

            require_once __DIR__ . '/Elements/GatewayView/element.php';
        }, 9);
    }
}
