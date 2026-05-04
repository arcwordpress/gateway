<?php

namespace Gateway\Raptor\Endpoints;

use Gateway\Raptor\Collections\RaptorCollection;
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

        register_rest_route('gateway/v1', '/raptor/package/(?P<package_key>[a-zA-Z0-9_\-]+)/collections', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'getPackageCollections'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
            [
                'methods'             => 'PUT',
                'callback'            => [$this, 'setPackageCollections'],
                'permission_callback' => [$this, 'checkPermissions'],
            ],
        ]);
    }

    // ─── Handlers ─────────────────────────────────────────────────────────────

    public function getPackages(\WP_REST_Request $request): \WP_REST_Response
    {
        $packages = RaptorPackage::with('collections')->orderBy('created_at', 'asc')->get();

        $result = $packages->map(function ($pkg) {
            $arr = $pkg->toArray();
            $arr['collection_keys'] = $pkg->collections->pluck('collection_key')->toArray();
            $arr['has_collections'] = !empty($arr['collection_keys']);
            return $arr;
        });

        return new \WP_REST_Response([
            'success'  => true,
            'packages' => $result->values(),
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

        $arr = $package->toArray();
        $arr['collection_keys']  = $package->collections()->pluck('collection_key')->toArray();
        $arr['has_collections']  = !empty($arr['collection_keys']);

        return new \WP_REST_Response([
            'success' => true,
            'package' => $arr,
        ], 200);
    }

    /**
     * GET /raptor/package/{key}/collections
     *
     * Returns all collections for the package's extension, each annotated with:
     *   - is_assigned:    bool  — whether it belongs to this package
     *   - other_packages: array — package_keys of other packages that include it
     */
    public function getPackageCollections(\WP_REST_Request $request): \WP_REST_Response
    {
        $package = $this->findOrFail($request->get_param('package_key'));
        if ($package instanceof \WP_REST_Response) return $package;

        $assignedIds = $package->collections()->pluck('gateway_raptor_collection.id')->toArray();

        // Only collections within the same extension
        if (!$package->extension_key) {
            return new \WP_REST_Response(['success' => true, 'collections' => []], 200);
        }

        $ext = \Gateway\Raptor\Collections\RaptorExtension::where('extension_key', $package->extension_key)->first();
        if (!$ext) {
            return new \WP_REST_Response(['success' => true, 'collections' => []], 200);
        }

        $collections = RaptorCollection::where('extension_id', $ext->id)
            ->with('packages')
            ->orderBy('title')
            ->get();

        $result = $collections->map(function ($col) use ($assignedIds, $package) {
            $otherPkgs = $col->packages
                ->where('package_key', '!=', $package->package_key)
                ->pluck('package_key')
                ->values()
                ->toArray();

            return [
                'collection_key' => $col->collection_key,
                'title'          => $col->title,
                'status'         => $col->status,
                'is_assigned'    => in_array($col->id, $assignedIds, true),
                'other_packages' => $otherPkgs,
            ];
        });

        return new \WP_REST_Response([
            'success'     => true,
            'collections' => $result->values(),
        ], 200);
    }

    /**
     * PUT /raptor/package/{key}/collections
     *
     * Body: { "collection_keys": ["key1", "key2"] }
     * Replaces the full set of collections assigned to this package.
     */
    public function setPackageCollections(\WP_REST_Request $request): \WP_REST_Response
    {
        $package = $this->findOrFail($request->get_param('package_key'));
        if ($package instanceof \WP_REST_Response) return $package;

        $data            = $request->get_json_params() ?? [];
        $collectionKeys  = array_filter(array_map('sanitize_text_field', (array) ($data['collection_keys'] ?? [])));

        $ids = RaptorCollection::whereIn('collection_key', $collectionKeys)
            ->pluck('id', 'collection_key');

        // Build sync data with position from the submitted order
        $syncData = [];
        foreach ($collectionKeys as $position => $key) {
            if (isset($ids[$key])) {
                $syncData[$ids[$key]] = ['position' => $position];
            }
        }

        $package->collections()->sync($syncData);

        $arr = $package->fresh()->toArray();
        $arr['collection_keys'] = $package->collections()->pluck('collection_key')->toArray();
        $arr['has_collections'] = !empty($arr['collection_keys']);

        return new \WP_REST_Response([
            'success' => true,
            'package' => $arr,
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
