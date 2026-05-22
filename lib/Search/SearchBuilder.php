<?php

namespace Gateway\Search;

use Illuminate\Database\Eloquent\Builder;

class SearchBuilder
{
    public static function apply(Builder $query, string $term, array $columns): Builder
    {
        $term = trim($term);

        if ($term === '' || empty($columns)) {
            return $query;
        }

        if (static::supportsFullText($query->getConnection())) {
            return $query->whereFullText($columns, $term);
        }

        error_log('[Gateway] SearchBuilder: falling back to LIKE search — FULLTEXT index not available (supportsFullText check failed). Run the collection migration to add a FULLTEXT index on: ' . implode(', ', $columns));

        return $query->where(function ($q) use ($columns, $term) {
            foreach ($columns as $col) {
                $q->orWhere($col, 'LIKE', '%' . $term . '%');
            }
        });
    }

    protected static function supportsFullText(\Illuminate\Database\ConnectionInterface $connection): bool
    {
        try {
            $result = $connection->selectOne('SELECT @@default_storage_engine AS engine');

            $engine = $result->engine ?? null;

            if ($engine === null) {
                error_log('[Gateway] SearchBuilder: supportsFullText — query returned null');
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
