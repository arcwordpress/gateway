<?php

namespace Gateway\Raptor\Collections;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Eloquent model for extensions created through the Raptor UI.
 *
 * Intentionally NOT a subclass of \Gateway\Extension (the hand-coded-plugin
 * base class) to avoid class and table-name conflicts. Instead it extends
 * \Gateway\Collection so we get Eloquent ORM and REST routing for free.
 *
 * The Eloquent connection uses $wpdb->prefix, so the actual database table
 * is {prefix}gateway_raptor_extension — e.g. wp_gateway_raptor_extension.
 *
 * @property int    $id
 * @property string $extension_key  Slug identifier, e.g. "my_plugin"
 * @property string $title          Human-readable name
 * @property string $description
 * @property string $version        Semantic version, e.g. "1.0.0"
 * @property string $author
 * @property string $author_uri
 * @property string $text_domain
 * @property string $min_wp_version
 * @property string $namespace      PHP namespace for the generated plugin
 * @property string $status         "active" | "inactive"
 *
 * @property-read \Illuminate\Database\Eloquent\Collection<RaptorPackage>    $packages
 * @property-read \Illuminate\Database\Eloquent\Collection<RaptorCollection> $collections
 */
class RaptorExtension extends \Gateway\Collection
{
    protected $key   = 'raptor_extension';

    // Eloquent prepends the connection prefix ($wpdb->prefix), so the real
    // table name becomes wp_gateway_raptor_extension.
    protected $table = 'gateway_raptor_extension';

    // Internal Gateway table — excluded from public collection listings.
    protected $core = true;

    // No public REST routes — managed exclusively via ExtensionCrudRoutes.
    protected $routes = [
        'enabled' => false,
    ];

    /**
     * Field definitions used by the Gateway forms system.
     * These drive form rendering, validation, and labelling in the UI.
     */
    protected $fields = [
        [
            'name'        => 'title',
            'type'        => 'text',
            'label'       => 'Title',
            'required'    => true,
            'placeholder' => 'Ticketify',
        ],
        [
            'name'        => 'description',
            'type'        => 'textarea',
            'label'       => 'Description',
            'required'    => false,
        ],
        [
            'name'        => 'version',
            'type'        => 'text',
            'label'       => 'Version',
            'required'    => false,
            'default'     => '1.0.0',
            'placeholder' => '1.0.0',
        ],
        [
            'name'        => 'author',
            'type'        => 'text',
            'label'       => 'Author',
            'required'    => false,
        ],
        [
            'name'        => 'author_uri',
            'type'        => 'url',
            'label'       => 'Author URI',
            'required'    => false,
            'placeholder' => 'https://',
        ],
        [
            'name'        => 'min_wp_version',
            'type'        => 'text',
            'label'       => 'Min WP Version',
            'required'    => false,
            'default'     => '6.0',
            'placeholder' => '6.0',
        ],
        [
            'name'        => 'namespace',
            'type'        => 'text',
            'label'       => 'PHP Namespace',
            'required'    => false,
            'placeholder' => 'MyExtension',
        ],
    ];

    /**
     * \Gateway\Collection::getFillable() derives from $fields, not $fillable.
     * Override it here so Eloquent's mass-assignment guard uses our explicit list
     * (which includes non-form fields like extension_key, text_domain, status).
     */
    public function getFillable(): array
    {
        return [
            'extension_key',
            'title',
            'description',
            'version',
            'author',
            'author_uri',
            'text_domain',
            'min_wp_version',
            'namespace',
            'status',
        ];
    }

    public function packages(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(RaptorPackage::class, 'extension_id', 'id');
    }

    public function collections(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(RaptorCollection::class, 'extension_id', 'id');
    }
}
