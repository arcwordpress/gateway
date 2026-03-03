<?php

namespace Gateway\Raptor;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Eloquent model for collections created and managed through the Raptor UI.
 *
 * Records are stored in {prefix}gateway_raptor_collections
 * (e.g. wp_gateway_raptor_collections).
 *
 * These are lightweight collection definitions (title, key, description)
 * persisted to the database, as opposed to the file-based collections
 * managed by the Exta workflow.
 *
 * @property int    $id
 * @property string $collection_key  Slug identifier, e.g. "my_posts"
 * @property string $title           Human-readable name
 * @property string $description
 * @property string $status          "active" | "inactive"
 */
class RaptorCollection extends \Gateway\Collection
{
    protected $key   = 'raptor_collection';

    // WP prefix is prepended automatically, giving wp_gateway_raptor_collections.
    protected $table = 'gateway_raptor_collections';

    // Internal Gateway table — excluded from public collection listings.
    protected $core = true;

    // Managed exclusively via Raptor\CollectionRoutes, not via standard REST.
    protected $routes = [
        'enabled' => false,
    ];

    protected $casts = [
        'relationships' => 'array',
    ];

    public function getFillable(): array
    {
        return [
            'collection_key',
            'title',
            'description',
            'status',
            'relationships',
        ];
    }
}
