<?php

namespace ARC\Maze;

use Anthropic\Client;

class AnthropicClient
{
    private $client = null;
    private $apiKey = null;

    public function __construct($apiKey = null)
    {
        // If no API key passed, try to get it
        if (!$apiKey) {
            $apiKey = $this->getApiKey();
        }

        $this->apiKey = $apiKey;

        if (!$apiKey) {
            error_log('ARC Maze: ANTHROPIC_API_KEY not provided or found');
            return;
        }

        if (!class_exists('Anthropic\Client')) {
            error_log('ARC Maze: Anthropic SDK not found. Run composer install.');
            return;
        }

        try {
            $this->client = new Client(apiKey: $apiKey);
        } catch (\Exception $e) {
            error_log('ARC Maze: Failed to initialize Anthropic client: ' . $e->getMessage());
        }
    }

    private function getApiKey()
    {
        // First try $_SERVER (most reliable for loaded .env)
        if (isset($_SERVER['ANTHROPIC_API_KEY'])) {
            return $_SERVER['ANTHROPIC_API_KEY'];
        }

        // Then try $_ENV
        if (isset($_ENV['ANTHROPIC_API_KEY'])) {
            return $_ENV['ANTHROPIC_API_KEY'];
        }

        // Try getenv
        $apiKey = getenv('ANTHROPIC_API_KEY');
        if ($apiKey) {
            return $apiKey;
        }

        // Try to reload .env if not found
        $this->loadEnvIfNeeded();

        // Check again after reload
        if (isset($_SERVER['ANTHROPIC_API_KEY'])) {
            return $_SERVER['ANTHROPIC_API_KEY'];
        }

        return null;
    }

    private function loadEnvIfNeeded()
    {
        $envPath = ARC_MAZE_PATH . '.env';

        if (!file_exists($envPath)) {
            return;
        }

        if (!class_exists('Dotenv\Dotenv')) {
            return;
        }

        try {
            $dotenv = \Dotenv\Dotenv::createImmutable(ARC_MAZE_PATH);
            $dotenv->load();
        } catch (\Exception $e) {
            error_log('ARC Maze: Failed to reload .env: ' . $e->getMessage());
        }
    }

    public function isConfigured()
    {
        return $this->client !== null;
    }

    public function sendMessage($message, $systemPrompt = null)
    {
        if (!$this->isConfigured()) {
            $apiKey = $this->getApiKey();
            $errorMsg = !$apiKey
                ? 'ANTHROPIC_API_KEY not found. Please add it to your .env file in the plugin root.'
                : 'Failed to initialize Anthropic client. Check error logs.';

            return new \WP_Error(
                'anthropic_not_configured',
                $errorMsg,
                ['status' => 500]
            );
        }

        try {
            $messages = [
                \Anthropic\Messages\MessageParam::with(role: 'user', content: $message)
            ];

            $params = [
                'maxTokens' => 4096,
                'messages' => $messages,
                'model' => 'claude-sonnet-4-20250514'
            ];

            if ($systemPrompt) {
                $params['system'] = $systemPrompt;
            }

            $response = $this->client->messages->create(...$params);

            if (!empty($response->content) && is_array($response->content)) {
                $text = '';
                foreach ($response->content as $content) {
                    if (isset($content->type) && $content->type === 'text') {
                        $text .= $content->text;
                    }
                }
                return $text;
            }

            return 'No response received from API';

        } catch (\Exception $e) {
            return new \WP_Error(
                'anthropic_api_error',
                'Error communicating with Anthropic API: ' . $e->getMessage(),
                ['status' => 500]
            );
        }
    }
}
