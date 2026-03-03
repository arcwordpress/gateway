<?php

namespace Gateway\Raptor;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Eloquent model for field lists managed through the Raptor field editor.
 *
 * Records are stored in {prefix}gateway_raptor_field_list
 * (e.g. wp_gateway_raptor_field_list).
 *
 * A collection may have one or more field lists (one-to-many).
 * The collection_key is a string slug — the collection may only exist in code.
 *
 * @property int    $id
 * @property string $collection_key  Slug of the owning collection, e.g. "event"
 */
class RaptorFieldList extends \Gateway\Collection
{
    protected $key = 'raptor_field_list';

    // WP prefix is prepended automatically, giving wp_gateway_raptor_field_list.
    protected $table = 'gateway_raptor_field_list';

    // Internal Gateway table — excluded from public collection listings.
    protected $core = true;

    // Managed exclusively via Raptor\FieldListRoutes, not via standard REST.
    protected $routes = [
        'enabled' => false,
    ];

    public function getFillable(): array
    {
        return [
            'collection_key',
        ];
    }
}
