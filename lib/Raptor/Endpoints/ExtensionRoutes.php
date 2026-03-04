<?php

namespace Gateway\Raptor\Endpoints;

use Gateway\Raptor\Collections\RaptorExtension;
use Gateway\Raptor\Collections\RaptorCollection;
use Gateway\Raptor\Build\RaptorBuilder;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST API routes for Raptor-managed extensions.
 *
 * Extensions are stored in wp_gateway_raptor_extension and map 1:1
 * to generated WordPress plugins in WP_PLUGIN_DIR.
 *
 * Endpoints:
 *   GET    /gateway/v1/raptor/extension              — list all
 *   POST   /gateway/v1/raptor/extension              — create + scaffold plugin
 *   GET    /gateway/v1/raptor/extension/{key}        — get one (with collections)
 *   PATCH  /gateway/v1/raptor/extension/{key}        — update metadata
 *   DELETE /gateway/v1/raptor/extension/{key}        — delete record + plugin files
 *   POST   /gateway/v1/raptor/extension/{key}/build  — full build
 */
class ExtensionRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes(): void
    {
        register_rest_route('gateway/v1', '/raptor/extension', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getExtensions'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'createExtension'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);

        register_rest_route('gateway/v1', '/raptor/extension/(?P<extension_key>[a-zA-Z0-9_\-]+)', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getExtension'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'PATCH, PUT',
                'callback'            => [$this, 'updateExtension'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'deleteExtension'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);

        register_rest_route('gateway/v1', '/raptor/extension/(?P<extension_key>[a-zA-Z0-9_\-]+)/build', [
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'buildExtension'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);
    }

    // ─── Handlers ─────────────────────────────────────────────────────────────

    public function getExtensions(\WP_REST_Request $request): \WP_REST_Response
    {
        $extensions = RaptorExtension::orderBy('created_at', 'asc')->get();

        return new \WP_REST_Response([
            'success'    => true,
            'extensions' => $extensions->toArray(),
        ], 200);
    }

    public function createExtension(\WP_REST_Request $request): \WP_REST_Response
    {
        $data  = $request->get_json_params() ?? [];
        $title = sanitize_text_field($data['title'] ?? '');

        if (!$title) {
            return new \WP_REST_Response(['success' => false, 'message' => 'Title is required.'], 400);
        }

        // Accept either 'extension_key' or 'key' from the request body.
        $rawKey = $data['extension_key'] ?? $data['key'] ?? '';
        $key    = $rawKey ? $this->sanitizeKey($rawKey) : $this->titleToKey($title);

        if (!$key) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Could not generate a valid extension key from the given title.',
            ], 400);
        }

        if (RaptorExtension::where('extension_key', $key)->exists()) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => "An extension with key \"{$key}\" already exists.",
            ], 409);
        }

        $builder   = new RaptorBuilder();
        $namespace = !empty($data['namespace'])
            ? sanitize_text_field($data['namespace'])
            : $builder->toNamespace($key);

        $extension = RaptorExtension::create([
            'extension_key'   => $key,
            'title'           => $title,
            'description'     => sanitize_textarea_field($data['description'] ?? ''),
            'version'         => sanitize_text_field($data['version'] ?? '1.0.0'),
            'author'          => sanitize_text_field($data['author'] ?? ''),
            'author_uri'      => esc_url_raw($data['author_uri'] ?? ''),
            'text_domain'     => sanitize_key($data['text_domain'] ?? $key),
            'min_wp_version'  => sanitize_text_field($data['min_wp_version'] ?? '6.0'),
            'namespace'       => $namespace,
            'status'          => 'active',
        ]);

        // Scaffold the plugin directory + main file immediately on creation.
        $pluginSlug     = $builder->toPluginSlug($key);
        $constantPrefix = strtoupper($key);
        $projectName    = $title;
        $pluginDir      = WP_PLUGIN_DIR . '/' . $pluginSlug;

        $scaffoldResult = $builder->scaffoldPlugin(
            $pluginDir, $pluginSlug, $namespace, $constantPrefix, $projectName, $extension
        );

        return new \WP_REST_Response([
            'success'   => true,
            'message'   => 'Extension created.',
            'extension' => $extension->toArray(),
            'scaffold'  => $scaffoldResult,
        ], 201);
    }

    public function getExtension(\WP_REST_Request $request): \WP_REST_Response
    {
        $extension = $this->findOrFail($request->get_param('extension_key'));
        if ($extension instanceof \WP_REST_Response) return $extension;

        $collections = RaptorCollection::where('extension_key', $extension->extension_key)
            ->orderBy('id')
            ->get(['id', 'collection_key', 'title', 'description', 'status']);

        return new \WP_REST_Response([
            'success'     => true,
            'extension'   => $extension->toArray(),
            'collections' => $collections->toArray(),
        ], 200);
    }

    public function updateExtension(\WP_REST_Request $request): \WP_REST_Response
    {
        $extension = $this->findOrFail($request->get_param('extension_key'));
        if ($extension instanceof \WP_REST_Response) return $extension;

        $data   = $request->get_json_params() ?? [];
        $update = [];

        $stringFields = ['title', 'description', 'version', 'author', 'text_domain',
                         'min_wp_version', 'namespace', 'status'];

        foreach ($stringFields as $field) {
            if (isset($data[$field])) {
                $update[$field] = sanitize_text_field($data[$field]);
            }
        }
        if (isset($data['author_uri'])) {
            $update['author_uri'] = esc_url_raw($data['author_uri']);
        }

        $extension->update($update);

        return new \WP_REST_Response([
            'success'   => true,
            'extension' => $extension->fresh()->toArray(),
        ], 200);
    }

    public function deleteExtension(\WP_REST_Request $request): \WP_REST_Response
    {
        $extension = $this->findOrFail($request->get_param('extension_key'));
        if ($extension instanceof \WP_REST_Response) return $extension;

        $key        = $extension->extension_key;
        $pluginDir  = WP_PLUGIN_DIR . '/' . (new RaptorBuilder())->toPluginSlug($key);
        $dirDeleted = false;

        if (is_dir($pluginDir)) {
            $dirDeleted = $this->deleteDirectory($pluginDir);
        }

        $extension->delete();

        return new \WP_REST_Response([
            'success'      => true,
            'message'      => 'Extension deleted.',
            'dir_deleted'  => $dirDeleted,
            'plugin_dir'   => $pluginDir,
        ], 200);
    }

    public function buildExtension(\WP_REST_Request $request): \WP_REST_Response
    {
        $key    = $request->get_param('extension_key');
        $result = (new RaptorBuilder())->build($key);

        $status = $result['success'] ? 200 : 422;
        return new \WP_REST_Response($result, $status);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * @return RaptorExtension|\WP_REST_Response
     */
    private function findOrFail(string $key)
    {
        $extension = RaptorExtension::where('extension_key', $key)->first();
        if (!$extension) {
            return new \WP_REST_Response(['success' => false, 'message' => 'Extension not found.'], 404);
        }
        return $extension;
    }

    private function titleToKey(string $title): string
    {
        $key = strtolower($title);
        $key = preg_replace('/\s+/', '_', $key);
        $key = preg_replace('/[^a-z0-9_]/', '', $key);
        return (string) substr(trim($key, '_'), 0, 200);
    }

    private function sanitizeKey(string $key): string
    {
        $key = strtolower(str_replace('-', '_', $key));
        $key = preg_replace('/[^a-z0-9_]/', '', $key);
        return (string) substr(trim($key, '_'), 0, 200);
    }

    private function deleteDirectory(string $dir): bool
    {
        if (!is_dir($dir)) return false;
        $items = array_diff(scandir($dir), ['.', '..']);
        foreach ($items as $item) {
            $path = $dir . '/' . $item;
            is_dir($path) ? $this->deleteDirectory($path) : unlink($path);
        }
        return rmdir($dir);
    }

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }
}
