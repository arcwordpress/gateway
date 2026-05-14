<?php

namespace Gateway\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use ReflectionClass;
use ReflectionException;
use ReflectionMethod;
use ReflectionNamedType;
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
     * Discover all Eloquent relation methods on a collection by inspecting
     * return type hints. Only public, non-static, zero-required-parameter
     * methods whose return type is a subclass of Eloquent's Relation are
     * included.
     *
     * @param  object  $collection
     * @return string[]
     */
    public static function discoverRelations($collection): array
    {
        try {
            $ref = new ReflectionClass($collection);
        } catch (ReflectionException $e) {
            return [];
        }

        $relations = [];

        foreach ($ref->getMethods(ReflectionMethod::IS_PUBLIC) as $method) {
            if ($method->isStatic() || $method->getNumberOfRequiredParameters() > 0) {
                continue;
            }

            $returnType = $method->getReturnType();

            if ($returnType instanceof ReflectionNamedType && !$returnType->isBuiltin()) {
                // Fast path: return type hint present — check namespace prefix without autoloading
                if (str_starts_with($returnType->getName(), 'Illuminate\\Database\\Eloquent\\Relations\\')) {
                    $relations[] = $method->getName();
                }
                continue;
            }

            // No return type hint (hand-written methods) — call it and inspect the result.
            // Relation constructors do not execute queries so this is safe.
            try {
                $result = $method->invoke($collection);
                if ($result instanceof Relation) {
                    $relations[] = $method->getName();
                }
            } catch (\Throwable $e) {
                // Not a relation method or failed to invoke — skip.
            }
        }

        return $relations;
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
