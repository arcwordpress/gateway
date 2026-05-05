<?php

namespace Gateway\Raptor\Collections;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Eloquent model for collections created and managed through the Raptor UI.
 *
 * Records are stored in {prefix}gateway_raptor_collection
 * (e.g. wp_gateway_raptor_collection).
 *
 * These are lightweight collection definitions (title, key, description)
 * persisted to the database, as opposed to the file-based collections
 * managed by the Exta workflow.
 *
 * @property int      $id
 * @property string   $collection_key  Slug identifier, e.g. "my_posts"
 * @property int|null $extension_id    FK to gateway_raptor_extension.id
 * @property string   $title           Human-readable name
 * @property string   $description
 * @property string   $status          "active" | "inactive"
 *
 * @property-read RaptorExtension|null                                      $extension
 * @property-read \Illuminate\Database\Eloquent\Collection<RaptorPackage>   $packages
 */
class RaptorCollection extends \Gateway\Collection
{
    protected $key   = 'raptor_collection';

    // WP prefix is prepended automatically, giving wp_gateway_raptor_collection.
    protected $table = 'gateway_raptor_collection';

    // Internal Gateway table — excluded from public collection listings.
    protected $core = true;

    // Managed exclusively via Raptor\Endpoints\CollectionRoutes, not via standard REST.
    protected $routes = [
        'enabled' => false,
    ];

    protected $casts = [
        'relationships' => 'array',
        'registered'    => 'boolean',
    ];

    /**
     * Field definitions used by the Gateway forms system.
     * These drive form rendering, validation, and labelling in the Raptor UI.
     * collection_key is intentionally excluded — set on create, not editable.
     * extension_id and relationships are managed via dedicated UI interactions.
     */
    protected $fields = [
        [
            'name'        => 'title',
            'type'        => 'text',
            'label'       => 'Title',
            'required'    => true,
            'placeholder' => 'My Collection',
        ],
        [
            'name'     => 'description',
            'type'     => 'textarea',
            'label'    => 'Description',
            'required' => false,
        ],
        [
            'name'    => 'status',
            'type'    => 'select',
            'label'   => 'Status',
            'default' => 'active',
            'options' => [
                ['value' => 'active',   'label' => 'Active'],
                ['value' => 'inactive', 'label' => 'Inactive'],
            ],
        ],
        [
            'name'    => 'registered',
            'type'    => 'checkbox',
            'label'   => 'Registered',
            'default' => true,
        ],
    ];

    public function getFillable(): array
    {
        return [
            'collection_key',
            'extension_id',
            'title',
            'description',
            'status',
            'registered',
            'relationships',
        ];
    }

    public function packages(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(
            RaptorPackage::class,
            'gateway_raptor_package_collection',
            'collection_id',
            'package_id'
        );
    }

    public function extension(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(RaptorExtension::class, 'extension_id', 'id');
    }

    public function fieldList(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(RaptorFieldList::class, 'collection_id', 'id');
    }

    public function viewList(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(RaptorViewList::class, 'collection_id', 'id');
    }

    public function formList(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(RaptorFormList::class, 'collection_id', 'id');
    }
}
