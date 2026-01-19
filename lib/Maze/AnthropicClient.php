<?php

namespace Gateway\Maze;

use Anthropic\Client;
use Gateway\Security\Encryption;

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
            error_log('Gateway: ANTHROPIC_API_KEY not provided or found');
            return;
        }

        if (!class_exists('Anthropic\Client')) {
            error_log('Gateway: Anthropic SDK not found. Run composer install.');
            return;
        }

        try {
            $this->client = new Client(apiKey: $apiKey);
        } catch (\Exception $e) {
            error_log('Gateway: Failed to initialize Anthropic client: ' . $e->getMessage());
        }
    }

    private function getApiKey()
    {
        // Priority 1: Check for stored encrypted key in WordPress options
        $encryptedKey = get_option('gateway_anthropic_api_key', '');
        if (!empty($encryptedKey)) {
            $decrypted = Encryption::decrypt($encryptedKey);
            if ($decrypted !== false) {
                return $decrypted;
            }
            // If decryption fails, log error and continue to fallback
            error_log('Gateway: Failed to decrypt stored Anthropic API key');
        }

        // Priority 2: Try $_SERVER (most reliable for loaded .env)
        if (isset($_SERVER['ANTHROPIC_API_KEY'])) {
            return $_SERVER['ANTHROPIC_API_KEY'];
        }

        // Priority 3: Try $_ENV
        if (isset($_ENV['ANTHROPIC_API_KEY'])) {
            return $_ENV['ANTHROPIC_API_KEY'];
        }

        // Priority 4: Try getenv
        $apiKey = getenv('ANTHROPIC_API_KEY');
        if ($apiKey) {
            return $apiKey;
        }

        // Priority 5: Try to reload .env if not found
        $this->loadEnvIfNeeded();

        // Check again after reload
        if (isset($_SERVER['ANTHROPIC_API_KEY'])) {
            return $_SERVER['ANTHROPIC_API_KEY'];
        }

        return null;
    }

    private function loadEnvIfNeeded()
    {
        $envPath = GATEWAY_PATH . '.env';

        if (!file_exists($envPath)) {
            return;
        }

        if (!class_exists('Dotenv\Dotenv')) {
            return;
        }

        try {
            $dotenv = \Dotenv\Dotenv::createImmutable(GATEWAY_PATH);
            $dotenv->load();
        } catch (\Exception $e) {
            error_log('Gateway: Failed to reload .env: ' . $e->getMessage());
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
                ? 'Anthropic API key not found. Please add it in the Gateway settings or in your .env file.'
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
