<?php

namespace Gateway\Raptor\Collections;

if (!defined('ABSPATH')) {
    exit;
}

class RaptorViewRender extends \Gateway\Collection
{
    protected $key = 'raptor_view_render';

    protected $table = 'gateway_raptor_view_render';

    protected $core = true;

    protected $routes = [
        'enabled' => false,
    ];

    protected $casts = [
        'view_id' => 'integer',
    ];

    public function getFillable(): array
    {
        return [
            'view_id',
            'engine',
            'js_type',
        ];
    }

    public function view(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(RaptorView::class, 'view_id', 'id');
    }
}
