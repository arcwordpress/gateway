<?php

namespace Gateway\Raptor\Collections;

if (!defined('ABSPATH')) {
    exit;
}

class RaptorFacet extends \Gateway\Collection
{
    protected $key = 'raptor_facet';

    protected $table = 'gateway_raptor_facet';

    protected $core = true;

    protected $routes = [
        'enabled' => false,
    ];

    protected $casts = [
        'config'     => 'array',
        'sort_order' => 'integer',
    ];

    public function getFillable(): array
    {
        return [
            'facet_list_id',
            'label',
            'field_name',
            'facet_type',
            'config',
            'sort_order',
        ];
    }

    public function facetList(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(RaptorFacetList::class, 'facet_list_id', 'id');
    }
}
