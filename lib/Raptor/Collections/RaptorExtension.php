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
     * \Gateway\Collection::getFillable() derives from $fields, not $fillable.
     * Override it here so Eloquent's mass-assignment guard uses our explicit list.
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
}
