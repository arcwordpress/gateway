<?php

namespace Gateway\Raptor\Collections;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Eloquent model for packages created through the Raptor UI.
 *
 * Each record represents the equivalent of:
 *   class MyPackage extends \Gateway\Package {
 *       protected $key         = 'my-package';
 *       protected $label       = 'My Package';
 *       protected $description = '...';
 *       protected $icon        = 'dashicons-admin-generic';
 *       protected $position    = 20;
 *       protected $capability  = 'manage_options';
 *       protected $parent      = null;
 *   }
 *
 * The WordPress admin menu URL for a package is:
 *   admin.php?page=gateway-package-{package_key}
 *
 * @property int         $id
 * @property string      $package_key  Slug identifier, e.g. "my-package"
 * @property string      $label        Human-readable name
 * @property string      $description
 * @property string      $icon         WordPress dashicon class
 * @property int         $position     WordPress admin menu position
 * @property string      $capability   WordPress capability required to access
 * @property string|null $parent       Parent menu slug for submenus; null = top-level
 * @property string      $status       "active" | "inactive"
 */
class RaptorPackage extends \Gateway\Collection
{
    protected $key   = 'raptor_package';
    protected $table = 'gateway_raptor_package';
    protected $core  = true;

    protected $routes = [
        'enabled' => false,
    ];

    protected $fields = [
        [
            'name'        => 'label',
            'type'        => 'text',
            'label'       => 'Label',
            'required'    => true,
            'placeholder' => 'My Package',
        ],
        [
            'name'     => 'description',
            'type'     => 'textarea',
            'label'    => 'Description',
            'required' => false,
        ],
        [
            'name'        => 'icon',
            'type'        => 'text',
            'label'       => 'Icon',
            'required'    => false,
            'default'     => 'dashicons-admin-generic',
            'placeholder' => 'dashicons-admin-generic',
        ],
        [
            'name'        => 'position',
            'type'        => 'number',
            'label'       => 'Menu Position',
            'required'    => false,
            'default'     => 20,
        ],
        [
            'name'        => 'capability',
            'type'        => 'text',
            'label'       => 'Capability',
            'required'    => false,
            'default'     => 'manage_options',
            'placeholder' => 'manage_options',
        ],
        [
            'name'        => 'parent',
            'type'        => 'text',
            'label'       => 'Parent Menu Slug',
            'required'    => false,
            'placeholder' => 'options-general.php',
        ],
    ];

    public function getFillable(): array
    {
        return [
            'package_key',
            'extension_key',
            'label',
            'description',
            'icon',
            'position',
            'capability',
            'parent',
            'status',
        ];
    }
}
