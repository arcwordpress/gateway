<?php

namespace Gateway\Endpoints\Standard;

use Gateway\Endpoints\BaseEndpoint;
use WP_REST_Request;
use WP_REST_Response;

class GetManyRoute extends BaseEndpoint
{

    public function getType()
    {
        return 'get_many';
    }

    public function getMethod()
    {
        return 'GET';
    }

    public function getRoute()
    {
        return '';
    }

    public function getDefaultRoutePermission()
    {
        return 'public_secured';
    }

    public function handle(WP_REST_Request $request)
    {
        try {
            $page = max(1, (int) $request->get_param('page') ?: 1);
            // Default to -1 (fetch all) since filtering/sorting is done client-side
            $per_page_param = $request->get_param('per_page') !== null
                ? (int) $request->get_param('per_page')
                : -1;

            // Check if per_page is -1 (fetch all records)
            $fetch_all = $per_page_param === -1;
            $per_page = $fetch_all ? -1 : min(100, max(1, $per_page_param));

            $search = $request->get_param('search');
            $order_by = $request->get_param('order_by');
            $order = strtolower($request->get_param('order') ?: 'asc');

            if (!in_array($order, ['asc', 'desc'])) {
                $order = 'asc';
            }

            $filterConfig = $this->collection->getFilters() ?: [];

            $allowedFilterFields = $this->normalizeConfigToFields($filterConfig);

            $parsedParams = [
                'page' => $page,
                'per_page_requested' => $per_page_param,
                'per_page_effective' => $per_page,
                'fetch_all' => $fetch_all,
                'search' => $search,
                'order_by' => $order_by,
                'order' => $order,
            ];

            // Handle search separately since it returns Collection not Builder
            if ($search && method_exists($this->collection, 'search')) {
                $results = $this->collection->search($search);

                // Convert to arrays
                $items = [];
                foreach ($results as $model) {
                    $items[] = is_object($model) && method_exists($model, 'toArray')
                        ? $model->toArray()
                        : (array) $model;
                }

                $total = count($items);

                // Apply pagination only if not fetching all
                if (!$fetch_all) {
                    $offset = ($page - 1) * $per_page;
                    $items = array_slice($items, $offset, $per_page);
                }

                $response = [
                    'items' => $items,
                    'pagination' => [
                        'page' => $fetch_all ? 1 : $page,
                        'per_page' => $fetch_all ? $total : $per_page,
                        'record_count' => $total,
                        'total_pages' => $fetch_all ? 1 : ceil($total / $per_page)
                    ]
                ];

                return $this->sendSuccessResponse($response);
            }

            // Start with base query builder - Collection IS the model now
            $query = $this->collection->query();

            // Apply filters from request params
            $filtersApplied = [];
            $filtersSkipped = [];
            $filters = $request->get_params();
            foreach ($filters as $key => $value) {
                if (!in_array($key, ['page', 'per_page', 'order_by', 'order', 'search']) && $value !== null) {
                    if (in_array($key, $allowedFilterFields, true)) {
                        $query->where($key, $value);
                        $filtersApplied[$key] = $value;
                    } else {
                        $filtersSkipped[$key] = $value;
                    }
                }
            }

            // Apply ordering
            $orderApplied = null;
            if ($order_by) {
                $query->orderBy($order_by, $order);
                $orderApplied = ['column' => $order_by, 'direction' => $order];
            }

            // Get total count before pagination
            $queryForCount = clone $query;
            $total = $queryForCount->count();

            // Apply pagination only if not fetching all
            $offset = null;
            if (!$fetch_all) {
                $offset = ($page - 1) * $per_page;
                $query->offset($offset)->limit($per_page);
            }

            $queryForLog = clone $query;
            $models = $query->get();

            // Convert to arrays
            $items = [];
            foreach ($models as $model) {
                $items[] = is_object($model) && method_exists($model, 'toArray')
                    ? $model->toArray()
                    : (array) $model;
            }

            $response = [
                'items' => $items,
                'pagination' => [
                    'page' => $fetch_all ? 1 : $page,
                    'per_page' => $fetch_all ? $total : $per_page,
                    'record_count' => $total,
                    'total_pages' => $fetch_all ? 1 : ceil($total / $per_page)
                ]
            ];

            return $this->sendSuccessResponse($response);

        } catch (\Exception $e) {
            return $this->sendErrorResponse(
                'Failed to retrieve ' . $this->collectionName . ' items: ' . $e->getMessage(),
                'retrieval_failed',
                500
            );
        }
    }

    public function getArgs()
    {
        $args = parent::getArgs();

        $args['args'] = [
            'page' => [
                'default' => 1,
                'type' => 'integer',
                'minimum' => 1,
                'description' => 'Page number for pagination',
                'sanitize_callback' => 'absint',
            ],
            'per_page' => [
                'default' => -1,
                'type' => 'integer',
                'minimum' => -1,
                'maximum' => 100,
                'description' => 'Number of items per page. Default is -1 (fetch all records). Set to a positive number (max 100) to enable pagination.',
                'sanitize_callback' => function($value) {
                    $int_value = (int) $value;
                    return $int_value === -1 ? -1 : absint($value);
                },
            ],
            'search' => [
                'type' => 'string',
                'description' => 'Search term to filter items',
                'sanitize_callback' => 'sanitize_text_field',
            ],
            'order_by' => [
                'type' => 'string',
                'description' => 'Column to sort by',
                'sanitize_callback' => 'sanitize_key',
            ],
            'order' => [
                'type' => 'string',
                'default' => 'asc',
                'enum' => ['asc', 'desc'],
                'description' => 'Sort order (asc or desc)',
                'sanitize_callback' => 'sanitize_key',
            ],
        ];

        return $args;
    }

    protected function logDebug(array $context): void
    {
        $encoder = function_exists('wp_json_encode') ? 'wp_json_encode' : 'json_encode';
        $message = $encoder($context);

        if ($message !== false) {
            error_log('[GetManyRoute] ' . $message);
        }
    }

    /**
     * Normalize filter/sort configuration arrays to a flat list of column names.
     *
     * @param array $config
     * @return array
     */
    protected function normalizeConfigToFields(array $config): array
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
