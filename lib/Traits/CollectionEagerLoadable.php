<?php

namespace Gateway\Traits;

use Gateway\Collections\RelationDiscovery;
use Illuminate\Database\Eloquent\Builder;
use ReflectionClass;
use ReflectionException;
use WP_REST_Request;

/**
 * Trait CollectionEagerLoadable
 *
 * Two modes:
 *
 *   ?relations=true   — auto-discover every Eloquent relation method on the
 *                       collection via reflection and eager-load all of them.
 *
 *   ?include=a,b      — explicit comma-separated list; each name is validated
 *                       against real public instance methods before forwarding
 *                       to Eloquent (unknown names are silently dropped).
 *
 * When both are present, ?relations=true wins.
 */
trait CollectionEagerLoadable
{
    /**
     * @param  object  $collection
     * @return string[]
     */
    public static function discoverRelations($collection): array
    {
        return RelationDiscovery::discover($collection);
    }

    /**
     * Resolve which relations to eager-load from the request.
     *
     * ?relations=true  → discover all via reflection
     * ?include=a,b     → validate the named list via reflection
     * neither          → empty (no eager loading)
     *
     * @param  WP_REST_Request $request
     * @param  object          $collection
     * @return string[]
     */
    public static function resolveEagerLoads(WP_REST_Request $request, $collection): array
    {
        if (filter_var($request->get_param('relations'), FILTER_VALIDATE_BOOLEAN)) {
            return self::discoverRelations($collection);
        }

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

            if (!$method->isPublic() || $method->isStatic()) {
                continue;
            }

            $valid[] = $name;
        }

        return $valid;
    }

    /**
     * Apply eager loads to a query builder before ->get().
     *
     * @param Builder  $query
     * @param string[] $relations
     */
    public static function applyEagerLoads(Builder $query, array $relations): void
    {
        if (!empty($relations)) {
            $query->with($relations);
        }
    }
}
