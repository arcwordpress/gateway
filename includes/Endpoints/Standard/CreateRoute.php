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

    public function getRoute()
    {
        return '';
    }

    public function handle(WP_REST_Request $request)
    {
        $data = $request->get_json_params() ?: $request->get_params();

        // Remove any system parameters
        unset($data['route'], $data['rest_route']);

        try {
            // Get the model from the collection and create a new record
            $modelClass = $this->collection->getModelClass();
            $model = $modelClass::create($data);

            // Convert model to array for response
            $responseData = is_object($model) && method_exists($model, 'toArray')
                ? $model->toArray()
                : (array) $model;

            return $this->sendSuccessResponse($responseData, 201);

        } catch (\Exception $e) {
            return $this->sendErrorResponse(
                'Failed to create ' . $this->collectionName . ': ' . $e->getMessage(),
                'create_failed',
                500
            );
        }
    }

    public function getArgs()
    {
        $args = parent::getArgs();

        // Add validation args here when ready
        $args['args'] = [
            // Example validation - uncomment when needed
            // 'title' => [
            //     'required' => true,
            //     'type' => 'string',
            //     'description' => 'The title of the item',
            //     'sanitize_callback' => 'sanitize_text_field',
            // ],
        ];

        return $args;
    }
}
