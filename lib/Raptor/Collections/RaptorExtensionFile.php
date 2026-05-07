<?php

namespace Gateway\Raptor\Collections;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Eloquent model for the Extension class that is generated into every
 * Raptor-built plugin at lib/Extension.php.
 *
 * Each record is the DB-backed equivalent of a hand-written:
 *   namespace MyExt;
 *   class Extension extends \Gateway\Extension {}
 *
 * There is always exactly one row per RaptorExtension. The row is
 * created automatically when the extension is first built and stores
 * any options that control how the Extension class is generated.
 *
 * @property int    $id
 * @property int    $extension_id  FK to gateway_raptor_extension.id
 * @property string $status        "active" | "inactive"
 *
 * @property-read RaptorExtension|null $extension
 */
class RaptorExtensionFile extends \Gateway\Collection
{
    protected $key   = 'raptor_extension_file';
    protected $table = 'gateway_raptor_extension_file';
    protected $core  = true;

    protected $routes = [
        'enabled' => false,
    ];

    protected $fields = [];

    public function getFillable(): array
    {
        return [
            'extension_id',
            'status',
        ];
    }

    public function extension(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(RaptorExtension::class, 'extension_id', 'id');
    }
}
