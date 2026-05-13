<?php

namespace Gateway\Extensions;

if (!defined('ABSPATH')) {
    exit;
}

class PackageRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes() {

    }

}