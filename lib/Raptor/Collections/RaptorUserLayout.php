<?php

namespace Gateway\Raptor\Collections;

use Illuminate\Database\Eloquent\Model;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Stores one saved layout record per (user, route_key) pair.
 *
 * Intentionally extends Eloquent Model directly rather than Gateway\Collection
 * because we do not need route registration, admin UI, or the other overhead
 * that Gateway\Collection provides.
 */
class RaptorUserLayout extends Model
{
    protected $table = 'gateway_raptor_user_layout';

    protected $fillable = [
        'user_id',
        'route_key',
    ];

    protected $casts = [
        'user_id' => 'integer',
    ];

    public function nodes(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(RaptorUserLayoutNode::class, 'layout_id');
    }
}
