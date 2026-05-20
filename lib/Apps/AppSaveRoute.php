<?php

namespace Gateway\Apps;

if (!defined('ABSPATH')) {
    exit;
}

class AppSaveRoute
{
    public static function init(): void
    {
        add_action('rest_api_init', [__CLASS__, 'register_routes']);
    }

    public static function register_routes(): void
    {
        register_rest_route('gateway/v1', '/apps/save', [
            'methods'             => \WP_REST_Server::CREATABLE,
            'callback'            => [__CLASS__, 'save'],
            'permission_callback' => fn() => current_user_can('manage_options'),
            'args'                => [
                'key' => [
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_key',
                    'validate_callback' => fn($v) => (bool) preg_match('/^[a-z0-9][a-z0-9_-]{0,63}$/', $v),
                ],
            ],
        ]);
    }

    public static function save(\WP_REST_Request $request): \WP_REST_Response
    {
        $key    = $request->get_param('key');
        $log    = [];
        $files  = [];
        $errors = [];
        $start  = microtime(true);

        $log[] = self::entry('info', "Building app \"{$key}\"...");

        $apps_dir = GATEWAY_DATA_DIR . '/apps';
        $app_dir  = $apps_dir . '/' . $key;

        foreach ([$apps_dir, $app_dir] as $dir) {
            if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
                $errors[] = "Cannot create directory: {$dir}";
                $log[]    = self::entry('error', end($errors));
                return self::respond(false, $key, $log, $files, $errors);
            }
        }

        $log[] = self::entry('info', "Writing output files...");

        $writes = [
            'index.html' => AppTemplate::buildIndex($key),
            'embed.js'   => AppTemplate::buildEmbed($key),
        ];

        foreach ($writes as $filename => $content) {
            $dest    = $app_dir . '/' . $filename;
            $written = file_put_contents($dest, $content);
            if ($written === false) {
                $errors[] = "Failed to write {$filename}";
                $log[]    = self::entry('error', end($errors));
                return self::respond(false, $key, $log, $files, $errors);
            }
            $files[] = ['path' => $filename, 'bytes' => $written];
            $log[]   = self::entry('info', sprintf("  %s  (%s bytes)", $filename, number_format($written)));
        }

        $ms  = round((microtime(true) - $start) * 1000);
        $total = array_sum(array_column($files, 'bytes'));
        $log[] = self::entry('success', sprintf("Done in %dms — %d files, %s bytes total", $ms, count($files), number_format($total)));

        return self::respond(true, $key, $log, $files, $errors, [
            'url' => content_url('gateway/apps/' . $key . '/'),
        ]);
    }

    private static function entry(string $level, string $message): array
    {
        return ['level' => $level, 'message' => $message];
    }

    private static function respond(
        bool $success,
        string $key,
        array $log,
        array $files,
        array $errors,
        array $extra = []
    ): \WP_REST_Response {
        return new \WP_REST_Response(array_merge([
            'success' => $success,
            'key'     => $key,
            'log'     => $log,
            'files'   => $files,
            'errors'  => $errors,
        ], $extra), $success ? 200 : 500);
    }
}
