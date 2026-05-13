<?php

namespace Gateway\Collections\Gateway;

/**
 * MigrationRun — audit log of every migration run triggered via the UI.
 *
 * subject_type: 'extension' | 'collection' | 'core'
 * subject_key:  extension_key, collection_key, or 'gateway-core'
 * version:      version string the migration ran for
 * success:      whether it succeeded
 * message:      optional error or info message
 */
class MigrationRun extends \Gateway\Collection
{
    protected $core        = true;
    protected $key         = 'gateway_migration_run';
    protected $title       = 'Migration Run';
    protected $titlePlural = 'Migration Runs';
    protected $package     = 'gateway';
    protected $table       = 'gateway_migration_run';

    protected $fillable = [
        'subject_type',
        'subject_key',
        'version',
        'success',
        'message',
        'ran_at',
    ];

    protected $casts = [
        'success' => 'boolean',
        'ran_at'  => 'datetime',
    ];

    const UPDATED_AT = null;
    const CREATED_AT = 'ran_at';

    /**
     * Log a migration run.
     */
    public static function log(string $subjectType, string $subjectKey, string $version, bool $success, string $message = ''): void
    {
        try {
            static::create([
                'subject_type' => $subjectType,
                'subject_key'  => $subjectKey,
                'version'      => $version,
                'success'      => $success,
                'message'      => $message,
                'ran_at'       => current_time('mysql', true),
            ]);
        } catch (\Throwable $e) {
            error_log('[Gateway] MigrationRun::log failed: ' . $e->getMessage());
        }
    }
}
