<?php

namespace Gateway\Raptor\Collections;

if (!defined('ABSPATH')) {
    exit;
}

class RaptorForm extends \Gateway\Collection
{
    protected $key = 'raptor_form';

    protected $table = 'gateway_raptor_form';

    protected $core = true;

    protected $routes = [
        'enabled' => false,
    ];

    protected $casts = [
        'form_config' => 'array',
        'sort_order' => 'integer',
    ];

    public function getFillable(): array
    {
        return [
            'form_key',
            'form_list_id',
            'title',
            'description',
            'status',
            'sort_order',
            'form_config',
            'success_message',
            'notification_email',
        ];
    }

    public function formList(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(RaptorFormList::class, 'form_list_id', 'id');
    }

    public function formFields(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(RaptorFormField::class, 'form_id', 'id')
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc');
    }
}
