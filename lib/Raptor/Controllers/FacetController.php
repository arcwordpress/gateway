<?php

namespace Gateway\Raptor\Controllers;

use Gateway\Raptor\Collections\RaptorFacet;
use Gateway\Raptor\Collections\RaptorFacetList;
use Gateway\Raptor\Collections\RaptorView;

if (!defined('ABSPATH')) {
    exit;
}

class FacetController
{
    public static function getOrCreateFacetList(RaptorView $view): RaptorFacetList
    {
        $list = RaptorFacetList::where('view_id', $view->id)->first();

        if (!$list) {
            $list = RaptorFacetList::create(['view_id' => $view->id]);
        }

        return $list;
    }

    public static function getForView(RaptorView $view)
    {
        $list = RaptorFacetList::where('view_id', $view->id)
            ->with(['facets'])
            ->first();

        if (!$list) {
            return collect();
        }

        return $list->facets;
    }

    public static function create(RaptorView $view, array $attributes): RaptorFacet
    {
        $list = self::getOrCreateFacetList($view);

        return RaptorFacet::create(array_merge($attributes, ['facet_list_id' => $list->id]));
    }

    public static function update(RaptorFacet $facet, array $attributes): RaptorFacet
    {
        $facet->update($attributes);
        return $facet->fresh();
    }

    public static function delete(RaptorFacet $facet): bool
    {
        return $facet->delete();
    }

    public static function find(int $id): ?RaptorFacet
    {
        return RaptorFacet::find($id);
    }
}
