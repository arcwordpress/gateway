<?php

namespace Gateway\Models;

use Illuminate\Database\Eloquent\Model;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class Test extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'gateway_tests';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'description',
        'status',
    ];

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = true;
}
