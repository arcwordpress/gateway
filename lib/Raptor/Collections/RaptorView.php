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
        'sort_order' => 'integer',
        'per_page' => 'integer',
    ];

    public function getFillable(): array
    {
        return [
            'view_key',
            'view_list_id',
            'title',
            'description',
            'status',
            'sort_order',
            'source',
            'columns',
            'facet_filters',
            'default_sort',
            'per_page',
        ];
    }

    public function viewList(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(RaptorViewList::class, 'view_list_id', 'id');
    }

    public function viewRenders(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(RaptorViewRender::class, 'view_id', 'id');
    }
}
