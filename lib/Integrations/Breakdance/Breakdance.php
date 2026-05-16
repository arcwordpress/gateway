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

        add_action('breakdance_loaded', [__CLASS__, 'registerElements'], 9);
    }

    public static function registerElements(): void
    {
        require_once __DIR__ . '/Elements/GatewayView/element.php';

        $elementClass = 'Gateway\\Integrations\\Breakdance\\Elements\\GatewayView';
        $elementDir   = __DIR__ . '/Elements/GatewayView';

        // Register the category so elements appear under "Gateway" in the panel.
        if (function_exists('\\Breakdance\\Elements\\addElementCategory')) {
            \Breakdance\Elements\addElementCategory('gateway', 'Gateway', 'dashicons-database');
        }

        // Primary registration path used by third-party plugins.
        if (function_exists('\\Breakdance\\Elements\\registerElement')) {
            \Breakdance\Elements\registerElement($elementClass, $elementDir);
            return;
        }

        // Fallback: some Breakdance versions use only registerElementForEditing
        // as the single registration call.
        if (function_exists('\\Breakdance\\ElementStudio\\registerElementForEditing')) {
            \Breakdance\ElementStudio\registerElementForEditing(
                $elementClass,
                \Breakdance\Util\getDirectoryPathRelativeToPluginFolder($elementDir)
            );
        }
    }
}
