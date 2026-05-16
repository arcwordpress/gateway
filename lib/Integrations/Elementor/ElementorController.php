<?php

namespace Gateway\Integrations\Elementor;

if (!defined('ABSPATH')) {
    exit;
}

class ElementorController
{
    public static function init(): void
    {
        add_action('elementor/widgets/register', [__CLASS__, 'registerWidgets']);
    }

    public static function registerWidgets(\Elementor\Widgets_Manager $manager): void
    {
        require_once __DIR__ . '/Widgets/Grid.php';
        $manager->register(new Widgets\Grid());
    }
}
