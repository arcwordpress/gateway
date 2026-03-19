<?php

namespace Gateway\Views\Render;

use Gateway\REST\RouteAuthenticationTrait;

class Endpoints
{
    use RouteAuthenticationTrait;

    private $register = null;

    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerEndpoints']);
    }

    public function registerEndpoints()
    {
        register_rest_route('gateway/v1', '/views/renders', [
            'methods' => 'GET',
            'callback' => [$this, 'getMany'],
            'permission_callback' => [$this, 'checkPermission'],
        ]);

        register_rest_route('gateway/v1', '/views/renders/(?P<type>[a-z_]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'getOne'],
            'permission_callback' => [$this, 'checkPermission'],
            'args' => [
                'type' => [
                    'required' => true,
                    'type' => 'string',
                    'pattern' => '^[a-z_]+$',
                ],
            ],
        ]);
    }

    public function checkPermission()
    {
        $authResult = $this->checkAuthentication();

        if (is_wp_error($authResult)) {
            return $authResult;
        }

        return is_user_logged_in() ? true : new \WP_Error(
            'rest_not_authenticated',
            __('User not authenticated.'),
            ['status' => 401]
        );
    }

    private function getRegister()
    {
        if ($this->register !== null) {
            return $this->register;
        }

        $this->register = Controller::instance()->getRegister();

        return $this->register;
    }

    public function getMany(\WP_REST_Request $request)
    {
        try {
            $result = [];

            foreach ($this->getRegister()->getAll() as $strategy) {
                $result[] = $this->strategyToArray($strategy);
            }

            return new \WP_REST_Response($result, 200);
        } catch (\Exception $e) {
            return new \WP_REST_Response(['error' => $e->getMessage()], 500);
        }
    }

    public function getOne(\WP_REST_Request $request)
    {
        try {
            $type = $request->get_param('type');
            $register = $this->getRegister();

            if (!$register->has($type)) {
                return new \WP_REST_Response(['error' => 'Render strategy not found'], 404);
            }

            return new \WP_REST_Response($this->strategyToArray($register->get($type)), 200);
        } catch (\Exception $e) {
            return new \WP_REST_Response(['error' => $e->getMessage()], 500);
        }
    }

    private function strategyToArray(Strategy $strategy): array
    {
        return [
            'type' => $strategy->getType(),
            'class' => get_class($strategy),
        ];
    }
}
