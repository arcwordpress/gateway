<?php

namespace Gateway\Raptor\Collections;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Pivot model that represents the relationship between a Form and its included Fields.
 *
 * Records are stored in {prefix}gateway_raptor_form_field
 * (e.g. wp_gateway_raptor_form_field).
 *
 * This pivot allows Forms to include a subset of Collection Fields,
 * and controls the sort order of fields within the form.
 *
 * @property int $id
 * @property int $form_id         FK to gateway_raptor_form.id
 * @property int $field_id        FK to gateway_raptor_field.id
 * @property int $sort_order      Field display order within the form
 */
class RaptorFormField extends \Gateway\Collection
{
    protected $key = 'raptor_form_field';

    protected $table = 'gateway_raptor_form_field';

    protected $private = true;

    protected $routes = [
        'enabled' => false,
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function getFillable(): array
    {
        return [
            'form_id',
            'field_id',
            'sort_order',
        ];
    }

    public function form(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(RaptorForm::class, 'form_id', 'id');
    }

    public function field(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(RaptorField::class, 'field_id', 'id');
    }
}
