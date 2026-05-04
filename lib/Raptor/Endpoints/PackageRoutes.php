<?php

namespace Gateway\Raptor\Endpoints;

use Gateway\Raptor\Collections\RaptorPackage;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST API routes for Raptor-managed packages.
 *
 * Each package record is the DB-backed equivalent of:
 *   class MyPackage extends \Gateway\Package { protected $key = 'my-package'; ... }
 *
 * The WordPress admin menu URL for a package is:
 *   admin.php?page=gateway-package-{package_key}
 *
 * Endpoints:
 *   GET    /gateway/v1/raptor/package              — list all
 *   POST   /gateway/v1/raptor/package              — create
 *   GET    /gateway/v1/raptor/package/{key}        — get one
 *   PATCH  /gateway/v1/raptor/package/{key}        — update metadata
 *   DELETE /gateway/v1/raptor/package/{key}        — delete record
 */
class PackageRoutes
{
    public function __construct()
    {
        add_action('rest_api_init', [$this, 'registerRoutes']);
    }

    public function registerRoutes(): void
    {
        register_rest_route('gateway/v1', '/raptor/package', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getPackages'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'createPackage'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);

        register_rest_route('gateway/v1', '/raptor/package/(?P<package_key>[a-zA-Z0-9_\-]+)', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getPackage'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'PATCH, PUT',
                'callback'            => [$this, 'updatePackage'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'deletePackage'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);
    }

    // ─── Handlers ─────────────────────────────────────────────────────────────

    public function getPackages(\WP_REST_Request $request): \WP_REST_Response
    {
        $packages = RaptorPackage::orderBy('created_at', 'asc')->get();

        return new \WP_REST_Response([
            'success'  => true,
            'packages' => $packages->toArray(),
        ], 200);
    }

    public function createPackage(\WP_REST_Request $request): \WP_REST_Response
    {
        $data         = $request->get_json_params() ?? [];
        $label        = sanitize_text_field($data['label'] ?? '');
        $extensionKey = sanitize_text_field($data['extension_key'] ?? '');

        if (!$label) {
            return new \WP_REST_Response(['success' => false, 'message' => 'Label is required.'], 400);
        }
        if (!$extensionKey) {
            return new \WP_REST_Response(['success' => false, 'message' => 'Extension is required — packages must belong to an extension.'], 400);
        }

        $rawKey = $data['package_key'] ?? $data['key'] ?? '';
        $key    = $rawKey ? $this->sanitizeKey($rawKey) : $this->labelToKey($label);

        if (!$key) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => 'Could not generate a valid package key from the given label.',
            ], 400);
        }

        if (RaptorPackage::where('package_key', $key)->exists()) {
            return new \WP_REST_Response([
                'success' => false,
                'message' => "A package with key \"{$key}\" already exists.",
            ], 409);
        }

        $extensionKey = sanitize_text_field($data['extension_key'] ?? '') ?: null;

        $package = RaptorPackage::create([
            'package_key'  => $key,
            'extension_key' => $extensionKey,
            'label'        => $label,
            'description' => sanitize_textarea_field($data['description'] ?? ''),
            'icon'        => sanitize_text_field($data['icon'] ?? 'dashicons-admin-generic'),
            'position'    => intval($data['position'] ?? 20),
            'capability'  => sanitize_text_field($data['capability'] ?? 'manage_options'),
            'parent'      => sanitize_text_field($data['parent'] ?? '') ?: null,
            'status'      => 'active',
        ]);

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Package created.',
            'package' => $package->toArray(),
        ], 201);
    }

    public function getPackage(\WP_REST_Request $request): \WP_REST_Response
    {
        $package = $this->findOrFail($request->get_param('package_key'));
        if ($package instanceof \WP_REST_Response) return $package;

        return new \WP_REST_Response([
            'success' => true,
            'package' => $package->toArray(),
        ], 200);
    }

    public function updatePackage(\WP_REST_Request $request): \WP_REST_Response
    {
        $package = $this->findOrFail($request->get_param('package_key'));
        if ($package instanceof \WP_REST_Response) return $package;

        $data   = $request->get_json_params() ?? [];
        $update = [];

        $stringFields = ['label', 'description', 'icon', 'capability', 'status', 'extension_key'];
        foreach ($stringFields as $field) {
            if (isset($data[$field])) {
                $update[$field] = sanitize_text_field($data[$field]);
            }
        }
        if (isset($data['position'])) {
            $update['position'] = intval($data['position']);
        }
        if (array_key_exists('parent', $data)) {
            $update['parent'] = sanitize_text_field($data['parent']) ?: null;
        }

        $package->update($update);

        return new \WP_REST_Response([
            'success' => true,
            'package' => $package->fresh()->toArray(),
        ], 200);
    }

    public function deletePackage(\WP_REST_Request $request): \WP_REST_Response
    {
        $package = $this->findOrFail($request->get_param('package_key'));
        if ($package instanceof \WP_REST_Response) return $package;

        $package->delete();

        return new \WP_REST_Response([
            'success' => true,
            'message' => 'Package deleted.',
        ], 200);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * @return RaptorPackage|\WP_REST_Response
     */
    private function findOrFail(string $key)
    {
        $package = RaptorPackage::where('package_key', $key)->first();
        if (!$package) {
            return new \WP_REST_Response(['success' => false, 'message' => 'Package not found.'], 404);
        }
        return $package;
    }

    private function labelToKey(string $label): string
    {
        $key = strtolower($label);
        $key = preg_replace('/\s+/', '-', $key);
        $key = preg_replace('/[^a-z0-9\-]/', '', $key);
        return (string) substr(trim($key, '-'), 0, 200);
    }

    private function sanitizeKey(string $key): string
    {
        $key = strtolower($key);
        $key = preg_replace('/[^a-z0-9\-_]/', '', $key);
        return (string) substr(trim($key, '-_'), 0, 200);
    }

    public function checkPermissions(): bool
    {
        return current_user_can('manage_options');
    }
}
