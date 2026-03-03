<?php

namespace Gateway\Raptor\Collections;

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
 * Each collection has exactly one field list (one-to-one).
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

    // Managed exclusively via Raptor\Endpoints\FieldListRoutes, not via standard REST.
    protected $routes = [
        'enabled' => false,
    ];

    public function getFillable(): array
    {
        return [
            'collection_key',
        ];
    }

    public function collection(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(RaptorCollection::class, 'collection_key', 'collection_key');
    }

    public function fields(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(RaptorField::class, 'field_list_id');
    }
}
