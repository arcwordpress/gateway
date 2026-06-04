<?php

namespace Waypoint;

if (!defined('ABSPATH')) {
    exit;
}

class Extension extends \Gateway\Extension
{
    protected $key   = 'waypoint';
    protected $title = 'Waypoint';
}
