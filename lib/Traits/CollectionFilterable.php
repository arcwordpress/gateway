<?php

namespace Gateway\Traits;

use Illuminate\Database\Eloquent\Builder;

/**
 * Trait CollectionFilterable
 *
 * Provides automatic filtering capabilities for Gateway Collections based on their $fields property.
 * This trait extracts field names from a collection's $fields configuration and makes them
 * available as filterable parameters in API requests.
 *
 * Usage in GetManyRoute:
 *   $filterableFields = CollectionFilterable::getFilterableFieldNames($collection);
 *   CollectionFilterable::applyFieldFilters($query, $requestParams, $filterableFields);
 */
trait CollectionFilterable
{
    /**
     * Extract field names from a collection's $fields property
     *
     * @param \Gateway\Collection $collection The collection instance
     * @return array Array of field names that can be filtered
     */
    public static function getFilterableFieldNames($collection): array
    {
        $fields = $collection->getFields();

        if (!is_array($fields) || empty($fields)) {
            return [];
        }

        // getFields() returns an associative array with field names as keys
        // Extract just the keys (field names)
        $fieldNames = array_keys($fields);

        // Filter out any empty or invalid field names
        $fieldNames = array_filter($fieldNames, function($name) {
            return is_string($name) && !empty(trim($name));
        });

        return array_values($fieldNames);
    }

    /**
     * Apply field-based filters to a query builder from request parameters
     *
     * @param Builder $query The Eloquent query builder
     * @param array $requestParams All request parameters
     * @param array $filterableFields Array of field names that are allowed to be filtered
     * @param array $excludeParams Parameters to exclude from filtering (e.g., 'page', 'per_page')
     * @return array Array with 'applied' and 'skipped' filter information
     */
    public static function applyFieldFilters(
        Builder $query,
        array $requestParams,
        array $filterableFields,
        array $excludeParams = ['page', 'per_page', 'order_by', 'order', 'search']
    ): array
    {
        $filtersApplied = [];
        $filtersSkipped = [];

        foreach ($requestParams as $key => $value) {
            // Skip excluded parameters and null values
            if (in_array($key, $excludeParams) || $value === null || $value === '') {
                continue;
            }

            // Check if this field is in the filterable fields list
            if (in_array($key, $filterableFields, true)) {
                // Apply simple equality filter
                // For more complex filtering (LIKE, IN, etc.) this can be extended
                $query->where($key, $value);
                $filtersApplied[$key] = $value;
            } else {
                // Track parameters that couldn't be used as filters
                $filtersSkipped[$key] = $value;
            }
        }

        return [
            'applied' => $filtersApplied,
            'skipped' => $filtersSkipped
        ];
    }

    /**
     * Merge filterable field names with custom filter configuration
     * This allows collections to have both automatic field-based filtering
     * and custom filters defined in the $filters property
     *
     * @param array $fieldNames Array of field names from $fields
     * @param array $customFilters Array from $collection->getFilters()
     * @return array Merged array of filterable field names
     */
    public static function mergeFilterableFields(array $fieldNames, array $customFilters): array
    {
        // Normalize custom filters to field names (using the existing logic)
        $customFieldNames = static::normalizeConfigToFields($customFilters);

        // Merge and deduplicate
        $merged = array_unique(array_merge($fieldNames, $customFieldNames));

        return array_values($merged);
    }

    /**
     * Normalize filter/sort configuration arrays to a flat list of column names.
     * This is the same logic from GetManyRoute::normalizeConfigToFields()
     *
     * @param array $config
     * @return array
     */
    protected static function normalizeConfigToFields(array $config): array
    {
        $fields = [];

        foreach ($config as $key => $value) {
            if (is_string($value)) {
                $fields[] = $value;
                continue;
            }

            if (is_array($value)) {
                if (!empty($value['field']) && is_string($value['field'])) {
                    $fields[] = $value['field'];
                    continue;
                }

                if (!empty($value['column']) && is_string($value['column'])) {
                    $fields[] = $value['column'];
                    continue;
                }
            }

            if (is_string($key) && $key !== '') {
                $fields[] = $key;
            }
        }

        $fields = array_unique(array_filter($fields, static fn ($field) => is_string($field) && $field !== ''));

        return array_values($fields);
    }
}
