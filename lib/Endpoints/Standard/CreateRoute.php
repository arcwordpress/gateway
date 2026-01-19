<?php

namespace Gateway\Endpoints\Standard;

use Gateway\Endpoints\BaseEndpoint;
use WP_REST_Request;
use WP_REST_Response;

class CreateRoute extends BaseEndpoint
{


    public function getType()
    {
        return 'create';
    }

    public function getMethod()
    {
        return 'POST';
    }

    /**
     * Get the route pattern for this endpoint.
     * 
     * Returns empty string because create uses the base collection route.
     * POST requests to /namespace/collection create new records.
     * 
     * @return string Empty string for base route
     */
    public function getRoute()
    {
        return '';
    }

    public function handle(WP_REST_Request $request)
    {
        $data = $request->get_json_params() ?: $request->get_params();

        // Remove any system parameters
        unset($data['route'], $data['rest_route']);

        $model = null;
        $response = null;

        try {
            // Fire pre-hooks
            do_action('gateway_pre_save_record', $data, $this->collection->getKey(), 'create');
            do_action('gateway_pre_create_record', $data, $this->collection->getKey());

            // Collection IS the model - create a new record
            $model = $this->collection->create($data);

            // Convert model to array for response
            $responseData = is_object($model) && method_exists($model, 'toArray')
                ? $model->toArray()
                : (array) $model;

            $response = $this->sendSuccessResponse($responseData, 201);

        } catch (\Exception $e) {
            $response = $this->sendErrorResponse(
                'Failed to create ' . $this->collection->getKey() . ': ' . $e->getMessage(),
                'create_failed',
                500
            );
        } finally {
            // Fire post-hooks - these always run
            do_action('gateway_save_record', $model, $this->collection->getKey(), 'create');
            do_action('gateway_create_record', $model, $this->collection->getKey());
        }

        return $response;
    }

    public function getArgs()
    {
        $args = parent::getArgs();
        return $args;
    }
}
