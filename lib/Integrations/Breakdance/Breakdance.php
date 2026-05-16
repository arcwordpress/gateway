<?php

namespace Gateway\Integrations\Breakdance;

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
            GATEWAY_PATH . 'lib/Integrations/Breakdance/Elements',
            'GatewayElements',
            'element',
            'Gateway',
            false
        );
    }
}
