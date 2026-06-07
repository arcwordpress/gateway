<?php

namespace Gateway\Raptor;

if (!defined('ABSPATH')) {
    exit;
}

class RaptorController
{
    public static function initEndpoints(): void
    {
        new Endpoints\CollectionRoutes();
        new Endpoints\FieldListRoutes();
        new Endpoints\FieldRoutes();
        new Endpoints\FormListRoutes();
        new Endpoints\FormRoutes();
        new Endpoints\UserLayoutRoutes();
        new Endpoints\RelationshipRoutes();
        new Endpoints\AppRoutes();
    }
}
