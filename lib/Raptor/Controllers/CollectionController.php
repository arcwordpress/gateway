<?php

namespace Gateway\Raptor\Controllers;

use Gateway\Raptor\Collections\RaptorCollection;
use Gateway\Raptor\Collections\RaptorFieldList;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * MVC-style controller for RaptorCollection lifecycle operations.
 *
 * Keeps orchestration logic out of the model (which stays a plain Eloquent
 * record) and out of the endpoint (which stays focused on HTTP concerns).
 *
 * Currently handles two cross-cutting concerns:
 *  - Auto-provisioning a RaptorFieldList whenever a collection is created.
 *  - Returning the full collection → field list → fields tree for single-
 *    collection responses consumed by the Raptor React frontend.
 */
class CollectionController
{
    /**
     * Create a collection and automatically provision its field list.
     *
     * The field list is always created here so callers never have to remember
     * to do it separately. The returned model does not pre-load nested
     * relations; call withNested() if you need the full tree.
     *
     * @param  array            $attributes Fillable attributes for RaptorCollection::create()
     * @return RaptorCollection
     */
    public static function create(array $attributes): RaptorCollection
    {
        $collection = RaptorCollection::create($attributes);

        RaptorFieldList::create(['collection_id' => $collection->id]);

        return $collection;
    }

    /**
     * Eager-load the field list and all of its fields onto a collection.
     *
     * Returns the collection → fieldList → fields tree so the Raptor frontend
     * can render the full editor state from a single GET /collection/{key}
     * response without issuing additional requests.
     *
     * @param  RaptorCollection $collection
     * @return RaptorCollection
     */
    public static function withNested(RaptorCollection $collection): RaptorCollection
    {
        return $collection->load('fieldList.fields');
    }
}
