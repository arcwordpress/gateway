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

        error_log('[Gateway] SearchBuilder: falling back to LIKE search — FULLTEXT index not available. Run the collection migration to add a FULLTEXT index on: ' . implode(', ', $columns));

        return $query->where(function ($q) use ($columns, $term) {
            foreach ($columns as $col) {
                $q->orWhere($col, 'LIKE', '%' . $term . '%');
            }
        });
    }

    protected static function supportsFullText(): bool
    {
        try {
            $engine = DB::select("SHOW VARIABLES LIKE 'default_storage_engine'")[0]->Value ?? '';
            return strtolower($engine) === 'innodb';
        } catch (\Exception $e) {
            return false;
        }
    }
}
