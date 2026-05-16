<?php

namespace Gateway\Integrations\Breakdance;

use function Breakdance\Util\getDirectoryPathRelativeToPluginFolder;

if (!defined('ABSPATH')) {
    exit;
}

class Breakdance
{
    public static function init(): void
    {
        add_action('breakdance_loaded', [__CLASS__, 'registerElements'], 9);
    }

    public static function registerElements(): void
    {
        \Breakdance\ElementStudio\registerSaveLocation(
            getDirectoryPathRelativeToPluginFolder(__DIR__) . '/Elements',
            'Gateway\\Integrations\\Breakdance\\Elements',
            'element',
            'Gateway',
            false
        );
    }
}
