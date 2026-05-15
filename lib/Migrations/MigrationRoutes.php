<?php

namespace Gateway\Migrations;

use Gateway\Migrations\MigrationRegistry;
use Gateway\Collections\Gateway\MigrationRun;

if (!defined('ABSPATH')) exit;

class MigrationRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes(): void
    {
        register_rest_route('gateway/v1', '/migrations', [
            'methods'             => 'GET',
            'callback'            => [$this, 'list'],
            'permission_callback' => [$this, 'checkPermissions'],
            'args'                => [
                'extension' => [
                    'required'    => false,
                    'type'        => 'string',
                    'description' => 'Filter by extension key',
                ],
            ],
        ]);

        register_rest_route('gateway/v1', '/migrations/(?P<key>[a-zA-Z0-9_\-]+)', [
            'methods'             => 'POST',
            'callback'            => [$this, 'run'],
            'permission_callback' => [$this, 'checkPermissions'],
            'args'                => [
                'key' => ['required' => true, 'type' => 'string'],
            ],
        ]);
    }

    public function list(\WP_REST_Request $request): \WP_REST_Response
    {
        $extension = $request->get_param('extension');
        $all       = MigrationRegistry::getAll();
        $groups    = [];

        foreach ($all as $group) {
            if ($extension !== null && $group['key'] !== $extension) {
                continue;
            }

            $lastRun = $this->getLastRun($group['key']);

            $groups[] = [
                'key'             => $group['key'],
                'label'           => $group['label'],
                'version'         => $group['version'],
                'migration_count' => count($group['migrations']),
                'last_run'        => $lastRun,
            ];
        }

        return new \WP_REST_Response(['success' => true, 'groups' => $groups], 200);
    }

    public function run(\WP_REST_Request $request): \WP_REST_Response
    {
        $key = $request->get_param('key');

        if (!MigrationRegistry::has($key)) {
            return new \WP_REST_Response(['success' => false, 'message' => "Group '{$key}' not found in registry."], 404);
        }

        $group  = MigrationRegistry::get($key);
        $result = MigrationRegistry::runGroup($key);

        MigrationRun::log(
            'extension',
            $key,
            $group['version'] ?? '',
            $result['success'],
            $result['success'] ? "Ran {$result['ran']} migration(s)." : implode('; ', $result['errors'])
        );

        $lastRun = $this->getLastRun($key);

        return new \WP_REST_Response([
            'success'  => $result['success'],
            'ran'      => $result['ran'],
            'errors'   => $result['errors'],
            'message'  => $result['success']
                ? "Ran {$result['ran']} migration(s)."
                : implode('; ', $result['errors']),
            'last_run' => $lastRun,
        ], $result['success'] ? 200 : 500);
    }

    private function getLastRun(string $key): ?array
    {
        try {
            $run = MigrationRun::where('subject_type', 'extension')
                ->where('subject_key', $key)
                ->orderByDesc('ran_at')
                ->first();

            if (!$run) return null;

            return [
                'version' => $run->version,
                'success' => (bool) $run->success,
                'message' => $run->message,
                'ran_at'  => $run->ran_at,
            ];
        } catch (\Throwable $e) {
            return null;
        }
    }

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }
}
