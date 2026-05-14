<?php

namespace Gateway\Traits;

use Illuminate\Database\Eloquent\Builder;
use ReflectionClass;
use ReflectionException;
use WP_REST_Request;

/**
 * Trait CollectionEagerLoadable
 *
 * Enables the Get Many route to eager-load related records from an ?include= query
 * parameter, preventing N+1 fetches when the consumer needs fields from related
 * collections alongside the primary records.
 *
 * Convention: relation names are the exact camelCase method name on the collection
 * model. EventCategory → eventCategory(), Event → event(). If no matching public
 * method is found via reflection the name is silently dropped — unknown relations
 * are never forwarded to Eloquent.
 *
 * Usage in GetManyRoute (or any route that has access to a query builder and the
 * collection instance):
 *
 *   $relations = self::resolveEagerLoads($request, $this->collection);
 *   self::applyEagerLoads($query, $relations);
 */
trait CollectionEagerLoadable
{
    /**
     * Parse ?include= and return only the names that correspond to real public
     * instance methods on the collection, verified via reflection.
     *
     * @param WP_REST_Request $request
     * @param \Gateway\Collection  $collection
     * @return string[]
     */
    public static function resolveEagerLoads(WP_REST_Request $request, $collection): array
    {
        $raw = trim((string) $request->get_param('include'));

        if ($raw === '') {
            return [];
        }

        $requested = array_values(array_filter(
            array_map('trim', explode(',', $raw)),
            fn(string $name) => $name !== ''
        ));

        if (empty($requested)) {
            return [];
        }

        try {
            $ref = new ReflectionClass($collection);
        } catch (ReflectionException $e) {
            return [];
        }

        $valid = [];

        foreach ($requested as $name) {
            if (!$ref->hasMethod($name)) {
                continue;
            }

            $method = $ref->getMethod($name);

            // Must be a public, non-static instance method declared on this model
            if (!$method->isPublic() || $method->isStatic()) {
                continue;
            }

            $valid[] = $name;
        }

        return $valid;
    }

    /**
     * Apply eager loads to a query builder.
     * Call after resolveEagerLoads() and before ->get().
     *
     * @param Builder  $query
     * @param string[] $relations  Validated relation names
     */
    public static function applyEagerLoads(Builder $query, array $relations): void
    {
        if (!empty($relations)) {
            $query->with($relations);
        }
    }
}
