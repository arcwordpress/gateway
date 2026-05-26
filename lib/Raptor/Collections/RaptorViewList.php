<?php

namespace Gateway\Raptor\Collections;

if (!defined('ABSPATH')) {
    exit;
}

class RaptorViewList extends \Gateway\Collection
{
    protected $key = 'raptor_view_list';

    protected $table = 'gateway_raptor_view_list';

    protected $private = true;

    protected $routes = [
        'enabled' => false,
    ];

    protected $hidden = ['collection_key'];

    public function getFillable(): array
    {
        return [
            'collection_id',
        ];
    }

    public function collection(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(RaptorCollection::class, 'collection_id', 'id');
    }

    public function views(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(RaptorView::class, 'view_list_id')
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc');
    }
}
