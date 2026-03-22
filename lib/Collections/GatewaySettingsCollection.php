<?php

namespace Gateway\Collections;

use Gateway\Security\Encryption;

/**
 * GatewaySettingsCollection - Singleton collection for Gateway admin settings
 *
 * Manages application settings with a single record (id: 1).
 * Replaces scattered WordPress options for improved structure and validation.
 *
 * Tabs:
 *   - database: Connection settings (driver, port, SQLite path)
 *   - ai: Anthropic API configuration
 */
class GatewaySettingsCollection extends \Gateway\Collection
{
    protected $key = 'gateway_settings';
    protected $title = 'Gateway Settings';
    protected $titlePlural = 'Gateway Settings';
    protected $table = 'gateway_settings';

    // Internal collection — excluded from public listings
    protected $core = true;

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
        // Database tab
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

        // AI tab
        [
            'name' => 'anthropic_api_key',
            'type' => 'password',
            'label' => 'Anthropic API Key',
            'tab' => 'ai',
            'default' => '',
            'encrypted' => true,
            'placeholder' => 'sk-ant-...',
        ],
        [
            'name' => 'has_anthropic_key',
            'type' => 'boolean',
            'label' => 'API Key Configured',
            'tab' => 'ai',
            'default' => false,
            'readonly' => true,
        ],
    ];

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // Ensure only one settings record exists
        static::creating(function ($model) {
            // Check if a settings record already exists
            if (static::count() > 0) {
                throw new \Exception('Only one settings record is allowed');
            }
        });

        // Handle encrypted fields on save
        static::saving(function ($model) {
            if ($model->isDirty('anthropic_api_key')) {
                $apiKey = $model->anthropic_api_key;

                if (!empty($apiKey)) {
                    // Check if already encrypted (starts with base64-like structure)
                    if (!str_starts_with($apiKey, 'sk-ant-')) {
                        // Already encrypted, don't re-encrypt
                        return;
                    }

                    $encrypted = Encryption::encrypt($apiKey);
                    if ($encrypted === false) {
                        throw new \Exception('Failed to encrypt API key');
                    }
                    $model->anthropic_api_key = $encrypted;
                    $model->has_anthropic_key = true;
                } else {
                    $model->anthropic_api_key = '';
                    $model->has_anthropic_key = false;
                }
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
     *
     * @return static
     */
    public static function getSettings()
    {
        try {
            $settings = static::find(1);

            if (!$settings) {
                // Create default settings if none exist
                $settings = static::create([
                    'id' => 1,
                    'db_driver' => 'mysql',
                    'connection_port' => '',
                    'sqlite_path' => '',
                    'anthropic_api_key' => '',
                    'has_anthropic_key' => false,
                    'is_sqlite_environment' => defined('SQLITE_DB_DROPIN_VERSION'),
                ]);
            }

            return $settings;
        } catch (\Exception $e) {
            // DB unavailable (missing table, broken connection, etc.).
            // Return an in-memory model with defaults so the settings page can always
            // render. connection_port is seeded from wp_options: when the POST handler
            // is also in degraded mode it writes there, so the value round-trips.
            $fallback = new static();
            $fallback->exists              = false;
            $fallback->id                  = 1;
            $fallback->db_driver           = 'mysql';
            $fallback->connection_port     = get_option('gateway_connection_port', '');
            $fallback->sqlite_path         = '';
            $fallback->is_sqlite_environment = (bool) defined('SQLITE_DB_DROPIN_VERSION');
            $fallback->anthropic_api_key   = '';
            $fallback->has_anthropic_key   = false;
            return $fallback;
        }
    }

    /**
     * Get API key (decrypted)
     *
     * @return string|null
     */
    public function getDecryptedApiKey()
    {
        if (empty($this->anthropic_api_key)) {
            return null;
        }

        return Encryption::decrypt($this->anthropic_api_key);
    }

    /**
     * Check if API key starts with expected prefix (for plain text detection)
     *
     * @param string $key
     * @return bool
     */
    protected function isPlainTextApiKey($key)
    {
        return str_starts_with($key, 'sk-ant-');
    }

    /**
     * Convert the model instance to an array.
     * Override to never expose encrypted values in API responses.
     *
     * @return array
     */
    public function toArray()
    {
        $array = parent::toArray();
        
        // Never send the actual encrypted key - replace with empty string
        if (isset($array['anthropic_api_key'])) {
            $array['anthropic_api_key'] = '';
        }
        
        return $array;
    }

    /**
     * Prepare settings for API response (never expose encrypted values)
     *
     * @return array
     */
    public function toApiResponse()
    {
        return [
            'id' => $this->id,
            'db_driver' => $this->db_driver,
            'connection_port' => $this->connection_port,
            'sqlite_path' => $this->sqlite_path,
            'is_sqlite_environment' => $this->is_sqlite_environment,
            'anthropic_api_key' => '', // Never send actual key
            'has_anthropic_key' => $this->has_anthropic_key,
        ];
    }
}
