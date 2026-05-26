<?php

namespace Gateway\Collections;

/**
 * GatewaySettingsCollection - Singleton collection for Gateway admin settings
 *
 * Manages application settings with a single record (id: 1).
 * Replaces scattered WordPress options for improved structure and validation.
 */
class GatewaySettingsCollection extends \Gateway\Collection
{
    protected $key = 'gateway_settings';
    protected $title = 'Gateway Settings';
    protected $titlePlural = 'Gateway Settings';
    protected $table = 'gateway_settings';

    // Internal collection — excluded from public listings
    protected $private = true;

    // Disable standard REST routes (we'll use custom logic)
    protected $routes = [
        'enabled' => true,
        'namespace' => 'gateway',
        'version' => 'v1',
        'route' => 'settings',
        'methods' => [
            'get_many' => false,
            'get_one' => true,
            'create' => false,
            'update' => true,
            'delete' => false,
        ],
    ];

    protected $fields = [
        [
            'name' => 'db_driver',
            'type' => 'select',
            'label' => 'Database Driver',
            'tab' => 'database',
            'default' => 'mysql',
            'options' => [
                ['value' => 'mysql', 'label' => 'MySQL'],
                ['value' => 'sqlite', 'label' => 'SQLite'],
            ],
        ],
        [
            'name' => 'connection_port',
            'type' => 'text',
            'label' => 'Connection Port',
            'tab' => 'database',
            'default' => '',
            'placeholder' => 'Leave empty for default',
        ],
        [
            'name' => 'sqlite_path',
            'type' => 'text',
            'label' => 'SQLite Database Path',
            'tab' => 'database',
            'default' => '',
            'placeholder' => 'e.g., /path/to/database.sqlite',
        ],
        [
            'name' => 'is_sqlite_environment',
            'type' => 'boolean',
            'label' => 'SQLite Environment Detected',
            'tab' => 'database',
            'default' => false,
            'readonly' => true,
        ],
    ];

    protected static function boot()
    {
        parent::boot();

        // Ensure only one settings record exists
        static::creating(function ($model) {
            if (static::count() > 0) {
                throw new \Exception('Only one settings record is allowed');
            }
        });

        // Detect SQLite environment on retrieval
        static::retrieved(function ($model) {
            $model->is_sqlite_environment = defined('SQLITE_DB_DROPIN_VERSION') ||
                                           $model->db_driver === 'sqlite';
        });

        // Clear the Eloquent connection cache after every save so that the next request
        // re-reads connection settings (port, driver) from the gateway_settings table.
        static::saved(function ($model) {
            if (function_exists('gateway_clear_connection_cache')) {
                gateway_clear_connection_cache();
            }
        });
    }

    /**
     * Get the singleton settings instance
     */
    public static function getSettings()
    {
        try {
            $settings = static::find(1);

            if (!$settings) {
                $settings = static::create([
                    'id'               => 1,
                    'db_driver'        => 'mysql',
                    'connection_port'  => '',
                    'sqlite_path'      => '',
                ]);
            }

            return $settings;
        } catch (\Exception $e) {
            $fallback = new static();
            $fallback->exists              = false;
            $fallback->id                  = 1;
            $fallback->db_driver           = 'mysql';
            $fallback->connection_port     = get_option('gateway_connection_port', '');
            $fallback->sqlite_path         = '';
            $fallback->is_sqlite_environment = (bool) defined('SQLITE_DB_DROPIN_VERSION');
            return $fallback;
        }
    }

    /**
     * Prepare settings for API response
     */
    public function toApiResponse()
    {
        return [
            'id'                   => $this->id,
            'db_driver'            => $this->db_driver,
            'connection_port'      => $this->connection_port,
            'sqlite_path'          => $this->sqlite_path,
            'is_sqlite_environment' => $this->is_sqlite_environment,
        ];
    }
}
