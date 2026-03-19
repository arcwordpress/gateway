<?php

namespace Gateway\Raptor\Collections;

if (!defined('ABSPATH')) {
    exit;
}

class RaptorFacetList extends \Gateway\Collection
{
    protected $key = 'raptor_facet_list';

    protected $table = 'gateway_raptor_facet_list';

    protected $core = true;

    protected $routes = [
        'enabled' => false,
    ];

    public function getFillable(): array
    {
        return [
            'view_id',
        ];
    }

    public function view(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(RaptorView::class, 'view_id', 'id');
    }

    public function facets(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(RaptorFacet::class, 'facet_list_id')
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc');
    }
}
