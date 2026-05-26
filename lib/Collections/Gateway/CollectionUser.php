<?php

namespace Gateway\Collections\Gateway;

/**
 * CollectionUser — site-wide active/inactive settings for registered collections.
 *
 * Replaces the old options-based gateway_disabled_collections approach. A row
 * is auto-seeded for every core collection on plugin init. Setting active = 0
 * prevents that collection from being registered (and therefore from having
 * REST routes).
 *
 * This collection is marked $core = true so it does not appear in generic
 * collection listings in the studio or admin apps.
 */
class CollectionUser extends \Gateway\Collection
{
    protected $private = true;
    protected $key          = 'gateway_collection_user';
    protected $title        = 'Collection Setting';
    protected $titlePlural  = 'Collection Settings';
    protected $package      = 'gateway';
    protected $table        = 'gateway_collection_users';
    public    $timestamps   = false;

    protected $fillable = ['collection_key', 'active'];

    protected $casts = [
        'active' => 'boolean',
    ];

    protected $fields = [
        ['name' => 'collection_key', 'type' => 'text',     'label' => 'Collection Key'],
        ['name' => 'active',         'type' => 'checkbox', 'label' => 'Active', 'default' => 1],
    ];

    /**
     * Return whether a given collection key is active.
     *
     * Defaults to true when no row exists and when the table does not yet
     * exist (graceful degradation on first run before migrations).
     *
     * @param string $collectionKey e.g. 'wp_post'
     * @return bool
     */
    public static function isActive(string $collectionKey): bool
    {
        try {
            $row = static::where('collection_key', $collectionKey)->first();
            return $row === null ? true : (bool) $row->active;
        } catch (\Exception $e) {
            // Table not yet created — default to active
            return true;
        }
    }

    /**
     * Upsert a collection row without overwriting an existing active value.
     * Used by the seeder so that user choices survive re-seeding.
     *
     * @param string $collectionKey
     */
    public static function seedOne(string $collectionKey): void
    {
        try {
            static::firstOrCreate(
                ['collection_key' => $collectionKey],
                ['active' => 1]
            );
        } catch (\Exception $e) {
            // Table not ready; seeding will succeed on the next request
        }
    }
}
