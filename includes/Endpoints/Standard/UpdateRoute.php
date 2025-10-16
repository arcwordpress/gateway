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

        try {
            // Collection IS the model - find the record
            $model = $this->collection->find($id);

            if (!$model) {
                return $this->sendErrorResponse(
                    ucfirst($this->collectionName) . ' not found',
                    'not_found',
                    404
                );
            }

            $model->update($data);
            $updatedModel = $model->fresh();

            if (!$updatedModel) {
                return $this->sendErrorResponse(
                    'Failed to update ' . $this->collectionName,
                    'update_failed',
                    500
                );
            }

            // Convert model to array for response
            $responseData = is_object($updatedModel) && method_exists($updatedModel, 'toArray')
                ? $updatedModel->toArray()
                : (array) $updatedModel;

            return $this->sendSuccessResponse($responseData);

        } catch (\Exception $e) {
            return $this->sendErrorResponse(
                'Failed to update ' . $this->collectionName . ': ' . $e->getMessage(),
                'update_failed',
                500
            );
        }
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
