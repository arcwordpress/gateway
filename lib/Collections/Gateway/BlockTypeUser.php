<?php

namespace Gateway\Collections\Gateway;

/**
 * BlockTypeUser — site-wide active/inactive settings for block types.
 *
 * Unifies the three block registration systems (Gutenberg/React, PHP-class,
 * JSON-schema) under a single toggle mechanism. A row is auto-seeded for every
 * discovered block type on plugin init. Setting active = 0 prevents that block
 * type from being registered with WordPress.
 *
 * This collection is marked $core = true so it does not appear in generic
 * collection listings in the studio or admin apps.
 */
class BlockTypeUser extends \Gateway\Collection
{
    protected $core         = true;
    protected $key          = 'gateway_block_type_user';
    protected $title        = 'Block Type Setting';
    protected $titlePlural  = 'Block Type Settings';
    protected $package      = 'gateway';
    protected $table        = 'gateway_block_type_users';
    public    $timestamps   = false;

    protected $fillable = ['slug', 'label', 'source', 'active'];

    protected $casts = [
        'active' => 'boolean',
    ];

    protected $fields = [
        ['name' => 'slug',   'type' => 'text',     'label' => 'Block Slug'],
        ['name' => 'label',  'type' => 'text',     'label' => 'Label'],
        ['name' => 'source', 'type' => 'text',     'label' => 'Source'],
        ['name' => 'active', 'type' => 'checkbox', 'label' => 'Active', 'default' => 1],
    ];

    /**
     * Return whether a given block slug is active.
     *
     * Defaults to true when no row exists (new block types are active by
     * default) and when the table has not yet been created (graceful
     * degradation during first-run before migrations).
     *
     * @param string $slug e.g. 'gateway/nav'
     * @return bool
     */
    public static function isActive(string $slug): bool
    {
        try {
            $row = static::where('slug', $slug)->first();
            return $row === null ? true : (bool) $row->active;
        } catch (\Exception $e) {
            // Table not yet created — default to active
            return true;
        }
    }

    /**
     * Upsert a block type row without overwriting an existing active value.
     * Used by the seeder so that user choices survive re-seeding.
     *
     * @param string $slug
     * @param string $label
     * @param string $source  'gutenberg' | 'php' | 'json'
     */
    public static function seedOne(string $slug, string $label, string $source): void
    {
        try {
            static::firstOrCreate(
                ['slug' => $slug],
                ['label' => $label, 'source' => $source, 'active' => 1]
            );
        } catch (\Exception $e) {
            // Table not ready; seeding will succeed on the next request
        }
    }
}
