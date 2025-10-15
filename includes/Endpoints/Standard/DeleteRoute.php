<?php

namespace Gateway\Endpoints\Standard;

use Gateway\Endpoints\BaseEndpoint;
use WP_REST_Request;
use WP_REST_Response;

class DeleteRoute extends BaseEndpoint
{

    public function getType()
    {
        return 'delete';
    }

    public function getMethod()
    {
        return 'DELETE';
    }

    public function getRoute()
    {
        return '/(?P<id>\d+)';
    }

    public function handle(WP_REST_Request $request)
    {
        $id = $request->get_param('id');

        if (!$id) {
            return $this->sendErrorResponse(
                'ID parameter is required',
                'missing_id',
                400
            );
        }

        try {
            // Find the model
            $modelClass = $this->collection->getModelClass();
            $model = $modelClass::find($id);

            if (!$model) {
                return $this->sendErrorResponse(
                    ucfirst($this->collectionName) . ' not found',
                    'not_found',
                    404
                );
            }

            // Delete the model
            $deleted = $model->delete();

            if (!$deleted) {
                return $this->sendErrorResponse(
                    'Failed to delete ' . $this->collectionName,
                    'delete_failed',
                    500
                );
            }

            return $this->sendSuccessResponse([
                'deleted' => true,
                'id' => (int) $id
            ]);

        } catch (\Exception $e) {
            return $this->sendErrorResponse(
                'Failed to delete ' . $this->collectionName . ': ' . $e->getMessage(),
                'delete_failed',
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
                'description' => 'The ID of the item to delete',
                'validate_callback' => function($param) {
                    return is_numeric($param) && $param > 0;
                },
            ],
        ];

        return $args;
    }
}
