<?php

namespace Gateway\Raptor\Collections;

if (!defined('ABSPATH')) {
    exit;
}

class RaptorView extends \Gateway\Collection
{
    protected $key = 'raptor_view';

    protected $table = 'gateway_raptor_view';

    protected $core = true;

    protected $routes = [
        'enabled' => false,
    ];

    protected $casts = [
        'columns' => 'array',
        'facet_filters' => 'array',
        'default_sort' => 'array',
        'per_page' => 'integer',
    ];

    public function getFillable(): array
    {
        return [
            'view_key',
            'collection_id',
            'title',
            'description',
            'status',
            'source',
            'columns',
            'facet_filters',
            'default_sort',
            'per_page',
        ];
    }

    public function collection(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(RaptorCollection::class, 'collection_id', 'id');
    }
}
