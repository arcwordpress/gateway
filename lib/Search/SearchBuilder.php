<?php

namespace Gateway\Search;

use Illuminate\Database\Eloquent\Builder;

class SearchBuilder
{
    public static function apply(Builder $query, string $term, array $columns, bool $useFullText = false): Builder
    {
        $term = trim($term);

        if ($term === '' || empty($columns)) {
            return $query;
        }

        if ($useFullText) {
            return $query->whereFullText($columns, $term);
        }

        return $query->where(function ($q) use ($columns, $term) {
            foreach ($columns as $col) {
                $q->orWhere($col, 'LIKE', '%' . $term . '%');
            }
        });
    }
}
