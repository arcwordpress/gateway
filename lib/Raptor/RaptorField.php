<?php

namespace Gateway\Raptor;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Eloquent model for individual fields managed through the Raptor field editor.
 *
 * Records are stored in {prefix}gateway_raptor_field
 * (e.g. wp_gateway_raptor_field).
 *
 * Each field belongs to a RaptorFieldList via field_list_id.
 *
 * @property int    $id
 * @property int    $field_list_id  ID of the owning RaptorFieldList
 * @property string $name           snake_case machine name, e.g. "event_date"
 * @property string $type           Field type, e.g. "text", "slug", "date"
 * @property string $label          Human-readable label, e.g. "Event Date"
 * @property int    $sort_order     Zero-based display order within the list
 */
class RaptorField extends \Gateway\Collection
{
    protected $key = 'raptor_field';

    // WP prefix is prepended automatically, giving wp_gateway_raptor_field.
    protected $table = 'gateway_raptor_field';

    // Internal Gateway table — excluded from public collection listings.
    protected $core = true;

    // Managed exclusively via Raptor\FieldRoutes, not via standard REST.
    protected $routes = [
        'enabled' => false,
    ];

    public function getFillable(): array
    {
        return [
            'field_list_id',
            'name',
            'type',
            'label',
            'sort_order',
        ];
    }

    public function fieldList(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(RaptorFieldList::class, 'field_list_id');
    }
}
