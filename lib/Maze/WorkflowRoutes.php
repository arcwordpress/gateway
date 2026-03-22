<?php

namespace Gateway\Maze;

use Gateway\Security\Encryption;

class WorkflowRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes()
    {
        register_rest_route('gateway/v1', '/workflows', [
            'methods' => 'GET',
            'callback' => [$this, 'getWorkflows'],
            'permission_callback' => [$this, 'checkPermission']
        ]);

        register_rest_route('gateway/v1', '/workflows/(?P<name>[a-zA-Z0-9_-]+)', [
            'methods' => 'GET',
            'callback' => [$this, 'getWorkflow'],
            'permission_callback' => [$this, 'checkPermission']
        ]);

        register_rest_route('gateway/v1', '/transition', [
            'methods' => 'POST',
            'callback' => [$this, 'transition'],
            'permission_callback' => [$this, 'checkPermission']
        ]);

        register_rest_route('gateway/v1', '/chat', [
            'methods' => 'POST',
            'callback' => [$this, 'handleMessage'],
            'permission_callback' => [$this, 'checkPermission'],
            'args' => [
                'message' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_textarea_field'
                ]
            ]
        ]);
    }

    public function getWorkflows($request)
    {
        $maze = Maze::getInstance();
        return rest_ensure_response($maze->getAllWorkflows());
    }

    public function getWorkflow($request)
    {
        $name = $request->get_param('name');
        $maze = Maze::getInstance();
        $workflow = $maze->getWorkflow($name);

        if (!$workflow) {
            return new \WP_Error('workflow_not_found', 'Workflow not found', ['status' => 404]);
        }

        return rest_ensure_response($workflow);
    }

    public function transition($request)
    {
        $entity = $request->get_param('entity');
        $fromState = $request->get_param('from_state');
        $toState = $request->get_param('to_state');
        $context = $request->get_param('context') ?? [];

        $maze = Maze::getInstance();
        $result = $maze->transition($entity, $fromState, $toState, $context);

        if (is_wp_error($result)) {
            return $result;
        }

        return rest_ensure_response($result);
    }

    public function handleMessage($request)
    {
        $message = $request->get_param('message');

        if (empty($message)) {
            return new \WP_Error('empty_message', 'Message cannot be empty', ['status' => 400]);
        }

        // Get API key from environment
        $apiKey = $this->getAnthropicApiKey();

        if (!$apiKey) {
            return new \WP_Error(
                'api_key_missing',
                'Anthropic API key not found. Please add it in the Gateway settings or in your .env file.',
                ['status' => 500]
            );
        }

        // Initialize client with explicit API key
        $client = new AnthropicClient($apiKey);

        if (!$client->isConfigured()) {
            return new \WP_Error(
                'client_init_failed',
                'Failed to initialize Anthropic client. Check error logs.',
                ['status' => 500]
            );
        }

        // Load system prompt from file (optional)
        $systemPromptFile = GATEWAY_PATH . 'agent/agent-system-prompt.md';
        $systemPrompt = '';

        if (file_exists($systemPromptFile)) {
            $systemPrompt = file_get_contents($systemPromptFile);
        }

        $response = $client->sendMessage($message, $systemPrompt);

        if (is_wp_error($response)) {
            return $response;
        }

        return rest_ensure_response([
            'success' => true,
            'message' => $response
        ]);
    }

    private function getAnthropicApiKey()
    {
        // Priority 1: Check for stored encrypted key in the gateway_settings table.
        try {
            $settings = \Gateway\Collections\GatewaySettingsCollection::getSettings();
            $decrypted = $settings->getDecryptedApiKey();
            if ($decrypted !== null && $decrypted !== false) {
                return $decrypted;
            }
        } catch (\Exception $e) {
            error_log('Gateway: Failed to read API key from settings table: ' . $e->getMessage());
        }

        // Priority 2: Try $_SERVER
        if (isset($_SERVER['ANTHROPIC_API_KEY'])) {
            return $_SERVER['ANTHROPIC_API_KEY'];
        }

        // Priority 3: Try $_ENV
        if (isset($_ENV['ANTHROPIC_API_KEY'])) {
            return $_ENV['ANTHROPIC_API_KEY'];
        }

        // Priority 4: Try getenv
        $key = getenv('ANTHROPIC_API_KEY');
        if ($key) {
            return $key;
        }

        // Priority 5: Manually parse .env file
        $envPath = GATEWAY_PATH . '.env';

        if (file_exists($envPath)) {
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

            foreach ($lines as $line) {
                // Skip comments
                if (strpos(trim($line), '#') === 0) {
                    continue;
                }

                // Parse KEY=VALUE
                if (strpos($line, '=') !== false) {
                    list($name, $value) = explode('=', $line, 2);
                    $name = trim($name);
                    $value = trim($value);

                    if ($name === 'ANTHROPIC_API_KEY') {
                        return $value;
                    }
                }
            }
        }

        return null;
    }

    public function checkPermission($request)
    {
        return current_user_can('manage_options');
    }
}
