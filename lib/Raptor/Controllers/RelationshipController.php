<?php

namespace Gateway\Raptor\Controllers;

use Gateway\Raptor\Collections\RaptorCollection;
use Gateway\Raptor\Collections\RaptorCollectionRelationship;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Controller for collection-to-collection relationship CRUD.
 *
 * Each relationship is a directed edge: source → target with a type
 * (belongsTo, hasMany, hasOne, belongsToMany) and PHP method name.
 * Multiple relationships between the same pair are fully supported.
 */
class RelationshipController
{
    /**
     * Return all relationships where the given collection is the source,
     * with source/target keys denormalized.
     *
     * @return RaptorCollectionRelationship[]
     */
    public static function forCollection(RaptorCollection $collection): \Illuminate\Database\Eloquent\Collection
    {
        return RaptorCollectionRelationship::where('source_collection_id', $collection->id)
            ->with(['sourceCollection', 'targetCollection'])
            ->orderBy('id')
            ->get();
    }

    /**
     * Create a new relationship between two collections.
     *
     * @throws \InvalidArgumentException if target collection not found or method_name empty
     */
    public static function create(
        RaptorCollection $source,
        string $targetKey,
        string $type,
        string $methodName,
        string $foreignKey = '',
        string $ownerKey   = 'id'
    ): RaptorCollectionRelationship {
        if (!in_array($type, ['belongsTo', 'hasMany', 'hasOne', 'belongsToMany'], true)) {
            throw new \InvalidArgumentException("Invalid relationship type: {$type}");
        }

        if (!$methodName) {
            throw new \InvalidArgumentException('method_name is required.');
        }

        $target = RaptorCollection::where('collection_key', $targetKey)->first();
        if (!$target) {
            throw new \InvalidArgumentException("Target collection \"{$targetKey}\" not found.");
        }

        $rel = RaptorCollectionRelationship::create([
            'source_collection_id' => $source->id,
            'target_collection_id' => $target->id,
            'type'                 => $type,
            'method_name'          => $methodName,
            'foreign_key'          => $foreignKey,
            'owner_key'            => $ownerKey ?: 'id',
        ]);

        $rel->load(['sourceCollection', 'targetCollection']);

        return $rel;
    }

    /**
     * Delete a relationship by ID, verifying it belongs to the given source collection.
     *
     * @throws \InvalidArgumentException if not found or ownership mismatch
     */
    public static function delete(int $id, RaptorCollection $source): void
    {
        $rel = RaptorCollectionRelationship::where('id', $id)
            ->where('source_collection_id', $source->id)
            ->first();

        if (!$rel) {
            throw new \InvalidArgumentException("Relationship #{$id} not found on collection \"{$source->collection_key}\".");
        }

        $rel->delete();
    }

    /**
     * Return a flat array of API-ready relationship data for a collection list response.
     * Expects the collection to have 'collectionRelationships.targetCollection' loaded.
     */
    public static function toApiArray(RaptorCollection $collection): array
    {
        if (!$collection->relationLoaded('collectionRelationships')) {
            return [];
        }

        return $collection->collectionRelationships
            ->map(fn (RaptorCollectionRelationship $r) => [
                'id'          => $r->id,
                'source_key'  => $collection->collection_key,
                'target_key'  => optional($r->targetCollection)->collection_key,
                'type'        => $r->type,
                'method_name' => $r->method_name,
                'foreign_key' => $r->foreign_key,
                'owner_key'   => $r->owner_key,
            ])
            ->values()
            ->all();
    }
}
