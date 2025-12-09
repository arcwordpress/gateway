<?php

namespace Gateway\Endpoints\Standard;

use Gateway\Endpoints\BaseEndpoint;
use WP_REST_Request;
use WP_REST_Response;

class UpdateRoute extends BaseEndpoint
{

    public function getType()
    {
        return 'update';
    }

    public function getMethod()
    {
        return 'PUT';
    }

    /**
     * Get the route pattern for this endpoint.
     * 
     * Returns route with ID parameter for updating specific records.
     * PUT requests to /namespace/collection/{id} update existing records.
     * 
     * @return string Route pattern with ID parameter
     */
    public function getRoute()
    {
        return '/(?P<id>\d+)';
    }

    public function handle(WP_REST_Request $request)
    {
        $id = $request->get_param('id');
        $data = $request->get_json_params() ?: $request->get_params();

        if (!$id) {
            return $this->sendErrorResponse(
                'ID parameter is required',
                'missing_id',
                400
            );
        }

        // Remove system parameters
        unset($data['id'], $data['route'], $data['rest_route']);

        $model = null;
        $updatedModel = null;
        $response = null;

        try {
            // Collection IS the model - find the record
            $model = $this->collection->find($id);

            // Fire pre-hooks - always run, model may be null
            do_action('gateway_pre_save_record', $data, $this->collectionName, 'update', $model);
            do_action('gateway_pre_update_record', $data, $this->collectionName, $model);

            if (!$model) {
                $response = $this->sendErrorResponse(
                    ucfirst($this->collectionName) . ' not found',
                    'not_found',
                    404
                );
            } else {
                $model->update($data);
                $updatedModel = $model->fresh();

                if (!$updatedModel) {
                    $response = $this->sendErrorResponse(
                        'Failed to update ' . $this->collectionName,
                        'update_failed',
                        500
                    );
                } else {
                    // Convert model to array for response
                    $responseData = is_object($updatedModel) && method_exists($updatedModel, 'toArray')
                        ? $updatedModel->toArray()
                        : (array) $updatedModel;

                    $response = $this->sendSuccessResponse($responseData);
                }
            }

        } catch (\Exception $e) {
            // Log the full error for debugging
            error_log('Gateway Update Error: ' . $e->getMessage());
            
            // Return generic error to client - don't expose internal details
            $response = $this->sendErrorResponse(
                'Failed to update ' . $this->collectionName,
                'update_failed',
                500
            );
        } finally {
            // Fire post-hooks - these always run
            do_action('gateway_save_record', $updatedModel, $this->collectionName, 'update');
            do_action('gateway_update_record', $updatedModel, $this->collectionName);
        }

        return $response;
    }

    public function getArgs()
    {
        $args = parent::getArgs();

        $args['args'] = [
            'id' => [
                'required' => true,
                'type' => 'integer',
                'description' => 'The ID of the item to update',
                'validate_callback' => function($param) {
                    return is_numeric($param) && $param > 0;
                },
            ],
        ];

        return $args;
    }
}
