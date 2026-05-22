<?php

namespace Gateway\Search;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class SearchBuilder
{
    public static function apply(Builder $query, string $term, array $columns): Builder
    {
        $term = trim($term);

        if ($term === '' || empty($columns)) {
            return $query;
        }

        if (static::supportsFullText()) {
            return $query->whereFullText($columns, $term);
        }

        error_log('[Gateway] SearchBuilder: falling back to LIKE search — FULLTEXT index not available (supportsFullText check failed). Run the collection migration to add a FULLTEXT index on: ' . implode(', ', $columns));

        return $query->where(function ($q) use ($columns, $term) {
            foreach ($columns as $col) {
                $q->orWhere($col, 'LIKE', '%' . $term . '%');
            }
        });
    }

    protected static function supportsFullText(): bool
    {
        try {
            $rows = DB::select("SHOW VARIABLES LIKE 'default_storage_engine'");

            if (empty($rows)) {
                error_log('[Gateway] SearchBuilder: supportsFullText — query returned no rows');
                return false;
            }

            $row = $rows[0];

            // MySQL may return Value or value depending on the client/driver
            $engine = $row->Value ?? $row->value ?? null;

            if ($engine === null) {
                error_log('[Gateway] SearchBuilder: supportsFullText — could not read Value from row: ' . json_encode($row));
                return false;
            }

            $supported = strtolower($engine) === 'innodb';

            if (!$supported) {
                error_log('[Gateway] SearchBuilder: supportsFullText — engine is "' . $engine . '", expected "innodb"');
            }

            return $supported;
        } catch (\Exception $e) {
            error_log('[Gateway] SearchBuilder: supportsFullText — exception: ' . $e->getMessage());
            return false;
        }
    }
}
