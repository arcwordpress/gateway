<?php

namespace Gateway\Raptor\Collections;

if (!defined('ABSPATH')) {
    exit;
}

class RaptorFormList extends \Gateway\Collection
{
    protected $key = 'raptor_form_list';

    protected $table = 'gateway_raptor_form_list';

    protected $core = true;

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

    public function forms(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(RaptorForm::class, 'form_list_id')
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc');
    }
}
