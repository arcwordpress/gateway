<?php

namespace Gateway;

use Illuminate\Database\Eloquent\Model as EloquentModel;

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Base Model class for Gateway collections
 *
 * This serves as a minimal base that can be extended by custom models
 * or configured dynamically via constructor for virtual models.
 */
class Model extends EloquentModel
{
    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = true;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [];

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table;

    /**
     * Relationship configurations for this model instance
     *
     * @var array
     */
    protected $relationshipConfigs = [];

    /**
     * Registry of virtual model configurations by table name
     * This allows Eloquent to properly instantiate related models
     *
     * @var array
     */
    protected static $virtualModelRegistry = [];

    /**
     * Constructor allows dynamic configuration for virtual models
     *
     * @param array $attributes Model attributes
     * @param array $config Optional configuration ['table' => string, 'fillable' => array, 'timestamps' => bool, 'relationships' => array]
     */
    public function __construct(array $attributes = [], array $config = [])
    {
        // Apply configuration before parent constructor
        if (!empty($config)) {
            if (isset($config['table'])) {
                $this->table = $config['table'];
                
                // Register this virtual model configuration
                self::$virtualModelRegistry[$config['table']] = [
                    'fillable' => $config['fillable'] ?? [],
                    'timestamps' => $config['timestamps'] ?? true,
                    'relationships' => $config['relationships'] ?? [],
                ];
            }
            if (isset($config['fillable'])) {
                $this->fillable = $config['fillable'];
            }
            if (isset($config['timestamps'])) {
                $this->timestamps = $config['timestamps'];
            }
            if (isset($config['relationships']) && is_array($config['relationships'])) {
                $this->relationshipConfigs = $config['relationships'];
            }
        } else {
            // If no config provided, try to load from registry using the table name
            $this->loadFromRegistry();
        }

        parent::__construct($attributes);
    }

    /**
     * Load configuration from registry based on current table
     * This is called when Eloquent creates model instances internally
     *
     * @return void
     */
    protected function loadFromRegistry()
    {
        if (!$this->table) {
            return;
        }

        if (isset(self::$virtualModelRegistry[$this->table])) {
            $config = self::$virtualModelRegistry[$this->table];
            
            $this->fillable = $config['fillable'] ?? [];
            $this->timestamps = $config['timestamps'] ?? true;
            $this->relationshipConfigs = $config['relationships'] ?? [];
        }
    }

    /**
     * Set the table associated with the model.
     *
     * @param string $table
     * @return $this
     */
    public function setTable($table)
    {
        $this->table = $table;
        
        // After setting table, try to load config from registry
        $this->loadFromRegistry();
        
        return $this;
    }

    /**
     * Create a new instance of the given model.
     *
     * @param array $attributes
     * @param bool $exists
     * @return static
     */
    public function newInstance($attributes = [], $exists = false)
    {
        // Create instance with table configuration
        $model = new static([], [
            'table' => $this->getTable(),
            'fillable' => $this->getFillable(),
            'timestamps' => $this->timestamps,
            'relationships' => $this->relationshipConfigs,
        ]);

        $model->exists = $exists;
        
        $model->setConnection(
            $this->getConnectionName()
        );
        
        $model->setTable($this->getTable());
        
        $model->mergeCasts($this->casts);
        
        return $model;
    }

    /**
     * Create a new model instance that is existing.
     *
     * @param array $attributes
     * @param string|null $connection
     * @return static
     */
    public function newFromBuilder($attributes = [], $connection = null)
    {
        $model = $this->newInstance([], true);
        
        $model->setRawAttributes((array) $attributes, true);
        
        $model->setConnection($connection ?: $this->getConnectionName());
        
        $model->fireModelEvent('retrieved', false);
        
        return $model;
    }

    /**
     * Handle dynamic method calls for relationships
     *
     * @param string $method
     * @param array $parameters
     * @return mixed
     */
    public function __call($method, $parameters)
    {
        // Check if this method corresponds to a configured relationship
        if (isset($this->relationshipConfigs[$method])) {
            return $this->buildDynamicRelationship($method, $this->relationshipConfigs[$method]);
        }

        return parent::__call($method, $parameters);
    }

