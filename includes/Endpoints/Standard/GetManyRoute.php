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

    public function handle(WP_REST_Request $request)
    {
        try {
            $page = max(1, (int) $request->get_param('page') ?: 1);
            $per_page = min(100, max(1, (int) $request->get_param('per_page') ?: 10));
            $search = $request->get_param('search');
            $order_by = $request->get_param('order_by');
            $order = strtolower($request->get_param('order') ?: 'asc');

            if (!in_array($order, ['asc', 'desc'])) {
                $order = 'asc';
            }

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

                // Manual pagination on array
                $offset = ($page - 1) * $per_page;
                $items = array_slice($items, $offset, $per_page);

                $response = [
                    'items' => $items,
                    'pagination' => [
                        'page' => $page,
                        'per_page' => $per_page,
                        'record_count' => $total,
                        'total_pages' => ceil($total / $per_page)
                    ]
                ];

                return $this->sendSuccessResponse($response);
            }

            // Start with base query builder - Collection IS the model now
            $query = $this->collection->query();

            // Apply filters from request params
            $filters = $request->get_params();
            foreach ($filters as $key => $value) {
                if (!in_array($key, ['page', 'per_page', 'order_by', 'order', 'search']) && $value !== null) {
                    $allowedFilters = $this->collection->getConfig('filters') ?: [];
                    if (in_array($key, $allowedFilters)) {
                        $query->where($key, $value);
                    }
                }
            }

            // Apply ordering
            if ($order_by) {
                $sortable = $this->collection->getConfig('sortable') ?: [];
                if (in_array($order_by, $sortable)) {
                    $query->orderBy($order_by, $order);
                }
            }

            // Get total count before pagination
            $total = $query->count();

            // Apply pagination
            $offset = ($page - 1) * $per_page;
            $models = $query->offset($offset)->limit($per_page)->get();

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
                    'page' => $page,
                    'per_page' => $per_page,
                    'record_count' => $total,
                    'total_pages' => ceil($total / $per_page)
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
                'default' => 10,
                'type' => 'integer',
                'minimum' => 1,
                'maximum' => 100,
                'description' => 'Number of items per page',
                'sanitize_callback' => 'absint',
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
}
