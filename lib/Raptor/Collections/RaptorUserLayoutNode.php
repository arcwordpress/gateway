<?php

namespace Gateway\Raptor\Collections;

use Illuminate\Database\Eloquent\Model;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Stores the (x, y) position of one React Flow node within a saved user layout.
 *
 * Each row belongs to a RaptorUserLayout and is uniquely identified by
 * (layout_id, node_id). The UNIQUE KEY on those two columns allows efficient
 * bulk-replace on save.
 */
class RaptorUserLayoutNode extends Model
{
    protected $table = 'gateway_raptor_user_layout_node';

    protected $fillable = [
        'layout_id',
        'node_id',
        'x',
        'y',
    ];

    protected $casts = [
        'layout_id' => 'integer',
        'x'         => 'float',
        'y'         => 'float',
    ];

    public function layout(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(RaptorUserLayout::class, 'layout_id');
    }
}
