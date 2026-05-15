<?php

namespace Gateway\Collections;

use Illuminate\Database\Eloquent\Relations\Relation;
use ReflectionClass;
use ReflectionException;
use ReflectionMethod;
use ReflectionNamedType;

/**
 * Discovers Eloquent relationship methods on a collection via reflection.
 */
class RelationDiscovery
{
    /**
     * Return the names of all Eloquent relation methods defined on $collection.
     *
     * Inspects return type hints first (fast path); falls back to invocation for
     * methods without type hints. Skips anything declared in an Illuminate class
     * (framework internals such as morphTo()).
     *
     * @param  object  $collection
     * @return string[]
     */
    public static function discover(object $collection): array
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

            if (str_starts_with($method->getDeclaringClass()->getName(), 'Illuminate\\')) {
                continue;
            }

            $returnType = $method->getReturnType();

            if ($returnType instanceof ReflectionNamedType && !$returnType->isBuiltin()) {
                if (str_starts_with($returnType->getName(), 'Illuminate\\Database\\Eloquent\\Relations\\')) {
                    $relations[] = $method->getName();
                }
                continue;
            }

            try {
                $result = $method->invoke($collection);
                if ($result instanceof Relation) {
                    $relations[] = $method->getName();
                }
            } catch (\Throwable $e) {
                // Not a relation method — skip.
            }
        }

        return $relations;
    }
}