    /**
     * Dynamically retrieve attributes on the model.
     *
     * @param string $key
     * @return mixed
     */
    public function __get($key)
    {
        // Ensure relationships are available via property access
        if (isset($this->relationshipConfigs[$key])) {
            return $this->getRelationshipFromMethod($key);
        }

        return parent::__get($key);
    }

    /**
     * Build a dynamic relationship based on configuration
     *
     * @param string $name
     * @param array $config
     * @return mixed
     */
    protected function buildDynamicRelationship($name, array $config)
    {
        if (!isset($config['type']) || !isset($config['related'])) {
            return null;
        }

        $type = $config['type'];
        $related = $config['related'];
        $foreignKey = $config['foreign_key'] ?? null;
        $localKey = $config['local_key'] ?? null;

        // Resolve the related model class
        $relatedModelClass = $this->resolveRelatedModel($related, $config);

        switch ($type) {
            case 'hasOne':
                return $this->hasOne($relatedModelClass, $foreignKey, $localKey);

            case 'hasMany':
                return $this->hasMany($relatedModelClass, $foreignKey, $localKey);

            case 'belongsTo':
                return $this->belongsTo($relatedModelClass, $foreignKey, $localKey);

            case 'belongsToMany':
                $table = $config['pivot_table'] ?? null;
                $foreignPivotKey = $config['foreign_pivot_key'] ?? null;
                $relatedPivotKey = $config['related_pivot_key'] ?? null;
                $parentKey = $config['parent_key'] ?? null;
                $relatedKey = $config['related_key'] ?? null;

                return $this->belongsToMany(
                    $relatedModelClass,
                    $table,
                    $foreignPivotKey,
                    $relatedPivotKey,
                    $parentKey,
                    $relatedKey
                );

            case 'morphTo':
                $name = $config['name'] ?? $name;
                $type = $config['morph_type'] ?? null;
                $id = $config['morph_id'] ?? null;
                return $this->morphTo($name, $type, $id);

            case 'morphOne':
                $name = $config['name'] ?? $name;
                $type = $config['morph_type'] ?? null;
                $id = $config['morph_id'] ?? null;
                return $this->morphOne($relatedModelClass, $name, $type, $id, $localKey);

            case 'morphMany':
                $name = $config['name'] ?? $name;
                $type = $config['morph_type'] ?? null;
                $id = $config['morph_id'] ?? null;
                return $this->morphMany($relatedModelClass, $name, $type, $id, $localKey);

            default:
                return null;
        }
    }

    /**
     * Resolve the related model from configuration
     * This handles Collection classes, callable, and direct model classes
     *
     * @param mixed $related
     * @param array $config
     * @return string The model class name
     */
    protected function resolveRelatedModel($related, array $config)
    {
        // If it's a callable, resolve it first
        if (is_callable($related)) {
            $related = $related();
        }

        // If it's a Collection class, extract its model and register it
        if (is_string($related) && class_exists($related)) {
            $reflection = new \ReflectionClass($related);
            
            // Handle Collection classes
            if ($reflection->isSubclassOf(\Gateway\Collection::class)) {
                $collection = new $related();
                $modelInstance = $collection->getModelInstance();
                
                // The model instance will have already registered itself
                // Just return the Model class - instances will load from registry
                return \Gateway\Model::class;
            }
            
            // Handle concrete Model classes (custom models)
            if ($reflection->isSubclassOf(\Gateway\Model::class) || 
                $reflection->isSubclassOf(EloquentModel::class)) {
                return $related;
            }
        }

        // Default: assume it's a virtual model using this class
        return \Gateway\Model::class;
    }

    /**
     * Create a new model instance for a specific table
     * Useful for testing or direct instantiation
     *
     * @param string $table
     * @param array $attributes
     * @return static
     */
    public static function forTable($table, array $attributes = [])
    {
        $config = self::$virtualModelRegistry[$table] ?? ['table' => $table];
        
        return new static($attributes, $config);
    }

    /**
     * Get the registry for debugging purposes
     *
     * @return array
     */
    public static function getRegistry()
    {
        return self::$virtualModelRegistry;
    }
}