<?php

namespace Waypoint\Packages;

use Gateway\Package as GatewayPackage;

class Package extends GatewayPackage
{
    protected $key = 'waypoint';
    protected $label = 'Waypoint';
    protected $description = 'Multi-set documentation management for WordPress';
    protected $icon = 'dashicons-book';
    protected $position = 110;
    protected $capability = 'edit_posts';
    protected $parent = null;
}
