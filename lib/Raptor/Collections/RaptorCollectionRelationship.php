<?php

namespace Gateway\Raptor\Collections;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Eloquent model for directed relationships between Raptor-managed collections.
 *
 * Each row is one directed relationship: source_collection → target_collection,
 * e.g. "posts hasMany comments" or "comment belongsTo post". Multiple
 * relationships between the same pair are fully supported (A→B AND B→A,
 * or two differently-named hasMany relationships between the same collections).
 *
 * @property int    $id
 * @property int    $source_collection_id  FK → gateway_raptor_collection.id
 * @property int    $target_collection_id  FK → gateway_raptor_collection.id
 * @property string $type                  belongsTo | hasMany | hasOne | belongsToMany
 * @property string $method_name           PHP method name on the source model
 * @property string $foreign_key           FK column name (blank = Eloquent default)
 * @property string $owner_key             PK column name on the owner (default: id)
 *
 * @property-read RaptorCollection $sourceCollection
 * @property-read RaptorCollection $targetCollection
 */
class RaptorCollectionRelationship extends \Gateway\Collection
{
    protected $key   = 'raptor_collection_relationship';
    protected $table = 'gateway_raptor_collection_relationship';
    protected $private = true;

    // Managed exclusively via RelationshipRoutes, not via standard REST.
    protected $routes = [
        'enabled' => false,
    ];

    public function getFillable(): array
    {
        return [
            'source_collection_id',
            'target_collection_id',
            'type',
            'method_name',
            'foreign_key',
            'owner_key',
        ];
    }

    public function sourceCollection(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(RaptorCollection::class, 'source_collection_id', 'id');
    }

    public function targetCollection(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(RaptorCollection::class, 'target_collection_id', 'id');
    }

    /**
     * Convenience: return a plain array suitable for API responses,
     * including the denormalized source/target collection keys.
     */
    public function toApiArray(): array
    {
        return [
            'id'          => $this->id,
            'source_key'  => $this->relationLoaded('sourceCollection')
                ? optional($this->sourceCollection)->collection_key
                : null,
            'target_key'  => $this->relationLoaded('targetCollection')
                ? optional($this->targetCollection)->collection_key
                : null,
            'type'        => $this->type,
            'method_name' => $this->method_name,
            'foreign_key' => $this->foreign_key,
            'owner_key'   => $this->owner_key,
        ];
    }
}
